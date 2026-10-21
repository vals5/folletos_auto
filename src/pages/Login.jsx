import { useEffect, useState } from "react";
import { authService } from "../services/authService";
import { Button, TextField, Box, Typography, CircularProgress, InputAdornment, IconButton, Alert } from "@mui/material";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import LockOutlined from "@mui/icons-material/LockOutlined";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlined from "@mui/icons-material/VisibilityOffOutlined";
import { useNavigate } from "react-router-dom";

import Logo from "../assets/img/LOGO.jpg";

const LABEL_SX = { color: "#fff", fontSize: 13, fontWeight: 600 };

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const session = await authService.getSession();

      if (session) {
        const loginTimestamp = localStorage.getItem("login_timestamp");
        const tenHours = 10 * 60 * 60 * 1000;
        const now = Date.now();

        if (loginTimestamp && now - parseInt(loginTimestamp) > tenHours) {
          await authService.signOut();
          localStorage.removeItem("login_timestamp");
        } else {
          navigate("/dashboard");
        }
      }
    };

    checkSession();
  }, [navigate]);

  const login = async (e) => {
    e?.preventDefault();
    if (loading) return;
    setLoading(true);
    setErrorMsg("");
    try {
      await authService.signIn(email, password);
    } catch {
      setErrorMsg("Email o contraseña incorrectos");
      setLoading(false);
      return;
    }
    setLoading(false);

    localStorage.setItem("login_timestamp", Date.now().toString());

    navigate("/dashboard");
  };

  return (
    <Box display="flex" minHeight="100dvh" justifyContent="center" alignItems="center" bgcolor="neutral.900" p={2}>
      <Box
        sx={{
          display: "flex",
          width: { xs: "100%", md: 920 },
          maxWidth: "100%",
          borderRadius: "16px",
          overflow: "hidden",
          bgcolor: "background.paper",
          flexDirection: { xs: "column", md: "row" },
          boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
        }}
      >
        {/* Marca */}
        <Box flex={1} sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 5, minHeight: { xs: 180, md: 560 } }}>
          <Box component="img" src={Logo} alt="Brokers Ads" sx={{ width: "70%", maxWidth: 260, height: "auto" }} />
        </Box>

        {/* Formulario */}
        <Box
          component="form"
          onSubmit={login}
          noValidate
          flex={1}
          sx={{ bgcolor: "primary.main", p: { xs: 4, md: 7 }, display: "flex", flexDirection: "column", justifyContent: "center" }}
        >
          <Typography variant="h4" fontWeight={700} color="#fff" textAlign="center" mb={0.5}>
            Brokers Ads
          </Typography>
          <Typography fontSize={14} color="rgba(255,255,255,0.75)" textAlign="center" mb={4}>
            Ingresá con tu cuenta para continuar
          </Typography>

          <Box display="flex" flexDirection="column" gap={0.75}>
            <Box component="label" htmlFor="login-email" sx={LABEL_SX}>
              Correo electrónico
            </Box>
            <TextField
              id="login-email"
              type="email"
              size="medium"
              placeholder="nombre@empresa.com"
              autoComplete="email"
              autoFocus
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlined sx={{ color: "neutral.400" }} />
                  </InputAdornment>
                ),
              }}
            />

            <Box component="label" htmlFor="login-password" sx={{ ...LABEL_SX, mt: 1 }}>
              Contraseña
            </Box>
            <TextField
              id="login-password"
              placeholder="Tu contraseña"
              type={showPassword ? "text" : "password"}
              size="medium"
              autoComplete="current-password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined sx={{ color: "neutral.400" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffOutlined fontSize="small" /> : <VisibilityOutlined fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {errorMsg && (
              <Alert severity="error" variant="filled" role="alert">
                {errorMsg}
              </Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading || !email || !password}
              fullWidth
              sx={{
                mt: 2.5,
                bgcolor: "#fff",
                color: "primary.main",
                fontWeight: 700,
                "&:hover": { bgcolor: "primary.light", color: "#fff" },
                "&.Mui-disabled": { bgcolor: "rgba(255,255,255,0.35)", color: "rgba(255,255,255,0.8)" },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Iniciar sesión"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
