const viewport = document.querySelector('#viewport');
const deck = document.querySelector('#deck');
const slides = [...document.querySelectorAll('.slide')];
const prevBtn = document.querySelector('#prevBtn');
const nextBtn = document.querySelector('#nextBtn');
const homeBtn = document.querySelector('#homeBtn');
const presentBtn = document.querySelector('#presentBtn');
const overviewBtn = document.querySelector('#overviewBtn');
const overviewDialog = document.querySelector('#overviewDialog');
const closeOverview = document.querySelector('#closeOverview');
const overviewGrid = document.querySelector('#overviewGrid');
const currentSlide = document.querySelector('#currentSlide');
const totalSlides = document.querySelector('#totalSlides');
const progressFill = document.querySelector('#progressFill');

let index = 0;
let startX = 0;
let startY = 0;
let lastX = 0;
let lastY = 0;
let tracking = false;
let locked = false;
let lastWheel = 0;
let rafId = 0;

const pad = (n) => String(n).padStart(2, '0');
const clamp = (n) => Math.max(0, Math.min(slides.length - 1, n));
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isSmallScreen = () => window.innerWidth <= 760;

const guideTexts = [
  'Comecem apresentando o tema e a ideia central: gases parecem invisíveis, mas podem ser estudados por pressão, volume e temperatura. Depois, apresentem a equipe e o roteiro.',
  'Explique que gás perfeito é um modelo simplificado. Ele não copia a realidade com 100% de perfeição, mas ajuda a entender e calcular o comportamento dos gases.',
  'Mostre que temperatura, pressão e volume são as três grandezas principais. Uma boa frase é: temperatura é agitação, pressão é colisão, volume é espaço.',
  'Nesta parte, destaque que a fórmula pV = nRT junta todas as variáveis. Reforce que a temperatura precisa estar em Kelvin nos cálculos.',
  'Explique que isotérmica significa temperatura constante. Se o gás é comprimido, o volume diminui e a pressão aumenta. A simulação abaixo ajuda a visualizar isso.',
  'Na isobárica, a pressão fica constante. Quando o gás esquenta, ele precisa expandir para manter a pressão igual, como em um balão ou pistão.',
  'Na isocórica, o volume fica constante. O recipiente não aumenta, então quando a temperatura sobe, a pressão também sobe.',
  'Use este slide para revisar. A palavra iso significa igual: isotérmica mantém T, isobárica mantém p, isocórica mantém V.',
  'No exercício, mostre o raciocínio: como a temperatura é constante, usamos p₁V₁ = p₂V₂. O volume caiu, então a pressão subiu.',
  'Feche retomando a ideia principal: gases perfeitos ajudam a entender fenômenos reais por meio de relações simples entre pressão, volume e temperatura.'
];

const chapters = [
  { label: 'Capa', go: 0, range: [0, 0] },
  { label: 'Conceito', go: 1, range: [1, 1] },
  { label: 'Variáveis', go: 2, range: [2, 2] },
  { label: 'Equação', go: 3, range: [3, 3] },
  { label: 'Transformações', go: 4, range: [4, 7] },
  { label: 'Exercício', go: 8, range: [8, 8] },
  { label: 'Conclusão', go: 9, range: [9, 9] }
];

let chapterRail;
let guideDialog;

function createChapterRail() {
  chapterRail = document.createElement('nav');
  chapterRail.className = 'chapter-rail';
  chapterRail.setAttribute('aria-label', 'Capítulos da apresentação');

  chapters.forEach((chapter) => {
    const button = document.createElement('button');
    button.className = 'chapter-pill';
    button.type = 'button';
    button.textContent = chapter.label;
    button.addEventListener('click', () => goTo(chapter.go));
    chapterRail.appendChild(button);
  });

  document.body.appendChild(chapterRail);
}

function updateChapterRail() {
  if (!chapterRail) return;
  [...chapterRail.children].forEach((button, i) => {
    const [start, end] = chapters[i].range;
    button.classList.toggle('active', index >= start && index <= end);
  });
}

function render() {
  index = clamp(index);
  deck.style.transform = `translate3d(${-index * 100}vw,0,0)`;
  slides.forEach((slide, i) => {
    slide.classList.toggle('is-active', i === index);
    if (i === index) slide.scrollTop = 0;
  });
  prevBtn.disabled = index === 0;
  nextBtn.disabled = index === slides.length - 1;
  currentSlide.textContent = pad(index + 1);
  totalSlides.textContent = pad(slides.length);
  progressFill.style.width = `${((index + 1) / slides.length) * 100}%`;
  updateChapterRail();
}

function goTo(nextIndex) {
  if (locked) return;
  index = clamp(nextIndex);
  locked = true;
  render();
  window.setTimeout(() => (locked = false), 620);
}

const next = () => goTo(index + 1);
const prev = () => goTo(index - 1);

prevBtn.addEventListener('click', prev);
nextBtn.addEventListener('click', next);
homeBtn.addEventListener('click', () => goTo(0));

window.addEventListener('keydown', (event) => {
  if (overviewDialog.open || guideDialog?.open) return;
  if (['ArrowRight', 'PageDown', ' '].includes(event.key)) {
    event.preventDefault();
    next();
  }
  if (['ArrowLeft', 'PageUp'].includes(event.key)) {
    event.preventDefault();
    prev();
  }
  if (event.key === 'Home') {
    event.preventDefault();
    goTo(0);
  }
  if (event.key === 'End') {
    event.preventDefault();
    goTo(slides.length - 1);
  }
  if (event.key.toLowerCase() === 'r') {
    event.preventDefault();
    openGuide();
  }
});

window.addEventListener(
  'wheel',
  (event) => {
    if (overviewDialog.open || guideDialog?.open) return;
    const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY) * 1.35;
    if (!horizontal) return;
    const power = event.deltaX;
    if (Math.abs(power) < 28) return;
    event.preventDefault();
    const now = Date.now();
    if (now - lastWheel < 820 || locked) return;
    lastWheel = now;
    power > 0 ? next() : prev();
  },
  { passive: false }
);

viewport.addEventListener('pointerdown', (event) => {
  if (overviewDialog.open || guideDialog?.open || event.button !== 0) return;
  tracking = true;
  startX = lastX = event.clientX;
  startY = lastY = event.clientY;
});
viewport.addEventListener('pointermove', (event) => {
  if (!tracking) return;
  lastX = event.clientX;
  lastY = event.clientY;
});
viewport.addEventListener('pointercancel', () => {
  tracking = false;
});
viewport.addEventListener('pointerup', (event) => {
  if (!tracking || overviewDialog.open || guideDialog?.open) return;
  tracking = false;
  const dx = (event.clientX || lastX) - startX;
  const dy = (event.clientY || lastY) - startY;
  const absX = Math.abs(dx);
  const absY = Math.abs(dy);
  if (absX < 86 || absX < absY * 1.65) return;
  dx < 0 ? next() : prev();
});

async function togglePresentation() {
  if (!document.fullscreenElement) {
    try {
      await document.documentElement.requestFullscreen();
    } catch (_) {}
    presentBtn.textContent = 'Sair';
  } else {
    try {
      await document.exitFullscreen();
    } catch (_) {}
    presentBtn.textContent = 'Apresentar';
  }
}
presentBtn.addEventListener('click', togglePresentation);
document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement) presentBtn.textContent = 'Apresentar';
});

slides.forEach((slide, i) => {
  const img = slide.querySelector('img')?.getAttribute('src') || 'assets/images/hero.jpg';
  const card = document.createElement('button');
  card.className = 'overview-card';
  card.type = 'button';
  card.innerHTML = `<img src="${img}" alt=""><span>${pad(i + 1)}</span><strong>${slide.dataset.title}</strong>`;
  card.addEventListener('click', () => {
    overviewDialog.close();
    goTo(i);
  });
  overviewGrid.appendChild(card);
});
overviewBtn.addEventListener('click', () => overviewDialog.showModal());
closeOverview.addEventListener('click', () => overviewDialog.close());
overviewDialog.addEventListener('click', (event) => {
  if (event.target === overviewDialog) overviewDialog.close();
});

function createGuide() {
  const guideBtn = document.createElement('button');
  guideBtn.className = 'text-btn guide-btn';
  guideBtn.type = 'button';
  guideBtn.textContent = 'Roteiro';
  guideBtn.addEventListener('click', openGuide);
  document.querySelector('.top-actions')?.prepend(guideBtn);

  guideDialog = document.createElement('dialog');
  guideDialog.className = 'guide-dialog';
  guideDialog.innerHTML = `<div class="guide-card"><span class="eyebrow">Modo apresentação guiada</span><h2 class="guide-title" id="guideTitle"></h2><p class="guide-text" id="guideText"></p><div class="guide-actions"><button id="guideClose">Fechar</button><button id="guidePrev">Slide anterior</button><button class="primary" id="guideNext">Próximo slide</button></div></div>`;
  document.body.appendChild(guideDialog);

  guideDialog.querySelector('#guideClose').addEventListener('click', () => guideDialog.close());
  guideDialog.querySelector('#guidePrev').addEventListener('click', () => {
    guideDialog.close();
    prev();
    setTimeout(openGuide, 660);
  });
  guideDialog.querySelector('#guideNext').addEventListener('click', () => {
    guideDialog.close();
    next();
    setTimeout(openGuide, 660);
  });
  guideDialog.addEventListener('click', (event) => {
    if (event.target === guideDialog) guideDialog.close();
  });
}

function fillGuide() {
  guideDialog.querySelector('#guideTitle').textContent = `${pad(index + 1)} • ${slides[index].dataset.title}`;
  guideDialog.querySelector('#guideText').textContent = guideTexts[index] || 'Explique este slide com calma, conectando a imagem ao texto principal.';
}

function openGuide() {
  if (!guideDialog) return;
  fillGuide();
  guideDialog.showModal();
}

function createStartButton() {
  const startBtn = document.createElement('button');
  startBtn.className = 'immersive-start';
  startBtn.type = 'button';
  startBtn.textContent = 'Iniciar apresentação guiada';
  startBtn.addEventListener('click', () => {
    goTo(0);
    setTimeout(openGuide, 680);
  });
  slides[0]?.appendChild(startBtn);
}

function createIsothermalSimulation() {
  const isoPanel = slides[4]?.querySelector('.panel');
  if (!isoPanel || isoPanel.querySelector('.mini-sim')) return;

  const sim = document.createElement('div');
  sim.className = 'mini-sim';
  sim.innerHTML = `<div class="mini-sim-head"><strong>Mini simulação isotérmica</strong><span>T constante</span></div><div class="sim-chamber" id="simChamber"><div class="sim-gas"><i class="sim-dot"></i><i class="sim-dot"></i><i class="sim-dot"></i><i class="sim-dot"></i><i class="sim-dot"></i><i class="sim-dot"></i></div><div class="sim-piston" id="simPiston"></div></div><div class="sim-controls"><label>Pressão<input id="pressureRange" type="range" min="1" max="6" value="2" step="0.1" aria-label="Pressão"></label><strong id="pressureValue">2.0 atm</strong></div><div class="sim-readout"><span>Volume: <b id="volumeValue">3.0 L</b></span><span>p × V = <b id="pvValue">6.0</b></span></div>`;
  isoPanel.appendChild(sim);

  const pressureRange = sim.querySelector('#pressureRange');
  const pressureValue = sim.querySelector('#pressureValue');
  const volumeValue = sim.querySelector('#volumeValue');
  const pvValue = sim.querySelector('#pvValue');
  const chamber = sim.querySelector('#simChamber');
  const constantPV = 6;

  function updateSim() {
    const pressure = Number(pressureRange.value);
    const volume = constantPV / pressure;
    const minVolume = constantPV / Number(pressureRange.max);
    const maxVolume = constantPV / Number(pressureRange.min);
    const normalized = (volume - minVolume) / (maxVolume - minVolume);
    const gasWidth = 22 + normalized * 58;

    pressureValue.textContent = `${pressure.toFixed(1)} atm`;
    volumeValue.textContent = `${volume.toFixed(1)} L`;
    pvValue.textContent = constantPV.toFixed(1);
    chamber.style.setProperty('--gas-width', `${gasWidth.toFixed(1)}%`);
  }

  pressureRange.addEventListener('input', updateSim, { passive: true });
  updateSim();
}

function createCredits() {
  const conclusionPanel = slides[9]?.querySelector('.panel');
  if (!conclusionPanel || conclusionPanel.querySelector('.credits-card')) return;

  const credits = document.createElement('div');
  credits.className = 'credits-card';
  credits.innerHTML = '<strong>Apresentado por</strong><div><span>Mateus Henrique</span><span>Gabriel Carramão</span><span>Fernanda Celestino</span><span>Marcos Adilson</span></div><p class="credits-meta">Turma: EJA 3TA</p><p class="credits-meta">Professor: Melquesedeque</p>';
  conclusionPanel.appendChild(credits);
}

function createParticles() {
  if (reducedMotion || isSmallScreen()) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'particle-canvas';
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d', { alpha: true });
  let particles = [];

  function resetParticles() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.floor(innerWidth * dpr);
    canvas.height = Math.floor(innerHeight * dpr);
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(46, Math.max(24, Math.floor(innerWidth / 32)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      r: 1.4 + Math.random() * 2.2,
      vx: (Math.random() - 0.5) * 0.34,
      vy: (Math.random() - 0.5) * 0.34
    }));
  }

  function drawParticles() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    ctx.fillStyle = 'rgba(103,80,164,.50)';
    ctx.strokeStyle = 'rgba(103,80,164,.14)';

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > innerWidth) p.vx *= -1;
      if (p.y < 0 || p.y > innerHeight) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 110) {
          ctx.globalAlpha = (110 - dist) / 460;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }
    rafId = requestAnimationFrame(drawParticles);
  }

  resetParticles();
  drawParticles();
  window.addEventListener('resize', resetParticles, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
    } else {
      drawParticles();
    }
  });
}

createChapterRail();
createGuide();
createStartButton();
createIsothermalSimulation();
createCredits();
createParticles();

window.addEventListener('resize', render, { passive: true });
render();
