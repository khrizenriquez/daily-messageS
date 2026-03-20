# Daily Message — WhatsApp Auto Sender

Aplicación local (Node.js) que envía automáticamente 2 mensajes de WhatsApp al día desde tu número personal a otro número. Los mensajes se seleccionan aleatoriamente de un pool de 1000 mensajes motivacionales y amorosos en español, sin repetir hasta agotar el pool.

## ¿Cómo funciona?

1. Usa **whatsapp-web.js** para controlar WhatsApp Web desde tu Mac
2. La primera vez, escaneas un código QR en tu terminal (igual que cuando abres WhatsApp Web en el navegador)
3. La sesión queda guardada localmente — no vuelve a pedir QR
4. Un cron job envía un mensaje a las **8:00 AM** y otro a las **6:00 PM**
5. Cada envío tiene un delay aleatorio de 1-5 minutos para parecer más natural
6. Los mensajes se seleccionan aleatoriamente y no se repiten hasta agotar los 1000

## Requisitos

- **macOS** (probado en macOS, pero funciona en Linux/Windows también)
- **Node.js 18+** — [Descargar aquí](https://nodejs.org/)
- **WhatsApp** activo en tu teléfono
- Tu Mac debe estar **encendida y sin suspensión** en los horarios de envío

## Instalación paso a paso

### 1. Clonar el repositorio

```bash
git clone <tu-repo-url>
cd daily-message
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar el número destino

Copia el archivo de ejemplo y edítalo:

```bash
cp .env.example .env
```

Edita `.env` con tu editor preferido:

```env
# Número destino con código de país, sin espacios ni guiones ni +
# Ejemplo Guatemala: 50212345678
# Ejemplo México: 5215512345678
TARGET_PHONE=50212345678

# Horarios de envío (formato cron: minuto hora)
MORNING_HOUR=8
MORNING_MINUTE=0
EVENING_HOUR=18
EVENING_MINUTE=0

# Delay aleatorio máximo en minutos (para parecer más natural)
MAX_DELAY_MINUTES=5
```

### 4. Primera ejecución — Vincular WhatsApp

```bash
npm start
```

La primera vez verás un **código QR en tu terminal**:

1. Abre WhatsApp en tu teléfono
2. Ve a **Configuración → Dispositivos vinculados → Vincular dispositivo**
3. Escanea el QR que aparece en la terminal
4. Espera a que diga `Cliente WhatsApp listo!`

La sesión queda guardada en `.wwebjs_auth/` — no necesitas volver a escanear el QR.

### 5. Verificar que funciona

Puedes hacer una prueba manual sin esperar al cron:

```bash
npm test
```

Esto enviará un mensaje de prueba inmediatamente al número configurado.

### 6. Mantener corriendo en segundo plano

Para que el proceso sobreviva al cierre de terminal:

#### Opción A: Usando el script incluido

```bash
chmod +x start.sh
./start.sh
```

Esto corre el proceso en segundo plano y guarda logs en `daily-message.log`.

Para detenerlo:

```bash
./start.sh stop
```

Para ver los logs:

```bash
./start.sh logs
```

#### Opción B: Usando LaunchAgent de macOS (recomendado)

Esto hace que el proceso inicie automáticamente al encender tu Mac:

```bash
# Copiar el archivo de LaunchAgent
cp com.duku.daily-message.plist ~/Library/LaunchAgents/

# Editar la ruta del proyecto en el archivo (reemplazar TU_USUARIO)
nano ~/Library/LaunchAgents/com.duku.daily-message.plist

# Cargar el agente
launchctl load ~/Library/LaunchAgents/com.duku.daily-message.plist
```

Para detenerlo:

```bash
launchctl unload ~/Library/LaunchAgents/com.duku.daily-message.plist
```

## Estructura del proyecto

```
daily-message/
├── .env.example          # Plantilla de configuración
├── .env                  # Tu configuración (no se sube a git)
├── .gitignore            # Archivos excluidos de git
├── package.json          # Dependencias y scripts
├── README.md             # Este archivo
├── start.sh              # Script para correr en segundo plano
├── com.duku.daily-message.plist  # LaunchAgent macOS (opcional)
├── messages.json         # Pool de 1000 mensajes
└── src/
    ├── index.js           # Punto de entrada + cron scheduling
    ├── whatsappClient.js  # Wrapper del cliente WhatsApp
    └── messageSelector.js # Selección aleatoria sin repetición
```

## Archivos generados en runtime

Estos archivos se crean automáticamente y no se suben a git:

- `.wwebjs_auth/` — Sesión de WhatsApp (para no pedir QR cada vez)
- `sent-log.json` — Registro de mensajes enviados (para no repetir)
- `daily-message.log` — Logs del proceso (si usas `start.sh`)

## Los mensajes

El archivo `messages.json` contiene 1000 mensajes organizados por categoría:

- **buenos_dias** (~250) — Para el envío de las 8:00 AM
- **buenas_tardes** (~250) — Para el envío de las 6:00 PM
- **motivacionales** (~250) — Se usan en cualquier horario
- **amorosos** (~250) — Se usan en cualquier horario

El sistema selecciona un mensaje de la categoría apropiada (mañana/tarde) + uno motivacional o amoroso, y no repite hasta agotar esa categoría.

## Personalización

### Cambiar horarios

Edita las variables `MORNING_HOUR`, `MORNING_MINUTE`, `EVENING_HOUR`, `EVENING_MINUTE` en `.env`.

### Agregar más mensajes

Edita `messages.json` y agrega mensajes a cualquier categoría. El formato es:

```json
{
  "buenos_dias": [
    "Buenos días, espero que hoy sea un gran día para ti",
    "..."
  ]
}
```

### Resetear el pool de mensajes

Si quieres que vuelva a enviar mensajes que ya envió:

```bash
rm sent-log.json
```

## Troubleshooting

### El QR no aparece
- Asegúrate de tener Node.js 18+: `node --version`
- Intenta borrar la sesión: `rm -rf .wwebjs_auth/` y volver a ejecutar

### El mensaje no se envía
- Verifica que el número en `.env` tenga el formato correcto (código de país + número, sin +, sin espacios)
- Revisa los logs: `cat daily-message.log` o la salida de la terminal
- Verifica que tu WhatsApp siga vinculado (revisa en tu teléfono → Dispositivos vinculados)

### La sesión se desvincula
- WhatsApp puede desvincular dispositivos inactivos después de ~14 días
- Si pasa, simplemente ejecuta `npm start` y escanea el QR de nuevo

### La Mac se suspende y no envía
- Configura tu Mac para no suspenderse: **Preferencias del Sistema → Ahorro de Energía → Impedir que la computadora entre en reposo automáticamente**
- O usa `caffeinate` antes de correr: `caffeinate -s npm start`

## Costos

$0 — Todo es local y gratuito:
- whatsapp-web.js es open source
- No usa la API de WhatsApp Business (que cobra por mensaje)
- No requiere servidor en la nube

## Consideraciones importantes

1. **Riesgo de bloqueo**: WhatsApp puede detectar automatización. Con solo 2 mensajes al día y delay aleatorio, el riesgo es muy bajo, pero existe. Úsalo bajo tu responsabilidad.
2. **No es una API oficial**: whatsapp-web.js puede dejar de funcionar si WhatsApp cambia su web client.
3. **Proyecto personal**: Este proyecto es para uso personal. No lo uses para spam o marketing.
