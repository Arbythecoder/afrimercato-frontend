require('dotenv').config()
const mongoose = require('mongoose')
const User = require('../src/models/User')

async function approveVendor(email) {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB\n')

    const user = await User.findOne({ email: email })

    if (!user) {
      console.log(`❌ No user found with email: ${email}`)
      await mongoose.connection.close()
      return
    }

    if (user.role !== 'vendor') {
      console.log(`❌ User is not a vendor (role: ${user.role})`)
      await mongoose.connection.close()
      return
    }

    console.log('📧 BEFORE:')
    console.log(`Name: ${user.name}`)
    console.log(`Email: ${user.email}`)
    console.log(`Approval Status: ${user.approvalStatus}\n`)

    // Update approval status
    user.approvalStatus = 'approved'
    user.approvedAt = new Date()
    await user.save()

    console.log('✅ VENDOR APPROVED!')
    console.log('📧 AFTER:')
    console.log(`Name: ${user.name}`)
    console.log(`Email: ${user.email}`)
    console.log(`Approval Status: ${user.approvalStatus}`)
    console.log(`Approved At: ${user.approvedAt}`)

    await mongoose.connection.close()
  } catch (error) {
    console.error('❌ Error:', error.message)
    await mongoose.connection.close()
  }
}

// Get email from command line argument
const email = process.argv[2]

if (!email) {
  console.log('❌ Please provide an email address')
  console.log('Usage: node approveVendor.js your@email.com')
  process.exit(1)
}

approveVendor(email)
