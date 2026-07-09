export const API_URL ='https://script.google.com/macros/s/AKfycbzjTIhwoPN-2kgKGg-ov2U6rC6BgvRZ7PlqCorec6x3uTSlfTpsOuxYsKMdsW2mOnwP/exec';

export async function apiGet(action) {
  const response = await fetch(
    `${API_URL}?action=${encodeURIComponent(action)}&t=${Date.now()}`
  );

  try {
    return await response.json();
  } catch (e) {
    return [];
  }
}

export async function apiPost(payload) {
  const response = await fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  try {
    return await response.json();
  } catch (e) {
    return { ok: true };
  }
}
