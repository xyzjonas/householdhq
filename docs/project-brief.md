Product Requirements Document (PRD): Apex Neo-Fintech & Budget HQ
Document Version: 1.0
Status: Approved / Active Specification
Design System: Apex Neo-Fintech (PLUS_JAKARTA_SANS, #0f172a primary slate theme)
Target Form Factors: Responsive Web Dashboard (Desktop 1440px+) & Mobile Native / PWA (390px iOS/Android)

1. Executive Summary & Vision
1.1 Problem Statement
Legacy personal finance tools (such as the legacy Household HQ v0.8.27 application) frequently overwhelm users with distracting, low-utility visualizations (e.g. rigid donut charts) while failing to deliver actionable day-to-day liquidity visibility. Users struggle to track split-category single-store purchases (such as hypermarkets selling groceries, electronics, medicine, and household goods together) and lack clarity on upcoming committed obligations versus truly safe unallocated funds.

1.2 Product Vision
Transform the household budgeting experience into an ultra-responsive, high-trust neo-fintech operating system inspired by Revolut and modern European banking standards. The platform balances high-level net worth tracking with rapid, frictionless micro-budgeting and granular receipt itemization.

2. Target Personas & Core Use Cases
2.1 Personas
Household Financial Lead (e.g. Alex Vance): Oversees multi-account liquidity, scheduled household liabilities (mortgage, energy bills, municipal water fees, maintenance), and long-term portfolio allocation.

Day-to-day Consumer & Shopper: Needs instant entry for daily card and cash spendings, fast receipt itemization during multi-category superstore trips (e.g. Globus, Lidl, Tesco), and immediate feedback on monthly category caps.

2.2 Core User Scenarios
Scenario A: Daily Liquidity Check: Rapidly glance at active liquid checking balance (11,651 Kč) and projected end-of-month surplus (9,920 Kč) without cognitive overhead.

Scenario B: Upcoming Bill Management: Track prioritized obligations due in the next 3–30 days (water utility, vignette toll, recuperation filter replacement), with the ability to sync or unpin them from the main transaction stream.

Scenario C: Mixed-Basket Hypermarket Receipt Splitting: Take a physical/digital receipt totaling 2,480.00 Kč and divide it into exact functional buckets (Groceries, Pharmacy, Household, Leisure) with an integrated calculation pad.

3. Key Feature Specifications & Architecture
3.1 Account & Portfolio Architecture
Multi-Pillar Balance Overview:

Bank Accounts (Účet): Real-time aggregated balance across active checking accounts.

Physical Cash (Hotovost): Manual physical wallet and safe ledger.

Savings & Vaults (Spoření): High-yield emergency reserve and targets.

Investments (Investice): Global equity core, ETFs, and long-term pillars.

Visual Distribution: Multi-segment portfolio allocation bar showing relative weighting (e.g., 6.5% Cash/Bank, 25.1% Savings, 67.0% Investments) replacing legacy circular graphs.

3.2 Forecasting & Safe Allowance Engine
Projected End-of-Period Surplus: Calculated based on settled expenses, recurring commitments, and burn velocity (Current burn rate: 512 Kč/day vs budgeted ceiling).

Safe Allowance Metric: Explicit callout of unallocated safe-to-spend buffer (e.g. +1,731 Kč safely unallocated).

3.3 Priority Liabilities & Upcoming Feed
Standalone transaction entries (without heavy enclosing border boxes) featuring:

Urgency indicators (High priority, Scheduled, Pending approval, Due in X days).

Direct contextual actions (Pay Now, Defer, Edit, Details).

User toggle switch: Sync & pin in main feed / Include in cashflow line.

3.4 Master Transaction Ledger
Segmented filtering (All, Inflows / In, Expenses / Out, Household, Utilities).

Date-grouped accordions (November 2026 (Settled), October 2026 (Archived)).

Monthly Category Consumption Caps with real-time progression:

Housing & Mortgages (e.g. 100% committed)

Energy & Heating (e.g. 88.4% used)

Groceries & Pantry (e.g. 67.8% used)

Transport & Fuel (e.g. 87.2% used)

3.5 Manual Receipt Itemization & Rapid Calculator
Header Reconciliation: Store name, date, account tag, and dynamic allocation tracker showing Allocated Amount vs Remaining Amount with visual error states if unallocated > 0.

Category Summary Tiles: Auto-aggregates line items into distinct buckets with percentage distributions:

Groceries & Food

Pharmacy & Care (OTC / Prescriptions)

Household & Chemicals

Party & Leisure

Integrated Calculator Pad:

Direct calculation formula tape (85 + 45 + 120 = 250.00 Kč).

Arithmetic operators (+, -, *, /, decimal, backspace, clear).

Shortcut action: Rest (Remaining Amount) button to auto-populate unallocated balance.

Category selector chips for 1-tap categorization.

Reconciliation Utilities:

Divide remaining unallocated evenly (auto-distributes residual funds).

Double-entry validation audit badge and receipt serial binding.

4. Technical Design System & Layout System
4.1 Design Tokens
Typography: Plus Jakarta Sans (weights 400, 500, 600, 700, 800).

Color System (Light Theme Neo-Fintech):

Primary: Slate 900 (#0f172a) for dominant structural actions and primary figures.

Background: Tinted soft cool surface (#f8f9ff).

Secondary / Accents: Muted teal/slate secondary tokens avoiding hyper-saturated neon tones.

Status: Restrained crimson for debits/urgent dues (#ef4444 / #b91c1c), calm emerald for income (#10b981).

Corner Radii: Standard ROUND_EIGHT (rounded-xl to rounded-2xl on cards).

4.2 Form Factors & Screen Registry
Desktop Budget Overview (Screen {{DATA:SCREEN:SCREEN_4}}):

Shell: Two-column layout with fixed left sidebar navigation and upper contextual search/actions bar.

Central work surface: High-level liquidity metrics, portfolio balance tiles, upcoming bills, master ledger, and monthly category budget tracking bars.

Mobile Budget Overview (Screen {{DATA:SCREEN:SCREEN_6}}):

Shell: Standard mobile tab bar (Accounts, Analytics, Cards, Transfers, Hub).

Compact vertical stack with swipeable portfolio cards, quick action pills, upcoming liability cards, and grouped feeds.

Manual Receipt Split (Screen {{DATA:SCREEN:SCREEN_2}}):

Shell: Mobile modal stack view with back header navigation.

Dual-zone interface: scrollable category summary & itemization list, anchored with an ergonomic rapid calculator pad and primary finalization CTA.

5. Roadmap & Future Scope

Phase 3 (Multi-Currency Vaults): Support for EUR, USD, and CZK accounts with live mid-market exchange conversions.

Phase 4 (Shared Household Sync): Multi-member permissions allowing household partners to claim individual split items.


