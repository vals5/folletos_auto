import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/router";
import Providers from "./app/providers";
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
const theme = createTheme({
  typography: {
    fontFamily: [
      'Outfit',
    ].join(','),
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <Providers>
    <ThemeProvider theme={theme}>
      <CssBaseline /> 
      <RouterProvider router={router} />
    </ThemeProvider>
  </Providers>,
);