import { sidebar } from '../components/sidebar.js';
import { loadReservations } from '../services/reservations.service.js';

let allCustomers = [];

export function render() {
  return `
    <div class="app-shell">
      ${sidebar('customers')}

      <main class="main">
        <div class="topbar">
          <div>
            <h2>לקוחות</h2>
            <p>מאגר לקוחות שנבנה אוטומטית מתוך ההזמנות</p>
          </div>

          <button class="btn primary" id="refreshBtn">רענון</button>
        </div>

        <section class="panel">
          <div class="filters">
            <div class="field wide">
              <label>חיפוש לקוח</label>
              <input id="customerSearch" placeholder="שם / טלפון">
            </div>
          </div>

          <div class="reservations-table-wrap">
            <table class="reservations-table">
              <thead>
                <tr>
                  <th>שם</th>
                  <th>טלפון</th>
                  <th>מספר הזמנות</th>
                  <th>סך סועדים</th>
                  <th>הזמנה אחרונה</th>
                  <th>סוג לקוח</th>
                </tr>
              </thead>

              <tbody id="customersBody">
                <tr>
                  <td colspan="6" class="empty">טוען...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  `;
}

export async function init() {
  document.getElementById('refreshBtn').onclick = refresh;
  document.getElementById('customerSearch').oninput = applySearch;

  await refresh();
}

async function refresh() {
  const btn = document.getElementById('refreshBtn');

  btn.disabled = true;
  btn.textContent = 'טוען...';

  try {
    const rows = await loadReservations();
    allCustomers = buildCustomers(rows);
    applySearch();
  } finally {
    btn.disabled = false;
    btn.textContent = 'רענון';
  }
}

function buildCustomers(rows) {
  const map = new Map();

  rows.forEach(r => {
    const key = normalizePhone(r.phone) || r.customerName;
    if (!key) return;

    const current = map.get(key) || {
      name: r.customerName || 'ללא שם',
      phone: r.phone || '',
      visits: 0,
      guests: 0,
      lastDate: '',
      lastTime: ''
    };

    current.visits += 1;
    current.guests += Number(r.guests || 0);

    const currentVisit = `${r.date || ''} ${r.time || ''}`;
    const lastVisit = `${current.lastDate || ''} ${current.lastTime || ''}`;

    if (currentVisit > lastVisit) {
      current.lastDate = r.date || '';
      current.lastTime = r.time || '';
      current.name = r.customerName || current.name;
      current.phone = r.phone || current.phone;
    }

    map.set(key, current);
  });

  return [...map.values()].sort((a, b) => {
    return `${b.lastDate} ${b.lastTime}`.localeCompare(`${a.lastDate} ${a.lastTime}`);
  });
}

function applySearch() {
  const q = document.getElementById('customerSearch').value.trim();

  let customers = [...allCustomers];

  if (q) {
    customers = customers.filter(c =>
      [c.name, c.phone].some(v => String(v || '').includes(q))
    );
  }

  renderCustomers(customers);
}

function renderCustomers(customers) {
  const body = document.getElementById('customersBody');

  if (!customers.length) {
    body.innerHTML = `
      <tr>
        <td colspan="6" class="empty">לא נמצאו לקוחות</td>
      </tr>
    `;
    return;
  }

  body.innerHTML = customers.map(c => {
    const type = c.visits >= 3 ? 'VIP' : 'לקוח';

    return `
      <tr>
        <td><strong>${escapeHtml(c.name || 'ללא שם')}</strong></td>
        <td>${escapeHtml(c.phone || '-')}</td>
        <td>${c.visits}</td>
        <td>${c.guests}</td>
        <td>${c.lastDate || '-'} ${c.lastTime || ''}</td>
        <td><span class="badge ${c.visits >= 3 ? 'confirmed' : 'new'}">${type}</span></td>
      </tr>
    `;
  }).join('');
}

function normalizePhone(phone) {
  return String(phone || '').replace(/\D/g, '');
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[s]));
}      <span class="badge confirmed">${c.visits >= 3 ? 'VIP' : 'לקוח'}</span>
    </div>
  `).join('') : '<div class="empty">אין לקוחות עדיין</div>';
}
