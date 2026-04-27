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

# ── Queue main thread (fenêtres + dialogs tkinter) ──────────────────
import queue as _queue
_window_queue = _queue.Queue()
_dialog_result = {}

def open_apercu_window(url, title='Aperçu'):
    full_url = f"http://127.0.0.1:5000{url}"
    _window_queue.put(('window', title, full_url))

def open_save_dialog_via_queue(key, initialfile, ext, filetypes):
    import threading
    event = threading.Event()
    _dialog_result[key] = None
    _window_queue.put(('dialog', key, initialfile, ext, filetypes, event))
    event.wait(timeout=120)
    return _dialog_result.pop(key, None)

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

            # Boîte Enregistrer sous via queue main thread
            print(f"[PDF] Ouverture dialog: {filename}")
            import uuid
            key = str(uuid.uuid4())
            chemin = open_save_dialog_via_queue(
                key, filename, '.pdf',
                [('Fichiers PDF', '*.pdf'), ('Tous les fichiers', '*.*')]
            )

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

# ── Sauvegarde JSON via dialog natif ────────────────────────────────
@app.route('/api/sauvegarder-json')
def api_sauvegarder_json():
    if 'username' not in session:
        return jsonify({'ok': False, 'error': 'Non connecté'})

    # Générer le contenu JSON directement (sans HTTP interne)
    try:
        from database import (Client, Facture, LigneFacture, Paiement,
                               Operation, Service, Parametres, Evenement,
                               Technicien, Fournisseur, Materiel, EvenementTechnicien,
                               EvenementMateriel, DepensePrestation, RecuPaiement,
                               PrestationArchivee)
        import json as _json
        from datetime import datetime as dt

        data = {
            'version': '2.0', 'date_export': dt.now().strftime('%d/%m/%Y %H:%M'),
            'factures': [], 'lignes': [], 'paiements': [], 'operations': [],
            'clients': [], 'services': [], 'techniciens': [], 'fournisseurs': [],
            'materiels': [], 'prestations': [], 'depenses': [],
            'recus': [], 'assignations_tech': [], 'assignations_mat': [], 'archives': [],
        }

        # Factures + Proformas
        for f in Facture.query.all():
            data['factures'].append({
                'numero': f.numero, 'nom_client': f.nom_client,
                'service': f.service, 'montant_ttc': f.montant_ttc,
                'etat_paiement': f.etat_paiement, 'mode_paiement': f.mode_paiement,
                'section': f.section, 'type_operation': f.type_operation or 'Recettes',
                'montant_paye': f.montant_paye or 0, 'reste_du': f.reste_du or 0,
                'cree_par': f.cree_par or '',
                'date': f.date.strftime('%Y-%m-%d') if f.date else None,
            })

        # Lignes de facture
        for l in LigneFacture.query.all():
            fac = Facture.query.get(l.facture_id)
            data['lignes'].append({
                'facture_numero': fac.numero if fac else '',
                'service': l.service, 'prix_unitaire': l.prix_unitaire,
                'quantite': l.quantite, 'montant_ht': l.montant_ht,
                'montant_ttc': l.montant_ttc,
            })

        # Paiements
        for p in Paiement.query.all():
            fac = Facture.query.get(p.facture_id) if p.facture_id else None
            data['paiements'].append({
                'numero': p.numero, 'n_facture': p.n_facture or '',
                'facture_numero': fac.numero if fac else (p.n_facture or ''),
                'nom_client': p.nom_client, 'montant_facture': p.montant_facture,
                'montant_paye': p.montant_paye, 'reste_du': p.reste_du,
                'mode_paiement': p.mode_paiement, 'etat_facture': p.etat_facture,
                'notes': p.notes or '',
                'date': p.date.strftime('%Y-%m-%d') if p.date else None,
            })

        # Opérations
        for o in Operation.query.all():
            data['operations'].append({
                'numero': o.numero, 'nom_client': o.nom_client,
                'service': o.service, 'montant_ttc': o.montant_ttc,
                'type_operation': o.type_operation, 'section': o.section,
                'categorie': o.categorie or '',
                'date': o.date.strftime('%Y-%m-%d') if o.date else None,
            })

        # Clients
        for c in Client.query.all():
            data['clients'].append({
                'numero': c.numero, 'nom': c.nom,
                'telephone': c.telephone, 'email': c.email or '',
                'adresse': c.adresse or '', 'nif': c.nif or '', 'rccm': c.rccm or '',
            })

        # Services
        for s in Service.query.all():
            data['services'].append({
                'libelle': s.libelle, 'prix': s.prix,
                'section': s.section, 'actif': s.actif,
            })

        # Techniciens
        for t in Technicien.query.all():
            data['techniciens'].append({
                'nom': t.nom, 'telephone': t.telephone or '',
                'email': t.email or '', 'specialite': t.specialite or '',
                'role': t.role or '', 'statut_emploi': t.statut_emploi or 'Temporaire',
                'salaire_base': t.salaire_base or 0, 'statut': t.statut or 'Disponible',
            })

        # Fournisseurs
        for f in Fournisseur.query.all():
            data['fournisseurs'].append({
                'nom': f.nom, 'telephone': f.telephone or '',
                'email': f.email or '', 'adresse': f.adresse or '',
            })

        # Matériels
        for m in Materiel.query.all():
            fou = Fournisseur.query.get(m.fournisseur_id) if m.fournisseur_id else None
            data['materiels'].append({
                'nom': m.nom, 'categorie': m.categorie or '',
                'marque': m.marque or '', 'modele': m.modele or '',
                'quantite': m.quantite or 1,
                'provenance': m.provenance or 'KS Production',
                'fournisseur': fou.nom if fou else None,
            })

        # Prestations (Evenements)
        for e in Evenement.query.all():
            fac = Facture.query.get(e.facture_id) if e.facture_id else None
            data['prestations'].append({
                'titre': e.titre, 'nom_client': e.nom_client or '',
                'lieu': e.lieu or '', 'section': e.section or '',
                'statut': e.statut or 'Confirme', 'service': e.service or '',
                'notes': e.notes or '',
                'heure_debut': e.heure_debut or '', 'heure_fin': e.heure_fin or '',
                'facture_numero': fac.numero if fac else None,
                'date': e.date.strftime('%Y-%m-%d') if e.date else None,
            })

        # Dépenses prestations (avec tous les liens)
        for d in DepensePrestation.query.all():
            evt = Evenement.query.get(d.evenement_id) if d.evenement_id else None
            tech = Technicien.query.get(d.technicien_id) if d.technicien_id else None
            recu = RecuPaiement.query.get(d.recu_id) if d.recu_id else None
            data['depenses'].append({
                'evenement_titre': evt.titre if evt else '',
                'type_depense': d.type_depense, 'description': d.description,
                'beneficiaire': d.beneficiaire or '',
                'technicien_nom': tech.nom if tech else None,
                'montant': d.montant, 'statut': d.statut,
                'recu_numero': recu.numero if recu else None,
                'date_paiement': d.date_paiement.strftime('%Y-%m-%d') if d.date_paiement else None,
            })

        # Reçus de paiement
        for r in RecuPaiement.query.all():
            tech = Technicien.query.get(r.technicien_id) if r.technicien_id else None
            data['recus'].append({
                'numero': r.numero, 'beneficiaire': r.beneficiaire,
                'technicien_nom': tech.nom if tech else None,
                'type_recu': r.type_recu, 'salaire_base': r.salaire_base or 0,
                'total_primes': r.total_primes or 0, 'total_net': r.total_net or 0,
                'mois': r.mois or '', 'notes': r.notes or '',
                'cree_par': r.cree_par or '',
                'date': r.date.strftime('%Y-%m-%d') if r.date else None,
            })

        # Assignations Techniciens ↔ Prestations
        for et in EvenementTechnicien.query.all():
            evt  = Evenement.query.get(et.evenement_id)
            tech = Technicien.query.get(et.technicien_id)
            if evt and tech:
                data['assignations_tech'].append({
                    'evenement_titre': evt.titre,
                    'technicien_nom': tech.nom,
                    'role': et.role or '',
                })

        # Assignations Matériels ↔ Prestations
        for em in EvenementMateriel.query.all():
            evt = Evenement.query.get(em.evenement_id)
            mat = Materiel.query.get(em.materiel_id)
            if evt and mat:
                data['assignations_mat'].append({
                    'evenement_titre': evt.titre,
                    'materiel_nom': mat.nom,
                    'quantite': em.quantite or 1,
                    'notes': em.notes or '',
                })

        # Archives prestations
        for a in PrestationArchivee.query.all():
            evt = Evenement.query.get(a.evenement_id) if a.evenement_id else None
            data['archives'].append({
                'evenement_titre': evt.titre if evt else '',
                'evenement_date': evt.date.strftime('%Y-%m-%d') if evt and evt.date else None,
                'evenement_client': evt.nom_client if evt else '',
                'evenement_section': evt.section if evt else '',
                'evenement_lieu': evt.lieu if evt else '',
                'date_archivage': a.date_archivage.strftime('%Y-%m-%d') if a.date_archivage else None,
                'total_recettes': a.total_recettes or 0,
                'total_depenses': a.total_depenses or 0,
                'benefice_net': a.benefice_net or 0,
                'nb_depenses': a.nb_depenses or 0,
                'archive_par': a.archive_par or '',
                'notes': a.notes or '',
            })

        contenu     = _json.dumps(data, ensure_ascii=False, indent=2)
        nom_fichier = f"KS_Backup_{dt.now().strftime('%d%m%Y_%H%M')}.json"

    except Exception as e:
        return jsonify({'ok': False, 'error': str(e)})

    # Ouvrir dialog via queue main thread
    import uuid
    key = str(uuid.uuid4())
    def _do_backup():
        chemin = open_save_dialog_via_queue(
            key, nom_fichier, '.json',
            [('Fichiers JSON', '*.json'), ('Tous les fichiers', '*.*')]
        )
        if chemin:
            with open(chemin, 'w', encoding='utf-8') as f:
                f.write(contenu)
            print(f"[BACKUP] ✅ Enregistré: {chemin}")
        else:
            print("[BACKUP] Annulé")
    threading.Thread(target=_do_backup, daemon=True).start()
    return jsonify({'ok': True})


# ── Lancement principal ──────────────────────────────────────────────
def get_ecran_principal():
    try:
        import ctypes
        user32 = ctypes.windll.user32
        user32.SetProcessDPIAware()
        class RECT(ctypes.Structure):
            _fields_ = [("left",ctypes.c_long),("top",ctypes.c_long),
                        ("right",ctypes.c_long),("bottom",ctypes.c_long)]
        rect = RECT()
        ctypes.windll.user32.SystemParametersInfoW(0x30, 0, ctypes.byref(rect), 0)
        return rect.right - rect.left, rect.bottom - rect.top
    except Exception:
        return 1920, 1040


def demarrer_flask():
    app.run(host='127.0.0.1', port=5000, debug=False, use_reloader=False)


if __name__ == '__main__':
    # Démarrer Flask dans un thread
    t = threading.Thread(target=demarrer_flask, daemon=True)
    t.start()

    import time
    time.sleep(1)

    # Créer la fenêtre login (petite, centrée)
    try:
        import ctypes
        user32 = ctypes.windll.user32
        user32.SetProcessDPIAware()
        class RECT(ctypes.Structure):
            _fields_ = [("left",ctypes.c_long),("top",ctypes.c_long),
                        ("right",ctypes.c_long),("bottom",ctypes.c_long)]
        rect = RECT()
        ctypes.windll.user32.SystemParametersInfoW(0x30, 0, ctypes.byref(rect), 0)
        sw = rect.right - rect.left
        sh = rect.bottom - rect.top
        lw, lh = 460, 640
        lx = rect.left + (sw - lw) // 2
        ly = rect.top  + (sh - lh) // 2
        print(f"[LOGIN] Écran {sw}×{sh} → fenêtre à ({lx}, {ly})")
    except Exception:
        lx, ly, lw, lh = 730, 220, 460, 640

    window = webview.create_window(
        'KS Production — Connexion',
        f'http://127.0.0.1:5000/login',
        width=lw, height=lh,
        x=lx, y=ly,
        resizable=True,
        confirm_close=False,
    )

    state = {'connecte': False}

    def on_loaded():
        import time
        time.sleep(0.3)
        url = window.get_current_url() or ''
        if '/dashboard' in url or ('/login' not in url and url):
            if not state['connecte']:
                state['connecte'] = True
                window.set_title('KS Production')
                try:
                    w, h = get_ecran_principal()
                    window.resize(w, h)
                    window.move(0, 0)
                except Exception:
                    pass
                try:
                    window.on_top = False
                except Exception:
                    pass

    window.events.loaded += on_loaded

    def process_window_queue():
        # NE PAS importer tkinter ici — doit rester dans le thread principal
        while True:
            try:
                item = _window_queue.get(timeout=0.3)
                kind = item[0]
                if kind == 'window':
                    _, title, url = item
                    try:
                        webview.create_window(title, url, width=1050, height=780,
                                              resizable=True, confirm_close=False)
                        print(f"[WINDOW] ✅ {title}")
                    except Exception as ex:
                        print(f"[WINDOW] ❌ {ex}")
                elif kind == 'dialog':
                    _, key, initialfile, ext, filetypes, event = item
                    try:
                        import tkinter as _tk
                        from tkinter import filedialog as _fd
                        root = _tk.Tk(); root.withdraw()
                        root.attributes('-topmost', True)
                        chemin = _fd.asksaveasfilename(
                            parent=root, initialfile=initialfile,
                            defaultextension=ext, filetypes=filetypes
                        )
                        root.destroy()
                        _dialog_result[key] = chemin or None
                    except Exception as ex:
                        print(f"[DIALOG] ❌ {ex}")
                        _dialog_result[key] = None
                    finally:
                        event.set()
            except _queue.Empty:
                pass
            except Exception as e:
                print(f"[QUEUE] ❌ {e}")

    webview.start(func=process_window_queue, debug=False)
