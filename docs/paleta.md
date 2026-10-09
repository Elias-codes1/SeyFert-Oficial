# Paleta visual y criterios de interfaz

## Colores

| Variable CSS | Valor | Uso |
|---|---|---|
| `--acento` | `#8A3A62` | Encabezado, acciones primarias y enlaces destacados. |
| `--acento-suave` | `#F6E8EF` | Etiquetas y superficies resaltadas. |
| `--fondo` | `#FAF6F8` | Fondo general cálido. |
| `--superficie` | `#FFFFFF` | Tarjetas y paneles. |
| `--borde` | `#E6D9E0` | Separadores y límites de controles. |
| `--texto` | `#2B1F26` | Texto principal. |
| `--texto-suave` | `#6F5D68` | Texto secundario. |

## Tipografía y componentes

Se usa la pila de sistema (`system-ui`, Segoe UI y alternativas), con escala de títulos, etiquetas pequeñas para metadatos y botones con estados visibles. Las tarjetas usan bordes suaves y radios de 8 a 14 px. El catálogo y los paneles usan CSS Grid/Flex con columnas adaptables.

## Accesibilidad

Los campos tienen etiqueta asociada, estados de mensaje con `role=status` o `role=alert` cuando corresponde, botones nativos y nombres accesibles para navegación. Debe verificarse contraste y navegación con teclado en las pantallas finales; la documentación no sustituye esa inspección.
