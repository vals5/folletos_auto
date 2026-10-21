import { useRef, useState, useCallback } from "react";

const MAX_ENTRADAS = 100;
const VENTANA_FUSION_MS = 1200; // ediciones seguidas del mismo campo se juntan en un solo paso

const mismasClaves = (a, b) => {
  const ka = Object.keys(a).sort().join("|");
  const kb = Object.keys(b).sort().join("|");
  return ka === kb;
};

// Historial de deshacer/rehacer. Cada entrada describe un cambio (ver useFlyerEditor).
export function useHistorial() {
  const pila = useRef({ pasado: [], futuro: [] });
  const ocupado = useRef(false);
  const [conteo, setConteo] = useState({ pasado: 0, futuro: 0 });

  const sincronizar = () => setConteo({ pasado: pila.current.pasado.length, futuro: pila.current.futuro.length });

  const registrar = useCallback((entrada) => {
    const h = pila.current;
    const ahora = Date.now();
    const ultima = h.pasado[h.pasado.length - 1];

    const fusionable =
      entrada.tipo === "update" &&
      ultima?.tipo === "update" &&
      ultima.id === entrada.id &&
      mismasClaves(ultima.despues, entrada.despues) &&
      ahora - ultima.t < VENTANA_FUSION_MS;

    if (fusionable) {
      ultima.despues = entrada.despues; // conserva el "antes" original
      ultima.t = ahora;
    } else {
      h.pasado.push({ ...entrada, t: ahora });
      if (h.pasado.length > MAX_ENTRADAS) h.pasado.shift();
    }
    h.futuro = [];
    sincronizar();
  }, []);

  const limpiar = useCallback(() => {
    pila.current = { pasado: [], futuro: [] };
    sincronizar();
  }, []);

  // Saca una entrada de `origen`, la aplica y la pasa a `destino`. Si falla, la devuelve y propaga el error.
  const mover = async (origen, destino, sentido, aplicar) => {
    const h = pila.current;
    if (ocupado.current || h[origen].length === 0) return false;
    ocupado.current = true;
    const entrada = h[origen].pop();
    try {
      await aplicar(entrada, sentido);
      h[destino].push(entrada);
      return true;
    } catch (err) {
      h[origen].push(entrada);
      throw err;
    } finally {
      ocupado.current = false;
      sincronizar();
    }
  };

  return {
    registrar,
    limpiar,
    deshacer: (aplicar) => mover("pasado", "futuro", "deshacer", aplicar),
    rehacer: (aplicar) => mover("futuro", "pasado", "rehacer", aplicar),
    puedeDeshacer: conteo.pasado > 0,
    puedeRehacer: conteo.futuro > 0,
  };
}
