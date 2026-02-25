import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  CircularProgress,
  IconButton,
  Typography,
  Chip,
  Tooltip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { supabase } from "../services/supabase";
import ProductsSidebar from "../components/editor/ProductsSidebar";
import CanvasPreview from "../components/editor/CanvasPreview";
import PropertiesPanel from "../components/editor/PropertiesPanel";

export default function FlyerEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [flyer, setFlyer] = useState(null);
  const [modulos, setModulos] = useState([]);
  const [selectedModulo, setSelectedModulo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlyer();
  }, [id]);

  const fetchFlyer = async () => {
    const { data: flyerData } = await supabase
      .from("flyers")
      .select("*")
      .eq("id", id)
      .single();

    const { data: modulosData } = await supabase
      .from("modulos")
      .select("*, productos(*)")
      .eq("flyer_id", id)
      .order("posicion");

    setFlyer(flyerData);
    setModulos(modulosData || []);
    setLoading(false);
  };

  const handleSelectModulo = (modulo) => setSelectedModulo(modulo);

  const handleUpdateModulo = async (moduloId, changes) => {
    setModulos((prev) =>
      prev.map((m) => (m.id === moduloId ? { ...m, ...changes } : m)),
    );
    setSelectedModulo((prev) =>
      prev?.id === moduloId ? { ...prev, ...changes } : prev,
    );
    await supabase.from("modulos").update(changes).eq("id", moduloId);
  };

  const handleAddProducto = async (producto) => {
    const posicion = modulos.length;
    const { data, error } = await supabase
      .from("modulos")
      .insert({
        flyer_id: id,
        producto_id: producto.id,
        posicion,
        tamano: "S",
        tipo_precio: "regular",
        precio: null,
        precio_cencosud: false,
      })
      .select("*, productos(*)")
      .single();

    if (!error) {
      setModulos((prev) => [...prev, data]);
      setSelectedModulo(data);
    }
  };

  const handleDeleteModulo = async (moduloId) => {
    setModulos((prev) => prev.filter((m) => m.id !== moduloId));
    if (selectedModulo?.id === moduloId) setSelectedModulo(null);
    await supabase.from("modulos").delete().eq("id", moduloId);
  };

  if (loading)
    return (
      <Box
        display="flex"
        height="100dvh"
        justifyContent="center"
        alignItems="center"
      >
        <CircularProgress />
      </Box>
    );

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100dvh"
      overflow="hidden"
    >
      {/* Topbar del editor */}
      <Box
        sx={{
          height: 52,
          minHeight: 52,
          bgcolor: "#111827",
          display: "flex",
          alignItems: "center",
          px: 2,
          gap: 2,
          borderBottom: "1px solid #1f2937",
          flexShrink: 0,
        }}
      >
        <Tooltip title="Volver al dashboard">
          <IconButton
            size="small"
            onClick={() => navigate("/dashboard")}
            sx={{ color: "white" }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Typography fontWeight={600} color="white" fontSize={14} noWrap>
          {flyer?.nombre}
        </Typography>

        <Chip
          label={flyer?.estado || "borrador"}
          size="small"
          sx={{
            bgcolor: flyer?.estado === "publicado" ? "#10b981" : "#374151",
            color: "white",
            fontSize: 11,
          }}
        />
      </Box>

      {/* Cuerpo del editor */}
      <Box display="flex" flex={1} overflow="hidden">
        <ProductsSidebar
          modulos={modulos}
          selectedModulo={selectedModulo}
          onSelectModulo={handleSelectModulo}
          onAddProducto={handleAddProducto}
          onDeleteModulo={handleDeleteModulo}
        />
        <CanvasPreview
          flyer={flyer}
          modulos={modulos}
          selectedModulo={selectedModulo}
          onSelectModulo={handleSelectModulo}
          onFlyerUpdate={(field, value) =>
            setFlyer((prev) => ({ ...prev, [field]: value }))
          }
        />
        <PropertiesPanel
          modulo={selectedModulo}
          onUpdate={handleUpdateModulo}
        />
      </Box>
    </Box>
  );
}
