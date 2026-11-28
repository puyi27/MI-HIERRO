# DESIGN.md · MI HIERRO

## 1. Dirección de arte e identidad

MI HIERRO es un taller digital de diseño de hierros ganaderos (RUCTL), marcas de yeguadas PRE y emblemas personales de novilleros y toreros.
La interfaz debe sentirse como un **libro oficial de registro de hierros impreso en papel algodón**, combinado con un **taller de guarnicionería y forja andaluza**.

- **Personalidad:** Sobria, luminosa, seria, artesanal y contemporánea.
- **Referencias mentales:** Libros históricos de hierros ganaderos, cartelería tipográfica clásica, encuadernación con filetes finos, talleres de sastrería de toreros y editoriales minimalistas de alta gama.
- **Lo que NO es:** Nunca debe parecer un SaaS tecnológico, una app crypto/AI, una tienda dropshipping ni una plantilla genérica de Tailwind.

---

## 2. Sistema de color (tokens estrictos)

Usa exclusivamente esta paleta. Prohibido inventar colores fuera de estos tokens salvo neutros derivados por opacidad.

| Rol | Token / Nombre | Hex | Uso obligatorio |
| :--- | :--- | :--- | :--- |
| Fondo principal | Papel cal | `#F7F3EA` | Lienzo base de toda la web y el wizard |
| Superficie elevada | Papel carta | `#FFFDF9` | Tarjetas de lámina, fichas de prueba, formularios |
| Tinta primaria | Negro azabache | `#161412` | Titulares, textos principales, botones primarios, bordes fuertes |
| Acento primario | Grana burladero | `#6B141E` | Estados activos, bordes de ficha seleccionada, alertas editoriales, énfasis taurino |
| Acento metálico | Oro albero | `#B8832E` | Filetes decorativos, detalles de bordado/sello, numeración editorial |
| Contraste oscuro | Fragua / Azabache | `#161412` | Visores de contraste para hierro dorado, secciones de taller o pie de página |

### Reglas de contraste

- Texto sobre `#F7F3EA` o `#FFFDF9`: siempre `#161412` (o `#161412` al 70 % para secundarios). Nunca grises lavados por debajo de contraste AA (4.5:1).
- Texto sobre `#161412` o `#6B141E`: siempre `#F7F3EA` o `#FFFDF9`.
- El oro albero (`#B8832E`) se usa para filetes, iconos pequeños o etiquetas grandes; nunca para párrafos largos de lectura sobre fondo claro.

---

## 3. Tipografía y jerarquía

La jerarquía se construye con **contraste de escala y filetes**, no con cajas de colores ni sombras.

- **Display / Titulares (`Cinzel`, `Cormorant Garamond`):** Titulares principales, encabezados de paso (`I. PERFIL`, `II. IDENTIDAD`, `III. ESTILO Y FORJA`) y títulos de sección. Interlineado compacto (`leading-[1.05]` a `leading-[1.15]`).
- **Cuerpo e interfaz (`Inter`):** Párrafos, inputs, botones, tablas de `/admin` y descripciones de fichas. Tamaño base mínimo `15px–16px` en lectura.
- **Micro-etiquetas editoriales:** Mayúsculas, `text-[10px]` a `text-[11px]`, `tracking-[0.18em]` a `tracking-[0.22em]`, peso medio. Usadas para numeración (`01 · TRADICIONAL`), metadatos técnicos y encabezados de tabla.
- **Numeración:** Priorizar formato de archivo o lámina (`01`, `02`, `03` o romanos `I`, `II`, `III`, `IV`).

---

## 4. Geometría, bordes y texturas

- **Radios de borde:** Máximo `rounded-[2px]` o `rounded-none`. Prohibido `rounded-xl`, `rounded-2xl`, `rounded-3xl` o tarjetas con aspecto de burbuja.
- **Separadores y marcos:** Usar filetes de `1px` (`border-[#161412]/15` o `border-[#B8832E]/40`) y dobles marcos finos en láminas destacadas (efecto paspartú).
- **Sombras:** Cero sombras difusas grandes (`shadow-lg`, `shadow-xl`, `shadow-2xl`, glows de neón). Si un elemento flotante necesita separación (drawers, modales, toasts), usar borde nítido `1px` y como máximo una sombra seca mínima.
- **Textura:** Se permite grano sutil de papel (SVG `feTurbulence` al 2–3 % de opacidad) en fondos amplios, nunca sobre texto pequeño ni interfiriendo con los visores de hierros.

---

## 5. Layout y composición

- **Romper la simetría SaaS:** Evitar repetir en cadena secciones de "título centrado + subtítulo + 3 columnas iguales con icono arriba". Alternar bloques asimétricos (por ejemplo 5/7 o 4/8), franjas editoriales con filete superior e inferior y composiciones tipo catálogo.
- **Ritmo y aire:** Generoso espacio negativo alrededor de cada lámina y titular. El hierro generado es siempre el protagonista absoluto de la pantalla.
- **Responsive obligatorio:**
  - Escritorio de referencia: `1440×900`.
  - Móvil de referencia: `390×844`.
  - Cero scroll horizontal (`overflow-x-hidden` solo como salvaguarda, nunca para tapar anchos rotos).
  - Controles táctiles mínimos de `44px` de alto en móvil.

---

## 6. Movimiento y micro-interacciones

- **Carácter físico:** Transiciones sobrias, rápidas y secas (150ms–300ms, `ease-out`). Nada de rebotes infantiles ni animaciones constantes que distraigan.
- **Regla del momento único:** Como máximo una interacción protagonista por pantalla (visor comparador, lupa de detalle del hierro, cambio de soporte sobre capote/esportón/fragua).
- **Accesibilidad:** Respetar siempre `prefers-reduced-motion`.

---

## 7. Lista negra anti-IA (prohibiciones absolutas)

Cualquier componente o rediseño que incluya alguno de estos patrones debe ser rechazado y reescrito:

1. Degradados morados, azules, cian o neón en fondos, textos o botones.
2. Glassmorphism genérico (`bg-white/10 backdrop-blur-xl`) sin justificación funcional.
3. Emojis en títulos, botones, listas o mensajes de estado (usar iconos de trazo fino `1.5px` o tipografía limpia).
4. Badges con puntos parpadeantes ("● IA Activa") o píldoras multicolores tipo SaaS.
5. Copy genérico de marketing IA ("Potenciado por IA", "Revoluciona tu marca", "Lleva tu ganadería al siguiente nivel"). El tono es siempre de oficio, sobrio y castellano preciso (*forjar, lámina, trazo, hechura, divisa, avíos*).
6. Ilustraciones vectoriales genéricas de librerías SaaS (usar fotografía real de `public/images/` o láminas reales de `public/images/styles/`).
7. Exponer nunca un `<svg>` limpio del hierro o una URL/Base64 sin marca de agua en el Plan 0 €.

---

## 8. Checklist rápido para agentes antes de cerrar cambios de UI

- [ ] ¿Todos los colores salen exclusivamente de la paleta de la sección 2?
- [ ] ¿Todas las esquinas son `rounded-none` o `rounded-[2px]` y sin `shadow-xl`?
- [ ] ¿Se eliminaron todos los emojis y clichés SaaS del copy?
- [ ] ¿El hierro tiene contraste impecable sobre papel cal, capote, cuero y fragua?
- [ ] ¿Funciona limpio en `1440×900` y `390×844` sin desbordes ni errores de hidratación?
