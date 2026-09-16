# Alexa Skill

Proyecto independiente de RECOVERY-33. Plantilla mínima para una custom skill de Alexa con el ASK SDK para Node.js.

## Estructura

- `skill-package/` — manifest (`skill.json`) e interaction models (`es-ES`, `en-US`).
- `lambda/` — handler AWS Lambda (`index.js`).
- `ask-resources.json` — configuración para ASK CLI.

## Requisitos

- Node.js 18+
- Cuenta [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask)
- AWS (Lambda) o hosting compatible con el endpoint de la skill

## Desarrollo local

```bash
cd lambda
npm install
```

Antes del despliegue, sustituye en `skill-package/skill.json` el ARN de Lambda (`YOUR_AWS_ACCOUNT_ID`).

## Intents incluidos

- `LaunchRequest` — bienvenida
- `HelloWorldIntent` — respuesta de ejemplo
- `AMAZON.HelpIntent`, `AMAZON.CancelIntent`, `AMAZON.StopIntent`
