import { useState, useRef, useEffect } from "react";
import { Box, Typography, Chip, Tooltip, CircularProgress, Button, IconButton, Menu, MenuItem, Slider, } from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon             from "@mui/icons-material/Delete";
import AddIcon                from "@mui/icons-material/Add";
import MoreHorizIcon          from "@mui/icons-material/MoreHoriz";
import CloseIcon              from "@mui/icons-material/Close";
import ImageIcon              from "@mui/icons-material/Image";
import PictureAsPdfIcon       from "@mui/icons-material/PictureAsPdf";
import DragIndicatorIcon      from "@mui/icons-material/DragIndicator";
import ZoomInIcon             from "@mui/icons-material/ZoomIn";
import ZoomOutIcon            from "@mui/icons-material/ZoomOut";
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
    @font-face { font-family:'Imprec-Vigency';  src:url('/src/assets/fonts/imprecionante/GothamCondensed-Bold.otf') format('opentype'); }
    @font-face { font-family:'Imprec-Legal';    src:url('/src/assets/fonts/imprecionante/Zuume-Light.otf')          format('opentype'); }
    @font-face { font-family:'Imprec-Price';    src:url('/src/assets/fonts/imprecionante/GothamCondensed-Bold.otf') format('opentype'); }
    @font-face { font-family:'Imprec-SubtPrice';src:url('/src/assets/fonts/imprecionante/GothamCondensed-Bold.otf') format('opentype'); }
    @font-face { font-family:'Imprec-RegPrice'; src:url('/src/assets/fonts/imprecionante/Zuume-Bold.otf')           format('opentype'); }
    @font-face { font-family:'Imprec-kgPrice';  src:url('/src/assets/fonts/imprecionante/Zuume-Light.otf')          format('opentype'); }
    @font-face { font-family:'Imprec-Name';     src:url('/src/assets/fonts/imprecionante/Zuume-SemiBold.otf')       format('opentype'); }
    @font-face { font-family:'Imprec-Desc';     src:url('/src/assets/fonts/imprecionante/Zuume-Light.otf')          format('opentype'); }
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

const TIPO_PRECIO_LABEL = { regular:null, llevando3:"LLEVANDO 2", vea_ahorro:"VEA AHORRO", regular_cencosud:"CENCOSUD" };
const FONDO_COLORS      = { white:"#ffffff", red:"#ff0000", yellow:"#fff800", empty:"transparent" };
const BORDER_STYLES     = { none:"none", solid:"2px solid #ff0000", dashed:"2px dashed #ff0000", thick:"3px solid #ff0000" };

const STARBURST_CLIP = `polygon(
  50% 0%,56% 8%,65% 4%,67% 13%,77% 11%,75% 21%,
  85% 22%,80% 31%,90% 35%,82% 42%,91% 49%,81% 53%,
  88% 62%,77% 63%,80% 74%,69% 71%,68% 82%,58% 76%,
  55% 87%,45% 81%,42% 92%,34% 84%,28% 93%,24% 82%,
  13% 88%,13% 76%,2% 78%,5% 67%,-5% 61%,6% 54%,
  -2% 46%,10% 41%,4% 31%,16% 29%,13% 18%,24% 20%,
  25% 9%,35% 14%,38% 3%,47% 10%)`;

const TARJETA_LOGO = { vea_ahorro: TarjetaVea, regular_cencosud: TarjetaCencosud };

const BTN_ROUND = { borderRadius: "20px", textTransform: "none", fontSize: 12 };

function InlineText({ value, onSave, style={}, placeholder="Editar" }) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(value || "");
  const handleSave = () => { setEditing(false); if (draft !== value) onSave(draft); };
  if (editing) return (
    <input value={draft} autoFocus
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
        onError={(e) => { e.target.style.opacity="0.15"; }}
        sx={{ maxHeight:48, maxWidth:66, objectFit:"contain" }} />
    </Box>
  );
  const vi = { fontFamily:"'Imprec-Vigency',sans-serif", fontSize:"inherit", color:"#ff0000", textTransform:"uppercase" };
  return (
    <Box 
      bgcolor={IMPREC.colors.yellow} borderRadius="4px 4px 0 0" px={1.5} py={0.8} display="flex" justifyContent="center" alignItems="center" position="relative" sx={{ minHeight: 60 }} 
    >
      {/* LOGO IZQUIERDO: Posición fija absoluta a la izquierda */}
      <Box sx={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", zIndex: 2 }}>
        <LogoSlot slot="izq" />
      </Box>

      {/* TEXTO CENTRAL (FECHAS) */}
    <Box textAlign="center" sx={{ px: 9 }}> 
     <Typography sx={{ ...IMPREC.vigency }}>
    {"DEL "}
     <InlineText value={flyer?.fecha_inicio_texto} onSave={(v)=>saveFlyer("fecha_inicio_texto",v)} placeholder="05" style={vi}/>
    
    {/* SI LOS MESES SON DISTINTOS, MUESTRA EL MES DE INICIO. SI SON IGUALES, LO CORTA */}
    {flyer?.mes_inicio !== flyer?.mes_fin && (
      <>
        {" DE "}
        <InlineText value={flyer?.mes_inicio} onSave={(v)=>saveFlyer("mes_inicio",v)} placeholder="DICIEMBRE" style={vi}/>
      </>
    )}
      </Typography>
  
  <Typography sx={{ ...IMPREC.vigency }}>
    {"AL "}
    <InlineText value={flyer?.fecha_fin_texto} onSave={(v)=>saveFlyer("fecha_fin_texto",v)} placeholder="12" style={vi}/>
    {" DE "}
    <InlineText value={flyer?.mes_fin} onSave={(v)=>saveFlyer("mes_fin",v)} placeholder="ENERO" style={vi}/>
  </Typography>
</Box>

      {/* LOGO DERECHO (Vea): Posición fija absoluta a la derecha */}
      <Box sx={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", zIndex: 2 }}>
        <LogoSlot slot="der" />
      </Box>
    </Box>
  );
}

function PrecioStarburst({ precio, tipoPrecio, size, isBgRed = false, isModuloSelected = false }) {
  const starSize      = size.width > 200 ? 82 : size.width > 140 ? 66 : 54;
  const priceFontSize = size.width > 200 ? "15pt" : size.width > 140 ? "12pt" : "9pt";
  const subtFontSize  = size.width > 200 ? "6pt" : "5pt";
  const tarjetaLogo   = TARJETA_LOGO[tipoPrecio];
  const isLlevando    = tipoPrecio === "llevando3";

  const starColor  = isBgRed ? IMPREC.colors.white : IMPREC.colors.red;
  const priceColor = isBgRed ? IMPREC.colors.red   : IMPREC.colors.white;
  const subtColor  = isBgRed ? IMPREC.colors.red   : IMPREC.colors.white;

  const precioDisplay = `$${precio.toLocaleString("es-AR")}`;

  const [pos, setPos]  = useState({ x: size.width - starSize - 2, y: size.height - starSize - 2 });

  useEffect(() => {
    setPos({ x: size.width - starSize - 2, y: size.height - starSize - 2 });
  }, [size.width, size.height, starSize]);

  const dragging       = useRef(false);
  const startMouse     = useRef({ x:0, y:0 });
  const startPos       = useRef({ x:0, y:0 });

  const handleMouseDown = (e) => {
    if (!isModuloSelected) return;
    e.stopPropagation(); e.preventDefault();
    dragging.current   = true;
    startMouse.current = { x: e.clientX, y: e.clientY };
    startPos.current   = { ...pos };
    const onMove = (ev) => {
      if (!dragging.current) return;
      const newX = Math.min(Math.max(startPos.current.x + ev.clientX - startMouse.current.x, -10), size.width  - starSize + 10);
      const newY = Math.min(Math.max(startPos.current.y + ev.clientY - startMouse.current.y, -10), size.height - starSize + 10);
      setPos({ x: newX, y: newY });
    };
    const onUp = () => { dragging.current = false; window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

return (
    <Box onMouseDown={handleMouseDown} sx={{
      position: "absolute", 
      left: pos.x, 
      top: pos.y, 
      zIndex: 50,
      width: starSize, 
      height: starSize,
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center",
      textAlign: "center",
      cursor: isModuloSelected ? "grab" : "default",
      "&:active": { cursor: isModuloSelected ? "grabbing" : "default" },
    }}>
      
      {/* VECTOR DE ESTRELLA DE PUNTAS IDÉNTICAS A LA MUESTRA */}
      <svg viewBox="0 0 100 100" style={{ position: "absolute", width: "100%", height: "100%", top: 0, left: 0, pointerEvents: "none" }}>
        <path 
          d="M50 0 L55 9 L64 4 L66 14 L76 11 L75 21 L85 21 L82 31 L91 33 L85 42 L93 47 L84 53 L90 62 L80 65 L83 75 L73 75 L73 85 L63 82 L61 91 L52 86 L48 95 L41 87 L35 94 L31 84 L22 88 L21 78 L11 79 L14 70 L5 67 L11 59 L3 53 L12 47 L6 38 L16 35 L12 25 L22 25 L21 15 L31 17 L34 8 L42 13 Z" 
          fill={starColor}
        />
      </svg>

      {/* CONTENIDO INTERNO */}
      <Box sx={{ position: "relative", zIndex: 52, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "80%" }}>
        {tarjetaLogo && (
          <Box component="img" src={tarjetaLogo}
            sx={{ width: starSize * 0.45, height: starSize * 0.18, objectFit: "contain", pointerEvents: "none", mb: 0.1 }}
            onError={(e) => { e.target.style.display = "none"; }} />
        )}
        <Typography sx={{ ...IMPREC.price, fontSize: priceFontSize, fontWeight: 900,
          px: 0.2, whiteSpace: "nowrap", lineHeight: 0.95, color: priceColor, pointerEvents: "none" }}>
          {precioDisplay}
        </Typography>
        {isLlevando && (
          <Typography sx={{ ...IMPREC.subtPrice, fontSize: subtFontSize, fontWeight: 700, letterSpacing: 0.2,
            color: subtColor, pointerEvents: "none", mt: 0.2 }}>
            X UNIDAD
          </Typography>
        )}
      </Box>

      {/* RECUADRO DE SELECCIÓN CUANDO SE EDITA */}
      {isModuloSelected && (
        <Box sx={{
          position: "absolute", top: -4, left: -4, right: -4, bottom: -4,
          border: "2px dashed #f59e0b", borderRadius: "50%", pointerEvents: "none", zIndex: 53
        }} />
      )}
    </Box>
  );
}

function MiniProducto({ producto, nombreOverride, descripcionOverride, imgOverride, textColor, showPrice, precio, tipoPrecio, size, isBgRed, isModuloSelected }) {
  const imgSrc = imgOverride || producto?.imagen_url;
  const nombre = nombreOverride || producto?.nombre || "Sin nombre";
  const desc   = descripcionOverride !== undefined ? descripcionOverride : producto?.descripcion;
  return (
    <Box sx={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center",
      justifyContent:"flex-start", position:"relative", overflow:"hidden", minWidth:0, px:0.3, pt:0.5 }}>
      {imgSrc ? (
        <Box component="img" src={imgSrc} alt={nombre}
          sx={{ maxWidth:"90%", maxHeight:"42%", objectFit:"contain", mb:0.3 }}
          onError={(e) => { e.target.style.display="none"; }} />
      ) : (
        <Box sx={{ width:"70%", height:"40%", bgcolor:"#f3f4f6", borderRadius:1, mb:0.3,
          display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Typography fontSize={7} color="#9ca3af">IMG</Typography>
        </Box>
      )}
      <Typography sx={{ ...IMPREC.productName, color:textColor, width:(flyer?.width||420)*0.5,
        minHeight:(flyer?.height||600)*0.5, textAlign:"center",
        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
        {nombre}
      </Typography>
      {desc && (
        <Typography sx={{ ...IMPREC.productDesc,
          color:textColor==="#ffffff"?"rgba(255,255,255,0.75)":"#555",
          width:(flyer?.width||420)*0.5,
        minHeight:(flyer?.height||600)*0.5, textAlign:"center", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {desc}
        </Typography>
      )}
      {showPrice && precio && (
        <PrecioStarburst precio={precio} tipoPrecio={tipoPrecio} size={size}
          isBgRed={isBgRed} isModuloSelected={isModuloSelected} />
      )}
    </Box>
  );
}

function SortableModuloCard({ modulo, isSelected, onClick, onMenuAction, onResize, flyer }) {
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

  const productosExtra    = modulo.productos_extra || [];
  const todosLosProductos = [
    { producto:modulo.productos, imgOverride:modulo.imagen_url_override,
      nombreOverride: modulo.nombre_override, descripcionOverride: modulo.descripcion_override, precio:modulo.precio },
    ...productosExtra.map((pe)=>({ producto:pe.producto, imgOverride:pe.imagen_url_override,
      nombreOverride: undefined, descripcionOverride: undefined, precio:pe.precio })),
  ];
  const esMulti  = todosLosProductos.length > 1;
  const gridCols = todosLosProductos.length <= 2 ? todosLosProductos.length : 2;

  const openMenu  = (e) => { e.stopPropagation(); setMenuAnchor(e.currentTarget); };
  const closeMenu = () => setMenuAnchor(null);

  const handleResizeMouseDown = (e) => {
    e.stopPropagation(); e.preventDefault();
    dragStartX.current = e.clientX; dragStartIdx.current = tamanoIdx;
    const onMove = (ev) => {
      const steps  = Math.round((ev.clientX - dragStartX.current) / 40);
      const newIdx = Math.min(Math.max(dragStartIdx.current + steps, 0), TAMANOS.length - 1);
      if (TAMANOS[newIdx] !== modulo.tamano) onResize(modulo.id, TAMANOS[newIdx]);
    };
    const onUp = () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove); window.addEventListener("mouseup", onUp);
  };

  const nombreMostrado = modulo.nombre_override ?? modulo.productos?.nombre ?? "Sin nombre";
  const descMostrada   = modulo.descripcion_override !== undefined && modulo.descripcion_override !== null
    ? modulo.descripcion_override : modulo.productos?.descripcion;

  return (
    <Box position="relative" onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}>
      {/* MENÚ CONTEXTUAL (TRES PUNTOS) */}
      {(hovered||!!menuAnchor) && (
        <Box onClick={openMenu}
          sx={{ position:"absolute", top:4, right:4, zIndex:60, bgcolor:"rgba(0,0,0,0.55)",
            borderRadius:1, width:20, height:20, display:"flex", alignItems:"center",
            justifyContent:"center", cursor:"pointer", "&:hover":{ bgcolor:"rgba(0,0,0,0.8)" } }}>
          <MoreHorizIcon sx={{ color:"white", fontSize:14 }} />
        </Box>
      )} {/* BOTÓN PARA ARRASTRAR EL MÓDULO (DRAG INDICATOR) */}
      {(hovered || isSelected) && (
        <Box {...listeners} {...attributes}
          sx={{ position:"absolute", top:4, left:4, zIndex:60,
            bgcolor:"rgba(0,0,0,0.45)", borderRadius:1, width:20, height:20,
            display:"flex", alignItems:"center", justifyContent:"center",
            cursor:"grab", "&:active":{ cursor:"grabbing" }, "&:hover":{ bgcolor:"rgba(0,0,0,0.7)" } }}
          onMouseDown={(e) => e.stopPropagation()}>
          <DragIndicatorIcon sx={{ color:"white", fontSize:14 }} />
        </Box>
      )} {/* DROPDOWN MENU */}
      <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={closeMenu}
        PaperProps={{ sx:{ minWidth:160, borderRadius:2 } }}>
        <MenuItem onClick={()=>{ closeMenu(); onMenuAction("duplicar",modulo); }} sx={{ fontSize:13 }}>Duplicar módulo</MenuItem>
        <MenuItem onClick={()=>{ closeMenu(); onMenuAction("eliminar",modulo); }} sx={{ fontSize:13, color:"#ef4444" }}>Eliminar módulo</MenuItem>
      </Menu> {/* CONTENEDOR PRINCIPAL DEL MÓDULO (RESPETA LA GRILLA) */}
      <Box ref={setNodeRef} onClick={onClick} sx={{ width:"100%", height:"100%", bgcolor:bgColor, border:borderStyle, borderRadius:"3px", display:"flex", flexDirection:"column", alignItems:"stretch", justifyContent:"space-between", p: 0.5,
        cursor:"pointer", position:"relative", opacity:isDragging?0.5:1, boxShadow:isSelected?"0 0 0 3px #f59e0b55":bgColor==="transparent"?"none":"0 1px 4px rgba(0,0,0,0.18)",
        transform:CSS.Transform.toString(transform), transition, overflow:"visible", }}>
          {/* FAJA DE TEXTO DE OFERTA SUPERIOR */}
        {priceLabel && !esMulti && (
          <Box sx={{ width: "100%", bgcolor: IMPREC.colors.red, display: "flex", alignItems: "center", justifyContent: "center", py: 0.2, mb: 0.2 }}>
            <Typography sx={{ ...IMPREC.subtPrice, fontSize: "6pt", color: IMPREC.colors.white, letterSpacing: 0.8 }}>
              {priceLabel}
            </Typography>
          </Box>
        )}
        {/* CASO: PRODUCTO INDIVIDUAL */}
        {!esMulti && (() => {
          const imgSrc = modulo.imagen_url_override || modulo.productos?.imagen_url;

          const esLayoutHorizontal = modulo.layout_type === "horizontal" || (modulo.layout_type === "auto" && (modulo.size === "L" || modulo.size === "XL"));
          // SUB-PIEZA: IMAGEN
          const renderImagen = (heightPct = "100%", maxWidthPct = "85%") => (
            <Box sx={{ height: heightPct, width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {imgSrc ? (
                <Box component="img" src={imgSrc} alt={nombreMostrado}
                  sx={{ maxWidth: maxWidthPct, maxHeight: "100%", objectFit: "contain", display: "block" }}
                  onError={(e) => { e.target.style.visibility = "hidden"; }} />
              ) : (
                <Box sx={{ width: "50%", height: "85%", bgcolor: "#f3f4f6", borderRadius: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Typography fontSize={7} color="#9ca3af">IMG</Typography>
                </Box>
              )}
            </Box>
          );

          // SUB-PIEZA: TEXTOS COMERCIALES
          const renderTextosComerciales = (align = "center") => (
            <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: align }}>
              <Typography sx={{ 
                ...IMPREC.productName, 
                color: textColor,
                fontSize: "7.5pt", 
                lineHeight: 0.95,
                textAlign: align,
                width: "100%",
                wordBreak: "break-word"
              }}>
                {nombreMostrado}
              </Typography>

              {descMostrada && (
                <Typography sx={{ 
                  ...IMPREC.productDesc,
                  color: isBgRed ? "rgba(255,255,255,0.75)" : "#555",
                  fontSize: "6pt", 
                  lineHeight: 0.95,
                  textAlign: align,
                  width: "100%",
                  wordBreak: "break-word",
                  mt: 0.1
                }}>
                  {descMostrada}
                </Typography>
              )}
            </Box>
          );

          // SUB-PIEZA: PRECIOS LEGALES INFERIORES
          const renderLegales = (align = "center", border = false) => (
            <Box sx={{ 
              width: "100%", 
              textAlign: align,
              borderLeft: border && !isBgRed ? "1px solid rgba(0, 0, 0, 0.15)" : "none",
              borderLeftColor: border && isBgRed ? "rgba(255, 255, 255, 0.3)" : "none",
              pl: border ? 0.6 : 0
            }}>
              <Typography sx={{ 
                fontFamily: "'Imprec-RegPrice', sans-serif", 
                fontSize: "4.8pt", 
                color: isBgRed ? "white" : "black",
                lineHeight: 1,
                whiteSpace: "nowrap"
              }}>
                PRECIO REG. ${modulo.precio_regular || "0.00"} / SIN IMPUESTOS ${modulo.precio_sin_impuestos || "0.00"}
              </Typography>
              <Typography sx={{ 
                fontFamily: "'Imprec-kgPrice', sans-serif", 
                fontSize: "4.8pt", 
                color: isBgRed ? "rgba(255,255,255,0.8)" : "#333",
                lineHeight: 1,
                whiteSpace: "nowrap",
                mt: 0.1
              }}>
                POR KG: ${modulo.precio_kg || "0.00"} | DISPONIBLES: {modulo.stock || "100"} UN.
              </Typography>
            </Box>
          );

          if (esLayoutHorizontal) {
            // DISEÑO TIPO ATÚN CUISINE & CO: Imagen izquierda, Datos derecha
            return (
              <Box sx={{ display: "flex", flexDirection: "row", width: "100%", height: "100%", alignItems: "center", p: 0.3 }}>
                {/* Lado Izquierdo: Foto del producto */}
                <Box sx={{ width: "40%", height: "100%" }}>
                  {renderImagen("100%", "95%")}
                </Box>

                {/* Lado Derecho: Textos Comerciales y Legales acoplados */}
                <Box sx={{ width: "60%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 0.4, pl: 0.5 }}>
                  {renderTextosComerciales("left")}
                  {renderLegales("left", true)} {/* Pone barrita divisoria prolija */}
                </Box>
              </Box>
            );
          } else {
            // DISEÑO TIPO LEVITÉ / CLÁSICO: Apilado Vertical Uniforme
            return (
              <Box sx={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between", width: "100%" }}>
                {/* Contenedor de Imagen */}
                <Box sx={{ height: "35%", width: "100%", mt: priceLabel ? 0.1 : 0.4 }}>
                  {renderImagen("100%", "85%")}
                </Box>

                {/* Contenedor de Texto Comercial */}
                <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", my: 0.2, px: 0.3 }}>
                  {renderTextosComerciales("center")}
                </Box>

                {/* Línea de Legales Inferiores */}
                <Box sx={{ width: "100%", pb: 0.1, mt: "auto" }}>
                  {renderLegales("center", false)}
                </Box>
              </Box>
            );
          }
        })()}

        {/* CASO: MULTI-PRODUCTO */}
        {esMulti && (
          <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${gridCols},1fr)`, flex: 1, p: 0.3 }}>
            {todosLosProductos.map((item, i) => (
              <MiniProducto key={i} producto={item.producto} imgOverride={item.imgOverride}
                nombreOverride={item.nombreOverride} descripcionOverride={item.descripcionOverride}
                textColor={textColor} showPrice={i === todosLosProductos.length - 1}
                precio={modulo.precio} tipoPrecio={modulo.tipo_precio}
                size={size} isBgRed={isBgRed} isModuloSelected={isSelected} />
            ))}
          </Box>
        )}

        {/* MANEJADOR DE RESIZE */}
        {isSelected && (
          <Box onMouseDown={handleResizeMouseDown}
            sx={{ position: "absolute", bottom: 3, right: 3, zIndex: 20,
              width: 10, height: 10, borderRadius: "50%", bgcolor: "#f59e0b", border: "2px solid white",
              cursor: "se-resize", boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
              "&:hover": { bgcolor: "#ef4444", transform: "scale(1.3)" }, transition: "transform 0.1s" }} />
        )}
      </Box>

      {/* CUCARDA DE PRECIO (STARBURST) */}
      {modulo.precio && (
        <PrecioStarburst precio={modulo.precio} tipoPrecio={modulo.tipo_precio}
          size={size} isBgRed={isBgRed} isModuloSelected={isSelected} />
      )}
    </Box>
  );
}

function FooterUploader({ flyer, flyerId, footerUrl, onUpdate }) {
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
      <Box component="img" src={footerUrl} alt="Pie" sx={{ width:(flyer?.width||420)*0.5,
        minHeight:(flyer?.height||600)*0.5, borderRadius:1 }} />
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
          style={{ width:(flyer?.width||420)*0.5,
        minHeight:(flyer?.height||600)*0.5, background:"transparent", border:"1px dashed rgba(0,0,0,0.25)",
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

function ExportButtons({ canvasRefs, flyerName, paginas }) {
  const [exporting, setExporting] = useState(null);

  const captureAll = async () => {
    const { default: html2canvas } = await import("html2canvas");
    const canvases = [];
    for (const ref of canvasRefs) {
      if (ref?.current) {
        const c = await html2canvas(ref.current, { scale:3, useCORS:true, allowTaint:true, backgroundColor:"#fff800" });
        canvases.push(c);
      }
    }
    return canvases;
  };

  const exportJPG = async () => {
    setExporting("jpg");
    try {
      const canvases = await captureAll();
      canvases.forEach((canvas, i) => {
        const link = document.createElement("a");
        link.download = `${flyerName||"folleto"}_p${i+1}.jpg`;
        link.href = canvas.toDataURL("image/jpeg", 0.95);
        link.click();
      });
    } catch(e) { console.error(e); }
    setExporting(null);
  };

  const exportPDF = async () => {
    setExporting("pdf");
    try {
      const canvases = await captureAll();
      const { jsPDF } = await import("jspdf");
      const first = canvases[0];
      const pdf = new jsPDF({ orientation: first.width > first.height ? "l" : "p", unit:"px", format:[first.width, first.height] });
      canvases.forEach((canvas, i) => {
        if (i > 0) pdf.addPage([canvas.width, canvas.height], canvas.width > canvas.height ? "l" : "p");
        pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, canvas.width, canvas.height);
      });
      pdf.save(`${flyerName||"folleto"}.pdf`);
    } catch(e) { console.error(e); }
    setExporting(null);
  };

  return (
    <Box display="flex" gap={1}>
      <Tooltip title="Exportar JPG (una por página)">
        <Button size="small" variant="outlined"
          startIcon={exporting==="jpg"?<CircularProgress size={14}/>:<ImageIcon/>}
          onClick={exportJPG} disabled={!!exporting}
          sx={{ ...BTN_ROUND, borderColor:"#d1d5db", color:"#374151" }}>JPG</Button>
      </Tooltip>
      <Tooltip title="Exportar PDF (todas las páginas)">
        <Button size="small" variant="outlined"
          startIcon={exporting==="pdf"?<CircularProgress size={14}/>:<PictureAsPdfIcon/>}
          onClick={exportPDF} disabled={!!exporting}
          sx={{ ...BTN_ROUND, borderColor:"#d1d5db", color:"#374151" }}>PDF</Button>
      </Tooltip>
    </Box>
  );
}

function PaginaCanvas({ flyer, pag, pagIdx, modulos, selectedModulo, onSelectModulo, onMenuAction, onResize, onDeletePagina, canvasRef, totalPaginas, sensors, onReorderModulos, onFlyerUpdate, esPrimera }) {

  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id===over.id) return;
    const oldIdx    = modulos.findIndex((m)=>m.id===active.id);
    const newIdx    = modulos.findIndex((m)=>m.id===over.id);
    const reordered = arrayMove(modulos, oldIdx, newIdx);
    onReorderModulos(pagIdx, reordered);
    await Promise.all(reordered.map((m,i)=>supabase.from("modulos").update({ posicion:i }).eq("id",m.id)));
  };

  return (
    <Box sx={{ display:"flex", flexDirection:"column", alignItems:"center", mb:4 }}>

      {/* ROUNDED BUTTONS */}
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <Chip label={`Página ${pag.numero}`} size="small"
          sx={{ borderRadius:"20px", fontWeight:600, fontSize:12,
            bgcolor:"#1a1a2e", color:"white", px:1 }} />
        {totalPaginas > 1 && (
          <Tooltip title="Eliminar página">
            <Box onClick={()=>onDeletePagina(pagIdx, pag)}
              sx={{ display:"flex", alignItems:"center", gap:0.4, cursor:"pointer",
                bgcolor:"#ef4444", color:"white", borderRadius:"20px",
                px:1.2, height:24, "&:hover":{ bgcolor:"#dc2626" } }}>
              <CloseIcon sx={{ fontSize:13 }} />
            </Box>
          </Tooltip>
        )}
      </Box>

      {/* THIS PAGE'S CANVAS */}
      <Box ref={canvasRef} sx={{ width: (flyer?.width || 595) * 0.5, height: (flyer?.height || 841) * 0.5, bgcolor: IMPREC.colors.yellow, borderRadius: "6px", boxShadow: "0 8px 32px rgba(0,0,0,0.25)", display: "flex", 
       flexDirection: "column", overflow: "hidden", position: "relative", }}>
  
  {/* SECCIÓN SUPERIOR: Header fijo */}
  <HeaderImprecionante flyer={flyer} onFlyerUpdate={onFlyerUpdate} />

  {/* SECCIÓN CENTRAL: El contenedor de la grilla con scroll interno si hay más de 12 */}
  <Box sx={{ flex: 1, overflow: "hidden", px: 0.8, py: 0.5 }}>
    {modulos.length === 0 ? (
      <Box display="flex" alignItems="center" justifyContent="center" minHeight={160} color="#92400e">
        <Typography fontSize={13} textAlign="center">Agregá productos desde el panel izquierdo</Typography>
      </Box>
    ) : (
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={modulos.map((m)=>m.id)} strategy={rectSortingStrategy}>
          <Box 
            sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gridAutoRows: "max-content", gap: 0.5, justifyContent: "center", }}
          >
            {modulos.map((modulo)=>(
              <SortableModuloCard key={modulo.id} modulo={modulo}
                isSelected={selectedModulo?.id===modulo.id}
                onClick={()=>onSelectModulo(modulo)}
                onMenuAction={onMenuAction} onResize={onResize}
                flyer={flyer} />
            ))}
          </Box>
        </SortableContext>
      </DndContext>
    )}
  </Box>

  {/* SECCIÓN INFERIOR: El Footer y Legal siempre fijos abajo de todo */}
  {esPrimera && (
    <Box sx={{ px: 1, pb: 0.8, bgcolor: IMPREC.colors.yellow, mt: "auto", zIndex: 10 }}>
      <FooterUploader flyer={flyer} flyerId={flyer?.id} footerUrl={flyer?.footer_url}
        onUpdate={(url)=>onFlyerUpdate("footer_url", url)} />
      <LegalEditable flyerId={flyer?.id} legal={flyer?.legal}
        onUpdate={(val)=>onFlyerUpdate("legal", val)} />
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default function CanvasPreview({
  flyer, plantilla, paginas, modulosPorPagina, paginaActual, setPaginaActual, selectedModulo, onSelectModulo, onFlyerUpdate, onReorderModulos, onAddPagina, onDeletePagina, onMenuAction, onResize, }) {
  const sensors  = useSensors(useSensor(PointerSensor, { activationConstraint:{ distance:5 } }));
  const [zoom, setZoom] = useState(150); 

  const canvasRefs = useRef([]);
  if (canvasRefs.current.length !== paginas.length) {
    canvasRefs.current = paginas.map((_, i) => canvasRefs.current[i] || { current: null });
  }

  const scale = zoom / 100;

  return (
    <Box flex={1} bgcolor="#e5e7eb" display="flex" flexDirection="column"
      alignItems="center" overflow="auto" py={3}>
      <GlobalFonts />

      {/* TOP TOOLBAR */}
      <Box display="flex" alignItems="center" gap={2} mb={3} px={2}
        flexWrap="wrap" justifyContent="center">

        {/* SCALE */}
        <Box display="flex" alignItems="center" gap={1} bgcolor="white"
          borderRadius="20px" px={1.5} py={0.5}
          sx={{ boxShadow:"0 1px 4px rgba(0,0,0,0.12)", minWidth:180 }}>
          <Tooltip title="Alejar">
            <IconButton size="small" onClick={()=>setZoom(z=>Math.max(30,z-10))}>
              <ZoomOutIcon fontSize="small"/>
            </IconButton>
          </Tooltip>
          <Slider value={zoom} min={100} max={250} step={5}
            onChange={(_, v) => setZoom(v)} size="small"
            sx={{ flex:1, color:"#1a1a2e", "& .MuiSlider-thumb":{ width:14, height:14 } }} />
          <Tooltip title="Acercar">
            <IconButton size="small" onClick={()=>setZoom(z=>Math.min(250,z+10))}>
              <ZoomInIcon fontSize="small"/>
            </IconButton>
          </Tooltip>
          <Typography fontSize={11} color="#6b7280" sx={{ minWidth:32, textAlign:"right" }}>
            {zoom}%
          </Typography>
        </Box>

        <Chip label={flyer?.estado || "borrador"} size="small"
          color={flyer?.estado==="publicado"?"success":"default"}
          sx={{ borderRadius:"20px" }} />

        <ExportButtons canvasRefs={canvasRefs.current} flyerName={flyer?.name} paginas={paginas} />
      </Box>

      {flyer?.width && (
        <Typography fontSize={11} color="#6b7280" mb={2} fontWeight={600}>
          {flyer.width}×{flyer.height}px · {zoom}%
        </Typography>
      )}
      <Box sx={{ position:"relative", width:"100%" }}>
        <Box sx={{
          transformOrigin:"top center",
          transform:`scale(${scale})`,
          mb: scale < 1 ? `${-(1 - scale) * 100}%` : 0,
        }}>
          {paginas.filter(Boolean).map((pag, idx) => {
            if (!canvasRefs.current[idx]) canvasRefs.current[idx] = { current: null };
            return (
              <PaginaCanvas
                key={pag.id}
                flyer={flyer}
                pag={pag}
                pagIdx={idx}
                modulos={modulosPorPagina[idx] || []}
                selectedModulo={selectedModulo}
                onSelectModulo={onSelectModulo}
                onMenuAction={onMenuAction}
                onResize={onResize}
                onDeletePagina={onDeletePagina}
                canvasRef={(el) => { canvasRefs.current[idx] = { current: el }; }}
                totalPaginas={paginas.length}
                sensors={sensors}
                onReorderModulos={onReorderModulos}
                onFlyerUpdate={onFlyerUpdate}
                esPrimera={idx === 0}
              />
            );
          })}

          {/* ADD PAGE */}
          <Box display="flex" justifyContent="center" mt={1} mb={2}>
            <Button variant="outlined" startIcon={<AddIcon/>} onClick={onAddPagina}
              sx={{ ...BTN_ROUND, borderColor:"#9ca3af", color:"#374151",
                bgcolor:"white", "&:hover":{ bgcolor:"#f9fafb" }, px:3 }}>
              Agregar página
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}