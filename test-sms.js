require('dotenv').config();
const { sendSMS } = require('./services/twilioService');

/**
 * Test Script for Twilio SMS Integration
 * 
 * Usage:
 * node test-sms.js
 * 
 * This will send a test SMS to verify Twilio is working correctly.
 */

async function testSMS() {
  console.log('\n🧪 Testing Twilio SMS Integration...\n');

  // Test 1: Check environment variables
  console.log('📋 Checking environment variables...');
  if (!process.env.TWILIO_ACCOUNT_SID) {
    console.error('❌ TWILIO_ACCOUNT_SID is missing in .env file');
    return;
  }
  if (!process.env.TWILIO_AUTH_TOKEN) {
    console.error('❌ TWILIO_AUTH_TOKEN is missing in .env file');
    return;
  }
  if (!process.env.TWILIO_PHONE_NUMBER) {
    console.error('❌ TWILIO_PHONE_NUMBER is missing in .env file');
    return;
  }
  console.log('✅ All Twilio credentials found\n');

  // Test 2: Ask for phone number
  const phoneNumber = process.argv[2];
  
  if (!phoneNumber) {
    console.log('📱 Usage: node test-sms.js <phone_number>');
    console.log('   Example: node test-sms.js +911234567890');
    console.log('   Example: node test-sms.js 9876543210\n');
    console.log('⚠️  For trial accounts, phone number must be verified in Twilio Console\n');
    return;
  }

  // Test 3: Send test message
  const testMessage = `Hello! This is a test message from Dermo Reminder System. Twilio integration is working correctly! ✅`;

  console.log(`📤 Sending test SMS to ${phoneNumber}...`);
  console.log(`   Message: "${testMessage}"\n`);

  try {
    const result = await sendSMS(phoneNumber, testMessage);

    console.log('\n📊 Test Result:');
    console.log('─'.repeat(50));
    
    if (result.success) {
      console.log('✅ SUCCESS! SMS sent successfully');
      console.log(`   Message SID: ${result.sid}`);
      console.log(`   Status: ${result.status}`);
      console.log(`   To: ${result.to}`);
      console.log(`   From: ${result.from}`);
      console.log('\n🎉 Twilio integration is working perfectly!');
    } else {
      console.log('❌ FAILED! SMS could not be sent');
      console.log(`   Error: ${result.error}`);
      console.log(`   Error Code: ${result.code}`);
      console.log('\n💡 Tips:');
      console.log('   - For trial accounts, verify the phone number in Twilio Console');
      console.log('   - Check Twilio account balance');
      console.log('   - Verify phone number format (include country code)');
    }
    
    console.log('─'.repeat(50));

  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message);
    console.error(error.stack);
  }

  console.log('\n');
}

// Run the test
testSMS();
