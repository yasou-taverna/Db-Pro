import { sidebar } from '../components/sidebar.js';
import { loadReservations, updateReservationStatus } from '../services/reservations.service.js';
import { reservationCard } from '../components/reservation-card.js';

let allRows = [];

export function render(){
  return `
    <div class="app-shell">
      ${sidebar('reservations')}
      <main class="main">
        <div class="topbar">
          <div>
            <h2>ניהול הזמנות</h2>
            <p>כל ההזמנות מהגיליון</p>
          </div>
          <button class="btn primary" id="refreshBtn">רענון</button>
        </div>

        <div class="panel">
          <div class="filters">
            <div class="field"><label>תאריך</label><input id="dateFilter" type="date"></div>
            <div class="field"><label>מתחם</label><select id="areaFilter"><option value="">הכל</option><option value="covered">מקורה</option><option value="inside">פנימי</option><option value="outside">חיצוני</option></select></div>
            <div class="field"><label>חיפוש</label><input id="searchFilter" placeholder="שם / טלפון / שולחן"></div>
          </div>
          <div class="list" id="reservationsList"><div class="empty">טוען...</div></div>
        </div>
      </main>
    </div>
  `;
}

export async function init(){
  document.getElementById('refreshBtn').onclick = refresh;
  ['dateFilter','areaFilter','searchFilter'].forEach(id => document.getElementById(id).oninput = applyFilters);
  await refresh();
}

async function refresh(){
  allRows = await loadReservations();
  allRows.sort((a,b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));
  applyFilters();
}

function applyFilters(){
  const date = document.getElementById('dateFilter').value;
  const area = document.getElementById('areaFilter').value;
  const q = document.getElementById('searchFilter').value.trim();

  let rows = allRows;
  if (date) rows = rows.filter(r => r.date === date);
  if (area) rows = rows.filter(r => r.area === area);
  if (q) rows = rows.filter(r =>
    [r.customerName,r.phone,r.tableId,r.time].some(v => String(v||'').includes(q))
  );

  document.getElementById('reservationsList').innerHTML =
    rows.length ? rows.map(r => reservationCard(r)).join('') : '<div class="empty">לא נמצאו הזמנות</div>';

  document.querySelectorAll('[data-status-id]').forEach(btn => {
    btn.onclick = async () => {
      await updateReservationStatus(btn.dataset.statusId, btn.dataset.status);
      await refresh();
    };
  });
}
