const app = document.getElementById('app');

const routes = {
  dashboard: () => import('./pages/dashboard.js'),
  reservations: () => import('./pages/reservations.js'),
  kitchen: () => import('./pages/kitchen.js'),
  customers: () => import('./pages/customers.js'),
  settings: () => import('./pages/settings.js')
};

export async function navigate(page='dashboard'){
  const loader = routes[page] || routes.dashboard;
  const module = await loader();
  app.innerHTML = module.render();
  setActive(page);
  if (module.init) await module.init();
}

function setActive(page){
  setTimeout(() => {
    document.querySelectorAll('[data-route]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.route === page);
      btn.onclick = () => { location.hash = btn.dataset.route; };
    });
  });
}
