import { sidebar } from '../components/sidebar.js';
import { loadReservations } from '../services/reservations.service.js';

export function render(){
  return `
    <div class="app-shell">
      ${sidebar('customers')}
      <main class="main">
        <div class="topbar"><div><h2>לקוחות</h2><p>נבנה מרשימת ההזמנות</p></div><button class="btn primary" id="refreshBtn">רענון</button></div>
        <section class="panel"><div class="list" id="customersList"><div class="empty">טוען...</div></div></section>
      </main>
    </div>
  `;
}

export async function init(){
  document.getElementById('refreshBtn').onclick = refresh;
  await refresh();
}

async function refresh(){
  const rows = await loadReservations();
  const map = new Map();
  rows.forEach(r => {
    const key = r.phone || r.customerName;
    if (!key) return;
    const current = map.get(key) || { name:r.customerName, phone:r.phone, visits:0, guests:0 };
    current.visits += 1;
    current.guests += Number(r.guests || 0);
    map.set(key, current);
  });

  const customers = [...map.values()].sort((a,b)=>b.visits-a.visits);
  document.getElementById('customersList').innerHTML = customers.length ? customers.map(c => `
    <div class="customer-row">
      <div><p class="row-title">${c.name || 'ללא שם'}</p><div class="row-meta">📞 ${c.phone || '-'} · ${c.visits} הזמנות · ${c.guests} סועדים במצטבר</div></div>
      <span class="badge confirmed">${c.visits >= 3 ? 'VIP' : 'לקוח'}</span>
    </div>
  `).join('') : '<div class="empty">אין לקוחות עדיין</div>';
}
