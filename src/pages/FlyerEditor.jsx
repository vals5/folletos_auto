import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, CircularProgress, IconButton, Typography, Chip, Tooltip, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { supabase } from "../services/supabase";

import ProductsSidebar from "../components/editor/ProductsSidebar";
import CanvasPreview from "../components/editor/CanvasPreview";
import PropertiesPanel from "../components/editor/PropertiesPanel";

import DuplicarModal from "../components/utils/DuplicarModal";
import ConfirmarEliminarPagina from "../components/utils/ConfirmarEliminarPagina";

export default function FlyerEditor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [flyer, setFlyer] = useState(null);
  const [plantilla, setPlantilla] = useState(null);
  const [paginas, setPaginas] = useState([]);
  const [modulosPorPagina, setModulosPorPagina] = useState({});
  const [paginaActual, setPaginaActual] = useState(0);
  const [selectedModulo, setSelectedModulo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [duplicarModulo, setDuplicarModulo] = useState(null);
  const [eliminarPagina, setEliminarPagina] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    fetchFlyer();
  }, [id]);

  const fetchFlyer = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      // 1. Obtener datos del folleto (Flyer)
      const { data: flyerData, error: fErr } = await supabase
        .from("flyers")
        .select("*")
        .eq("id", id)
        .single();

      if (fErr || !flyerData) {
        setErrorMsg("No se encontró el folleto solicitado.");
        return;
      }
      setFlyer(flyerData);

      // 2. Obtener datos de la plantilla usando la columna correcta "id_plantilla"
      if (flyerData.template_id || flyerData.plantilla_id) {
        const targetTemplateId = flyerData.template_id || flyerData.plantilla_id;
        
        // Si viene el string "imprec", forzamos la búsqueda por el ID numérico 1 que está en tu BD
        const parsedId = targetTemplateId === "imprec" ? 1 : targetTemplateId;

        const { data: tData } = await supabase
          .from("plantillas")
          .select("*")
          .eq("id_plantilla", parsedId)
          .single();
        
        setPlantilla(tData);
      }

      // 3. Obtener páginas usando la columna correcta de ordenamiento "numero"
      const { data: pagData, error: pErr } = await supabase
        .from("paginas")
        .select("*")
        .eq("flyer_id", id)
        .order("numero", { ascending: true });

      if (pErr) throw pErr;
      setPaginas(pagData || []);

      // 4. Obtener los módulos (en plural) asociados a las páginas obtenidas
      if (pagData && pagData.length > 0) {
        const pagIds = pagData.map((p) => p.id);
        const { data: modData, error: mErr } = await supabase
          .from("modulos")
          .select("*, productos(*)")
          .in("pagina_id", pagIds)
          .order("orden", { ascending: true });

        if (mErr) throw mErr;

        const mapeo = {};
        pagData.forEach((p) => {
          mapeo[p.id] = (modData || []).filter((m) => m.pagina_id === p.id);
        });
        setModulosPorPagina(mapeo);
      } else {
        setModulosPorPagina({});
      }
    } catch (err) {
      console.error("Error global fetchFlyer:", err);
      setErrorMsg("Ocurrió un error al cargar los datos del editor.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPagina = async () => {
    try {
      const siguienteNro = paginas.length + 1;
      
      // Corregido: Insertamos apuntando a la columna "numero" de tu base de datos
      const { data: nuevaPag, error } = await supabase
        .from("paginas")
        .insert([{ flyer_id: id, numero: siguienteNro }])
        .select()
        .single();

      if (error) throw error;

      setPaginas((prev) => [...prev, nuevaPag]);
      setModulosPorPagina((prev) => ({ ...prev, [nuevaPag.id]: [] }));
      setPaginaActual(paginas.length); // Mueve la vista a la nueva página
    } catch (err) {
      console.error("Error al añadir página:", err);
    }
  };

  const handleDeletePagina = async () => {
    if (!eliminarPagina) return;
    const { idx, pag } = eliminarPagina;

    try {
      const { error } = await supabase.from("paginas").delete().eq("id", pag.id);
      if (error) throw error;

      const nuevasPaginas = paginas.filter((p) => p.id !== pag.id);
      
      // Corregido: Reindexamos usando la columna "numero" para que sea consistente
      const paginasFormateadas = nuevasPaginas.map((p, i) => ({
        ...p,
        numero: i + 1,
      }));

      // Actualizamos de forma asíncrona las posiciones en la base de datos para evitar desajustes
      await Promise.all(paginasFormateadas.map((p) => 
        supabase.from("paginas").update({ numero: p.numero }).eq("id", p.id)
      ));

      setPaginas(paginasFormateadas);

      const nuevoModulosPorPagina = { ...modulosPorPagina };
      delete nuevoModulosPorPagina[pag.id];
      setModulosPorPagina(nuevoModulosPorPagina);

      if (paginaActual >= paginasFormateadas.length && paginaActual > 0) {
        setPaginaActual(paginasFormateadas.length - 1);
      }
      setSelectedModulo(null);
    } catch (err) {
      console.error("Error al eliminar página:", err);
    } finally {
      setEliminarPagina(null);
    }
  };

  const handleUpdateModulo = async (moduloId, changes) => {
    try {
      const { data: updated, error } = await supabase
        .from("modulos")
        .update(changes)
        .eq("id", moduloId)
        .select("*, productos(*)")
        .single();

      if (error) throw error;

      setModulosPorPagina((prev) => {
        const cop = { ...prev };
        if (cop[updated.pagina_id]) {
          cop[updated.pagina_id] = cop[updated.pagina_id].map((m) =>
            m.id === moduloId ? updated : m
          );
        }
        return cop;
      });

      if (selectedModulo?.id === moduloId) {
        setSelectedModulo(updated);
      }
    } catch (err) {
      console.error("Error al actualizar módulo:", err);
    }
  };

  const handleAddProducto = async (producto) => {
    if (paginas.length === 0) return;
    const pagIdActual = paginas[paginaActual]?.id;
    if (!pagIdActual) return;

    try {
      const modsActuales = modulosPorPagina[pagIdActual] || [];
      const siguienteOrden = modsActuales.length + 1;

      const { data: nuevoMod, error } = await supabase
        .from("modulos")
        .insert([
          {
            pagina_id: pagIdActual,
            producto_id: producto.id,
            orden: siguienteOrden,
            tamano: "M",
            precio: null,
            tipo_precio: "regular",
            estilo_borde: "none",
            fondo_modulo: "white",
          },
        ])
        .select("*, productos(*)")
        .single();

      if (error) throw error;

      setModulosPorPagina((prev) => ({
        ...prev,
        [pagIdActual]: [...modsActuales, nuevoMod],
      }));
    } catch (err) {
      console.error("Error al añadir producto:", err);
    }
  };

  const handleDeleteModulo = async (moduloId) => {
    try {
      const { error } = await supabase.from("modulos").delete().eq("id", moduloId);
      if (error) throw error;

      setModulosPorPagina((prev) => {
        const cop = { ...prev };
        Object.keys(cop).forEach((pId) => {
          cop[pId] = cop[pId].filter((m) => m.id !== moduloId);
        });
        return cop;
      });

      if (selectedModulo?.id === moduloId) {
        setSelectedModulo(null);
      }
    } catch (err) {
      console.error("Error al eliminar módulo:", err);
    }
  };

  const handleMenuAction = (action, modulo) => {
    if (action === "delete") {
      handleDeleteModulo(modulo.id);
    } else if (action === "duplicate") {
      setDuplicarModulo(modulo);
    }
  };

  const handleResize = (moduloId, nuevoTamano) =>
    handleUpdateModulo(moduloId, { tamano: nuevoTamano });

  const handleReorderModulos = (pagIdx, reordered) => {
    const pag = paginas[pagIdx];
    if (!pag) return;
    setModulosPorPagina((prev) => ({ ...prev, [pag.id]: reordered }));
  };

  const handleDuplicar = async (nuevoTamano) => {
    if (!duplicarModulo) return;
    const pagIdActual = paginas[paginaActual]?.id;
    if (!pagIdActual) return;

    try {
      const modsActuales = modulosPorPagina[pagIdActual] || [];
      const siguienteOrden = modsActuales.length + 1;

      const { data: copia, error } = await supabase
        .from("modulos")
        .insert([
          {
            pagina_id: pagIdActual,
            producto_id: duplicarModulo.producto_id,
            orden: siguienteOrden,
            tamano: nuevoTamano,
            precio: duplicarModulo.precio,
            tipo_precio: duplicarModulo.tipo_precio,
            estilo_borde: duplicarModulo.estilo_borde,
            fondo_modulo: duplicarModulo.fondo_modulo,
            nombre_override: duplicarModulo.nombre_override,
            descripcion_override: duplicarModulo.descripcion_override,
            layout_type: duplicarModulo.layout_type,
          },
        ])
        .select("*, productos(*)")
        .single();

      if (error) throw error;

      setModulosPorPagina((prev) => ({
        ...prev,
        [pagIdActual]: [...modsActuales, copia],
      }));
    } catch (err) {
      console.error("Error al duplicar módulo:", err);
    } finally {
      setDuplicarModulo(null);
    }
  };

  const handleFlyerUpdate = (field, value) => {
    setFlyer((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const todosLosModulos = Object.values(modulosPorPagina).flat();

  if (loading) {
    return (
      <Box display="flex" height="100dvh" justifyContent="center" alignItems="center">
        <CircularProgress />
      </Box>
    );
  }

  if (errorMsg) {
    return (
      <Box display="flex" height="100dvh" justifyContent="center" alignItems="center" flexDirection="column" gap={2}>
        <Typography color="error" fontWeight={700}>{errorMsg}</Typography>
        <Button variant="outlined" onClick={() => navigate("/dashboard")}>
          Volver al dashboard
        </Button>
      </Box>
    );
  }

  return (
    <Box display="flex" height="100dvh" overflow="hidden">
      
      {/* Sidebar Izquierda */}
      <ProductsSidebar
        modulos={todosLosModulos}
        selectedModulo={selectedModulo}
        onSelectModulo={(m) => setSelectedModulo(m)}
        onAddProducto={handleAddProducto}
        onDeleteModulo={handleDeleteModulo}
      />

      {/* Área Central y Superior */}
      <Box display="flex" flexDirection="column" flex={1} overflow="hidden">
        
        {/* Barra Superior (Topbar) */}
        <Box
          sx={{
            height: 52,
            minHeight: 52,
            bgcolor: "#ffffff",
            display: "flex",
            alignItems: "center",
            px: 2,
            gap: 2,
            flexShrink: 0,
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <Tooltip title="Volver al dashboard">
            <IconButton size="small" onClick={() => navigate("/dashboard")} sx={{ color: "#025BA9" }}>
              <ArrowBackIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Typography fontWeight={600} color="#025BA9" fontSize={14} noWrap>
            {flyer?.name || flyer?.nombre}
          </Typography>
          
          {plantilla && (
            <Chip
              label={plantilla.nombre}
              size="small"
              sx={{ bgcolor: plantilla.color_header || "#ff0000", color: "white", fontSize: 10, fontWeight: 700 }}
            />
          )}
          
          <Chip
            label={flyer?.estado || "BORRADOR"}
            size="small"
            sx={{ bgcolor: "#025BA9", color: "white", fontSize: 11 }}
          />
          
          {flyer?.width && (
            <Chip
              label={`${flyer.width}×${flyer.height}px`}
              size="small"
              sx={{ bgcolor: "#025BA9", color: "white", fontSize: 10, ml: "auto" }}
            />
          )}
        </Box>

        {/* Canvas de Previsualización + Panel de Propiedades Derecho */}
        <Box display="flex" flex={1} overflow="hidden">
          <CanvasPreview
            flyer={flyer}
            plantilla={plantilla}
            paginas={paginas}
            modulosPorPagina={modulosPorPagina}
            paginaActual={paginaActual}
            setPaginaActual={setPaginaActual}
            selectedModulo={selectedModulo}
            onSelectModulo={(m) => setSelectedModulo(m)}
            onFlyerUpdate={handleFlyerUpdate}
            onReorderModulos={handleReorderModulos}
            onAddPagina={handleAddPagina}
            onDeletePagina={(idx, pag) => setEliminarPagina({ idx, pag })}
            onMenuAction={handleMenuAction}
            onResize={handleResize}
          />
          <PropertiesPanel 
            modulo={selectedModulo} 
            onUpdate={handleUpdateModulo} 
            onDuplicate={(m) => setDuplicarModulo(m)}
          />
        </Box>
      </Box>

      {/* Modales Externalizados */}
      <DuplicarModal
        open={!!duplicarModulo}
        modulo={duplicarModulo}
        onClose={() => setDuplicarModulo(null)}
        onDuplicate={handleDuplicar}
      />

      <ConfirmarEliminarPagina
        open={!!eliminarPagina}
        onClose={() => setEliminarPagina(null)}
        onConfirm={handleDeletePagina}
      />
    </Box>
  );
}