import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

// to run the seed command: npx ts-node prisma/seed.ts

const prisma = new PrismaClient();

const hash = (password: string) => bcrypt.hash(password, 10);

const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const randomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const formatDeadline = (date: Date): Date => {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0));
};

const organisations = [
  { name: 'Acme Corp', description: 'A multinational manufacturing company' },
  { name: 'Stellar Labs', description: 'Cutting-edge software and AI research' },
  { name: 'Greenfield Solutions', description: 'Sustainable energy and environmental consulting' },
];

const firstNames = ['Alice', 'Bob', 'Carlos', 'Diana', 'Ethan', 'Fatima', 'George', 'Hannah', 'Ivan', 'Julia'];
const lastNames = ['Smith', 'Johnson', 'Garcia', 'Martinez', 'Brown', 'Wilson', 'Taylor', 'Anderson', 'Thomas', 'Jackson'];

const projectTemplates = [
  { title: 'Website Redesign', description: 'Redesign the company website with modern UI/UX' },
  { title: 'Mobile App Launch', description: 'Develop and launch the new mobile application' },
  { title: 'Q4 Marketing Campaign', description: 'Plan and execute the Q4 marketing strategy' },
  { title: 'Internal Dashboard', description: 'Build an internal analytics dashboard for management' },
  { title: 'Database Migration', description: 'Migrate legacy database to new cloud infrastructure' },
  { title: 'Customer Portal', description: 'Self-service portal for customer account management' },
];

const taskGroupTemplates = [
  { title: 'Backlog', description: 'Tasks not yet started' },
  { title: 'In Progress', description: 'Tasks currently being worked on' },
  { title: 'Review', description: 'Tasks pending review or approval' },
  { title: 'Done', description: 'Completed tasks' },
];

const taskTemplates = [
  'Set up project repository',
  'Write technical specification',
  'Design wireframes',
  'Implement authentication module',
  'Create database schema',
  'Write unit tests',
  'Set up CI/CD pipeline',
  'Conduct user research',
  'Perform code review',
  'Deploy to staging environment',
  'Fix login page bug',
  'Optimize database queries',
  'Write API documentation',
  'Integrate third-party payment API',
  'Conduct security audit',
  'Set up monitoring and alerts',
  'Refactor legacy code',
  'Implement email notifications',
  'Create onboarding flow',
  'Performance testing',
];

const statuses: ('Pending' | 'InProgress' | 'Done')[] = ['Pending', 'InProgress', 'Done'];

async function main() {
  console.log('🔌 Connecting to:', process.env.DATABASE_URL);
  console.log('🧹 Cleaning database...');
  await prisma.task.deleteMany();
  await prisma.taskGroup.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.userRequest.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organisation.deleteMany();
  console.log('✅ Database cleaned\n');
  for (const orgData of organisations) {
    console.log(`🏢 Creating organisation: ${orgData.name}`);
    const org = await prisma.organisation.create({
      data: { name: orgData.name, description: orgData.description }
    });
    const admin = await prisma.user.create({
      data: {
        firstName: 'Admin',
        lastName: orgData.name.split(' ')[0],
        email: `admin@${orgData.name.toLowerCase().replace(/\s/g, '')}.com`,
        password: await hash('password123'),
        role: 'admin',
        organisationId: org.id,
        pic: null
      }
    });
    console.log(`  👤 Admin: ${admin.firstName} ${admin.lastName} (${admin.email})`);

    const members: typeof admin[] = [];
    for (let i = 0; i < 9; i++) {
      const firstName = firstNames[i];
      const lastName = randomItem(lastNames);
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${orgData.name.toLowerCase().replace(/\s/g, '')}.com`;
      const member = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          password: await hash('password123'),
          role: 'member',
          organisationId: org.id,
          pic: null
        }
      });
      members.push(member);
    }
    console.log(`  👥 Created ${members.length} members`);

    for (let i = 0; i < 3; i++) {
      const firstName = randomItem(firstNames);
      const lastName = randomItem(lastNames);
      await prisma.userRequest.create({
        data: {
          firstName,
          lastName,
          email: `request${i + 1}@${orgData.name.toLowerCase().replace(/\s/g, '')}.com`,
          password: await hash('password123'),
          organisationId: org.id
        }
      });
    }
    console.log(`  📬 Created 3 pending user requests`);

    const orgIndex = organisations.indexOf(orgData);
    const selectedProjects = [projectTemplates[orgIndex * 2], projectTemplates[orgIndex * 2 + 1]];

    for (const projectData of selectedProjects) {
      const project = await prisma.project.create({
        data: { title: projectData.title, description: projectData.description, organisationId: org.id }
      });

      const allUsers = [admin, ...members];
      for (const user of allUsers) {
        await prisma.projectMember.create({
          data: { projectId: project.id, userId: user.id }
        });
      }

      console.log(`  📁 Project: ${project.title}`);

      for (const tgData of taskGroupTemplates) {
        const taskGroup = await prisma.taskGroup.create({
          data: { title: tgData.title, description: tgData.description, projectId: project.id }
        });

        const taskCount = 4 + Math.floor(Math.random() * 3);
        const shuffledTasks = [...taskTemplates].sort(() => Math.random() - 0.5).slice(0, taskCount);

        for (const taskTitle of shuffledTasks) {
          const status = randomItem(statuses);
          const hasDeadline = Math.random() > 0.4;
          const deadline = hasDeadline
            ? formatDeadline(randomDate(new Date(), new Date('2027-12-31')))
            : null;
          const completedAt = status === 'Done' ? randomDate(new Date('2024-01-01'), new Date()) : null;
          const responsible = randomItem(allUsers);

          await prisma.task.create({
            data: {
              title: taskTitle,
              description: `Description for: ${taskTitle}`,
              status,
              responsibleId: responsible.id,
              taskGroupId: taskGroup.id,
              deadline,
              completedAt
            }
          });
        }

        console.log(`    📋 TaskGroup: ${taskGroup.title} (${taskCount} tasks)`);
      }
    }

    console.log('');
  }

  console.log('🎉 Seed complete!\n');
  console.log('🔑 All accounts use password: password123');
  console.log('📧 Admin emails:');
  organisations.forEach(org => {
    console.log(`   admin@${org.name.toLowerCase().replace(/\s/g, '')}.com`);
  });
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());