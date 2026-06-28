# `useNoteLongPress` — constantes

Archivo: `src/composables/useNoteLongPress.ts`

| Constante | Valor | Qué hace |
|-----------|-------|----------|
| `LONG_PRESS_MS` | `700` | Duración del hold para abrir la nota. El `progress` (0→1) y la animación de `NotePressReveal` avanzan en ese tiempo. Al llegar a 1 se dispara `onComplete`. |
| `CANCEL_MS` | `150` | Al soltar antes de tiempo, el progreso baja a 0 con ease-out en esta duración (no se corta de golpe). |
| `MOVE_SLOP_PX` | `5` | En touch, si el dedo se mueve más de estos píxeles desde el punto inicial, se cancela el long-press (evita abrir al hacer scroll). |

`LONG_PRESS_MS` es exportada; las otras dos son internas del composable.
