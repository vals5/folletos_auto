import { Snackbar, Alert } from "@mui/material";
import { useNotifyStore } from "../../store/notifyStore";

export default function Notifier() {
  const { open, message, severity, close } = useNotifyStore();
  return (
    <Snackbar
      open={open}
      autoHideDuration={5000}
      onClose={(_, reason) => reason !== "clickaway" && close()}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert onClose={close} severity={severity} variant="filled" sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
}
