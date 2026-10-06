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

// Auto-scale sheet for narrow mobile and tablet screens
function fitSheetToScreen() {
  const sheet = document.getElementById('resume');
  const scaler = document.getElementById('scaler');
  if (!sheet || !scaler) return;
  
  if (window.innerWidth < 856) {
    const availableWidth = window.innerWidth - 24;
    const baseWidth = 816; // 8.5in at 96 DPI
    const scale = Math.min(1, Math.max(0.25, availableWidth / baseWidth));
    
    sheet.style.transform = `scale(${scale})`;
    sheet.style.transformOrigin = 'top left';
    
    const baseHeight = 1056; // 11in at 96 DPI
    scaler.style.width = `${Math.ceil(baseWidth * scale)}px`;
    scaler.style.height = `${Math.ceil(baseHeight * scale)}px`;
    scaler.style.margin = '0 auto';
  } else {
    sheet.style.transform = '';
    sheet.style.transformOrigin = '';
    scaler.style.width = '8.5in';
    scaler.style.height = '';
    scaler.style.margin = '';
  }
}

window.addEventListener('resize', fitSheetToScreen);
window.addEventListener('DOMContentLoaded', fitSheetToScreen);
// Run immediately in case DOM is already ready
fitSheetToScreen();
