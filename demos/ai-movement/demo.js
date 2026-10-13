/* Run the compiled C++ only after the page has the isolation Wasm threads require. */
var Module = {
  canvas: document.getElementById('canvas'),
  print: (...args) => console.log(...args),
  printErr: (...args) => console.error(...args),
  onRuntimeInitialized: () => {
    document.getElementById('status').textContent = 'Ready · Flocking';
    document.querySelectorAll('[data-key], #fullscreen').forEach(button => { button.disabled = false; });
  },
  onAbort: message => showError(`The demo could not start: ${message}. Try a current desktop browser.`)
};
function showError(message) {
  const el = document.getElementById('demo-error');
  el.hidden = false;
  el.textContent = message;
  document.getElementById('status').textContent = 'Demo unavailable';
}
document.querySelectorAll('[data-key], #fullscreen').forEach(button => { button.disabled = true; });
document.querySelectorAll('[data-key]').forEach(button => button.addEventListener('click', () => {
  const key = button.dataset.key;
  const keyCode = key === '+' ? 187 : key === '-' ? 189 : key.toUpperCase().charCodeAt(0);
  Module.canvas.focus();
  const eventOptions = { key, code: /^[1-4]$/.test(key) ? `Digit${key}` : key === '+' ? 'Equal' : key === '-' ? 'Minus' : `Key${key.toUpperCase()}`, keyCode, which: keyCode, shiftKey: key === '+', bubbles: true };
  Module.canvas.dispatchEvent(new KeyboardEvent('keydown', eventOptions));
  Module.canvas.dispatchEvent(new KeyboardEvent('keyup', eventOptions));
  if (/^[1-4]$/.test(key)) {
    document.querySelectorAll('[aria-pressed]').forEach(el => el.setAttribute('aria-pressed', String(el === button)));
    document.getElementById('status').textContent = `Ready · ${button.textContent.split(' · ')[1]}`;
  }
}));
Module.canvas.addEventListener('contextmenu', event => event.preventDefault());
document.getElementById('fullscreen').addEventListener('click', () => Module.canvas.requestFullscreen().catch(() => showError('Fullscreen is unavailable in this browser. The demo can still run here.')));
(async () => {
  try {
    if (!crossOriginIsolated) {
      if (!('serviceWorker' in navigator)) throw new Error('This browser does not support the isolation needed by the demo.');
      await navigator.serviceWorker.register('./isolation-sw.js');
      await navigator.serviceWorker.ready;
      const reloadKey = `ai-movement-isolation:${location.pathname}`;
      if (sessionStorage.getItem(reloadKey)) throw new Error('Browser isolation could not be enabled. Open this demo directly in a new tab and refresh.');
      sessionStorage.setItem(reloadKey, '1');
      location.reload();
      return;
    }
    sessionStorage.removeItem(`ai-movement-isolation:${location.pathname}`);
    document.getElementById('status').textContent = 'Loading compiled C++ simulation…';
    const script = document.createElement('script');
    script.src = './index.js';
    script.onerror = () => showError('The simulation files could not be downloaded. Refresh to retry.');
    document.body.append(script);
  } catch (error) { showError(error.message); }
})();
