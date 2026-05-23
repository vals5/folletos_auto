import { useState, useRef, useCallback } from "react";
import { Box, Typography, Chip, Tooltip, CircularProgress, Button, IconButton, Menu, MenuItem, } from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon             from "@mui/icons-material/Delete";
import AddIcon                from "@mui/icons-material/Add";
import MoreHorizIcon          from "@mui/icons-material/MoreHoriz";
import CloseIcon              from "@mui/icons-material/Close";
import DownloadIcon           from "@mui/icons-material/Download";
import ImageIcon              from "@mui/icons-material/Image";
import PictureAsPdfIcon       from "@mui/icons-material/PictureAsPdf";
import DragIndicatorIcon      from "@mui/icons-material/DragIndicator";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, useSortable, arrayMove, } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { supabase } from "../../services/supabase";

import ImprecLogo      from "../../assets/img/Imprecionante.svg";
import VeaLogo         from "../../assets/img/Vea.svg";
import TarjetaVea      from "../../assets/img/Ahorro.svg";
import TarjetaCencosud from "../../assets/img/Ahorro.svg";

const DEFAULT_LOGOS = { izq: ImprecLogo, der: VeaLogo };

const GlobalFonts = () => (
  <style>{`
    @font-face { font-family:'Imprec-Vigency';  src:url('/src/assets/fonts/imprecionante/GothamCondensed-Bold.otf') format('truetype'); }
    @font-face { font-family:'Imprec-Legal';    src:url('/src/assets/fonts/imprecionante/Zuume-Light.otf')          format('truetype'); }
    @font-face { font-family:'Imprec-Price';    src:url('/src/assets/fonts/imprecionante/GothamCondensed-Bold.otf') format('truetype'); }
    @font-face { font-family:'Imprec-SubtPrice';src:url('/src/assets/fonts/imprecionante/GothamCondensed-Bold.otf') format('truetype'); }
    @font-face { font-family:'Imprec-RegPrice'; src:url('/src/assets/fonts/imprecionante/Zuume-Bold.otf')           format('truetype'); }
    @font-face { font-family:'Imprec-kgPrice';  src:url('/src/assets/fonts/imprecionante/Zuume-Light.otf')          format('truetype'); }
    @font-face { font-family:'Imprec-Name';     src:url('/src/assets/fonts/imprecionante/Zuume-SemiBold.otf')       format('truetype'); }
    @font-face { font-family:'Imprec-Desc';     src:url('/src/assets/fonts/imprecionante/Zuume-Light.otf')          format('truetype'); }
  `}</style>
);

const IMPREC = {
  colors: { red:"#ff0000", yellow:"#fff800", black:"#000000", white:"#ffffff" },
  vigency:     { fontFamily:"'Imprec-Vigency',sans-serif",   fontSize:"13pt", textTransform:"uppercase", color:"#ff0000", lineHeight:1.15 },
  legal:       { fontFamily:"'Imprec-Legal',sans-serif",     fontSize:"9pt",  textTransform:"uppercase", color:"#000000" },
  price:       { fontFamily:"'Imprec-Price',sans-serif",     textTransform:"uppercase", lineHeight:1 },
  subtPrice:   { fontFamily:"'Imprec-SubtPrice',sans-serif", textTransform:"uppercase", lineHeight:1 },
  productName: { fontFamily:"'Imprec-Name',sans-serif",      fontSize:"9pt",  lineHeight:1.05, textTransform:"uppercase", color:"#000000" },
  productDesc: { fontFamily:"'Imprec-Desc',sans-serif",      fontSize:"7pt",  lineHeight:1.05, textTransform:"uppercase", color:"#555555" },
};

const TAMANOS     = ["XS","S","M","L","XL"];
const TAMANO_SIZE = {
  XS:{ width:90,  height:100 }, S:{ width:130, height:120 },
  M: { width:185, height:140 }, L:{ width:250, height:160 }, XL:{ width:350, height:185 },
};

// FIX #4: "llevando3" key pero label "LLEVANDO 2"
const TIPO_PRECIO_LABEL = { regular:null, llevando3:"LLEVANDO 2", vea_ahorro:"VEA AHORRO", regular_cencosud:"CENCOSUD" };

const FONDO_COLORS  = { white:"#ffffff", red:"#ff0000", yellow:"#fff800", empty:"transparent" };

// FIX #5: bordes punteado y sólido en rojo
const BORDER_STYLES = { none:"none", solid:"2px solid #ff0000", dashed:"2px dashed #ff0000", thick:"3px solid #ff0000" };

const STARBURST_CLIP = `polygon(
  50% 0%,56% 8%,65% 4%,67% 13%,77% 11%,75% 21%,
  85% 22%,80% 31%,90% 35%,82% 42%,91% 49%,81% 53%,
  88% 62%,77% 63%,80% 74%,69% 71%,68% 82%,58% 76%,
  55% 87%,45% 81%,42% 92%,34% 84%,28% 93%,24% 82%,
  13% 88%,13% 76%,2% 78%,5% 67%,-5% 61%,6% 54%,
  -2% 46%,10% 41%,4% 31%,16% 29%,13% 18%,24% 20%,
  25% 9%,35% 14%,38% 3%,47% 10%)`;

const TARJETA_LOGO = { vea_ahorro: TarjetaVea, regular_cencosud: TarjetaCencosud };

function InlineText({ value, onSave, style={}, placeholder="Editar" }) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(value || "");
  const inputRef = useRef(null);

  const handleSave = () => { setEditing(false); if (draft !== value) onSave(draft); };

  if (editing) return (
    <input ref={inputRef} value={draft}
      autoFocus
      onChange={(e) => setDraft(e.target.value)}
      onBlur={handleSave}
      onKeyDown={(e) => { if(e.key==="Enter") handleSave(); if(e.key==="Escape") setEditing(false); }}
      style={{ background:"rgba(0,0,0,0.08)", border:"1px dashed rgba(0,0,0,0.35)",
        borderRadius:4, fontWeight:"inherit", fontSize:"inherit", fontFamily:"inherit",
        outline:"none", padding:"2px 6px", color: style.color||"#000000", ...style }} />
  );
  return (
    <Box component="span" onClick={() => setEditing(true)}
      sx={{ cursor:"text", borderRadius:1, px:0.5, display:"inline-block",
        "&:hover":{ outline:"1px dashed rgba(0,0,0,0.3)", bgcolor:"rgba(0,0,0,0.06)" }, ...style }}>
      {value || <span style={{ opacity:0.35, fontStyle:"italic", fontSize:11 }}>{placeholder}</span>}
    </Box>
  );
}

function HeaderImprecionante({ flyer, onFlyerUpdate }) {
  const saveFlyer = async (field, value) => {
    onFlyerUpdate(field, value);
    await supabase.from("flyers").update({ [field]: value }).eq("id", flyer.id);
  };

  const LogoSlot = ({ slot }) => (
    <Box sx={{ width:68, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <Box component="img" src={DEFAULT_LOGOS[slot]}
        alt={slot==="izq"?"Logo Imprecionante":"Logo Vea"}
        onError={(e) => { e.target.style.opacity="0.15"; }}
        sx={{ maxHeight:48, maxWidth:66, objectFit:"contain" }} />
    </Box>
  );

  const vi = { fontFamily:"'Imprec-Vigency',sans-serif", fontSize:"inherit", color:"#ff0000", textTransform:"uppercase" };

  return (
    <Box bgcolor={IMPREC.colors.yellow} borderRadius="4px 4px 0 0"
      px={1.5} py={0.8}
      display="flex" justifyContent="space-between" alignItems="center" gap={1}>
      <LogoSlot slot="izq" />
      <Box textAlign="center" flex={1} sx={{ whiteSpace:"nowrap" }}>
        <Typography sx={{ ...IMPREC.vigency }}>
          {"DEL "}
          <InlineText value={flyer?.fecha_inicio_texto} onSave={(v)=>saveFlyer("fecha_inicio_texto",v)} placeholder="05" style={vi}/>
          {" DE "}
          <InlineText value={flyer?.mes_inicio}         onSave={(v)=>saveFlyer("mes_inicio",v)}         placeholder="DICIEMBRE" style={vi}/>
        </Typography>
        <Typography sx={{ ...IMPREC.vigency }}>
          {"AL "}
          <InlineText value={flyer?.fecha_fin_texto}    onSave={(v)=>saveFlyer("fecha_fin_texto",v)}    placeholder="12" style={vi}/>
          {" DE "}
          <InlineText value={flyer?.mes_fin}            onSave={(v)=>saveFlyer("mes_fin",v)}            placeholder="ENERO" style={vi}/>
        </Typography>
      </Box>
      <LogoSlot slot="der" />
    </Box>
  );
}

// FIX #6: si isBgRed → star blanco con números rojos
// $ eliminado — el usuario lo escribe en el precio si lo necesita
function PrecioStarburst({ precio, subtitulo, tipoPrecio, size, isBgRed = false }) {
  const starSize      = size.width > 200 ? 82 : size.width > 140 ? 66 : 54;
  const priceFontSize = size.width > 200 ? "16pt" : size.width > 140 ? "13pt" : "10pt";
  const subtFontSize  = size.width > 200 ? "6pt" : "5pt";
  const tarjetaLogo   = TARJETA_LOGO[tipoPrecio];

  // FIX #6: invertir colores cuando fondo es rojo
  const starBg     = isBgRed ? IMPREC.colors.white : IMPREC.colors.red;
  const priceColor = isBgRed ? IMPREC.colors.red   : IMPREC.colors.white;
  const subtColor  = isBgRed ? IMPREC.colors.red   : IMPREC.colors.white;

  // Mostrar el número tal cual lo escribió el usuario, sin agregar $ automático
  const precioDisplay = precio.toLocaleString("es-AR");

  return (
    <Box sx={{
      position:"absolute", bottom:4, right:4,
      zIndex:50,
      width:starSize, height:starSize,
      bgcolor:starBg,
      clipPath:STARBURST_CLIP,
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      textAlign:"center", pointerEvents:"none",
      gap:0,
    }}>
      {tarjetaLogo ? (
        <>
          <Box component="img" src={tarjetaLogo}
            sx={{ width: starSize * 0.45, height: starSize * 0.22, objectFit:"contain" }}
            onError={(e) => { e.target.style.display="none"; }} />
          <Typography sx={{ ...IMPREC.price, fontSize: priceFontSize, fontWeight:900,
            px:0.3, wordBreak:"break-all", lineHeight:1, color: priceColor }}>
            {precioDisplay}
          </Typography>
          {subtitulo && (
            <Typography sx={{ ...IMPREC.subtPrice, fontSize: subtFontSize, letterSpacing:0.3, color: subtColor }}>
              {subtitulo}
            </Typography>
          )}
        </>
      ) : (
        <>
          <Typography sx={{ ...IMPREC.price, fontSize: priceFontSize, fontWeight:900,
            px:0.5, wordBreak:"break-all", lineHeight:1, color: priceColor }}>
            {precioDisplay}
          </Typography>
          {subtitulo && (
            <Typography sx={{ ...IMPREC.subtPrice, fontSize: subtFontSize, letterSpacing:0.3, color: subtColor }}>
              {subtitulo}
            </Typography>
          )}
        </>
      )}
    </Box>
  );
}

function MiniProducto({ producto, imgOverride, textColor, showPrice, precio, subtitulo, tipoPrecio, size, isBgRed }) {
  const imgSrc = imgOverride || producto?.imagen_url;
  return (
    <Box sx={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center",
      justifyContent:"flex-start", position:"relative", overflow:"hidden", minWidth:0, px:0.3, pt:0.5 }}>
      {imgSrc ? (
        <Box component="img" src={imgSrc} alt={producto?.nombre}
          sx={{ maxWidth:"90%", maxHeight:"42%", objectFit:"contain", mb:0.3 }}
          onError={(e) => { e.target.style.display="none"; }} />
      ) : (
        <Box sx={{ width:"70%", height:"40%", bgcolor:"#f3f4f6", borderRadius:1, mb:0.3,
          display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Typography fontSize={7} color="#9ca3af">IMG</Typography>
        </Box>
      )}
      <Typography sx={{ ...IMPREC.productName, color:textColor, width:"100%", textAlign:"center",
        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
        {producto?.nombre||"Sin nombre"}
      </Typography>
      {producto?.descripcion && (
        <Typography sx={{ ...IMPREC.productDesc,
          color:textColor==="#ffffff"?"rgba(255,255,255,0.75)":"#555",
          width:"100%", textAlign:"center", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {producto.descripcion}
        </Typography>
      )}
      {showPrice && precio && (
        <PrecioStarburst precio={precio} subtitulo={subtitulo} tipoPrecio={tipoPrecio} size={size} isBgRed={isBgRed} />
      )}
    </Box>
  );
}

function SortableModuloCard({ modulo, isSelected, onClick, onMenuAction, onResize }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: modulo.id });
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [hovered,    setHovered]    = useState(false);
  const dragStartX   = useRef(null);
  const dragStartIdx = useRef(null);

  const size        = TAMANO_SIZE[modulo.tamano] || TAMANO_SIZE["S"];
  const priceLabel  = TIPO_PRECIO_LABEL[modulo.tipo_precio];
  const bgColor     = FONDO_COLORS[modulo.fondo_modulo] ?? FONDO_COLORS.empty;
  const borderStyle = isSelected ? "2px solid #f59e0b" : (BORDER_STYLES[modulo.estilo_borde]||"none");
  const tamanoIdx   = TAMANOS.indexOf(modulo.tamano);
  const isBgRed     = modulo.fondo_modulo === "red";
  const textColor   = isBgRed ? IMPREC.colors.white : IMPREC.colors.black;

  const productosExtra     = modulo.productos_extra || [];
  const todosLosProductos  = [
    { producto:modulo.productos, imgOverride:modulo.imagen_url_override, precio:modulo.precio },
    ...productosExtra.map((pe)=>({ producto:pe.producto, imgOverride:pe.imagen_url_override, precio:pe.precio })),
  ];
  const esMulti  = todosLosProductos.length > 1;
  const gridCols = todosLosProductos.length <= 2 ? todosLosProductos.length : 2;
  const subtituloPrecio = priceLabel || "X UNIDAD";

  const openMenu  = (e) => { e.stopPropagation(); setMenuAnchor(e.currentTarget); };
  const closeMenu = () => setMenuAnchor(null);

  // Resize arrastrando esquina
  const handleResizeMouseDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    dragStartX.current   = e.clientX;
    dragStartIdx.current = tamanoIdx;
    const onMove = (ev) => {
      const steps  = Math.round((ev.clientX - dragStartX.current) / 40);
      const newIdx = Math.min(Math.max(dragStartIdx.current + steps, 0), TAMANOS.length - 1);
      if (TAMANOS[newIdx] !== modulo.tamano) onResize(modulo.id, TAMANOS[newIdx]);
    };
    const onUp = () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <Box position="relative" onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}>

      {/* Menú 3 puntitos */}
      {(hovered||!!menuAnchor) && (
        <Box onClick={openMenu}
          sx={{ position:"absolute", top:2, right:2, zIndex:15, bgcolor:"rgba(0,0,0,0.55)",
            borderRadius:1, width:20, height:20, display:"flex", alignItems:"center",
            justifyContent:"center", cursor:"pointer", "&:hover":{ bgcolor:"rgba(0,0,0,0.8)" } }}>
          <MoreHorizIcon sx={{ color:"white", fontSize:14 }} />
        </Box>
      )}

      {/* FIX #1: handle de drag separado — no interfiere con el click */}
      {(hovered || isSelected) && (
        <Box
          {...listeners}
          {...attributes}
          sx={{
            position:"absolute", top:2, left:2, zIndex:15,
            bgcolor:"rgba(0,0,0,0.45)", borderRadius:1,
            width:20, height:20, display:"flex", alignItems:"center", justifyContent:"center",
            cursor:"grab", "&:active":{ cursor:"grabbing" },
            "&:hover":{ bgcolor:"rgba(0,0,0,0.7)" },
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <DragIndicatorIcon sx={{ color:"white", fontSize:14 }} />
        </Box>
      )}

      <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={closeMenu}
        PaperProps={{ sx:{ minWidth:160, borderRadius:2 } }}>
        <MenuItem onClick={()=>{ closeMenu(); onMenuAction("duplicar",modulo); }} sx={{ fontSize:13 }}>Duplicar módulo</MenuItem>
        <MenuItem onClick={()=>{ closeMenu(); onMenuAction("eliminar",modulo); }} sx={{ fontSize:13, color:"#ef4444" }}>Eliminar módulo</MenuItem>
      </Menu>

      {/* Tarjeta — sin listeners de drag, el handle los tiene */}
      <Box ref={setNodeRef} onClick={onClick}
        sx={{
          width:size.width, height:size.height,
          bgcolor:bgColor, border:borderStyle, borderRadius:"3px",
          display:"flex", flexDirection:"column",
          alignItems:"stretch", justifyContent:"flex-start",
          cursor:"pointer",
          position:"relative", opacity:isDragging?0.5:1,
          boxShadow:isSelected?"0 0 0 3px #f59e0b55":bgColor==="transparent"?"none":"0 1px 4px rgba(0,0,0,0.18)",
          transform:CSS.Transform.toString(transform), transition,
          overflow:"hidden",
        }}>

        {/* Banner tipo precio */}
        {priceLabel && !esMulti && (
          <Box sx={{ width:"100%", bgcolor:IMPREC.colors.red, display:"flex",
            alignItems:"center", justifyContent:"center", py:0.2 }}>
            <Typography sx={{ ...IMPREC.subtPrice, fontSize:"6pt", color:IMPREC.colors.white, letterSpacing:0.8 }}>
              {priceLabel}
            </Typography>
          </Box>
        )}

        {/* ── SINGLE ── */}
        {!esMulti && (() => {
          const imgSrc = modulo.imagen_url_override || modulo.productos?.imagen_url;
          return (
            <>
              {imgSrc ? (
                <Box component="img" src={imgSrc} alt={modulo.productos?.nombre}
                  sx={{ maxWidth:"68%", maxHeight:"42%", objectFit:"contain",
                    alignSelf:"center", mt:priceLabel?0.3:0.8, mb:0.3 }}
                  onError={(e)=>{ e.target.style.display="none"; }} />
              ) : (
                <Box sx={{ width:"55%", height:"35%", bgcolor:"#f3f4f6", borderRadius:1,
                  alignSelf:"center", mt:priceLabel?0.3:0.8, mb:0.3,
                  display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Typography fontSize={7} color="#9ca3af">IMG</Typography>
                </Box>
              )}
              <Typography sx={{ ...IMPREC.productName, color:textColor,
                width:"96%", px:0.4, textAlign:"center", alignSelf:"center",
                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {modulo.productos?.nombre||"Sin nombre"}
              </Typography>
              {modulo.productos?.descripcion && (
                <Typography sx={{ ...IMPREC.productDesc,
                  color:isBgRed?"rgba(255,255,255,0.75)":"#555",
                  width:"96%", px:0.4, textAlign:"center", alignSelf:"center",
                  overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {modulo.productos.descripcion}
                </Typography>
              )}
              {modulo.precio && (
                // FIX #6: pasar isBgRed al starburst
                <PrecioStarburst precio={modulo.precio} subtitulo={subtituloPrecio}
                  tipoPrecio={modulo.tipo_precio} size={size} isBgRed={isBgRed} />
              )}
            </>
          );
        })()}

        {/* ── MULTI ── */}
        {esMulti && (
          <Box sx={{ display:"grid", gridTemplateColumns:`repeat(${gridCols},1fr)`, flex:1, p:0.3 }}>
            {todosLosProductos.map((item,i) => (
              <MiniProducto key={i} producto={item.producto} imgOverride={item.imgOverride}
                textColor={textColor}
                showPrice={i===todosLosProductos.length-1}
                precio={modulo.precio} subtitulo={subtituloPrecio}
                tipoPrecio={modulo.tipo_precio} size={size} isBgRed={isBgRed} />
            ))}
          </Box>
        )}

        {/* Handle resize — puntito esquina inferior derecha */}
        {isSelected && (
          <Box onMouseDown={handleResizeMouseDown}
            sx={{
              position:"absolute", bottom:3, right:3, zIndex:20,
              width:10, height:10, borderRadius:"50%",
              bgcolor:"#f59e0b", border:"2px solid white",
              cursor:"se-resize", boxShadow:"0 1px 3px rgba(0,0,0,0.4)",
              "&:hover":{ bgcolor:"#ef4444", transform:"scale(1.3)" },
              transition:"transform 0.1s",
            }} />
        )}
      </Box>
    </Box>
  );
}

function FooterUploader({ flyerId, footerUrl, onUpdate }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);
  const handleUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    const ext  = file.name.split(".").pop();
    const path = `footers/${flyerId}.${ext}`;
    const { error } = await supabase.storage.from("flyer-assets").upload(path, file, { upsert:true });
    if (!error) {
      const { data } = supabase.storage.from("flyer-assets").getPublicUrl(path);
      await supabase.from("flyers").update({ footer_url:data.publicUrl }).eq("id", flyerId);
      onUpdate(data.publicUrl);
    }
    setUploading(false);
  };
  const handleRemove = async () => {
    await supabase.from("flyers").update({ footer_url:null }).eq("id", flyerId);
    onUpdate(null);
  };
  if (footerUrl) return (
    <Box position="relative" sx={{ "&:hover .rem":{ opacity:1 } }}>
      <Box component="img" src={footerUrl} alt="Pie" sx={{ width:"100%", borderRadius:1 }} />
      <Box className="rem" onClick={handleRemove}
        sx={{ position:"absolute", top:4, right:4, bgcolor:"rgba(0,0,0,0.6)", borderRadius:"50%",
          width:24, height:24, display:"flex", alignItems:"center", justifyContent:"center",
          cursor:"pointer", opacity:0, transition:"opacity 0.2s" }}>
        <DeleteIcon sx={{ color:"white", fontSize:14 }} />
      </Box>
    </Box>
  );
  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleUpload} />
      <Box onClick={()=>inputRef.current?.click()}
        sx={{ border:"2px dashed rgba(0,0,0,0.15)", borderRadius:1, p:1,
          display:"flex", alignItems:"center", gap:1, cursor:"pointer",
          bgcolor:"rgba(0,0,0,0.04)", "&:hover":{ bgcolor:"rgba(0,0,0,0.08)" } }}>
        {uploading?<CircularProgress size={16}/>:<AddPhotoAlternateIcon sx={{ color:"rgba(0,0,0,0.35)", fontSize:20 }}/>}
        <Typography fontSize={10} color="rgba(0,0,0,0.4)">Subir pie de página</Typography>
      </Box>
    </>
  );
}

function LegalEditable({ flyerId, legal, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(legal || "");
  const save = async () => {
    setEditing(false);
    await supabase.from("flyers").update({ legal:draft }).eq("id", flyerId);
    onUpdate(draft);
  };
  return (
    <Box sx={{ bgcolor:"rgba(0,0,0,0.05)", borderRadius:1, p:0.8, mt:0.5 }}>
      {editing ? (
        <textarea value={draft} onChange={(e)=>setDraft(e.target.value)}
          onBlur={save} autoFocus rows={2}
          style={{ width:"100%", background:"transparent", border:"1px dashed rgba(0,0,0,0.25)",
            borderRadius:4, resize:"none", outline:"none", padding:"2px 4px",
            fontFamily:"'Imprec-Legal',sans-serif", fontSize:"9pt", color:"#333" }} />
      ) : (
        <Typography onClick={()=>setEditing(true)}
          sx={{ ...IMPREC.legal, cursor:"text", "&:hover":{ color:"rgba(0,0,0,0.6)" } }}>
          {legal||<em style={{ fontStyle:"italic", opacity:0.35 }}>Editar legal</em>}
        </Typography>
      )}
    </Box>
  );
}

function ExportButtons({ canvasRef, flyerName }) {
  const [exporting, setExporting] = useState(null);

  const capture = async () => {
    const { default: html2canvas } = await import("html2canvas");
    return html2canvas(canvasRef.current, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#fff800",
    });
  };

  const exportJPG = async () => {
    setExporting("jpg");
    try {
      const canvas = await capture();
      const link   = document.createElement("a");
      link.download = `${flyerName || "folleto"}.jpg`;
      link.href     = canvas.toDataURL("image/jpeg", 0.95);
      link.click();
    } catch(e) { console.error(e); }
    setExporting(null);
  };

  const exportPDF = async () => {
    setExporting("pdf");
    try {
      const canvas  = await capture();
      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: canvas.width > canvas.height ? "l" : "p", unit:"px", format:[canvas.width, canvas.height] });
      pdf.addImage(imgData, "JPEG", 0, 0, canvas.width, canvas.height);
      pdf.save(`${flyerName || "folleto"}.pdf`);
    } catch(e) { console.error(e); }
    setExporting(null);
  };

  return (
    <Box display="flex" gap={1}>
      <Tooltip title="Exportar JPG">
        <Button size="small" variant="outlined" startIcon={exporting==="jpg"?<CircularProgress size={14}/>:<ImageIcon/>}
          onClick={exportJPG} disabled={!!exporting}
          sx={{ fontSize:11, borderColor:"#d1d5db", color:"#374151" }}>
          JPG
        </Button>
      </Tooltip>
      <Tooltip title="Exportar PDF">
        <Button size="small" variant="outlined" startIcon={exporting==="pdf"?<CircularProgress size={14}/>:<PictureAsPdfIcon/>}
          onClick={exportPDF} disabled={!!exporting}
          sx={{ fontSize:11, borderColor:"#d1d5db", color:"#374151" }}>
          PDF
        </Button>
      </Tooltip>
    </Box>
  );
}

export default function CanvasPreview({
  flyer, plantilla, paginas, modulosPorPagina, paginaActual, setPaginaActual,
  selectedModulo, onSelectModulo, onFlyerUpdate, onReorderModulos,
  onAddPagina, onDeletePagina, onMenuAction, onResize,
}) {
  // FIX #1: el sensor solo activa al hacer drag desde el handle (distance:5 sigue igual)
  const sensors   = useSensors(useSensor(PointerSensor, { activationConstraint:{ distance:5 } }));
  const modulos   = modulosPorPagina[paginaActual] || [];
  const canvasRef = useRef(null);

  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id===over.id) return;
    const oldIdx    = modulos.findIndex((m)=>m.id===active.id);
    const newIdx    = modulos.findIndex((m)=>m.id===over.id);
    const reordered = arrayMove(modulos, oldIdx, newIdx);
    onReorderModulos(paginaActual, reordered);
    await Promise.all(reordered.map((m,i)=>supabase.from("modulos").update({ posicion:i }).eq("id",m.id)));
  };

  const CANVAS_SCALE = 0.5;
  const canvasW = (flyer?.width  || 420) * CANVAS_SCALE;
  const canvasH = (flyer?.height || 600) * CANVAS_SCALE;

  return (
    <Box flex={1} bgcolor="#e5e7eb" display="flex" flexDirection="column"
      alignItems="center" overflow="auto" py={3}>
      <GlobalFonts />

      {/* Barra superior: páginas + export */}
      <Box display="flex" alignItems="center" gap={1} mb={2} flexWrap="wrap" justifyContent="center">
        {paginas.filter(Boolean).map((pag, idx) => (
          <Box key={pag.id} position="relative" sx={{ "&:hover .del-pag":{ opacity:1 } }}>
            <Button size="small"
              variant={paginaActual===idx?"contained":"outlined"}
              onClick={()=>setPaginaActual(idx)}
              sx={{ fontSize:12, minWidth:90, pr:paginas.length>1?3.5:1.5,
                ...(paginaActual===idx&&{ bgcolor:"#1a1a2e", "&:hover":{ bgcolor:"#2d2d5e" } }) }}>
              Página {pag.numero}
            </Button>
            {paginas.length > 1 && (
              <Tooltip title="Eliminar página">
                <Box className="del-pag" onClick={()=>onDeletePagina(idx,pag)}
                  sx={{ position:"absolute", top:-6, right:-6, bgcolor:"#ef4444",
                    borderRadius:"50%", width:18, height:18,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    cursor:"pointer", opacity:0, transition:"opacity 0.2s", zIndex:10 }}>
                  <CloseIcon sx={{ color:"white", fontSize:12 }} />
                </Box>
              </Tooltip>
            )}
          </Box>
        ))}
        <IconButton size="small" onClick={onAddPagina}
          sx={{ bgcolor:"white", border:"1px solid #d1d5db" }}>
          <AddIcon fontSize="small" />
        </IconButton>
        <Chip label={flyer?.estado} size="small" color={flyer?.estado==="publicado"?"success":"default"} />
        <ExportButtons canvasRef={canvasRef} flyerName={flyer?.name} />
      </Box>

      {flyer?.width && (
        <Typography fontSize={11} color="#6b7280" mb={1} fontWeight={600}>
          {flyer.width}×{flyer.height}px
        </Typography>
      )}

      {/* Canvas — ref para export */}
      <Box ref={canvasRef} sx={{
        width:canvasW, minHeight:canvasH,
        bgcolor:IMPREC.colors.yellow,
        borderRadius:"6px",
        boxShadow:"0 8px 32px rgba(0,0,0,0.25)",
        display:"flex", flexDirection:"column",
        overflow:"hidden",
      }}>
        <HeaderImprecionante flyer={flyer} onFlyerUpdate={onFlyerUpdate} />

        {modulos.length===0 ? (
          <Box display="flex" alignItems="center" justifyContent="center" minHeight={200} color="#92400e">
            <Typography fontSize={13} textAlign="center">Agregá productos desde el panel izquierdo</Typography>
          </Box>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={modulos.map((m)=>m.id)} strategy={rectSortingStrategy}>
              <Box display="flex" flexWrap="wrap" gap={0.5} justifyContent="center" px={0.8} py={0.8}>
                {modulos.map((modulo)=>(
                  <SortableModuloCard key={modulo.id} modulo={modulo}
                    isSelected={selectedModulo?.id===modulo.id}
                    onClick={()=>onSelectModulo(modulo)}
                    onMenuAction={onMenuAction} onResize={onResize} />
                ))}
              </Box>
            </SortableContext>
          </DndContext>
        )}

        <Box px={1} pb={0.8}>
          <FooterUploader flyerId={flyer?.id} footerUrl={flyer?.footer_url}
            onUpdate={(url)=>onFlyerUpdate("footer_url",url)} />
          <LegalEditable flyerId={flyer?.id} legal={flyer?.legal}
            onUpdate={(val)=>onFlyerUpdate("legal",val)} />
        </Box>
      </Box>
    </Box>
  );
}