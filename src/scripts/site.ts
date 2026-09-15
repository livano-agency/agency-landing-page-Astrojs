const root = document.documentElement;
const themeButton = document.querySelector<HTMLButtonElement>('.theme-btn');
function updateThemeButton() {
  const dark = root.dataset.theme === 'dark';
  if (!themeButton) return;
  themeButton.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  themeButton.textContent = dark ? '☀' : '☾';
}
updateThemeButton();
themeButton?.addEventListener('click', () => {
  const dark = root.dataset.theme !== 'dark';
  root.dataset.theme = dark ? 'dark' : 'light';
  root.classList.toggle('dark', dark);
  try { localStorage.setItem('ll-theme', dark ? 'dark' : 'light'); } catch {}
  updateThemeButton();
});

const menu = document.querySelector<HTMLButtonElement>('.menu-btn');
const nav = document.querySelector<HTMLElement>('.nav');
const mobile = matchMedia('(max-width: 980px)');
function setMenu(open: boolean, restoreFocus = false) {
  nav?.classList.toggle('open', open);
  menu?.setAttribute('aria-expanded', String(open));
  menu?.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  if (nav) nav.inert = mobile.matches && !open;
  if (restoreFocus) menu?.focus();
}
setMenu(false);
menu?.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') setMenu(false, nav?.classList.contains('open'));
});
document.addEventListener('click', event => {
  if (event.target instanceof Node && !nav?.contains(event.target) && !menu?.contains(event.target)) setMenu(false);
});
mobile.addEventListener('change', () => setMenu(false));
const header = document.querySelector('.header');
const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 8);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

// Content is visible without JavaScript; only animate items below the first screen.
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.remove('reveal-pending');
      observer.unobserve(entry.target);
    }
  }), { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(element => {
    if (element.getBoundingClientRect().top > window.innerHeight) {
      element.classList.add('reveal-pending');
      observer.observe(element);
    }
  });
}
