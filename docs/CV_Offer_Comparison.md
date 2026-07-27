# Extraction et comparaison — CV ↔ Offre d'emploi

Ce document décrit en détail les éléments extraits d'un CV et d'une offre d'emploi, ainsi que la façon dont ces éléments sont prétraités et comparés pour produire un score de compatibilité.

## 1. Objectif

Offrir une vue claire des champs et des informations utilisés par le moteur d'analyse afin que les décisions prises (score, points forts, axes d'amélioration, brouillon de lettre) soient traçables et modifiables.

## 2. Éléments extraits du CV

Les informations listées ci-dessous sont typiquement extraites du PDF du CV (ou de la version texte). Quand le CV est uploadé, le texte est analysé et ces éléments sont recherchés ou inférés.

- Identifiants et métadonnées
  - Nom / Prénom (si détectables)
  - Date d'ajout du fichier, taille, nom du fichier, URL de stockage
- Résumé / Bio
  - Phrase(s) d'accroche, objectif professionnel, résumé court
- Titres de poste (history)
  - Intitulés de postes occupés (ex. "Chef de projet", "Développeur Frontend")
  - Ordre chronologique et segmentation par période
- Entreprises et contexte
  - Noms d'employeurs précédents
  - Secteurs d'activité
- Périodes (dates)
  - Années de début/fin pour chaque expérience (permet mesurer expérience totale)
- Missions & responsabilités
  - Verbes d'action et responsabilités (ex. "gestion d'équipe", "coordination de projet")
- Réalisations / résultats chiffrés
  - KPI, pourcentages, chiffres (ex. "augmentation de 30%...")
- Compétences techniques et métiers
  - Technologies, outils, méthodologies (ex. "React", "SQL", "gestion de projet")
- Niveaux / seniority
  - Indices contextuels (ex. "Senior", "Lead", années d'expérience)
- Formation / diplôme
  - Intitulés de diplômes, établissements, années
- Certifications
  - Certificats (ex. "PMP", "AWS Certified")
- Langues
  - Langues citées et niveaux déclarés
- Mots-clés et entités nommées
  - Termes métiers et compétences utiles pour correspondance fine
- Contenu libre (lettre de motivation intégrée)
  - Si présent, peut servir au drafting de la lettre

> Remarque : l'extraction s'appuie sur `pdfjs-dist` pour convertir PDF → texte brut, puis des règles heuristiques + normalisation sont appliquées.

## 3. Éléments extraits de l'offre d'emploi

Les champs extraits depuis l'offre (BDD `job_offers` ou page d'annonce) :

- Métadonnées de l'offre
  - `id`, titre, entreprise, date de publication
- Intitulé du poste
  - Titre officiel recherché (ex. "Responsable Marketing")
- Description complète
  - Paragraphe(s) décrivant le poste
- Exigences / profil recherché
  - Compétences obligatoires et souhaitées
  - Années d'expérience requises
  - Diplômes requis
- Responsabilités principales
  - Liste ou phrases décrivant missions quotidiennes
- Localisation et mobilité
  - Ville, pays, télétravail possible
- Type de contrat
  - CDI, CDD, Freelance, temps plein/partiel
- Salaire (si présent)
  - Fourchette ou valeur
- Tags et mots-clés
  - Technologies, secteurs, mots-clés ajoutés par le recruteur

## 4. Prétraitement et normalisation (CV & Offre)

Avant comparaison, le texte est soumis aux étapes suivantes :

- Nettoyage
  - Suppression d'espaces excessifs, conversion des sauts de ligne en espaces, suppression d'en-têtes répétitifs
- Normalisation
  - Mise en minuscule, suppression d'accents si nécessaire, standardisation des tirets et apostrophes
- Tokenisation simple
  - Découpage en tokens alphanumériques (mots, chiffres)
- Reconnaissance d'entités (heuristique)
  - Extraction de dates, noms d'entreprise, intitulés, niveaux d'expérience et certifications via regex/heuristiques
- Détection de compétences
  - Matching de liste (lexique) + détection fuzzy (ex. "reactjs" ↔ "React")
- Vectorisation / embedding
  - Conversion du texte en vecteurs (embedding léger) pour comparaison sémantique

## 5. Méthodes de comparaison utilisées

La comparaison combine plusieurs approches complémentaires :

1. Correspondance lexicale (keywords)
   - On calcule l'intersection entre compétences/technologies extraites du CV et celles listées dans l'offre.
   - Poids plus fort pour compétences marquées exigées que pour compétences souhaitées.

2. Score d'expérience
   - On compare les années d'expérience extraites vs l'exigence dans l'offre.
   - Si l'offre demande `>= 5 ans` et le candidat a `>=5`, score favorable.
   - Partial scoring si le candidat a moins d'années mais des expériences pertinentes.

3. Matching de titre de poste
   - On compare l'intitulé courant du candidat et le titre recherché (string similarity, token overlap).
   - Title normalization (ex. "Lead"/"Senior" reconnu).

4. Formation & certifications
   - Vérification de la conformité (ex. diplôme requis) et présence de certifications spécifiques.

5. Localisation & mobilité
   - Si l'offre exige une présence locale et que le candidat est local → +points.
   - Télétravail / mobilité modifie le poids de la contrainte.

6. Comparaison sémantique (embedding)
   - On crée un embedding léger (vecteur) pour le texte CV et le texte de l'offre (titre + description + exigences).
   - On calcule une similarité cosinus entre embeddings pour capter des similitudes sémantiques là où le matching lexical échoue.

7. Règles business et pondérations
   - Certaines composantes (compétences obligatoires, contract type, expérience minimale) ont un poids élevé.
   - D'autres (langues, formation) ont un poids moyen.
   - L'algorithme combine les sous-scores en un `match_score` final entre 0 et 100.

## 6. Exemple de combinaison de scores (schématique)

- skills_score (0–40) : overlap des compétences, exigences obligatoires pénalisent fortement l'absence
- experience_score (0–25) : basé sur années et pertinence
- title_score (0–10) : similarité d'intitulé
- education_score (0–10) : conformité diplômes/certifications
- semantic_score (0–15) : similarité d'embedding

Final score = clamp(round(skills_score + experience_score + title_score + education_score + semantic_score), 0, 100)

## 7. Cache et persistances

- Les résultats d'analyse par candidat+offre sont stockés en cache (`ai_analysis_cache`) pour éviter d'appeler le service IA à chaque clic.
- Lors d'une mise à jour du CV (nouvel upload), le `cv_text` en base est mis à jour et le cache peut être invalidé pour les offres concernées.

## 8. Limitations connues

- Fiabilité de l'extraction PDF : dépend de la qualité du PDF (scans, images) et du worker `pdfjs-dist`.
- Modèle IA : la qualité de la réponse (structure JSON) dépend du prompt et du service utilisé; il faut gérer les cas où le modèle renvoie du texte non-JSON.
- Sensibilité aux formulations : certains synonymes métiers peuvent manquer sans dictionnaire étendu.

## 9. Recommandations d'amélioration

- Enrichir le lexique de compétences métier et mappings synonymes (ex. "gestion produit" ↔ "product management").
- Ajouter une étape d'étiquetage par ML (NER) pour mieux extraire entités entreprises, dates, rôles.
- Mettre en place un test d'acceptation qui compare deux offres différentes pour un même CV et vérifie la variance des scores.

## 10. Références dans le code

- Extraction PDF et mise à jour `cv_text` : `src/services/aiMatchingService.ts`
- Analyse IA / prompt + cache : `src/services/groqAnalysisService.ts`
- Hooks et composants UI qui déclenchent l'analyse : `src/pages/public/JobOfferDetailPage.tsx`, `src/features/profile/components/sections/DocumentsSection.tsx`, `src/pages/candidate/CandidateCVPage.tsx`

---

