# MHAdle — Propuesta de cambios funcionales

Estado: **pendiente de aprobación**. Nada de esto está implementado. Cada punto se puede aprobar, ajustar o descartar por separado.

Referencias revisadas (2026-10-15):

- **mhadle.net**: 155 personajes, Fácil/Difícil, 8 intentos. Columnas: tipo, género, rango, facción, familia, arco y poder (↑↓). Pistas a los 3/5/7 intentos (facción, retrato borroso, inicial del nombre). También tiene ranking y anuncios.
- **mhadle.com**: clásico (tipo de don, rol, facción) + modo imagen borrosa. Con anuncios.
- **OnePiecedle / Narutodle**: columnas con varios valores ("parcial" si coincide alguno). Muestran "el personaje de ayer era…" y el contador "X personas ya lo adivinaron". Incluyen un selector de spoilers y pistas que se desbloquean a los N intentos.

---

## 1. Que la ampliación no cambie el héroe de días pasados — ✅ resuelto de otra forma

Decisión (2026-10-16): se reinician los días. El puzle nº 1 es el 2026-10-16 y se descarta el progreso diario antiguo (las rachas y estadísticas se conservan). Lo que sigue queda como referencia para futuras ampliaciones.

**Problema:** el héroe del día se elige ordenando *toda* la plantilla por un hash de la fecha. Al pasar de 37 a 96 personajes:
- cambia el héroe de muchos días del archivo;
- puede cambiar el de hoy para quien ya haya jugado.

**Propuesta:** añadir a cada personaje la fecha en que entró (`since`) y que cada día solo elija entre los personajes que ya existían. Los 37 originales llevan `since: 2026-05-01` y los nuevos la fecha de publicación. Así el pasado no cambia y la plantilla nueva entra a partir de mañana.

**Alternativa:** aceptar el cambio. Es más simple, pero el archivo deja de coincidir con lo que jugó la gente.

## 2. Selector de spoilers — ✅ implementado (2026-10-16)

Hecho: selector «Visto hasta T1–T8» en la cabecera. Limita a la vez el héroe del día y el buscador; cada nivel tiene su propio progreso guardado, y el texto compartido indica el nivel. **Pendiente:** campos «sin spoiler» por personaje (afiliaciones o alias que se revelan tarde).

- Selector "¿Hasta dónde has visto?": Temporada 1 … Temporada 8 (anime completo), guardado en el navegador.
- El héroe del día se elige solo entre personajes que debutan hasta esa temporada. Cada nivel tiene así su propio héroe diario, igual de estable para todos los que eligen ese nivel.
- El buscador solo ofrece personajes de ese nivel.
- El resultado compartido indica el nivel ("MHAdle #168 · hasta T3").
- Requiere revisar a mano los datos que destripan (afiliación final de traidores, alias revelados tarde). Propuesta: un campo opcional por personaje con el valor "sin spoiler" para niveles bajos.

## 3. Columnas del modo clásico

| Hoy | Propuesta | Motivo |
|---|---|---|
| País | **Rol**: Estudiante / Héroe profesional / Profesor / Villano / Civil | 94 de 96 son "Japonesa": la columna no aporta información. |
| Afiliación (solo exacta) | Afiliación con **"cerca"** si comparten grupo (p. ej., Clase 1-A vs 1-B → cerca: ambas son U.A.) | Hoy un alumno de 1-B contra uno de 1-A sale en rojo aunque esté muy cerca. |
| Temporada (sin flecha) | Temporada con **↑↓** | Igual que edad y altura; ayuda a acotar. |
| Edad / altura desconocidas ("¿?") | Igual, pero sin penalizar: casilla gris "desconocido" en lugar de roja | 13 personajes no tienen edad oficial y 8 no tienen altura; marcarlas como fallo engaña. |

Opcional, en una segunda fase: **Familia** (Todoroki, Midoriya, Iida, Shimura…), como hace mhadle.net. Da pistas muy buenas pero exige revisar los datos.

## 4. Pistas útiles en vez de texto de ambientación

Las pistas actuales son poco útiles ("el registro de voz coincide con alguien habituado a situaciones de presión") o revelan demasiado pronto ("Datos parciales" revela temporada y edad al 3.er intento).

Propuesta, en línea con el género:
- a los 4 intentos: **afiliación exacta**;
- a los 7: **retrato borroso**;
- a los 10: **inicial del nombre**.

El botón "Mostrar pistas" se mantiene.

## 5. Dificultad Fácil / Difícil

Con 96 personajes, un modo **Fácil** (caras que reconoce quien ha visto el anime: clase 1-A, Tres Grandes, profesores principales, villanos principales, top 10 de héroes) y un modo **Difícil** (toda la plantilla). Cada dificultad tiene su propio héroe diario y su racha.

## 6. Pequeñas mejoras de rejugabilidad (sin backend)

- **"El héroe de ayer era…"** bajo el buscador: es determinista y no necesita servidor.
- **Silueta real**: los 59 retratos nuevos tienen fondo transparente, así que se puede dibujar una silueta de verdad (forma negra) en lugar de oscurecer y difuminar la foto. Los 37 antiguos tienen fondo, así que habría que recortarlos o rehacer sus retratos desde la wiki.
- Al compartir, añadir el modo y el número de intentos en la primera línea.

## Fuera de alcance por ahora

- Contador global ("X personas lo adivinaron") y ranking: necesitan backend, justo lo que acabamos de quitar para ahorrar coste.
- **Nombre**: existen otros tres "MHAdle" (mhadle.net, mhadle.com, mhadle.vercel.app). Conviene decidirlo en la fase de captar público (SEO / diferenciación), no aquí.
