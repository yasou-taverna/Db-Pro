import { sidebar } from '../components/sidebar.js';
import { API_URL } from '../services/api.service.js';

export function render(){
  return `
    <div class="app-shell">
      ${sidebar('settings')}
      <main class="main">
        <div class="topbar"><div><h2>הגדרות</h2><p>חיבורי מערכת</p></div></div>
        <section class="panel">
          <h3>Google Apps Script</h3>
          <p class="row-meta">${API_URL}</p>
          <div class="notice">אם מחליפים Deploy ב-Apps Script, צריך לעדכן את הקישור בקובץ js/services/api.service.js וגם booking/js/booking-api.js</div>
        </section>
      </main>
    </div>
  `;
}
