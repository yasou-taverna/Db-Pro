export function sidebar(active='dashboard'){
  const items = [
    ['dashboard','📊','דשבורד'],
    ['reservations','📒','הזמנות'],
    ['kitchen','🍽️','עומס מטבח'],
    ['customers','👥','לקוחות'],
    ['settings','⚙️','הגדרות']
  ];

  return `
    <aside class="sidebar">
      <div class="brand-block">
        <div class="brand-logo-text">YASOU</div>
        <p>טברנה יאסו רודוס</p>
      </div>
      <nav class="nav">
        ${items.map(([route,icon,label]) => `
          <button data-route="${route}" class="${active===route?'active':''}">
            <span class="icon">${icon}</span>
            <span>${label}</span>
          </button>
        `).join('')}
      </nav>
    </aside>
  `;
}
