# Group 4 Design System Specification — Personal Finance & Automated Savings Vaults

**Branch:** `feat/m02-grp-4`  
**Partner A:** Bitrus — System Shell, Navigation & Browse Views (**Balance Hero & Savings Vaults Grid**)  
**Partner B:** Special (`@christogun58-boop`) — Core Transaction, Modals & State Flows (**Create Vault Wizard, Auto-Save Toggles & Withdrawal Alert**)  
**Google Stitch Group Prototype URL:** _[Paste shared Group 4 Google Stitch prototype URL]_

---

## 1. Strict Component Ownership Split (Non-Overlapping)

| Track | Owner | Assigned Deliverables | Directory |
| :--- | :--- | :--- | :--- |
| **Partner A** | **Bitrus** | App Shell, Header/Nav, Balance Hero & Savings Vaults Grid | `partner-a-shell/` _(owned exclusively by Bitrus)_ |
| **Partner B** | **Special** | Create Vault Wizard (3-Step Modal), Auto-Save Toggles & Withdrawal Alert + Receipts | `partner-b-flows/` |
| **Controlled Overlap** | **Both Partners** | Shared 8pt Grid, 60-30-10 Color Tokens & Component Contract | `SPEC.md`, `tokens.css` |

> [!IMPORTANT]
> **Peer Merge Conflict Exercise Plan:** Both partners intentionally edit the **Controlled Overlap Zone** in `tokens.css` and Section 5 below on `feat/m02-grp-4` concurrently, then resolve the merge conflict cleanly using `git fetch origin && git merge origin/feat/m02-grp-4` so both Partner A's shell/grid tokens and Partner B's modal/wizard/toggle tokens are preserved without force-pushing.

---

## 2. 8pt Spatial Grid System

- **Base Rhythm:** `8px` (`8, 16, 24, 32, 48, 64px`) defined in [`tokens.css`](tokens.css).
- **4px Micro-Grid:** Permitted strictly for compact badge padding and icon-to-label alignment (`--space-1: 4px`).
- **Layout Grid:**
  - **Mobile (`< 768px`):** 4 columns, `16px` gutter, `16px` margin.
  - **Tablet (`>= 768px`):** 8 columns, `24px` gutter, `24px` margin.
  - **Desktop (`>= 1024px`):** 12 columns (`max-width: 1200px`), `24px` gutter, `32px` margin.
- **Interactive Target Floor:** Minimum `48px` height on all buttons, form controls, wizard steps, and switch rows.

---

## 3. 60-30-10 Color Architecture & Verified WCAG AA Contrast Audit

| Role | Share | Hex Token | Paired Foreground / Background | Contrast Ratio | WCAG AA Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Dominant / Neutral Canvas** | 60% | `#F8FAFC` / `#FFFFFF` | `#0F172A` on `#FFFFFF` | `17.85:1` | Yes |
| **Dominant / Secondary Copy** | 60% | `#475569` | `#475569` on `#FFFFFF` | `7.58:1` | Yes |
| **Secondary Structural Chrome** | 30% | `#1E293B` | `#FFFFFF` on `#1E293B` | `14.63:1` | Yes |
| **Secondary Structural Panel** | 30% | `#F1F5F9` | `#334155` on `#F1F5F9` | `9.45:1` | Yes |
| **Control Boundaries** | 30% | `#64748B` | `#64748B` border on `#FFFFFF` | `4.76:1` | Yes (`>= 3:1`) |
| **Accent / Primary CTA** | 10% | `#047857` | `#FFFFFF` on `#047857` | `5.48:1` | Yes |
| **Accent / Hover CTA** | 10% | `#065F46` | `#FFFFFF` on `#065F46` | `7.68:1` | Yes |
| **Accent / Active CTA** | 10% | `#064E3B` | `#FFFFFF` on `#064E3B` | `9.72:1` | Yes |
| **Accent Tint Surface** | 10% | `#ECFDF5` | `#065F46` on `#ECFDF5` | `7.29:1` | Yes |
| **Keyboard Focus Ring** | Accent | `#1D4ED8` | `#1D4ED8` on `#FFFFFF` | `6.70:1` | Yes (`>= 3:1`) |
| **Semantic: Warning / Alert** | Semantic | `#B45309` / `#FFFBEB` | `#FFFFFF` on `#B45309` / `#92400E` on `#FFFBEB` | `5.02:1` / `6.84:1` | Yes |
| **Semantic: Error / Penalty** | Semantic | `#B91C1C` / `#FEF2F2` | `#FFFFFF` on `#B91C1C` / `#991B1B` on `#FEF2F2` | `6.47:1` / `7.60:1` | Yes |
| **Disabled Controls** | State | `#E2E8F0` / `#475569` | `#475569` on `#E2E8F0` | `6.15:1` | Yes |

---

## 4. Five Interactive Component States

Every Partner B interactive element (primary/secondary/danger buttons, wizard inputs, cadence cards, `role="switch"` Auto-Save toggles, and modal actions) implements:
1. **Default** — Crisp resting `#64748B` borders and high-contrast ink.
2. **Hover** — Clear visual transition (`#065F46`, `#ECFDF5`, `#E2E8F0`).
3. **Focus** — High-contrast `3px solid #1D4ED8` `:focus-visible` ring (`6.70:1` on white) with `2px` offset.
4. **Active / Pressed** — Deepened fill (`#064E3B`) with `translateY(1px)` tactile press feedback.
5. **Disabled** — Desaturated `#E2E8F0` surface, `#94A3B8` border, `#475569` text (`6.15:1`), `cursor: not-allowed`.

---

## 5. Shared Component Contract (Controlled Overlap Section)

- **Partner B (`Special`) — Transaction, Modals & State Flows:**
  - `Create Vault Wizard`: 3-step modal flow (Goal & Target Amount validation → Lock Term & Auto-Save Cadence + optional APY promo code `SAVEPLUS` → Review & Confirmation Receipt).
  - `Auto-Save Toggles`: Accessible `role="switch"` toggles for Round-Up Spare Change, Payday 10% Split, Weekly Transfer, and Locked-Vault Maturity Guard (disabled state demonstration).
  - `Withdrawal Alert`: Early-withdrawal penalty modal displaying 2.5% early-break fee + accrued bonus forfeiture, requiring explicit acknowledgement before enabling the destructive confirmation action and issuing a withdrawal receipt.
- **Partner A (`Bitrus`) — System Shell, Navigation & Browse Views:**
  - _[Reserved for Partner A to add Balance Hero & Savings Vaults Grid integration contract during the controlled merge conflict step.]_
