/**
 * One-page resume renderer.
 * Fills <main class="page"> from /api/resumes/<slug>, where the slug comes from <body data-resume>.
 */
(function () {
  var page = document.querySelector('.page');
  var slug = document.body.dataset.resume;

  var ICONS = {
    location: '<path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/>',
    email: '<path d="M2 5h20v14H2zm2 2v.5l8 5 8-5V7z"/>',
    phone: '<path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"/>',
    website: '<ellipse cx="7" cy="12" rx="6" ry="6"/><ellipse cx="17" cy="12" rx="3" ry="5.5"/><ellipse cx="22" cy="12" rx="1" ry="5"/>'
  };

  function esc(str) {
    if (str == null) return '';
    return String(str).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  function list(v) {
    return Array.isArray(v) ? v : [];
  }

  function contactItem(icon, content) {
    return '<span><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' + ICONS[icon] + '</svg>' + content + '</span>';
  }

  function render(d) {
    var edu = d.education || {};
    var site = d.website || {};

    page.innerHTML =
      '<header>' +
        '<h1>' + esc(d.name) + '</h1>' +
        '<div class="headline">' + esc(d.headline) + '</div>' +
        '<div class="contact">' +
          (d.location ? contactItem('location', esc(d.location)) : '') +
          (d.email ? contactItem('email', '<a href="mailto:' + esc(d.email) + '">' + esc(d.email) + '</a>') : '') +
          (d.phone ? contactItem('phone', esc(d.phone)) : '') +
          (site.url ? contactItem('website', '<a href="' + esc(site.url) + '">' + esc(site.label || site.url) + '</a>') : '') +
        '</div>' +
      '</header>' +

      '<h2>About</h2>' +
      '<div class="about"><p>' + esc(d.about) + '</p></div>' +

      '<h2>Professional Attributes</h2>' +
      '<div class="attributes">' +
        '<div><h3>Core Strengths</h3>' + list(d.strengths).map(function (s) { return '<div class="card">' + esc(s) + '</div>'; }).join('') + '</div>' +
        '<div><h3>Growth Areas</h3>' + list(d.growthAreas).map(function (s) { return '<div class="card">' + esc(s) + '</div>'; }).join('') + '</div>' +
      '</div>' +

      '<h2>Work Experience</h2>' +
      list(d.experience).map(function (job) {
        return '<section class="job">' +
          '<div class="job-head"><h3>' + esc(job.role) + '</h3><span class="job-date">' + esc(job.dates) + '</span></div>' +
          '<div class="company">' + esc(job.company) + '</div>' +
          '<ul>' + list(job.bullets).map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('') + '</ul>' +
        '</section>';
      }).join('') +

      '<h2>Tools &amp; Skills</h2>' +
      '<dl class="skills">' +
        list(d.skills).map(function (group) {
          return '<dt>' + esc(group.label) + ':</dt>' +
            '<dd>' + list(group.items).map(function (i) { return '<span class="chip">' + esc(i) + '</span>'; }).join('') + '</dd>';
        }).join('') +
      '</dl>' +

      '<h2>Education</h2>' +
      '<div class="edu">' +
        '<div class="edu-head"><h3>' + esc(edu.school) + '</h3><span class="job-date">' + esc(edu.dates) + '</span></div>' +
        (edu.details ? '<div>' + esc(edu.details) + '</div>' : '') +
        (edu.thesis ? '<div><span class="label">Thesis:</span> <em>' + esc(edu.thesis) + '</em>' + (edu.thesisNote ? ' ' + esc(edu.thesisNote) : '') + '</div>' : '') +
      '</div>';
  }

  // Scale the A4 sheet so it fits the viewport's width and height, with a small gutter.
  function fit() {
    var gutter = 16;
    var scale = Math.min(
      (window.innerWidth - gutter * 2) / page.offsetWidth,
      (window.innerHeight - gutter * 2) / page.offsetHeight
    );
    page.style.setProperty('--fit', Math.max(scale, 0.1));
  }

  window.addEventListener('resize', fit);

  fetch('/api/resumes/' + encodeURIComponent(slug))
    .then(function (res) { return res.json(); })
    .then(function (result) {
      if (!result.success) throw new Error(result.error);
      render(result.data);
    })
    .catch(function (err) {
      console.error('Could not load resume data:', err);
      page.innerHTML = '<p>The resume could not be loaded. Make sure the server and database are running, then refresh.</p>';
    })
    .then(fit);
})();
