# node-red-contrib-dwd-rainradar

Ein Node-RED-Node zur Nutzung des **offiziellen DWD Rain Radar** (RADOLAN).  
Der Node lädt Rasterdaten des Deutschen Wetterdienstes, verarbeitet diese und gibt strukturierte JSON-Daten zurück – ideal für Dashboards, Automationen oder Warnlogik.

---

## ✨ Features

- Offizielle **DWD RADOLAN** Niederschlagsdaten
- Unterstützt mehrere Betriebsmodi:
    - **summary** (hohe Übersichtlichkeit)
    - **grid** (Rasterdaten)
    - **image** (PNG-Visualisierung)
- Optional: **Mock-/Dummy-Backend** für lokale Tests
- Generiert kompakte **summary**-Daten (max, avg, coverage)
- Rasterausgabe (`grid`) zur Weiterverarbeitung
- Bildausgabe (`image`) zur direkten Visualisierung
- **i18n-Unterstützung** (Deutsch & Englisch)
- Auto-Aktualisierung + „Beim Deploy abrufen“
- Diagnosemodus für erweitertes Logging
- Harmonierter Aufbau mit allen anderen DWD-Nodes

---

## 📦 Installation

Im Node-RED Benutzerverzeichnis (typisch `~/.node-red`):

```bash
npm install node-red-contrib-dwd-rainradar
```

Oder über den Node-RED Paletten-Manager:

1. Node-RED Editor öffnen
2. Menü → **Palette verwalten**
3. Tab **Installieren**
4. Nach **`node-red-contrib-dwd-rainradar`** suchen
5. **Installieren** klicken

---

## 🔧 Konfiguration

### Name
Optionaler Anzeigename.

### Modus
Legt fest, welche Daten ausgegeben werden:

- `summary` – kompakte Auswertung
- `grid` – vollständiges Raster
- `image` – PNG-Ausgabe (Base64)

### Backend-URL
Adresse des verwendeten Backends:

- Offizielle DWD-RADOLAN-URL
- oder lokales Testbackend
- oder `mock-backend` (Dummy)

### Bounding Box
Optional zur Einschränkung des betrachteten Radarbereichs.

### Beim Deploy abrufen
Startet direkt nach Deploy einen ersten Abruf.

### Auto-Aktualisierung (Sekunden)
- `0` → deaktiviert
- `> 0` → periodischer Abruf

### Diagnose
Aktiviert erweitertes Logging im Node-RED-Log.

---

## 🔌 Eingänge

Jede eingehende Nachricht löst einen Abruf der Daten aus (wenn Auto-Refresh nicht aktiv ist).  
Der Inhalt der Nachricht ist irrelevant – sie dient als Trigger.

---

## 📤 Ausgänge

Beispiele:

### **summary**
```json
{
  "meta": {
    "source": "DWD Rain Radar",
    "timestamp": "2025-11-15T21:56:15.065Z",
    "mode": "summary"
  },
  "summary": {
    "hasRain": true,
    "maxIntensity": 12.3,
    "avgIntensity": 1.7,
    "coveragePercent": 42
  }
}
```

### **grid**
```json
"grid": {
  "width": 10,
  "height": 10,
  "values": [ ... ]
}
```

### **image**
```json
"image": {
  "mimeType": "image/png",
  "data": "<base64>"
}
```

---

## 🔎 Statusanzeigen

- **lade…** – Abruf läuft
- **bereit** – Node wartet
- **ok** – erfolgreich aktualisiert
- **Fehler** – Abruffehler
- **stale** – alte Daten aus Cache

---

## 🌍 Internationalisierung (i18n)

- Deutsch:
    - `nodes/locales/de/dwd-rainradar.json`
    - `nodes/locales/de/dwd-rainradar.html`
- Englisch:
    - `nodes/locales/en-US/dwd-rainradar.json`
    - `nodes/locales/en-US/dwd-rainradar.html`

Der Editor bestimmt automatisch die Sprache.

---

## 🧪 Beispiel-Flow

Beispiel:

```
examples/dwd-rainradar-basic.json
```

Import:

1. Node-RED Menü → **Importieren**
2. **Zwischenablage**
3. JSON einfügen
4. **Importieren**

---

## 🗺️ Roadmap

- Höhere Rasterauflösung
- Automatische Regionalauswahl
- Dashboard-Vorlagen
- Kombination mit Pollen, Vorhersage und Warnungen
- Intensitätsklassifizierung

---

## ⚖️ Lizenz
MIT © 2025 Gerd Rütten

---

> 🌧️ **node-red-contrib-dwd-rainradar** — bringt offizielles DWD-Niederschlagsradar direkt in deine Node-RED-Flows.
