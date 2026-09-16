# Compañero diario

Skill de Alexa para **Luis Antonio Blanco**. Frases cortas, en español, desde el Echo de la mesilla.

Invocación: **compañero diario**

> **Alexa, abre compañero diario**

## En el teléfono (app Alexa)

1. **Más**
2. **Skills y juegos**
3. **Tus skills**
4. **Dev**
5. **Compañero diario** → **Activar**

Luego, al Echo: **Alexa, abre compañero diario**

Si **Dev** está vacío: crea la skill una vez como **Alexa-hosted (Node.js)** (abajo). No uses API Gateway ni el portal de 33 Digital.

## Primera vez en el ordenador (solo si Dev está vacío)

Misma cuenta Amazon que el altavoz. Idioma del Echo: **español (España)**.

1. Entra en [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask) y pulsa **Create Skill**.
2. Nombre: `Compañero diario`. Idioma: **Spanish (Spain)**. Modelo: **Custom**. Hosting: **Alexa-hosted (Node.js)** (Europa/Irlanda si sale). **No** elijas “Provision your own”.
3. Pestaña **Build** → **JSON Editor**: pega `skill-package/interactionModels/custom/es-ES.json` → **Save Model** → **Build Model**.
4. Pestaña **Code**: copia `lambda/index.js`, `lambda/package.json` y la carpeta `lambda/src/` → **Save** → **Deploy**.
5. **El clic que falta:** pestaña **Test** → “Skill testing is enabled in” → **Development**.
6. En el Echo: **Alexa, abre compañero diario**.

Si se cierra sola, los avisos nativos siguen valiendo: di **pon los recordatorios** y acepta el permiso, o en la app crea recordatorios/rutinas de desayuno, pastillas, paseo y comida.

## Qué hace

- Comida: «comida», «ya comí», «todavía no»
- Pastillas: pregunta si se las tomó; «no me acuerdo» **no** marca la toma
- Caminar: paseo suave, sin prisas
- Hora: «qué hora es»
- Compañía: «háblame»
- Emergencia: se queda con él y recuerda `Alexa, llama a…`. **No llama al 112**

## Desarrollo

```bash
cd lambda
npm install
npm test
```

Node 18+. Persistencia: en Alexa-hosted usa el bucket `S3_PERSISTENCE_BUCKET` (incluido). Sin eso, el perfil vive en la sesión.

## Frases

Luis: `comida` · `pastillas` · `caminar` · `qué hora es` · `háblame` · `estoy bien`

Una vez: `pon los recordatorios`
