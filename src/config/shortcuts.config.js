export const SHORTCUTS = {
  // --- EDIT + ACTIONS ---
  UNDO: { keys: ['Control+z', 'Meta+z'], action: 'UNDO', label: 'Deshacer' },
  REDO: { keys: ['Control+Shift+z', 'Meta+Shift+z', 'Control+y'], action: 'REDO', label: 'Rehacer' },
  COPY: { keys: ['Control+c', 'Meta+c'], action: 'COPY', label: 'Copiar' },
  CUT: { keys: ['Control+x', 'Meta+x'], action: 'CUT', label: 'Cortar' },
  PASTE: { keys: ['Control+v', 'Meta+v'], action: 'PASTE', label: 'Pegar' },
  DUPLICATE: { keys: ['Control+d', 'Meta+d'], action: 'DUPLICATE', label: 'Duplicar' },
  DELETE: { keys: ['Backspace', 'Delete'], action: 'DELETE', label: 'Eliminar' },
  SELECT_ALL: { keys: ['Control+a', 'Meta+a'], action: 'SELECT_ALL', label: 'Seleccionar todo' },

  // --- ZOOM + NAV ---
  ZOOM_IN: { keys: ['Control+=', 'Meta+=', '+'], action: 'ZOOM_IN', label: 'Acercar' },
  ZOOM_OUT: { keys: ['Control+-', 'Meta+-', '-'], action: 'ZOOM_OUT', label: 'Alejar' },
  ZOOM_RESET: { keys: ['Shift+0'], action: 'ZOOM_RESET', label: 'Zoom al 100%' },
  ZOOM_TO_FIT: { keys: ['Shift+1'], action: 'ZOOM_TO_FIT', label: 'Ajustar a la pantalla' },

  // --- LAYERS ORDER ---
  BRING_FORWARD: { keys: ['Control+]', 'Meta+]'], action: 'BRING_FORWARD', label: 'Traer adelante' },
  SEND_BACKWARD: { keys: ['Control+[', 'Meta+['], action: 'SEND_BACKWARD', label: 'Enviar atrás' },
  BRING_TO_FRONT: { keys: ['Alt+Control+]', 'Alt+Meta+]'], action: 'BRING_TO_FRONT', label: 'Traer al frente' },
  SEND_TO_BACK: { keys: ['Alt+Control+[', 'Alt+Meta+['], action: 'SEND_TO_BACK', label: 'Enviar al fondo' },

  // --- SELECT + CANCEL ---
  DESELECT: { keys: ['Escape'], action: 'DESELECT', label: 'Deseleccionar' },
};