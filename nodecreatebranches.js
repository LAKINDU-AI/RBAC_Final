const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createBranches() {
  const branchNames = ['Branch1', 'Branch2', 'Branch3'];

  for (const branchName of branchNames) {
    let branch = await prisma.branch.findFirst({
      where: { name: branchName },
    });

    if (!branch) {
      console.log(`Creating branch: ${branchName}`);
      branch = await prisma.branch.create({
        data: { name: branchName },
      });
      console.log(`Branch created: ${branchName}`);
    } else {
      console.log(`Branch already exists: ${branchName}`);
    }
  }

  await prisma.$disconnect();
}

createBranches().catch((error) => {
  console.error('Error creating branches:', error);
  process.exit(1);
});
