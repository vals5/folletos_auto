import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { flyerService } from "../services/flyerService";
import { notify, errorMessage } from "../store/notifyStore";

const KEY = ["flyers"];

export function useFlyers() {
  return useQuery({ queryKey: KEY, queryFn: flyerService.list });
}

export function useFlyerMutations() {
  const qc = useQueryClient();

  const create = useMutation({
    mutationFn: flyerService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    onError: (e) => notify.error(errorMessage(e, "No se pudo crear el folleto")),
  });

  const remove = useMutation({
    mutationFn: flyerService.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    onError: (e) => notify.error(errorMessage(e, "No se pudo eliminar el folleto")),
  });

  return { create, remove };
}
