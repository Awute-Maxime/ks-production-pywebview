export interface User {
  username: string
  role: 'Administrateur' | 'Caissier' | 'Lecture seule'
  nom_complet?: string
  statut?: string
}

export interface Client {
  id: number
  numero: string
  nom: string
  adresse?: string
  telephone?: string
  email?: string
  nif?: string
  rccm?: string
}

export interface LigneFacture {
  service: string
  prix_unitaire: number
  quantite: number
  montant_ht: number
  montant_ttc: number
}

export interface Facture {
  id: number
  numero: string
  date: string
  nom_client: string
  service: string
  montant_ttc: number
  montant_paye: number
  reste_du: number
  mode_paiement?: string
  etat_paiement: 'Payer' | 'Non Payer' | 'Partiel' | 'Converti'
  type_operation: 'Recettes' | 'Proforma'
  section?: string
  cree_par?: string
  lignes?: LigneFacture[]
}

export interface Operation {
  id: number
  numero: string
  date: string
  nom_client?: string
  service?: string
  montant_ttc: number
  type_operation: 'Recettes' | 'Depenses'
  categorie?: string
  section?: string
}

export interface Paiement {
  id: number
  numero: string
  date: string
  facture_id: number
  n_facture: string
  nom_client: string
  montant_facture: number
  montant_paye: number
  reste_du: number
  mode_paiement?: string
  etat_facture: string
  notes?: string
}

export interface Evenement {
  id: number
  titre: string
  date: string
  heure_debut?: string
  heure_fin?: string
  nom_client?: string
  service?: string
  section?: string
  lieu?: string
  notes?: string
  statut: 'Confirmé' | 'Tentative' | 'Annulé' | 'Terminée'
  cree_par?: string
  facture_id?: number
}

export interface Technicien {
  id: number
  nom: string
  telephone?: string
  email?: string
  specialite?: string
  role?: string
  statut: 'Disponible' | 'Inactif'
  statut_emploi: 'Salarié' | 'Temporaire'
  salaire_base: number
  notes?: string
}

export interface Materiel {
  id: number
  nom: string
  categorie?: string
  marque?: string
  modele?: string
  quantite: number
  provenance: string
  cout_location: number
  statut: 'Disponible' | 'En location' | 'En maintenance'
  notes?: string
  fournisseur_id?: number
}

export interface Fournisseur {
  id: number
  nom: string
  telephone?: string
  email?: string
  adresse?: string
  type_service?: string
  notes?: string
}

export interface Service {
  id: number
  section: string
  libelle: string
  prix: number
  actif: boolean
}

export interface Parametres {
  nom_entreprise: string
  slogan?: string
  adresse?: string
  telephone?: string
  email?: string
  site_web?: string
  nif?: string
  rccm?: string
  couleur_principale: string
  mentions_legales?: string
  coordonnees_bancaires?: string
  logo_filename?: string
  cachet_filename?: string
}

export interface DashboardStats {
  total_recettes: number
  total_depenses: number
  solde_net: number
  total_impayes: number
  nb_factures: number
  nb_payees: number
  nb_impayes: number
  nb_partielles: number
  taux_recouvrement: number
  nb_techs_total: number
  nb_techs_dispos: number
  nb_materiels: number
  nb_fournisseurs: number
  prestations_mois: Evenement[]
  mois_labels: string[]
  mois_recettes: number[]
  mois_depenses: number[]
  sections_labels: string[]
  sections_values: number[]
  top_clients_labels: string[]
  top_clients_values: number[]
  alertes: Alerte[]
}

export interface Alerte {
  id: number
  titre: string
  message: string
  type: 'danger' | 'warning' | 'info'
  niveau: string
  icone: string
  lien: string
  lien_txt: string
  date: string
  client: string
}
