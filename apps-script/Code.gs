const SHEET_NAME = 'Reservations';
const SPREADSHEET_ID = '1Xu3YipJx_i1oHmkPPKkwfqlzFKPc7bYenHY7dvc2xNA';
const RECEIPTS_FOLDER_ID = '1AAOvUdB-wN7Z9eIYCx6neAiHiekL_LGZ';

const HEADERS = [
  'id','customerName','phone','date','time','guests','area','tableId',
  'status','depositStatus','reservationType','source','createdAt',
  'receiptFileName','receiptUrl'
];

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

const AREA_ORDER = ['inside', 'covered', 'outside'];

function doGet(e) {
  const action = e.parameter.action;

  if (action === 'getReservations') {
    return json(getReservations());
  }

  return json({ ok: true, message: 'YASOU API is running' });
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');

    if (body.action === 'addReservation') {
      return json(addReservation(body));
    }

    if (body.action === 'updateReservationStatus') {
      return json(updateReservationStatus(body.id, body.status));
    }

    return json({ ok: false, error: 'Unknown action' });
  } catch (err) {
    return json({ ok: false, error: String(err), stack: err.stack || '' });
  }
}

function getSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  return sheet;
}

function addReservation(r) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const sheet = getSheet();
    const existingReservations = getReservations();

    const date = normalizeDate(r.date);
    const guests = Number(r.guests || 0);

    const assigned = assignTable({
      date,
      guests,
      existingReservations
    });

    let receiptUrl = '';
    if (r.receiptImageBase64) {
      receiptUrl = saveReceiptToDrive(r);
    }

    const reservation = {
      id: r.id || 'r' + Date.now(),
      customerName: r.customerName || '',
      phone: r.phone || '',
      date,
      time: normalizeTime(r.time),
      guests,
      area: assigned.area || '',
      tableId: assigned.tableId || '',
      status: assigned.tableId ? 'new' : 'waiting',
      depositStatus: r.depositStatus || 'receipt_uploaded',
      reservationType: r.reservationType || 'private',
      source: r.source || 'public-booking',
      createdAt: r.createdAt || new Date().toISOString(),
      receiptFileName: r.receiptFileName || '',
      receiptUrl
    };

    sheet.appendRow(HEADERS.map(h => reservation[h] || ''));

    return { ok: true, reservation };
  } finally {
    lock.releaseLock();
  }
}

function assignTable({ date, guests, existingReservations }) {
  const activeStatuses = ['new', 'confirmed', 'arrived', 'waiting'];
  const taken = new Set();

  existingReservations.forEach(r => {
    if (
      normalizeDate(r.date) === date &&
      activeStatuses.includes(String(r.status || 'new')) &&
      String(r.tableId || '')
    ) {
      taken.add(String(r.tableId));
    }
  });

  for (const area of AREA_ORDER) {
    const candidates = TABLES
      .filter(t => t.area === area)
      .filter(t => Number(t.seats) >= guests)
      .filter(t => !taken.has(String(t.id)))
      .sort((a, b) => Number(a.seats) - Number(b.seats) || Number(a.id) - Number(b.id));

    if (candidates.length) {
      return { area, tableId: candidates[0].id };
    }
  }

  return { area: '', tableId: '' };
}

function getReservations() {
  const sheet = getSheet();
  const values = sheet.getDataRange().getValues();

  if (values.length <= 1) return [];

  const headers = values[0];

  return values.slice(1)
    .filter(row => row.some(cell => cell !== ''))
    .map(row => {
      const item = {};
      headers.forEach((h, i) => {
        if (h) item[h] = row[i];
      });
      return item;
    });
}

function updateReservationStatus(id, status) {
  const sheet = getSheet();
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

function saveReceiptToDrive(r) {
  try {
    if (!RECEIPTS_FOLDER_ID || !r.receiptImageBase64) return '';

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

function normalizeDate(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }

  const str = String(value);

  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    return str.slice(0, 10);
  }

  try {
    return Utilities.formatDate(new Date(value), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  } catch (e) {
    return str.slice(0, 10);
  }
}

function normalizeTime(value) {
  if (!value) return '';

  const str = String(value);

  if (/^\d{2}:\d{2}/.test(str)) {
    return str.slice(0, 5);
  }

  if (str.includes('T')) {
    const d = new Date(str);
    return String(d.getUTCHours()).padStart(2, '0') + ':' +
           String(d.getUTCMinutes()).padStart(2, '0');
  }

  return str.slice(0, 5);
}

function json(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
