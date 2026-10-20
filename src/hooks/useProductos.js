import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productoService } from "../services/productoService";
import { notify, errorMessage } from "../store/notifyStore";

const KEY = ["productos"];

export function useProductos() {
  return useQuery({ queryKey: KEY, queryFn: productoService.list });
}

export function useProductoMutations() {
  const qc = useQueryClient();
  const onSuccess = () => qc.invalidateQueries({ queryKey: KEY });

  const save = useMutation({
    mutationFn: ({ id, form }) => (id ? productoService.update(id, form) : productoService.create(form)),
    onSuccess,
    onError: (e) => notify.error(errorMessage(e, "No se pudo guardar el producto")),
  });

  const remove = useMutation({
    mutationFn: (id) => productoService.remove(id),
    onSuccess,
    onError: (e) => notify.error(errorMessage(e, "No se pudo borrar el producto")),
  });

  return { save, remove };
}
