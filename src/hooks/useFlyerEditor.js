import { useState, useEffect } from "react";
import { supabase } from "../services/supabase"; 

export function useFlyerEditor(flyerId) {
  const [flyer, setFlyer] = useState(null);
  const [plantilla, setPlantilla] = useState(null);
  const [paginas, setPaginas] = useState([]);
  const [modulosPorPagina, setModulosPorPagina] = useState({});
  const [paginaActual, setPaginaActual] = useState(0);
  const [selectedModulo, setSelectedModulo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const [duplicarModulo, setDuplicarModulo] = useState(null);
  const [eliminarPagina, setEliminarPagina] = useState(null);

  useEffect(() => {
    if (flyerId) {
      fetchFlyerCompleto();
    }
  }, [flyerId]);

  const fetchFlyerCompleto = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const { data: flyerData, error: flyerErr } = await supabase
        .from("flyers")
        .select("*")
        .eq("id", flyerId)
        .single();

      if (flyerErr) throw flyerErr;
      setFlyer(flyerData);

      if (flyerData.plantilla_id) {
        const { data: planData } = await supabase
          .from("plantillas")
          .select("*")
          .eq("id", flyerData.plantilla_id)
          .single();
        setPlantilla(planData);
      }

      const { data: paginasData, error: pagErr } = await supabase
        .from("paginas")
        .select("*")
        .eq("flyer_id", flyerId)
        .order("numero", { ascending: true });

      if (pagErr) throw pagErr;

      let listaPaginas = paginasData || [];
      if (listaPaginas.length === 0) {
        const { data: nuevaPag, error: nuevaPagErr } = await supabase
          .from("paginas")
          .insert([{ flyer_id: flyerId, numero: 1 }])
          .select()
          .single();
        
        if (nuevaPagErr) throw nuevaPagErr;
        listaPaginas = [nuevaPag];
      }
      setPaginas(listaPaginas);

      const { data: modulosData, error: modErr } = await supabase
        .from("modulos")
        .select("*, productos(*)")
        .eq("flyer_id", flyerId)
        .order("posicion", { ascending: true });

      if (modErr) throw modErr;

      const mapeoModulos = {};
      listaPaginas.forEach((pag, index) => {
        mapeoModulos[index] = (modulosData || []).filter(m => m.pagina_id === pag.id);
      });
      setModulosPorPagina(mapeoModulos);

    } catch (error) {
      console.error("Error cargando el folleto:", error);
      setErrorMsg("No se pudo cargar el folleto correctamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProducto = async (producto) => {
    try {
      const paginaObj = paginas[paginaActual];
      if (!paginaObj) return;

      const modulosActuales = modulosPorPagina[paginaActual] || [];
      const nuevaPosicion = modulosActuales.length;

      const nuevoModulo = {
        flyer_id: flyerId,
        pagina_id: paginaObj.id,
        producto_id: producto.id,
        tamano: "M",
        posicion: nuevaPosicion,
        precio_override: null,
        precio_sub_override: null,
        tipo_precio: "regular",
        fondo_modulo: "empty",
        estilo_borde: "none"
      };

      const { data, error } = await supabase
        .from("modulos")
        .insert([nuevoModulo])
        .select("*, productos(*)")
        .single();

      if (error) throw error;

      setModulosPorPagina(prev => ({
        ...prev,
        [paginaActual]: [...modulosActuales, data]
      }));
    } catch (err) {
      console.error("Error al añadir producto:", err);
    }
  };

  const handleDeleteModulo = async (moduloId) => {
    try {
      const { error } = await supabase.from("modulos").delete().eq("id", moduloId);
      if (error) throw error;

      if (selectedModulo?.id === moduloId) setSelectedModulo(null);

      setModulosPorPagina(prev => ({
        ...prev,
        [paginaActual]: (prev[paginaActual] || []).filter(m => m.id !== moduloId)
      }));
    } catch (err) {
      console.error("Error al eliminar módulo:", err);
    }
  };

  const handleUpdateModulo = async (moduloId, camposActualizados) => {
    try {
      const { data, error } = await supabase
        .from("modulos")
        .update(camposActualizados)
        .eq("id", moduloId)
        .select("*, productos(*)")
        .single();

      if (error) throw error;

      if (selectedModulo?.id === moduloId) setSelectedModulo(data);

      setModulosPorPagina(prev => ({
        ...prev,
        [paginaActual]: (prev[paginaActual] || []).map(m => m.id === moduloId ? data : m)
      }));
    } catch (err) {
      console.error("Error al actualizar módulo:", err);
    }
  };

  const handleAddPagina = async () => {
    try {
      const nuevoNumero = paginas.length + 1;
      const { data, error } = await supabase
        .from("paginas")
        .insert([{ flyer_id: flyerId, numero: nuevoNumero }])
        .select()
        .single();

      if (error) throw error;

      const nuevasPaginas = [...paginas, data];
      setPaginas(nuevasPaginas);
      setModulosPorPagina(prev => ({ ...prev, [nuevasPaginas.length - 1]: [] }));
      setPaginaActual(nuevasPaginas.length - 1);
    } catch (err) {
      console.error("Error al agregar página:", err);
    }
  };

  const handleDeletePagina = async () => {
    if (!eliminarPagina) return;
    try {
      const { idx, pag } = eliminarPagina;
      const { error } = await supabase.from("paginas").delete().eq("id", pag.id);
      if (error) throw error;

      const nuevasPaginas = paginas.filter(p => p.id !== pag.id).map((p, i) => ({ ...p, numero: i + 1 }));
      setPaginas(nuevasPaginas);
      
      const nuevoMapeo = {};
      nuevasPaginas.forEach((p, i) => {
        const antiguoIdx = i >= idx ? i + 1 : i;
        nuevoMapeo[i] = modulosPorPagina[antiguoIdx] || [];
      });
      setModulosPorPagina(nuevoMapeo);
      
      setPaginaActual(Math.max(0, idx - 1));
      setEliminarPagina(null);
    } catch (err) {
      console.error("Error al eliminar página:", err);
    }
  };

  const handleDuplicar = async (nuevoTamano) => {
    if (!duplicarModulo) return;
    try {
      const modulosActuales = modulosPorPagina[paginaActual] || [];
      const clon = {
        flyer_id: flyerId,
        pagina_id: duplicarModulo.pagina_id,
        producto_id: duplicarModulo.producto_id,
        tamano: nuevoTamano,
        posicion: modulosActuales.length,
        precio_override: duplicarModulo.precio_override,
        precio_sub_override: duplicarModulo.precio_sub_override,
        tipo_precio: duplicarModulo.tipo_precio,
        fondo_modulo: duplicarModulo.fondo_modulo,
        estilo_borde: duplicarModulo.estilo_borde,
        nombre_override: duplicarModulo.nombre_override,
        descripcion_override: duplicarModulo.descripcion_override
      };

      const { data, error } = await supabase
        .from("modulos")
        .insert([clon])
        .select("*, productos(*)")
        .single();

      if (error) throw error;

      setModulosPorPagina(prev => ({
        ...prev,
        [paginaActual]: [...modulosActuales, data]
      }));
      setDuplicarModulo(null);
    } catch (err) {
      console.error("Error al duplicar módulo:", err);
    }
  };

  const handleFlyerUpdate = async (campo, valor) => {
    try {
      const { error } = await supabase
        .from("flyers")
        .update({ [campo]: valor })
        .eq("id", flyerId);

      if (error) throw error;
      setFlyer(prev => ({ ...prev, [campo]: valor }));
    } catch (err) {
      console.error("Error al actualizar flyer:", err);
    }
  };

  const handleMenuAction = (action, modulo) => {
    if (action === "delete") handleDeleteModulo(modulo.id);
    if (action === "duplicate") setDuplicarModulo(modulo);
  };

  const handleResize = (moduloId, nuevoTamano) => {
    handleUpdateModulo(moduloId, { tamano: nuevoTamano });
  };

  const handleReorderModulos = (pagIdx, nuevosModulos) => {
    setModulosPorPagina(prev => ({ ...prev, [pagIdx]: nuevosModulos }));
  };

  const modulosPaginaActual = modulosPorPagina[paginaActual] || [];

  return {
    flyer,
    plantilla,
    paginas,
    modulosPorPagina,
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
    handleOnAddProducto: handleAddProducto, 
    handleDeleteModulo,
    handleUpdateModulo,
    handleAddPagina,
    handleDeletePagina,
    handleMenuAction,
    handleResize,
    handleReorderModulos,
    handleDuplicar,
    handleFlyerUpdate,
    modulosPaginaActual
  };
}