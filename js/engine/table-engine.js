import { TABLES } from '../config/tables.js';

export function assignTable({ area, guests, date, time, existingReservations = [] }) {
  const taken = new Set(
    existingReservations
      .filter(r => r.date === date && r.time === time && r.status !== 'cancelled')
      .map(r => String(r.tableId))
  );

  const candidates = TABLES
    .filter(t => t.area === area)
    .filter(t => Number(t.seats) >= Number(guests))
    .filter(t => !taken.has(String(t.id)))
    .sort((a, b) => a.seats - b.seats || a.id - b.id);

  return { tableId: candidates[0]?.id || '' };
}
