import { Box, Typography } from "@mui/material";
import InlineText from "../ui/InlineText";
import { supabase } from "../../services/supabase";

export default function HeaderImprecionante({ flyer, onFlyerUpdate, IMPREC, DEFAULT_LOGOS }) {
  const saveFlyer = async (field, value) => {
    onFlyerUpdate(field, value);
    if (flyer?.id) {
      await supabase.from("flyers").update({ [field]: value }).eq("id", flyer.id);
    }
  };

  const LogoSlot = ({ slot }) => (
    <Box sx={{ width: 68, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Box 
        component="img" 
        src={DEFAULT_LOGOS[slot]} 
        onError={(e) => { e.target.style.opacity = "0.15"; }} 
        sx={{ maxHeight: 48, maxWidth: 66, objectFit: "contain" }} 
      />
    </Box>
  );

  const vi = { 
    fontFamily: IMPREC?.vigency?.fontFamily || "'Imprec-Vigency', sans-serif", 
    fontSize: "inherit", 
    color: "#ff0000", 
    textTransform: "uppercase",
    display: "inline-block"
  };

  const mesInicio = (flyer?.mes_inicio || "").trim();
  const mesFin = (flyer?.mes_fin || "").trim();

  // Comprueba si no hay mes de inicio o si ambos meses son idénticos (ej: "DICIEMBRE" y "DICIEMBRE")
  const esMismoMes = !mesInicio || mesInicio.toUpperCase() === mesFin.toUpperCase();

  return (
    <Box 
      bgcolor="transparent" 
      borderRadius="4px 4px 0 0" 
      px={1.5} 
      py={0.8} 
      display="flex" 
      justifyContent="space-between" 
      alignItems="center" 
      position="relative" 
      sx={{ minHeight: 60, width: "100%", boxSizing: "border-box" }}
    >
      <Box sx={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", zIndex: 2 }}>
        <LogoSlot slot="izq" />
      </Box>

      <Box textAlign="center" sx={{ width: "100%", px: 8 }}>
        <Typography 
          component="div"
          sx={{ 
            ...(IMPREC?.vigency || {}), 
            color: "#ff0000", 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            justifyContent: "center",
            lineHeight: 1.1 
          }}
        >
          {!esMismoMes ? (
            /* SI SON DOS MESES DISTINTOS (ej: DEL 27 DE DICIEMBRE AL 05 DE ENERO) */
            <>
              <Box component="div" sx={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                DEL <InlineText value={flyer?.fecha_inicio_texto} onSave={(v) => saveFlyer("fecha_inicio_texto", v)} placeholder="27" style={vi} />
                DE <InlineText value={flyer?.mes_inicio} onSave={(v) => saveFlyer("mes_inicio", v)} placeholder="DICIEMBRE" style={vi} />
              </Box>
              <Box component="div" sx={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                AL <InlineText value={flyer?.fecha_fin_texto} onSave={(v) => saveFlyer("fecha_fin_texto", v)} placeholder="05" style={vi} />
                DE <InlineText value={flyer?.mes_fin} onSave={(v) => saveFlyer("mes_fin", v)} placeholder="ENERO" style={vi} />
              </Box>
            </>
          ) : (
            /* SI ES EL MISMO MES (ej: DEL 05 AL 12 DE DICIEMBRE) */
            <Box component="div" sx={{ display: "inline-flex", alignItems: "center", gap: "4px", flexWrap: "wrap", justifyContent: "center" }}>
              DEL <InlineText value={flyer?.fecha_inicio_texto} onSave={(v) => saveFlyer("fecha_inicio_texto", v)} placeholder="05" style={vi} />
              AL <InlineText value={flyer?.fecha_fin_texto} onSave={(v) => saveFlyer("fecha_fin_texto", v)} placeholder="12" style={vi} />
              DE <InlineText 
                value={flyer?.mes_fin || flyer?.mes_inicio} 
                onSave={(v) => { 
                  saveFlyer("mes_fin", v); 
                  saveFlyer("mes_inicio", v); 
                }} 
                placeholder="DICIEMBRE" 
                style={vi} 
              />
            </Box>
          )}
        </Typography>
      </Box>

      <Box sx={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", zIndex: 2 }}>
        <LogoSlot slot="der" />
      </Box>
    </Box>
  );
}