import { useEffect } from 'react';
import { SHORTCUTS } from './shortcuts.config';

export const useShortcuts = (handlers) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeElement = document.activeElement;
      const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeElement.tagName) || activeElement.isContentEditable;
      if (isTyping) return;

      const keyCombo = [
        e.ctrlKey && 'Control',
        e.metaKey && 'Meta',
        e.shiftKey && 'Shift',
        e.key.toLowerCase() !== 'control' && e.key.toLowerCase() !== 'meta' && e.key.toLowerCase() !== 'shift' ? e.key : ''
      ].filter(Boolean).join('+');

      for (const [shortcutName, config] of Object.entries(SHORTCUTS)) {
        if (config.keys.some(k => k.toLowerCase() === keyCombo.toLowerCase() || k === e.key)) {
          if (handlers[config.action]) {
            e.preventDefault(); 
            handlers[config.action]();
          }
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
};