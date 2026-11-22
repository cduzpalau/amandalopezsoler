# Contact Form Setup (Google Sheets + Google Apps Script)

This connects the static website's contact form directly to Amanda's own **Google Sheet** (for follow-up tracking) and **Gmail** (`lopezsoleramanda@gmail.com`), at zero cost and without any third-party service.

## Steps (3 minutes)

1. Sign in to Google Drive with **`lopezsoleramanda@gmail.com`** and create a new **Google Sheet** (e.g., named `Consultas Web - Amanda López Soler`).
2. In the Google Sheet menu, click **Extensions → Apps Script** (*Extensiones → Apps Script*).
3. Delete the placeholder `myFunction()` code and paste the full contents of [`Code.gs`](./Code.gs).
4. Click **Save** (`Ctrl+S` / `Cmd+S`).
5. Click **Deploy → New deployment** (*Implementar → Nueva implementación*).
   - Click the gear icon next to *Select type* and choose **Web app** (*Aplicación web*).
   - **Description**: `Formulario web v1`
   - **Execute as** (*Ejecutar como*): **Me** (`lopezsoleramanda@gmail.com`)
   - **Who has access** (*Quién tiene acceso*): **Anyone** (*Cualquier persona*)
6. Click **Deploy**, then **Authorize access**:
   - Choose `lopezsoleramanda@gmail.com`.
   - If Google shows *"Google hasn't verified this app"*, click **Advanced → Go to ... (unsafe) → Allow** (this is your own private script).
7. Copy the generated **Web app URL** (it looks like `https://script.google.com/macros/s/AKfycb.../exec`).
8. Open [`js/config.js`](../js/config.js) in this repository and paste that URL into `contactFormEndpoint`:
   ```js
   contactFormEndpoint: "https://script.google.com/macros/s/AKfycb.../exec",
   ```
9. Commit and push!

## What happens on each submission
- A new row is added to the **`Consultas`** tab with: `Fecha | Nombre | Teléfono | Correo electrónico | Mensaje | Idioma | Estado (Pendiente) | Notas`.
- Amanda receives an instant email in Gmail where clicking **Reply** replies directly to the visitor's email address.
- Bot submissions that fill the hidden honeypot field are silently ignored.
