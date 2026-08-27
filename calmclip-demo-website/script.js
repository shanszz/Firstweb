(() => {
  const header = document.querySelector('[data-header]');
  const navToggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');

  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 10);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  navToggle?.addEventListener('click', () => {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!isOpen));
    nav?.classList.toggle('is-open', !isOpen);
  });

  nav?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navToggle?.setAttribute('aria-expanded', 'false');
      nav?.classList.remove('is-open');
    });
  });

  document.querySelectorAll('[data-delay]').forEach((el) => {
    el.style.setProperty('--delay', `${el.dataset.delay}ms`);
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -45px' });

  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

  // Gentle white-noise demo. The gain is intentionally capped at a low level.
  let audioContext;
  let source;
  let gainNode;
  let playing = false;
  const soundTriggers = [...document.querySelectorAll('[data-sound-trigger]')];
  const volumeInput = document.querySelector('[data-volume]');
  const equalizer = document.querySelector('[data-equalizer]');

  function createNoiseBuffer(context) {
    const seconds = 2;
    const buffer = context.createBuffer(1, context.sampleRate * seconds, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  function currentGain() {
    const raw = Number(volumeInput?.value ?? 34) / 100;
    return Math.min(0.035, raw * 0.035);
  }

  function updateSoundUI() {
    soundTriggers.forEach((button) => {
      button.classList.toggle('is-playing', playing);
      button.setAttribute('aria-pressed', String(playing));
      const label = button.querySelector('[data-sound-label]');
      if (label) label.textContent = playing ? 'Stop sample' : 'Play sample';
    });
    equalizer?.classList.toggle('is-active', playing);
  }

  async function startNoise() {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === 'suspended') await audioContext.resume();

    source = audioContext.createBufferSource();
    gainNode = audioContext.createGain();
    source.buffer = createNoiseBuffer(audioContext);
    source.loop = true;
    gainNode.gain.value = currentGain();
    source.connect(gainNode).connect(audioContext.destination);
    source.start();
    playing = true;
    updateSoundUI();
  }

  function stopNoise() {
    try { source?.stop(); } catch (_) {}
    source?.disconnect();
    gainNode?.disconnect();
    source = null;
    gainNode = null;
    playing = false;
    updateSoundUI();
  }

  soundTriggers.forEach((button) => {
    button.addEventListener('click', async () => {
      if (playing) stopNoise();
      else await startNoise();
    });
  });

  volumeInput?.addEventListener('input', () => {
    if (gainNode && audioContext) {
      gainNode.gain.setTargetAtTime(currentGain(), audioContext.currentTime, 0.02);
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && playing) stopNoise();
  });

  const modal = document.querySelector('[data-gallery-modal]');
  const modalImage = document.querySelector('[data-modal-image]');
  const modalClose = document.querySelector('[data-modal-close]');

  document.querySelectorAll('[data-gallery-src]').forEach((item) => {
    item.addEventListener('click', () => {
      if (!modal || !modalImage) return;
      modalImage.src = item.dataset.gallerySrc;
      modalImage.alt = item.dataset.galleryAlt || '';
      modal.showModal();
    });
  });

  modalClose?.addEventListener('click', () => modal?.close());
  modal?.addEventListener('click', (event) => {
    const rect = modal.getBoundingClientRect();
    const outside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
    if (outside) modal.close();
  });

  const form = document.querySelector('[data-launch-form]');
  const formMessage = document.querySelector('[data-form-message]');
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = new FormData(form).get('email');
    if (formMessage) formMessage.textContent = `Thanks — ${email} has been added to this demo list.`;
    form.reset();
  });

  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
