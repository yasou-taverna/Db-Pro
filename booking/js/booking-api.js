export const API_URL = 'https://script.google.com/macros/s/AKfycbynI5CHvZhKXx2f-RgVAXkAa0c4IZce6Wz-FjLcqrsP05i-vWskwvX6Vdq-pY546vp3/exec';

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
