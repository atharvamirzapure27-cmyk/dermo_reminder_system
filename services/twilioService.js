require('dotenv').config();
const twilio = require('twilio');

const isProduction = process.env.NODE_ENV === 'production';
const logInfo = (message) => {
  if (!isProduction) {
    console.log(message);
  }
};

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

let twilioClient;

try {
  if (accountSid && authToken) {
    twilioClient = twilio(accountSid, authToken);
    logInfo('✅ Twilio client initialized successfully');
  } else {
    console.warn('⚠️  Twilio credentials not found in environment variables');
  }
} catch (error) {
  console.error('❌ Error initializing Twilio client:', error.message);
}

/**
 * Send SMS using Twilio API
 * @param {string} to - Recipient phone number (e.g., +911234567890)
 * @param {string} message - SMS message content
 * @returns {Promise<object>} - Twilio message object or error
 */
async function sendSMS(to, message) {
  try {
    if (process.env.MOCK_SMS === 'true') {
      console.log(`[Mock SMS] Sending to ${to}: ${message}`);
      if (to.includes('9777777777')) {
        return { success: false, error: 'Simulated failure for testing retry logic', code: 21608 };
      }
      return { success: true, sid: 'SMmock' + Math.floor(Math.random() * 1000000) };
    }

    // Validate phone number format
    if (!to || !message) {
      throw new Error('Phone number and message are required');
    }

    // Ensure phone number has country code
    if (!to.startsWith('+')) {
      to = '+91' + to; // Default to India if no country code
    }

    // Validate Twilio client is initialized
    if (!twilioClient) {
      throw new Error('Twilio client not initialized. Check your credentials.');
    }

    logInfo(`📤 Sending SMS to ${to}...`);

    const result = await twilioClient.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: to
    });

    logInfo(`✅ SMS sent successfully! SID: ${result.sid}`);
    
    return {
      success: true,
      sid: result.sid,
      status: result.status,
      to: result.to,
      from: result.from
    };

  } catch (error) {
    console.error(`❌ Failed to send SMS to ${to}`);
    console.error('Error:', error.message);
    
    // Provide helpful error messages
    let errorMessage = error.message;
    if (error.code === 21211) {
      errorMessage = 'Invalid phone number format';
    } else if (error.code === 21608) {
      errorMessage = 'Unverified phone number (Twilio trial account limitation)';
    } else if (error.code === 20003) {
      errorMessage = 'Invalid Twilio credentials';
    }

    return {
      success: false,
      error: errorMessage,
      code: error.code
    };
  }
}

module.exports = { sendSMS };
