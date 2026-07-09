export const API_URL =
  'https://script.google.com/macros/s/AKfycbzjTIhwoPN-2kgKGg-ov2U6rC6BgvRZ7PlqCorec6x3uTSlfTpsOuxYsKMdsW2mOnwP/exec';

export async function postReservation(reservation) {
  const response = await fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify({
      action: 'addReservation',
      ...reservation
    })
  });

  const data = await response.json();

  if (!data.ok) {
    throw new Error(data.error || 'Reservation failed');
  }

  return data;
}
