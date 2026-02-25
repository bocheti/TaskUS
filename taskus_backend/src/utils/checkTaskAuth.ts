import prisma from '../prisma';

export const isProjectMember = async (userId: string, projectId: string): Promise<boolean> => {
  const membership = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } }
  });
  return !!membership;
};