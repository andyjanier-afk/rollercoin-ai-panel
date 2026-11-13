# Conectar OneDrive personal al panel RollerCoin AI

Esta función permite abrir `expediciones.xlsm` directamente desde Microsoft OneDrive dentro de la página de Vercel. Mantiene lectura **solo del archivo**, sin ejecutar VBA, sin escribir en OneDrive, sin importar registros masivamente a Supabase.

## Configuración inicial del propietario

1. Ir a [Microsoft Entra admin center](https://entra.microsoft.com/) y registrar una nueva aplicación para cuentas **personales de Microsoft**. Seleccionar `Personal Microsoft accounts only` si la opción aparece, o cuentas personales y organizativas.
2. En **Authentication**, agregar plataforma **Single-page application (SPA)** con la URI de retorno EXACTA: `https://rollercoin-ai-panel.vercel.app/`. El tipo SPA es importante para que Microsoft permita intercambiar el código OAuth desde el navegador mediante PKCE.
3. En **API permissions**, agregar **Microsoft Graph → Delegated permissions → Files.Read**. No agregar un client secret para esta aplicación pública.
4. Copiar **Application (client) ID** (es un identificador público, no una contraseña).
5. En Vercel, configurar en el frontend la variable de entorno `VITE_MICROSOFT_CLIENT_ID` con ese ID. Volver a desplegar el frontend.
6. Abrir la web, pulsar **Seleccionar expedición del Excel → Conectar mi OneDrive** y autorizar acceso de lectura desde tu cuenta Microsoft.
7. Buscar `expediciones` (o parte del nombre), elegir `expediciones.xlsm` y pulsar **Cargar**. Cuando el archivo cambie en OneDrive, pulsar **Actualizar archivo**.

## Límites y seguridad

- No guardar tokens de Microsoft en el código ni en Vercel. El token de acceso se almacena temporalmente en **sessionStorage** en el propio navegador y expira.
- Se utiliza OAuth 2.0 authorization code + PKCE (sin client secret).
- Cada usuario debe autorizar su cuenta Microsoft; sin una sesión conectada, el navegador no puede consultar OneDrive privado.
- Los datos del Excel se procesan en el navegador; una fila solo pasa a Supabase si se pulsa la opción para registrar esa fila y se confirma.
- Si falta el Client ID, el sistema conserva la carga manual de archivos `.xlsm` y `.xlsx` y explica cómo activar OneDrive.
- Microsoft Graph podría necesitar consentimiento adicional según la configuración de la cuenta; la app muestra los errores si los permisos no bastan.
- Las fechas calculadas mediante `TODAY()` o `NOW()` no se guardan sin confirmación manual.

Referencia: [Microsoft Identity Platform: authorization code + PKCE para SPA](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow), [Microsoft Graph archivos OneDrive](https://learn.microsoft.com/en-us/graph/api/driveitem-get-content).
