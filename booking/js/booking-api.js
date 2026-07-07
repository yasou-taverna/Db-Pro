export const API_URL = 'https://script.google.com/macros/s/AKfycbySbpecrxWDu0NZVxRI-19B8DsQqJWafejcQ7GU_1KTS9KDDHi_8DGY3WjUuUdCS4w87g/exec';

export async function postReservation(reservation) {
  const response = await fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify({
      action: 'addReservation',
      ...reservation
    })
  });

  try {
    return await response.json();
  } catch (e) {
    return { ok: true };
  }
}
