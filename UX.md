# UX.md · MI HIERRO

## Cómo piensa realmente tu cliente al entrar en /forjar

A tu web llegan dos perfiles muy distintos, y el flujo actual solo atiende a medias a cada uno:

**El explorador (70 % de tus visitas):** Tiene claras sus iniciales (AV, JP, MR) y busca algo serio y con clase, pero no sabe si le gusta más un asa de caldera, un arco o un monograma desnudo hasta que ve sus letras dibujadas. Si le obligas a elegir remates, arcos o coronas antes de ver nada, se bloquea o marca opciones al azar que luego arruinan el resultado.

**El que ya trae una idea fija (30 %):** Sabe exactamente lo que quiere ("mis iniciales dentro de un escudo almenado" o "una cruz arriba en recuerdo de mi abuelo"). Si no le das un sitio claro donde indicarlo antes de forjar, siente que ha malgastado su primer intento gratis en algo que no pidió.

A eso se suma una fricción psicológica enorme: nadie acepta el primer boceto de un hierro definitivo sin pedir al menos un ajuste. Si el cliente ve 3 propuestas, una le encanta "casi del todo", pero no tiene forma de decir "me quedo con esta, pero ponle un arco arriba" o "quítale la cruz y hazla más limpia", siente que la app es una lotería y no un taller.

## El flujo ideal pensado 100 % para el cliente

La solución más natural —y la que mejor convierte a pago— no es ni poner un formulario interminable al principio, ni montar un editor de pegatinas donde se superponen coronas falsas encima del dibujo (eso rompe el grosor de la pletina y hace que el hierro pierda toda la solera artesanal).

La mejor experiencia tiene dos fases separadas: **Explorar primero, Afinar después.**

### 1. Entrada limpia (mínima fricción, control opcional)

Quita los remates del Paso I. Antes de la primera forja, el cliente solo decide lo esencial:

- Para quién es (Ganadería / Yeguada PRE / Novillero) — define el tono y los avíos del visor.
- Iniciales (1 a 3 letras).
- Familia de estilo (Tradicional, Monograma, Geométrico, Heráldico) eligiendo por ojo sobre tus láminas reales.
- Bloque plegable u opcional justo debajo: "¿Tienes algún remate en mente? (Opcional)" con "A criterio del maestro" marcado por defecto y chips coherentes solo con esa familia (por ejemplo, en Tradicional: asa de caldera, arco ganadero, cruz de forja; en Heráldico: escudo español, barra almenada; en Monograma: solo tipos de enlace, jamás coronas) + tus Notas para el maestro.

Con esto, el explorador pulsa Forjar en 20 segundos sin pensar demasiado, y el que trae una idea fija la marca a la primera sin pelearse con el sistema.

### 2. El taller de afinado paso a paso (justo después de ver las 3 fichas)

Cuando aparecen las 3 propuestas y el cliente marca su favorita, le das dos salidas claras:

- Botón principal: "Ver este hierro en mis avíos" (salta directo al capote, esportón, fragua y Story).
- Acción secundaria muy visible: "Afinar esta lámina" (el paso a paso que buscas).

Al abrir Afinar esta lámina, no borras su trabajo ni le devuelves al principio. Le muestras su hierro elegido a la izquierda y a la derecha unos botones de ajuste de oficio:

- + Añadir arco ganadero
- + Añadir cruz de forja
- + Añadir barra almenada (solo si encaja o cambia a heráldico)
- Más sobrio / quitar adornos
- Trazo más recio / Más estilizado
- Campo de texto rápido: "Ej. junta un poco más la A y la V".

Por debajo, Gemini toma el prompt exacto de esa ficha favorita + el cambio pedido y Recraft forja la nueva pieza soldada de verdad (nunca pegatinas).

## Por qué este diseño dispara tus ventas y cuida tus costes

| Momento del cliente | Qué siente el cliente | Qué ganas tú en negocio y costes |
| :--- | :--- | :--- |
| 1ª forja gratis (3 propuestas) | "Efecto Wow": ve por primera vez sus iniciales convertidas en 3 hierros serios y distintos. | Enganche inmediato sin haberle abrumado con 10 preguntas previas. |
| 2ª forja gratis (Afinar su favorita) | Efecto propiedad: al pedir "ponle una cruz" y ver que el taller le obedece, siente que ese hierro lo ha diseñado él. | Al afinar una ficha elegida puedes generar 1 o 2 láminas en vez de 3, ahorrando entre un 33 % y un 66 % de créditos de Recraft por iteración. |
| Límite real por sesión (BD) | Cuando agota sus 2 intentos, ya tiene su hierro casi perfecto sobre el capote con marca de agua. | Al no poder hacer trampas recargando la página, el paso a pagar 9,99 € o 19,90 € se vuelve el camino lógico para llevárselo limpio y seguir afinando si quiere. |

Un matiz importante sobre Recraft cuando afinas: aunque Gemini le pase la descripción exacta del hierro que le gustó, los modelos de imagen no siempre clonan el trazo al 100 % píxel a píxel, sino que hacen una reinterpretación muy fiel con el cambio pedido. Por eso conviene redactar el botón con lenguaje honesto de taller ("Reforjar variante con este ajuste") para que el cliente espere una nueva prueba basada en su favorita y no un simple botón de "pegar pegatina".
