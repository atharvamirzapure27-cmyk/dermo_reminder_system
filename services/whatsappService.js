require('dotenv').config();
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromWhatsApp = process.env.TWILIO_WHATSAPP_NUMBER || '+14155238886'; // default Twilio sandbox sender number

let twilioClient;
try {
  if (accountSid && authToken) {
    twilioClient = twilio(accountSid, authToken);
  }
} catch (err) {
  console.error('[WhatsApp] Error initializing Twilio client:', err.message);
}

/**
 * Send WhatsApp text message using Twilio WhatsApp API
 * @param {string} to - Recipient phone number (e.g. 9876543210)
 * @param {string} message - Message text body
 * @returns {Promise<object>} - { success: true/false, sid, error }
 */
async function sendWhatsAppText(to, message) {
  try {
    if (!to || !message) {
      throw new Error('Phone number and message text are required');
    }

    // Process sandbox mock mode
    if (process.env.MOCK_SMS === 'true') {
      console.log(`[Mock WhatsApp] Sending text to ${to}: ${message}`);
      if (to.includes('9777777777')) {
        return {
          success: false,
          error: 'Simulated failure for testing WhatsApp retry logic',
          code: 21608
        };
      }
      return {
        success: true,
        sid: 'WAmock' + Math.floor(Math.random() * 1000000)
      };
    }

    if (!twilioClient) {
      throw new Error('Twilio client not initialized. Check your credentials.');
    }

    let formattedTo = to.trim();
    if (!formattedTo.startsWith('+')) {
      formattedTo = '+91' + formattedTo;
    }

    console.log(`[WhatsApp] Dispatching text message to whatsapp:${formattedTo}...`);

    const result = await twilioClient.messages.create({
      body: message,
      from: `whatsapp:${fromWhatsApp}`,
      to: `whatsapp:${formattedTo}`
    });

    console.log(`[WhatsApp] Sent successfully! SID: ${result.sid}`);

    return {
      success: true,
      sid: result.sid
    };

  } catch (error) {
    console.error(`[WhatsApp] Failed to send to ${to}`);
    console.error('Error:', error.message);
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
}

module.exports = {
  sendWhatsAppText
};
