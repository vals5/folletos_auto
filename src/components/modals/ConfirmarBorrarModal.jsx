import ConfirmDialog from "../ui/ConfirmDialog";

export default function ConfirmarBorrarModal({ open, producto, onClose, onConfirm }) {
  return (
    <ConfirmDialog open={open} title="Borrar producto" confirmLabel="Borrar" destructive onClose={onClose} onConfirm={onConfirm}>
      ¿Seguro que querés borrar <strong>{producto?.nombre}</strong>? Esta acción no se puede deshacer.
    </ConfirmDialog>
  );
}
