# AUDIT UX/UI — PAGE FAQ EMPLOIPLUS GROUP

## 1) Localisation de la page

Fichier principal :
- src/pages/public/FAQPage.tsx

Route associée :
- src/App.tsx : route /faq dans le layout public

Composants et fichiers liés :
- src/components/site/PublicLayout.tsx : wrapper public avec SiteHeader, SiteFooter, CookieConsentBanner
- src/components/site/Header.tsx : navigation principale ; item FAQ visible
- src/components/site/Footer.tsx : footer global
- src/components/ui/accordion.tsx : composant Accordion utilisé sur la page
- src/features/faq/api/faqService.ts : chargement des FAQ et catégories depuis l’API
- api/faqs.ts : endpoint GET/POST/PUT/DELETE pour les FAQ
- api/faq-categories.ts : endpoint pour les catégories de FAQ
- src/i18n/translations.ts : libellés de la FAQ
- src/styles.css : design system, variables de couleur, shadows, radius, brand/secondary

## 2) Structure de la page

La page est construite comme une page publique avec un wrapper de layout puis un contenu central. On observe :
- un header de page avec badge, titre principal, sous-titre, puis un champ de recherche ;
- un bloc latéral de cartes d’accroche (Compte, Services, Confiance) ;
- une barre de filtres par catégorie sous forme de boutons pill ;
- des blocs de sections par catégorie ;
- dans chaque bloc, un Accordion Radix ;
- un CTA de fin avec contact + retour accueil.

La hiérarchie visuelle est claire dans l’intention : d’abord capter le besoin, puis filtrer, puis dévoiler les réponses. En pratique, la page essaie de faire beaucoup à la fois : recherche + cartes de contexte + filtres + accordéons + CTA. Cela crée un rythme visuel dense plutôt qu’un parcours éditorial maîtrisé.

## 3) Types de composants utilisés

- Accordion : src/components/ui/accordion.tsx, utilisé pour chaque question/réponse.
Rôle : ouvrir/fermer les réponses. Utile, standard, bien adapté à une FAQ.
- Input de recherche : input HTML natif dans FAQPage.tsx.
Rôle : recherche textuelle. Correct mais visuellement assez simple.
- Boutons : Link react-router + classes Tailwind, utilisés pour le CTA et les filtres.
Rôle : navigation et filtrage. Bonne utilité, bien intégrés au système.
- Cartes / blocs : plusieurs div avec rounded-2xl / rounded-3xl / border + bg-card + shadow-soft.
Rôle : séparation visuelle et mise en avant de contenus. Mais ici ils se multiplient et deviennent décoratifs plutôt qu’informatifs.
- Icônes : lucide-react (Search, Sparkles, UserRound, BriefcaseBusiness, ShieldCheck, etc.).
Rôle : guidage visuel rapide. Correct, mais utilisé en quantité importante dans un contexte compact, ce qui alourdit la page.
- Sections personnalisées : la page est une composition de sections et sous-sections autour de catégories.
Rôle : organisation des FAQs par domaine. Bonne idée, mais la répétition visuelle affaiblit la lisibilité globale.
- SEO : composant SEO intégré.
Rôle : métadonnées et breadcrumb. Conforme et utile.
- Layout global : PublicLayout, Header, Footer, CookieConsentBanner.
Rôle : cohérence site. Sans effet de substitution sur la FAQ elle-même.

## 4) Hiérarchie UX

L’utilisateur comprend rapidement :
1. qu’il est sur une FAQ : oui, grâce au badge “Centre d’aide” et au titre FAQ ;
2. comment rechercher : oui, le champ de recherche est visible dès le haut ;
3. comment parcourir : oui, via les filtres par catégorie ;
4. comment distinguer les catégories : assez bien, mais l’usage des badges-pills et des cartes de catégorie est répétitif ;
5. comment ouvrir/fermer une réponse : oui, la structure Accordion est conventionnelle et intuitive ;
6. comment contacter le service : oui, bouton “Nous contacter” présent.

Points de friction :
- trop d’éléments de surface au-dessus des FAQ elles-mêmes ;
- plusieurs niveaux visuels avant d’atteindre les réponses ;
- les cartes d’accroche décalent l’attention de la vraie information ;
- la page manque de rythme éditorial : le contenu est dense et la progression n’est pas assez simple.

La longueur des réponses dépend des données Supabase, mais la structure de la page ne met pas en place de hiérarchie de lecture forte. Les réponses apparaissent comme un bloc de contenu répétitif dans des conteneurs quasi identiques.

## 5) Analyse du design

Couleurs :
- primaire : --brand / --primary = #00009e ;
- secondaire : --secondary = #e8a900 ;
- neutres : background clair, cards blanches, muted gris bleu.

Le design système est cohérent avec la identité EmploiPlus. Cependant, sur la FAQ, la couleur secondaire est utilisée surtout comme accent décoratif, pas comme outil de hiérarchie. Elle n’est pas vraiment exploitée pour guider l’œil.

Fonds et gradients :
- le header principal utilise un gradient de brand vers secondary ;
- la page utilise beaucoup de backgrounds card / white / muted ;
- le résultat est correct techniquement, mais visuellement un peu “template SaaS”.

Bordures, radius, ombres :
- border-radius très présents : 32px, 30px, 28px, 24px, etc ;
- ombres soft très régulières ;
- cela rend la page propre, mais aussi générique.

Typographie :
- titres en font-display, bien lisibles ;
- sous-titres et corps de texte standardisés ;
- hiérarchie de taille correcte en théorie, mais trop standardisée sur cette page.

Largeur de contenu :
- max-w-6xl, bon pour desktop ;
- sur mobile, la densité reste élevée, surtout avec les cartes d’info au-dessus du contenu principal.

## 6) Détection du style “générique IA”

La page présente plusieurs symptômes typiques de design standardisé :
- gradients décoratifs sur la zone d’introduction ;
- multiplication de blocs arrondis et d’icônes dans des cercles ;
- mêmes effets d’ombre répétés ;
- cartes de mise en avant quasi identiques ;
- filtres pills très “SaaS” ;
- structure visuellement symétrique, mais sans vraie personnalité éditoriale.

Ce n’est pas du mauvais design, mais cela manque de singularité. La page “fonctionne” parce qu’elle est propre, claire et cohérente, mais elle reste générale. Elle ne semble ni très premium ni très propre à EmploiPlus Group. La personnalité manque surtout à la hiérarchie et au ton éditorial.

## 7) Couleur primaire / secondaire

La répartition est la suivante :
- primaire : utilisé pour le titre, le CTA, les éléments actifs, les accents de navigation ;
- secondaire : utilisé dans les gradients, dans quelques accents, mais peu comme outil de structure ;
- neutres : dominent la majorité des blocs.

Le point important : la couleur secondaire est sous-exploitée. Elle pourrait servir à :
- les catégories actives ;
- les éléments de guidage dans les sections ;
- la mise en valeur de certains sujets importants ;
- des états d’interaction plus distincts ;
- un rythme visuel plus émotionnel et moins purement technocratique.

## 8) Responsive

- mobile : le layout du header est compressé ; les cartes d’accroche occupent de la hauteur sans beaucoup de contexte ;
- tablette : la structure reste lisible, mais la densité visuelle reste forte ;
- desktop : la page est bien proportionnée, malgré la multiplication des blocs.

Le principal risque est la surcharge visuelle au-dessus du contenu réel. Sur mobile, le nombre de boîtes et de bordures peut donner un sentiment de surcharge plutôt que de clarté.

## 9) Accessibilité et interaction

Points positifs :
- la recherche a un label accessible via aria-label ;
- les CTA sont visuellement contrastés ;
- les accordéons sont standards et cliquables ;
- boutons et liens ont un bon contraste global.

Points à surveiller :
- plusieurs éléments ne sont pas des vrais contrôles avec états de focus explicites ;
- les cartes d’info sont non interactives mais visuellement lourdes ;
- l’accordion n’a pas de contexte narratif fort autour de chaque réponse ;
- la page repose largement sur la couleur et la forme, pas sur l’annotation de structure éditoriale.

## 10) Problèmes classés par priorité

CRITIQUE
- Aucun blocage réel fonctionnel constaté dans le code inspecté.

ÉLEVÉ
- Fichier : src/pages/public/FAQPage.tsx ; élément : bloc header + cartes de mise en avant ; problème : surcharge visuelle avant le contenu FAQ ; impact : l’utilisateur perçoit la page comme un template plutôt qu’un guide utile ; preuve : plusieurs `rounded-*`, `bg-card`, `shadow-soft`, `border`, `div` successifs ; priorité : élevée.
- Fichier : src/pages/public/FAQPage.tsx ; élément : filtres + catégories + cartes ; problème : hiérarchie confuse entre “navigation” et “contenu” ; impact : le parcours n’est pas assez éditorial ; preuve : répétition de pills et de blocs de mise en avant autour du vrai contenu ; priorité : élevée.

MOYEN
- Fichier : src/styles.css ; élément : variables de couleur ; problème : secondaire intéressant mais peu exploité dans la hiérarchie ; impact : perte d’identitéémotionnelle ; preuve : `--secondary: #e8a900` présent mais peu utilisé comme structure visuelle ; priorité : moyen.
- Fichier : src/components/ui/accordion.tsx ; élément : trigger ; problème : accordéon standard, sans différenciation forte entre questions ouvertes et fermées ; impact : moins de guidage visuel ; preuve : style minimal sur le trigger sans accent différencié ; priorité : moyen.

FAIBLE
- Fichier : src/pages/public/FAQPage.tsx ; élément : CTA final ; problème : CTA utile mais pas assez ancré dans le contexte de la FAQ ; impact : légère sensation de bloc “marketing” ajouté ; preuve : bouton de contact en fin de page ; priorité : faible.

## 11) Ce qui fonctionne bien

- la structure du contenu est cohérente et lisible ;
- la recherche est bien placée et utile ;
- le système d’accordéon est adapté à une FAQ ;
- le design system EmploiPlus est respecté sur les couleurs principales ;
- la page reste propre techniquement et fonctionne dans le cadre du site.

## 12) Recommandations pour la future refonte

- réduire la densité visuelle au-dessus des vraies questions ;
- limiter les gradients décoratifs et les cartes d’accroche ;
- garder des arrondis maîtrisés, sans surcharge ;
- créer une vraie hiérarchie éditoriale entre navigation, sections et réponses ;
- utiliser la couleur secondaire plus intelligemment pour guider l’attention ;
- renforcer la personnalité EmploiPlus plutôt que la sensation de template IA ;
- distinguer les catégories par structure plus que par simple pill ;
- renforcer le parcours “je cherche → je filtre → je trouve → je contacte” ;
- conserver la propreté générale, sans tomber dans le trop minimaliste.

## 13) Verdict final

État actuel : page fonctionnelle, propre et structurée, mais encore trop “template SaaS” pour un site qui mérite une identité plus humaine.
Principal problème UX : surcharge visuelle avant le cœur du contenu ; trop d’éléments de navigation et d’accroche avant les réponses.
Principal problème UI : répétition de cartes arrondies, ombres et accents décoratifs, sans vraie personnalité éditoriale.
Niveau de perception “design générique IA” : moyen à élevé.
Qualité de la hiérarchie : correcte, mais pas assez forte.
Utilisation de la couleur secondaire : insuffisante, sous-exploitée comme outil de guidage.
Priorité globale de refonte : élevée.
Score UX/UI sur 100 : 68/100.
