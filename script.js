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

const pad = (n) => String(n).padStart(2, '0');
const clamp = (n) => Math.max(0, Math.min(slides.length - 1, n));

const immersiveCss = `
.particle-canvas{position:fixed;inset:0;z-index:1;pointer-events:none;opacity:.38;mix-blend-mode:multiply}.slide-layout,.hero-panel{z-index:3}.chapter-rail{position:fixed;z-index:58;top:74px;left:50%;transform:translateX(-50%);display:flex;gap:8px;padding:8px;border:1px solid #e7e0ec;border-radius:999px;background:#fffbfed0;backdrop-filter:blur(18px);box-shadow:0 10px 30px #1d1b2012}.chapter-pill{border:0;border-radius:999px;padding:8px 12px;background:transparent;color:#625b71;font-weight:850;cursor:pointer;white-space:nowrap}.chapter-pill.active{background:#6750a4;color:#fff;box-shadow:0 8px 18px #6750a433}.guide-dialog{width:min(760px,calc(100vw - 28px));border:0;border-radius:32px;background:#fffbfe;color:#1d1b20;padding:0;box-shadow:0 30px 100px #0005}.guide-dialog::backdrop{background:#1d1b2088;backdrop-filter:blur(14px)}.guide-card{position:relative;overflow:hidden;padding:26px;border:1px solid #e7e0ec;border-radius:32px}.guide-card:before{content:"";position:absolute;inset:-40% -10% auto;height:220px;background:radial-gradient(circle,#eaddff,transparent 64%);z-index:0}.guide-card>*{position:relative;z-index:1}.guide-title{font-size:clamp(1.8rem,5vw,3rem);line-height:1;margin:6px 0 12px;letter-spacing:-.05em}.guide-text{font-size:1.08rem;line-height:1.55;color:#625b71}.guide-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}.guide-actions button{border:1px solid #e7e0ec;border-radius:999px;background:#fff;padding:11px 14px;font-weight:850;cursor:pointer}.guide-actions .primary{border:0;background:#6750a4;color:#fff}.mini-sim{margin-top:16px;border:1px solid #e7e0ec;border-radius:24px;background:linear-gradient(135deg,#fffbfedf,#f7f2fa);padding:16px;box-shadow:inset 0 0 0 1px #ffffff88}.mini-sim-head{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:12px}.mini-sim-head strong{font-size:1.05rem}.mini-sim-head span{color:#6750a4;font-weight:850}.sim-chamber{height:96px;border:1px solid #d9d1e3;border-radius:22px;background:#ffffffbf;position:relative;overflow:hidden;margin:10px 0 12px}.sim-piston{position:absolute;right:0;top:0;bottom:0;width:36%;background:linear-gradient(90deg,#d0bcff,#6750a4);opacity:.74;border-left:3px solid #6750a4;transition:width .25s ease}.sim-dot{position:absolute;width:9px;height:9px;border-radius:999px;background:#6750a4;box-shadow:0 0 12px #6750a488;animation:simMove 1.7s linear infinite}.sim-dot:nth-child(2){left:18%;top:28%;animation-duration:1.2s}.sim-dot:nth-child(3){left:36%;top:66%;animation-duration:1.45s}.sim-dot:nth-child(4){left:52%;top:38%;animation-duration:1.1s}.sim-dot:nth-child(5){left:68%;top:58%;animation-duration:1.35s}.sim-dot:nth-child(6){left:25%;top:74%;animation-duration:1.55s}@keyframes simMove{0%{transform:translate(0,0)}25%{transform:translate(22px,-12px)}50%{transform:translate(-14px,14px)}75%{transform:translate(18px,10px)}100%{transform:translate(0,0)}}.sim-controls{display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center}.sim-controls input{width:100%;accent-color:#6750a4}.sim-readout{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.sim-readout span{border:1px solid #e7e0ec;background:#fff;border-radius:999px;padding:8px 10px;color:#625b71;font-weight:800}.credits-card{margin-top:16px;border:1px solid #e7e0ec;border-radius:24px;background:#f7f2fa;padding:16px}.credits-card strong{display:block;color:#6750a4;margin-bottom:8px}.credits-card div{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px}.credits-card span{background:#fff;border:1px solid #e7e0ec;border-radius:999px;padding:8px 10px;font-weight:800;color:#1d1b20}.credits-meta{margin:4px 0 0;color:#625b71;font-weight:800}.immersive-start{position:absolute;left:26px;bottom:26px;z-index:4;border:0;border-radius:999px;background:linear-gradient(135deg,#6750a4,#3f7ee8);color:#fff;padding:14px 18px;font-weight:900;box-shadow:0 18px 46px #6750a445;cursor:pointer}.guide-btn{margin-right:6px}@media(max-width:980px){.particle-canvas{opacity:.22}.chapter-rail{top:auto;bottom:calc(72px + env(safe-area-inset-bottom));left:12px;right:12px;transform:none;overflow-x:auto;justify-content:flex-start;border-radius:22px;padding:7px}.chapter-rail::-webkit-scrollbar{display:none}.chapter-pill{font-size:.86rem;padding:8px 10px}.guide-card{padding:20px}.mini-sim{padding:13px}.sim-chamber{height:82px}.immersive-start{left:16px;bottom:calc(78px + env(safe-area-inset-bottom));padding:12px 14px}.guide-btn{display:inline-flex!important}}@media(max-width:420px){.chapter-rail{display:none}.immersive-start{position:static;margin-top:14px;width:100%}}@media(prefers-reduced-motion:reduce){.particle-canvas{display:none}.sim-dot{animation:none}.ambient{animation:none}}
`;

const style = document.createElement('style');
style.textContent = immersiveCss;
document.head.appendChild(style);

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

const chapters = [
  { label: 'Capa', go: 0, range: [0, 0] },
  { label: 'Conceito', go: 1, range: [1, 1] },
  { label: 'Variáveis', go: 2, range: [2, 2] },
  { label: 'Equação', go: 3, range: [3, 3] },
  { label: 'Transformações', go: 4, range: [4, 7] },
  { label: 'Exercício', go: 8, range: [8, 8] },
  { label: 'Conclusão', go: 9, range: [9, 9] }
];

const chapterRail = document.createElement('nav');
chapterRail.className = 'chapter-rail';
chapterRail.setAttribute('aria-label', 'Capítulos da apresentação');
chapters.forEach((chapter) => {
  const button = document.createElement('button');
  button.className = 'chapter-pill';
  button.textContent = chapter.label;
  button.addEventListener('click', () => goTo(chapter.go));
  chapterRail.appendChild(button);
});
document.body.appendChild(chapterRail);

const guideBtn = document.createElement('button');
guideBtn.className = 'text-btn guide-btn';
guideBtn.textContent = 'Roteiro';
guideBtn.addEventListener('click', openGuide);
document.querySelector('.top-actions')?.prepend(guideBtn);

const guideDialog = document.createElement('dialog');
guideDialog.className = 'guide-dialog';
guideDialog.innerHTML = `<div class="guide-card"><span class="eyebrow">Modo apresentação guiada</span><h2 class="guide-title" id="guideTitle"></h2><p class="guide-text" id="guideText"></p><div class="guide-actions"><button id="guideClose">Fechar</button><button id="guidePrev">Slide anterior</button><button class="primary" id="guideNext">Próximo slide</button></div></div>`;
document.body.appendChild(guideDialog);

function fillGuide() {
  document.querySelector('#guideTitle').textContent = `${pad(index + 1)} • ${slides[index].dataset.title}`;
  document.querySelector('#guideText').textContent = guideTexts[index] || 'Explique este slide com calma, conectando a imagem ao texto principal.';
}
function openGuide() {
  fillGuide();
  guideDialog.showModal();
}

document.querySelector('#guideClose').addEventListener('click', () => guideDialog.close());
document.querySelector('#guidePrev').addEventListener('click', () => {
  guideDialog.close();
  prev();
  setTimeout(openGuide, 660);
});
document.querySelector('#guideNext').addEventListener('click', () => {
  guideDialog.close();
  next();
  setTimeout(openGuide, 660);
});
guideDialog.addEventListener('click', (event) => {
  if (event.target === guideDialog) guideDialog.close();
});

const startBtn = document.createElement('button');
startBtn.className = 'immersive-start';
startBtn.textContent = 'Iniciar apresentação guiada';
startBtn.addEventListener('click', () => {
  goTo(0);
  setTimeout(openGuide, 680);
});
slides[0]?.appendChild(startBtn);

const isoPanel = slides[4]?.querySelector('.panel');
if (isoPanel) {
  const sim = document.createElement('div');
  sim.className = 'mini-sim';
  sim.innerHTML = `<div class="mini-sim-head"><strong>Mini simulação isotérmica</strong><span>T constante</span></div><div class="sim-chamber"><div class="sim-piston" id="simPiston"></div><i class="sim-dot"></i><i class="sim-dot"></i><i class="sim-dot"></i><i class="sim-dot"></i><i class="sim-dot"></i></div><div class="sim-controls"><input id="pressureRange" type="range" min="1" max="6" value="2" step="0.1" aria-label="Pressão"><strong id="pressureValue">2.0 atm</strong></div><div class="sim-readout"><span>Volume: <b id="volumeValue">3.0 L</b></span><span>p × V constante</span></div>`;
  isoPanel.appendChild(sim);
  const pressureRange = sim.querySelector('#pressureRange');
  const pressureValue = sim.querySelector('#pressureValue');
  const volumeValue = sim.querySelector('#volumeValue');
  const piston = sim.querySelector('#simPiston');
  function updateSim() {
    const p = Number(pressureRange.value);
    const v = 6 / p;
    pressureValue.textContent = `${p.toFixed(1)} atm`;
    volumeValue.textContent = `${v.toFixed(1)} L`;
    piston.style.width = `${Math.min(74, 18 + p * 9)}%`;
  }
  pressureRange.addEventListener('input', updateSim);
  updateSim();
}

const conclusionPanel = slides[9]?.querySelector('.panel');
if (conclusionPanel) {
  const credits = document.createElement('div');
  credits.className = 'credits-card';
  credits.innerHTML = '<strong>Apresentado por</strong><div><span>Mateus Henrique</span><span>Gabriel Carramão</span><span>Fernanda Celestino</span><span>Marcos Adilson</span></div><p class="credits-meta">Turma: EJA 3TA</p><p class="credits-meta">Professor: Melque</p>';
  conclusionPanel.appendChild(credits);
}

const canvas = document.createElement('canvas');
canvas.className = 'particle-canvas';
document.body.prepend(canvas);
const ctx = canvas.getContext('2d');
let particles = [];

function resetParticles() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(innerWidth * dpr);
  canvas.height = Math.floor(innerHeight * dpr);
  canvas.style.width = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const count = Math.min(70, Math.max(28, Math.floor(innerWidth / 18)));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    r: 1.5 + Math.random() * 2.8,
    vx: (Math.random() - 0.5) * 0.45,
    vy: (Math.random() - 0.5) * 0.45
  }));
}

function drawParticles() {
  if (!ctx) return;
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  ctx.fillStyle = 'rgba(103,80,164,.58)';
  ctx.strokeStyle = 'rgba(103,80,164,.16)';
  particles.forEach((p, idx) => {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > innerWidth) p.vx *= -1;
    if (p.y < 0 || p.y > innerHeight) p.vy *= -1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
    for (let j = idx + 1; j < particles.length; j++) {
      const q = particles[j];
      const dx = p.x - q.x;
      const dy = p.y - q.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 120) {
        ctx.globalAlpha = (120 - dist) / 450;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
  });
  requestAnimationFrame(drawParticles);
}

if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  resetParticles();
  drawParticles();
  window.addEventListener('resize', resetParticles);
}

window.addEventListener('resize', render);
render();
