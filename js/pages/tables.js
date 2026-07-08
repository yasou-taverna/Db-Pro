import { sidebar } from '../components/sidebar.js';
import { loadReservations, updateReservationStatus, todayISO } from '../services/reservations.service.js';
import { AREA_NAMES } from '../config/booking-times.js';
import { statusLabel } from '../components/reservation-card.js';

let reservations = [];
let selectedDate = todayISO();
let selectedTableId = null;

const TABLES = [
  { id:'25', seats:8, area:'outside', left:'14%', top:'68%', w:142, h:62 },
  { id:'26', seats:8, area:'outside', left:'14%', top:'32%', w:142, h:62 },
  { id:'27', seats:8, area:'outside', left:'50%', top:'50%', w:142, h:62 },
  { id:'28', seats:8, area:'outside', left:'86%', top:'68%', w:142, h:62 },
  { id:'29', seats:8, area:'outside', left:'86%', top:'32%', w:142, h:62 },

  { id:'18', seats:6, area:'covered', left:'12%', top:'58%', w:90, h:70 },
  { id:'19', seats:10, area:'covered', left:'50%', top:'63%', w:132, h:132, round:true },
  { id:'20', seats:6, area:'covered', left:'88%', top:'58%', w:90, h:70 },
  { id:'21', seats:8, area:'covered', left:'13%', top:'25%', w:142, h:62 },
  { id:'22', seats:12, area:'covered', left:'34%', top:'25%', w:190, h:62 },
  { id:'23', seats:12, area:'covered', left:'66%', top:'25%', w:190, h:62 },
  { id:'24', seats:8, area:'covered', left:'87%', top:'25%', w:142, h:62 },

  { id:'1', seats:4, area:'inside', left:'10%', top:'80%', w:74, h:58 },
  { id:'2', seats:4, area:'inside', left:'10%', top:'58%', w:74, h:58 },
  { id:'3', seats:4, area:'inside', left:'10%', top:'36%', w:74, h:58 },
  { id:'4', seats:4, area:'inside', left:'10%', top:'14%', w:74, h:58 },
  { id:'5', seats:4, area:'inside', left:'34%', top:'58%', w:74, h:58 },
  { id:'6', seats:4, area:'inside', left:'34%', top:'36%', w:74, h:58 },
  { id:'7', seats:6, area:'inside', left:'34%', top:'15%', w:112, h:54 },
  { id:'8', seats:2, area:'inside', left:'56%', top:'58%', w:58, h:58 },
  { id:'9', seats:4, area:'inside', left:'56%', top:'36%', w:74, h:58 },
  { id:'10', seats:4, area:'inside', left:'56%', top:'14%', w:74, h:58 },
  { id:'11', seats:4, area:'inside', left:'78%', top:'80%', w:74, h:58 },
  { id:'12', seats:4, area:'inside', left:'78%', top:'58%', w:74, h:58 },
  { id:'13', seats:4, area:'inside', left:'78%', top:'36%', w:74, h:58 },
  { id:'14', seats:4, area:'inside', left:'78%', top:'14%', w:74, h:58 },
  { id:'15', seats:2, area:'inside', left:'94%', top:'58%', w:58, h:58 },
  { id:'16', seats:2, area:'inside', left:'94%', top:'36%', w:58, h:58 },
  { id:'17', seats:2, area:'inside', left:'94%', top:'14%', w:58, h:58 }
];

export function render() {
  return `
    <div class="app-shell">
      ${sidebar('tables')}

      <main class="main">
        <div class="topbar">
          <div>
            <h2>ניהול שולחנות</h2>
            <p>מפת שולחנות חיה לפי ההזמנות בגיליון</p>
          </div>

          <div class="actions">
            <input id="tablesDate" class="compact-date-input" type="date" value="${selectedDate}">
            <button class="btn primary" id="refreshTablesBtn">רענון</button>
          </div>
        </div>

        <section class="panel">
          <div class="legend">
            <span><i class="dot free"></i>פנוי</span>
            <span><i class="dot reserved"></i>שמור</span>
            <span><i class="dot occupied"></i>תפוס</span>
          </div>

          <div class="map-wrap">
            <div class="floor-map">
              ${zone('outside', 'מתחם חיצוני')}
              ${zone('covered', 'מתחם מקורה')}
              ${zone('inside', 'מתחם פנימי')}
            </div>
          </div>
        </section>

        <section class="panel" style="margin-top:16px">
          <h3>פרטי שולחן</h3>
          <div id="tableDetails" class="empty">בחר שולחן מהמפה</div>
        </section>
      </main>
    </div>
  `;
}

export async function init() {
  const refreshBtn = document.getElementById('refreshTablesBtn');
  const dateInput = document.getElementById('tablesDate');

  refreshBtn.onclick = refresh;

  dateInput.onchange = async (e) => {
    selectedDate = e.target.value;
    selectedTableId = null;
    await refresh();
  };

  drawTables();
  await refresh();
}

async function refresh() {
  const btn = document.getElementById('refreshTablesBtn');

  if (btn) {
    btn.disabled = true;
    btn.textContent = 'טוען...';
  }

  try {
    reservations = await loadReservations();
  } catch (err) {
    console.error('Tables load error:', err);
    reservations = [];
  }

  drawTables();

  if (selectedTableId) {
    showTable(selectedTableId);
  }

  if (btn) {
    btn.disabled = false;
    btn.textContent = 'רענון';
  }
}

function zone(area, title) {
  return `
    <section class="zone ${area}">
      <h3>${title}</h3>
      <div class="tables-layer" data-zone="${area}"></div>
    </section>
  `;
}

function drawTables() {
  ['outside', 'covered', 'inside'].forEach(area => {
    const layer = document.querySelector(`[data-zone="${area}"]`);
    if (!layer) return;

    layer.innerHTML = TABLES
      .filter(t => t.area === area)
      .map(tableButton)
      .join('');
  });

  document.querySelectorAll('.table-button').forEach(btn => {
    btn.onclick = () => {
      selectedTableId = btn.dataset.tableId;
      showTable(selectedTableId);
    };
  });
}

function tableButton(table) {
  const reservation = getTableReservation(table.id);
  const status = getTableStatus(reservation);

  const title = reservation
    ? `שולחן ${table.id}, ${table.seats} מקומות, ${reservation.customerName || 'ללא שם'}`
    : `שולחן ${table.id}, ${table.seats} מקומות, פנוי`;

  const activeClass = String(selectedTableId) === String(table.id) ? 'selected-table' : '';

  return `
    <button
      class="table-button ${status} ${table.round ? 'round' : ''} ${activeClass}"
      style="left:${table.left};top:${table.top};--w:${table.w};--h:${table.h}"
      data-table-id="${escapeAttr(table.id)}"
      data-number="${escapeAttr(table.id)}"
      title="${escapeAttr(title)}">
      ${table.seats}
    </button>
  `;
}

function getTableReservation(tableId) {
  return reservations.find(r =>
    String(r.tableId) === String(tableId) &&
    r.date === selectedDate &&
    r.status !== 'cancelled' &&
    r.status !== 'done'
  );
}

function getTableStatus(reservation) {
  if (!reservation) return 'free';
  if (reservation.status === 'arrived') return 'occupied';
  return 'reserved';
}

function showTable(tableId) {
  const table = TABLES.find(t => String(t.id) === String(tableId));
  const reservation = getTableReservation(tableId);
  const box = document.getElementById('tableDetails');

  if (!box) return;

  if (!table) {
    box.className = 'empty';
    box.innerHTML = 'השולחן לא נמצא';
    return;
  }

  if (!reservation) {
    box.className = '';
    box.innerHTML = `
      <div class="table-detail-card">
        <h3>שולחן ${escapeHtml(tableId)}</h3>
        <p>${table.seats} מקומות · ${AREA_NAMES[table.area] || table.area || '-'}</p>
        <div class="empty">אין הזמנה פעילה לשולחן זה בתאריך ${selectedDate}</div>
      </div>
    `;
    drawTables();
    return;
  }

  box.className = '';
  box.innerHTML = `
    <div class="table-detail-card">
      <h3>שולחן ${escapeHtml(tableId)} · ${escapeHtml(reservation.customerName || 'ללא שם')}</h3>

      <p>
        🕗 ${escapeHtml(reservation.time || '-')} ·
        👥 ${reservation.guests || 0} סועדים ·
        📞 ${escapeHtml(reservation.phone || '-')}
      </p>

      <p>
        🏛️ ${AREA_NAMES[reservation.area] || reservation.area || '-'} ·
        סטטוס: <strong>${statusLabel(reservation.status)}</strong>
      </p>

      <div class="split-actions">
        <button class="btn primary" data-action-status="confirmed">אשר</button>
        <button class="btn" data-action-status="arrived">הגיע</button>
        <button class="btn" data-action-status="done">סיים</button>
        <button class="btn danger" data-action-status="cancelled">בטל</button>
        ${
          reservation.receiptUrl
            ? `<a class="btn" href="${escapeAttr(reservation.receiptUrl)}" target="_blank" rel="noopener">📷 קבלה</a>`
            : ''
        }
      </div>
    </div>
  `;

  document.querySelectorAll('[data-action-status]').forEach(btn => {
    btn.onclick = async () => {
      const newStatus = btn.dataset.actionStatus;

      btn.disabled = true;
      btn.textContent = 'מעדכן...';

      try {
        await updateReservationStatus(reservation.id, newStatus);
        reservations = await loadReservations();
        drawTables();

        if (newStatus === 'done' || newStatus === 'cancelled') {
          showTable(tableId);
        } else {
          showTable(tableId);
        }
      } catch (err) {
        console.error('Status update error:', err);
        alert('אירעה שגיאה בעדכון הסטטוס');
        btn.disabled = false;
        btn.textContent = 'נסה שוב';
      }
    };
  });

  drawTables();
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[s]));
}

function escapeAttr(str) {
  return escapeHtml(str);
}
