const express = require('express');
const router = express.Router();
const twilio = require('twilio');

// Initialize Twilio client ONLY if env vars exist
// Fallback to mock behavior if no keys (so frontend still works without keys)
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

let twilioClient = null;
if (accountSid && authToken && verifyServiceSid) {
  try {
    twilioClient = twilio(accountSid, authToken);
  } catch(e) { console.error("Twilio Init Error:", e.message); }
}

router.post('/send-otp', async (req, res) => {
  const { phone } = req.body;
  
  if (!phone) return res.status(400).json({ error: 'Phone number is required' });

  // Use Real Twilio
  if (twilioClient) {
    try {
      await twilioClient.verify.v2.services(verifyServiceSid)
        .verifications
        .create({to: `+91${phone}`, channel: 'sms'});
      
      return res.json({ success: true, message: 'OTP sent via Twilio' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to send OTP via Twilio' });
    }
  } 
  
  // Fallback to Mock
  console.log(`[MOCK] Sending OTP 482910 to ${phone}`);
  return res.json({ success: true, message: 'MOCK OTP sent' });
});

router.post('/verify-otp', async (req, res) => {
  const { phone, otp } = req.body;

  if (twilioClient) {
    try {
      const verification_check = await twilioClient.verify.v2.services(verifyServiceSid)
        .verificationChecks
        .create({to: `+91${phone}`, code: otp});
      
      if (verification_check.status === 'approved') {
        return res.json({ success: true, message: 'OTP Verified' });
      } else {
        return res.status(400).json({ error: 'Invalid OTP' });
      }
    } catch (error) {
      return res.status(500).json({ error: 'Failed to verify OTP' });
    }
  }

  // Fallback to Mock
  if (otp === '482910') {
    return res.json({ success: true, message: 'MOCK OTP Verified' });
  }
  return res.status(400).json({ error: 'Invalid MOCK OTP' });
});

module.exports = router;
