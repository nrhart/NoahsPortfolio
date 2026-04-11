/* =========================================
   NAVIGATION: Dropdown & active state
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {

  // ── Dropdown toggle ──────────────────────
  const dropBtn = document.querySelector('.nav-btn');
  const dropMenu = document.querySelector('.dropdown-menu');

  if (dropBtn && dropMenu) {
    dropBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropMenu.classList.toggle('open');
      dropBtn.classList.toggle('open', isOpen);
      dropBtn.setAttribute('aria-expanded', isOpen);
    });

    document.addEventListener('click', (e) => {
      if (!dropBtn.contains(e.target) && !dropMenu.contains(e.target)) {
        dropMenu.classList.remove('open');
        dropBtn.classList.remove('open');
        dropBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ── Active nav link ───────────────────────
  const path = window.location.pathname.replace(/\\/g, '/');
  const navLinks = document.querySelectorAll('.nav-links a');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;

    // Normalise both paths for comparison
    const cleanPath = path.split('/').pop() || 'index.html';
    const cleanHref = href.split('/').pop();

    if (
      cleanHref === cleanPath ||
      (cleanPath === '' && cleanHref === 'index.html') ||
      (cleanPath === 'index.html' && cleanHref === 'index.html')
    ) {
      link.classList.add('active');
    }

    // Keep Projects button highlighted when on a project sub-page
    if (
      path.includes('/projects') &&
      link.closest('.nav-item-projects')
    ) {
      link.classList.add('active');
    }
  });

  // ── Scroll fade-in ────────────────────────
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

  // ── Image error fallback ──────────────────
  document.querySelectorAll('.showcase-img img, .featured-img img').forEach(img => {
    if (img.complete && img.naturalWidth === 0) {
      img.style.display = 'none';
      const placeholder = img.nextElementSibling;
      if (placeholder) placeholder.style.display = 'flex';
    }
  });

  // ── Staggered card animation ──────────────
  document.querySelectorAll('.card-grid .card, .project-list .project-item').forEach((card, i) => {
    card.style.transitionDelay = `${i * 60}ms`;
    card.classList.add('fade-in');
    observer.observe(card);
  });

  // ── Project snap slide-in ─────────────────
  const snapSections = document.querySelectorAll('.project-snap');
  if (snapSections.length) {
    const snapObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          snapObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18 });
    snapSections.forEach(el => snapObs.observe(el));
  }
});
