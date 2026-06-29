const captureAll = async (canvasRefs) => {
  const { default: html2canvas } = await import("html2canvas");
  const canvases = [];
  
  for (const ref of canvasRefs) {
    if (ref?.current) {
      const targetElement = ref.current;

      try {
        const c = await html2canvas(targetElement, { 
          scale: 3, 
          useCORS: true, 
          allowTaint: false, 
          backgroundColor: "#ffffff", 
          logging: false,
          onclone: (clonedDocument, element) => {
            const clonedElements = clonedDocument.querySelectorAll('*');
            
            clonedElements.forEach((clonedEl) => {
              const dataId = clonedEl.getAttribute('data-html2canvas-internal-id');
              if (dataId) {
                const originalEl = element.querySelector(`[data-html2canvas-internal-id="${dataId}"]`);
                
                if (originalEl) {
                  const style = window.getComputedStyle(originalEl);
                  clonedEl.style.letterSpacing = style.letterSpacing;
                  clonedEl.style.lineHeight = style.lineHeight;
                  clonedEl.style.fontFamily = style.fontFamily;
                  
                  if (style.textAlign === 'justify') {
                    clonedEl.style.textAlign = 'left';
                  }
                  clonedEl.style.textJustify = 'none';
                }
              }
            });
          }
        });
        canvases.push(c);
      } catch (error) {
        console.error("Error capturando página:", error);
      }
    }
  }
  return canvases;
};

export const exportToJPG = async (canvasRefs, flyerName) => {
  window.isExportingActive = true;
  try {
    const canvases = await captureAll(canvasRefs);
    canvases.forEach((canvas, i) => {
      const link = document.createElement("a");
      link.download = `${flyerName || "folleto"}_p${i + 1}.jpg`;
      link.href = canvas.toDataURL("image/jpeg", 0.95);
      link.click();
    });
  } catch (error) {
    console.error("Error al exportar JPG:", error);
  } finally {
    window.isExportingActive = false;
  }
};

export const exportToPDF = async (canvasRefs, flyerName) => {
  window.isExportingActive = true;
  try {
    const canvases = await captureAll(canvasRefs);
    if (canvases.length === 0) return;

    const { jsPDF } = await import("jspdf");
    const scaleFactor = 3; 
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
  } catch (error) {
    console.error("Error al exportar PDF:", error);
  } finally {
    window.isExportingActive = false;
  }
};