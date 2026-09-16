# Compañero diario

Skill de Alexa para personas mayores que viven solas o dependen de un cuidador. El cuidador configura una vez. El mayor habla con frases cortas, en español, desde el Echo de la mesilla.

Invocación: **compañero diario** (`Alexa, abre compañero diario`).

Producto e investigación: el plan vive fuera de este repo en el Agent Store del proyecto (`docs/skill-mayores.md`). Este README es la guía de código.

## Qué hace (V1)

- Check-in: «estoy bien» / «no estoy bien»
- Pastillas: pregunta si se las tomó; «no me acuerdo» **no** marca la toma
- Compañía: textos cortos originales
- Emergencia: se queda con la persona y recuerda `Alexa, llama a…`. **No llama al 112**
- Configuración por voz: «configura»
- Recordatorios ASK opcionales (el cuidador dice que sí al permiso)

## Estructura

- `skill-package/` — manifiesto e interaction models (`es-ES`, `en-US`)
- `lambda/` — ASK SDK v2 (`index.js` + `src/` + `test/`)
- `ask-resources.json` — ASK CLI

## Desarrollo

```bash
cd lambda
npm install
npm test
```

Node 18+. Antes de desplegar, sustituye `YOUR_AWS_ACCOUNT_ID` en `skill-package/skill.json`.

Persistencia DynamoDB: opcional, variable `COMPANERO_TABLE`. Sin ella, el perfil vive en la sesión.

## Frases

Mayor: `estoy bien` · `pastillas` · `háblame` · `emergencia` · `repite` · `adiós`

Cuidador (una vez): `configura` · `pon los recordatorios`

## Requisitos

- Cuenta [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask)
- AWS Lambda (o endpoint compatible)
- El Echo debe estar en una cuenta que el **cuidador** pueda administrar
