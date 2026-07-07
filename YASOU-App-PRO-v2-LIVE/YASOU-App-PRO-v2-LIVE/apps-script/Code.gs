const SHEET_NAME = 'Reservations';

function doGet(e) {
  const action = e.parameter.action;
  if (action === 'getReservations') return json(getReservations());
  return json({ ok: true, message: 'YASOU API is running' });
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents || '{}');

  if (body.action === 'addReservation') {
    return json(addReservation(body));
  }

  if (body.action === 'updateReservationStatus') {
    return json(updateReservationStatus(body.id, body.status));
  }

  return json({ ok: false, error: 'Unknown action' });
}

function addReservation(r) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  sheet.appendRow([
    r.id || '',
    r.customerName || '',
    r.phone || '',
    r.date || '',
    r.time || '',
    r.guests || '',
    r.area || '',
    r.tableId || '',
    r.status || 'new',
    r.notes || '',
    r.depositStatus || 'pending',
    r.source || 'public-booking',
    r.createdAt || new Date().toISOString()
  ]);

  return { ok: true, reservation: r };
}

function getReservations() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  const values = sheet.getDataRange().getValues();

  if (values.length <= 1) return [];

  const headers = values.shift();
  return values.map(row => {
    const item = {};
    headers.forEach((h, i) => item[h] = row[i]);
    return item;
  });
}

function updateReservationStatus(id, status) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];

  const idCol = headers.indexOf('id');
  const statusCol = headers.indexOf('status');

  if (idCol === -1 || statusCol === -1) {
    return { ok:false, error:'Missing id/status column' };
  }

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idCol]) === String(id)) {
      sheet.getRange(i + 1, statusCol + 1).setValue(status);
      return { ok:true };
    }
  }

  return { ok:false, error:'Reservation not found' };
}

function json(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
