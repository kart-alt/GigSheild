const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

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

// ─────────────────────────────────────────────────────────────────
// EXISTING: Send OTP  (unchanged)
// ─────────────────────────────────────────────────────────────────
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
  console.log(`[MOCK] OTP 123456 ready for ${phone}`);
  return res.json({ success: true, message: 'MOCK OTP sent. Use 123456 to verify.' });
});

// ─────────────────────────────────────────────────────────────────
// EXISTING: Verify OTP  (updated to also accept 123456)
// ─────────────────────────────────────────────────────────────────
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

  // Fallback to Mock — accepts both 123456 (new standard) and 482910 (legacy)
  if (otp === '123456' || otp === '482910') {
    return res.json({ success: true, message: 'MOCK OTP Verified' });
  }
  return res.status(400).json({ error: 'Invalid MOCK OTP. Use 123456.' });
});

// ─────────────────────────────────────────────────────────────────
// NEW: Register Worker
// Called after OTP is verified. Stores or updates worker profile.
// Body: { phone, name, zone, platform, weeklyEarningEstimate }
// ─────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  const { phone, name, zone, platform, weeklyEarningEstimate } = req.body;

  if (!phone || !name || !zone || !platform) {
    return res.status(400).json({ error: 'phone, name, zone, and platform are required' });
  }

  try {
    // upsert: create if new phone, update if returning worker
    const worker = await prisma.worker.upsert({
      where: { phone },
      update: {
        name,
        zone,
        platform,
        weeklyEarningEstimate: parseFloat(weeklyEarningEstimate) || null,
      },
      create: {
        phone,
        name,
        zone,
        platform,
        weeklyEarningEstimate: parseFloat(weeklyEarningEstimate) || null,
      },
    });

    return res.json({ success: true, worker });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Failed to register worker', details: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────
// NEW: Get Worker by Phone (login fetch)
// Called after OTP verify to retrieve existing worker data.
// ─────────────────────────────────────────────────────────────────
router.get('/me/:phone', async (req, res) => {
  const { phone } = req.params;

  try {
    const worker = await prisma.worker.findUnique({ where: { phone } });
    if (!worker) {
      return res.status(404).json({ exists: false, message: 'Worker not registered yet' });
    }
    return res.json({ exists: true, worker });
  } catch (err) {
    console.error('Fetch worker error:', err);
    return res.status(500).json({ error: 'Failed to fetch worker', details: err.message });
  }
});

module.exports = router;
