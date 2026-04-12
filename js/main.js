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

  // ── Expandable contributions on card click ─
  let expandedCard = null;
  
  document.querySelectorAll('.showcase-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't expand if clicking on a link or button
      if (e.target.closest('a, button, iframe')) return;
      
      const wrapper = card.querySelector('.showcase-contrib-wrapper');
      if (wrapper) {
        // If this card is already expanded, collapse it
        if (expandedCard === card) {
          wrapper.classList.remove('expanded');
          expandedCard = null;
        } else {
          // Collapse any previously expanded card
          if (expandedCard) {
            const prevWrapper = expandedCard.querySelector('.showcase-contrib-wrapper');
            if (prevWrapper) prevWrapper.classList.remove('expanded');
          }
          // Expand this card
          wrapper.classList.add('expanded');
          expandedCard = card;
        }
      }
    });
    // Add cursor pointer to show it's clickable
    card.style.cursor = 'pointer';
  });
  
  // Close expanded card when clicking outside
  document.addEventListener('click', (e) => {
    if (expandedCard && !expandedCard.contains(e.target)) {
      const wrapper = expandedCard.querySelector('.showcase-contrib-wrapper');
      if (wrapper) wrapper.classList.remove('expanded');
      expandedCard = null;
    }
  });


  // ── Photo lightbox ────────────────────────
  document.querySelectorAll('.photo-expandable').forEach(img => {
    const openLightbox = () => {
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');

      const enlarged = document.createElement('img');
      enlarged.src = img.src;
      enlarged.alt = img.alt;
      enlarged.className = 'photo-lightbox-img';

      const closeBtn = document.createElement('button');
      closeBtn.className = 'modal-close';
      closeBtn.innerHTML = '&times;';
      closeBtn.setAttribute('aria-label', 'Close');

      overlay.appendChild(enlarged);
      overlay.appendChild(closeBtn);
      document.body.appendChild(overlay);
      document.body.style.overflow = 'hidden';

      requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('open')));

      const close = () => {
        overlay.classList.remove('open');
        overlay.addEventListener('transitionend', () => {
          overlay.remove();
          document.body.style.overflow = '';
        }, { once: true });
      };

      closeBtn.addEventListener('click', close);
      overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

      const onEsc = e => {
        if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onEsc); }
      };
      document.addEventListener('keydown', onEsc);
    };

    img.addEventListener('click', () => openLightbox());
  });

  // ── Card expand modal ─────────────────────
  document.querySelectorAll('.showcase-card').forEach(card => {
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', 'Expand project details');

    const openModal = () => {
      const imgEl  = card.querySelector('.showcase-img');
      const bodyEl = card.querySelector('.showcase-body');

      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');

      const panel = document.createElement('div');
      panel.className = 'modal-panel';

      if (imgEl)  panel.appendChild(imgEl.cloneNode(true));
      if (bodyEl) {
        const bodyClone = bodyEl.cloneNode(true);
        // Re-trigger iframe loads (cloneNode doesn't reload src)
        bodyClone.querySelectorAll('iframe').forEach(f => { const s = f.src; f.src = ''; f.src = s; });
        panel.appendChild(bodyClone);
      }

      const closeBtn = document.createElement('button');
      closeBtn.className = 'modal-close';
      closeBtn.innerHTML = '&times;';
      closeBtn.setAttribute('aria-label', 'Close');
      panel.appendChild(closeBtn);

      overlay.appendChild(panel);
      document.body.appendChild(overlay);
      document.body.style.overflow = 'hidden';

      // Double rAF ensures transition plays from initial state
      requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('open')));

      const close = () => {
        overlay.classList.remove('open');
        overlay.addEventListener('transitionend', () => {
          overlay.remove();
          document.body.style.overflow = '';
        }, { once: true });
      };

      closeBtn.addEventListener('click', close);
      overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

      const onEsc = e => {
        if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onEsc); }
      };
      document.addEventListener('keydown', onEsc);
    };

    card.addEventListener('click', e => {
      if (e.target.closest('a, button')) return;
      openModal();
    });

    card.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ' ') && !e.target.closest('a, button')) {
        e.preventDefault();
        openModal();
      }
    });
  });
});
