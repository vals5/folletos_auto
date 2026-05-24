import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, CircularProgress, IconButton, Typography, Chip, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button, } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { supabase } from "../services/supabase";
import ProductsSidebar from "../components/editor/ProductsSidebar";
import CanvasPreview from "../components/editor/CanvasPreview";
import PropertiesPanel from "../components/editor/PropertiesPanel";

const TAMANOS = ["XS", "S", "M", "L", "XL"];

function DuplicarModal({ open, modulo, onClose, onDuplicate }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Duplicar módulo</DialogTitle>
      <DialogContent>
        <Typography fontSize={14} mb={2}>
          Elegí el tamaño para la copia de <strong>{modulo?.productos?.nombre}</strong>:
        </Typography>
        <Box display="flex" gap={1} flexWrap="wrap">
          {TAMANOS.map((t) => (
            <Button key={t} size="small" variant={modulo?.tamano === t ? "contained" : "outlined"}
              onClick={() => onDuplicate(t)}
              sx={{ ...(modulo?.tamano === t && { bgcolor: "#10b981", "&:hover": { bgcolor: "#2d2d5e" } }) }}>
              {t}
            </Button>
          ))}
        </Box>
      </DialogContent>
      <DialogActions><Button onClick={onClose} color="inherit">Cancelar</Button></DialogActions>
    </Dialog>
  );
}

function ConfirmarEliminarPagina({ open, onClose, onConfirm }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Eliminar página</DialogTitle>
      <DialogContent>
        <Typography>¿Seguro? Se borrarán todos los módulos de esta página.</Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">Cancelar</Button>
        <Button variant="contained" color="error" onClick={onConfirm}>Eliminar</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function FlyerEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [flyer, setFlyer]                       = useState(null);
  const [plantilla, setPlantilla]               = useState(null);
  const [paginas, setPaginas]                   = useState([]);
  const [modulosPorPagina, setModulosPorPagina] = useState({});
  const [paginaActual, setPaginaActual]         = useState(0);
  const [selectedModulo, setSelectedModulo]     = useState(null);
  const [loading, setLoading]                   = useState(true);
  const [duplicarModulo, setDuplicarModulo]     = useState(null);
  const [eliminarPagina, setEliminarPagina]     = useState(null);
  const [errorMsg, setErrorMsg]                 = useState(null);

  useEffect(() => { fetchFlyer(); }, [id]);

  const fetchFlyer = async () => {
    setLoading(true);
    setErrorMsg(null);

    const { data: flyerData, error: flyerError } = await supabase
      .from("flyers").select("*").eq("id", id).single();

    if (flyerError || !flyerData) {
      setErrorMsg("No se encontró el folleto.");
      setLoading(false);
      return;
    }

    if (flyerData?.plantilla_id) {
      const { data: plantillaData } = await supabase
        .from("plantillas").select("*").eq("id", flyerData.plantilla_id).single();
      if (plantillaData) setPlantilla(plantillaData);
    }

    let { data: paginasData, error: pagError } = await supabase
      .from("paginas").select("*").eq("flyer_id", id).order("numero");

    if (pagError) console.error("Error cargando páginas:", pagError);

    paginasData = (paginasData || []).filter(Boolean);

    if (paginasData.length === 0) {
      const { data: newPag, error: insertError } = await supabase
        .from("paginas")
        .insert({ flyer_id: id, numero: 1 })
        .select()
        .single();

      if (insertError || !newPag) {
        console.error("Error creando página inicial:", insertError);
        paginasData = [{ id: `local-${Date.now()}`, flyer_id: id, numero: 1 }];
      } else {
        paginasData = [newPag];
      }
    }

    const { data: modulosData } = await supabase
      .from("modulos")
      .select("*, productos(*)")
      .eq("flyer_id", id)
      .order("posicion");

    const agrupados = {};
    paginasData.forEach((p, idx) => {
      agrupados[idx] = (modulosData || []).filter(
        (m) => m && (m.pagina_id === p.id || (!m.pagina_id && idx === 0))
      );
    });

    setFlyer(flyerData);
    setPaginas(paginasData);
    setModulosPorPagina(agrupados);
    setLoading(false);
  };

  const handleAddPagina = async () => {
    const { data, error } = await supabase
      .from("paginas")
      .insert({ flyer_id: id, numero: paginas.length + 1 })
      .select()
      .single();

    if (error || !data) { console.error("Error agregando página:", error); return; }
    setPaginas((prev) => [...prev, data]);
    setModulosPorPagina((prev) => ({ ...prev, [paginas.length]: [] }));
  };

  const handleDeletePagina = async () => {
    if (!eliminarPagina) return;
    const { idx, pag } = eliminarPagina;
    await supabase.from("modulos").delete().eq("pagina_id", pag.id);
    await supabase.from("paginas").delete().eq("id", pag.id);
    const nuevasPaginas = paginas.filter((_, i) => i !== idx);
    const nuevosModulos = {};
    nuevasPaginas.forEach((_, i) => {
      nuevosModulos[i] = modulosPorPagina[i < idx ? i : i + 1] || [];
    });
    setPaginas(nuevasPaginas);
    setModulosPorPagina(nuevosModulos);
    setPaginaActual(Math.max(0, idx - 1));
    setSelectedModulo(null);
    setEliminarPagina(null);
  };

  const handleUpdateModulo = async (moduloId, changes) => {
    setModulosPorPagina((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((k) => {
        updated[k] = updated[k].map((m) => m.id === moduloId ? { ...m, ...changes } : m);
      });
      return updated;
    });
    setSelectedModulo((prev) => prev?.id === moduloId ? { ...prev, ...changes } : prev);
    await supabase.from("modulos").update(changes).eq("id", moduloId);
  };

  const handleAddProducto = async (producto) => {
    const paginaId = paginas[paginaActual]?.id;
    const posicion = (modulosPorPagina[paginaActual] || []).length;
    const { data, error } = await supabase
      .from("modulos")
      .insert({
        flyer_id: id,
        producto_id: producto.id,
        pagina_id: paginaId,
        posicion,
        tamano: "S",
        tipo_precio: "regular",
        precio: null,
        precio_cencosud: false,
        estilo_borde: "none",
        fondo_modulo: "empty",
      })
      .select("*, productos(*)")
      .single();

    if (!error && data) {
      setModulosPorPagina((prev) => ({
        ...prev,
        [paginaActual]: [...(prev[paginaActual] || []), data],
      }));
      setSelectedModulo(data);
    }
  };

  const handleDeleteModulo = async (moduloId) => {
    setModulosPorPagina((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((k) => {
        updated[k] = updated[k].filter((m) => m.id !== moduloId);
      });
      return updated;
    });
    if (selectedModulo?.id === moduloId) setSelectedModulo(null);
    await supabase.from("modulos").delete().eq("id", moduloId);
  };

  const handleMenuAction = (action, modulo) => {
    if (action === "duplicar") setDuplicarModulo(modulo);
    if (action === "eliminar") handleDeleteModulo(modulo.id);
  };

  const handleResize = (moduloId, nuevoTamano) =>
    handleUpdateModulo(moduloId, { tamano: nuevoTamano });

  const handleReorderModulos = (pagIdx, reordered) => {
    setModulosPorPagina((prev) => ({ ...prev, [pagIdx]: reordered }));
  };

  const handleDuplicar = async (nuevoTamano) => {
    if (!duplicarModulo) return;
    const paginaId = paginas[paginaActual]?.id;
    const posicion = (modulosPorPagina[paginaActual] || []).length;
    const { data, error } = await supabase
      .from("modulos")
      .insert({
        flyer_id: id,
        producto_id: duplicarModulo.producto_id,
        pagina_id: paginaId,
        posicion,
        tamano: nuevoTamano,
        tipo_precio: duplicarModulo.tipo_precio,
        precio: duplicarModulo.precio,
        precio_cencosud: duplicarModulo.precio_cencosud,
        estilo_borde: duplicarModulo.estilo_borde,
        fondo_modulo: duplicarModulo.fondo_modulo,
        texto_libre: duplicarModulo.texto_libre,
        imagen_url_override: duplicarModulo.imagen_url_override,
      })
      .select("*, productos(*)")
      .single();

    if (!error && data) {
      setModulosPorPagina((prev) => ({
        ...prev,
        [paginaActual]: [...(prev[paginaActual] || []), data],
      }));
    }
    setDuplicarModulo(null);
  };

  const handleFlyerUpdate = (field, value) =>
    setFlyer((prev) => ({ ...prev, [field]: value }));

  const todosLosModulos = Object.values(modulosPorPagina).flat();

  if (loading) return (
    <Box display="flex" height="100dvh" justifyContent="center" alignItems="center">
      <CircularProgress />
    </Box>
  );

  if (errorMsg) return (
    <Box display="flex" height="100dvh" justifyContent="center" alignItems="center" flexDirection="column" gap={2}>
      <Typography color="error" fontWeight={700}>{errorMsg}</Typography>
      <Button variant="outlined" onClick={() => navigate("/dashboard")}>Volver al dashboard</Button>
    </Box>
  );

  return (
    // Layout raíz: fila horizontal, full height
    <Box display="flex" height="100dvh" overflow="hidden">

      {/* ── COLUMNA IZQUIERDA: sidebar azul, arranca desde el tope ── */}
      <ProductsSidebar
        modulos={todosLosModulos}
        selectedModulo={selectedModulo}
        onSelectModulo={(m) => setSelectedModulo(m)}
        onAddProducto={handleAddProducto}
        onDeleteModulo={handleDeleteModulo}
      />

      {/* ── COLUMNA DERECHA: topbar + canvas + properties ── */}
      <Box display="flex" flexDirection="column" flex={1} overflow="hidden">

        {/* Topbar — solo sobre la zona derecha */}
        <Box sx={{
          height: 52, minHeight: 52,
          bgcolor: "#ffffff",
          display: "flex", alignItems: "center",
          px: 2, gap: 2, flexShrink: 0,
        }}>
          <Tooltip title="Volver al dashboard">
            <IconButton size="small" onClick={() => navigate("/dashboard")} sx={{ color: "#025BA9" }}>
              <ArrowBackIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Typography fontWeight={600} color="#025BA9" fontSize={14} noWrap>
            {flyer?.name || flyer?.nombre}
          </Typography>
          {plantilla && (
            <Chip label={plantilla.nombre} size="small"
              sx={{ bgcolor: plantilla.color_header, color: "#025BA9", fontSize: 10 }} />
          )}
          <Chip
            label={flyer?.estado || "BORRADOR"}
            size="small"
            sx={{
              bgcolor: flyer?.estado === "publicado" ? "#025BA9" : "#025BA9",
              color: "white", fontSize: 11,
            }}
          />
          {flyer?.width && (
            <Chip
              label={`${flyer.width}×${flyer.height}px`}
              size="small"
              sx={{ bgcolor: "#025BA9", color: "white", fontSize: 10, ml: "auto" }}
            />
          )}
        </Box>

        {/* Canvas + Properties en fila */}
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
          <PropertiesPanel modulo={selectedModulo} onUpdate={handleUpdateModulo} />
        </Box>
      </Box>

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