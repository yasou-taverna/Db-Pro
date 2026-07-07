import { AREA_NAMES } from '../config/booking-times.js';

export function statusLabel(status){
  return {
    new:'חדש',
    confirmed:'אושר',
    arrived:'הגיע',
    cancelled:'בוטל',
    waiting:'המתנה',
    done:'הסתיים'
  }[status] || status || 'חדש';
}

export function depositLabel(value){
  return {
    pending:'ממתין',
    paid:'שולם',
    unpaid:'לא שולם'
  }[value] || value || 'ממתין';
}

export function reservationCard(r, actions=true){
  const areaName = AREA_NAMES[r.area] || r.area || '-';
  return `
    <div class="reservation-row">
      <div>
        <p class="row-title">${escapeHtml(r.customerName || 'ללא שם')} · ${r.guests || 0} סועדים</p>
        <div class="row-meta">
          🕗 ${r.time || '-'} · 📅 ${r.date || '-'} · 🏛️ ${areaName} · 🪑 שולחן ${r.tableId || 'המתנה'}<br>
          📞 ${escapeHtml(r.phone || '-')} · 💳 פיקדון: ${depositLabel(r.depositStatus)}
          ${r.notes ? `<br>📝 ${escapeHtml(r.notes)}` : ''}
        </div>
      </div>
      <div>
        <div style="margin-bottom:8px;text-align:left"><span class="badge ${r.status || 'new'}">${statusLabel(r.status)}</span></div>
        ${actions ? `
        <div class="status-actions">
          <button class="btn small primary" data-status-id="${r.id}" data-status="confirmed">אושר</button>
          <button class="btn small" data-status-id="${r.id}" data-status="arrived">הגיע</button>
          <button class="btn small" data-status-id="${r.id}" data-status="done">סיים</button>
          <button class="btn small danger" data-status-id="${r.id}" data-status="cancelled">בוטל</button>
        </div>` : ''}
      </div>
    </div>
  `;
}

function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, s => ({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;',
    "'":'&#039;'
  }[s]));
}
