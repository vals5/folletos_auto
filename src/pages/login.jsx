import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { Button, TextField, Box, Typography, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState("");
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

  return (
    <Box
      display="flex"
      height="97vh"
      justifyContent="center"
      alignItems="center"
      bgcolor="#26266e"
    >
      <Paper sx={{ p: 4, width: 320 }}>
        <Typography variant="h5" mb={2}>
          Iniciar sesión
        </Typography>

        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
          />

          <TextField
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
          />

          {errorMsg && (
            <Typography color="error" fontSize={14}>
              {errorMsg}
            </Typography>
          )}
          <Button variant="contained" onClick={login} disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
