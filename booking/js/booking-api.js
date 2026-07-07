export const API_URL = 'https://script.google.com/macros/s/AKfycbwks0TjPdW0Ag8TokeR4si4T7DX9bIfe89f5s4udvfE101P_CuDBWZSCxoxiIKs0H4/exec';

export async function postReservation(reservation) {
  const response = await fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'addReservation', ...reservation })
  });

  try {
    return await response.json();
  } catch (e) {
    return { ok: true };
  }
}
