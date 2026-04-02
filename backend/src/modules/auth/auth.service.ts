import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../../lib/prisma';
import { env } from '../../config/env';
import { AppError } from '../../middleware/errorHandler';
import { logger } from '../../lib/logger';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface LoginResult {
  tokens: TokenPair;
  user: {
    id: string;
    email: string;
    name: string;
    nameKana: string | null;
    employeeCode: string;
    avatarUrl: string | null;
    role: {
      name: string;
      displayName: string;
      permissions: string[];
    };
    department: {
      id: string;
      name: string;
    } | null;
  };
}

function parseExpiresInToMs(expiresIn: string): number {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000; // default 7 days

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default: return 7 * 24 * 60 * 60 * 1000;
  }
}

function generateAccessToken(userId: string, email: string, roleName: string, permissions: string[]): string {
  return jwt.sign(
    {
      sub: userId,
      email,
      role: roleName,
      permissions,
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions
  );
}

function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

export async function register(
  name: string,
  email: string,
  password: string
): Promise<{ id: string; email: string; name: string }> {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError(409, 'EMAIL_ALREADY_EXISTS', 'このメールアドレスはすでに登録されています');
  }

  const employeeRole = await prisma.role.findUnique({ where: { name: 'employee' } });
  if (!employeeRole) {
    throw new AppError(500, 'ROLE_NOT_FOUND', 'Default role not found. Please run db:seed first.');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const employeeCode = `EMP-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      employeeCode,
      roleId: employeeRole.id,
    },
  });

  logger.info(`New user registered: ${email}`);
  return { id: user.id, email: user.email, name: user.name };
}

export async function login(
  email: string,
  password: string,
  ipAddress?: string,
  userAgent?: string
): Promise<LoginResult> {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      role: true,
      department: {
        select: { id: true, name: true },
      },
    },
  });

  if (!user) {
    // Record failed login attempt (no user found, but we don't reveal that)
    logger.warn(`Failed login attempt for email: ${email} from IP: ${ipAddress}`);
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  // Record login history
  await prisma.loginHistory.create({
    data: {
      userId: user.id,
      ipAddress,
      userAgent,
      success: isPasswordValid,
      failReason: isPasswordValid ? null : 'Invalid password',
    },
  });

  if (!isPasswordValid) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  if (!user.isActive || user.deletedAt) {
    throw new AppError(403, 'ACCOUNT_DISABLED', 'Account is disabled or deleted');
  }

  const accessToken = generateAccessToken(user.id, user.email, user.role.name, user.role.permissions);
  const refreshTokenValue = generateRefreshToken();

  const expiresAt = new Date(Date.now() + parseExpiresInToMs(env.JWT_REFRESH_EXPIRES_IN));

  await prisma.refreshToken.create({
    data: {
      token: refreshTokenValue,
      userId: user.id,
      expiresAt,
    },
  });

  return {
    tokens: {
      accessToken,
      refreshToken: refreshTokenValue,
    },
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      nameKana: user.nameKana,
      employeeCode: user.employeeCode,
      avatarUrl: user.avatarUrl,
      role: {
        name: user.role.name,
        displayName: user.role.displayName,
        permissions: user.role.permissions,
      },
      department: user.department,
    },
  };
}

export async function refreshTokens(refreshTokenValue: string): Promise<TokenPair> {
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshTokenValue },
    include: {
      user: {
        include: { role: true },
      },
    },
  });

  if (!storedToken) {
    throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Invalid refresh token');
  }

  if (storedToken.expiresAt < new Date()) {
    // Delete expired token
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });
    throw new AppError(401, 'REFRESH_TOKEN_EXPIRED', 'Refresh token has expired');
  }

  if (!storedToken.user.isActive || storedToken.user.deletedAt) {
    throw new AppError(403, 'ACCOUNT_DISABLED', 'Account is disabled');
  }

  // Rotate: delete old token and create new one
  await prisma.refreshToken.delete({ where: { id: storedToken.id } });

  const newAccessToken = generateAccessToken(
    storedToken.user.id,
    storedToken.user.email,
    storedToken.user.role.name,
    storedToken.user.role.permissions
  );
  const newRefreshTokenValue = generateRefreshToken();

  const expiresAt = new Date(Date.now() + parseExpiresInToMs(env.JWT_REFRESH_EXPIRES_IN));

  await prisma.refreshToken.create({
    data: {
      token: newRefreshTokenValue,
      userId: storedToken.user.id,
      expiresAt,
    },
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshTokenValue,
  };
}

export async function logout(userId: string, refreshTokenValue: string): Promise<void> {
  await prisma.refreshToken.deleteMany({
    where: {
      token: refreshTokenValue,
      userId,
    },
  });
}

export async function logoutAll(userId: string): Promise<void> {
  await prisma.refreshToken.deleteMany({
    where: { userId },
  });
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: true,
      department: {
        select: { id: true, name: true, code: true },
      },
    },
  });

  if (!user) {
    throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
  }

  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}
