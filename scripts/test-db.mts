import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    await prisma.$connect()
    console.log('✅ Database connection successful')

    const testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: 'test-password',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
      },
    })
    console.log('✅ Test user created:', testUser)

    await prisma.user.delete({
      where: { email: 'test@example.com' },
    })
    console.log('✅ Test cleanup successful')

  } catch (error) {
    console.error('❌ Database test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()