import { navigate } from './router.js';

document.addEventListener('DOMContentLoaded', () => {
  navigate(location.hash.replace('#','') || 'dashboard');
});

window.addEventListener('hashchange', () => {
  navigate(location.hash.replace('#','') || 'dashboard');
});
