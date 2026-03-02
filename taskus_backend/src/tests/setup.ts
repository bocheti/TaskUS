import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test', override: true });

const prisma = new PrismaClient();

afterAll(async () => {
  await prisma.task.deleteMany();
  await prisma.taskGroup.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
  await prisma.userRequest.deleteMany();
  await prisma.organisation.deleteMany();
  await prisma.$disconnect();
});