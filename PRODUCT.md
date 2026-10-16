# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Fan hispanohablante casual de My Hero Academia: ha visto el anime, juega 2–3 minutos al día, sobre todo desde el móvil, y comparte su resultado. Necesita entender cada pista de un vistazo y terminar rápido.

## Product Purpose

MHAdle es un juego diario de adivinar el personaje de My Hero Academia (formato "-dle"): cada día hay un personaje oculto y cada intento se compara atributo a atributo con él. Modos actuales: Clásico (atributos), Silueta (retrato que se revela), Cita (frase del personaje) e Infinito (rondas encadenadas con vidas), más un archivo de días anteriores. Éxito = jugadores que vuelven cada día (racha) y comparten el resultado.

## Positioning

Frente a los "-dle" de MHA existentes (mhadle.net, mhadle.com, mhadle.vercel.app; en inglés, con anuncios, o hubs de muchos minijuegos), MHAdle es:

- **Español nativo y cuidado**: textos, datos y nombres pensados para el público hispano, no traducidos.
- **Con identidad de la academia U.A.**: debe sentirse propio del mundo de la serie, no una web genérica de minijuegos.
- **Ligero y sin anuncios**: rápido y limpio; el apoyo es voluntario vía Ko-fi / Patreon.
- **Un solo juego muy pulido**, no un hub.

## Operating Context

- Proyecto fan no oficial (IP de Kohei Horikoshi / Shueisha / Bones); la monetización se limita a donaciones voluntarias.
- Reset diario a las 00:00 UTC; el personaje del día se calcula en el cliente con hash(fecha:id), así que los `id` de personaje no deben cambiar nunca.
- Progreso, rachas y estadísticas viven en `localStorage` del jugador; no hay cuentas ni backend.
- Desplegado en Coolify (mhadle.kaizenith.es) como app TanStack Start con datos estáticos.

## Capabilities and Constraints

- Datos de personajes en `src/data/characters.json`; retratos en `src/assets/characters/<id>.webp`.
- Atributos comparados hoy: género, edad, altura, tipo de don, afiliación, nacionalidad, temporada de debut.
- Decisión del usuario: ampliar la plantilla a ~100 personajes.
- Decisión del usuario: los datos deben poder filtrarse por spoilers (selector de hasta dónde ha visto el jugador). Pendiente de diseño funcional y aprobación.
- Los cambios de funcionalidad se proponen y se aprueban antes de implementarse; los cambios visuales y la ampliación de datos pueden aplicarse directamente.

## Brand Commitments

- Nombre: MHAdle. Créditos/soporte: Kaizenith, ko-fi.com/kaizenith, patreon.com/kaizenithcore, hola@kaizenith.es.
- Aviso visible "Hecho por fans · No oficial".
- Estética deseada por el usuario: la de la academia U.A. (Yuuei).

## Evidence on Hand

- 37 personajes con retrato y cita (ampliación a ~100 en curso). No existen datos de uso ni testimonios; no inventarlos.

## Product Principles

1. Una pista se entiende de un vistazo en el móvil.
2. Español primero: ningún texto suena a traducción.
3. Ligereza antes que adornos: sin anuncios, carga rápida.
4. Un juego diario impecable antes que muchos modos a medias.
5. Precisión de datos: un dato dudoso es peor que un dato ausente.
