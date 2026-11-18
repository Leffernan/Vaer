(() => {
  'use strict';

  const widget = 'bygdebladet-vaer';
  const site = new URL('./', document.currentScript.src);
  const heights = new WeakMap();
  let active;

  function findFrame(source) {
    return [...document.querySelectorAll('iframe')].find(frame => {
      if (frame.contentWindow !== source) return false;
      const url = new URL(frame.src, document.baseURI);
      return url.origin === site.origin && (url.pathname === site.pathname ||
        url.pathname === site.pathname + 'index.html');
    });
  }

  function askForHeight(frame) {
    frame.contentWindow?.postMessage({ widget, type: 'measure' }, site.origin);
  }

  function openViewer(frame) {
    const container = frame.closest('[data-bb-vaer]');
    if (active || !container) return;
    const root = document.documentElement;
    const body = document.body;
    active = {
      frame,
      x: window.scrollX,
      y: window.scrollY,
      styles: [root, body, container, frame].map(el => [el, el.getAttribute('style')]),
      popover: frame.getAttribute('popover'),
      promoted: false
    };

    container.style.minHeight = container.getBoundingClientRect().height + 'px';
    root.style.overflow = 'hidden';
    Object.assign(body.style, {
      position: 'fixed',
      inset: -active.y + 'px 0 auto ' + -active.x + 'px',
      width: '100%',
      overflow: 'hidden'
    });
    Object.assign(frame.style, {
      position: 'fixed',
      inset: '0',
      width: '100vw',
      height: '100dvh',
      maxWidth: 'none',
      maxHeight: 'none',
      padding: '0',
      margin: '0',
      zIndex: '2147483646'
    });

    // The top layer lets the iframe escape article wrappers with clipping or transforms.
    if (typeof frame.showPopover === 'function') {
      frame.setAttribute('popover', 'manual');
      try {
        frame.showPopover();
        active.promoted = true;
      } catch {
        restoreAttribute(frame, 'popover', active.popover);
      }
    }
  }

  function restoreAttribute(element, name, value) {
    if (value === null) element.removeAttribute(name);
    else element.setAttribute(name, value);
  }

  function closeViewer(frame) {
    if (active?.frame !== frame) return;
    const state = active;
    active = undefined;

    if (state.promoted) {
      frame.hidePopover();
      restoreAttribute(frame, 'popover', state.popover);
    }

    for (const [element, style] of state.styles) restoreAttribute(element, 'style', style);
    if (heights.has(frame)) frame.style.height = heights.get(frame) + 'px';
    window.scrollTo({ left: state.x, top: state.y, behavior: 'instant' });
    askForHeight(frame);
  }

  window.addEventListener('message', event => {
    if (event.origin !== site.origin || event.data?.widget !== widget) return;
    const frame = findFrame(event.source);
    if (!frame) return;

    const { type, height } = event.data;
    if (type === 'height' && active?.frame !== frame &&
        Number.isInteger(height) && height > 0 && height < 20000) {
      heights.set(frame, height);
      frame.style.height = height + 'px';
    }
    if (type === 'open') openViewer(frame);
    if (type === 'close') closeViewer(frame);
  });

  for (const frame of document.querySelectorAll('iframe')) {
    if (findFrame(frame.contentWindow) !== frame) continue;
    frame.addEventListener('load', () => {
      closeViewer(frame);
      askForHeight(frame);
    });
    askForHeight(frame);
  }
})();
