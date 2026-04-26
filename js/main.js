/* ═══════════════════════════════════════════════════════
   MAIN.JS — Cursor, Reveal, Counter, Tilt, Nav
   ═══════════════════════════════════════════════════════ */

(function() {

  // ─── CUSTOM CURSOR ───
  const cursor = document.getElementById('cursor');
  const trail  = document.getElementById('cursor-trail');
  let cx = 0, cy = 0, tx = 0, ty = 0;

  document.addEventListener('mousemove', e => { cx = e.clientX; cy = e.clientY; });

  function updateCursor() {
    cursor.style.left = cx + 'px';
    cursor.style.top  = cy + 'px';
    tx += (cx - tx) * 0.1;
    ty += (cy - ty) * 0.1;
    trail.style.left = tx + 'px';
    trail.style.top  = ty + 'px';
    requestAnimationFrame(updateCursor);
  }
  updateCursor();

  document.querySelectorAll('a, button, .proj-row, .skill-card, .stat-card, .contact-card').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  // ─── SCROLL REVEAL ───
  const revealEls = document.querySelectorAll('.reveal, .tl-item');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });
  revealEls.forEach(el => io.observe(el));

  // Stagger children
  document.querySelectorAll('.skills-grid, .about-stats, .projects-list, .contact-cards').forEach(grid => {
    [...grid.children].forEach((child, i) => {
      child.style.transitionDelay = (i * 0.08) + 's';
    });
  });

  // ─── COUNTER ANIMATION ───
  function animateCounter(numEl, suffixEl, target, duration) {
    let start = null;
    function step(ts) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      numEl.textContent = Math.floor(ease * target);
      if (suffixEl) suffixEl.style.opacity = progress.toString();
      if (progress < 1) requestAnimationFrame(step);
      else numEl.textContent = target;
    }
    requestAnimationFrame(step);
  }

  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const numEl    = e.target.querySelector('.stat-num');
        const suffixEl = e.target.querySelector('.stat-suffix');
        const target   = parseInt(numEl.dataset.target);
        if (!isNaN(target) && !numEl.dataset.animated) {
          numEl.dataset.animated = '1';
          animateCounter(numEl, suffixEl, target, 1600);
        }
      }
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('.stat-card').forEach(c => counterIO.observe(c));

  // ─── HERO NAME 3D TILT ───
  const tiltEl = document.getElementById('hero-tilt');
  document.addEventListener('mousemove', e => {
    if (!tiltEl) return;
    const xOff = (e.clientX / window.innerWidth  - 0.5) * 14;
    const yOff = (e.clientY / window.innerHeight - 0.5) * 8;
    tiltEl.querySelector('.hero-name').style.transform =
      `perspective(800px) rotateY(${xOff}deg) rotateX(${-yOff}deg)`;
  });

  // ─── NAVBAR SCROLL ───
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  });

  // ─── PROJECT ROW HOVER SOUND (subtle visual pulse) ───
  document.querySelectorAll('.proj-row').forEach(row => {
    row.addEventListener('mouseenter', () => {
      row.style.transition = 'all .4s';
    });
  });

  // ─── MAGNETIC BUTTONS ───
  document.querySelectorAll('.btn-primary, .btn-ghost').forEach(btn => {
    btn.addEventListener('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width  / 2;
      const y = e.clientY - rect.top  - rect.height / 2;
      this.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px) translateY(-3px)`;
    });
    btn.addEventListener('mouseleave', function() {
      this.style.transform = '';
      this.style.transition = 'transform .4s ease';
    });
  });

  // ─── SKILL CARDS — MOUSE PARALLAX ───
  document.querySelectorAll('.skill-card').forEach(card => {
    card.addEventListener('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      this.style.transform = `translateY(-6px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg)`;
      this.style.transition = 'transform 0s';
      const glow = this.querySelector('.skill-glow');
      if (glow) {
        glow.style.top  = (e.clientY - rect.top  - 100) + 'px';
        glow.style.left = (e.clientX - rect.left - 100) + 'px';
      }
    });
    card.addEventListener('mouseleave', function() {
      this.style.transform = '';
      this.style.transition = 'transform .4s ease';
    });
  });

  // ─── CIRCULAR FAVICON GENERATOR ───
  const faviconImg = new Image();
  faviconImg.src = 'assets/kaushal.png';
  faviconImg.onload = function() {
    const canvas = document.createElement('canvas');
    const size = 64;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
    ctx.clip();
    
    // Maintain aspect ratio while drawing
    const minSide = Math.min(faviconImg.width, faviconImg.height);
    const sx = (faviconImg.width - minSide) / 2;
    const sy = (faviconImg.height - minSide) / 2;
    ctx.drawImage(faviconImg, sx, sy, minSide, minSide, 0, 0, size, size);
    
    let link = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      document.head.appendChild(link);
    }
    link.type = 'image/png';
    link.rel = 'shortcut icon';
    link.href = canvas.toDataURL('image/png');
  };

})();
