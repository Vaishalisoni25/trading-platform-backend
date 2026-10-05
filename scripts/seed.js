require('dotenv').config();
const bcrypt = require('bcryptjs');
const { prisma } = require('../src/config/db');

async function seed() {
  console.log('Seeding initial Super Admin...');
  try {
    const adminEmail = 'admin@platform.com';
    const existing = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existing) {
      console.log('Super Admin already exists:', existing.email);
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash('AdminPassword@123', salt);

    const admin = await prisma.user.create({
      data: {
        name: 'Platform Super Admin',
        email: adminEmail,
        passwordHash,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        isEmailVerified: true,
      },
    });

    console.log('✅ Super Admin created successfully!');
    console.log('Email:', admin.email);
    console.log('Password: AdminPassword@123');
    console.log('Role:', admin.role);
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
