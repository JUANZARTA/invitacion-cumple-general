/* ============================================================
   CONFIGURACIÓN
   ============================================================ */
const CUMPLE = {
  name:      'Sofía García',
  age:       '25',
  phone:     '573128622945',
  hashtag:   '#Sofia25',
  eventDate: new Date('2026-12-06T19:00:00'),
};

document.title = `¡${CUMPLE.age} años! · ${CUMPLE.name}`;
document.querySelectorAll('[data-c="name"]').forEach(el => el.textContent = CUMPLE.name);
document.querySelectorAll('[data-c="hashtag"]').forEach(el => el.textContent = CUMPLE.hashtag);

/* ============================================================
   CANVAS CONFETTI
   ============================================================ */
(function () {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const COLORS = [
    '#C1666B', '#D4956A', '#E8A598', '#BB7D54',
    '#C084FC', '#FBEAE5', '#D4956A', '#A8EDEA',
    '#E8C4A0', '#F5DDD6'
  ];

  const SHAPES = ['circle', 'rect', 'triangle'];

  class Confetto {
    constructor(burst = false) {
      this.init(burst);
    }

    init(burst) {
      if (burst) {
        // Explosion desde el centro
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 14 + 4;
        this.x  = canvas.width  / 2 + (Math.random() - 0.5) * 80;
        this.y  = canvas.height / 2 + (Math.random() - 0.5) * 80;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed - (Math.random() * 6 + 2);
        this.phase = 'burst';
      } else {
        // Caída suave desde arriba
        this.x  = Math.random() * canvas.width;
        this.y  = -20;
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = Math.random() * 2 + 0.8;
        this.phase = 'fall';
      }

      this.color  = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.shape  = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      this.size   = Math.random() * 8 + 5;
      this.alpha  = 1;
      this.rot    = Math.random() * Math.PI * 2;
      this.rotV   = (Math.random() - 0.5) * 0.18;
      this.wobble = Math.random() * Math.PI * 2;
      this.wSpeed = Math.random() * 0.04 + 0.01;
      this.gravity = 0.22;
      this.dead   = false;
    }

    update() {
      this.wobble += this.wSpeed;
      this.x  += this.vx + Math.sin(this.wobble) * 0.6;
      this.y  += this.vy;
      this.rot += this.rotV;

      if (this.phase === 'burst') {
        this.vy += this.gravity;
        this.vx *= 0.98;
        this.alpha -= 0.008;
        if (this.alpha <= 0 || this.y > canvas.height + 20) this.dead = true;
      } else {
        this.vy += 0.04;
        if (this.y > canvas.height + 20) this.dead = true;
      }
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.alpha);
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot);
      ctx.fillStyle = this.color;

      switch (this.shape) {
        case 'circle':
          ctx.beginPath();
          ctx.ellipse(0, 0, this.size / 2, this.size / 3, 0, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'rect':
          ctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
          break;
        case 'triangle':
          ctx.beginPath();
          ctx.moveTo(0, -this.size / 2);
          ctx.lineTo(this.size / 2, this.size / 2);
          ctx.lineTo(-this.size / 2, this.size / 2);
          ctx.closePath();
          ctx.fill();
          break;
      }
      ctx.restore();
    }
  }

  let particles = [];
  let fallParticles = [];

  // Explosion inicial al cargar
  function burst() {
    for (let i = 0; i < 180; i++) {
      particles.push(new Confetto(true));
    }
  }

  // Partículas flotantes permanentes
  function seedFall() {
    for (let i = 0; i < 40; i++) {
      const p = new Confetto(false);
      p.y = Math.random() * canvas.height; // seed distribuido
      fallParticles.push(p);
    }
  }

  burst();
  seedFall();

  let lastBurst = Date.now();

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Burst particles
    particles = particles.filter(p => {
      p.update();
      p.draw();
      return !p.dead;
    });

    // Re-burst periódico suave cada 8 segundos
    if (Date.now() - lastBurst > 8000 && particles.length < 20) {
      for (let i = 0; i < 60; i++) particles.push(new Confetto(true));
      lastBurst = Date.now();
    }

    // Fall particles loop
    fallParticles.forEach(p => {
      p.update();
      p.draw();
      if (p.dead) p.init(false);
    });

    requestAnimationFrame(loop);
  }

  loop();
})();

/* ============================================================
   MÚSICA
   ============================================================ */
const musicBtn = document.getElementById('music-btn');
const bgMusic  = document.getElementById('bg-music');

window.addEventListener('load', () => {
  if (!bgMusic) return;
  bgMusic.volume = 0.6;
  bgMusic.muted  = true;

  bgMusic.play().then(() => {
    musicBtn.classList.add('playing');
    const unmute = () => { bgMusic.muted = false; };
    ['click', 'touchstart', 'scroll', 'keydown'].forEach(e =>
      document.addEventListener(e, unmute, { once: true, passive: true })
    );
  }).catch(() => {
    const startOnClick = () => {
      bgMusic.muted = false;
      bgMusic.play()
        .then(() => musicBtn.classList.add('playing'))
        .catch(() => {});
    };
    document.addEventListener('click',      startOnClick, { once: true });
    document.addEventListener('touchstart', startOnClick, { once: true });
  });
});

if (musicBtn) {
  musicBtn.addEventListener('click', () => {
    if (!bgMusic) return;
    if (bgMusic.paused) {
      bgMusic.play();
      musicBtn.classList.remove('paused');
      musicBtn.classList.add('playing');
    } else {
      bgMusic.pause();
      musicBtn.classList.remove('playing');
      musicBtn.classList.add('paused');
    }
  });
}

/* ============================================================
   NAVBAR
   ============================================================ */
const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('nav-hamburger');
const drawer    = document.getElementById('nav-drawer');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 70);
}, { passive: true });

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  drawer.classList.toggle('open');
  document.body.style.overflow = drawer.classList.contains('open') ? 'hidden' : '';
});

drawer.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    hamburger.classList.remove('open');
    drawer.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ============================================================
   COUNTDOWN (HERO + SECCIÓN)
   ============================================================ */
const EVENT_DATE = CUMPLE.eventDate;

const cdDays    = document.getElementById('cd-days');
const cdHours   = document.getElementById('cd-hours');
const cdMinutes = document.getElementById('cd-minutes');
const cdSeconds = document.getElementById('cd-seconds');

const crDays    = document.getElementById('cr-days');
const crHours   = document.getElementById('cr-hours');
const crMinutes = document.getElementById('cr-minutes');
const crSeconds = document.getElementById('cr-seconds');

function pad(n) { return String(n).padStart(2, '0'); }

function animateFlip(el, newVal) {
  if (!el || el.textContent === newVal) return;
  el.classList.add('flip-out');
  setTimeout(() => {
    el.textContent = newVal;
    el.classList.remove('flip-out');
    el.classList.add('flip-in');
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.remove('flip-in')));
  }, 140);
}

function tick() {
  const diff = EVENT_DATE - Date.now();

  if (diff <= 0) {
    const cdWrap = document.querySelector('.countdown-wrapper');
    if (cdWrap) {
      cdWrap.innerHTML = '<p style="font-family:var(--ff-display);font-size:1.8rem;color:#D4956A;text-shadow:0 2px 12px rgba(0,0,0,.4)">¡HOY ES EL GRAN DÍA! 🎉</p>';
    }
    const crWrap = document.querySelector('.cr-circles');
    if (crWrap) {
      crWrap.innerHTML = '<p style="font-family:var(--ff-display);font-size:2rem;color:#fff">¡Feliz Cumple Sofía! 🎂</p>';
    }
    return;
  }

  const days    = pad(Math.floor(diff / 86400000));
  const hours   = pad(Math.floor((diff % 86400000) / 3600000));
  const minutes = pad(Math.floor((diff % 3600000)  / 60000));
  const seconds = pad(Math.floor((diff % 60000)    / 1000));

  animateFlip(cdDays,    days);
  animateFlip(cdHours,   hours);
  animateFlip(cdMinutes, minutes);
  animateFlip(cdSeconds, seconds);

  if (crDays)    crDays.textContent    = days;
  if (crHours)   crHours.textContent   = hours;
  if (crMinutes) crMinutes.textContent = minutes;
  if (crSeconds) crSeconds.textContent = seconds;
}
tick();
setInterval(tick, 1000);

/* ============================================================
   SCROLL REVEAL
   ============================================================ */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ============================================================
   GALLERY LIGHTBOX
   ============================================================ */
const GALLERY_SRCS = [
  'Fotos/img (1).png',
  'Fotos/img (2).png',
  'Fotos/img (3).png',
  'Fotos/img (4).png',
];

let lbIndex    = 0;
const lightbox = document.getElementById('lightbox');
const lbImg    = document.getElementById('lb-img');

function openLightbox(idx) {
  lbIndex = ((idx % GALLERY_SRCS.length) + GALLERY_SRCS.length) % GALLERY_SRCS.length;
  lbImg.src = GALLERY_SRCS[lbIndex];
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

document.querySelectorAll('.gallery-item').forEach((item, i) => {
  item.addEventListener('click', () => openLightbox(i));
  item.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openLightbox(i);
    }
  });
});

document.getElementById('lb-close').addEventListener('click', closeLightbox);
document.getElementById('lb-prev') .addEventListener('click', () => openLightbox(lbIndex - 1));
document.getElementById('lb-next') .addEventListener('click', () => openLightbox(lbIndex + 1));
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowLeft')  openLightbox(lbIndex - 1);
  if (e.key === 'ArrowRight') openLightbox(lbIndex + 1);
});

/* ============================================================
   MINI TRIVIA — interacción
   ============================================================ */
document.querySelectorAll('.trivia-card').forEach(card => {
  const opts = card.querySelectorAll('.trivia-opt');
  let answered = false;

  opts.forEach(opt => {
    opt.addEventListener('click', () => {
      if (answered) return;
      answered = true;

      const isCorrect = opt.classList.contains('trivia-opt--correct');

      opts.forEach(o => {
        if (o === opt) {
          o.classList.add(isCorrect ? 'trivia-opt--selected-correct' : 'trivia-opt--selected-wrong');
        } else if (!o.classList.contains('trivia-opt--correct')) {
          o.classList.add('trivia-opt--wrong');
        }
        // Siempre mostrar la correcta
        if (o.classList.contains('trivia-opt--correct')) {
          o.classList.add('trivia-opt--selected-correct');
        }
      });
    });
  });
});

/* ============================================================
   SMOOTH SCROLL
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - 72,
      behavior: 'smooth'
    });
  });
});
