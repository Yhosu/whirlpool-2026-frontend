Actúa como un Frontend Tech Lead especializado en React, Tailwind CSS, TypeScript y animación UI interactiva.

Necesito migrar y evolucionar este prototipo HTML/JS de la landing page promocional "Whirlpool Special Days — Dismac" a una Single Page Application en React con TypeScript y Tailwind CSS, aplicando Clean Architecture, diseño por componentes modulares y dotándola de animaciones fluidas, microinteracciones vivas y feedback visual de alto impacto (estilo gamificado pero premium).

---

### 1. Stack & Dependencias Sugeridas
- React 18+ con TypeScript.
- Tailwind CSS (configurado con los tokens de color y tipografía de la marca).
- `framer-motion` para la orquestación de animaciones complejas (giro del tambor, apertura de compuerta 3D, eyección de cápsula, confetti/partículas de victoria, transiciones entre estados de formulario).
- `canvas-confetti` para la celebración al salir el premio.
- `lucide-react` para iconografía limpia y consistente.
- Google Fonts: Anton (display/titulares rústicos e impactantes), Pacifico (script para "days"), Manrope (body UI legible).

---

### 2. Estructura de Componentes Modular
Organiza el código en componentes desacoplados con contratos de Props tipados:

1. `SpecialDaysApp.tsx`: Contenedor principal que maneja el scroll suave, refs para auto-scroll y el estado global del flujo de juego/sorteo.
2. `HeroSection.tsx`:
   - Fondo radial vibrante con rayos giratorios suaves de fondo (`spin-slow` infinito en SVG o CSS).
   - Badge "Marca Americana" (bandera/escudo vectorizado limpio con clip-path).
   - Lockup tipográfico de impacto: "SPECIAL" con stroke oscuro, "days" en script cursiva destacada.
   - Badge rotado 3D flotante: "Gana hasta Bs. 3.000".
3. `WashingMachineWheel.tsx` (Componente estrella interactivo):
   - Chasis realista con degradados metálicos, biselados y sombras volumétricas.
   - Panel de control digital: Display LED de 7 segmentos / monoespaciado retroiluminado con estados de mensaje ("Listo para girar", "Centrifugando…", "Enjuagando…", "Premio listo!").
   - Indicadores LED animados (pulsantes, secuenciales durante el lavado).
   - Tambor giratorio con efecto 3D: Cápsulas de premios doradas y esferas de colores distribuidas radialmente que rotan y vibran mediante `framer-motion` o CSS transforms durante el ciclo.
   - Puerta frontal de cristal con reflejo especular que se abre en perspectiva 3D (`transform-style: preserve-3d`, `rotateY(-115deg)`).
   - Hatch / Eyección: Cápsula ganadora que emerge con rebote elástico (`type: "spring"`), brillo/aura radiante y explosión de confetti.
4. `ChannelSelectorModal.tsx` o `ParticipationDrawer.tsx`:
   - Selector visual de tarjetas entre: "Compraste en Dismac" y "Compraste en Mercado / Distribuidor".
   - Transición animada (`AnimatePresence`) hacia los formularios correspondientes.
5. `DismacForm.tsx`:
   - Validación en tiempo real y autoformateo de código de factura (máscaras para A1-B2-C3-D4), CI y Celular con mensajes de error animados.
6. `MercadoForm.tsx`:
   - Formateo automático de código promocional `WP-XXXXXX` con stepper visual de pasos guiados.
7. `PrizeResultModal.tsx`:
   - Ticket de canje digital estilo recibo con bordes dentados o degradados premium, botón de compartir/guardar y detalles de vigencia.
8. `HowItWorksSection.tsx`: Stepper de pasos ordenados con cards hoverables interactivas.
9. `CoverageCities.tsx`: Grid de ciudades con badges de ubicación.
10. `XpertTechCatalog.tsx`: Acordeones interactivos o tabs para las tecnologías de Lavado y Refrigeración Whirlpool, con iconos SVG limpios y badges XPERT.
11. `FaqSection.tsx`: Acordeón accesible (`details`/`summary` o `framer-motion`) con respuesta expansible suave y tags de premios.
12. `Footer.tsx`: Enlaces legales y marcas registradas.

---

### 3. Dinámica del Sorteo y Estados de la Máquina
Maneja una máquina de estados finita (`idle` | `washing` | `opening` | `awarding` | `claimed`):
- Probabilidad ponderada de premios:
  - Bs. 100 (peso 47)
  - Bs. 250 (peso 28)
  - Bs. 500 (peso 14)
  - Bs. 1.000 (peso 7)
  - Bs. 2.000 (peso 3)
  - Bs. 3.000 (peso 1)
- Lógica de persistencia en `localStorage` o `Set` en memoria para evitar repetición de códigos usados con feedback claro.
- Sonido opcional / Micro-vibraciones hápticas (si el navegador lo soporta `navigator.vibrate`).

---

### 4. Requisitos de Estilo y "Toque Vivo"
- No debe verse plano ni estático: agrega sutiles microanimaciones `float`, reflejos luminosos (`shimmer`), estados `hover` y `active` con escalado `scale-105` y sombras de colores (`shadow-amber-500/20`).
- Colores base:
  - Amarillo primario Whirlpool Special: `#FDC32B`, acento `#FFD95E`, sombra `#F0A81C`.
  - Fondo papel cálido: `#FFFBF0`.
  - Oscuro carbón: `#101010` y `#1E1E1E`.
- Totalmente responsive (Mobile-First): la lavadora debe escalar fluidamente con `clamp` o medidas proporcionales (`aspect-square max-w-[380px]`) asegurando que los controles y el tambor no se distorsionen en pantallas pequeñas.

---

Genera el código completo, limpio y listo para producción, con tipado TypeScript estricto, separando adecuadamente los hooks de animación o lógica del sorteo si es necesario.