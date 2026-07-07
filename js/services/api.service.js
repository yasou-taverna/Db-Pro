export const API_URL =
  'https://script.google.com/macros/s/AKfycbyR8vPh0M-RsbkLoVFlPWSK9GqZL38v0OC73vg4KkldhgPBf3XJrMSGz7XCpNR1ZWVW/exec';

export async function apiGet(action) {
  const response = await fetch(
    `${API_URL}?action=${encodeURIComponent(action)}&t=${Date.now()}`
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return await response.json();
}

export async function apiPost(payload) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return await response.json();
}
