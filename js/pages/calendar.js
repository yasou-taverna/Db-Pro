import { sidebar } from '../components/sidebar.js';
import { loadReservations } from '../services/reservations.service.js';
import { AREA_NAMES } from '../config/booking-times.js';
import { statusLabel } from '../components/reservation-card.js';

let reservations = [];
let currentDate = new Date();

export function render() {
  return `
    <div class="app-shell">
      ${sidebar('calendar')}

      <main class="main">
        <div class="topbar">
          <div>
            <h2>לוח שנה</h2>
            <p>תצוגת הזמנות לפי ימים</p>
          </div>

          <div class="actions">
            <button class="btn" id="prevMonthBtn">חודש קודם</button>
            <button class="btn primary" id="todayBtn">היום</button>
            <button class="btn" id="nextMonthBtn">חודש הבא</button>
          </div>
        </div>

        <section class="panel">
          <h3 id="calendarTitle">טוען...</h3>

          <div class="calendar-grid calendar-weekdays">
            <div>א׳</div>
            <div>ב׳</div>
            <div>ג׳</div>
            <div>ד׳</div>
            <div>ה׳</div>
            <div>ו׳</div>
            <div>ש׳</div>
          </div>

          <div class="calendar-grid" id="calendarGrid">
            <div class="empty">טוען...</div>
          </div>
        </section>

        <section class="panel" style="margin-top:16px">
          <h3 id="dayTitle">בחר יום להצגת הזמנות</h3>
          <div class="list" id="dayReservations">
            <div class="empty">אין יום נבחר</div>
          </div>
        </section>
      </main>
    </div>
  `;
}

export async function init() {
  document.getElementById('prevMonthBtn').onclick = () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    drawCalendar();
  };

  document.getElementById('nextMonthBtn').onclick = () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    drawCalendar();
  };

  document.getElementById('todayBtn').onclick = () => {
    currentDate = new Date();
    drawCalendar();
    showDay(toISODate(new Date()));
  };

  reservations = await loadReservations();

  drawCalendar();
  showDay(toISODate(new Date()));
}

function drawCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleDateString('he-IL', {
    month: 'long',
    year: 'numeric'
  });

  document.getElementById('calendarTitle').textContent = monthName;

  const firstDay = new Date(year, month, 1);
  const firstWeekDay = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];

  for (let i = 0; i < firstWeekDay; i++) {
    cells.push(`<div class="calendar-day muted-day"></div>`);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = toISODate(new Date(year, month, day));
    const dayRows = reservations.filter(r => r.date === date);
    const guests = dayRows.reduce((sum, r) => sum + Number(r.guests || 0), 0);

    cells.push(`
      <button class="calendar-day ${date === toISODate(new Date()) ? 'today' : ''}" data-date="${date}">
        <strong>${day}</strong>
        <span>${dayRows.length} הזמנות</span>
        <small>${guests} סועדים</small>
      </button>
    `);
  }

  document.getElementById('calendarGrid').innerHTML = cells.join('');

  document.querySelectorAll('.calendar-day[data-date]').forEach(btn => {
    btn.onclick = () => showDay(btn.dataset.date);
  });
}

function showDay(date) {
  const rows = reservations
    .filter(r => r.date === date)
    .sort((a, b) => String(a.time || '').localeCompare(String(b.time || '')));

  document.getElementById('dayTitle').textContent = `הזמנות לתאריך ${date}`;

  document.getElementById('dayReservations').innerHTML = rows.length
    ? rows.map(r => `
        <div class="reservation-row">
          <div>
            <p class="row-title">${escapeHtml(r.customerName || 'ללא שם')} · ${r.guests || 0} סועדים</p>
            <div class="row-meta">
              🕗 ${r.time || '-'} · 🏛️ ${AREA_NAMES[r.area] || r.area || '-'} · 🪑 שולחן ${r.tableId || 'המתנה'}<br>
              📞 ${escapeHtml(r.phone || '-')} · סטטוס: ${statusLabel(r.status)}
            </div>
          </div>
          <a class="btn small" href="#reservations">פתח בהזמנות</a>
        </div>
      `).join('')
    : '<div class="empty">אין הזמנות ביום זה</div>';
}

function toISODate(date) {
  return date.toISOString().slice(0, 10);
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
