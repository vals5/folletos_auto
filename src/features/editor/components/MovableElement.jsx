import { useState, useRef } from "react";
import { Box } from "@mui/material";

// Elemento arrastrable dentro de un módulo (modo "edición libre").
// Llama a onPositionChange({x, y}) al soltar, para que el padre guarde la posición.
export default function MovableElement({
  children,
  defaultPosition = { x: 0, y: 0 },
  isAbsolute = false,
  sx = {},
  disabled = false,
  onPositionChange,
}) {
  const [pos, setPos] = useState(defaultPosition);
  const [prevDefault, setPrevDefault] = useState({ x: defaultPosition.x, y: defaultPosition.y });

  // Si cambia la posición guardada (otro módulo, reset, etc.) se sincroniza sin usar useEffect.
  if (prevDefault.x !== defaultPosition.x || prevDefault.y !== defaultPosition.y) {
    setPrevDefault({ x: defaultPosition.x, y: defaultPosition.y });
    setPos(defaultPosition);
  }

  const dragging = useRef(false);
  const latest = useRef(pos);

  const handlePointerDown = (e) => {
    if (disabled) return;
    e.stopPropagation();

    if (e.target.hasPointerCapture?.(e.pointerId)) e.target.releasePointerCapture(e.pointerId);

    // El canvas puede estar con zoom (transform: scale): se convierte el movimiento del mouse a px del folleto.
    const rect = e.currentTarget.getBoundingClientRect();
    const scale = e.currentTarget.offsetWidth ? rect.width / e.currentTarget.offsetWidth : 1;

    dragging.current = false;
    const startMouse = { x: e.clientX, y: e.clientY };
    const startPos = { ...pos };

    const onPointerMove = (ev) => {
      if (Math.abs(ev.clientX - startMouse.x) > 3 || Math.abs(ev.clientY - startMouse.y) > 3) {
        dragging.current = true;
      }
      if (!dragging.current) return;
      ev.stopPropagation();

      const next = {
        x: startPos.x + (ev.clientX - startMouse.x) / scale,
        y: startPos.y + (ev.clientY - startMouse.y) / scale,
      };
      latest.current = next;
      setPos(next);
    };

    const onPointerUp = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      if (dragging.current && onPositionChange) {
        onPositionChange({ x: Math.round(latest.current.x * 10) / 10, y: Math.round(latest.current.y * 10) / 10 });
      }
    };

    window.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", onPointerUp);
  };

  const styleProps = isAbsolute
    ? { position: "absolute", left: pos.x, top: pos.y, zIndex: 99 }
    : { transform: `translate(${pos.x}px, ${pos.y}px)`, position: "relative", zIndex: 50 };

  return (
    <Box
      onPointerDown={handlePointerDown}
      onClick={(e) => {
        if (dragging.current && !disabled) e.stopPropagation();
      }}
      sx={{
        display: "inline-flex",
        ...styleProps,
        cursor: disabled ? "inherit" : "grab",
        "&:active": { cursor: disabled ? "inherit" : "grabbing" },
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
