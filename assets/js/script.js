/* ══════════════════════════════════════════════
   EditLingo Solutions — Main Script
   ══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons
  lucide.createIcons();

  // ── Dark Mode Toggle ──
  const themeToggle = document.getElementById('theme-toggle');
  const html = document.documentElement;
  const stored = localStorage.getItem('editlingo-theme');

  if (stored) {
    html.setAttribute('data-theme', stored);
  }

  themeToggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme') || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', next);
    localStorage.setItem('editlingo-theme', next);
  });

  // ── Navbar scroll effect ──
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  });

  // ── Mobile menu toggle ──
  const mobToggle = document.getElementById('mob-toggle');
  const navLinks = document.getElementById('nav-links');
  mobToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navLinks.classList.remove('open'));
  });

  // ── Scroll reveal ──
  const revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // ── FAQ accordion ──
  document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.parentElement;
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(x => x.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  // ── Smooth scroll for anchor links ──
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ── Contact form ──
  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');
  const formSubjectSelect = document.getElementById('form-subject');
  const formSubjectHidden = document.getElementById('form-subject-hidden');
  const submitBtn = document.getElementById('form-submit-btn');

  // Set redirect URL
  document.getElementById('form-next-url').value =
    window.location.href.split('#')[0] + '#contact-success';

  // Sync subject
  formSubjectSelect.addEventListener('change', () => {
    formSubjectHidden.value = formSubjectSelect.value + ' — EditLingo Website';
  });

  // Also ensure subject is in formData for mailto fallback
  contactForm.addEventListener('formdata', (e) => {
    if (!e.formData.get('subject')) {
      e.formData.set('subject', formSubjectSelect.value);
    }
  });

  // AJAX submit
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    const formData = new FormData(contactForm);

    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        contactForm.style.display = 'none';
        formSuccess.classList.add('show');
        lucide.createIcons();
      } else {
        openMailto(formData);
      }
    } catch {
      openMailto(formData);
    }

    submitBtn.disabled = false;
    submitBtn.innerHTML =
      'Send Message <i data-lucide="arrow-right" style="width:16px;height:16px"></i>';
    lucide.createIcons();
  });

  // Handle redirect-back success
  if (window.location.hash === '#contact-success') {
    const cf = document.getElementById('contact-form');
    const fs = document.getElementById('form-success');
    if (cf && fs) {
      cf.style.display = 'none';
      fs.classList.add('show');
    }
    history.replaceState(null, '', window.location.pathname);
  }

  // ── Animated stat counters ──
  const counters = document.querySelectorAll('[data-count]');
  const counterObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach(c => counterObserver.observe(c));

  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1200;
    const start = performance.now();

    function update(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }
});

// ── Mailto fallback ──
function openMailto(formData) {
  const subject = encodeURIComponent(
    (formData.get('Inquiry Subject') || 'General') + ' — ' + formData.get('name')
  );
  const body = encodeURIComponent(
    'From: ' + formData.get('name') + ' (' + formData.get('email') + ')\n\n' +
    formData.get('message')
  );
  window.location.href = 'mailto:support@editlingo.com?subject=' + subject + '&body=' + body;
}
