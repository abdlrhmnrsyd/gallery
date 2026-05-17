const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Check if admin already exists
  const existingAdmin = await prisma.admin.findFirst({
    where: { username: 'admin' }
  });

  if (existingAdmin) {
    console.log('Admin user already exists. Username: admin');
    return;
  }

  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.admin.create({
    data: {
      username: 'admin',
      password: hashedPassword,
    },
  });
  
  console.log('Successfully created admin user!');
  console.log('Username: admin');
  console.log('Password: admin123');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
