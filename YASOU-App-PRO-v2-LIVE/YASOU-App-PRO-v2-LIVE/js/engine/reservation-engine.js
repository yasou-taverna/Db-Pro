import { BOOKING_TIMES } from '../config/booking-times.js';
import { RESTAURANT_RULES } from '../config/restaurant-rules.js';
import { assignTable } from './table-engine.js';

export function createReservation(formData, existingReservations = []) {
  const area = BOOKING_TIMES[formData.time] || '';
  const allocation = assignTable({
    area,
    guests: formData.guests,
    date: formData.date,
    time: formData.time,
    existingReservations
  });

  return {
    id: createId(),
    customerName: formData.customerName,
    phone: formData.phone,
    date: formData.date,
    time: formData.time,
    guests: Number(formData.guests),
    area,
    tableId: allocation.tableId,
    status: allocation.tableId ? 'new' : 'waiting',
    notes: formData.notes || '',
    depositStatus: RESTAURANT_RULES.depositStatusDefault,
    source: 'public-booking',
    createdAt: new Date().toISOString()
  };
}

function createId() {
  return 'r' + Date.now() + Math.random().toString(16).slice(2);
}
