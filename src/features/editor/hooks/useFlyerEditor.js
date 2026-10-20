import { useState, useEffect, useCallback, useRef } from "react";
import { flyerService } from "../../../services/flyerService";
import { paginaService } from "../../../services/paginaService";
import { moduloService } from "../../../services/moduloService";
import { notify, errorMessage } from "../../../store/notifyStore";
import { getGrid } from "../../../config/templates";
import { encontrarCeldaLibre, reubicarSiColisiona } from "../utils/grid";

function fail(err, mensaje) {
  console.error(mensaje, err);
  notify.error(errorMessage(err, mensaje));
}

export function useFlyerEditor(flyerId) {
  const [flyer, setFlyer] = useState(null);
  const [paginas, setPaginas] = useState([]);
  const [modulosPorPagina, setModulosPorPagina] = useState({});
  const [paginaActual, setPaginaActual] = useState(0);
  const [selectedModulo, setSelectedModulo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const [duplicarModulo, setDuplicarModulo] = useState(null);
  const [eliminarPagina, setEliminarPagina] = useState(null);

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
    } catch (err) {
      fail(err, "No se pudo añadir el producto");
    }
  };

  const handleDeleteModulo = async (moduloId) => {
    try {
      await moduloService.remove(moduloId);
      setSelectedModulo((prev) => (prev?.id === moduloId ? null : prev));
      setModulosPorPagina((prev) => {
        const next = {};
        for (const [k, lista] of Object.entries(prev)) next[k] = lista.filter((m) => m.id !== moduloId);
        return next;
      });
    } catch (err) {
      fail(err, "No se pudo eliminar el módulo");
    }
  };

  const handleUpdateModulo = async (moduloId, campos) => {
    try {
      const data = await moduloService.update(moduloId, campos);
      const idx = indicePaginaDe(data.pagina_id);
      let lista = (stateRef.current.modulosPorPagina[idx] || []).map((m) => (m.id === moduloId ? data : m));

      // Si cambió el tamaño en la grilla, resolver choques y mantener todo dentro de la página.
      if ("colSpan" in campos || "rowSpan" in campos) {
        const nuevos = reubicarSiColisiona(lista, moduloId, data.posicion || 0, grid);
        const cambiados = nuevos.filter((n) => lista.find((m) => m.id === n.id)?.posicion !== n.posicion);
        lista = nuevos.sort((a, b) => (a.posicion || 0) - (b.posicion || 0));
        if (cambiados.length) await moduloService.updatePosiciones(cambiados);
      }

      setModulosPorPagina((prev) => ({ ...prev, [idx]: lista }));
      setSelectedModulo((prev) => (prev?.id === moduloId ? lista.find((m) => m.id === moduloId) || data : prev));
    } catch (err) {
      fail(err, "No se pudo guardar el cambio");
      cargar();
    }
  };

  const handleReorderModulos = async (pagIdx, nuevos) => {
    const anteriores = stateRef.current.modulosPorPagina[pagIdx] || [];
    const cambiados = nuevos.filter((n) => anteriores.find((m) => m.id === n.id)?.posicion !== n.posicion);

    setModulosPorPagina((prev) => ({ ...prev, [pagIdx]: nuevos }));
    setSelectedModulo((prev) => (prev ? nuevos.find((m) => m.id === prev.id) || prev : prev));
    if (!cambiados.length) return;

    try {
      await moduloService.updatePosiciones(cambiados);
    } catch (err) {
      fail(err, "No se pudo guardar la nueva posición");
      setModulosPorPagina((prev) => ({ ...prev, [pagIdx]: anteriores }));
    }
  };

  const handleDuplicar = async (nuevoTamano) => {
    if (!duplicarModulo) return;
    // Se copia todo el módulo (formato, spans, precio, imagen, posiciones libres...) salvo identidad.
    // eslint-disable-next-line no-unused-vars
    const { id, created_at, productos, ...copia } = duplicarModulo;
    const idx = indicePaginaDe(duplicarModulo.pagina_id);
    const lista = stateRef.current.modulosPorPagina[idx] || [];
    const posicion = encontrarCeldaLibre(lista, copia.colSpan || 1, copia.rowSpan || 1, grid);

    if (posicion === null) {
      notify.error("No hay lugar libre en la página para duplicar este módulo.");
      return;
    }

    try {
      const data = await moduloService.create({ ...copia, tamano: nuevoTamano, posicion });
      setModulosPorPagina((prev) => ({ ...prev, [idx]: [...(prev[idx] || []), data] }));
      setDuplicarModulo(null);
    } catch (err) {
      fail(err, "No se pudo duplicar el módulo");
    }
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
    setPaginaActual,
    setSelectedModulo,
    setDuplicarModulo,
    setEliminarPagina,
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
