import { useState, useEffect, useCallback } from "react";
import { flyerService } from "../services/flyerService";

export function useCatalog() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProductos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await flyerService.getProductos();
      setProductos(data);
    } catch (err) {
      console.error("Error al cargar el catálogo:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  return { productos, loading, error, refetch: fetchProductos };
}