import { AREA_NAMES } from '../config/booking-times.js';

export function statusLabel(status) {
  return {
    new: 'חדש',
    confirmed: 'אושר',
    arrived: 'הגיע',
    cancelled: 'בוטל',
    waiting: 'המתנה',
    done: 'הסתיים'
  }[status] || status || 'חדש';
}

export function depositLabel(value) {
  return {
    pending: 'ממתין',
    paid: 'שולם',
    unpaid: 'לא שולם',
    receipt_uploaded: 'קבלה הועלתה'
  }[value] || value || 'ממתין';
}

export function reservationTypeLabel(type) {
  return {
    private: 'הזמנה פרטית',
    group: 'הזמנה כקבוצה'
  }[type] || 'הזמנה פרטית';
}

export function reservationCard(r, actions = true) {
  const areaName = AREA_NAMES[r.area] || r.area || '-';
  const hasReceipt = Boolean(r.receiptUrl);

  return `
    <div class="reservation-row reservation-status-${r.status || 'new'}">

      <div class="reservation-main">
        <div class="reservation-header">
          <p class="row-title">
            ${escapeHtml(r.customerName || 'ללא שם')}
            <span>· ${r.guests || 0} סועדים</span>
          </p>

          <span class="badge ${r.status || 'new'}">
            ${statusLabel(r.status)}
          </span>
        </div>

        <div class="row-meta reservation-details">
          <span>🕗 ${r.time || '-'}</span>
          <span>📅 ${r.date || '-'}</span>
          <span>🏛️ ${areaName}</span>
          <span>🪑 שולחן ${r.tableId || 'המתנה'}</span>
          <span>📞 ${escapeHtml(r.phone || '-')}</span>
          <span>👥 ${reservationTypeLabel(r.reservationType)}</span>
          <span>💳 ${depositLabel(r.depositStatus)}</span>
          <span>📷 ${hasReceipt ? 'קבלה קיימת' : 'קבלה חסרה'}</span>
        </div>

        <div class="receipt-actions">
          ${
            hasReceipt
              ? `<a class="btn small receipt-btn" href="${escapeAttr(r.receiptUrl)}" target="_blank" rel="noopener">📷 צפה בקבלה</a>`
              : `<span class="missing-receipt">אין קבלה</span>`
          }
        </div>
      </div>

      ${
        actions
          ? `
            <div class="status-actions">
              <button class="btn small primary" data-status-id="${r.id}" data-status="confirmed">אשר</button>
              <button class="btn small" data-status-id="${r.id}" data-status="arrived">הגיע</button>
              <button class="btn small" data-status-id="${r.id}" data-status="done">סיים</button>
              <button class="btn small danger" data-status-id="${r.id}" data-status="cancelled">בטל</button>
            </div>
          `
          : ''
      }

    </div>
  `;
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
