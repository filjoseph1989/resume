/**
 * Dynamic Resume & Portfolio Script
 * Interactive filtering, search, theme switching, print handling & PostgreSQL API integration
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
   Data Loading & Dynamic Rendering from PostgreSQL
   -------------------------------------------------------------------------- */
async function loadDynamicResume() {
  try {
    const res = await fetch('/api/resume');
    if (!res.ok) {
      console.warn('API fetch returned status:', res.status);
      bindDynamicInteractions();
      return;
    }
    const result = await res.json();
    if (result.success && result.data) {
      window.resumeState = result.data;
      renderResume(result.data);
      bindDynamicInteractions();
      populateAdminPanels(result.data);
    }
  } catch (err) {
    console.warn('Dynamic data loading skipped, using static fallback:', err);
    bindDynamicInteractions();
  }
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

function renderResume(data) {
  if (!data) return;

  // 1. Render Hero & Profile
  if (data.profile) {
    const p = data.profile;
    const nameEl = document.querySelector('.hero-name');
    if (nameEl) nameEl.textContent = p.name;

    const brandEl = document.querySelector('.nav-brand span');
    if (brandEl) brandEl.textContent = p.name;

    const badgeEl = document.querySelector('.nav-brand-badge');
    if (badgeEl && p.initials) badgeEl.textContent = p.initials;

    const taglineEl = document.querySelector('.hero-tagline');
    if (taglineEl) taglineEl.textContent = p.tagline;

    const locEl = document.querySelector('.hero-location');
    if (locEl) {
      locEl.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        ${escapeHtml(p.location)}
      `;
    }

    const statusPill = document.querySelector('.status-pill');
    if (statusPill && p.status_text) {
      statusPill.innerHTML = `
        <span class="status-dot"></span>
        ${escapeHtml(p.status_text)}
      `;
    }

    // Contact Grid
    const contactGrid = document.querySelector('.contact-grid');
    if (contactGrid) {
      contactGrid.innerHTML = `
        <a href="mailto:${escapeHtml(p.email)}" class="contact-item">
          <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          <div>
            <span class="contact-label">Email</span>
            <span class="contact-value">${escapeHtml(p.email)}</span>
          </div>
        </a>

        <a href="tel:${escapeHtml(p.phone?.replace(/[^0-9+]/g, ''))}" class="contact-item">
          <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
          <div>
            <span class="contact-label">Phone</span>
            <span class="contact-value">${escapeHtml(p.phone)}</span>
          </div>
        </a>

        ${p.linkedin_url ? `
        <a href="${escapeHtml(p.linkedin_url)}" target="_blank" rel="noopener noreferrer" class="contact-item">
          <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
            <rect x="2" y="9" width="4" height="12"></rect>
            <circle cx="4" cy="4" r="2"></circle>
          </svg>
          <div>
            <span class="contact-label">LinkedIn</span>
            <span class="contact-value">${escapeHtml(p.linkedin_url.replace(/https?:\/\/(www\.)?linkedin\.com\//, ''))}</span>
          </div>
        </a>` : ''}

        ${p.website_url ? `
        <a href="${escapeHtml(p.website_url)}" target="_blank" rel="noopener noreferrer" class="contact-item">
          <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
          <div>
            <span class="contact-label">Portfolio</span>
            <span class="contact-value">${escapeHtml(p.website_url.replace(/https?:\/\//, ''))}</span>
          </div>
        </a>` : ''}

        ${p.address ? `
        <div class="contact-item contact-item-address">
          <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <div>
            <span class="contact-label">Address</span>
            <span class="contact-value">${escapeHtml(p.address)}</span>
          </div>
        </div>` : ''}
      `;
    }

    // Raw markdown in modal
    const pre = document.getElementById('markdown-raw-content');
    if (pre && p.raw_markdown) {
      pre.textContent = p.raw_markdown;
    }
  }

  // 2. Render Summary
  if (data.profile) {
    const summaryCard = document.querySelector('.summary-card');
    if (summaryCard) {
      const paras = Array.isArray(data.profile.summary_paragraphs) ? data.profile.summary_paragraphs : [];
      const expertise = Array.isArray(data.profile.expertise) ? data.profile.expertise : [];

      let html = paras.map(p => `<p>${escapeHtml(p)}</p>`).join('');

      if (expertise.length > 0) {
        html += `<div class="expertise-grid">`;
        const icons = ['⚡', '🔄', '🛡️', '🧰', '🎯', '🚀', '🔍'];
        expertise.forEach((item, idx) => {
          const icon = icons[idx % icons.length];
          html += `
            <div class="expertise-item">
              <div class="expertise-title">
                <span>${icon}</span> ${escapeHtml(item.title || item)}
              </div>
              ${item.desc ? `<div class="expertise-desc">${escapeHtml(item.desc)}</div>` : ''}
            </div>
          `;
        });
        html += `</div>`;
      }

      html += `
        <p style="font-style: italic; color: var(--accent-light); margin-top: 12px;">
          "I am always looking for new challenges and opportunities to learn. Let's connect!"
        </p>
      `;

      summaryCard.innerHTML = html;
    }
  }

  // 3. Render Skills Dashboard
  if (Array.isArray(data.skillCategories)) {
    const skillsDash = document.querySelector('.skills-dashboard');
    if (skillsDash) {
      const catIcons = {
        'backend': '💻',
        'frontend': '🎨',
        'frameworks-cms': '🧱',
        'databases-infra': '🗄️',
        'specializations': '🧠',
        'crm-pm': '📋',
        'collaboration': '💬',
        'media-design': '🎬',
        'languages': '🌐'
      };

      skillsDash.innerHTML = data.skillCategories.map(cat => {
        const icon = catIcons[cat.slug] || '⚡';
        const chips = (cat.skills || []).map(sk => `
          <span class="skill-chip" data-skill="${escapeHtml(sk.name)}">
            ${escapeHtml(sk.name)}
            ${sk.years_experience ? `<span class="skill-chip-years">${escapeHtml(sk.years_experience)}</span>` : ''}
          </span>
        `).join('');

        return `
          <div class="skill-category-card">
            <div class="skill-category-header">
              <div class="skill-category-name">
                <span>${icon}</span> ${escapeHtml(cat.name)}
              </div>
            </div>
            <div class="skill-chips">${chips}</div>
          </div>
        `;
      }).join('');
    }
  }

  // 4. Render Experiences
  if (Array.isArray(data.experiences)) {
    const timeline = document.querySelector('.timeline');
    if (timeline) {
      timeline.innerHTML = data.experiences.map((exp, idx) => {
        const achievements = Array.isArray(exp.achievements) ? exp.achievements : [];
        const techs = Array.isArray(exp.technologies) ? exp.technologies : [];

        return `
          <div class="timeline-item" data-id="${exp.id}">
            <div class="timeline-node"></div>
            <div class="timeline-content">
              <div class="job-header">
                <div>
                  <div class="job-company">${escapeHtml(exp.company)}</div>
                  <div class="job-title-row">
                    <span class="job-role">${escapeHtml(exp.role)}</span>
                    <span class="job-type">${escapeHtml(exp.employment_type || 'Full-time')}</span>
                    ${exp.is_current ? '<span class="badge badge-current">Current Position</span>' : ''}
                  </div>
                </div>
                <div class="job-meta">
                  <div class="job-duration">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span>${escapeHtml(exp.duration || (exp.start_date + ' – ' + (exp.end_date || 'Present')))}</span>
                  </div>
                  ${exp.location ? `
                  <div class="job-location">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span>${escapeHtml(exp.location)}</span>
                  </div>` : ''}
                </div>
              </div>

              ${exp.description ? `<p class="job-desc" style="color:var(--text-secondary); margin-top:10px; font-size:0.9rem;">${escapeHtml(exp.description)}</p>` : ''}

              ${achievements.length > 0 ? `
              <ul class="job-bullets">
                ${achievements.map(a => `<li>${escapeHtml(a)}</li>`).join('')}
              </ul>` : ''}

              ${techs.length > 0 ? `
              <div class="job-tags">
                ${techs.map(t => `<span class="job-tag">${escapeHtml(t)}</span>`).join('')}
              </div>` : ''}
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // 5. Render Projects
  if (Array.isArray(data.projects)) {
    const projectsGrid = document.querySelector('.projects-grid');
    if (projectsGrid) {
      projectsGrid.innerHTML = data.projects.map(prj => {
        const resp = Array.isArray(prj.responsibilities) ? prj.responsibilities : [];
        const techs = Array.isArray(prj.technologies) ? prj.technologies : [];
        const techAttr = techs.join(' ').toLowerCase();

        return `
          <div class="project-card" data-tech="${escapeHtml(techAttr)}" data-id="${prj.id}">
            <div>
              <div class="project-header">
                <h3 class="project-title">${escapeHtml(prj.title)}</h3>
                ${prj.live_url ? `
                <a href="${escapeHtml(prj.live_url)}" target="_blank" rel="noopener noreferrer" class="project-link">
                  ${escapeHtml(prj.live_url.replace(/https?:\/\/(www\.)?/, ''))}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </a>` : ''}
              </div>

              <div class="project-role">${escapeHtml(prj.role || '')}</div>
              <p class="project-desc">${escapeHtml(prj.overview || '')}</p>

              ${prj.scale_architecture ? `
              <div style="font-size:0.83rem; color:var(--text-muted); margin-bottom:12px; line-height:1.5;">
                <strong style="color:var(--text-secondary);">Scale & Architecture:</strong> ${escapeHtml(prj.scale_architecture)}
              </div>` : ''}

              ${resp.length > 0 ? `
              <ul class="project-highlights">
                ${resp.map(r => `<li>${escapeHtml(r)}</li>`).join('')}
              </ul>` : ''}
            </div>

            ${techs.length > 0 ? `
            <div class="project-tags">
              ${techs.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}
            </div>` : ''}
          </div>
        `;
      }).join('');
    }
  }
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
   Admin Data Manager Modal & CRUD Operations
   -------------------------------------------------------------------------- */
function initAdminManager() {
  const adminToggleBtn = document.getElementById('admin-toggle-btn');
  const adminModal = document.getElementById('modal-admin');
  const closeBtn = document.getElementById('btn-close-admin');
  const closeFooterBtn = document.getElementById('btn-close-admin-footer');
  const tabs = document.querySelectorAll('.admin-tab');
  const panels = document.querySelectorAll('.admin-panel');

  if (adminToggleBtn && adminModal) {
    adminToggleBtn.addEventListener('click', () => {
      adminModal.classList.add('open');
      if (window.resumeState) {
        populateAdminPanels(window.resumeState);
      }
    });
  }

  const closeModal = () => {
    if (adminModal) adminModal.classList.remove('open');
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (closeFooterBtn) closeFooterBtn.addEventListener('click', closeModal);
  if (adminModal) {
    adminModal.addEventListener('click', (e) => {
      if (e.target === adminModal) closeModal();
    });
  }

  // Tab switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetId = tab.getAttribute('data-tab');
      const panel = document.getElementById(targetId);
      if (panel) panel.classList.add('active');
    });
  });

  // Profile Form submit
  const profileForm = document.getElementById('form-admin-profile');
  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        name: document.getElementById('admin-p-name').value.trim(),
        initials: document.getElementById('admin-p-initials').value.trim(),
        tagline: document.getElementById('admin-p-tagline').value.trim(),
        location: document.getElementById('admin-p-location').value.trim(),
        phone: document.getElementById('admin-p-phone').value.trim(),
        email: document.getElementById('admin-p-email').value.trim(),
        linkedin_url: document.getElementById('admin-p-linkedin').value.trim(),
        website_url: document.getElementById('admin-p-website').value.trim(),
        status_text: document.getElementById('admin-p-status').value.trim(),
        address: document.getElementById('admin-p-address').value.trim(),
        summary_paragraphs: document.getElementById('admin-p-summary').value
          .split('\n\n')
          .map(s => s.trim())
          .filter(Boolean)
      };

      try {
        const res = await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (result.success) {
          showToast('Profile updated in database!');
          await loadDynamicResume();
        } else {
          showToast('Failed to update profile: ' + (result.error || ''));
        }
      } catch (err) {
        showToast('Network error saving profile');
      }
    });
  }

  // Experience Form Toggle & Submit
  const btnAddExp = document.getElementById('btn-add-experience-modal');
  const expFormContainer = document.getElementById('admin-exp-form-container');
  const expForm = document.getElementById('form-admin-experience');
  const btnCancelExp = document.getElementById('btn-cancel-exp');

  if (btnAddExp && expFormContainer) {
    btnAddExp.addEventListener('click', () => {
      document.getElementById('admin-exp-form-title').textContent = 'Add New Experience';
      document.getElementById('admin-exp-id').value = '';
      expForm.reset();
      expFormContainer.style.display = 'block';
      expFormContainer.scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (btnCancelExp && expFormContainer) {
    btnCancelExp.addEventListener('click', () => {
      expFormContainer.style.display = 'none';
      expForm.reset();
    });
  }

  if (expForm) {
    expForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const expId = document.getElementById('admin-exp-id').value;
      const achievements = document.getElementById('admin-exp-achievements').value
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);
      const technologies = document.getElementById('admin-exp-technologies').value
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const payload = {
        company: document.getElementById('admin-exp-company').value.trim(),
        role: document.getElementById('admin-exp-role').value.trim(),
        location: document.getElementById('admin-exp-location').value.trim(),
        duration: document.getElementById('admin-exp-duration').value.trim(),
        description: document.getElementById('admin-exp-desc').value.trim(),
        achievements,
        technologies
      };

      const url = expId ? `/api/experiences/${expId}` : '/api/experiences';
      const method = expId ? 'PUT' : 'POST';

      try {
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (result.success) {
          showToast(expId ? 'Experience updated!' : 'New experience created!');
          expFormContainer.style.display = 'none';
          expForm.reset();
          await loadDynamicResume();
        } else {
          showToast('Failed to save experience');
        }
      } catch (err) {
        showToast('Network error saving experience');
      }
    });
  }

  // Project Form Toggle & Submit
  const btnAddProj = document.getElementById('btn-add-project-modal');
  const projFormContainer = document.getElementById('admin-proj-form-container');
  const projForm = document.getElementById('form-admin-project');
  const btnCancelProj = document.getElementById('btn-cancel-proj');

  if (btnAddProj && projFormContainer) {
    btnAddProj.addEventListener('click', () => {
      document.getElementById('admin-proj-form-title').textContent = 'Add New Project';
      document.getElementById('admin-proj-id').value = '';
      projForm.reset();
      projFormContainer.style.display = 'block';
      projFormContainer.scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (btnCancelProj && projFormContainer) {
    btnCancelProj.addEventListener('click', () => {
      projFormContainer.style.display = 'none';
      projForm.reset();
    });
  }

  if (projForm) {
    projForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const projId = document.getElementById('admin-proj-id').value;
      const responsibilities = document.getElementById('admin-proj-responsibilities').value
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);
      const technologies = document.getElementById('admin-proj-technologies').value
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const payload = {
        title: document.getElementById('admin-proj-title').value.trim(),
        role: document.getElementById('admin-proj-role').value.trim(),
        category: document.getElementById('admin-proj-category').value.trim(),
        live_url: document.getElementById('admin-proj-live-url').value.trim(),
        overview: document.getElementById('admin-proj-overview').value.trim(),
        scale_architecture: document.getElementById('admin-proj-scale').value.trim(),
        responsibilities,
        technologies
      };

      const url = projId ? `/api/projects/${projId}` : '/api/projects';
      const method = projId ? 'PUT' : 'POST';

      try {
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (result.success) {
          showToast(projId ? 'Project updated!' : 'New project created!');
          projFormContainer.style.display = 'none';
          projForm.reset();
          await loadDynamicResume();
        } else {
          showToast('Failed to save project');
        }
      } catch (err) {
        showToast('Network error saving project');
      }
    });
  }

  // Skill Form Submit
  const skillForm = document.getElementById('form-admin-skill');
  if (skillForm) {
    skillForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const categoryId = document.getElementById('admin-skill-category-select').value;
      const name = document.getElementById('admin-skill-name').value.trim();
      const years = document.getElementById('admin-skill-years').value.trim();

      if (!name) return;

      try {
        const res = await fetch('/api/skills', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category_id: parseInt(categoryId),
            name,
            years_experience: years || null
          })
        });
        const result = await res.json();
        if (result.success) {
          showToast(`Skill '${name}' added!`);
          document.getElementById('admin-skill-name').value = '';
          document.getElementById('admin-skill-years').value = '';
          await loadDynamicResume();
        } else {
          showToast('Failed to add skill');
        }
      } catch (err) {
        showToast('Network error adding skill');
      }
    });
  }

  // Reset to seed
  const btnReset = document.getElementById('btn-reset-seed');
  if (btnReset) {
    btnReset.addEventListener('click', async () => {
      if (!confirm('Are you sure you want to reset and re-seed resume_db to default baseline data?')) {
        return;
      }
      try {
        const res = await fetch('/api/reset-seed', { method: 'POST' });
        const result = await res.json();
        if (result.success) {
          showToast('Database reset to defaults successfully!');
          await loadDynamicResume();
        } else {
          showToast('Reset failed: ' + (result.error || ''));
        }
      } catch (err) {
        showToast('Network error while resetting database');
      }
    });
  }
}

function populateAdminPanels(data) {
  if (!data) return;

  // Populate Profile tab
  if (data.profile) {
    const p = data.profile;
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val || '';
    };

    setVal('admin-p-name', p.name);
    setVal('admin-p-initials', p.initials);
    setVal('admin-p-tagline', p.tagline);
    setVal('admin-p-location', p.location);
    setVal('admin-p-phone', p.phone);
    setVal('admin-p-email', p.email);
    setVal('admin-p-linkedin', p.linkedin_url);
    setVal('admin-p-website', p.website_url);
    setVal('admin-p-status', p.status_text);
    setVal('admin-p-address', p.address);

    const paras = Array.isArray(p.summary_paragraphs) ? p.summary_paragraphs : [];
    setVal('admin-p-summary', paras.join('\n\n'));
  }

  // Populate Experiences list
  const expList = document.getElementById('admin-experiences-list');
  if (expList && Array.isArray(data.experiences)) {
    expList.innerHTML = data.experiences.map(exp => `
      <div class="admin-card-row" data-id="${exp.id}">
        <div class="admin-card-info">
          <h4>${escapeHtml(exp.role)} &bull; <span style="color:var(--accent-light);">${escapeHtml(exp.company)}</span></h4>
          <p>${escapeHtml(exp.duration || '')} &bull; ${escapeHtml(exp.location || '')}</p>
        </div>
        <div class="admin-card-actions">
          <button class="btn btn-secondary btn-sm" onclick="editExperience(${exp.id})">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteExperience(${exp.id})">Delete</button>
        </div>
      </div>
    `).join('');
  }

  // Populate Projects list
  const projList = document.getElementById('admin-projects-list');
  if (projList && Array.isArray(data.projects)) {
    projList.innerHTML = data.projects.map(prj => `
      <div class="admin-card-row" data-id="${prj.id}">
        <div class="admin-card-info">
          <h4>${escapeHtml(prj.title)} &bull; <span style="color:var(--accent-light);">${escapeHtml(prj.category || 'Project')}</span></h4>
          <p>${escapeHtml(prj.role || '')}</p>
        </div>
        <div class="admin-card-actions">
          <button class="btn btn-secondary btn-sm" onclick="editProject(${prj.id})">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteProject(${prj.id})">Delete</button>
        </div>
      </div>
    `).join('');
  }

  // Populate Skill Categories select & skills list
  const catSelect = document.getElementById('admin-skill-category-select');
  const skillsGrouped = document.getElementById('admin-skills-grouped-list');

  if (Array.isArray(data.skillCategories)) {
    if (catSelect) {
      catSelect.innerHTML = data.skillCategories.map(cat => `
        <option value="${cat.id}">${escapeHtml(cat.name)}</option>
      `).join('');
    }

    if (skillsGrouped) {
      skillsGrouped.innerHTML = data.skillCategories.map(cat => `
        <div style="margin-bottom:16px; background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:12px 16px;">
          <h5 style="margin:0 0 8px 0; color:var(--text-heading); font-size:0.9rem;">${escapeHtml(cat.name)}</h5>
          <div>
            ${(cat.skills || []).map(sk => `
              <span class="admin-skill-item">
                ${escapeHtml(sk.name)} ${sk.years_experience ? `<small style="color:var(--text-muted);">(${escapeHtml(sk.years_experience)})</small>` : ''}
                <button type="button" class="admin-skill-del" onclick="deleteSkill(${sk.id})" title="Delete skill">&times;</button>
              </span>
            `).join('')}
          </div>
        </div>
      `).join('');
    }
  }
}

// Global window helpers for inline action buttons in Admin modal
window.editExperience = function(id) {
  if (!window.resumeState || !Array.isArray(window.resumeState.experiences)) return;
  const exp = window.resumeState.experiences.find(e => e.id === id);
  if (!exp) return;

  const container = document.getElementById('admin-exp-form-container');
  if (container) container.style.display = 'block';

  document.getElementById('admin-exp-form-title').textContent = `Edit Experience: ${exp.company}`;
  document.getElementById('admin-exp-id').value = exp.id;
  document.getElementById('admin-exp-company').value = exp.company || '';
  document.getElementById('admin-exp-role').value = exp.role || '';
  document.getElementById('admin-exp-location').value = exp.location || '';
  document.getElementById('admin-exp-duration').value = exp.duration || '';
  document.getElementById('admin-exp-desc').value = exp.description || '';

  const ach = Array.isArray(exp.achievements) ? exp.achievements.join('\n') : '';
  document.getElementById('admin-exp-achievements').value = ach;

  const tech = Array.isArray(exp.technologies) ? exp.technologies.join(', ') : '';
  document.getElementById('admin-exp-technologies').value = tech;

  container.scrollIntoView({ behavior: 'smooth' });
};

window.deleteExperience = async function(id) {
  if (!confirm('Are you sure you want to delete this experience record?')) return;
  try {
    const res = await fetch(`/api/experiences/${id}`, { method: 'DELETE' });
    const result = await res.json();
    if (result.success) {
      showToast('Experience deleted');
      await loadDynamicResume();
    } else {
      showToast('Failed to delete experience');
    }
  } catch (err) {
    showToast('Network error deleting experience');
  }
};

window.editProject = function(id) {
  if (!window.resumeState || !Array.isArray(window.resumeState.projects)) return;
  const prj = window.resumeState.projects.find(p => p.id === id);
  if (!prj) return;

  const container = document.getElementById('admin-proj-form-container');
  if (container) container.style.display = 'block';

  document.getElementById('admin-proj-form-title').textContent = `Edit Project: ${prj.title}`;
  document.getElementById('admin-proj-id').value = prj.id;
  document.getElementById('admin-proj-title').value = prj.title || '';
  document.getElementById('admin-proj-role').value = prj.role || '';
  document.getElementById('admin-proj-category').value = prj.category || '';
  document.getElementById('admin-proj-live-url').value = prj.live_url || '';
  document.getElementById('admin-proj-overview').value = prj.overview || '';
  document.getElementById('admin-proj-scale').value = prj.scale_architecture || '';

  const resp = Array.isArray(prj.responsibilities) ? prj.responsibilities.join('\n') : '';
  document.getElementById('admin-proj-responsibilities').value = resp;

  const tech = Array.isArray(prj.technologies) ? prj.technologies.join(', ') : '';
  document.getElementById('admin-proj-technologies').value = tech;

  container.scrollIntoView({ behavior: 'smooth' });
};

window.deleteProject = async function(id) {
  if (!confirm('Are you sure you want to delete this project?')) return;
  try {
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    const result = await res.json();
    if (result.success) {
      showToast('Project deleted');
      await loadDynamicResume();
    } else {
      showToast('Failed to delete project');
    }
  } catch (err) {
    showToast('Network error deleting project');
  }
};

window.deleteSkill = async function(id) {
  try {
    const res = await fetch(`/api/skills/${id}`, { method: 'DELETE' });
    const result = await res.json();
    if (result.success) {
      showToast('Skill deleted');
      await loadDynamicResume();
    } else {
      showToast('Failed to delete skill');
    }
  } catch (err) {
    showToast('Network error deleting skill');
  }
};

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
