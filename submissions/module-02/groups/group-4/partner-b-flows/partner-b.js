/**
 * Group 4 — Partner B (Special) Interactive Flows Controller
 * Manages:
 *  1. Auto-Save Toggles (role="switch")
 *  2. 3-Step Create Vault Wizard Modal (validation, promo boost, confirmation receipt)
 *  3. Early Withdrawal Alert Modal (penalty calculation, acknowledgement gate, receipt)
 */

(() => {
  let wizardStep = 1;
  let promoApplied = false;
  let receiptCount = 0;

  const TERM_LABELS = {
    flex: { label: 'Flexible Vault', apy: 4.5 },
    '90d': { label: '90-Day Fixed Lock', apy: 7.2 },
    '180d': { label: '180-Day Fixed Lock', apy: 9.0 }
  };

  // DOM References — Toggles
  const switches = Array.from(document.querySelectorAll('.switch[data-rule]'));
  const activeCountBadge = document.getElementById('autosave-active-count');
  const autosaveToast = document.getElementById('autosave-toast');

  // DOM References — Receipts
  const receiptsFeed = document.getElementById('receipts-feed');
  const receiptCountBadge = document.getElementById('receipt-count-badge');

  // DOM References — Create Vault Wizard
  const wizardBackdrop = document.getElementById('wizard-backdrop');
  const wizardForm = document.getElementById('wizard-form');
  const wizardStepLabel = document.getElementById('wizard-step-label');
  const wizardError = document.getElementById('wizard-error');
  const wizardPanes = Array.from(document.querySelectorAll('[data-wizard-pane]'));
  const wizardIndicators = Array.from(document.querySelectorAll('[data-wizard-indicator]'));
  const wizardBackBtn = document.getElementById('wizard-back-btn');
  const wizardNextBtn = document.getElementById('wizard-next-btn');
  const wizardSubmitBtn = document.getElementById('wizard-submit-btn');
  const vaultNameInput = document.getElementById('vaultName');
  const vaultTargetInput = document.getElementById('vaultTarget');
  const vaultTermSelect = document.getElementById('vaultTerm');
  const vaultCadenceSelect = document.getElementById('vaultCadence');
  const promoCodeInput = document.getElementById('promoCode');
  const applyPromoBtn = document.getElementById('apply-promo-btn');
  const promoFeedback = document.getElementById('promo-feedback');
  const wizardReviewSummary = document.getElementById('wizard-review-summary');

  // DOM References — Early Withdrawal Alert
  const withdrawalBackdrop = document.getElementById('withdrawal-backdrop');
  const withdrawalForm = document.getElementById('withdrawal-form');
  const withdrawAmountInput = document.getElementById('withdrawAmount');
  const penaltyBreakdown = document.getElementById('penalty-breakdown');
  const ackPenaltyCheckbox = document.getElementById('ackPenalty');
  const confirmWithdrawalBtn = document.getElementById('confirm-withdrawal-btn');

  // 1. Auto-Save Toggles
  function updateActiveToggleCount() {
    const active = switches.filter((s) => s.getAttribute('aria-checked') === 'true').length;
    activeCountBadge.textContent = `${active} Active Rule${active === 1 ? '' : 's'}`;
  }

  switches.forEach((sw) => {
    sw.addEventListener('click', () => {
      const next = sw.getAttribute('aria-checked') !== 'true';
      sw.setAttribute('aria-checked', String(next));

      const ruleKey = sw.dataset.rule;
      const badge = document.querySelector(`[data-status-for="${ruleKey}"]`);
      if (badge) {
        badge.className = next ? 'badge badge--accent' : 'badge badge--neutral';
        badge.textContent = next ? 'Active' : 'Paused';
      }

      const labelEl = document.getElementById(sw.getAttribute('aria-labelledby'));
      autosaveToast.textContent = `${labelEl ? labelEl.textContent : 'Auto-save rule'} is now ${next ? 'Active' : 'Paused'}.`;
      autosaveToast.classList.remove('hidden');
      updateActiveToggleCount();
    });
  });

  // Shared Receipt Feed Helper
  function addReceipt({ title, badgeText, badgeClass, detail }) {
    if (receiptCount === 0) {
      receiptsFeed.innerHTML = '';
    }
    receiptCount += 1;
    receiptCountBadge.textContent = `${receiptCount} Event${receiptCount === 1 ? '' : 's'}`;

    const card = document.createElement('div');
    card.className = 'receipt-entry';

    const top = document.createElement('div');
    top.className = 'receipt-entry__top';

    const titleEl = document.createElement('strong');
    titleEl.textContent = title;

    const badge = document.createElement('span');
    badge.className = `badge ${badgeClass}`;
    badge.textContent = badgeText;

    top.append(titleEl, badge);

    const detailEl = document.createElement('p');
    detailEl.className = 'card__desc';
    detailEl.textContent = detail;

    card.append(top, detailEl);
    receiptsFeed.prepend(card);
  }

  // 2. Create Vault Wizard
  function renderWizardStep() {
    const titles = {
      1: 'Step 1 of 3 — Goal Name & Target Amount',
      2: 'Step 2 of 3 — Lock Term, Auto-Save Schedule & Promo Boost',
      3: 'Step 3 of 3 — Review Vault Configuration'
    };
    wizardStepLabel.textContent = titles[wizardStep];
    wizardError.classList.add('hidden');

    wizardPanes.forEach((pane) => {
      pane.classList.toggle('hidden', Number(pane.dataset.wizardPane) !== wizardStep);
    });

    wizardIndicators.forEach((ind) => {
      const n = Number(ind.dataset.wizardIndicator);
      ind.classList.remove('is-current', 'is-done');
      if (n < wizardStep) ind.classList.add('is-done');
      if (n === wizardStep) ind.classList.add('is-current');
    });

    wizardBackBtn.classList.toggle('hidden', wizardStep === 1);
    wizardNextBtn.classList.toggle('hidden', wizardStep === 3);
    wizardSubmitBtn.classList.toggle('hidden', wizardStep !== 3);

    if (wizardStep === 3) {
      const term = TERM_LABELS[vaultTermSelect.value] || TERM_LABELS['90d'];
      const effectiveApy = (term.apy + (promoApplied ? 0.8 : 0)).toFixed(1);
      wizardReviewSummary.innerHTML = '';

      const rows = [
        ['Vault Name', vaultNameInput.value.trim()],
        ['Target Goal', `$${Number(vaultTargetInput.value).toLocaleString()}`],
        ['Lock Period', term.label],
        ['Auto-Save Rule', vaultCadenceSelect.value],
        ['Effective APY', `${effectiveApy}%${promoApplied ? ' (SAVEPLUS +0.8%)' : ''}`]
      ];

      rows.forEach(([k, v]) => {
        const row = document.createElement('div');
        row.className = 'review-row';
        const label = document.createElement('span');
        label.textContent = k;
        const val = document.createElement('strong');
        val.textContent = v;
        row.append(label, val);
        wizardReviewSummary.appendChild(row);
      });
    }
  }

  function openWizard() {
    wizardStep = 1;
    promoApplied = false;
    wizardForm.reset();
    promoFeedback.textContent = '';
    renderWizardStep();
    wizardBackdrop.classList.remove('hidden');
    vaultNameInput.focus();
  }

  document.getElementById('open-wizard-btn').addEventListener('click', openWizard);
  document.getElementById('open-wizard-btn-card').addEventListener('click', openWizard);

  applyPromoBtn.addEventListener('click', () => {
    const code = promoCodeInput.value.trim().toUpperCase();
    if (code === 'SAVEPLUS') {
      promoApplied = true;
      promoFeedback.textContent = 'Promo applied: +0.8% APY boost added to your vault.';
    } else {
      promoApplied = false;
      promoFeedback.textContent = 'Invalid promo code. Try SAVEPLUS for a +0.8% APY boost.';
    }
  });

  wizardNextBtn.addEventListener('click', () => {
    if (wizardStep === 1) {
      const name = vaultNameInput.value.trim();
      const target = Number(vaultTargetInput.value);
      if (name.length < 2) {
        wizardError.textContent = 'Please enter a vault name (at least 2 characters).';
        wizardError.classList.remove('hidden');
        return;
      }
      if (!Number.isFinite(target) || target < 50) {
        wizardError.textContent = 'Target amount must be at least $50.';
        wizardError.classList.remove('hidden');
        return;
      }
    }
    wizardStep = Math.min(3, wizardStep + 1);
    renderWizardStep();
  });

  wizardBackBtn.addEventListener('click', () => {
    wizardStep = Math.max(1, wizardStep - 1);
    renderWizardStep();
  });

  wizardForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const term = TERM_LABELS[vaultTermSelect.value] || TERM_LABELS['90d'];
    const apy = (term.apy + (promoApplied ? 0.8 : 0)).toFixed(1);
    const refId = `VLT-${Date.now().toString().slice(-5)}`;

    addReceipt({
      title: `Vault Created: ${vaultNameInput.value.trim()} (${refId})`,
      badgeText: `${apy}% APY Active`,
      badgeClass: 'badge--accent',
      detail: `Goal $${Number(vaultTargetInput.value).toLocaleString()} · ${term.label} · Auto-save ${vaultCadenceSelect.value}`
    });

    wizardBackdrop.classList.add('hidden');
  });

  // 3. Early Withdrawal Alert Modal
  function renderPenaltyBreakdown() {
    const amount = Math.max(0, Math.min(2000, Number(withdrawAmountInput.value) || 0));
    const fee = +(amount * 0.025).toFixed(2);
    const netPayout = +(amount - fee).toFixed(2);

    penaltyBreakdown.innerHTML = '';
    const rows = [
      ['Requested Withdrawal', `$${amount.toFixed(2)}`],
      ['2.5% Early-Break Penalty', `-$${fee.toFixed(2)}`],
      ['Promo Bonus Forfeited', '-$14.50 (Accrued APY Boost)'],
      ['Estimated Net Payout', `$${netPayout.toFixed(2)}`]
    ];

    rows.forEach(([k, v]) => {
      const row = document.createElement('div');
      row.className = 'review-row';
      const label = document.createElement('span');
      label.textContent = k;
      const val = document.createElement('strong');
      val.textContent = v;
      row.append(label, val);
      penaltyBreakdown.appendChild(row);
    });

    confirmWithdrawalBtn.disabled = !(ackPenaltyCheckbox.checked && amount >= 10 && amount <= 2000);
  }

  function openWithdrawalModal() {
    ackPenaltyCheckbox.checked = false;
    withdrawAmountInput.value = '500';
    renderPenaltyBreakdown();
    withdrawalBackdrop.classList.remove('hidden');
    withdrawAmountInput.focus();
  }

  document.getElementById('open-withdrawal-btn').addEventListener('click', openWithdrawalModal);
  document.getElementById('open-withdrawal-btn-card').addEventListener('click', openWithdrawalModal);
  withdrawAmountInput.addEventListener('input', renderPenaltyBreakdown);
  ackPenaltyCheckbox.addEventListener('change', renderPenaltyBreakdown);

  withdrawalForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = Number(withdrawAmountInput.value);
    const fee = (amount * 0.025).toFixed(2);
    const net = (amount - Number(fee)).toFixed(2);
    const refId = `WDR-${Date.now().toString().slice(-5)}`;

    addReceipt({
      title: `Early Withdrawal Confirmed (${refId})`,
      badgeText: 'Penalty Applied',
      badgeClass: 'badge--warning',
      detail: `Gross $${amount.toFixed(2)} · 2.5% Fee -$${fee} · Net Payout $${net} to Checking`
    });

    withdrawalBackdrop.classList.add('hidden');
  });

  // Close Modals (Button, Backdrop click, Escape key)
  document.querySelectorAll('[data-close-modal]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.dataset.closeModal === 'wizard') wizardBackdrop.classList.add('hidden');
      if (btn.dataset.closeModal === 'withdrawal') withdrawalBackdrop.classList.add('hidden');
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      wizardBackdrop.classList.add('hidden');
      withdrawalBackdrop.classList.add('hidden');
    }
  });

  updateActiveToggleCount();
})();
