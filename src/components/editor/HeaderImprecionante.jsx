import { Box, Typography } from "@mui/material";
import InlineText from "../ui/InlineText";
import { supabase } from "../../services/supabase";

export default function HeaderImprecionante({ flyer, onFlyerUpdate, IMPREC, DEFAULT_LOGOS }) {
  const saveFlyer = async (field, value) => {
    onFlyerUpdate(field, value);
    await supabase.from("flyers").update({ [field]: value }).eq("id", flyer.id);
  };

  const LogoSlot = ({ slot }) => (
    <Box sx={{ width: 68, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Box component="img" src={DEFAULT_LOGOS[slot]} onError={(e) => { e.target.style.opacity = "0.15"; }} sx={{ maxHeight: 48, maxWidth: 66, objectFit: "contain" }} />
    </Box>
  );

  const vi = { fontFamily: "'Imprec-Vigency',sans-serif", fontSize: "inherit", color: "#ff0000", textTransform: "uppercase" };

  return (
    <Box bgcolor={IMPREC.colors.yellow} borderRadius="4px 4px 0 0" px={1.5} py={0.8} display="flex" justifyContent="center" alignItems="center" position="relative" sx={{ minHeight: 60 }}>
      <Box sx={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", zIndex: 2 }}>
        <LogoSlot slot="izq" />
      </Box>

      <Box textAlign="center" sx={{ px: 9 }}>
        <Typography sx={{ ...IMPREC.vigency }}>
          {"DEL "}
          <InlineText value={flyer?.fecha_inicio_texto} onSave={(v) => saveFlyer("fecha_inicio_texto", v)} placeholder="05" style={vi} />
          {flyer?.mes_inicio !== flyer?.mes_fin && (
            <>
              {" DE "}
              <InlineText value={flyer?.mes_inicio} onSave={(v) => saveFlyer("mes_inicio", v)} placeholder="DICIEMBRE" style={vi} />
            </>
          )}
        </Typography>

        <Typography sx={{ ...IMPREC.vigency }}>
          {"AL "}
          <InlineText value={flyer?.fecha_fin_texto} onSave={(v) => saveFlyer("fecha_fin_texto", v)} placeholder="12" style={vi} />
          {" DE "}
          <InlineText value={flyer?.mes_fin} onSave={(v) => saveFlyer("mes_fin", v)} placeholder="ENERO" style={vi} />
        </Typography>
      </Box>

      <Box sx={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", zIndex: 2 }}>
        <LogoSlot slot="der" />
      </Box>
    </Box>
  );
}