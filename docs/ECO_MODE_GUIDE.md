# 🌱 Mode Économie de Données - Guide d'Intégration

## 📋 Vue d'ensemble

Le **Mode Économie de Données** (Eco Mode) est un système global pour réduire la consommation de bande passante des utilisateurs en :

- ✅ Bloquant les images lourdes
- ✅ Désactivant les animations CSS/JS
- ✅ Empêchant le chargement de vidéos et iframes
- ✅ Persistant le choix localement (localStorage)
- ✅ **Aucune synchronisation Supabase** (zéro appels réseau)

---

## 🏗️ Architecture Technique

### Fichiers créés

```
src/
├── contexts/
│   └── EcoModeContext.tsx          # Contexte React + Provider + Hook
├── components/
│   └── EcoImage.tsx                 # Composant <EcoImage /> conditionnel
├── hooks/
│   └── useEcoMode.ts                # Hooks d'utilisation avancée
├── lib/
│   └── eco-mode-utils.ts            # Utilitaires et classes helper
└── styles/
    └── eco-mode.css                 # Styles CSS pour animations/placeholders
```

### Flux de données

```
App.tsx
  └─ EcoModeProvider
       └─ EcoModeRootWrapper
            └─ Application
                 ├─ useEcoMode() → isEcoMode, toggleEcoMode
                 ├─ useEcoAnimations() → shouldDisableAnimations
                 ├─ <EcoImage /> → Placeholder ou image
                 └─ ...
```

---

## 🚀 Étapes d'intégration

### 1️⃣ Envelopper l'app avec le Provider

**Fichier : `src/App.tsx`**

```tsx
import { EcoModeProvider } from "@/contexts/EcoModeContext";
import { EcoModeRootWrapper } from "@/hooks/useEcoMode";

export function App() {
  return (
    <EcoModeProvider>
      <EcoModeRootWrapper>
        <I18nProvider>
          <Toaster />
          <Routes>
            {/* Vos routes */}
          </Routes>
        </I18nProvider>
      </EcoModeRootWrapper>
    </EcoModeProvider>
  );
}
```

### 2️⃣ Importer les styles CSS

**Fichier : `src/main.tsx` ou `src/styles.css`**

```tsx
// Dans main.tsx
import "@/styles/eco-mode.css";
import "@/styles.css";
```

Ou simplement ajouter en haut de `src/styles.css` :

```css
@import url("./styles/eco-mode.css");
```

### 3️⃣ Remplacer `<img>` par `<EcoImage />`

**Avant :**
```tsx
<img src="/images/hero.jpg" alt="Hero image" width={800} height={600} />
```

**Après :**
```tsx
import { EcoImage } from "@/components/EcoImage";

<EcoImage 
  src="/images/hero.jpg" 
  alt="Hero image" 
  width={800} 
  height={600}
/>
```

### 4️⃣ Utiliser les hooks pour animations conditionnelles

**Composant avec animation :**

```tsx
import { useConditionalAnimation, useEcoAnimations } from "@/hooks/useEcoMode";

export function FadeInComponent() {
  const animStyle = useConditionalAnimation("fadeIn");
  const shouldDisable = useEcoAnimations();

  return (
    <div style={animStyle}>
      {shouldDisable && <p>Mode Économie actif</p>}
      Contenu animé
    </div>
  );
}
```

---

## 📚 Exemples d'Utilisation

### Exemple 1 : Utilisation basique du contexte

```tsx
import { useEcoMode } from "@/contexts/EcoModeContext";

export function Dashboard() {
  const { isEcoMode, toggleEcoMode } = useEcoMode();

  return (
    <div>
      <p>Mode Économie : {isEcoMode ? "Activé ✅" : "Désactivé ❌"}</p>
      <button onClick={toggleEcoMode}>
        {isEcoMode ? "Désactiver" : "Activer"} Mode Économie
      </button>
    </div>
  );
}
```

### Exemple 2 : Images réactives

```tsx
import { EcoImage } from "@/components/EcoImage";

export function ImageGallery() {
  return (
    <div className="gallery">
      <EcoImage
        src="/gallery/photo-1.jpg"
        alt="Photo 1"
        width={400}
        height={300}
        ecoPlaceholderColor="#f3f4f6"
        ecoPlaceholderText="Photo masquée"
      />
      
      <EcoImage
        src="/gallery/photo-2.jpg"
        alt="Photo 2"
        width={400}
        height={300}
      />
    </div>
  );
}
```

### Exemple 3 : Animations conditionnelles

```tsx
import { useConditionalTransition, useEcoAnimations } from "@/hooks/useEcoMode";

export function HoverCard() {
  const transitionStyle = useConditionalTransition("transform 0.2s ease");
  const shouldDisable = useEcoAnimations();

  return (
    <div 
      style={{
        ...transitionStyle,
        transform: shouldDisable ? "scale(1)" : "scale(1.05)",
      }}
      className="card"
    >
      Contenu interactif
    </div>
  );
}
```

### Exemple 4 : Chargement conditionnel de vidéos

```tsx
import { useEcoMode } from "@/contexts/EcoModeContext";

export function VideoPlayer() {
  const { isEcoMode } = useEcoMode();

  if (isEcoMode) {
    return (
      <div className="video-placeholder">
        <p>🎬 Vidéo masquée (Mode Économie)</p>
        <a href="#view-full">Charger la vidéo</a>
      </div>
    );
  }

  return (
    <video controls width="100%" height="auto">
      <source src="/video.mp4" type="video/mp4" />
      Votre navigateur ne supporte pas la vidéo
    </video>
  );
}
```

### Exemple 5 : Utilitaires avancés

```tsx
import { 
  estimateDataSavings, 
  EcoModeAnalytics,
  formatBytes 
} from "@/lib/eco-mode-utils";

export function DataUsageStats() {
  // Estimer l'économie si on bloque 15 images
  const savings = estimateDataSavings("image", 15);

  // Tracker les assets bloqués
  EcoModeAnalytics.recordBlockedAsset("image", 250_000);

  // Afficher les statistiques
  const stats = EcoModeAnalytics.getStats();

  return (
    <div>
      <p>Économie estimée : {savings.humanReadable}</p>
      <p>Données sauvegardées : {formatBytes(stats.estimatedBytesSaved)}</p>
      <p>Images bloquées : {stats.imagesBlocked}</p>
    </div>
  );
}
```

---

## 🎯 Cas d'usage par page/composant

### Navigation & Headers
- Remplacer les logos `<img>` par `<EcoImage />`
- Logos vectoriels (SVG) restent inchangés

### Galeries & Albums
- Toutes les images → `<EcoImage />`
- Thumbnail + full size → placeholder en Mode Économie

### Cartes d'offres d'emploi
- Images de bannière → `<EcoImage />`
- Animations de hover → `useConditionalAnimation()`

### Sections avec vidéos
- Utiliser la logique conditionnelle du contexte
- Afficher thumbnail + bouton "Charger la vidéo"

### Formulaires
- Préserver les interactions
- Désactiver uniquement les transitions visuelles non essentielles

---

## 🔧 Configuration personnalisée

### Modifier la clé de stockage

**Fichier : `src/contexts/EcoModeContext.tsx`**

```tsx
const LOCAL_STORAGE_KEY = "emploiplus_eco_mode"; // À modifier
```

### Modifier les couleurs de placeholder

**Fichier : `src/components/EcoImage.tsx`**

```tsx
ecoPlaceholderColor="#e5e7eb"  // Gris par défaut
ecoPlaceholderText="Image masquée"  // Texte par défaut
```

### Ajouter des assets bloqués

**Fichier : `src/lib/eco-mode-utils.ts`**

```tsx
export const ECO_MODE_CONFIG = {
  // Ajouter ici
  svg: {
    blocked: false,  // true pour bloquer les SVG externes
    fallback: "placeholder",
    description: "SVG externes",
  },
};
```

---

## 📱 Performance & Optimisations

### Taille des fichiers

| Fichier | Taille | Impact |
|---------|--------|--------|
| `EcoModeContext.tsx` | ~3.5 KB | Minime |
| `EcoImage.tsx` | ~4.2 KB | Minime |
| `eco-mode-utils.ts` | ~7 KB | Minime |
| `eco-mode.css` | ~2 KB | Minime |

**Total : ~16.7 KB** (aucun impact significatif sur le bundle)

### Économies réelles estimées

| Type | Moyenne | 50 assets |
|------|---------|-----------|
| Images | 250 KB | **12.5 MB** |
| Vidéos | 5 MB | **250 MB** |
| Iframes | 200 KB | **10 MB** |

### Mobile (3G/4G)
- Sans Mode Économie : 50+ images = 12.5 MB minimum
- Avec Mode Économie : Zéro requête d'image
- **Économie : 12.5+ MB par session**

---

## 🧪 Tests & Validation

### Tester le contexte

```tsx
import { render, screen } from "@testing-library/react";
import { EcoModeProvider, useEcoMode } from "@/contexts/EcoModeContext";

function TestComponent() {
  const { isEcoMode } = useEcoMode();
  return <div>{isEcoMode ? "Eco ON" : "Eco OFF"}</div>;
}

test("should initialize from localStorage", () => {
  localStorage.setItem("emploiplus_eco_mode", "true");
  render(
    <EcoModeProvider>
      <TestComponent />
    </EcoModeProvider>
  );
  expect(screen.getByText("Eco ON")).toBeInTheDocument();
});
```

### Tester les images

```tsx
test("should show placeholder in eco mode", () => {
  render(
    <EcoModeProvider initialValue={true}>
      <EcoImage src="/test.jpg" alt="Test" />
    </EcoModeProvider>
  );
  expect(screen.getByText("Image masquée (Mode Éco)")).toBeInTheDocument();
});
```

---

## ⚠️ Points importants

✅ **À faire :**
- Utiliser `EcoImage` pour toutes les images externes
- Wrapper l'app avec `EcoModeProvider`
- Importer le fichier CSS global
- Tester sur mobile

❌ **À éviter :**
- Faire des appels Supabase pour synchroniser le Mode Économie
- Bloquer les SVG inline
- Désactiver les hover states
- Persister dans la base de données

---

## 📞 Support & Questions

Pour les images SVG inline :
```tsx
// ✅ OK - Pas d'appel réseau
<svg>...</svg>

// ⚠️ À éviter - Appel réseau
<img src="https://cdn.example.com/icon.svg" />

// ✅ Utiliser EcoImage
<EcoImage src="https://cdn.example.com/icon.svg" alt="Icon" />
```

Pour les animations système (prefers-reduced-motion) :
```tsx
// Combine automatiquement avec isEcoMode
useEcoAnimations(); // Retourne true si l'une des deux conditions est vraie
```

---

## 🎓 Prochaines étapes

1. ✅ Intégrer le Provider dans `App.tsx`
2. ✅ Remplacer les `<img>` critiques par `<EcoImage />`
3. ✅ Convertir les animations importantes avec les hooks
4. ✅ Ajouter un bouton toggle dans la UI (prochaine partie)
5. ✅ Tester sur mobile réel
6. ✅ Monitorer les économies avec `EcoModeAnalytics`

---

**Version :** 1.0.0  
**Date :** 2026-07-17  
**Maintenance :** À jour
