# Container Ritz – Materialscanner

## Deployment in 5 Schritten (kein Programmieren nötig!)

---

### Schritt 1: GitHub Account
1. Gehe auf **github.com** → "Sign up" → kostenlosen Account erstellen
2. Oben rechts: **"New repository"**
3. Name: `container-ritz-scanner`
4. **"Create repository"** klicken

---

### Schritt 2: Dateien hochladen
1. Im neuen Repository: **"uploading an existing file"** klicken
2. Diese ZIP-Datei entpacken
3. **ALLE Dateien und Ordner** per Drag & Drop hochladen
4. Unten: **"Commit changes"** klicken

---

### Schritt 3: Vercel Account
1. Gehe auf **vercel.com** → "Sign up" → mit GitHub einloggen
2. **"New Project"** klicken
3. Dein Repository `container-ritz-scanner` auswählen
4. **"Deploy"** klicken (alles automatisch!)

---

### Schritt 4: API-Key eintragen (NUR EINMAL!)
1. In Vercel: dein Projekt → **"Settings"** → **"Environment Variables"**
2. Neue Variable hinzufügen:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** dein sk-ant-... Key
3. **"Save"** klicken
4. Oben: **"Deployments"** → **"Redeploy"**

---

### Schritt 5: URL teilen
Vercel gibt dir eine URL wie: `container-ritz-scanner.vercel.app`

**An Mitarbeiter schicken** – die öffnen sie im Handy-Browser.

Auf dem iPhone: Teilen → "Zum Home-Bildschirm" → sieht aus wie eine App!
Auf Android: Menü → "App installieren" oder "Zum Startbildschirm"

---

## Preise ändern
Schreib einfach im Chat: *"Bauschutt 1 kostet jetzt 50 €"*
→ Neue ZIP erstellen → auf GitHub hochladen → Vercel deployed automatisch

---

## Kosten
- GitHub: kostenlos
- Vercel: kostenlos
- Anthropic API: ca. 0,01–0,03 € pro Scan
