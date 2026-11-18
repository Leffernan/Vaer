(() => {
  'use strict';

  const dialog = document.querySelector('#forecast-dialog');
  const title = document.querySelector('#dialog-title');
  const forecastFrame = document.querySelector('#long-forecast');
  const yrLink = document.querySelector('#yr-link');
  const embedProtocol = 'bygdebladet-vaer';
  const embedded = window.parent !== window;
  let trigger;
  let pointerDownOnBackdrop = false;

  function notifyHost(type, detail = {}) {
    if (embedded) window.parent.postMessage({ widget: embedProtocol, type, ...detail }, '*');
  }

  function reportHeight() {
    notifyHost('height', { height: Math.ceil(document.body.getBoundingClientRect().height) });
  }

  if (embedded) {
    new ResizeObserver(reportHeight).observe(document.body);
    window.addEventListener('message', event => {
      if (event.source === window.parent && event.data?.widget === embedProtocol &&
          event.data.type === 'measure') requestAnimationFrame(reportHeight);
    });
  }

  for (const card of document.querySelectorAll('.forecast')) {
    const button = card.querySelector('.long-range');
    const { location, place } = card.dataset;
    button.addEventListener('click', () => {
      trigger = button;
      title.textContent = place;
      forecastFrame.title = 'Langtidsvarsel for ' + place + ' frå Yr';
      forecastFrame.src = 'https://www.yr.no/nn/innhald/' + location + '/table.html?mode=light';
      yrLink.href = 'https://www.yr.no/nn/vêrvarsel/dagleg-tabell/' + location + '/';
      dialog.showModal();
      notifyHost('open');
    });
    button.hidden = false;
  }

  dialog.querySelector('.close-button').addEventListener('click', () => dialog.close());
  dialog.addEventListener('pointerdown', event => { pointerDownOnBackdrop = event.target === dialog; });
  dialog.addEventListener('click', event => {
    if (event.target === dialog && pointerDownOnBackdrop) dialog.close();
    pointerDownOnBackdrop = false;
  });
  dialog.addEventListener('close', () => {
    forecastFrame.removeAttribute('src');
    notifyHost('close');
    trigger?.focus({ preventScroll: true });
    trigger = undefined;
  });
})();
