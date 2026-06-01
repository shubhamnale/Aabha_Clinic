import mongoose from 'mongoose'
import dotenv   from 'dotenv'
import User     from './models/User.js'

dotenv.config()

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ Connected to MongoDB')

    const existing = await User.findOne({ role: 'admin' })
    if (existing) {
      console.log('⚠️  Admin already exists — skipping seed')
      console.log('   If you want to reset, manually drop the database first.')
      process.exit(0)
    }

    await new User({
      username: 'admin',
      password: 'admin123',
      name:     'Administrator',
      role:     'admin',
    }).save()

    console.log('👤  Admin account created')
    console.log('─'.repeat(40))
    console.log('Login Credentials:')
    console.log('  username : admin')
    console.log('  password : admin123')
    console.log('─'.repeat(40))
    console.log('⚠️  Change the password after first login!')
    console.log('   Create doctors and staff via the CMS.')
    process.exit(0)

  } catch (err) {
    console.error('❌ Seed failed:', err.message)
    process.exit(1)
  }
}

seed()


