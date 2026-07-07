import { PUBLIC_TIMES } from '../../js/config/booking-times.js';
import { createReservation } from '../../js/engine/reservation-engine.js';
import { postReservation } from './booking-api.js';
import { validateBookingForm } from './validator.js';

const $ = (id) => document.getElementById(id);
const state = { draft: null };

$('date').valueAsDate = new Date();

/* מונע כפילות אם כבר יש options ב-HTML */
if ($('guests').children.length <= 1) {
  for (let i = 1; i <= 12; i++) {
    $('guests').innerHTML += `<option value="${i}">${i}</option>`;
  }
}

if ($('time').children.length <= 1) {
  PUBLIC_TIMES.forEach((time) => {
    $('time').innerHTML += `<option value="${time}">${time}</option>`;
  });
}

$('continueBtn').addEventListener('click', () => {
  $('errorBox').textContent = '';

  const formData = getFormData();
  const errors = validateBookingForm(formData, $('agree').checked);

  if (errors.length) {
    $('errorBox').innerHTML = errors.join('<br>');
    return;
  }

  state.draft = createReservation(formData);

  $('summaryBox').innerHTML = `
    <strong>שם:</strong> ${state.draft.customerName}<br>
    <strong>טלפון:</strong> ${state.draft.phone}<br>
    <strong>תאריך:</strong> ${state.draft.date}<br>
    <strong>שעה:</strong> ${state.draft.time}<br>
    <strong>סועדים:</strong> ${state.draft.guests}<br>
    <strong>סוג הזמנה:</strong> ${getReservationTypeLabel(state.draft.reservationType)}<br>
    <strong>פיקדון:</strong> ממתין לתשלום
  `;

  $('stepForm').classList.add('hidden');
  $('stepPayment').classList.remove('hidden');
});

$('backBtn').addEventListener('click', () => {
  $('stepPayment').classList.add('hidden');
  $('stepForm').classList.remove('hidden');
});

$('submitBtn').addEventListener('click', async () => {
  $('paymentErrorBox').textContent = '';

  if (!state.draft) return;

  $('submitBtn').disabled = true;
  $('submitBtn').textContent = 'שולח...';

  try {
    await postReservation(state.draft);
    window.location.href = 'success.html';
  } catch (err) {
    $('paymentErrorBox').textContent = 'אירעה שגיאה בשליחת ההזמנה. נסה שוב.';
    $('submitBtn').disabled = false;
    $('submitBtn').textContent = 'שליחת ההזמנה';
  }
});

function getFormData() {
  return {
    customerName: $('customerName').value.trim(),
    phone: $('phone').value.trim(),
    date: $('date').value,
    time: $('time').value,
    guests: Number($('guests').value),
    reservationType: $('reservationType').value,
    notes: $('notes').value.trim()
  };
}

function getReservationTypeLabel(type) {
  if (type === 'group') return 'הזמנה כקבוצה';
  return 'הזמנה פרטית';
}
