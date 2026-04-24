from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Utilisateur(db.Model):
    __tablename__ = 'utilisateurs'
    id          = db.Column(db.Integer, primary_key=True)
    username    = db.Column(db.String(50), unique=True, nullable=False)
    password    = db.Column(db.String(100), nullable=False)
    role        = db.Column(db.String(50), nullable=False)
    nom_complet = db.Column(db.String(100))
    statut      = db.Column(db.String(20), default='Actif')

class Client(db.Model):
    __tablename__ = 'clients'
    id        = db.Column(db.Integer, primary_key=True)
    numero    = db.Column(db.String(20), unique=True)
    nom       = db.Column(db.String(100), nullable=False)
    adresse   = db.Column(db.String(200))
    telephone = db.Column(db.String(20))
    email     = db.Column(db.String(100))
    nif       = db.Column(db.String(50))
    rccm      = db.Column(db.String(50))

class Facture(db.Model):
    __tablename__  = 'factures'
    id             = db.Column(db.Integer, primary_key=True)
    numero         = db.Column(db.String(30), unique=True, nullable=False)
    date           = db.Column(db.DateTime, default=datetime.now)
    nom_client     = db.Column(db.String(100), nullable=False)
    service        = db.Column(db.String(200), nullable=False)
    montant_ttc    = db.Column(db.Float, nullable=False)
    mode_paiement  = db.Column(db.String(50))
    etat_paiement  = db.Column(db.String(20), default='Non Payer')
    type_operation = db.Column(db.String(20), default='Recettes')
    categorie      = db.Column(db.String(20), default='Facture')
    section        = db.Column(db.String(50))
    cree_par       = db.Column(db.String(50))
    montant_paye   = db.Column(db.Float, default=0)
    reste_du       = db.Column(db.Float, default=0)

class Operation(db.Model):
    __tablename__  = 'operations'
    id             = db.Column(db.Integer, primary_key=True)
    numero         = db.Column(db.String(30), unique=True, nullable=False)
    date           = db.Column(db.DateTime, default=datetime.now)
    nom_client     = db.Column(db.String(100))
    service        = db.Column(db.String(200))
    montant_ttc    = db.Column(db.Float)
    type_operation = db.Column(db.String(20))
    categorie      = db.Column(db.String(20))
    section        = db.Column(db.String(50))
    cree_par       = db.Column(db.String(50))

class Parametres(db.Model):
    __tablename__         = 'parametres'
    id                    = db.Column(db.Integer, primary_key=True)
    nom_entreprise        = db.Column(db.String(100), default='KS Production')
    slogan                = db.Column(db.String(200), default="Studio d'Enregistrement & Sonorisation")
    adresse               = db.Column(db.String(200), default='Lomé, Togo')
    telephone             = db.Column(db.String(50),  default='+228 XX XX XX XX')
    email                 = db.Column(db.String(100), default='contact@ksproduction.tg')
    site_web              = db.Column(db.String(100), default='')
    nif                   = db.Column(db.String(50),  default='')
    rccm                  = db.Column(db.String(50),  default='')
    couleur_principale    = db.Column(db.String(10),  default='#e94560')
    mentions_legales      = db.Column(db.Text, default='Paiement à réception de facture. Tout retard de paiement entraîne des pénalités.')
    coordonnees_bancaires = db.Column(db.Text, default='')
    logo_filename         = db.Column(db.String(200), default='')
    cachet_filename       = db.Column(db.String(200), default='')

class LigneFacture(db.Model):
    __tablename__ = 'lignes_facture'
    id            = db.Column(db.Integer, primary_key=True)
    facture_id    = db.Column(db.Integer, db.ForeignKey('factures.id'), nullable=False)
    service       = db.Column(db.String(200), nullable=False)
    prix_unitaire = db.Column(db.Float, default=0)
    quantite      = db.Column(db.Integer, default=1)
    montant_ht    = db.Column(db.Float, default=0)
    montant_ttc   = db.Column(db.Float, default=0)
    facture       = db.relationship('Facture', backref=db.backref('lignes', lazy=True))

class Service(db.Model):
    __tablename__ = 'services'
    id      = db.Column(db.Integer, primary_key=True)
    section = db.Column(db.String(50), nullable=False)
    libelle = db.Column(db.String(200), nullable=False)
    prix    = db.Column(db.Float, default=0)
    actif   = db.Column(db.Boolean, default=True)

class Paiement(db.Model):
    __tablename__   = 'paiements'
    id              = db.Column(db.Integer, primary_key=True)
    numero          = db.Column(db.String(30), unique=True, nullable=False)
    date            = db.Column(db.DateTime, default=datetime.now)
    facture_id      = db.Column(db.Integer, db.ForeignKey('factures.id'), nullable=False)
    n_facture       = db.Column(db.String(30))
    nom_client      = db.Column(db.String(100))
    montant_facture = db.Column(db.Float, default=0)
    montant_paye    = db.Column(db.Float, default=0)
    reste_du        = db.Column(db.Float, default=0)
    mode_paiement   = db.Column(db.String(50))
    etat_facture    = db.Column(db.String(20))
    notes           = db.Column(db.Text, default='')
    cree_par        = db.Column(db.String(50))
    facture         = db.relationship('Facture', backref=db.backref('paiements', lazy=True))

class Evenement(db.Model):
    __tablename__ = 'evenement'
    id            = db.Column(db.Integer, primary_key=True)
    titre         = db.Column(db.String(200), nullable=False)
    date          = db.Column(db.Date, default=datetime.utcnow)
    heure_debut   = db.Column(db.String(10), nullable=True)
    heure_fin     = db.Column(db.String(10), nullable=True)
    nom_client    = db.Column(db.String(150), nullable=True)
    service       = db.Column(db.String(200), nullable=True)
    section       = db.Column(db.String(50),  nullable=True)
    lieu          = db.Column(db.String(200), nullable=True)
    notes         = db.Column(db.Text,        nullable=True)
    statut        = db.Column(db.String(30),  default='Confirmé')
    cree_par      = db.Column(db.String(80),  nullable=True)
    date_creation = db.Column(db.DateTime,    default=datetime.utcnow)
    facture_id    = db.Column(db.Integer, db.ForeignKey('factures.id'), nullable=True)
    facture       = db.relationship('Facture', foreign_keys=[facture_id], lazy=True)

class Technicien(db.Model):
    __tablename__ = 'technicien'
    id             = db.Column(db.Integer, primary_key=True)
    nom            = db.Column(db.String(150), nullable=False)
    telephone      = db.Column(db.String(30),  nullable=True)
    email          = db.Column(db.String(150), nullable=True)
    specialite     = db.Column(db.String(100), nullable=True)
    # Ingénieur-son | Ingénieur-studio | Technicien-son | Assistant | Secrétaire | Musicien | Autre
    role           = db.Column(db.String(100), nullable=True)
    statut         = db.Column(db.String(30),  default='Disponible')  # Disponible | Inactif
    statut_emploi  = db.Column(db.String(20),  default='Temporaire')  # Salarié | Temporaire
    salaire_base   = db.Column(db.Float,       default=0)
    notes          = db.Column(db.Text,        nullable=True)
    date_ajout     = db.Column(db.DateTime,    default=datetime.utcnow)

class EvenementTechnicien(db.Model):
    __tablename__ = 'evenement_technicien'
    id            = db.Column(db.Integer, primary_key=True)
    evenement_id  = db.Column(db.Integer, db.ForeignKey('evenement.id'),  nullable=False)
    technicien_id = db.Column(db.Integer, db.ForeignKey('technicien.id'), nullable=False)
    role          = db.Column(db.String(100), nullable=True)

# ── Fournisseur AVANT Materiel (FK dependency) ────────────────────
class Fournisseur(db.Model):
    __tablename__ = 'fournisseur'
    id           = db.Column(db.Integer, primary_key=True)
    nom          = db.Column(db.String(200), nullable=False)
    telephone    = db.Column(db.String(50),  nullable=True)
    email        = db.Column(db.String(150), nullable=True)
    adresse      = db.Column(db.String(200), nullable=True)
    type_service = db.Column(db.String(100), nullable=True)
    notes        = db.Column(db.Text,        nullable=True)
    date_ajout   = db.Column(db.DateTime,    default=datetime.utcnow)

class Materiel(db.Model):
    __tablename__  = 'materiel'
    id             = db.Column(db.Integer, primary_key=True)
    nom            = db.Column(db.String(200), nullable=False)
    categorie      = db.Column(db.String(80),  nullable=True)
    marque         = db.Column(db.String(100), nullable=True)
    modele         = db.Column(db.String(100), nullable=True)
    quantite       = db.Column(db.Integer,     default=1)
    provenance     = db.Column(db.String(30),  default='KS Production')
    fournisseur_id = db.Column(db.Integer, db.ForeignKey('fournisseur.id'), nullable=True)
    fournisseur    = db.relationship('Fournisseur', backref='materiels', lazy=True)
    cout_location  = db.Column(db.Float,       default=0)
    statut         = db.Column(db.String(30),  default='Disponible')
    notes          = db.Column(db.Text,        nullable=True)
    date_ajout     = db.Column(db.DateTime,    default=datetime.utcnow)

class EvenementMateriel(db.Model):
    __tablename__ = 'evenement_materiel'
    id            = db.Column(db.Integer, primary_key=True)
    evenement_id  = db.Column(db.Integer, db.ForeignKey('evenement.id'),  nullable=False)
    materiel_id   = db.Column(db.Integer, db.ForeignKey('materiel.id'),   nullable=False)
    quantite      = db.Column(db.Integer, default=1)
    notes         = db.Column(db.String(200), nullable=True)

# ================================================================
class RecuPaiement(db.Model):
    __tablename__  = 'recu_paiement'
    id             = db.Column(db.Integer, primary_key=True)
    numero         = db.Column(db.String(30), unique=True, nullable=False)  # RECU-2026-001
    date           = db.Column(db.DateTime,   default=datetime.utcnow)
    beneficiaire   = db.Column(db.String(200), nullable=False)  # Nom libre
    technicien_id  = db.Column(db.Integer, db.ForeignKey('technicien.id'), nullable=True)
    technicien     = db.relationship('Technicien', backref='recus', lazy=True)
    type_recu      = db.Column(db.String(30),  default='Reçu Prestation')  # Bulletin Salaire | Reçu Prestation
    salaire_base   = db.Column(db.Float,       default=0)
    total_primes   = db.Column(db.Float,       default=0)
    total_net      = db.Column(db.Float,       default=0)
    mois           = db.Column(db.String(30),  nullable=True)   # "Avril 2026"
    notes          = db.Column(db.Text,        nullable=True)
    cree_par       = db.Column(db.String(80),  nullable=True)

# ================================================================
class DepensePrestation(db.Model):
    __tablename__   = 'depense_prestation'
    id              = db.Column(db.Integer, primary_key=True)
    evenement_id    = db.Column(db.Integer, db.ForeignKey('evenement.id'), nullable=False)
    type_depense    = db.Column(db.String(50),  nullable=False)
    # Consommable | Prime technicien | Rémunération musicien | Autre
    description     = db.Column(db.String(200), nullable=False)
    beneficiaire    = db.Column(db.String(150), nullable=True)   # Nom libre
    technicien_id   = db.Column(db.Integer, db.ForeignKey('technicien.id'), nullable=True)
    technicien      = db.relationship('Technicien', backref='depenses', lazy=True)
    montant         = db.Column(db.Float,       default=0)
    statut          = db.Column(db.String(20),  default='En attente')  # Payé | En attente
    date_paiement   = db.Column(db.DateTime,    nullable=True)
    recu_id         = db.Column(db.Integer, db.ForeignKey('recu_paiement.id'), nullable=True)
    recu            = db.relationship('RecuPaiement', backref='depenses', lazy=True)
    operation_id    = db.Column(db.Integer,     nullable=True)
    date_creation   = db.Column(db.DateTime,    default=datetime.utcnow)
    cree_par        = db.Column(db.String(80),  nullable=True)

# ================================================================
class PrestationArchivee(db.Model):
    __tablename__   = 'prestation_archivee'
    id              = db.Column(db.Integer, primary_key=True)
    evenement_id    = db.Column(db.Integer, db.ForeignKey('evenement.id'), nullable=False, unique=True)
    evenement       = db.relationship('Evenement', backref='archive', lazy=True)
    date_archivage  = db.Column(db.DateTime,  default=datetime.utcnow)
    total_recettes  = db.Column(db.Float,     default=0)
    total_depenses  = db.Column(db.Float,     default=0)
    benefice_net    = db.Column(db.Float,     default=0)
    nb_depenses     = db.Column(db.Integer,   default=0)
    operation_id    = db.Column(db.Integer,   nullable=True)
    archive_par     = db.Column(db.String(80), nullable=True)
    notes           = db.Column(db.Text,      nullable=True)
