// Lógica de la grilla de módulos de una página.
// `posicion` es el índice de la celda (fila * cols + columna) donde empieza el módulo.

const spans = (m) => ({ c: m.colSpan || 1, r: m.rowSpan || 1 });

export function cabe(posicion, c, r, grid) {
  const row = Math.floor(posicion / grid.cols);
  const col = posicion % grid.cols;
  return posicion >= 0 && col + c <= grid.cols && row + r <= grid.rows;
}

export function celdasDe(posicion, c, r, grid) {
  const row = Math.floor(posicion / grid.cols);
  const col = posicion % grid.cols;
  const celdas = [];
  for (let rr = 0; rr < r; rr++) for (let cc = 0; cc < c; cc++) celdas.push((row + rr) * grid.cols + (col + cc));
  return celdas;
}

// Ajusta una posición para que un módulo de c×r no se salga de la grilla.
export function ajustarAGrilla(posicion, c, r, grid) {
  const row = Math.min(Math.floor(posicion / grid.cols), Math.max(0, grid.rows - r));
  const col = Math.min(posicion % grid.cols, Math.max(0, grid.cols - c));
  return row * grid.cols + col;
}

// Primera posición donde entra un módulo de c×r sin pisar a otros. null si la página está llena.
export function encontrarCeldaLibre(modulos, c, r, grid, ignorarId = null) {
  const ocupadas = new Set();
  modulos
    .filter((m) => m.id !== ignorarId)
    .forEach((m) => {
      const s = spans(m);
      celdasDe(m.posicion || 0, s.c, s.r, grid).forEach((x) => ocupadas.add(x));
    });
  for (let i = 0; i < grid.cols * grid.rows; i++) {
    if (!cabe(i, c, r, grid)) continue;
    if (celdasDe(i, c, r, grid).every((x) => !ocupadas.has(x))) return i;
  }
  return null;
}

// Coloca `idMovido` en `posDestino` y empuja al primer hueco libre a los módulos que choquen.
export function reubicarSiColisiona(modulos, idMovido, posDestino, grid) {
  const movido = modulos.find((m) => m.id === idMovido);
  if (!movido) return modulos;

  const s = spans(movido);
  const destino = ajustarAGrilla(posDestino, s.c, s.r, grid);
  const ocupadas = new Set(celdasDe(destino, s.c, s.r, grid));
  const resultado = [{ ...movido, posicion: destino }];

  const otros = modulos.filter((m) => m.id !== idMovido).sort((a, b) => (a.posicion || 0) - (b.posicion || 0));

  for (const m of otros) {
    const ms = spans(m);
    const pos = m.posicion || 0;
    const celdas = cabe(pos, ms.c, ms.r, grid) ? celdasDe(pos, ms.c, ms.r, grid) : null;

    if (celdas && celdas.every((x) => !ocupadas.has(x))) {
      celdas.forEach((x) => ocupadas.add(x));
      resultado.push(m);
      continue;
    }

    // Hay choque (o estaba fuera de la grilla): buscar el primer hueco libre.
    let nueva = null;
    for (let i = 0; i < grid.cols * grid.rows; i++) {
      if (!cabe(i, ms.c, ms.r, grid)) continue;
      const cs = celdasDe(i, ms.c, ms.r, grid);
      if (cs.every((x) => !ocupadas.has(x))) {
        nueva = i;
        cs.forEach((x) => ocupadas.add(x));
        break;
      }
    }
    resultado.push({ ...m, posicion: nueva ?? pos });
  }
  return resultado;
}
