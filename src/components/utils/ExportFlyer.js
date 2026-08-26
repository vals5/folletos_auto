import { toCanvas } from "html-to-image";

const TRANSPARENT_PLACEHOLDER = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

const captureAll = async (canvasRefs) => {
  if (document.fonts) {
    try {
      await document.fonts.ready;
    } catch (e) {
      console.warn("Error esperando fuentes:", e);
    }
  }

  const canvases = [];

  for (let i = 0; i < canvasRefs.length; i++) {
    const ref = canvasRefs[i];
    const targetElement = ref && "current" in ref ? ref.current : ref;

    if (!targetElement) {
      console.error(`[ExportFlyer] El ref de la página ${i + 1} no está montado.`);
      continue;
    }

    try {
      const canvas = await toCanvas(targetElement, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        cacheBust: false, 
        imagePlaceholder: TRANSPARENT_PLACEHOLDER, 
      });
      canvases.push(canvas);
    } catch (error) {
      console.error(`[ExportFlyer] Error al capturar la página ${i + 1}:`, error);
    }
  }

  return canvases;
};

export const exportToJPG = async (canvasRefs, flyerName) => {
  const canvases = await captureAll(canvasRefs);
  if (canvases.length === 0) {
    alert("No se pudo capturar ninguna página.");
    return;
  }

  canvases.forEach((canvas, i) => {
    const link = document.createElement("a");
    link.download = `${flyerName || "folleto"}_p${i + 1}.jpg`;
    link.href = canvas.toDataURL("image/jpeg", 0.95);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
};

export const exportToPDF = async (canvasRefs, flyerName) => {
  const canvases = await captureAll(canvasRefs);
  if (canvases.length === 0) {
    alert("No se pudo capturar ninguna página para el PDF.");
    return;
  }

  const { jsPDF } = await import("jspdf");
  const scaleFactor = 2; 
  const first = canvases[0];
  const pdfW = first.width / scaleFactor;
  const pdfH = first.height / scaleFactor;

  const pdf = new jsPDF({ 
    orientation: pdfW > pdfH ? "l" : "p", 
    unit: "px", 
    format: [pdfW, pdfH] 
  });

  canvases.forEach((canvas, i) => {
    const w = canvas.width / scaleFactor;
    const h = canvas.height / scaleFactor;
    if (i > 0) pdf.addPage([w, h], w > h ? "l" : "p");
    pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, w, h);
  });
  
  pdf.save(`${flyerName || "folleto"}.pdf`);
};