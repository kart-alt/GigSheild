const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ─── Standard exclusions (applied to all policies) ────────────────
const STANDARD_EXCLUSIONS = JSON.stringify([
  'war',
  'pandemic',
  'terrorism',
  'nuclear events',
  'government-declared national emergency',
]);

// ─── Policy catalog ───────────────────────────────────────────────
// Base premium ₹40. Zone & AQI adjustments done in premium.js (Feature 3).
// Here we store the base configuration for each policy type.
const POLICY_CATALOG = {
  'Monsoon Shield': {
    description: 'Protects your income when heavy rainfall or waterlogging makes deliveries impossible or unsafe.',
    trigger: 'Rainfall > 15mm/hr (OpenWeatherMap)',
    basePremium: 49,   // base ₹40 + typical zone risk
    maxPayout: 400,
    icon: '🌧️',
  },
  'Clean Air Guard': {
    description: 'Covers earnings lost when hazardous air quality (AQI > 300) makes outdoor work dangerous.',
    trigger: 'AQI > 300 (WAQI / OpenAQ)',
    basePremium: 45,
    maxPayout: 300,
    icon: '💨',
  },
  'Technical Shock': {
    description: 'Compensates you when your delivery platform suffers an outage for more than 30 minutes.',
    trigger: 'HTTP 500 errors for > 30 mins (synthetic pings)',
    basePremium: 43,
    maxPayout: 350,
    icon: '⚡',
  },
  'Zone Closure': {
    description: 'Pays out when strikes, bandhs, or curfews prevent you from operating in your zone.',
    trigger: 'NewsAPI NLP + traffic anomaly detection',
    basePremium: 52,
    maxPayout: 400,
    icon: '🚧',
  },
};

// ─── Helper: get current week's Mon–Sun coverage window ───────────
function getCoverageWindow() {
  const now = new Date();
  const day = now.getDay(); // 0=Sun … 6=Sat
  const diffToMon = (day === 0 ? -6 : 1 - day);

  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMon);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { coverageStart: monday, coverageEnd: sunday };
}

// ─────────────────────────────────────────────────────────────────
// GET /api/policy/catalog
// Returns the static policy catalog (for frontend display).
// ─────────────────────────────────────────────────────────────────
router.get('/catalog', (req, res) => {
  res.json({ success: true, catalog: POLICY_CATALOG });
});

// ─────────────────────────────────────────────────────────────────
// GET /api/policy/worker/:workerId
// Returns all policies (active + historical) for a specific worker.
// ─────────────────────────────────────────────────────────────────
router.get('/worker/:workerId', async (req, res) => {
  const { workerId } = req.params;

  try {
    const policies = await prisma.policy.findMany({
      where: { workerId },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, policies });
  } catch (err) {
    console.error('Fetch policies error:', err);
    return res.status(500).json({ error: 'Failed to fetch policies', details: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────
// POST /api/policy/activate
// Activates a policy for a worker for the current week.
// Body: { workerId, policyType, premiumPaid }
// Prevents duplicate active policies of the same type in the same week.
// ─────────────────────────────────────────────────────────────────
router.post('/activate', async (req, res) => {
  const { workerId, policyType, premiumPaid } = req.body;

  if (!workerId || !policyType) {
    return res.status(400).json({ error: 'workerId and policyType are required' });
  }

  if (!POLICY_CATALOG[policyType]) {
    return res.status(400).json({ error: `Unknown policy type: ${policyType}` });
  }

  try {
    // Check if worker exists
    const worker = await prisma.worker.findUnique({ where: { id: workerId } });
    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    // Check for existing active policy of the same type this week
    const { coverageStart, coverageEnd } = getCoverageWindow();
    const existing = await prisma.policy.findFirst({
      where: {
        workerId,
        policyType,
        status: 'active',
        coverageStart: { gte: coverageStart },
      },
    });

    if (existing) {
      return res.status(409).json({
        error: 'Policy already active for this week',
        policy: existing,
      });
    }

    const catalogEntry = POLICY_CATALOG[policyType];
    const finalPremium = premiumPaid || catalogEntry.basePremium;

    const policy = await prisma.policy.create({
      data: {
        workerId,
        policyType,
        premiumPaid: parseFloat(finalPremium),
        coverageStart,
        coverageEnd,
        status: 'active',
        exclusions: STANDARD_EXCLUSIONS,
      },
    });

    return res.json({
      success: true,
      policy,
      message: `${policyType} activated for the week of ${coverageStart.toDateString()} – ${coverageEnd.toDateString()}`,
    });
  } catch (err) {
    console.error('Activate policy error:', err);
    return res.status(500).json({ error: 'Failed to activate policy', details: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────
// DELETE /api/policy/:policyId
// Cancels (soft-deletes) a policy — sets status to 'cancelled'.
// ─────────────────────────────────────────────────────────────────
router.delete('/:policyId', async (req, res) => {
  const { policyId } = req.params;

  try {
    const policy = await prisma.policy.update({
      where: { id: policyId },
      data: { status: 'cancelled' },
    });
    return res.json({ success: true, policy, message: 'Policy cancelled successfully' });
  } catch (err) {
    console.error('Cancel policy error:', err);
    return res.status(500).json({ error: 'Failed to cancel policy', details: err.message });
  }
});

module.exports = router;
