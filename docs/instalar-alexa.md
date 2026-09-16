# Instalar Compañero diario (no está en AWS)

Luis: **no busques la skill en AWS**, ni en Lambda, ni en API Gateway, ni en el portal de 33 Digital. Ahí no está y no hay que crearla.

Está en la **Alexa Developer Console**, con la **misma cuenta Amazon** que el Echo.

Abre exactamente: [https://developer.amazon.com/alexa/console/ask](https://developer.amazon.com/alexa/console/ask)

Código: [github.com/tonyblanco/alexa-skill/pull/1](https://github.com/tonyblanco/alexa-skill/pull/1)

---

## 1. Entra

1. Entra con el **mismo email de Amazon** del Echo.
2. Si te lleva a `console.aws.amazon.com`, **cierra esa pestaña**. Eso es AWS. Vuelve al enlace de arriba.

---

## 2. Crea la skill (botones tal cual salen)

1. **Create Skill**
2. **Skill name:** `Compañero diario`
3. **Default language:** **Spanish (Spain)**
4. **Choose a model:** **Custom**
5. **Hosting:** **Alexa-hosted (Node.js)**  
   No pulses **Provision your own**. No pulses nada de API Gateway.
6. Si pide región: **Europe**.
7. Plantilla: **Start from Scratch**
8. **Create skill** (espera 1–2 minutos)

---

## 3. Pon el español

1. Pestaña **Build** (arriba)
2. A la izquierda: **JSON Editor**
3. Borra lo que haya. Pega el archivo del PR:  
   `skill-package/interactionModels/custom/es-ES.json`
4. **Save Model**
5. **Build Model** (espera a que ponga verde)

La invocación ya va dentro: **compañero diario**.

---

## 4. Pon el código

1. Pestaña **Code** (arriba)
2. En la carpeta `lambda`, deja o pega desde el PR:
   - `index.js`
   - `package.json`
   - toda la carpeta `src/`
3. **Save**
4. **Deploy** (espera a que termine)

---

## 5. Actívala en el Echo

1. Pestaña **Test** (arriba)
2. Donde ponga **Off**, elige **Development**
3. En el Echo: **Alexa, abre compañero diario**

Luego puedes decir: **comida** · **pastillas** · **caminar** · **qué hora es** · **háblame**
