import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import { router } from "./app/router";
import Providers from "./app/providers";
import Notifier from "./components/ui/Notifier";
import "./styles/fonts.css";

const theme = createTheme({
  typography: { fontFamily: ["Outfit"].join(",") },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <Providers>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
      <Notifier />
    </ThemeProvider>
  </Providers>,
);
