export function sidebar(active = 'dashboard') {

  const items = [
    ['dashboard', '📊', 'דשבורד'],
    ['reservations', '📒', 'הזמנות'],
    ['tables', '🪑', 'מפת שולחנות'],
    ['calendar', '📅', 'יומן'],
    ['kitchen', '🍽️', 'עומס מטבח'],
    ['customers', '👥', 'לקוחות'],
    ['settings', '⚙️', 'הגדרות']
  ];

  return `
    <aside class="sidebar">

      <div class="brand-block">

        <img
          src="assets/images/logo.png"
          alt="YASOU"
          class="sidebar-logo">

        <p class="sidebar-title">
          טברנה יאסו רודוס
        </p>

      </div>

      <nav class="nav">

        ${items.map(([route, icon, label]) => `
          <button
            data-route="${route}"
            class="${active === route ? 'active' : ''}">

            <span class="icon">${icon}</span>
            <span>${label}</span>

          </button>
        `).join('')}

      </nav>

    </aside>
  `;
}
