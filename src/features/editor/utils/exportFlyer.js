import { toCanvas } from "html-to-image";

const TRANSPARENT_PLACEHOLDER = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

// El elemento del canvas mide flyer.width * 0.5 px, por eso pixelRatio 2 = tamaño exacto del folleto.
export const EXPORT_QUALITIES = {
  standard: { label: "Estándar (tamaño exacto del folleto)" },
  print: { label: "Alta calidad (impresión)" },
};

const A4_PT = { width: 595, height: 841 };
const MAX_MEGAPIXELS = 40;

function resolvePixelRatio(element, flyer, quality) {
  if (quality !== "print") return 2;
  const baseW = element.offsetWidth || 1;
  const baseH = element.offsetHeight || 1;
  const esA4 = flyer?.width === A4_PT.width && flyer?.height === A4_PT.height;
  // A4 a 300 dpi ≈ 2480 px de ancho; el resto de los formatos (pantalla) al doble del tamaño.
  const objetivoAncho = esA4 ? 2480 : (flyer?.width || baseW * 2) * 2;
  const limite = Math.sqrt((MAX_MEGAPIXELS * 1_000_000) / (baseW * baseH));
  return Math.min(objetivoAncho / baseW, limite);
}

const safeName = (name) => (name || "folleto").replace(/[\\/:*?"<>|]/g, "_").trim() || "folleto";

async function captureAll(elements, flyer, quality) {
  if (document.fonts) {
    try {
      await document.fonts.ready;
    } catch (e) {
      console.warn("Error esperando fuentes:", e);
    }
  }

  const canvases = [];
  const fallidas = [];

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    if (!el) {
      fallidas.push(i + 1);
      continue;
    }
    try {
      canvases.push(
        await toCanvas(el, {
          pixelRatio: resolvePixelRatio(el, flyer, quality),
          backgroundColor: "#ffffff",
          cacheBust: true,
          imagePlaceholder: TRANSPARENT_PLACEHOLDER,
          style: { transform: "scale(1)", transformOrigin: "top left" },
        }),
      );
    } catch (error) {
      console.error(`[exportFlyer] Error al capturar la página ${i + 1}:`, error);
      fallidas.push(i + 1);
    }
  }

  // No exportamos "a medias" en silencio: si falla alguna página, se avisa.
  if (fallidas.length) {
    throw new Error(`No se pudo capturar la(s) página(s): ${fallidas.join(", ")}. No se descargó nada.`);
  }
  return canvases;
}

function download(href, filename) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = href;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

const canvasToBlob = (canvas, type, q) => new Promise((res) => canvas.toBlob(res, type, q));

export async function exportToJPG(elements, flyer, { quality = "standard" } = {}) {
  const name = safeName(flyer?.nombre);
  const canvases = await captureAll(elements, flyer, quality);

  if (canvases.length === 1) {
    download(canvases[0].toDataURL("image/jpeg", 0.95), `${name}.jpg`);
    return;
  }

  // Varias páginas: un único .zip (los navegadores bloquean descargas múltiples seguidas).
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  for (let i = 0; i < canvases.length; i++) {
    zip.file(`${name}_p${i + 1}.jpg`, await canvasToBlob(canvases[i], "image/jpeg", 0.95));
  }
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  download(url, `${name}.zip`);
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export async function exportToPDF(elements, flyer, { quality = "print" } = {}) {
  const name = safeName(flyer?.nombre);
  const canvases = await captureAll(elements, flyer, quality);

  // Página en puntos (pt): A4 = 595 × 841 pt, o el tamaño del folleto en los demás formatos.
  const w = flyer?.width || 595;
  const h = flyer?.height || 841;
  const orientation = w > h ? "l" : "p";

  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation, unit: "pt", format: [w, h], compress: true });

  canvases.forEach((canvas, i) => {
    if (i > 0) pdf.addPage([w, h], orientation);
    pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, w, h);
  });

  pdf.save(`${name}.pdf`);
}
