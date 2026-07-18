const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_PHONE_NUMBER;

let twilioClient;
try {
  if (accountSid && authToken) {
    twilioClient = twilio(accountSid, authToken);
  }
} catch (err) {
  console.error('[Voice] Error initializing Twilio client:', err.message);
}

/**
 * Make phone call and say voice message in patient language using Twilio Voice API
 * @param {string} to - Recipient phone number (e.g. 9876543210)
 * @param {string} message - Message text to synthesize
 * @param {string} language - Patient language code (english/hindi/marathi)
 * @returns {Promise<object>} - { success: true/false, sid, error }
 */
async function sendVoiceMessage(to, message, language) {
  try {
    if (!to || !message) {
      throw new Error('Phone number and message text are required');
    }

    // Process sandbox mock mode
    if (process.env.MOCK_SMS === 'true') {
      console.log(`[Mock Voice] Calling ${to} (Language: ${language}): ${message}`);
      if (to.includes('9777777777')) {
        return {
          success: false,
          error: 'Simulated failure for testing Voice retry logic',
          code: 21608
        };
      }
      return {
        success: true,
        sid: 'CAmock' + Math.floor(Math.random() * 1000000)
      };
    }

    if (!twilioClient) {
      throw new Error('Twilio client not initialized. Check your credentials.');
    }

    let formattedTo = to.trim();
    if (!formattedTo.startsWith('+')) {
      formattedTo = '+91' + formattedTo;
    }

    // Map language to ISO codes supported by Twilio Voice engines
    const langCodes = {
      english: 'en-IN', // Indian English accent
      hindi: 'hi-IN',   // Hindi voice engine
      marathi: 'mr-IN'  // Marathi voice engine (or fallback to hi-IN if mr-IN is not available on basic account)
    };
    const targetLang = langCodes[String(language).toLowerCase()] || 'en-IN';

    console.log(`[Voice] Dialing call to ${formattedTo}...`);

    // Compile dynamic TwiML instruction
    const twiml = `<Response><Say language="${targetLang}">${message}</Say></Response>`;

    const result = await twilioClient.calls.create({
      twiml,
      from: fromPhone,
      to: formattedTo
    });

    console.log(`[Voice] Call initiated! SID: ${result.sid}`);

    return {
      success: true,
      sid: result.sid
    };

  } catch (error) {
    console.error(`[Voice] Failed call dispatch to ${to}`);
    console.error('Error:', error.message);
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
}

module.exports = {
  sendVoiceMessage
};
