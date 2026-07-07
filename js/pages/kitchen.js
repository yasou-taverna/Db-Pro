import { sidebar } from '../components/sidebar.js';
import { loadReservations, todayISO } from '../services/reservations.service.js';
import { AREA_NAMES } from '../config/booking-times.js';

const WAVES = [
  { title:'גל ראשון', area:'covered', range:'20:00-20:10' },
  { title:'גל שני', area:'inside', range:'20:30-20:35' },
  { title:'גל שלישי', area:'outside', range:'21:00-21:15' }
];

export function render(){
  return `
    <div class="app-shell">
      ${sidebar('kitchen')}
      <main class="main">
        <div class="topbar">
          <div>
            <h2>עומס מטבח</h2>
            <p>חלוקת עומס לפי גלי הושבה</p>
          </div>
          <button class="btn primary" id="refreshBtn">רענון</button>
        </div>

        <section class="panel">
          <h3>היום</h3>
          <div class="timeline" id="wavesBox"><div class="empty">טוען...</div></div>
        </section>
      </main>
    </div>
  `;
}

export async function init(){
  document.getElementById('refreshBtn').onclick = refresh;
  await refresh();
}

async function refresh(){
  const rows = (await loadReservations()).filter(r => r.date === todayISO() && r.status !== 'cancelled');
  const max = Math.max(1, ...WAVES.map(w => rows.filter(r => r.area === w.area).reduce((s,r)=>s+Number(r.guests||0),0)));

  document.getElementById('wavesBox').innerHTML = WAVES.map(w => {
    const waveRows = rows.filter(r => r.area === w.area);
    const guests = waveRows.reduce((s,r)=>s+Number(r.guests||0),0);
    const pct = Math.round((guests / max) * 100);
    return `
      <div class="wave">
        <div><strong>${w.title}</strong><br><span class="row-meta">${w.range}<br>${AREA_NAMES[w.area]}</span></div>
        <div class="wave-bar"><i style="width:${pct}%"></i></div>
        <div><strong>${guests}</strong><br><span class="row-meta">${waveRows.length} הזמנות</span></div>
      </div>
    `;
  }).join('');
}
