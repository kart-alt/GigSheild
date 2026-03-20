# GigSheild


**Parametric Income Protection for Gig Workers**
Guidewire DEVTrails 2026 · Team Unrecognized




## What is this?

GigGuard AI is an insurance platform built specifically for delivery partners in India. It detects income disruptions automatically — heavy rain, dangerous air quality, platform outages — and transfers compensation directly to a worker's UPI account without any manual claim process.

The worker doesn't file anything. They don't call anyone. The money just arrives.


## Why we built it

India has over 10 million gig delivery workers. They're classified as independent contractors, which means no employer-backed insurance, no paid sick days, and no protection when conditions make it impossible or unsafe to work.

When a storm shuts down a city for three hours, a salaried office worker loses nothing. A delivery partner loses their entire afternoon's income. That gap is what GigGuard exists to close.

The reason traditional insurance hasn't solved this is friction. Filing a claim for ₹400 requires more effort than the payout is worth. Parametric insurance sidesteps that entirely — instead of asking workers to prove a loss, we verify the disruption directly from trusted data sources and trigger the payout ourselves.


## The Platform

GigGuard ships as two separate interfaces built for two very different users.

**Worker App (Android)**
The primary touchpoint for delivery partners. Designed to work on low-end Android devices with intermittent connectivity. Workers use it to complete KYC enrollment, browse and activate policies, check their active coverage, and receive payout notifications. The entire experience is in plain language — no insurance jargon, no complex navigation. A worker who has never used an insurance product before should be able to onboard without any guidance.

Key screens:
- Onboarding & GigShield KYC flow
- Policy cart — browse, activate, and manage coverage
- Live coverage status — shows active policies and current oracle conditions
- Payout history — a clear log of every triggered credit with the reason and amount

**Admin Dashboard (Web)**
Built for the insurance operations team. Gives administrators a real-time view of the entire platform — active policies, oracle status, fraud flag queue, payout logs, and risk analytics by zone. Administrators can review flagged payout requests, adjust fraud scoring thresholds, configure oracle trigger parameters, and pull reports on claims volume and financial exposure.

Key modules:
- Oracle monitor — live feed of all data sources and their current readings
- Fraud review queue — flagged requests with full scoring breakdowns for manual review
- Policy & pricing management — configure products and approve Sunday repricing runs
- Payout ledger — full audit trail of every credit issued through RazorpayX
- Zone risk analytics — heatmaps and trend data to support underwriting decisions



## How it works

**Step 1 — Enroll**
Workers complete a 4-minute identity verification. No branch visit, no document upload portal, no waiting period.

**Step 2 — Choose coverage**
A modular policy cart lets workers pick only what's relevant to them. Someone in Chennai might prioritize Monsoon Shield. Someone in Delhi might care more about Clean Air Guard. Each policy has a small weekly premium, recalculated every Sunday based on real risk data for that zone.

**Step 3 — Go to work**
In the background, GigGuard monitors live data oracles for disruption events. Workers don't need to do anything.

**Step 4 — Disruption detected**
The moment a trigger threshold is crossed, the system validates the event, runs a fraud check, and fires the payout — all within seconds.



## Identity Verification (GigShield)

We built KYC from the ground up without relying on delivery platform APIs, which gave us platform independence from day one.

The five-step flow takes under four minutes:

1. **Phone OTP** — confirms ownership of the KYC-registered SIM
2. **UPI name lookup** — cross-references identity against the linked bank account via Razorpay
3. **Aadhaar XML** — pulls a cryptographically signed identity document (RSA-2048) directly from UIDAI
4. **Platform proof** — verifies active partner status through earnings SMS parsing and a live OCR screen recording
5. **Biometric match** — compares a live liveness-checked selfie against both the Aadhaar photo and platform profile image using DeepFace



## Fraud Prevention

Parametric insurance is only financially sustainable if location data can be trusted. GPS spoofing is a real attack vector — bad actors can fake their coordinates to appear inside a disruption zone and collect payouts they're not entitled to.

We built a scoring engine that evaluates every payout request across eight independent signals. Each signal catches a different spoofing technique. The combined score determines whether the payout proceeds or gets blocked.

**Heuristic Fraud Scorer — threshold: 90 / 205**

| Signal | Detection method | Weight |
|--------|-----------------|--------|
| OS mock location flag | Checks Android's `isMockLocation` API | 40 |
| GPS hardware jitter | Real chips fluctuate. Static values don't. | 15 |
| Velocity anomaly | Haversine formula flags physically impossible movement | 35 |
| WiFi environment match | Nearby SSIDs cross-referenced against claimed coordinates | 25 |
| Cell tower verification | OpenCelliD lookup confirms tower exists at claimed location | 25 |
| Sensor fusion | Accelerometer/gyroscope consistency against GPS state | 30 |
| IP geolocation | ISP-resolved city checked against GPS city | 15 |
| Satellite SNR analysis | `GnssStatus` API detects synthetic signal patterns | 20 |

A real worker in a real disruption zone scores zero. Anyone trying to game the system hits multiple flags at once.



## Payout Triggers (Oracles)

| Policy | Trigger condition | Data source |
|--------|------------------|-------------|
| Monsoon Shield | Rainfall > 15 mm/hr | OpenWeatherMap |
| Clean Air Guard | AQI > 300 | CPCB / OpenAQ |
| Technical Shock | Platform 500-series errors sustained > 30 min | Synthetic ping monitor |
| Zone Closure | Traffic anomaly + verified strike activity | Google Maps Traffic + NewsAPI |



## Policy Duration

Every GigGuard policy runs on a **7-day cycle, Monday to Sunday**.

Workers activate their chosen policies any time before Monday. Coverage goes live at 12:00 AM Monday and expires at 11:59 PM Sunday. If a disruption occurs within that window and the worker holds the relevant policy, the payout triggers automatically.

There is no lock-in. Workers can choose not to renew the following week — coverage simply lapses at Sunday midnight if they don't. If they do renew, the new premium (recalculated from that week's risk data) is auto-debited via Razorpay Autopay before the next cycle begins.

**Payouts per policy per week:**

Each policy has its own payout structure because the nature of each disruption is different. A blanket cap across all policies would either over-expose the platform on some risks or under-protect workers on others.

| Policy | Payout model | Max payouts/week | Reasoning |
|--------|-------------|:----------------:|-----------|
| Monsoon Shield | Per qualifying rain event | 3 | Rain comes and goes in distinct spells. Multiple separate events in a week are common during peak monsoon season. Each distinct crossing of the 15mm/hr threshold after a reset counts as a new event. |
| Clean Air Guard | Once per day when AQI > 300 | 2 | AQI tends to stay elevated for days at a stretch, not fluctuate in and out. One credit per day the threshold is breached — capped at 2 days per week — reflects the sustained nature of the disruption without creating unlimited liability. |
| Technical Shock | Per verified outage incident | 1 | Platform-wide outages sustained beyond 30 minutes are rare. One payout per week is sufficient and realistic given historical platform reliability data. |
| Zone Closure | Per verified closure event | 1 | Road closures and strikes in a single zone rarely occur more than once in a week. A single payout covers the lost shift without creating a model that's easy to game. |

A few specifics worth noting:

- Policies activate at the start of the weekly cycle, not the moment of purchase. A worker who buys on Wednesday is covered from the following Monday.
- Each policy is independent. Hitting the payout limit on one does not affect the others.
- A single continuous disruption (e.g. rain that lasts 6 hours straight) counts as one trigger event. The oracle must drop below threshold and re-cross it to register a new event.
- Weekly payout limits reset when the worker renews at the start of the next cycle.
- There is no minimum subscription period. One week is valid.

---

## How Payouts Work (No Claims Required)

GigGuard has no claims process. That is intentional.

Traditional insurance asks the policyholder to report a loss, submit evidence, and wait for approval. For a gig worker losing ₹300–₹500 on a bad weather day, that process is not worth the effort. Most don't bother. The insurance exists on paper but delivers nothing in practice.

GigGuard inverts this. The platform detects the disruption and initiates the payout itself. The worker's only job is to hold an active policy.

**What actually happens when a disruption occurs:**

```
1. Oracle crosses threshold
   e.g. OpenWeatherMap reports rainfall > 15 mm/hr in the worker's registered zone

2. System checks active policies
   Any worker with Monsoon Shield active for the current week is queued for payout

3. Fraud Guard runs automatically
   The 8-layer scoring engine evaluates the payout request
   Score ≤ 90  →  approved
   Score > 90  →  flagged and held for manual review

4. RazorpayX initiates the UPI transfer
   Funds reach the worker's bank account within seconds of approval

5. Worker receives a push notification
   "Monsoon Shield triggered. ₹400 has been credited to your UPI account."
```

**Payout amounts** are fixed per policy per trigger event — not calculated based on actual earnings lost. This keeps the system simple and removes the need for income verification at payout time.

**Flagged payouts** — if a payout is held by the fraud scorer, it goes into the admin review queue. The operations team reviews the scoring breakdown and either approves or rejects it manually. Workers whose payouts are held receive a notification that their request is under review, with a resolution time of under 24 hours.

There is no appeal form. There is no call centre. If a legitimate payout was wrongly blocked, the admin team resolves it from the dashboard.

---

## Pricing

Premiums are recalculated every Sunday using a Random Forest Regressor trained on the past seven days of weather, AQI, and platform reliability data for each zone. Workers in lower-risk areas pay less. Workers in historically disruption-heavy zones pay a fair rate that reflects actual exposure.

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Worker app | Android (React Native) |
| Admin dashboard | Web (React) |
| Backend | Node.js, Python FastAPI |
| ML / Pricing | Random Forest Regressor |
| Biometric verification | DeepFace |
| OCR | Tesseract.js |
| Liveness detection | face-api.js |
| Fraud signals | OpenCelliD, Android GnssStatus API |
| Payments | RazorpayX (Autopay inbound + UPI payouts outbound) |
| Oracles | OpenWeatherMap, CPCB/OpenAQ, Google Maps Traffic, NewsAPI |

---

## Roadmap

The current build is a proof of concept scoped to the hackathon. Natural next steps:

- Integrate hyperlocal flood sensors and NDRF alert feeds for finer-grained monsoon detection
- Explore a co-funding model where delivery platforms contribute to worker premiums as a retention mechanism
- Apply for the IRDAI regulatory sandbox to operate as a licensed parametric insurer

---


Built for Guidewire DEVTrails 2026.

---

## Market & Business Viability

India's gig economy is not a niche segment. As of 2024, there are an estimated 15 million platform-based gig workers in India, with delivery partners alone crossing 10 million across Swiggy, Zomato, Blinkit, Amazon, and Meesho. This number is growing at roughly 20% year on year.

None of them have meaningful income protection.

**The addressable market:**

| Segment | Estimated workers | Weekly premium potential (@ ₹40/worker) |
|---------|:-----------------:|:---------------------------------------:|
| Delivery partners (Tier 1 cities) | 3.5 million | ₹14 crore/week |
| Delivery partners (Tier 2 cities) | 4.5 million | ₹18 crore/week |
| Ride-hailing + other gig workers | 7 million | ₹28 crore/week |
| **Total TAM** | **15 million** | **₹60 crore/week** |

Even capturing 2% of the delivery partner segment in Tier 1 cities — 70,000 workers — at ₹40/week generates ₹2.8 crore per week in premium income.

**Unit economics (illustrative, per worker per week):**

| Item | Amount |
|------|-------:|
| Average weekly premium (all 4 policies) | ₹60 |
| Expected payout liability (actuarial estimate) | ₹35 |
| Platform + payment processing cost | ₹8 |
| **Gross margin per worker per week** | **₹17 (28%)** |

The model is financially sustainable at scale because disruptions are geographically and temporally concentrated — not every worker in every city gets paid out every week. A worker in Pune during a dry week pays a premium and collects nothing. A worker in Chennai during monsoon season collects once or twice. Across a large enough pool, the risk averages out.

**Revenue model:**
GigGuard operates as a managing general agent (MGA), underwriting policies and managing payouts directly. As the platform matures, the claims data builds a proprietary actuarial dataset that improves pricing accuracy week by week — a compounding moat that new entrants cannot easily replicate.

---

## Competitive Landscape

Several insurance products exist for gig workers in India. None of them solve the same problem GigGuard does.

| Product | Provider | What it covers | Why it falls short |
|---------|----------|---------------|-------------------|
| Gig worker accident cover | ACKO, Digit | Personal accident, hospitalisation | Requires claim filing. Does not cover income loss from weather or platform outages. |
| Platform-provided insurance | Swiggy Suraksha, Zomato cover | Accident, death benefit | Tied to a single platform. Workers lose coverage if they switch apps or go offline. |
| Pradhan Mantri Suraksha Bima | Government | Accidental death/disability | ₹20/year premium but covers only catastrophic events, not daily income disruption. |
| Microinsurance products | Various NBFCs | Variable | Require manual enrolment through agents, paper documentation, and branch visits. |

**The gap none of them fill:**
Every existing product either requires a claim to be filed after the fact, covers only catastrophic events (death, hospitalisation), or is tied to a single platform. None of them protect against the most common and frequent risk a delivery worker faces — losing a half-day of income because it rained too hard to ride safely.

GigGuard is the only platform that: (a) detects the disruption automatically, (b) pays out without any worker action, and (c) works regardless of which delivery app the worker uses.

---

## Guidewire Relevance

Guidewire is the operating system for the global P&C insurance industry. GigGuard is built on the same principles that make Guidewire valuable — structured policy management, automated claims adjudication, and data-driven underwriting — applied to a segment that traditional insurers have never been able to reach profitably.

**Where GigGuard aligns with Guidewire's core platform:**

**PolicyCenter** — GigGuard's modular policy cart mirrors the product configuration model in PolicyCenter. Each policy type (Monsoon Shield, Clean Air Guard, etc.) is a discrete insurance product with its own trigger conditions, coverage limits, and pricing rules. In a production deployment, these would be configured as PolicyCenter products, enabling insurers to manage them through existing workflows.

**ClaimCenter** — GigGuard's automated payout pipeline is parametric claims adjudication. The oracle threshold crossing is the first notice of loss. The fraud scorer is the adjudication engine. The RazorpayX transfer is the payment. In a Guidewire-integrated deployment, each payout event would create and close a ClaimCenter record automatically — giving insurers full audit trails without manual touchpoints.

**DataHub / Explore** — The zone-level risk data, payout frequency, and fraud signal data GigGuard generates is exactly the kind of structured operational data that Guidewire DataHub is designed to ingest and analyse. An insurer running GigGuard on top of Guidewire could use Explore dashboards to monitor loss ratios by city, policy type, and season in real time.

**The broader opportunity:**
Parametric insurance for gig workers is a wedge into a much larger market. The same oracle-and-trigger architecture can be extended to crop insurance for farmers (rainfall, drought), flight delay cover (live flight data), and supply chain disruption cover (port congestion, customs delays). GigGuard demonstrates that the Guidewire platform can power parametric products natively — not just traditional indemnity insurance.

---

## Data Privacy & Compliance

GigGuard handles sensitive personal data — Aadhaar numbers, biometric images, bank account details, and real-time location. We take compliance seriously, not as a legal checkbox but as a prerequisite for worker trust.

**Aadhaar usage:**
GigGuard uses the Aadhaar XML offline eKYC method, which does not require UIDAI Authentication User Agency (AUA) licensing. Workers generate and share a signed XML file directly from the UIDAI portal. GigGuard verifies the RSA-2048 cryptographic signature but never stores the raw Aadhaar number — only a tokenised identity reference is retained post-verification.

**Biometric data:**
Facial images captured during liveness checks are used solely for the one-time biometric match during KYC. They are not retained after verification is complete. No biometric template is stored on GigGuard servers.

**Location data:**
Real-time location is collected only during active payout validation — not continuously. Workers are informed of this at onboarding. Location data is not sold, shared with delivery platforms, or used for any purpose outside fraud detection.

**Regulatory framework:**
- Digital Personal Data Protection Act, 2023 (DPDP Act) — GigGuard's data minimisation approach (collect only what's needed, retain only what's necessary) is designed to comply with DPDP principles ahead of enforcement.
- RBI guidelines on payment aggregators — RazorpayX is a licensed payment aggregator. GigGuard does not store card or bank credentials directly.
- IRDAI sandbox — A production deployment would require IRDAI registration. The current build is scoped as a proof of concept for the hackathon. Sandbox application would be the first regulatory step post-hackathon.

---

## Assumptions & Limitations

No honest technical submission pretends everything is solved. Here is what GigGuard assumes to be true for the current build, and where the gaps are.

**Assumptions:**

- Workers have an Android smartphone with GPS, accelerometer, and internet connectivity. The platform does not currently support feature phones or iOS.
- The worker's registered zone is their primary operating area. A Chennai worker who travels to Bengaluru for a week would not receive payouts triggered by Bengaluru rain events unless they update their zone.
- OpenWeatherMap and CPCB data is accurate at the city/district level. Hyperlocal accuracy (street-level microweather) is outside the current oracle resolution.
- Razorpay Autopay consent is granted at onboarding. Workers without a UPI-linked bank account cannot use the platform.

**Known limitations:**

- **Zone granularity** — Oracle triggers currently operate at district level. A worker in a dry neighbourhood on the edge of a rain zone might not qualify for payout even if conditions on their route were dangerous. Hyperlocal weather data (IMD radar feeds, street-level sensors) would fix this but is not integrated yet.
- **Platform proof dependency** — The earnings SMS parsing for platform verification works for Swiggy, Zomato, and Amazon Flex. Other platforms with different SMS formats are not yet supported.
- **iOS** — The fraud detection layer relies on Android-specific APIs (isMockLocation, GnssStatus). An iOS version would require a different fraud signal architecture.
- **Actuarial data** — Premium pricing in the current build is based on publicly available weather and AQI historical data, not proprietary claims data. Pricing accuracy will improve significantly once GigGuard accumulates its own payout history.
- **IRDAI licensing** — The platform is not yet a licensed insurer. A production launch requires either partnering with a licensed insurer as an MGA or obtaining a standalone IRDAI licence.

