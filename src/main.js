/**
 * Made In Brazil — Pure Vanilla JavaScript
 * High-conversion squeeze page logic & interactive features
 * Inspired by The News (thenewscc.com.br) for madeinbrazil.tv
 */

// Local storage key
const STORAGE_KEY = 'made_in_brazil_subscribers';

// Initial preloaded subscribers for demonstration
const DEFAULT_SUBSCRIBERS = [
  {
    id: 'sub_demo_1',
    email: 'geanramus@gmail.com',
    topics: ['Tecnologia & IA', 'Economia & Negócios'],
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    source: 'Hero Squeeze',
  },
  {
    id: 'sub_demo_2',
    email: 'carolina.mendes@fintech.com.br',
    topics: ['Economia & Negócios', 'Brasil & Mundo'],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    source: 'Hero Squeeze',
  },
  {
    id: 'sub_demo_3',
    email: 'rafael.cto@startup.io',
    topics: ['Tecnologia & IA', 'Cultura & Dicas'],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    source: 'Amostra da Edição',
  },
];

// Helper: Get subscribers
function getSubscribers() {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ||
      localStorage.getItem('ox_news_subscribers') ||
      localStorage.getItem('souox_newsletter_subscribers');
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SUBSCRIBERS));
      return DEFAULT_SUBSCRIBERS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Erro ao ler localStorage', e);
    return DEFAULT_SUBSCRIBERS;
  }
}

// Helper: Save subscriber
function saveSubscriber(email, topics = ['Tecnologia & IA', 'Economia & Negócios'], source = 'Hero Squeeze') {
  const cleanEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return { success: false, message: 'Por favor, insira um e-mail válido (ex: seu.nome@email.com).' };
  }

  const list = getSubscribers();
  const existing = list.find((s) => s.email === cleanEmail);

  if (existing) {
    return {
      success: true,
      alreadySubscribed: true,
      message: 'Você já faz parte da Made In Brazil! A próxima edição chegará na sexta-feira às 06:06.',
      subscriber: existing,
    };
  }

  const newSub = {
    id: 'sub_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    email: cleanEmail,
    topics,
    createdAt: new Date().toISOString(),
    source,
  };

  list.unshift(newSub);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Erro ao salvar no localStorage', e);
  }

  return {
    success: true,
    alreadySubscribed: false,
    message: 'Inscrição confirmada com sucesso! Bem-vindo à Made In Brazil.',
    subscriber: newSub,
  };
}

// Helper: Pure Canvas Confetti Burst (The News Yellow & Contrast Palette)
function triggerConfetti() {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);

  const particles = [];
  const colors = ['#FFDE00', '#121316', '#FFE600', '#059669', '#10B981', '#FFFFFF'];

  for (let i = 0; i < 110; i++) {
    particles.push({
      x: window.innerWidth * 0.5,
      y: window.innerHeight * 0.45,
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 0.75) * 18,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      rotation: Math.random() * 360,
      vRotation: (Math.random() - 0.5) * 10,
    });
  }

  let animationFrame;
  const start = performance.now();

  function render(time) {
    const elapsed = time - start;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    let activeCount = 0;
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.38; // Gravity
      p.rotation += p.vRotation;
      p.alpha -= 0.011;

      if (p.alpha > 0) {
        activeCount++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
    }

    if (activeCount > 0 && elapsed < 3000) {
      animationFrame = requestAnimationFrame(render);
    } else {
      cancelAnimationFrame(animationFrame);
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    }
  }

  animationFrame = requestAnimationFrame(render);
}

// Export Subscribers to CSV
function exportCSV() {
  const subs = getSubscribers();
  if (subs.length === 0) {
    alert('Nenhum inscrito para exportar.');
    return;
  }
  const headers = ['ID', 'Email', 'Topicos', 'Data Inscrição', 'Origem'];
  const rows = subs.map((s) => [
    s.id,
    s.email,
    `"${(s.topics || []).join('; ')}"`,
    s.createdAt,
    s.source,
  ]);
  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `made_in_brazil_inscritos_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Render Subscriber list in Admin Modal
function renderSubscribersTable() {
  const tbody = document.getElementById('subscribers-tbody');
  const countSpan = document.getElementById('modal-subscriber-count');
  const navCountSpan = document.getElementById('nav-subscriber-count');
  if (!tbody) return;

  const subs = getSubscribers();
  if (countSpan) countSpan.textContent = subs.length;
  if (navCountSpan) navCountSpan.textContent = subs.length;

  if (subs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px; color:#888;">Nenhum inscrito ainda.</td></tr>';
    return;
  }

  tbody.innerHTML = subs
    .map(
      (s) => `
    <tr>
      <td style="font-weight:700;">${escapeHtml(s.email)}</td>
      <td style="color:#555;">${escapeHtml((s.topics || []).join(', ') || 'Geral')}</td>
      <td style="color:#777; font-size:11px;">${new Date(s.createdAt).toLocaleDateString('pt-BR')}</td>
      <td style="color:#333; font-size:12px; font-weight:600;">${escapeHtml(s.source || 'Hero')}</td>
    </tr>
  `
    )
    .join('');
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, function (m) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
  });
}

// Main initialization
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const heroForm = document.getElementById('hero-subscribe-form');
  const heroEmailInput = document.getElementById('hero-email-input');
  const heroSqueezeBox = document.getElementById('hero-squeeze-box');
  const heroSuccessCard = document.getElementById('hero-success-card');
  const heroSuccessEmail = document.getElementById('hero-success-email');
  const heroResetBtn = document.getElementById('hero-reset-btn');
  const heroTopicChips = document.querySelectorAll('.topic-chip');

  const stickyBar = document.getElementById('sticky-subscribe-bar');
  const stickyForm = document.getElementById('sticky-subscribe-form');
  const stickyEmailInput = document.getElementById('sticky-email-input');

  const previewForm = document.getElementById('preview-subscribe-form');
  const previewEmailInput = document.getElementById('preview-email-input');

  const adminModal = document.getElementById('admin-modal');
  const openAdminBtn = document.getElementById('open-admin-btn');
  const closeAdminBtn = document.getElementById('close-admin-btn');
  const exportCsvBtn = document.getElementById('export-csv-btn');
  const clearSubsBtn = document.getElementById('clear-subs-btn');

  const whatsappShareBtn = document.getElementById('whatsapp-share-btn');
  const gcalReminderBtn = document.getElementById('gcal-reminder-btn');
  const readSampleBtn = document.getElementById('read-sample-btn');

  // Audio Preview Simulator
  const audioPlayBtn = document.getElementById('audio-play-btn');
  let isAudioPlaying = false;
  let synthUtterance = null;

  // Selected topics state
  const selectedTopics = new Set(['Tecnologia & IA', 'Economia & Negócios']);

  heroTopicChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const topic = chip.getAttribute('data-topic');
      if (selectedTopics.has(topic)) {
        selectedTopics.delete(topic);
        chip.classList.remove('active');
      } else {
        selectedTopics.add(topic);
        chip.classList.add('active');
      }
    });
  });

  // Handle Main Subscription Flow
  function handleSubscription(emailValue, source = 'Hero Squeeze') {
    const topicsArr = Array.from(selectedTopics);
    const result = saveSubscriber(emailValue, topicsArr, source);

    if (!result.success) {
      alert(result.message);
      return false;
    }

    // Trigger celebratory confetti
    triggerConfetti();

    // Show celebration card in hero
    if (heroSqueezeBox && heroSuccessCard) {
      heroSqueezeBox.style.display = 'none';
      heroSuccessCard.classList.add('active');
      if (heroSuccessEmail) heroSuccessEmail.textContent = result.subscriber.email;
    }

    // Update counts & table
    renderSubscribersTable();

    // Hide sticky bar if open
    if (stickyBar) stickyBar.classList.remove('visible');

    // Smooth scroll to top if needed
    if (window.scrollY > 300) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    return true;
  }

  // Hero Form Submit
  if (heroForm) {
    heroForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = heroEmailInput.value;
      handleSubscription(email, 'Hero Squeeze');
    });
  }

  // Sticky Form Submit
  if (stickyForm) {
    stickyForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = stickyEmailInput.value;
      if (handleSubscription(email, 'Sticky Bar')) {
        stickyEmailInput.value = '';
      }
    });
  }

  // Preview Form Submit
  if (previewForm) {
    previewForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = previewEmailInput.value;
      if (handleSubscription(email, 'Amostra da Edição')) {
        previewEmailInput.value = '';
      }
    });
  }

  // Reset Hero Form
  if (heroResetBtn) {
    heroResetBtn.addEventListener('click', () => {
      if (heroSuccessCard) heroSuccessCard.classList.remove('active');
      if (heroSqueezeBox) {
        heroSqueezeBox.style.display = 'block';
        if (heroEmailInput) {
          heroEmailInput.value = '';
          heroEmailInput.focus();
        }
      }
    });
  }

  // Scroll to Sample Action
  if (readSampleBtn) {
    readSampleBtn.addEventListener('click', () => {
      const sampleSection = document.getElementById('amostra');
      if (sampleSection) {
        sampleSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // WhatsApp Share with madeinbrazil.tv link
  if (whatsappShareBtn) {
    whatsappShareBtn.addEventListener('click', () => {
      const text = encodeURIComponent(
        'Acabei de me inscrever na Made In Brazil: as notícias mais importantes do dia explicadas em 5 minutos no seu café da manhã, sem enrolação. Assina aí, é 100% grátis: https://madeinbrazil.tv/'
      );
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    });
  }

  // Google Calendar Reminder
  if (gcalReminderBtn) {
    gcalReminderBtn.addEventListener('click', () => {
      const title = encodeURIComponent('☕ Ler Made In Brazil no café da manhã');
      const details = encodeURIComponent(
        'Hora de conferir o resumo inteligente das notícias mais importantes na caixa de entrada.'
      );
      const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&recur=RRULE:FREQ=WEEKLY;BYDAY=FR`;
      window.open(url, '_blank');
    });
  }

  // Sticky Bar Visibility on Scroll
  window.addEventListener('scroll', () => {
    if (!stickyBar) return;
    const heroBottom = 480;
    if (window.scrollY > heroBottom && !heroSuccessCard?.classList.contains('active')) {
      stickyBar.classList.add('visible');
    } else {
      stickyBar.classList.remove('visible');
    }
  });

  // Audio Summary Demonstration using Web Speech Synthesis
  if (audioPlayBtn) {
    audioPlayBtn.addEventListener('click', () => {
      if (!('speechSynthesis' in window)) {
        alert('Seu navegador não suporta reprodução de voz.');
        return;
      }

      if (isAudioPlaying) {
        window.speechSynthesis.cancel();
        isAudioPlaying = false;
        audioPlayBtn.innerHTML = `
          <span>☕</span>
          <span id="audio-play-text">Ouvir Resumo em Áudio (2 min)</span>
        `;
        return;
      }

      const sampleSummaryText =
        'Bom dia! Esta é a Made In Brazil. Destaque do dia: o que você precisa saber para começar sua rotina bem informado. O verdadeiro gargalo da inteligência artificial não é a produção de chips, mas sim a capacidade da rede elétrica. Grandes empresas de tecnologia agora compram usinas nucleares e solares inteiras para alimentar novos supercomputadores.';

      synthUtterance = new SpeechSynthesisUtterance(sampleSummaryText);
      synthUtterance.lang = 'pt-BR';
      synthUtterance.rate = 1.05;

      synthUtterance.onend = () => {
        isAudioPlaying = false;
        audioPlayBtn.innerHTML = `
          <span>☕</span>
          <span id="audio-play-text">Ouvir Novamente (2 min)</span>
        `;
      };

      synthUtterance.onerror = () => {
        isAudioPlaying = false;
        audioPlayBtn.innerHTML = `
          <span>☕</span>
          <span id="audio-play-text">Ouvir Resumo em Áudio (2 min)</span>
        `;
      };

      window.speechSynthesis.speak(synthUtterance);
      isAudioPlaying = true;
      audioPlayBtn.innerHTML = `
        <span>⏸️</span>
        <span id="audio-play-text">Pausar Áudio Resumo</span>
      `;
    });
  }

  // FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    const trigger = item.querySelector('.faq-trigger');
    if (trigger) {
      trigger.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        faqItems.forEach((f) => f.classList.remove('active'));
        if (!isActive) {
          item.classList.add('active');
        }
      });
    }
  });

  // Admin Modal Controls
  if (openAdminBtn && adminModal) {
    openAdminBtn.addEventListener('click', () => {
      renderSubscribersTable();
      adminModal.classList.add('active');
    });
  }

  if (closeAdminBtn && adminModal) {
    closeAdminBtn.addEventListener('click', () => {
      adminModal.classList.remove('active');
    });
  }

  if (adminModal) {
    adminModal.addEventListener('click', (e) => {
      if (e.target === adminModal) {
        adminModal.classList.remove('active');
      }
    });
  }

  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', exportCSV);
  }

  if (clearSubsBtn) {
    clearSubsBtn.addEventListener('click', () => {
      if (confirm('Deseja limpar os inscritos salvos localmente nesta sessão?')) {
        localStorage.removeItem(STORAGE_KEY);
        renderSubscribersTable();
      }
    });
  }

  // Initial table render
  renderSubscribersTable();
});
