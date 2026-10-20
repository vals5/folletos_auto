import { Box, Typography } from "@mui/material";
import InlineText from "../../../components/ui/InlineText";
import { useEditor } from "../context/EditorContext";
import { IMPREC, DEFAULT_LOGOS } from "../../../config/editorTheme";

const VIGENCY_STYLE = {
  fontFamily: IMPREC.vigency.fontFamily,
  fontSize: "inherit",
  color: "#ff0000",
  textTransform: "uppercase",
  display: "inline-block",
  lineHeight: 1,
  letterSpacing: "normal",
};

const LINE_SX = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "4px",
  flexWrap: "nowrap",
  lineHeight: 1,
  whiteSpace: "nowrap",
};

function LogoSlot({ slot }) {
  return (
    <Box sx={{ width: 68, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Box
        component="img"
        src={DEFAULT_LOGOS[slot]}
        onError={(e) => {
          e.target.style.opacity = "0.15";
        }}
        sx={{ maxHeight: 48, maxWidth: 66, objectFit: "contain" }}
      />
    </Box>
  );
}

export default function HeaderImprecionante() {
  const { flyer, onFlyerUpdate } = useEditor();
  const save = (campo) => (valor) => onFlyerUpdate(campo, valor);

  const mesInicio = (flyer?.mes_inicio || "").trim();
  const mesFin = (flyer?.mes_fin || "").trim();
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
            ...IMPREC.vigency,
            color: "#ff0000",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
            width: "100%",
          }}
        >
          {!esMismoMes ? (
            /* DOS MESES DISTINTOS (ej: DEL 27 DE DICIEMBRE AL 05 DE ENERO) */
            <>
              <Box component="div" sx={LINE_SX}>
                DEL{" "}
                <InlineText value={flyer?.fecha_inicio_texto} onSave={save("fecha_inicio_texto")} placeholder="27" style={VIGENCY_STYLE} />
                DE{" "}
                <InlineText value={flyer?.mes_inicio} onSave={save("mes_inicio")} placeholder="DICIEMBRE" style={VIGENCY_STYLE} />
              </Box>
              <Box component="div" sx={LINE_SX}>
                AL{" "}
                <InlineText value={flyer?.fecha_fin_texto} onSave={save("fecha_fin_texto")} placeholder="05" style={VIGENCY_STYLE} />
                DE{" "}
                <InlineText value={flyer?.mes_fin} onSave={save("mes_fin")} placeholder="ENERO" style={VIGENCY_STYLE} />
              </Box>
            </>
          ) : (
            /* MISMO MES (ej: DEL 05 AL 12 DE DICIEMBRE) */
            <Box component="div" sx={LINE_SX}>
              DEL{" "}
              <InlineText value={flyer?.fecha_inicio_texto} onSave={save("fecha_inicio_texto")} placeholder="05" style={VIGENCY_STYLE} />
              AL{" "}
              <InlineText value={flyer?.fecha_fin_texto} onSave={save("fecha_fin_texto")} placeholder="12" style={VIGENCY_STYLE} />
              DE{" "}
              <InlineText
                value={flyer?.mes_fin || flyer?.mes_inicio}
                onSave={(v) => {
                  onFlyerUpdate("mes_fin", v);
                  onFlyerUpdate("mes_inicio", v);
                }}
                placeholder="DICIEMBRE"
                style={VIGENCY_STYLE}
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
