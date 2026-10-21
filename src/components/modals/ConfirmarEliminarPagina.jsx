import ConfirmDialog from "../ui/ConfirmDialog";

export default function ConfirmarEliminarPagina({ open, onClose, onConfirm }) {
  return (
    <ConfirmDialog open={open} title="Eliminar página" confirmLabel="Eliminar" destructive onClose={onClose} onConfirm={onConfirm}>
      Se van a borrar todos los módulos de esta página. Esta acción no se puede deshacer.
    </ConfirmDialog>
  );
}
