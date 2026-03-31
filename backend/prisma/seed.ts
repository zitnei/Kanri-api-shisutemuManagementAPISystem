import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      displayName: '管理者',
      permissions: [
        'users:read', 'users:write', 'users:delete',
        'departments:read', 'departments:write', 'departments:delete',
        'approvals:read', 'approvals:write', 'approvals:approve',
        'audit-logs:read',
        'csv:export',
      ],
    },
  });

  const managerRole = await prisma.role.upsert({
    where: { name: 'manager' },
    update: {},
    create: {
      name: 'manager',
      displayName: 'マネージャー',
      permissions: [
        'users:read', 'users:write',
        'departments:read',
        'approvals:read', 'approvals:write', 'approvals:approve',
        'audit-logs:read',
        'csv:export',
      ],
    },
  });

  const employeeRole = await prisma.role.upsert({
    where: { name: 'employee' },
    update: {},
    create: {
      name: 'employee',
      displayName: '一般社員',
      permissions: [
        'users:read',
        'departments:read',
        'approvals:read', 'approvals:write',
      ],
    },
  });

  console.log('Roles created:', { adminRole: adminRole.name, managerRole: managerRole.name, employeeRole: employeeRole.name });

  // Create departments (without managerId first)
  const headDept = await prisma.department.upsert({
    where: { code: 'HQ' },
    update: {},
    create: {
      code: 'HQ',
      name: '本社',
      isActive: true,
    },
  });

  const engineeringDept = await prisma.department.upsert({
    where: { code: 'ENG' },
    update: {},
    create: {
      code: 'ENG',
      name: 'エンジニアリング部',
      parentId: headDept.id,
      isActive: true,
    },
  });

  const salesDept = await prisma.department.upsert({
    where: { code: 'SALES' },
    update: {},
    create: {
      code: 'SALES',
      name: '営業部',
      parentId: headDept.id,
      isActive: true,
    },
  });

  const hrDept = await prisma.department.upsert({
    where: { code: 'HR' },
    update: {},
    create: {
      code: 'HR',
      name: '人事部',
      parentId: headDept.id,
      isActive: true,
    },
  });

  console.log('Departments created');

  // Hash passwords
  const adminPasswordHash = await bcrypt.hash('Admin123!', 12);
  const managerPasswordHash = await bcrypt.hash('Manager123!', 12);
  const employeePasswordHash = await bcrypt.hash('Employee123!', 12);

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@kanri.dev' },
    update: {},
    create: {
      email: 'admin@kanri.dev',
      passwordHash: adminPasswordHash,
      name: '管理者 太郎',
      nameKana: 'カンリシャ タロウ',
      employeeCode: 'EMP001',
      phone: '03-1234-5678',
      isActive: true,
      departmentId: headDept.id,
      roleId: adminRole.id,
    },
  });

  // Create manager user
  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@kanri.dev' },
    update: {},
    create: {
      email: 'manager@kanri.dev',
      passwordHash: managerPasswordHash,
      name: '田中 次郎',
      nameKana: 'タナカ ジロウ',
      employeeCode: 'EMP002',
      phone: '03-2345-6789',
      isActive: true,
      departmentId: engineeringDept.id,
      roleId: managerRole.id,
    },
  });

  // Create employee users
  const employee1 = await prisma.user.upsert({
    where: { email: 'yamada@kanri.dev' },
    update: {},
    create: {
      email: 'yamada@kanri.dev',
      passwordHash: employeePasswordHash,
      name: '山田 花子',
      nameKana: 'ヤマダ ハナコ',
      employeeCode: 'EMP003',
      phone: '03-3456-7890',
      isActive: true,
      departmentId: engineeringDept.id,
      roleId: employeeRole.id,
    },
  });

  const employee2 = await prisma.user.upsert({
    where: { email: 'suzuki@kanri.dev' },
    update: {},
    create: {
      email: 'suzuki@kanri.dev',
      passwordHash: employeePasswordHash,
      name: '鈴木 一郎',
      nameKana: 'スズキ イチロウ',
      employeeCode: 'EMP004',
      phone: '03-4567-8901',
      isActive: true,
      departmentId: salesDept.id,
      roleId: employeeRole.id,
    },
  });

  const employee3 = await prisma.user.upsert({
    where: { email: 'sato@kanri.dev' },
    update: {},
    create: {
      email: 'sato@kanri.dev',
      passwordHash: employeePasswordHash,
      name: '佐藤 美咲',
      nameKana: 'サトウ ミサキ',
      employeeCode: 'EMP005',
      phone: '03-5678-9012',
      isActive: true,
      departmentId: hrDept.id,
      roleId: employeeRole.id,
    },
  });

  // Update department managers
  await prisma.department.update({
    where: { id: headDept.id },
    data: { managerId: adminUser.id },
  });

  await prisma.department.update({
    where: { id: engineeringDept.id },
    data: { managerId: managerUser.id },
  });

  console.log('Users created:', {
    admin: adminUser.email,
    manager: managerUser.email,
    employees: [employee1.email, employee2.email, employee3.email],
  });

  // Create sample approval requests
  await prisma.approvalRequest.createMany({
    data: [
      {
        requesterId: employee1.id,
        approverId: managerUser.id,
        type: 'VACATION',
        title: '年次有給休暇申請',
        description: '2025年4月の年次有給休暇を申請します。',
        status: 'PENDING',
        startDate: new Date('2025-04-10'),
        endDate: new Date('2025-04-14'),
      },
      {
        requesterId: employee2.id,
        approverId: managerUser.id,
        type: 'EXPENSE',
        title: '出張費精算申請',
        description: '大阪出張の交通費と宿泊費の精算を申請します。',
        status: 'APPROVED',
        amount: 45000,
        comment: '承認しました。',
        reviewedAt: new Date(),
      },
      {
        requesterId: employee3.id,
        approverId: adminUser.id,
        type: 'OVERTIME',
        title: '残業申請',
        description: 'プロジェクト納期のため残業を申請します。',
        status: 'PENDING',
        startDate: new Date('2025-03-28'),
        endDate: new Date('2025-03-28'),
      },
      {
        requesterId: employee1.id,
        approverId: managerUser.id,
        type: 'EXPENSE',
        title: 'セミナー参加費申請',
        description: 'TypeScript勉強会の参加費を申請します。',
        status: 'REJECTED',
        amount: 15000,
        comment: '予算超過のため却下します。',
        reviewedAt: new Date(),
      },
    ],
    skipDuplicates: true,
  });

  // Create sample audit logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: adminUser.id,
        action: 'CREATE',
        resource: 'users',
        resourceId: employee1.id,
        newValue: { email: employee1.email, name: employee1.name },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (seed)',
      },
      {
        userId: adminUser.id,
        action: 'CREATE',
        resource: 'departments',
        resourceId: engineeringDept.id,
        newValue: { code: engineeringDept.code, name: engineeringDept.name },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (seed)',
      },
      {
        userId: managerUser.id,
        action: 'UPDATE',
        resource: 'approvals',
        resourceId: 'approval-001',
        oldValue: { status: 'PENDING' },
        newValue: { status: 'APPROVED' },
        ipAddress: '192.168.1.2',
        userAgent: 'Mozilla/5.0 (seed)',
      },
    ],
    skipDuplicates: true,
  });

  console.log('Sample data created successfully');
  console.log('\n=== Login Credentials ===');
  console.log('Admin:   admin@kanri.dev / Admin123!');
  console.log('Manager: manager@kanri.dev / Manager123!');
  console.log('Employee: yamada@kanri.dev / Employee123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
