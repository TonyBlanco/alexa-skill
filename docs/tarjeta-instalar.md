# Tarjeta: instalar Compañero diario

Para **Luis**. Misma cuenta Amazon que el Echo. Idioma: **español (España)**.  
**No** abras API Gateway ni el portal de 33 Digital.

---

## En el teléfono (app Alexa)

1. Abre la app **Amazon Alexa**
2. Abajo a la derecha: **Más**
3. **Skills y juegos**
4. Arriba: **Tus skills**
5. Pestaña **Dev**
6. Toca **Compañero diario** → **Activar**

Si **Dev** está vacío, aún falta crear la skill una vez en el ordenador (Alexa-hosted, ver abajo). Luego vuelve a estos toques.

---

## En el Echo, di exactamente:

**Alexa, abre compañero diario**

Luego, si quieres:

- **comida**
- **pastillas**
- **caminar**
- **qué hora es**
- **háblame**

Para que avise aunque se calle: **pon los recordatorios** → cuando pregunte, di **sí**.

---

## Solo si Dev está vacío (ordenador, una vez)

1. [developer.amazon.com/alexa/console/ask](https://developer.amazon.com/alexa/console/ask) → **Create Skill**
2. Nombre: `Compañero diario` · Spanish (Spain) · Custom · **Alexa-hosted (Node.js)**  
   No elijas “Provision your own”. No crees API Gateway.
3. Pega el modelo `es-ES.json` y el código de `lambda/` → **Deploy**
4. Pestaña **Test** → **Development**
5. Vuelve a la app: **Más → Skills y juegos → Tus skills → Dev → Activar**
