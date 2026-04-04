const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ─── GET /api/claims/worker/:workerId ─────────────────────────────
// Returns all claims (approved, pending, rejected) for a worker.
router.get('/worker/:workerId', async (req, res) => {
  const { workerId } = req.params;
  try {
    const claims = await prisma.claim.findMany({
      where: { workerId },
      orderBy: { createdAt: 'desc' },
      include: { worker: { select: { name: true, phone: true, zone: true } } },
    });
    return res.json({ success: true, claims });
  } catch (err) {
    console.error('Fetch worker claims error:', err);
    return res.status(500).json({ error: 'Failed to fetch worker claims', details: err.message });
  }
});

// ─── GET /api/claims/live ─────────────────────────────────────────
// Returns the most recent 20 claims on the platform for the global feed.
router.get('/live', async (req, res) => {
  try {
    const claims = await prisma.claim.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: { worker: { select: { name: true, zone: true, platform: true } } },
    });
    return res.json({ success: true, claims });
  } catch (err) {
    console.error('Fetch live claims error:', err);
    return res.status(500).json({ error: 'Failed to fetch live claims', details: err.message });
  }
});

// ─── POST /api/claims/simulate ────────────────────────────────────
// Simulated "Zero-Touch" claim trigger.
// Body: { workerId, policyType, triggerReason, triggerValue, payoutAmount }
// In a real system, this would be triggered by a background cron job checking oracles.
router.post('/simulate', async (req, res) => {
  const { workerId, policyType, triggerReason, triggerValue, payoutAmount } = req.body;

  if (!workerId || !policyType) {
    return res.status(400).json({ error: 'workerId and policyType are required' });
  }

  try {
    // 1. Verify worker exists
    const worker = await prisma.worker.findUnique({ where: { id: workerId } });
    if (!worker) return res.status(404).json({ error: 'Worker not found' });

    // 2. Verify worker has an active policy of that type for the current week
    const now = new Date();
    const activePolicy = await prisma.policy.findFirst({
      where: {
        workerId,
        policyType,
        status: 'active',
        coverageStart: { lte: now },
        coverageEnd: { gte: now },
      },
    });

    if (!activePolicy) {
      return res.status(403).json({
        error: `No active ${policyType} policy found for the current coverage window.`,
      });
    }

    // 3. Create the claim (Approved by default in parametric model)
    const claim = await prisma.claim.create({
      data: {
        workerId,
        policyType,
        triggerReason: triggerReason || 'Automated Oracle Trigger',
        triggerValue: triggerValue || 'N/A',
        payoutAmount: parseFloat(payoutAmount || 350),
        status: 'approved',
        // Legacy fields mapping
        type: policyType,
        amount: parseFloat(payoutAmount || 350),
      },
    });

    return res.json({
      success: true,
      claim,
      message: `Zero-touch payout of ₹${claim.payoutAmount} triggered for ${policyType}!`,
    });
  } catch (err) {
    console.error('Simulate claim error:', err);
    return res.status(500).json({ error: 'Failed to simulate claim', details: err.message });
  }
});

module.exports = router;
