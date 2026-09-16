# Compañero diario

Skill de Alexa para **Luis Antonio Blanco**. Él es el usuario del Echo, 67 años, en casa, movilidad reducida, con una urgencia médica a sus espaldas. Depende del altavoz para las comidas, las pastillas y un paseo suave. A veces la skill se calla: por eso los recordatorios nativos de Alexa son la red de seguridad.

**Invocación (es-ES):** `compañero diario`  
**Invocación (en-US, secundaria):** `daily companion`  
**Nombre público:** Compañero diario  
**Repo:** [tonyblanco/alexa-skill](https://github.com/tonyblanco/alexa-skill)  
**Alojamiento:** Alexa-hosted (Node.js). **No** API Gateway ni Lambda de pago.

Frase para abrirla: **Alexa, abre compañero diario**

Tarjeta de instalación (toques en la app): [tarjeta-instalar.md](./tarjeta-instalar.md)

---

## Concepto

Un compañero de mesilla que estructura el día de Luis en cinco piezas:

1. **Comidas** (desayuno, comida, cena) — se le va la hora
2. **Pastillas** (mañana y noche) — check-in, no alarma ciega
3. **Paseo suave / moverse un poco** — sin prisas, por la movilidad
4. **Qué hora es**
5. **Compañía** («háblame»)

Luis no instala nada. No abre la app. Dice cosas cortas:

- «Alexa, abre compañero diario»
- «comida» / «ya comí»
- «pastillas» / «me las tomé» / «no me acuerdo»
- «caminar» / «ya me he movido»
- «qué hora es»
- «háblame»
- «estoy bien»

El reloj de pulso es **extra opcional**. Ver [reloj-salud.md](./reloj-salud.md).

### Por qué no otras ideas

| Idea | Por qué no |
| --- | --- |
| Solo alarmas nativas | Una alarma no pregunta si se tomó las pastillas; puede haber doble toma. |
| «Llama al 112» desde la skill | Una custom skill **no es urgencias**. Nunca lo prometemos. |
| API Gateway / portal de pago (~125 €/mes) | Luis lo borraría. Alexa-hosted cubre el backend gratis. |
| Enfermera con constantes del reloj | El Echo no lee el reloj. El reloj queda como extra. |

Alexa Together se discontinuó el 21 de mayo de 2025. Emergency Assist no cubre el día ordinario.

---

## Fiabilidad: cuando la skill se calla

Una skill custom deja de escuchar a los pocos segundos. Eso es lo que Luis nota como «se paró el vigilante».

**Red de seguridad (nativa, no depende de la sesión):**

1. Dentro de Compañero: «pon los recordatorios» y aceptar el permiso. Crea avisos nativos de Alexa: desayuno (8h), pastillas mañana (9h), paseo suave (11h), comida (14h), pastillas noche (21h). El texto nombra la tarea, no solo «abre la skill».
2. En la app de Alexa, el mismo usuario puede crear **Recordatorios** o **Rutinas** con el mismo mensaje. Siguen sonando aunque la skill esté cerrada o el Test se apague.
3. «Alexa, qué hora es» nativo también vale si Compañero no está abierto.

Nunca afirmar que la skill llama al 112.

---

## Cómo dejarla en el Echo de Luis (una vez)

Misma cuenta Amazon que el altavoz. Idioma del Echo: **español (España)**. **No** API Gateway.

**En la app Alexa:** Más → Skills y juegos → Tus skills → **Dev** → **Compañero diario** → **Activar**.

**En el Echo:** «Alexa, abre compañero diario».

Si la pestaña Dev está vacía, créala una vez como **Alexa-hosted (Node.js)** (pasos en [tarjeta-instalar.md](./tarjeta-instalar.md)). Luego el clic de consola: pestaña **Test** → **Development**.

Sin Test=Development, el aparato no oye la skill de desarrollo.

---

## Principios de voz

1. Frases de 1–4 palabras.
2. Check-in, no alarma. «¿Ya comiste?» / «¿Te tomaste las pastillas?» Esperar sí, no, o «no me acuerdo».
3. Un turno, una pregunta.
4. Tono adulto. Tutear con respeto.
5. «Repite» y Fallback vuelven a la última pregunta.
6. No es un dispositivo médico. No promete el 112.
7. Español primero (`es-ES`).

---

## Vocabulario mínimo (Luis)

| Intención | Lo que dice | Lo que hace |
| --- | --- | --- |
| Abrir | «Alexa, abre compañero diario» | Saludo + lo que toca (comida, pastillas, paseo, hora) |
| Comida | «comida», «ya comí», «todavía no» | Confirma desayuno/comida/cena |
| Pastillas | «pastillas», «me las tomé», «no me acuerdo» | Confirma, pospone o marca inseguro |
| Caminar | «caminar», «ya me he movido» | Paseo suave, sin prisas |
| Hora | «qué hora es» | Dice la hora (Europe/Madrid) y lo que toca |
| Compañía | «háblame» | Texto corto curado |
| Estoy bien / mal | «estoy bien», «mal» | Check-in |
| Emergencia | «emergencia» | Calma + «Alexa, llama a…». **No** 112 |
| Parar | «para», «adiós» | Cierre breve |

Una vez: «pon los recordatorios».

---

## Fuera de alcance

- Llamar al 112 desde la skill
- Diagnóstico o dosis
- API Gateway, account linking, pagos
- Que Luis use la app de Alexa a diario
- El reloj como requisito (es extra)

## Criterios de éxito

- Luis completa comida, pastillas y paseo con frases cortas.
- Si la skill se calla, un recordatorio nativo sigue nombrando la tarea.
- Ninguna frase promete el 112.
- Tests: `cd lambda && npm test`.
---
