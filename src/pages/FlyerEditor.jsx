import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { supabase } from "../services/supabase";
import ProductsSidebar from "../components/editor/ProductsSidebar";
import CanvasPreview from "../components/editor/CanvasPreview";
import PropertiesPanel from "../components/editor/PropertiesPanel";

export default function FlyerEditor() {
  const { id } = useParams();
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

  const handleSelectModulo = (modulo) => {
    setSelectedModulo(modulo);
  };

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
        tamaño: "S",
        tipo_precio: "Regular",
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
        height="100vh"
        justifyContent="center"
        alignItems="center"
      >
        <CircularProgress />
      </Box>
    );

  return (
    <Box display="flex" height="100vh" overflow="hidden">
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
      />
      <PropertiesPanel modulo={selectedModulo} onUpdate={handleUpdateModulo} />
    </Box>
  );
}
