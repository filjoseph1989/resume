/**
 * Dynamic Resume & Portfolio Script
 * Interactive filtering, search, theme switching & rendering from the resume JSON API
 */

// Global state cache
window.resumeState = null;

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavSpy();
  initToast();
  initModal();
  initViewMode();
  initAdminManager();
  loadDynamicResume();
});

/* --------------------------------------------------------------------------
   Data Loading & Rendering from the resume JSON (PostgreSQL `resumes` table)
   -------------------------------------------------------------------------- */
const RESUME_SLUG = document.body.dataset.resume || 'tech';

async function loadDynamicResume() {
  try {
    const res = await fetch(`/api/resumes/${RESUME_SLUG}`);
    const result = await res.json();
    if (!result.success) throw new Error(result.error || `HTTP ${res.status}`);
    applyResume(result.data);
  } catch (err) {
    console.error('Could not load resume data:', err);
    setHtml('main.container', `
      <div class="summary-card" style="margin-top:48px; text-align:center;">
        <p>The resume could not be loaded. Make sure the server and database are running, then refresh.</p>
      </div>`);
  }
}

function applyResume(data) {
  window.resumeState = data;
  renderResume(data);
  bindDynamicInteractions();
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[m]));
}

const ICONS = {
  pin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>',
  mail: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>',
  linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle>',
  globe: '<circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>',
  home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>',
  external: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line>',
  facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>'
};

function icon(name, size = 16, cls = '') {
  const attrs = cls ? `class="${cls}"` : `width="${size}" height="${size}"`;
  return `<svg ${attrs} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;
}

const list = v => (Array.isArray(v) ? v : []);
const stripScheme = url => String(url || '').replace(/https?:\/\/(www\.)?/, '');

function setHtml(selector, html) {
  const el = document.querySelector(selector);
  if (el) el.innerHTML = html;
}

function renderResume(data) {
  if (!data) return;
  const p = data.profile || {};

  // 1. Hero & Profile
  setHtml('.nav-brand span', escapeHtml(p.name));
  setHtml('.nav-brand-badge', escapeHtml(p.initials));
  setHtml('.hero-name', escapeHtml(p.name));
  setHtml('.hero-tagline', escapeHtml(p.tagline));
  setHtml('.hero-location', `${icon('pin')} ${escapeHtml(p.location)}`);
  setHtml('.status-pill', p.status ? `<span class="status-dot"></span> ${escapeHtml(p.status)}` : '');
  document.querySelector('.status-pill')?.toggleAttribute('hidden', !p.status);

  const copyEmail = document.getElementById('btn-copy-email');
  if (copyEmail) copyEmail.onclick = () => copyToClipboard(p.email, 'Email copied to clipboard!');
  const copyPhone = document.getElementById('btn-copy-phone');
  if (copyPhone) copyPhone.onclick = () => copyToClipboard(String(p.phone || '').replace(/[^0-9+]/g, ''), 'Phone number copied to clipboard!');

  const contact = (href, iconName, label, value, external) => `
    <a href="${escapeHtml(href)}" class="contact-item"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>
      ${icon(iconName, 16, 'contact-icon')}
      <div>
        <span class="contact-label">${label}</span>
        <span class="contact-value">${escapeHtml(value)}</span>
      </div>
    </a>`;

  setHtml('.contact-grid', [
    p.email && contact(`mailto:${p.email}`, 'mail', 'Email', p.email),
    p.phone && contact(`tel:${p.phone.replace(/[^0-9+]/g, '')}`, 'phone', 'Phone', p.phone),
    p.linkedin && contact(p.linkedin, 'linkedin', 'LinkedIn', p.linkedin.replace(/https?:\/\/(www\.)?linkedin\.com\//, ''), true),
    p.website && contact(p.website, 'globe', 'Portfolio', stripScheme(p.website), true),
    p.address && `
    <div class="contact-item contact-item-address">
      ${icon('home', 16, 'contact-icon')}
      <div>
        <span class="contact-label">Address</span>
        <span class="contact-value">${escapeHtml(p.address)}</span>
      </div>
    </div>`
  ].filter(Boolean).join(''));

  // 2. Summary
  const expertiseIcons = ['⚡', '🔄', '🛡️', '🧰', '🎯', '🚀', '🔍'];
  const expertise = list(p.expertise);
  setHtml('.summary-card', `
    ${list(p.summary).map(para => `<p>${escapeHtml(para)}</p>`).join('')}
    ${expertise.length ? `
    <div class="expertise-grid">
      ${expertise.map((item, idx) => `
        <div class="expertise-item">
          <div class="expertise-title">
            <span>${expertiseIcons[idx % expertiseIcons.length]}</span> ${escapeHtml(item.title || item)}
          </div>
          ${item.desc ? `<div class="expertise-desc">${escapeHtml(item.desc)}</div>` : ''}
        </div>`).join('')}
    </div>` : ''}
    <p style="font-style: italic; color: var(--accent-light); margin-top: 12px;">
      "I am always looking for new challenges and opportunities to learn. Let's connect!"
    </p>
  `);

  // 3. Skills
  setHtml('.skills-dashboard', list(data.skills).map(cat => `
    <div class="skill-category-card">
      <div class="skill-category-header">
        <div class="skill-category-name">
          <span>${escapeHtml(cat.icon || '⚡')}</span> ${escapeHtml(cat.name)}
        </div>
      </div>
      <div class="skill-chips">
        ${list(cat.items).map(sk => `
          <span class="skill-chip" data-skill="${escapeHtml(sk.name)}">
            ${escapeHtml(sk.name)}
            ${sk.years ? `<span class="skill-chip-years">${escapeHtml(sk.years)}</span>` : ''}
          </span>`).join('')}
      </div>
    </div>`).join(''));

  // 4. Experience
  setHtml('.timeline', list(data.experience).map(exp => {
    const dates = exp.start ? `${exp.start} – ${exp.end || 'Present'}` : (exp.duration || '');
    return `
      <div class="timeline-item">
        <div class="timeline-node"></div>
        <div class="timeline-content">
          <div class="job-header">
            <div>
              <div class="job-company">${escapeHtml(exp.company)}</div>
              <div class="job-title-row">
                <span class="job-role">${escapeHtml(exp.role)}</span>
                <span class="job-type">${escapeHtml(exp.type || 'Full-time')}</span>
                ${exp.current ? '<span class="badge badge-current">Current Position</span>' : ''}
              </div>
            </div>
            <div class="job-meta">
              <div class="job-duration">
                ${icon('calendar', 14)}
                <span>${escapeHtml(dates)}</span>
                ${exp.duration && exp.start ? `<span style="opacity:0.85; margin-left:6px; font-size:0.82rem;">(${escapeHtml(exp.duration)})</span>` : ''}
              </div>
              ${exp.location ? `
              <div class="job-location">
                ${icon('pin', 14)}
                <span>${escapeHtml(exp.location)}</span>
              </div>` : ''}
            </div>
          </div>

          ${exp.description ? `<p class="job-desc" style="color:var(--text-secondary); margin-top:10px; font-size:0.9rem;">${escapeHtml(exp.description)}</p>` : ''}

          ${list(exp.achievements).length ? `
          <ul class="job-bullets">
            ${list(exp.achievements).map(a => `<li>${escapeHtml(a)}</li>`).join('')}
          </ul>` : ''}

          ${list(exp.technologies).length ? `
          <div class="job-tags">
            ${list(exp.technologies).map(t => `<span class="job-tag">${escapeHtml(t)}</span>`).join('')}
          </div>` : ''}
        </div>
      </div>`;
  }).join(''));

  // 5. Projects
  setHtml('.projects-grid', list(data.projects).map(prj => {
    const techs = list(prj.technologies);
    return `
      <div class="project-card" data-tech="${escapeHtml(techs.join(' ').toLowerCase())}">
        <div>
          <div class="project-header">
            <h3 class="project-title">${escapeHtml(prj.title)}</h3>
            ${prj.url ? `
            <a href="${escapeHtml(prj.url)}" target="_blank" rel="noopener noreferrer" class="project-link">
              ${escapeHtml(stripScheme(prj.url))}
              ${icon('external', 14)}
            </a>` : ''}
          </div>

          <div class="project-role">${escapeHtml(prj.role)}</div>
          <p class="project-desc">${escapeHtml(prj.overview)}</p>

          ${prj.architecture ? `
          <div style="font-size:0.83rem; color:var(--text-muted); margin-bottom:12px; line-height:1.5;">
            <strong style="color:var(--text-secondary);">Scale & Architecture:</strong> ${escapeHtml(prj.architecture)}
          </div>` : ''}

          ${list(prj.highlights).length ? `
          <ul class="project-highlights">
            ${list(prj.highlights).map(r => `<li>${escapeHtml(r)}</li>`).join('')}
          </ul>` : ''}
        </div>

        ${techs.length ? `
        <div class="project-tags">
          ${techs.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}
        </div>` : ''}
      </div>`;
  }).join(''));

  // 6. Education, Certifications & Publications
  const label = text => `<span style="font-weight: 700; font-size: 0.85rem; color: var(--text-heading);">${text}</span>`;
  const educationCards = list(data.education).map(edu => `
    <div class="info-card">
      <h3 class="info-card-title">
        <span>🎓</span> Academic Degree
      </h3>
      <div class="edu-degree">${escapeHtml(edu.degree)}</div>
      <div class="edu-school">${escapeHtml(edu.school)}</div>
      <div class="edu-meta">
        ${escapeHtml([edu.dates, edu.location].filter(Boolean).join(' • '))}
        ${edu.campus ? `<br><span style="font-size: 0.8rem; color: var(--text-muted);">📍 Campus: ${escapeHtml(edu.campus)}</span>` : ''}
      </div>
      <div class="edu-details">
        ${edu.thesis ? `
        <div style="margin-bottom: 10px;">
          ${label('Thesis:')}
          <span style="font-style: italic; color: var(--accent-light); font-size: 0.85rem;"> ${escapeHtml(edu.thesis)}</span>
        </div>` : ''}
        ${list(edu.leadership).length ? `
        <div style="margin-bottom: 12px;">
          <span style="font-weight: 700; font-size: 0.85rem; color: var(--text-heading); display: block; margin-bottom: 4px;">Leadership & Affiliations:</span>
          <ul style="list-style: disc; padding-left: 18px; font-size: 0.83rem; color: var(--text-secondary);">
            ${list(edu.leadership).map(l => `<li>${escapeHtml(l)}</li>`).join('')}
          </ul>
        </div>` : ''}
        ${list(edu.curriculum).length ? `
        <p style="margin-bottom: 8px; font-weight: 700; font-size: 0.85rem; color: var(--text-heading);">
          Core Curriculum & Subject Areas:
        </p>
        <div class="skill-chips" style="gap: 6px;">
          ${list(edu.curriculum).map(c => `<span class="project-tech">${escapeHtml(c)}</span>`).join('')}
        </div>` : ''}
      </div>
    </div>`).join('');

  const credentials = [
    ...list(data.certifications).map(c => `
      <li class="cert-item">
        <span class="cert-icon">🎖️</span>
        <div><strong>${escapeHtml(c)}</strong></div>
      </li>`),
    ...list(data.publications).map(pub => `
      <li class="cert-item" style="border-left: 3px solid var(--accent);">
        <span class="cert-icon">📖</span>
        <div>
          <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--accent-light); font-weight: 700; display: block;">Publication</span>
          <strong>${escapeHtml(pub)}</strong>
        </div>
      </li>`)
  ].join('');

  setHtml('#education .dual-grid', educationCards + (credentials ? `
    <div class="info-card">
      <h3 class="info-card-title">
        <span>📜</span> Certifications & Publications
      </h3>
      <ul class="cert-list">${credentials}</ul>
    </div>` : ''));

  // 7. References
  setHtml('#references .dual-grid', list(data.references).map(ref => `
    <div class="ref-card">
      <div class="ref-name">${escapeHtml(ref.name)}</div>
      <div class="ref-title">${escapeHtml([ref.title, ref.company].filter(Boolean).join(' • '))}</div>
      ${ref.email ? `
      <a href="mailto:${escapeHtml(ref.email)}" class="ref-link">
        ${icon('mail', 15)}
        ${escapeHtml(ref.email)}
      </a>` : ''}
      ${ref.url ? `
      <a href="${escapeHtml(ref.url)}" target="_blank" rel="noopener noreferrer" class="ref-link">
        ${icon(/facebook\.com/.test(ref.url) ? 'facebook' : 'globe', 15)}
        ${escapeHtml(stripScheme(ref.url))}
      </a>` : ''}
    </div>`).join(''));
}

/* --------------------------------------------------------------------------
   Dynamic Event Binding (Search, Filters, Skills, Recruiter View)
   -------------------------------------------------------------------------- */
function bindDynamicInteractions() {
  initSearch();
  initProjectFilters();
  initSkillChips();
}

/* --------------------------------------------------------------------------
   Theme Management (Dark / Light)
   -------------------------------------------------------------------------- */
function initTheme() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeIcon(newTheme);
      showToast(`Switched to ${newTheme} mode`);
    });
  }
}

function updateThemeIcon(theme) {
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (!themeToggleBtn) return;
  if (theme === 'light') {
    themeToggleBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>`;
    themeToggleBtn.setAttribute('title', 'Switch to Dark Mode');
  } else {
    themeToggleBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>`;
    themeToggleBtn.setAttribute('title', 'Switch to Light Mode');
  }
}

/* --------------------------------------------------------------------------
   Navigation Spy
   -------------------------------------------------------------------------- */
function initNavSpy() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPosition = window.pageYOffset + 120;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   Real-Time Search across Timeline & Projects
   -------------------------------------------------------------------------- */
function initSearch() {
  const searchInput = document.getElementById('search-input');
  if (!searchInput) return;

  // Remove existing listeners by cloning or replace
  const newSearchInput = searchInput.cloneNode(true);
  searchInput.parentNode.replaceChild(newSearchInput, searchInput);

  newSearchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    filterContent(query);
  });
}

function filterContent(query) {
  const timelineItems = document.querySelectorAll('.timeline-item');
  const projectCards = document.querySelectorAll('.project-card');

  // Filter Timeline
  timelineItems.forEach(item => {
    const text = item.textContent.toLowerCase();
    if (!query || text.includes(query)) {
      item.style.display = '';
    } else {
      item.style.display = 'none';
    }
  });

  // Filter Projects
  projectCards.forEach(card => {
    const text = card.textContent.toLowerCase();
    if (!query || text.includes(query)) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
}

/* --------------------------------------------------------------------------
   Project Category Filter Buttons
   -------------------------------------------------------------------------- */
function initProjectFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterButtons.forEach(btn => {
    btn.onclick = () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterTag = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const techs = (card.getAttribute('data-tech') || '').toLowerCase();
        if (filterTag === 'all' || techs.includes(filterTag.toLowerCase())) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    };
  });
}

/* --------------------------------------------------------------------------
   Clickable Skill Chips
   -------------------------------------------------------------------------- */
function initSkillChips() {
  const skillChips = document.querySelectorAll('.skill-chip');

  skillChips.forEach(chip => {
    chip.onclick = () => {
      const skillName = chip.getAttribute('data-skill') || chip.textContent.split('(')[0].trim();
      const searchInput = document.getElementById('search-input');
      if (searchInput) {
        searchInput.value = skillName;
        filterContent(skillName.toLowerCase());
        searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        showToast(`Filtered by: ${skillName}`);
      }
    };
  });
}

/* --------------------------------------------------------------------------
   Recruiter View vs Detailed View
   -------------------------------------------------------------------------- */
function initViewMode() {
  const detailedBtn = document.getElementById('view-detailed');
  const recruiterBtn = document.getElementById('view-recruiter');
  const body = document.body;

  if (detailedBtn && recruiterBtn) {
    detailedBtn.addEventListener('click', () => {
      detailedBtn.classList.add('active');
      recruiterBtn.classList.remove('active');
      body.classList.remove('recruiter-view');
      showToast('Switched to Detailed Engineering View');
    });

    recruiterBtn.addEventListener('click', () => {
      recruiterBtn.classList.add('active');
      detailedBtn.classList.remove('active');
      body.classList.add('recruiter-view');
      showToast('Switched to Compact Recruiter View');
    });
  }
}

/* --------------------------------------------------------------------------
   Raw Markdown Modal & Clipboard Copy
   -------------------------------------------------------------------------- */
function initModal() {
  const openBtn = document.getElementById('btn-view-markdown');
  const closeBtn = document.getElementById('btn-close-modal');
  const modalBackdrop = document.getElementById('modal-markdown');
  const copyMarkdownBtn = document.getElementById('btn-copy-markdown');

  if (openBtn && modalBackdrop) {
    openBtn.addEventListener('click', () => {
      modalBackdrop.classList.add('open');
    });
  }

  if (closeBtn && modalBackdrop) {
    closeBtn.addEventListener('click', () => {
      modalBackdrop.classList.remove('open');
    });
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        modalBackdrop.classList.remove('open');
      }
    });
  }

  if (copyMarkdownBtn) {
    copyMarkdownBtn.addEventListener('click', () => {
      const pre = document.getElementById('markdown-raw-content');
      if (pre) {
        copyToClipboard(pre.textContent, 'Raw Markdown copied to clipboard!');
      }
    });
  }
}

/* --------------------------------------------------------------------------
   Admin Data Manager: edit the resume JSON stored in PostgreSQL
   -------------------------------------------------------------------------- */
function initAdminManager() {
  const adminToggleBtn = document.getElementById('admin-toggle-btn');
  const adminModal = document.getElementById('modal-admin');
  const editor = document.getElementById('admin-json-editor');
  const status = document.getElementById('admin-json-status');

  const setStatus = (msg, isError = false) => {
    if (!status) return;
    status.textContent = msg;
    status.style.color = isError ? '#ef4444' : 'var(--text-muted)';
  };

  const fillEditor = () => {
    if (editor && window.resumeState) {
      editor.value = JSON.stringify(window.resumeState, null, 2);
      setStatus('');
    }
  };

  const closeModal = () => adminModal?.classList.remove('open');

  adminToggleBtn?.addEventListener('click', () => {
    fillEditor();
    adminModal?.classList.add('open');
  });
  document.getElementById('btn-close-admin')?.addEventListener('click', closeModal);
  document.getElementById('btn-close-admin-footer')?.addEventListener('click', closeModal);
  adminModal?.addEventListener('click', (e) => {
    if (e.target === adminModal) closeModal();
  });

  // Validate as the user types so mistakes show before saving
  editor?.addEventListener('input', () => {
    try {
      JSON.parse(editor.value);
      setStatus('Valid JSON');
    } catch (err) {
      setStatus(err.message, true);
    }
  });

  document.getElementById('btn-admin-format')?.addEventListener('click', () => {
    try {
      editor.value = JSON.stringify(JSON.parse(editor.value), null, 2);
      setStatus('Formatted');
    } catch (err) {
      setStatus(err.message, true);
    }
  });

  document.getElementById('btn-admin-save')?.addEventListener('click', async () => {
    let data;
    try {
      data = JSON.parse(editor.value);
    } catch (err) {
      setStatus(err.message, true);
      return;
    }
    try {
      const res = await fetch(`/api/resumes/${RESUME_SLUG}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (!result.success) {
        setStatus('Save failed: ' + (result.error || res.status), true);
        return;
      }
      applyResume(result.data);
      showToast('Resume saved to database!');
      closeModal();
    } catch (err) {
      setStatus('Network error while saving', true);
    }
  });

  document.getElementById('btn-reset-seed')?.addEventListener('click', async () => {
    if (!confirm(`Reset this resume to data/${RESUME_SLUG}.json? Unsaved and saved edits will be lost.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/resumes/${RESUME_SLUG}/reset`, { method: 'POST' });
      const result = await res.json();
      if (result.success) {
        applyResume(result.data);
        fillEditor();
        showToast('Resume reset to its seed file');
      } else {
        setStatus('Reset failed: ' + (result.error || ''), true);
      }
    } catch (err) {
      setStatus('Network error while resetting', true);
    }
  });
}

/* --------------------------------------------------------------------------
   Toast Notifications & Clipboard Utility
   -------------------------------------------------------------------------- */
let toastContainer;

function initToast() {
  toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
}

function showToast(message, duration = 3000) {
  if (!toastContainer) initToast();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
    <span>${escapeHtml(message)}</span>
  `;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

function copyToClipboard(text, message = 'Copied to clipboard!') {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(message);
    }).catch(() => fallbackCopy(text, message));
  } else {
    fallbackCopy(text, message);
  }
}

function fallbackCopy(text, message) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-9999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    showToast(message);
  } catch (err) {
    console.error('Copy failed', err);
  }
  document.body.removeChild(textArea);
}

// Print Handler
function handlePrint() {
  window.print();
}
