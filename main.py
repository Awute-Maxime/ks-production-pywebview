"""
main.py — KS Production Desktop
"""

import threading
import time
import sys
import os
import secrets
import webview

def resource_path(relative_path):
    if hasattr(sys, '_MEIPASS'):
        return os.path.join(sys._MEIPASS, relative_path)
    return os.path.join(os.path.dirname(os.path.abspath(__file__)), relative_path)

def data_path(relative_path):
    if hasattr(sys, '_MEIPASS'):
        base = os.path.dirname(sys.executable)
    else:
        base = os.path.dirname(os.path.abspath(__file__))
    path = os.path.join(base, relative_path)
    os.makedirs(os.path.dirname(path) if os.path.splitext(path)[1] else path, exist_ok=True)
    return path

os.environ['KS_DB_PATH'] = data_path(os.path.join('data', 'ks_production.db'))

from app import app, initialiser_base, generer_pdf_facture, generer_pdf_proforma, generer_relance_pdf, generer_prestation_pdf
from database import db, Facture, Client, Parametres, LigneFacture
from flask import request, jsonify, session

DESKTOP_TOKEN = secrets.token_hex(16)

@app.before_request
def auto_auth_desktop():
    token = request.args.get('_dt')
    if token and token == DESKTOP_TOKEN:
        if 'username' not in session:
            from database import Utilisateur
            admin = Utilisateur.query.filter_by(role='Administrateur').first()
            if admin:
                session['username'] = admin.username
                session['role']     = admin.role

@app.route('/api/close-window')
def api_close_window():
    def _close():
        time.sleep(0.15)
        try:
            # Fermer toutes les fenêtres sauf la fenêtre principale
            for win in webview.windows:
                if win.title != 'KS Production':
                    try:
                        win.destroy()
                    except Exception as e:
                        print(f"[CLOSE] destroy error: {e}")
        except Exception as e:
            print(f"[CLOSE] error: {e}")
    threading.Thread(target=_close, daemon=True).start()
    return jsonify({'ok': True})

@app.route('/api/open-window')
def api_open_window():
    url   = request.args.get('url', '/')
    title = request.args.get('title', 'Aperçu')
    sep   = '&' if '?' in url else '?'
    open_apercu_window(f"{url}{sep}_dt={DESKTOP_TOKEN}", title)
    return jsonify({'ok': True})

@app.route('/api/ouvrir-url')
def api_ouvrir_url():
    """Ouvre une URL dans le navigateur par défaut via Python."""
    url = request.args.get('url', '')
    if url:
        import subprocess
        try:
            import webbrowser
            webbrowser.open(url)
        except Exception as e:
            print(f"[URL] Erreur: {e}")
    return jsonify({'ok': True})

@app.route('/api/partager-fiche-tarifs')
def api_partager_fiche_tarifs():
    """Génère la fiche tarifs en PDF via Weasyprint et ouvre WhatsApp ou Email."""
    canal = request.args.get('canal', 'whatsapp')

    try:
        import webbrowser
        from datetime import date
        from weasyprint import HTML, CSS

        # Récupérer le HTML de la fiche tarifs
        with app.test_client() as c:
            with c.session_transaction() as sess:
                sess['username'] = 'admin'
                sess['role']     = 'Administrateur'
            resp = c.get('/services/fiche-tarifs')
        html = resp.data.decode('utf-8')

        extra_css = CSS(string='''
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            .action-bar, .d-print-none { display: none !important; }
            body { background: white !important; margin: 0; }
            .section-header.studio { background: linear-gradient(135deg, #0984e3, #6c5ce7) !important; }
            .section-header.sono   { background: linear-gradient(135deg, #e17055, #e94560) !important; }
            .section-header.autres { background: linear-gradient(135deg, #00b894, #00cec9) !important; }
        ''')
        pdf_bytes = HTML(string=html, base_url='http://127.0.0.1:5000').write_pdf(stylesheets=[extra_css])

        filename = f"FicheTarifs_{date.today().strftime('%d%m%Y')}.pdf"
        bureau   = os.path.join(os.path.expanduser('~'), 'Desktop', 'KS Production Partage')
        os.makedirs(bureau, exist_ok=True)
        chemin = os.path.join(bureau, filename)
        with open(chemin, 'wb') as f:
            f.write(pdf_bytes)
        print(f"[TARIFS] PDF: {chemin}")

        params  = Parametres.query.first()
        nom_ent = params.nom_entreprise if params else 'KS Production'
        tel     = params.telephone if params else ''

        if canal == 'whatsapp':
            msg = f"Bonjour,\n\nVeuillez trouver ci-joint notre grille tarifaire.\n\nN'hésitez pas à nous contacter pour un devis personnalisé.\n\nCordialement,\n{nom_ent}"
            from urllib.parse import quote
            webbrowser.open(f"https://wa.me/?text={quote(msg)}")
        else:
            from urllib.parse import quote
            sujet = f"Fiche Tarifs — {nom_ent}"
            msg   = f"Bonjour,\n\nVeuillez trouver ci-joint notre grille tarifaire.\n\nCordialement,\n{nom_ent}"
            webbrowser.open(f"mailto:?subject={quote(sujet)}&body={quote(msg)}")

        return jsonify({'ok': True, 'chemin': chemin})

    except Exception as e:
        import traceback
        print(f"[TARIFS] Erreur: {e}")
        traceback.print_exc()
        return jsonify({'ok': False, 'error': str(e)})

@app.route('/api/partager')
def api_partager():
    """Génère le PDF + ouvre WhatsApp ou Email. Message généré depuis la DB."""
    type_doc = request.args.get('type', 'facture')
    doc_id   = request.args.get('id', '')
    canal    = request.args.get('canal', 'whatsapp')
    tel      = request.args.get('tel', '')

    if not doc_id:
        return jsonify({'ok': False, 'error': 'ID manquant'})

    try:
        import webbrowser
        from datetime import date
        from urllib.parse import quote

        doc_id_int = int(doc_id)

        params  = Parametres.query.first()
        nom_ent = params.nom_entreprise if params else 'KS Production'
        tel_ent = params.telephone      if params else ''

        bureau = os.path.join(os.path.expanduser('~'), 'Desktop', 'KS Production Partage')
        os.makedirs(bureau, exist_ok=True)

        # ── CAS PRESTATION (Evenement — pas une Facture !) ────────────
        if type_doc == 'prestation':
            from database import Evenement
            evt = db.session.get(Evenement, doc_id_int)
            if not evt:
                return jsonify({'ok': False, 'error': 'Prestation introuvable'})

            heure = ''
            if evt.heure_debut:
                heure = evt.heure_debut
                if evt.heure_fin:
                    heure += f' – {evt.heure_fin}'

            msg = (f"Bonjour{' ' + evt.nom_client if evt.nom_client else ''},\n\n"
                   f"Veuillez trouver ci-joint la fiche de prestation :\n"
                   f"📋 {evt.titre}\n"
                   f"📅 Date : {evt.date.strftime('%d/%m/%Y')}\n"
                   + (f"🕒 Horaire : {heure}\n" if heure else '')
                   + (f"📍 Lieu : {evt.lieu}\n" if evt.lieu else '')
                   + (f"🔧 Service : {evt.service}\n" if evt.service else '')
                   + f"\nMerci pour votre confiance.\n{nom_ent}"
                   + (f"\n📞 {tel_ent}" if tel_ent else ''))

            print(f"[PARTAGE] Prestation EVT-{evt.id:04d} → {canal}")

            with app.app_context():
                pdf_bytes, filename = generer_prestation_pdf(doc_id_int)

            chemin = os.path.join(bureau, filename)
            with open(chemin, 'wb') as f:
                f.write(pdf_bytes)
            print(f"[PARTAGE] PDF: {chemin}")

            if canal == 'whatsapp':
                tel_clean = tel.replace(' ', '').replace('-', '').replace('+', '')
                if tel_clean and len(tel_clean) == 8:
                    tel_clean = '228' + tel_clean
                wa_url = (f"https://wa.me/{tel_clean}?text={quote(msg)}"
                          if tel_clean else f"https://wa.me/?text={quote(msg)}")
                webbrowser.open(wa_url)
            else:
                sujet  = f"Fiche de prestation – {evt.titre} ({evt.date.strftime('%d/%m/%Y')})"
                mailto = f"mailto:?subject={quote(sujet)}&body={quote(msg)}"
                webbrowser.open(mailto)

            return jsonify({'ok': True, 'chemin': chemin})

        # ── CAS FACTURE / PROFORMA / RELANCE ─────────────────────────
        facture = db.session.get(Facture, doc_id_int)
        if not facture:
            return jsonify({'ok': False, 'error': 'Document introuvable'})

        client = Client.query.filter_by(nom=facture.nom_client).first()

        if type_doc == 'facture':
            apercu_url = f'/factures/apercu/{doc_id_int}'
            prefix     = 'Facture'
            statut     = ('PAYÉE'     if facture.etat_paiement == 'Payer'
                          else 'PARTIELLE' if facture.etat_paiement == 'Partiel'
                          else 'IMPAYÉE')
            msg = (f"Bonjour {facture.nom_client},\n\n"
                   f"Veuillez trouver ci-joint votre facture :\n"
                   f"N° : {facture.numero}\n"
                   f"Date : {facture.date.strftime('%d/%m/%Y')}\n"
                   f"Montant TTC : {facture.montant_ttc:,.0f} FCFA\n"
                   f"Statut : {statut}\n\n"
                   f"Merci pour votre confiance.\n{nom_ent}").replace(',', ' ')
        elif type_doc == 'relance':
            apercu_url = f'/relances/pdf/{doc_id_int}'
            prefix     = 'Relance'
            msg = (f"Bonjour {facture.nom_client},\n\n"
                   f"Rappel : votre facture {facture.numero} du "
                   f"{facture.date.strftime('%d/%m/%Y')} présente un solde impayé "
                   f"de {facture.reste_du:,.0f} FCFA.\n\n"
                   f"Merci de régulariser dans les meilleurs délais.\n{nom_ent}").replace(',', ' ')
        else:  # proforma
            apercu_url = f'/proformas/apercu/{doc_id_int}'
            prefix     = 'Proforma'
            msg = (f"Bonjour {facture.nom_client},\n\n"
                   f"Veuillez trouver ci-joint votre devis/proforma :\n"
                   f"N° : {facture.numero}\n"
                   f"Date : {facture.date.strftime('%d/%m/%Y')}\n"
                   f"Montant TTC : {facture.montant_ttc:,.0f} FCFA\n\n"
                   f"Valable 30 jours.\nMerci pour votre confiance.\n{nom_ent}").replace(',', ' ')

        print(f"[PARTAGE] {prefix} {facture.numero} → {canal}")

        # ── Générer le PDF ────────────────────────────────────────────
        if type_doc in ('facture', 'proforma'):
            with app.test_client() as c:
                with c.session_transaction() as sess:
                    sess['username'] = 'admin'
                    sess['role']     = 'Administrateur'
                resp = c.get(apercu_url)
            html = resp.data.decode('utf-8')
            from weasyprint import HTML, CSS
            extra_css = CSS(string=(
                '* { -webkit-print-color-adjust: exact !important; } '
                '.action-bar, .toolbar { display: none !important; } '
                'body { background: white !important; }'))
            pdf_bytes = HTML(string=html, base_url='http://127.0.0.1:5000').write_pdf(stylesheets=[extra_css])
            filename  = f"{prefix}_{facture.numero}_{date.today().strftime('%d%m%Y')}.pdf"
        else:  # relance
            with app.app_context():
                pdf_bytes, filename = generer_relance_pdf(doc_id_int)

        chemin = os.path.join(bureau, filename)
        with open(chemin, 'wb') as f:
            f.write(pdf_bytes)
        print(f"[PARTAGE] PDF: {chemin}")

        # ── Ouvrir WhatsApp ou Email ──────────────────────────────────
        if canal == 'whatsapp':
            tel_clean = tel.replace(' ', '').replace('-', '').replace('+', '')
            if tel_clean and len(tel_clean) == 8:
                tel_clean = '228' + tel_clean
            wa_url = (f"https://wa.me/{tel_clean}?text={quote(msg)}"
                      if tel_clean else f"https://wa.me/?text={quote(msg)}")
            print(f"[PARTAGE] WhatsApp: {wa_url[:80]}...")
            webbrowser.open(wa_url)
        else:
            sujet  = f"{prefix} {facture.numero} - {nom_ent}"
            mailto = f"mailto:?subject={quote(sujet)}&body={quote(msg)}"
            print(f"[PARTAGE] Email: {mailto[:80]}...")
            webbrowser.open(mailto)

        return jsonify({'ok': True, 'chemin': chemin})

    except Exception as e:
        import traceback
        print(f"[PARTAGE] Erreur: {e}")
        traceback.print_exc()
        return jsonify({'ok': False, 'error': str(e)})

@app.route('/api/enregistrer-pdf-temp')
def api_enregistrer_pdf_temp():
    """Génère le PDF et l'enregistre dans un dossier temporaire pour partage WhatsApp/Email."""
    type_doc = request.args.get('type', 'facture')
    doc_id   = request.args.get('id', '')
    if not doc_id:
        return jsonify({'ok': False, 'chemin': ''})

    try:
        doc_id_int = int(doc_id)
        if type_doc == 'facture':
            apercu_url = f'/factures/apercu/{doc_id_int}'
            prefix     = 'Facture'
        elif type_doc == 'relance':
            apercu_url = f'/relances/pdf/{doc_id_int}'
            prefix     = 'Relance'
        elif type_doc == 'prestation':
            apercu_url = f'/agenda/fiche-pdf/{doc_id_int}'
            prefix     = 'Prestation'
        else:
            apercu_url = f'/proformas/apercu/{doc_id_int}'
            prefix     = 'Proforma'

        # Récupérer le HTML
        with app.test_client() as c:
            with c.session_transaction() as sess:
                sess['username'] = 'admin'
                sess['role']     = 'Administrateur'
            resp = c.get(apercu_url)
        html = resp.data.decode('utf-8')

        # Générer PDF via Weasyprint
        from weasyprint import HTML, CSS
        extra_css = CSS(string='''
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            .action-bar, .d-print-none { display: none !important; }
            body { background: white !important; margin: 0; }
            .page-wrap { margin: 0 !important; padding: 0 !important; max-width: 100% !important; }
            .facture { box-shadow: none !important; }
        ''')
        pdf_bytes = HTML(string=html, base_url='http://127.0.0.1:5000').write_pdf(stylesheets=[extra_css])

        # Enregistrer dans dossier "Partage KS Production" sur le Bureau
        from datetime import date
        import re
        num_match = re.search(r'(FKSP|PROF)-[\d\-]+', html)
        num = num_match.group(0) if num_match else doc_id
        filename = f"{prefix}_{num}_{date.today().strftime('%d%m%Y')}.pdf"

        # Dossier de partage : Bureau/KS Production Partage
        bureau = os.path.join(os.path.expanduser('~'), 'Desktop', 'KS Production Partage')
        os.makedirs(bureau, exist_ok=True)
        chemin = os.path.join(bureau, filename)

        with open(chemin, 'wb') as f:
            f.write(pdf_bytes)

        print(f"[PARTAGE] PDF prêt: {chemin}")
        return jsonify({'ok': True, 'chemin': chemin, 'filename': filename})

    except Exception as e:
        import traceback
        print(f"[PARTAGE] Erreur: {e}")
        traceback.print_exc()
        return jsonify({'ok': False, 'chemin': '', 'error': str(e)})

@app.route('/api/enregistrer-pdf')
def api_enregistrer_pdf():
    type_doc = request.args.get('type', 'facture')
    doc_id   = request.args.get('id', '')
    if not doc_id:
        return jsonify({'ok': False})

    def _enregistrer():
        import tkinter as tk
        from tkinter import filedialog
        import traceback

        try:
            doc_id_int = int(doc_id)
            if type_doc == 'facture':
                apercu_url = f'/factures/apercu/{doc_id_int}'
                prefix     = 'Facture'
            elif type_doc == 'proforma':
                apercu_url = f'/proformas/apercu/{doc_id_int}'
                prefix     = 'Proforma'
            elif type_doc == 'prestation':
                apercu_url = f'/agenda/fiche-pdf/{doc_id_int}'
                prefix     = 'Prestation'
            elif type_doc == 'relance':
                apercu_url = f'/relances/pdf/{doc_id_int}'
                prefix     = 'Relance'
            else:
                apercu_url = f'/proformas/apercu/{doc_id_int}'
                prefix     = 'Document'

            print(f"[PDF] Génération pour {apercu_url}")

            # Générer le PDF selon le type
            if type_doc in ('facture', 'proforma'):
                # Weasyprint sur l'aperçu HTML
                with app.test_client() as c:
                    with c.session_transaction() as sess:
                        sess['username'] = 'admin'
                        sess['role']     = 'Administrateur'
                    resp = c.get(apercu_url)
                html = resp.data.decode('utf-8')
                print(f"[PDF] HTML: {len(html)} chars")
                from weasyprint import HTML, CSS
                extra_css = CSS(string='* { -webkit-print-color-adjust: exact !important; } .action-bar, .toolbar { display: none !important; } body { background: white !important; margin: 0; } .page-wrap { margin: 0 !important; max-width: 100% !important; } .facture { box-shadow: none !important; }')
                pdf_bytes = HTML(string=html, base_url='http://127.0.0.1:5000').write_pdf(stylesheets=[extra_css])
                from datetime import date
                import re
                num_match = re.search(r'(FKSP|PROF)-[\d\-]+', html)
                num = num_match.group(0) if num_match else doc_id
                filename = f"{prefix}_{num}_{date.today().strftime('%d%m%Y')}.pdf"
            elif type_doc == 'relance':
                with app.app_context():
                    pdf_bytes, filename = generer_relance_pdf(doc_id_int)
            elif type_doc == 'prestation':
                with app.app_context():
                    pdf_bytes, filename = generer_prestation_pdf(doc_id_int)

            print(f"[PDF] OK: {len(pdf_bytes)} bytes")
            if not pdf_bytes or len(pdf_bytes) < 200:
                print("[PDF] PDF trop petit")
                return

            # Boîte Enregistrer sous
            print(f"[PDF] Ouverture dialog: {filename}")
            root = tk.Tk()
            root.withdraw()
            root.attributes('-topmost', True)
            chemin = filedialog.asksaveasfilename(
                title='Enregistrer le PDF',
                initialfile=filename,
                defaultextension='.pdf',
                filetypes=[('Fichiers PDF', '*.pdf'), ('Tous les fichiers', '*.*')]
            )
            root.destroy()

            if not chemin:
                print("[PDF] Annulé")
                return

            with open(chemin, 'wb') as f:
                f.write(pdf_bytes)
            print(f"[PDF] ✅ Enregistré: {chemin}")

        except Exception as e:
            print(f"[PDF] ❌ Erreur: {e}")
            traceback.print_exc()

    threading.Thread(target=_enregistrer, daemon=True).start()
    return jsonify({'ok': True})

# ── Fenêtres aperçu natives ──────────────────────────────────────────
apercu_windows = {}
apercu_lock = threading.Lock()

APERCU_INJECT_JS = r"""
(function() {
    // JS de secours - le HTML gère maintenant tout directement
    console.log('[KS] APERCU_INJECT_JS loaded:', window.location.pathname);
})();
"""

def open_apercu_window(url, title='Aperçu'):
    full_url = f'http://127.0.0.1:5000{url}' if url.startswith('/') else url

    def _open():
        with apercu_lock:
            if url in apercu_windows:
                try: apercu_windows[url].destroy()
                except: pass

        win = webview.create_window(
            title=title, url=full_url,
            width=1050, height=780,
            min_size=(700, 500),
            resizable=True, confirm_close=False,
        )
        with apercu_lock:
            apercu_windows[url] = win

        def on_loaded():
            try: win.evaluate_js(APERCU_INJECT_JS)
            except: pass

        def on_closed():
            with apercu_lock: apercu_windows.pop(url, None)

        win.events.loaded += on_loaded
        win.events.closed += on_closed

    threading.Thread(target=_open, daemon=True).start()

KS_INJECT_JS = r"""
(function() {
    if (window._ksInjected) return;
    // Ne pas injecter dans les fenêtres aperçu (elles ont leur propre injection)
    var path = window.location.pathname;
    if (path.indexOf('/apercu') !== -1 ||
        path.indexOf('/telecharger') !== -1 ||
        path.indexOf('/relances/pdf') !== -1 ||
        path.indexOf('/fiche-pdf') !== -1 ||
        path.indexOf('fiche-tarifs') !== -1) {
        return;
    }
    window._ksInjected = true;

    var style = document.createElement('style');
    style.textContent = [
        'body { display:flex!important; min-height:100vh!important; margin:0!important; }',
        '.sidebar { position:relative!important; flex-shrink:0!important; width:200px!important; min-height:100vh!important; }',
        '.main-content, .main { flex:1!important; min-width:0!important; margin-left:0!important; overflow-x:hidden!important; padding:20px!important; box-sizing:border-box!important; }'
    ].join('');
    document.head.appendChild(style);

    var overlay = document.createElement('div');
    overlay.id = 'ks-popup-overlay';
    overlay.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:99999;align-items:center;justify-content:center;';
    overlay.innerHTML = [
        '<div id="ks-popup-box" style="background:#fff;border-radius:16px;width:70%;max-width:750px;height:80%;',
            'display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.4);">',
            '<div style="padding:11px 18px;background:#1a1a2e;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">',
                '<span id="ks-popup-title" style="color:#fff;font-size:.88rem;font-weight:700;">Paiement</span>',
                '<button id="ks-popup-close" style="background:#e94560;border:none;color:#fff;border-radius:8px;padding:5px 14px;cursor:pointer;font-size:.78rem;font-weight:600;">&#10005; Fermer</button>',
            '</div>',
            '<iframe id="ks-popup-frame" src="" style="flex:1;border:none;width:100%;"></iframe>',
        '</div>'
    ].join('');
    document.body.appendChild(overlay);

    document.getElementById('ks-popup-close').addEventListener('click', closePopup);
    overlay.addEventListener('click', function(e) { if (e.target === overlay) closePopup(); });

    function closePopup() {
        overlay.style.display = 'none';
        document.getElementById('ks-popup-frame').src = '';
        window.location.reload();
    }

    window.openKSPopup = function(url, title) {
        document.getElementById('ks-popup-title').textContent = title || 'Paiement';
        document.getElementById('ks-popup-frame').src = url.startsWith('/') ? 'http://127.0.0.1:5000' + url : url;
        overlay.style.display = 'flex';
    };

    window.openNativeWindow = function(url, title) {
        fetch('/api/open-window?url=' + encodeURIComponent(url) + '&title=' + encodeURIComponent(title))
            .catch(function() {});
    };

    function interceptLinks() {
        document.querySelectorAll('a[target="_blank"]').forEach(function(a) { a.removeAttribute('target'); });

        var sel = ['a[href*="/apercu"]','a[href*="/relances/pdf"]',
                   'a[href*="fiche-tarifs"]','a[href*="/proforma/pdf"]',
                   'a[href*="/fiche-pdf"]'].join(',');

        document.querySelectorAll(sel).forEach(function(a) {
            if (a._ksHandled) return;
            a._ksHandled = true;
            var href  = a.getAttribute('href');
            var title = a.textContent.trim() || 'Aperçu';
            a.addEventListener('click', function(e) {
                e.preventDefault(); e.stopPropagation();
                window.openNativeWindow(href, title);
            });
        });

        document.querySelectorAll('a[href*="/paiements/enregistrer"]').forEach(function(a) {
            if (a._ksHandled) return;
            a._ksHandled = true;
            var href = a.getAttribute('href');
            a.addEventListener('click', function(e) {
                e.preventDefault(); e.stopPropagation();
                window.openKSPopup(href, 'Enregistrer un paiement');
            });
        });
    }

    interceptLinks();
    new MutationObserver(interceptLinks).observe(document.body, { childList: true, subtree: true });
})();
"""

def run_flask():
    with app.app_context():
        initialiser_base()
    app.run(host='127.0.0.1', port=5000, debug=False, use_reloader=False, threaded=True)

def wait_for_flask(timeout=10):
    import urllib.request
    for _ in range(timeout * 10):
        try:
            urllib.request.urlopen('http://127.0.0.1:5000/login')
            return True
        except:
            time.sleep(0.1)
    return False

def get_ecran_principal():
    """Retourne (largeur, hauteur) de l'écran principal via ctypes Windows."""
    try:
        import ctypes
        user32   = ctypes.windll.user32
        user32.SetProcessDPIAware()          # Tient compte du scaling DPI
        largeur  = user32.GetSystemMetrics(0)
        hauteur  = user32.GetSystemMetrics(1)
        return largeur, hauteur
    except Exception:
        return 1920, 1080                    # Fallback

def main():
    flask_thread = threading.Thread(target=run_flask, daemon=True)
    flask_thread.start()

    if not wait_for_flask():
        print("Erreur Flask")
        sys.exit(1)

    # ── Calcul position centrée sur l'écran principal ─────────────
    WIN_W, WIN_H     = 460, 640
    ecran_w, ecran_h = get_ecran_principal()
    pos_x = max(0, (ecran_w - WIN_W) // 2)
    pos_y = max(0, (ecran_h - WIN_H) // 2)
    print(f"[LOGIN] Écran {ecran_w}×{ecran_h} → fenêtre à ({pos_x}, {pos_y})")

    # ── État partagé ──────────────────────────────────────────────
    state = {'connecte': False}

    # ── Fenêtre login : petite, centrée, non redimensionnable ─────
    window = webview.create_window(
        title='KS Production — Connexion',
        url='http://127.0.0.1:5000/login',
        width=WIN_W, height=WIN_H,
        x=pos_x, y=pos_y,
        min_size=(WIN_W, WIN_H),
        resizable=False,
        confirm_close=False,   # Pas de confirm sur la page login
    )

    def on_loaded():
        try:
            url = window.get_current_url() or ''

            if '/login' not in url:
                # ── Connecté → plein écran + confirm_close ───────
                if not state['connecte']:
                    state['connecte'] = True
                    window.set_title('KS Production')
                    try:
                        window.maximize()
                    except Exception:
                        window.resize(1280, 800)
                    # Activer la confirmation de fermeture
                    try:
                        window.confirm_close = True
                    except Exception:
                        pass
                window.evaluate_js(KS_INJECT_JS)

        except Exception as e:
            print(f"[LOADED] {e}")

    window.events.loaded += on_loaded
    webview.start(debug=False)

if __name__ == '__main__':
    main()
