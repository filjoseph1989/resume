/**
 * Fil Joseph Elman - Classic Resume Script
 * Handles contact copying, responsive sheet scaling, and UX shortcuts.
 */

function copyContact(text, message, event) {
  if (event) {
    event.preventDefault();
  }
  
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(message || 'Copied to clipboard!');
    }).catch(() => {
      fallbackCopy(text, message);
    });
  } else {
    fallbackCopy(text, message);
  }
}

function fallbackCopy(text, message) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    showToast(message || 'Copied to clipboard!');
  } catch (err) {
    console.error('Copy failed:', err);
  }
  document.body.removeChild(textarea);
}

let toastTimer = null;
function showToast(text) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  
  toast.textContent = text;
  toast.classList.add('show');
  
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2200);
}

// Scale the sheet so its edges line up with the toolbar content on every screen size
function fitSheetToScreen() {
  const sheet = document.getElementById('resume');
  const scaler = document.getElementById('scaler');
  const nav = document.querySelector('.nav-container');
  if (!sheet || !scaler || !nav) return;

  const navStyle = getComputedStyle(nav);
  const targetWidth = nav.clientWidth - parseFloat(navStyle.paddingLeft) - parseFloat(navStyle.paddingRight);
  const baseWidth = 816; // 8.5in at 96 DPI
  const scale = Math.max(0.25, targetWidth / baseWidth);

  sheet.style.zoom = scale;
  scaler.style.width = `${baseWidth * scale}px`;
}

window.addEventListener('resize', fitSheetToScreen);
window.addEventListener('DOMContentLoaded', fitSheetToScreen);
// Run immediately in case DOM is already ready
fitSheetToScreen();
