/**
 * Telemedicine Triage & Patient Booking Hub — Client Controller
 * Connects UI to POST /api/triage, POST /api/bookings, and GET /api/bookings.
 */

(() => {
  const CLINICIAN_SLOTS = [
    {
      label: 'Today, In 25 mins — Dr. Amara Okafor (Urgent Care · Video)',
      clinician: 'Dr. Amara Okafor, MD',
      specialty: 'Urgent Care',
      time: 'Today, In 25 mins',
      modality: 'video',
      priorityMatch: ['YELLOW']
    },
    {
      label: 'Today, In 50 mins — Dr. Samuel Adeyemi (Internal Medicine · Video)',
      clinician: 'Dr. Samuel Adeyemi, MD',
      specialty: 'Internal Medicine',
      time: 'Today, In 50 mins',
      modality: 'video',
      priorityMatch: ['YELLOW', 'GREEN']
    },
    {
      label: 'Today, 2:30 PM — Dr. Priya Nair (Urgent Care · Audio)',
      clinician: 'Dr. Priya Nair, DO',
      specialty: 'Urgent Care',
      time: 'Today, 2:30 PM',
      modality: 'audio',
      priorityMatch: ['YELLOW'],
      presetBooked: true // Demonstrates Disabled state out of the box
    },
    {
      label: 'Today, 4:00 PM — Dr. Elena Rostova (General Practice · Video)',
      clinician: 'Dr. Elena Rostova, MD',
      specialty: 'General Practice',
      time: 'Today, 4:00 PM',
      modality: 'video',
      priorityMatch: ['GREEN', 'YELLOW']
    },
    {
      label: 'Today, 5:15 PM — Dr. Marcus Vance (Family Medicine · Audio)',
      clinician: 'Dr. Marcus Vance, MD',
      specialty: 'Family Medicine',
      time: 'Today, 5:15 PM',
      modality: 'audio',
      priorityMatch: ['GREEN']
    },
    {
      label: 'Tomorrow, 9:30 AM — Dr. Hannah Mensah (Dermatology · Chat)',
      clinician: 'Dr. Hannah Mensah, MD',
      specialty: 'Dermatology & General Care',
      time: 'Tomorrow, 9:30 AM',
      modality: 'chat',
      priorityMatch: ['GREEN']
    },
    {
      label: 'Tomorrow, 11:00 AM — Dr. David Chen (Family Medicine · Chat)',
      clinician: 'Dr. David Chen, MD',
      specialty: 'Family Medicine',
      time: 'Tomorrow, 11:00 AM',
      modality: 'chat',
      priorityMatch: ['GREEN']
    }
  ];

  const PRIORITY_STYLE = {
    RED: { classSuffix: 'emergency', title: 'RED Priority — Emergency Escalation' },
    YELLOW: { classSuffix: 'urgent', title: 'YELLOW Priority — Urgent Teleconsultation' },
    GREEN: { classSuffix: 'standard', title: 'GREEN Priority — Routine Care' }
  };

  const state = {
    triage: null,
    evaluatedSymptoms: [],
    selectedModality: 'all',
    selectedSlotLabel: null,
    bookings: []
  };

  // DOM References
  const triageForm = document.getElementById('triage-form');
  const triageSubmitBtn = document.getElementById('triage-submit-btn');
  const triageResetBtn = document.getElementById('triage-reset-btn');
  const triageError = document.getElementById('triage-error');

  const step1 = document.getElementById('step-1');
  const step2 = document.getElementById('step-2');
  const step3 = document.getElementById('step-3');

  const resultTierBadge = document.getElementById('result-tier-badge');
  const triageEmptyState = document.getElementById('triage-empty-state');
  const triageResultPanel = document.getElementById('triage-result-panel');
  const triageAlertBox = document.getElementById('triage-alert-box');
  const triageActionTitle = document.getElementById('triage-action-title');
  const triageActionBody = document.getElementById('triage-action-body');
  const triageBookingStatus = document.getElementById('triage-booking-status');
  const triageRefText = document.getElementById('triage-ref-text');
  const triageSymptomsList = document.getElementById('triage-symptoms-list');

  const bookingSubtitle = document.getElementById('booking-subtitle');
  const bookingStepBadge = document.getElementById('booking-step-badge');
  const bookingLockedBanner = document.getElementById('booking-locked-banner');
  const bookingEmergencyBanner = document.getElementById('booking-emergency-banner');
  const bookingControls = document.getElementById('booking-controls');
  const filterTabs = Array.from(document.querySelectorAll('.filter-tab'));
  const slotsGrid = document.getElementById('slots-grid');

  const bookingForm = document.getElementById('booking-form');
  const bookingError = document.getElementById('booking-error');
  const patientPhoneInput = document.getElementById('patientPhone');
  const confirmBookingBtn = document.getElementById('confirm-booking-btn');
  const selectedSlotHint = document.getElementById('selected-slot-hint');

  const receiptCard = document.getElementById('receipt-card');
  const receiptDetails = document.getElementById('receipt-details');
  const queueCountBadge = document.getElementById('queue-count-badge');
  const queueList = document.getElementById('queue-list');

  function updateStepper(activeStep) {
    [step1, step2, step3].forEach((el, index) => {
      const stepNum = index + 1;
      el.classList.remove('is-current', 'is-complete');
      if (stepNum < activeStep) {
        el.classList.add('is-complete');
      } else if (stepNum === activeStep) {
        el.classList.add('is-current');
      }
    });
  }

  function showAlert(el, message) {
    el.textContent = message;
    el.classList.remove('hidden');
  }

  function clearAlert(el) {
    el.textContent = '';
    el.classList.add('hidden');
  }

  function isSlotBooked(slot) {
    return Boolean(slot.presetBooked || state.bookings.some((b) => b.slot === slot.label));
  }

  function renderTriageResult(triage) {
    const meta = PRIORITY_STYLE[triage.priority] || PRIORITY_STYLE.GREEN;

    triageEmptyState.classList.add('hidden');
    triageResultPanel.classList.remove('hidden');

    resultTierBadge.className = `badge badge--${meta.classSuffix}`;
    resultTierBadge.textContent = triage.priority;

    triageAlertBox.className = `alert alert--${meta.classSuffix}`;
    triageActionTitle.textContent = meta.title;
    triageActionBody.textContent = triage.action;

    triageBookingStatus.className = triage.allowOnlineBooking
      ? 'badge badge--standard'
      : 'badge badge--emergency';
    triageBookingStatus.textContent = triage.allowOnlineBooking ? 'Enabled' : 'Locked (ER Only)';

    triageRefText.textContent = `Patient: ${triage.patientName}`;

    triageSymptomsList.innerHTML = '';
    state.evaluatedSymptoms.forEach((item) => {
      const li = document.createElement('li');
      li.className = 'factor-list__item';

      const textSpan = document.createElement('span');
      textSpan.textContent = item;

      const tagSpan = document.createElement('span');
      tagSpan.className = 'factor-list__impact';
      tagSpan.textContent = triage.priority;

      li.append(textSpan, tagSpan);
      triageSymptomsList.appendChild(li);
    });
  }

  function updateBookingButtonState() {
    const hasSlot = Boolean(state.selectedSlotLabel);
    const hasPhone = patientPhoneInput.value.trim().length >= 5;
    const allowed = Boolean(state.triage && state.triage.allowOnlineBooking);

    confirmBookingBtn.disabled = !(allowed && hasSlot && hasPhone);

    selectedSlotHint.textContent = hasSlot
      ? `Selected: ${state.selectedSlotLabel}`
      : 'Select an available slot above to enable booking.';
  }

  function renderSlots() {
    slotsGrid.innerHTML = '';
    const priority = state.triage ? state.triage.priority : 'GREEN';

    const visible = CLINICIAN_SLOTS.filter((slot) =>
      state.selectedModality === 'all' ? true : slot.modality === state.selectedModality
    ).sort((a, b) => {
      const aBooked = isSlotBooked(a);
      const bBooked = isSlotBooked(b);
      if (aBooked !== bBooked) return aBooked ? 1 : -1;
      const aRec = a.priorityMatch.includes(priority);
      const bRec = b.priorityMatch.includes(priority);
      if (aRec !== bRec) return aRec ? -1 : 1;
      return 0;
    });

    if (visible.length === 0) {
      const emptyMsg = document.createElement('p');
      emptyMsg.className = 'card__desc';
      emptyMsg.textContent = 'No consultation slots match this modality filter.';
      slotsGrid.appendChild(emptyMsg);
      return;
    }

    visible.forEach((slot) => {
      const booked = isSlotBooked(slot);
      const recommended = slot.priorityMatch.includes(priority);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'slot-card';
      btn.disabled = booked;
      btn.setAttribute('aria-pressed', String(state.selectedSlotLabel === slot.label));

      const topRow = document.createElement('div');
      topRow.className = 'slot-card__top';

      const docTitle = document.createElement('p');
      docTitle.className = 'slot-card__doc';
      docTitle.textContent = slot.clinician;

      const statusBadge = document.createElement('span');
      if (booked) {
        statusBadge.className = 'badge badge--neutral';
        statusBadge.textContent = 'Booked';
      } else if (recommended) {
        statusBadge.className = 'badge badge--accent';
        statusBadge.textContent = 'Priority Match';
      } else {
        statusBadge.className = 'badge badge--standard';
        statusBadge.textContent = 'Available';
      }

      topRow.append(docTitle, statusBadge);

      const meta = document.createElement('p');
      meta.className = 'slot-card__meta';
      meta.textContent = slot.specialty;

      const footer = document.createElement('div');
      footer.className = 'slot-card__footer';

      const timeSpan = document.createElement('span');
      timeSpan.textContent = slot.time;

      const modalitySpan = document.createElement('span');
      modalitySpan.className = 'badge badge--neutral';
      modalitySpan.textContent = slot.modality.toUpperCase();

      footer.append(timeSpan, modalitySpan);
      btn.append(topRow, meta, footer);

      if (!booked) {
        btn.addEventListener('click', () => {
          state.selectedSlotLabel = slot.label;
          clearAlert(bookingError);
          renderSlots();
          updateBookingButtonState();
        });
      }

      slotsGrid.appendChild(btn);
    });
  }

  function renderBookingReceipt(booking) {
    receiptCard.classList.remove('hidden');
    receiptDetails.innerHTML = '';

    const entries = [
      ['Booking ID', booking.id],
      ['Status', booking.status],
      ['Patient', booking.patientName],
      ['Phone', booking.phone],
      ['Priority', booking.priority],
      ['Consultation Slot', booking.slot]
    ];

    entries.forEach(([label, value]) => {
      const box = document.createElement('div');
      box.className = 'receipt-item';

      const labelEl = document.createElement('span');
      labelEl.className = 'receipt-item__label';
      labelEl.textContent = label;

      const valueEl = document.createElement('span');
      valueEl.className = 'receipt-item__value';
      valueEl.textContent = value;

      box.append(labelEl, valueEl);
      receiptDetails.appendChild(box);
    });
  }

  function renderClinicQueue() {
    queueCountBadge.textContent = `${state.bookings.length} Booked`;
    queueList.innerHTML = '';

    if (state.bookings.length === 0) {
      const li = document.createElement('li');
      li.className = 'factor-list__item';
      const msg = document.createElement('span');
      msg.textContent = 'No appointments booked yet.';
      const dash = document.createElement('span');
      dash.className = 'factor-list__impact';
      dash.textContent = '—';
      li.append(msg, dash);
      queueList.appendChild(li);
      return;
    }

    state.bookings.slice().reverse().forEach((b) => {
      const li = document.createElement('li');
      li.className = 'factor-list__item';

      const info = document.createElement('span');
      info.textContent = `${b.patientName} · ${b.slot}`;

      const badge = document.createElement('span');
      const style = PRIORITY_STYLE[b.priority] || PRIORITY_STYLE.GREEN;
      badge.className = `badge badge--${style.classSuffix}`;
      badge.textContent = b.priority;

      li.append(info, badge);
      queueList.appendChild(li);
    });
  }

  async function refreshBookings() {
    try {
      const res = await fetch('/api/bookings');
      if (!res.ok) return;
      const data = await res.json();
      state.bookings = data.bookings || [];
      renderClinicQueue();
      if (state.triage && state.triage.allowOnlineBooking) {
        renderSlots();
        updateBookingButtonState();
      }
    } catch {
      // Non-fatal background sync error
    }
  }

  // Handle Step 1: Triage Submission
  triageForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearAlert(triageError);
    clearAlert(bookingError);

    const formData = new FormData(triageForm);
    const patientName = String(formData.get('patientName') || '').trim();
    const checkedSymptoms = formData.getAll('symptoms').map(String);
    const notes = String(formData.get('notes') || '').trim();
    const symptoms = notes ? [...checkedSymptoms, notes] : [...checkedSymptoms];

    if (!patientName) {
      showAlert(triageError, 'Please enter the patient full name.');
      return;
    }

    if (symptoms.length === 0) {
      showAlert(triageError, 'Please select at least one symptom or enter notes before evaluating triage.');
      return;
    }

    triageSubmitBtn.disabled = true;
    triageSubmitBtn.textContent = 'Evaluating Symptoms...';

    try {
      const response = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientName, symptoms })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to evaluate triage.');
      }

      state.triage = data;
      state.evaluatedSymptoms = symptoms;
      state.selectedSlotLabel = null;

      renderTriageResult(data);
      bookingLockedBanner.classList.add('hidden');

      if (!data.allowOnlineBooking) {
        updateStepper(2);
        bookingEmergencyBanner.classList.remove('hidden');
        bookingControls.classList.add('hidden');
        bookingStepBadge.className = 'badge badge--emergency';
        bookingStepBadge.textContent = 'RED Escalation';
        bookingSubtitle.textContent = 'Emergency symptoms detected — online booking is locked for safety.';
      } else {
        updateStepper(3);
        bookingEmergencyBanner.classList.add('hidden');
        bookingControls.classList.remove('hidden');
        bookingStepBadge.className =
          data.priority === 'YELLOW' ? 'badge badge--urgent' : 'badge badge--standard';
        bookingStepBadge.textContent = `${data.priority} Priority`;
        bookingSubtitle.textContent =
          data.priority === 'YELLOW'
            ? 'Urgent priority unlocked — same-day teleconsultation slots within 2 hours are highlighted.'
            : 'Routine booking unlocked — choose any convenient consultation slot below.';
        renderSlots();
        updateBookingButtonState();
      }
    } catch (err) {
      showAlert(triageError, err.message);
    } finally {
      triageSubmitBtn.disabled = false;
      triageSubmitBtn.textContent = 'Evaluate Triage Priority';
    }
  });

  // Handle Reset Assessment
  triageResetBtn.addEventListener('click', () => {
    triageForm.reset();
    clearAlert(triageError);
    clearAlert(bookingError);

    state.triage = null;
    state.evaluatedSymptoms = [];
    state.selectedSlotLabel = null;
    state.selectedModality = 'all';

    updateStepper(1);
    resultTierBadge.className = 'badge badge--neutral';
    resultTierBadge.textContent = 'Pending';
    triageEmptyState.classList.remove('hidden');
    triageResultPanel.classList.add('hidden');

    bookingLockedBanner.classList.remove('hidden');
    bookingEmergencyBanner.classList.add('hidden');
    bookingControls.classList.add('hidden');
    bookingStepBadge.className = 'badge badge--neutral';
    bookingStepBadge.textContent = 'Awaiting Triage';
    bookingSubtitle.textContent =
      'Complete Step 1 triage first to unlock slot selection and appointment confirmation.';

    filterTabs.forEach((tab) => {
      tab.setAttribute('aria-selected', String(tab.dataset.modality === 'all'));
    });

    updateBookingButtonState();
  });

  // Handle Modality Filter Tabs
  filterTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      state.selectedModality = tab.dataset.modality || 'all';
      filterTabs.forEach((t) => {
        t.setAttribute('aria-selected', String(t === tab));
      });
      renderSlots();
    });
  });

  patientPhoneInput.addEventListener('input', updateBookingButtonState);

  // Handle Booking Submission (POST /api/bookings)
  bookingForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearAlert(bookingError);

    if (!state.triage || !state.selectedSlotLabel) {
      showAlert(bookingError, 'Please select an available consultation slot first.');
      return;
    }

    confirmBookingBtn.disabled = true;
    confirmBookingBtn.textContent = 'Confirming Booking...';

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: state.triage.patientName,
          phone: patientPhoneInput.value.trim(),
          priority: state.triage.priority,
          slot: state.selectedSlotLabel
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Could not confirm your appointment.');
      }

      renderBookingReceipt(data.booking);
      state.selectedSlotLabel = null;
      bookingForm.reset();
      await refreshBookings();
    } catch (err) {
      showAlert(bookingError, err.message);
    } finally {
      confirmBookingBtn.textContent = 'Confirm Consultation Slot';
      updateBookingButtonState();
    }
  });

  updateStepper(1);
  refreshBookings();
})();
