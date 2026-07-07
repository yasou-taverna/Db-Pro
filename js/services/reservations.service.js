import { apiGet, apiPost } from './api.service.js';
import { BOOKING_TIMES } from '../config/booking-times.js';

const memory = {
  reservations: []
};

export async function loadReservations() {
  const rows = await apiGet('getReservations');

  memory.reservations = Array.isArray(rows)
    ? rows
        .map(normalizeReservation)
        .filter(r => r.id || r.customerName || r.phone)
    : [];

  return memory.reservations;
}

export function getCachedReservations() {
  return memory.reservations;
}

export async function updateReservationStatus(id, status) {
  await apiPost({ action: 'updateReservationStatus', id, status });

  const item = memory.reservations.find(r => r.id === id);
  if (item) item.status = status;

  return item;
}

export function normalizeReservation(r) {
  const time = formatTimeValue(r.time);

  return {
    id: String(r.id || ''),
    customerName: String(r.customerName || r.name || ''),
    phone: String(r.phone || ''),
    date: formatDateValue(r.date),
    time,
    guests: Number(r.guests || 0),

    area: String(r.area || BOOKING_TIMES[time] || ''),
    tableId: String(r.tableId || ''),

    status: String(r.status || 'new'),
    notes: String(r.notes || ''),

    depositStatus: String(r.depositStatus || 'pending'),
    reservationType: String(r.reservationType || 'private'),

    receiptFileName: String(r.receiptFileName || ''),
    receiptUrl: String(r.receiptUrl || ''),

    source: String(r.source || ''),
    createdAt: String(r.createdAt || '')
  };
}

function formatDateValue(value) {
  if (!value) return '';

  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
    return value;
  }

  try {
    return new Date(value).toISOString().slice(0, 10);
  } catch (e) {
    return String(value);
  }
}

function formatTimeValue(value) {
  if (!value) return '';

  const str = String(value);

  if (/^\d{2}:\d{2}/.test(str)) {
    return str.slice(0, 5);
  }

  if (str.includes('T')) {
    const d = new Date(str);
    const hours = String(d.getUTCHours()).padStart(2, '0');
    const minutes = String(d.getUTCMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  return str.slice(0, 5);
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
    area: String(r.area || BOOKING_TIMES[time] || ''),
    tableId: String(r.tableId || ''),

    status: String(r.status || 'new'),
    notes: String(r.notes || ''),

    depositStatus: String(r.depositStatus || 'pending'),
    reservationType: String(r.reservationType || 'private'),

    receiptFileName: String(r.receiptFileName || ''),
    receiptUrl: String(r.receiptUrl || ''),

    source: String(r.source || ''),
    createdAt: String(r.createdAt || '')
  };
}

function formatDateValue(value) {
  if (!value) return '';

  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
    return value;
  }

  try {
    return new Date(value).toISOString().slice(0, 10);
  } catch (e) {
    return String(value);
  }
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
