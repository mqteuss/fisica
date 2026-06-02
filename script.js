const deck = document.querySelector('#deck');
const slides = [...document.querySelectorAll('.slide')];
const dotsWrap = document.querySelector('#dots');
const prevBtn = document.querySelector('#prevBtn');
const nextBtn = document.querySelector('#nextBtn');
const homeBtn = document.querySelector('#homeBtn');
const finishBtn = document.querySelector('#finishBtn');
const slideNumber = document.querySelector('#slideNumber');
const slideTotal = document.querySelector('#slideTotal');
const progressFill = document.querySelector('#progressFill');
const presentBtn = document.querySelector('#presentBtn');
const overviewBtn = document.querySelector('#overviewBtn');
const overviewDialog = document.querySelector('#overviewDialog');
const closeOverview = document.querySelector('#closeOverview');
const overviewGrid = document.querySelector('#overviewGrid');

let currentIndex = 0;
let isPointerDown = false;
let dragStartX = 0;
let scrollStartX = 0;
let lastWheelAt = 0;

const pad = (n) => String(n).padStart(2, '0');

function clampIndex(index) {
  return Math.max(0, Math.min(slides.length - 1, index));
}

function goTo(index, behavior = 'smooth') {
  const nextIndex = clampIndex(index);
  deck.scrollTo({ left: nextIndex * deck.clientWidth, behavior });
  setActive(nextIndex);
}

function setActive(index) {
  currentIndex = clampIndex(index);
  slides.forEach((slide, i) => slide.classList.toggle('is-active', i === currentIndex));
  [...dotsWrap.children].forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
  slideNumber.textContent = pad(currentIndex + 1);
  slideTotal.textContent = pad(slides.length);
  progressFill.style.width = `${((currentIndex + 1) / slides.length) * 100}%`;
  prevBtn.disabled = currentIndex === 0;
  nextBtn.disabled = currentIndex === slides.length - 1;
}

function buildDots() {
  dotsWrap.innerHTML = '';
  slides.forEach((slide, index) => {
    const dot = document.createElement('button');
    dot.className = 'slide-dot';
    dot.type = 'button';
    dot.title = `${pad(index + 1)} — ${slide.dataset.title}`;
    dot.setAttribute('aria-label', `Ir para o slide ${index + 1}: ${slide.dataset.title}`);
    dot.addEventListener('click', () => goTo(index));
    dotsWrap.appendChild(dot);
  });
}

function buildOverview() {
  overviewGrid.innerHTML = '';
  slides.forEach((slide, index) => {
    const card = document.createElement('button');
    card.className = 'overview-card';
    card.type = 'button';
    card.innerHTML = `<span>${pad(index + 1)}</span><strong>${slide.dataset.title}</strong>`;
    card.addEventListener('click', () => {
      overviewDialog.close();
      goTo(index);
    });
    overviewGrid.appendChild(card);
  });
}

function getIndexFromScroll() {
  return clampIndex(Math.round(deck.scrollLeft / deck.clientWidth));
}

function syncFromScroll() {
  const index = getIndexFromScroll();
  if (index !== currentIndex) setActive(index);
}

function handleKeyboard(event) {
  if (overviewDialog.open) return;
  const keys = ['ArrowRight', 'PageDown', ' ', 'ArrowLeft', 'PageUp', 'Home', 'End'];
  if (!keys.includes(event.key)) return;
  event.preventDefault();

  if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') goTo(currentIndex + 1);
  if (event.key === 'ArrowLeft' || event.key === 'PageUp') goTo(currentIndex - 1);
  if (event.key === 'Home') goTo(0);
  if (event.key === 'End') goTo(slides.length - 1);
}

function handleWheel(event) {
  if (Math.abs(event.deltaY) < 8 && Math.abs(event.deltaX) < 8) return;
  event.preventDefault();
  const now = Date.now();
  if (now - lastWheelAt < 520) return;
  lastWheelAt = now;
  const direction = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
  goTo(currentIndex + (direction > 0 ? 1 : -1));
}

function pointerDown(event) {
  isPointerDown = true;
  dragStartX = event.clientX;
  scrollStartX = deck.scrollLeft;
  deck.setPointerCapture?.(event.pointerId);
}

function pointerMove(event) {
  if (!isPointerDown) return;
  const dx = dragStartX - event.clientX;
  deck.scrollLeft = scrollStartX + dx;
}

function pointerUp(event) {
  if (!isPointerDown) return;
  isPointerDown = false;
  deck.releasePointerCapture?.(event.pointerId);
  goTo(getIndexFromScroll());
}

async function togglePresentationMode() {
  document.body.classList.toggle('presentation-active');
  if (!document.fullscreenElement) {
    try { await document.documentElement.requestFullscreen(); } catch (_) {}
    presentBtn.textContent = 'Sair';
  } else {
    try { await document.exitFullscreen(); } catch (_) {}
    presentBtn.textContent = 'Modo apresentação';
  }
  deck.focus();
}

function initMiniLab() {
  const lab = document.querySelector('[data-lab="isothermal"]');
  if (!lab) return;
  const pressure = lab.querySelector('[data-control="p"]');
  const outP = lab.querySelector('[data-out="p"]');
  const outV = lab.querySelector('[data-out="v"]');
  const constant = 6;

  const update = () => {
    const p = Number(pressure.value);
    const v = constant / p;
    outP.textContent = p.toFixed(1);
    outV.textContent = v.toFixed(1);
  };

  pressure.addEventListener('input', update);
  update();
}

function boot() {
  buildDots();
  buildOverview();
  setActive(0);
  initMiniLab();
  deck.focus({ preventScroll: true });

  deck.addEventListener('scroll', () => requestAnimationFrame(syncFromScroll), { passive: true });
  deck.addEventListener('wheel', handleWheel, { passive: false });
  deck.addEventListener('pointerdown', pointerDown);
  deck.addEventListener('pointermove', pointerMove);
  deck.addEventListener('pointerup', pointerUp);
  deck.addEventListener('pointercancel', pointerUp);

  window.addEventListener('keydown', handleKeyboard);
  window.addEventListener('resize', () => goTo(currentIndex, 'auto'));
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
      document.body.classList.remove('presentation-active');
      presentBtn.textContent = 'Modo apresentação';
    }
  });

  prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
  nextBtn.addEventListener('click', () => goTo(currentIndex + 1));
  homeBtn.addEventListener('click', () => goTo(0));
  finishBtn?.addEventListener('click', () => goTo(0));
  presentBtn.addEventListener('click', togglePresentationMode);
  overviewBtn.addEventListener('click', () => overviewDialog.showModal());
  closeOverview.addEventListener('click', () => overviewDialog.close());
  overviewDialog.addEventListener('click', (event) => {
    if (event.target === overviewDialog) overviewDialog.close();
  });
}

boot();
