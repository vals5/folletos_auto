import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { Button, TextField, Box, Typography, Paper, CircularProgress, Checkbox, FormControlLabel, Link, InputAdornment, } from "@mui/material";
import { EmailOutlined, LockOutlined } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import Logo from "../assets/img/LOGO.jpg";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (data.session) {
        const loginTimestamp = localStorage.getItem("login_timestamp");
        const tenHours = 10 * 60 * 60 * 1000;
        const now = Date.now();

        if (loginTimestamp && now - parseInt(loginTimestamp) > tenHours) {
          await supabase.auth.signOut();
          localStorage.removeItem("login_timestamp");
        } else {
          navigate("/dashboard");
        }
      }
    };

    checkSession();
  }, [navigate]);

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

    localStorage.setItem("login_timestamp", Date.now().toString());

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
      bgcolor="#000"
    >
      {/* MAIN CONTAINER */}
      <Box
        display="flex"
        sx={{
          width: { xs: "90%", md: "1000px" },
          height: { xs: "auto", md: "600px" },
          borderRadius: 10,
          overflow: "hidden",
          bgcolor: "#fff",
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        {/*LEFT SECTION */}
        <Box
          flex={1}
          sx={{
            background: "#ffff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            p: 4,
            position: "relative",
          }}
        >
          {/* LOGO */}
          <Box
            component="img"
            src={Logo}
            alt="Logo"
            sx={{
              width: "70%",
              maxWidth: "280px",
              height: "auto",
              mb: 2,
            }}
          />
        </Box>
        {/* RIGHT SECTION */}
        <Box
          flex={1}
          sx={{
            background: "#025BA9",
            p: { xs: 4, md: 8 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Typography
            variant="h4"
            fontWeight={700}
            color="#ffff"
            mb={4}
            textAlign="center"
          >
            Brokers Ads
          </Typography>

          <Box display="flex" flexDirection="column" gap={2.5}>
            <TextField
              placeholder="E-MAIL"
              variant="outlined"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlined sx={{ color: "#434343" }} />
                  </InputAdornment>
                ),
                sx: { borderRadius: 10, bgcolor: "#f4f7ff" },
              }}
            />

            <TextField
              placeholder="CONTRASEÑA"
              type="password"
              variant="outlined"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined sx={{ color: "#434343" }} />
                  </InputAdornment>
                ),
                sx: { borderRadius: 10, bgcolor: "#f4f7ff" },
              }}
            />

            {errorMsg && (
              <Typography color="error" fontSize={13} textAlign="center">
                {errorMsg}
              </Typography>
            )}

            <Button
              variant="contained"
              onClick={login}
              disabled={loading}
              fullWidth
              sx={{
                bgcolor: "#368FC7",
                "&:hover": { bgcolor: "#434343" },
                borderRadius: 10,
                py: 1.5,
                fontWeight: "bold",
                mt: 2,
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "LOGIN"
              )}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
