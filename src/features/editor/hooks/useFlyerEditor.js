import { useState, useEffect, useCallback, useRef } from "react";
import { flyerService } from "../../../services/flyerService";
import { paginaService } from "../../../services/paginaService";
import { moduloService } from "../../../services/moduloService";
import { notify, errorMessage } from "../../../store/notifyStore";
import { getGrid } from "../../../config/templates";
import { encontrarCeldaLibre, reubicarSiColisiona } from "../utils/grid";
import { useHistorial } from "./useHistorial";

function fail(err, mensaje) {
  console.error(mensaje, err);
  notify.error(errorMessage(err, mensaje));
}

// Campos que son solo "modo de la interfaz": no se guardan en el historial de deshacer.
const SOLO_INTERFAZ = ["edicion_libre"];

// Copia del módulo sin la relación con el producto (lo que realmente es una fila de `modulos`).
function filaModulo(modulo) {
  const fila = { ...modulo };
  delete fila.productos;
  return fila;
}

export function useFlyerEditor(flyerId) {
  const [flyer, setFlyer] = useState(null);
  const [paginas, setPaginas] = useState([]);
  const [modulosPorPagina, setModulosPorPagina] = useState({});
  const [paginaActual, setPaginaActual] = useState(0);
  const [selectedModulo, setSelectedModulo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [copiado, setCopiado] = useState(null);

  const [duplicarModulo, setDuplicarModulo] = useState(null);
  const [eliminarPagina, setEliminarPagina] = useState(null);

  const historial = useHistorial();

  // Copia siempre actualizada del estado para usarla dentro de handlers async sin datos viejos.
  const stateRef = useRef({ paginas, modulosPorPagina });
  useEffect(() => {
    stateRef.current = { paginas, modulosPorPagina };
  });

  const grid = getGrid(flyer);

  // ---------- Carga inicial ----------
  const cargar = useCallback(async () => {
    try {
      setErrorMsg(null);
      const flyerData = await flyerService.getById(flyerId);

      let listaPaginas = await paginaService.listByFlyer(flyerId);
      if (listaPaginas.length === 0) {
        listaPaginas = [await paginaService.create(flyerId, 1)];
      }

      const modulosData = await moduloService.listByFlyer(flyerId);
      const mapeo = {};
      listaPaginas.forEach((pag, index) => {
        mapeo[index] = modulosData.filter((m) => m.pagina_id === pag.id);
      });

      setFlyer(flyerData);
      setPaginas(listaPaginas);
      setModulosPorPagina(mapeo);
    } catch (error) {
      console.error("Error cargando el folleto:", error);
      setErrorMsg("No se pudo cargar el folleto correctamente.");
    } finally {
      setLoading(false);
    }
  }, [flyerId]);

  useEffect(() => {
    if (flyerId) cargar();
  }, [flyerId, cargar]);

  // ---------- Helpers de estado ----------
  const indicePaginaDe = (paginaId) => stateRef.current.paginas.findIndex((p) => p.id === paginaId);

  const buscarModulo = (moduloId) => {
    for (const lista of Object.values(stateRef.current.modulosPorPagina)) {
      const m = lista.find((x) => x.id === moduloId);
      if (m) return m;
    }
    return null;
  };

  // Vuelve a leer los módulos del servidor (se usa después de deshacer/rehacer).
  const recargarModulos = async () => {
    const data = await moduloService.listByFlyer(flyerId);
    const mapeo = {};
    stateRef.current.paginas.forEach((pag, i) => {
      mapeo[i] = data.filter((m) => m.pagina_id === pag.id);
    });
    setModulosPorPagina(mapeo);
    setSelectedModulo((prev) => (prev ? data.find((m) => m.id === prev.id) || null : null));
  };

  // ---------- Deshacer / rehacer ----------
  // Cada entrada del historial es: update | posiciones | crear | borrar | lote (varias juntas).
  const aplicarEntrada = async (e, sentido) => {
    const deshacer = sentido === "deshacer";
    switch (e.tipo) {
      case "update":
        await moduloService.update(e.id, deshacer ? e.antes : e.despues);
        break;
      case "posiciones":
        await moduloService.updatePosiciones(deshacer ? e.antes : e.despues);
        break;
      case "crear":
        if (deshacer) await moduloService.remove(e.modulo.id);
        else await moduloService.create(e.modulo);
        break;
      case "borrar":
        if (deshacer) await moduloService.create(e.modulo);
        else await moduloService.remove(e.modulo.id);
        break;
      case "lote":
        for (const item of deshacer ? [...e.items].reverse() : e.items) await aplicarEntrada(item, sentido);
        break;
      default:
        break;
    }
  };

  const ejecutarHistorial = async (accion, mensajeError) => {
    try {
      const hecho = await accion(aplicarEntrada);
      if (hecho) await recargarModulos();
    } catch (err) {
      fail(err, mensajeError);
      recargarModulos().catch(() => {});
    }
  };

  const handleDeshacer = () => ejecutarHistorial(historial.deshacer, "No se pudo deshacer");
  const handleRehacer = () => ejecutarHistorial(historial.rehacer, "No se pudo rehacer");

  // ---------- Módulos ----------
  const handleAddProducto = async (producto) => {
    const idx = paginaActual;
    const pag = stateRef.current.paginas[idx];
    if (!pag) return;

    const lista = stateRef.current.modulosPorPagina[idx] || [];
    const posicion = encontrarCeldaLibre(lista, 1, 1, grid);
    if (posicion === null) {
      notify.error(`La página está llena (${grid.cols * grid.rows} lugares). Agregá otra página.`);
      return;
    }

    try {
      const data = await moduloService.create({
        flyer_id: flyerId,
        pagina_id: pag.id,
        producto_id: producto.id,
        tamano: "M",
        posicion,
        tipo_precio: "regular",
        fondo_modulo: "empty",
        estilo_borde: "none",
      });
      setModulosPorPagina((prev) => ({ ...prev, [idx]: [...(prev[idx] || []), data] }));
      historial.registrar({ tipo: "crear", modulo: filaModulo(data) });
    } catch (err) {
      fail(err, "No se pudo añadir el producto");
    }
  };

  const handleDeleteModulo = async (moduloId) => {
    const original = buscarModulo(moduloId);
    try {
      await moduloService.remove(moduloId);
      setSelectedModulo((prev) => (prev?.id === moduloId ? null : prev));
      setModulosPorPagina((prev) => {
        const next = {};
        for (const [k, lista] of Object.entries(prev)) next[k] = lista.filter((m) => m.id !== moduloId);
        return next;
      });
      if (original) historial.registrar({ tipo: "borrar", modulo: filaModulo(original) });
    } catch (err) {
      fail(err, "No se pudo eliminar el módulo");
    }
  };

  const handleUpdateModulo = async (moduloId, campos) => {
    const original = buscarModulo(moduloId);
    const antes = {};
    Object.keys(campos).forEach((k) => {
      antes[k] = original?.[k] ?? null;
    });

    try {
      const data = await moduloService.update(moduloId, campos);
      const idx = indicePaginaDe(data.pagina_id);
      let lista = (stateRef.current.modulosPorPagina[idx] || []).map((m) => (m.id === moduloId ? data : m));
      const entradas = [];

      const cambioReal = JSON.stringify(antes) !== JSON.stringify(campos);
      const esSoloInterfaz = Object.keys(campos).every((k) => SOLO_INTERFAZ.includes(k));
      if (cambioReal && !esSoloInterfaz) entradas.push({ tipo: "update", id: moduloId, antes, despues: campos });

      // Si cambió el tamaño en la grilla, resolver choques y mantener todo dentro de la página.
      if ("colSpan" in campos || "rowSpan" in campos) {
        const previas = new Map(lista.map((m) => [m.id, m.posicion || 0]));
        const nuevos = reubicarSiColisiona(lista, moduloId, data.posicion || 0, grid);
        const cambiados = nuevos.filter((n) => previas.get(n.id) !== (n.posicion || 0));
        lista = nuevos.sort((a, b) => (a.posicion || 0) - (b.posicion || 0));
        if (cambiados.length) {
          await moduloService.updatePosiciones(cambiados);
          entradas.push({
            tipo: "posiciones",
            antes: cambiados.map((c) => ({ id: c.id, posicion: previas.get(c.id) })),
            despues: cambiados.map((c) => ({ id: c.id, posicion: c.posicion })),
          });
        }
      }

      setModulosPorPagina((prev) => ({ ...prev, [idx]: lista }));
      setSelectedModulo((prev) => (prev?.id === moduloId ? lista.find((m) => m.id === moduloId) || data : prev));

      if (entradas.length === 1) historial.registrar(entradas[0]);
      else if (entradas.length > 1) historial.registrar({ tipo: "lote", items: entradas });
    } catch (err) {
      fail(err, "No se pudo guardar el cambio");
      cargar();
    }
  };

  const handleReorderModulos = async (pagIdx, nuevos) => {
    const anteriores = stateRef.current.modulosPorPagina[pagIdx] || [];
    const posAnterior = new Map(anteriores.map((m) => [m.id, m.posicion || 0]));
    const cambiados = nuevos.filter((n) => posAnterior.get(n.id) !== (n.posicion || 0));

    setModulosPorPagina((prev) => ({ ...prev, [pagIdx]: nuevos }));
    setSelectedModulo((prev) => (prev ? nuevos.find((m) => m.id === prev.id) || prev : prev));
    if (!cambiados.length) return;

    try {
      await moduloService.updatePosiciones(cambiados);
      historial.registrar({
        tipo: "posiciones",
        antes: cambiados.map((c) => ({ id: c.id, posicion: posAnterior.get(c.id) })),
        despues: cambiados.map((c) => ({ id: c.id, posicion: c.posicion })),
      });
    } catch (err) {
      fail(err, "No se pudo guardar la nueva posición");
      setModulosPorPagina((prev) => ({ ...prev, [pagIdx]: anteriores }));
    }
  };

  // Crea una copia de `origen` en la página `paginaIdx` (en la primera celda libre).
  const crearCopia = async (origen, paginaIdx, tamano) => {
    const pag = stateRef.current.paginas[paginaIdx];
    if (!pag) return null;

    const copia = filaModulo(origen);
    delete copia.id;
    delete copia.created_at;

    const lista = stateRef.current.modulosPorPagina[paginaIdx] || [];
    const posicion = encontrarCeldaLibre(lista, copia.colSpan || 1, copia.rowSpan || 1, grid);
    if (posicion === null) {
      notify.error("No hay lugar libre en la página para este módulo.");
      return null;
    }

    try {
      const data = await moduloService.create({
        ...copia,
        pagina_id: pag.id,
        tamano: tamano || copia.tamano,
        posicion,
      });
      setModulosPorPagina((prev) => ({ ...prev, [paginaIdx]: [...(prev[paginaIdx] || []), data] }));
      historial.registrar({ tipo: "crear", modulo: filaModulo(data) });
      return data;
    } catch (err) {
      fail(err, "No se pudo duplicar el módulo");
      return null;
    }
  };

  // Duplicar desde el modal (permite elegir el tamaño de la copia).
  const handleDuplicar = async (nuevoTamano) => {
    if (!duplicarModulo) return;
    const idx = indicePaginaDe(duplicarModulo.pagina_id);
    const data = await crearCopia(duplicarModulo, idx, nuevoTamano);
    if (data) setDuplicarModulo(null);
  };

  // Atajos tipo Figma: Ctrl+D duplica al instante; Ctrl+C / Ctrl+V copian y pegan módulos.
  const duplicarSeleccion = async () => {
    if (!selectedModulo) return;
    const data = await crearCopia(selectedModulo, indicePaginaDe(selectedModulo.pagina_id));
    if (data) setSelectedModulo(data);
  };

  const copiarSeleccion = () => {
    if (!selectedModulo) return;
    setCopiado(filaModulo(selectedModulo));
    notify.info("Módulo copiado");
  };

  const pegarCopiado = async () => {
    if (!copiado) return;
    const data = await crearCopia(copiado, paginaActual);
    if (data) setSelectedModulo(data);
  };

  const handleMenuAction = (action, modulo) => {
    if (action === "delete") handleDeleteModulo(modulo.id);
    if (action === "duplicate") setDuplicarModulo(modulo);
  };

  const handleResize = (moduloId, nuevoTamano) => handleUpdateModulo(moduloId, { tamano: nuevoTamano });

  const handleUploadImagenModulo = async (moduloId, file) => {
    try {
      const url = await moduloService.uploadImagen(flyerId, moduloId, file);
      await handleUpdateModulo(moduloId, { img_override: url, es_promo_3x1: true });
    } catch (err) {
      fail(err, "No se pudo subir la imagen");
    }
  };

  // ---------- Páginas ----------
  const handleAddPagina = async () => {
    try {
      const actuales = stateRef.current.paginas;
      const numero = actuales.reduce((max, p) => Math.max(max, p.numero || 0), 0) + 1;
      const data = await paginaService.create(flyerId, numero);
      const nuevas = [...actuales, data];
      setPaginas(nuevas);
      setModulosPorPagina((prev) => ({ ...prev, [nuevas.length - 1]: [] }));
      setPaginaActual(nuevas.length - 1);
    } catch (err) {
      fail(err, "No se pudo agregar la página");
    }
  };

  const handleRenamePagina = async (paginaId, nombre) => {
    try {
      await paginaService.rename(paginaId, nombre);
      setPaginas((prev) => prev.map((p) => (p.id === paginaId ? { ...p, nombre } : p)));
    } catch (err) {
      fail(err, "No se pudo renombrar la página");
    }
  };

  const handleDeletePagina = async () => {
    if (!eliminarPagina) return;
    try {
      const { idx, pag } = eliminarPagina;
      await paginaService.remove(pag.id);

      const { paginas: actuales, modulosPorPagina: mods } = stateRef.current;
      const nuevas = actuales.filter((p) => p.id !== pag.id).map((p, i) => ({ ...p, numero: i + 1 }));
      const mapeo = {};
      nuevas.forEach((_, i) => {
        mapeo[i] = mods[i >= idx ? i + 1 : i] || [];
      });

      setPaginas(nuevas);
      setModulosPorPagina(mapeo);
      setPaginaActual(Math.max(0, idx - 1));
      setSelectedModulo(null);
      setEliminarPagina(null);
      historial.limpiar(); // los módulos de la página borrada ya no existen: no se puede deshacer más atrás

      paginaService.renumber(nuevas).catch((err) => console.error("No se pudo renumerar las páginas:", err));
    } catch (err) {
      fail(err, "No se pudo eliminar la página");
    }
  };

  // ---------- Folleto ----------
  const handleFlyerUpdate = async (campo, valor) => {
    try {
      await flyerService.update(flyerId, { [campo]: valor });
      setFlyer((prev) => ({ ...prev, [campo]: valor }));
    } catch (err) {
      fail(err, "No se pudo guardar el cambio del folleto");
    }
  };

  const handleUploadFooter = async (file) => {
    try {
      const url = await flyerService.uploadFooter(flyerId, file);
      setFlyer((prev) => ({ ...prev, footer_url: url }));
    } catch (err) {
      fail(err, "No se pudo subir el pie de página");
    }
  };

  const handleRemoveFooter = async () => {
    try {
      await flyerService.removeFooter(flyerId);
      setFlyer((prev) => ({ ...prev, footer_url: null }));
    } catch (err) {
      fail(err, "No se pudo quitar el pie de página");
    }
  };

  return {
    flyer,
    grid,
    paginas,
    modulosPorPagina,
    modulosPaginaActual: modulosPorPagina[paginaActual] || [],
    paginaActual,
    selectedModulo,
    loading,
    errorMsg,
    duplicarModulo,
    eliminarPagina,
    puedeDeshacer: historial.puedeDeshacer,
    puedeRehacer: historial.puedeRehacer,
    puedePegar: Boolean(copiado),
    setPaginaActual,
    setSelectedModulo,
    setDuplicarModulo,
    setEliminarPagina,
    handleDeshacer,
    handleRehacer,
    duplicarSeleccion,
    copiarSeleccion,
    pegarCopiado,
    handleAddProducto,
    handleDeleteModulo,
    handleUpdateModulo,
    handleReorderModulos,
    handleDuplicar,
    handleMenuAction,
    handleResize,
    handleUploadImagenModulo,
    handleAddPagina,
    handleRenamePagina,
    handleDeletePagina,
    handleFlyerUpdate,
    handleUploadFooter,
    handleRemoveFooter,
  };
}
