import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import {
  Button,
  TextField,
  Box,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/dashboard");
    });
  }, []);

  const login = async () => {
    setLoading(true);
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMsg("Email o contraseña incorrectos");
      return;
    }

    navigate("/dashboard");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") login();
  };

  return (
    <Box
      display="flex"
      height="100vh"
      justifyContent="center"
      alignItems="center"
      bgcolor="#1a1a2e"
    >
      <Paper
        elevation={8}
        sx={{
          p: 4,
          width: 360,
          borderRadius: 3,
          bgcolor: "#ffffff",
        }}
      >
        <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight={700} color="#1a1a2e">
            Folletos Admin
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Iniciá sesión para continuar
          </Typography>
        </Box>

        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            fullWidth
            size="small"
          />
          <TextField
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            fullWidth
            size="small"
          />

          {errorMsg && (
            <Typography color="error" fontSize={13}>
              {errorMsg}
            </Typography>
          )}

          <Button
            variant="contained"
            onClick={login}
            disabled={loading}
            fullWidth
            sx={{
              bgcolor: "#1a1a2e",
              "&:hover": { bgcolor: "#2d2d5e" },
              mt: 1,
            }}
          >
            {loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Ingresar"
            )}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
