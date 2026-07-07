import { sidebar } from '../components/sidebar.js';
import { loadReservations, todayISO, updateReservationStatus } from '../services/reservations.service.js';
import { reservationCard } from '../components/reservation-card.js';
import { AREA_NAMES } from '../config/booking-times.js';

let timer = null;

export function render(){
  return `
    <div class="app-shell">
      ${sidebar('dashboard')}
      <main class="main">
        <div class="topbar">
          <div>
            <h2>דשבורד מנהלת</h2>
            <p>הזמנות חיות מ-Google Sheets</p>
          </div>
          <div class="actions">
            <button class="btn primary" id="refreshBtn">רענון</button>
            <a class="btn" href="booking/index.html" target="_blank">פתיחת דף הזמנות</a>
          </div>
        </div>

        <div class="notice">הלקוחות רואים רק שעות. המתחם מחושב אוטומטית לפי השעה ומוצג כאן למנהלת בלבד.</div>

        <section class="grid stats" id="stats"></section>

        <section class="grid content-grid" style="margin-top:16px">
          <div class="panel">
            <h3>הזמנות היום</h3>
            <div class="list" id="todayList"><div class="empty">טוען...</div></div>
          </div>

          <div class="panel">
            <h3>חלוקה לפי מתחם</h3>
            <div class="area-breakdown" id="areaBreakdown"></div>
          </div>
        </section>
      </main>
    </div>
  `;
}

export async function init(){
  document.getElementById('refreshBtn').onclick = refresh;
  await refresh();
  clearInterval(timer);
  timer = setInterval(refresh, 30000);
}

async function refresh(){
  const all = await loadReservations();
  const today = todayISO();
  const todayRows = all.filter(r => r.date === today && r.status !== 'cancelled')
                       .sort((a,b) => (a.time || '').localeCompare(b.time || ''));

  renderStats(todayRows);
  renderList(todayRows);
  renderArea(todayRows);
  bindActions();
}

function renderStats(rows){
  const guests = rows.reduce((s,r)=>s+Number(r.guests||0),0);
  const waiting = rows.filter(r=>r.status==='waiting').length;
  const newCount = rows.filter(r=>r.status==='new').length;
  const confirmed = rows.filter(r=>r.status==='confirmed').length;

  document.getElementById('stats').innerHTML = `
    <div class="stat"><strong>${rows.length}</strong><span>הזמנות היום</span></div>
    <div class="stat"><strong>${guests}</strong><span>סועדים</span></div>
    <div class="stat"><strong>${newCount}</strong><span>חדשות</span></div>
    <div class="stat"><strong>${confirmed}</strong><span>מאושרות</span></div>
    <div class="stat"><strong>${waiting}</strong><span>בהמתנה</span></div>
  `;
}

function renderList(rows){
  document.getElementById('todayList').innerHTML =
    rows.length ? rows.map(r => reservationCard(r)).join('') : '<div class="empty">אין הזמנות להיום</div>';
}

function renderArea(rows){
  const areas = ['covered','inside','outside'];
  document.getElementById('areaBreakdown').innerHTML = areas.map(area => {
    const areaRows = rows.filter(r => r.area === area);
    const guests = areaRows.reduce((s,r)=>s+Number(r.guests||0),0);
    return `<div><span>${AREA_NAMES[area]}</span><strong>${guests}</strong><small>${areaRows.length} הזמנות</small></div>`;
  }).join('');
}

function bindActions(){
  document.querySelectorAll('[data-status-id]').forEach(btn => {
    btn.onclick = async () => {
      await updateReservationStatus(btn.dataset.statusId, btn.dataset.status);
      await refresh();
    };
  });
}
