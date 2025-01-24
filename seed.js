const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  await prisma.branch.createMany({
    data: [
      { name: 'Branch1' },
      { name: 'Branch2' },
      { name: 'Branch3' },
    ],
    skipDuplicates: true,
  });

  console.log('Branches created or already exist.');

  const menuItems = [
    { item: 'CHICKEN_STEAK', price: 45.75 },
    { item: 'FISH_STEAK', price: 33.00 },
    { item: 'BEEF_STEAK', price: 20.78 },
    { item: 'LAMB_STEAK', price: 30.55 },
  ];

  for (const menuItem of menuItems) {
    await prisma.menu.create({
      data: menuItem,
    });
  }

  console.log('Menu items created.');

  const adminEmail = 'admin@gmail.com';
  const rawPassword = 'admin';
  const password = await bcrypt.hash(rawPassword, 10);

  const branch1 = await prisma.branch.findFirst({
    where: { name: 'Branch1' },
  });

  if (!branch1) {
    console.error('Branch1 does not exist even after creation attempt. Exiting...');
    return;
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingUser) {
    const user = await prisma.user.create({
      data: {
        email: adminEmail,
        password,
        role: 'ADMIN',
        Branch: { connect: { id: branch1.id } },
      },
    });

    console.log(`User with email ${adminEmail} created with role ADMIN`);
  } else {
    console.log(`User with email ${adminEmail} already exists and will not be updated`);
  }
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
