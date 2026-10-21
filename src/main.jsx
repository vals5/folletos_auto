import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { router } from "./app/router";
import Providers from "./app/providers";
import Notifier from "./components/ui/Notifier";
import "@fontsource-variable/outfit"; // fuente de la interfaz (incluida en la app, sin depender de Google)
import "./styles/fonts.css";
import { theme } from "./theme/theme";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Providers>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
      <Notifier />
    </ThemeProvider>
  </Providers>,
);
