import { useState, useEffect } from "react";
import { supabase } from "../../services/supabase"; 

export function useFlyerEditor(flyerId) {
  const [flyer, setFlyer] = useState(null);
  const [plantilla, setPlantilla] = useState(null);
  const [paginas, setPaginas] = useState([]);
  const [modulosPorPagina, setModulosPorPagina] = useState({});
  const [paginaActual, setPaginaActual] = useState(0);
  const [selectedModulo, setSelectedModulo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    async function inicializarEditor() {
      try {
      } catch (error) {
        console.error("Error al inicializar:", error);
        setErrorMsg(error.message);
      } finally {
        setLoading(false); 
      }
    }

    inicializarEditor();
  }, [flyerId]);

  const onAddProducto = async (producto) => {
    try {
      const modulosActuales = modulosPorPagina[paginaActual] || [];
      const nuevaPosicion = modulosActuales.length;
      const paginaId = paginas[paginaActual]?.id;

      if (!paginaId) throw new Error("No hay una página seleccionada");

      const { data, error } = await supabase
        .from("modulos")
        .insert([{
          pagina_id: paginaId,
          producto_id: producto.id,
          posicion: nuevaPosicion,
          tamano: "M", 
        }])
        .select("*, productos(*)") 
        .single();

      if (error) throw error;

      setModulosPorPagina(prev => ({
        ...prev,
        [paginaActual]: [...modulosActuales, data]
      }));

    } catch (error) {
      console.error("Error al agregar producto:", error.message);
      setErrorMsg(error.message);
    }
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
    setPaginaActual,
    setSelectedModulo,
    onAddProducto 
  };
}