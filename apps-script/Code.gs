const SHEET_NAME = 'Reservations';
const SPREADSHEET_ID = '1Uka-GKc8ru8ZGcbIBK5ibXTGNhUs9fLdSuQsJT_W-90';

const TABLES = [
  { id:'1', area:'inside', seats:4 }, { id:'2', area:'inside', seats:4 },
  { id:'3', area:'inside', seats:4 }, { id:'4', area:'inside', seats:4 },
  { id:'5', area:'inside', seats:4 }, { id:'6', area:'inside', seats:4 },
  { id:'7', area:'inside', seats:6 }, { id:'8', area:'inside', seats:2 },
  { id:'9', area:'inside', seats:4 }, { id:'10', area:'inside', seats:4 },
  { id:'11', area:'inside', seats:4 }, { id:'12', area:'inside', seats:4 },
  { id:'13', area:'inside', seats:4 }, { id:'14', area:'inside', seats:4 },
  { id:'15', area:'inside', seats:2 }, { id:'16', area:'inside', seats:2 },
  { id:'17', area:'inside', seats:2 },

  { id:'18', area:'covered', seats:6 }, { id:'19', area:'covered', seats:10 },
  { id:'20', area:'covered', seats:6 }, { id:'21', area:'covered', seats:8 },
  { id:'22', area:'covered', seats:12 }, { id:'23', area:'covered', seats:12 },
  { id:'24', area:'covered', seats:8 },

  { id:'25', area:'outside', seats:8 }, { id:'26', area:'outside', seats:8 },
  { id:'27', area:'outside', seats:8 }, { id:'28', area:'outside', seats:8 },
  { id:'29', area:'outside', seats:8 }
];

const TIME_TO_AREA = {
  '20:00':'inside',
  '20:05':'inside',
  '20:10':'inside',
  '20:30':'covered',
  '20:35':'covered',
  '21:00':'outside',
  '21:05':'outside',
  '21:10':'outside',
  '21:15':'outside'
};

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
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);

    const time = normalizeTime(r.time);
    const area = r.area || TIME_TO_AREA[time] || '';
    const guests = Number(r.guests || 0);

    const existingReservations = getReservations();

    const assignedTableId = assignTable({
      area,
      guests,
      date: r.date,
      existingReservations
    });

    const finalStatus = assignedTableId ? (r.status || 'new') : 'waiting';

    let receiptUrl = '';

    if (r.receiptImageBase64) {
      receiptUrl = saveReceiptToDrive(r);
    }

    const finalReservation = {
      ...r,
      time,
      area,
      tableId: assignedTableId,
      status: finalStatus,
      receiptUrl
    };

    sheet.appendRow([
      finalReservation.id || '',
      finalReservation.customerName || '',
      finalReservation.phone || '',
      finalReservation.date || '',
      finalReservation.time || '',
      finalReservation.guests || '',
      finalReservation.area || '',
      finalReservation.tableId || '',
      finalReservation.status || 'new',
      finalReservation.notes || '',
      finalReservation.depositStatus || 'pending',
      finalReservation.reservationType || 'private',
      finalReservation.source || 'public-booking',
      finalReservation.createdAt || new Date().toISOString(),
      finalReservation.receiptFileName || '',
      receiptUrl || ''
    ]);

    return {
      ok: true,
      reservation: finalReservation
    };

  } finally {
    lock.releaseLock();
  }
}

function assignTable({ area, guests, date, existingReservations }) {
  const taken = new Set(
    existingReservations
      .filter(r =>
        String(r.date || '') === String(date || '') &&
        String(r.area || '') === String(area || '') &&
        !['cancelled', 'done'].includes(String(r.status || 'new')) &&
        String(r.tableId || '')
      )
      .map(r => String(r.tableId))
  );

  const candidates = TABLES
    .filter(t => t.area === area)
    .filter(t => Number(t.seats) >= Number(guests))
    .filter(t => !taken.has(String(t.id)))
    .sort((a, b) => Number(a.seats) - Number(b.seats) || Number(a.id) - Number(b.id));

  return candidates[0]?.id || '';
}

function saveReceiptToDrive(r) {
  try {
    if (!RECEIPTS_FOLDER_ID) return '';

    const folder = DriveApp.getFolderById(RECEIPTS_FOLDER_ID);

    const base64 = r.receiptImageBase64.split(',')[1];
    const contentType = r.receiptImageBase64
      .split(',')[0]
      .replace('data:', '')
      .replace(';base64', '');

    const bytes = Utilities.base64Decode(base64);

    const safeName = `${r.date || 'date'}_${r.time || 'time'}_${r.customerName || 'customer'}_${r.receiptFileName || 'receipt.jpg'}`;
    const blob = Utilities.newBlob(bytes, contentType, safeName);

    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return file.getUrl();

  } catch (err) {
    return '';
  }
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
    return { ok: false, error: 'Missing id/status column' };
  }

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idCol]) === String(id)) {
      sheet.getRange(i + 1, statusCol + 1).setValue(status);
      return { ok: true };
    }
  }

  return { ok: false, error: 'Reservation not found' };
}

function normalizeTime(value) {
  const str = String(value || '');
  if (/^\d{2}:\d{2}/.test(str)) return str.slice(0, 5);

  if (str.includes('T')) {
    const d = new Date(str);
    return String(d.getUTCHours()).padStart(2, '0') + ':' + String(d.getUTCMinutes()).padStart(2, '0');
  }

  return str.slice(0, 5);
}

function json(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function json(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
