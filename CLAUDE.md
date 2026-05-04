# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Run in development:**
```powershell
# Server (Flask + PyWebView desktop window)
py -3.11 main.py

# Client (connects to remote server via LAN)
py -3.11 client.py
```

**Build executables:**
```batch
build.bat
```
Produces `dist\KS_Production_Server\KS_Server.exe` and `dist\KS_Production_Client\KS_Client.exe` via PyInstaller.

**Install dependencies:**
```powershell
py -3.11 -m pip install -r requirements.txt
```

There are no automated tests or linting configured.

## Architecture

This is a **two-tier desktop application**: a Flask/SQLite server embedded in PyWebView, plus a thin client that connects to it over LAN.

### Entry points

| File | Role |
|------|------|
| `main.py` | Starts Flask server on `127.0.0.1:5000` and opens a PyWebView window pointing at it |
| `client.py` | Opens a PyWebView window pointing at a remote server (IP read from `server_config.ini`) |
| `app.py` | All 91 Flask routes and business logic (~4 400 lines) |
| `database.py` | SQLAlchemy ORM — 18+ model classes |

### Request flow

```
PyWebView (Chromium) → Flask (app.py) → SQLAlchemy → SQLite
                                      ↘ Jinja2 templates → HTML
                                      ↘ ReportLab/Weasyprint → PDF bytes
```

### Authentication & roles

- Session-based login with three roles: `Administrateur`, `Caissier`, `Lecture seule`.
- Desktop window auto-authenticates using a per-session secure token injected into request headers (`X-Desktop-Token`). Routes that need desktop-only access (file save dialogs, window management) check this token.
- Default credentials created on first run: `admin/admin2025`, `caissier/caisse2025`, `lecture/view2025`.

### Database

SQLite at runtime path set by `KS_DB_PATH` env variable (resolved inside `main.py` for PyInstaller compatibility). `initialiser_base()` in `app.py` auto-creates schema and seeds defaults. Schema migrations (adding missing columns) run at startup automatically.

Key models: `Utilisateur`, `Client`, `Facture`, `LigneFacture`, `Paiement`, `Operation`, `Evenement`, `Technicien`, `EvenementTechnicien`, `Materiel`, `EvenementMateriel`, `Service`, `Fournisseur`, `Parametres`, `RecuPaiement`, `DepensePrestation`, `PrestationArchivee`.

### PDF generation

Two libraries are used:

- **ReportLab** — used for structured documents (invoices, proformas, payment receipts).
- **Weasyprint** — used for HTML-to-PDF conversion (event sheets, reminders).

Key functions: `generer_pdf_facture()`, `generer_pdf_proforma()`, `generer_prestation_pdf()`, `generer_relance_pdf()`.

### PyWebView desktop integration quirks

- Dialog/window operations (file save dialog, opening preview windows) must run on the **main thread**. A queue (`_open_window_queue`) is polled by the main thread; background Flask threads push tasks there.
- Tkinter is used for native file-save dialogs alongside PyWebView.
- When building with PyInstaller, all file paths must use `sys._MEIPASS` as base. The `KS_DB_PATH` env variable handles the database path; templates and static files are declared in the `.spec` files.

### Frontend

Jinja2 templates under `templates/` (35 files), Bootstrap 5.3, Bootstrap Icons, Chart.js (dashboard), Service Worker for offline capability. UI language is French throughout; currency is FCFA.

### Backup / export

- Full JSON backup/restore: `/sauvegarde/exporter` and `/sauvegarde/importer`.
- CSV exports per entity: `/export/factures`, `/export/operations`, `/export/paiements`, `/export/clients`.

## Key configuration

| File | Purpose |
|------|---------|
| `server_config.ini` | Client: remote server IP and port (default `192.168.1.10:5000`) |
| `KS_Server.spec` / `KS_Client.spec` | PyInstaller bundle config — lists all `datas` and `hiddenimports` |
| `requirements_desktop.txt` | Minimal deps used inside the PyInstaller bundle |
