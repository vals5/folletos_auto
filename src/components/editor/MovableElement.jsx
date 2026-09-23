import { useState, useRef, useEffect } from "react";
import { Box } from "@mui/material";

export default function MovableElement({
  children,
  defaultPosition = { x: 0, y: 0 },
  isAbsolute = false,
  useBounds = false,
  sx = {},
}) {
  const [pos, setPos] = useState(defaultPosition);
  const dragging = useRef(false);
  const startMouse = useRef({ x: 0, y: 0 });
  const startPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setPos(defaultPosition);
  }, [defaultPosition.x, defaultPosition.y]);

  const handlePointerDown = (e) => {
    // ESTO ES CLAVE: Detiene la propagación para que dnd-kit no detecte el arrastre
    e.stopPropagation();

    if (e.target.hasPointerCapture && e.target.hasPointerCapture(e.pointerId)) {
      e.target.releasePointerCapture(e.pointerId);
    }

    dragging.current = false;
    startMouse.current = { x: e.clientX, y: e.clientY };
    startPos.current = { ...pos };

    const onPointerMove = (ev) => {
      if (Math.abs(ev.clientX - startMouse.current.x) > 3 || Math.abs(ev.clientY - startMouse.current.y) > 3) {
        dragging.current = true;
      }

      if (!dragging.current) return;
      ev.stopPropagation();

      let newX = startPos.current.x + ev.clientX - startMouse.current.x;
      let newY = startPos.current.y + ev.clientY - startMouse.current.y;

      setPos({ x: newX, y: newY });
    };

    const onPointerUp = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", onPointerUp);
  };

  const styleProps = isAbsolute
    ? { position: "absolute", left: pos.x, top: pos.y, zIndex: 99 }
    : { transform: `translate(${pos.x}px, ${pos.y}px)`, position: "relative", zIndex: 50 };

  return (
    <Box
      data-no-dnd="true"
      onPointerDown={handlePointerDown}
      onClick={(e) => {
        if (dragging.current) {
          e.stopPropagation();
        }
      }}
      sx={{
        display: "inline-flex",
        ...styleProps,
        cursor: "grab",
        "&:active": { cursor: "grabbing" },
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
