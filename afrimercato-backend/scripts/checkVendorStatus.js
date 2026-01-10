require('dotenv').config()
const mongoose = require('mongoose')
const User = require('../src/models/User')

async function checkVendorStatus(email) {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB\n')

    const user = await User.findOne({ email: email })

    if (!user) {
      console.log(`❌ No user found with email: ${email}`)
      return
    }

    console.log('📧 USER FOUND:')
    console.log('=====================================')
    console.log(`Name: ${user.name}`)
    console.log(`Email: ${user.email}`)
    console.log(`Role: ${user.role}`)
    console.log(`Approval Status: ${user.approvalStatus || 'Not set'}`)
    console.log(`Created At: ${user.createdAt}`)
    console.log(`Updated At: ${user.updatedAt}`)
    console.log('=====================================\n')

    if (user.role === 'vendor') {
      console.log('🏪 VENDOR DETAILS:')
      console.log(`Approval Status: ${user.approvalStatus}`)
      console.log(`Business Name: ${user.businessName || 'Not set'}`)
      console.log(`Phone: ${user.phone || 'Not set'}`)
      console.log(`Address: ${user.address || 'Not set'}`)

      if (user.approvalStatus === 'pending') {
        console.log('\n⚠️  VENDOR IS PENDING APPROVAL')
        console.log('Would you like to approve this vendor? (Run approveVendor.js)')
      } else if (user.approvalStatus === 'approved') {
        console.log('\n✅ VENDOR IS APPROVED')
      } else {
        console.log(`\n⚠️  Status: ${user.approvalStatus}`)
      }
    }

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
  console.log('Usage: node checkVendorStatus.js your@email.com')
  process.exit(1)
}

checkVendorStatus(email)
