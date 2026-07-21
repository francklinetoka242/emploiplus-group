# 🎨 Mode Économie - Phase 2 : UI & Intégration Sidebar

## ✅ Ce qui a été créé

### 1️⃣ **Composant EcoModeToggle** 
📄 [src/components/candidate/EcoModeToggle.tsx](../../src/components/candidate/EcoModeToggle.tsx) (7 KB)

Un composant toggle moderne et fully responsive pour le Mode Économie.

**Caractéristiques :**
- ✅ 3 variantes : `compact`, `expanded`, `full`
- ✅ 2 icônes : `leaf` 🍃 ou `zap` ⚡
- ✅ Design moderne avec Tailwind CSS
- ✅ Support couleurs : gris (OFF) ↔ vert (ON)
- ✅ Switch toggle fluide
- ✅ Zone tactile 44px+ (mobile compliant)
- ✅ Accessibilité WCAG AA (ARIA, keyboard nav)
- ✅ Tooltips sur hover (desktop)
- ✅ Animations smooth 250ms

---

## 🎯 Comment Intégrer

### Étape 1️⃣ : Ajouter l'import
**Fichier :** `src/components/candidate/CandidateSidebar.tsx`

```tsx
import { EcoModeToggle } from "@/components/candidate/EcoModeToggle";
```

### Étape 2️⃣ : Intégrer dans le drawer mobile (~ligne 330)
```tsx
{/* Footer - Eco Mode Toggle + Logout */}
<div className="space-y-3 border-t border-white/5 px-4 py-4">
  <EcoModeToggle 
    variant="expanded"
    iconType="leaf"
    showStats={false}
  />
  <Button onClick={...}>Déconnexion</Button>
</div>
```

### Étape 3️⃣ : Intégrer dans la sidebar desktop (~ligne 520)
```tsx
{/* Footer - Eco Mode Toggle + Logout button */}
<div className="space-y-2 border-t border-white/5 px-2 py-4">
  <EcoModeToggle 
    variant={open ? "expanded" : "compact"}
    iconType="leaf"
    showStats={open}
  />
  {open ? (
    <Button onClick={onLogout}>Déconnexion</Button>
  ) : (
    <Tooltip>...</Tooltip>
  )}
</div>
```

---

## 📱 Responsive Behavior

| Device | Mode | Toggle | Zone Tactile |
|--------|------|--------|--------------|
| **Mobile** (<768px) | Drawer | Expanded 100% | 48px |
| **Tablet** (768-1024px) | Sidebar/Drawer | Adapts | 44px+ |
| **Desktop** (>1024px) | Sidebar | Compact/Expanded | 44px |

---

## 🎨 States Visuels

### OFF State (Désactivé)
```
┌─────────────────────────────────┐
│ 🍃 Économie de données          │
│    Désactivé          [◀|▶]     │
└─────────────────────────────────┘
```
- Fond : gris (`bg-slate-950/90`)
- Texte : gris (`text-slate-200`)
- Switch : gauche (`ToggleLeft`)

### ON State (Activé)
```
┌─────────────────────────────────┐
│ 🌱 Économie de données          │
│    Activé             [◀|▶]     │
└─────────────────────────────────┘
```
- Fond : vert (`bg-green-600/20`)
- Texte : vert (`text-green-300`)
- Switch : droite (`ToggleRight`)

---

## 💻 Exemple Complet - Desktop

### Sidebar Ouverte (Expanded)
```
┌──────────────────────────────────────┐
│ ≡ LOGO                            ◀  │
├──────────────────────────────────────┤
│ 👤 John Doe                          │
│    john@example.com                  │
├──────────────────────────────────────┤
│ Mon espace                           │
│ 🏠 Tableau de bord                   │
│ 👤 Mon profil                        │
│ 📄 Documents                         │
│ 📤 Mes candidatures                  │
│ ❤️  Offres enregistrées               │
│ 🔔 Notifications                     │
│ ⚙️  Paramètres                        │
├──────────────────────────────────────┤
│ 🌙 Mode sombre      [◀|▶] Activé     │
├──────────────────────────────────────┤
│ 🌱 Économie de données ✨ NOUVEAU    │
│    Activé           [◀|▶]            │
├──────────────────────────────────────┤
│ ┌──────────────────────────────────┐ │
│ │ 🚪 Déconnexion                   │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

### Sidebar Fermée (Compact)
```
┌────┐
│ ≡  │ ← Menu
├────┤
│ 🏠 │ ← Dashboard
│ 👤 │ ← Profile
│ 📄 │ ← Documents
│ 📤 │ ← Applications
│ ❤️  │ ← Saved
│ 🔔 │ ← Notifications
│ ⚙️  │ ← Settings
├────┤
│ 🌙 │ ← Dark Mode (hover: tooltip)
├────┤
│ 🌱 │ ← Eco Mode (hover: tooltip) ✨
├────┤
│ 🚪 │ ← Logout
└────┘
```
Hover sur 🌱 → Tooltip : "Économie de données - Activé"

---

## 📱 Exemple Mobile

### Drawer Ouvert
```
╔════════════════════════════════════╗
║ ✕ FERMER                          ║
╠════════════════════════════════════╢
║ 👤 John Doe                        ║
║    john@example.com                ║
╠════════════════════════════════════╢
║ 🏠 Tableau de bord                 ║
║ 👤 Mon profil                      ║
║ 📄 Documents                       ║
║ 📤 Mes candidatures                ║
║ ❤️  Offres enregistrées             ║
║ 🔔 Notifications                   ║
║ ⚙️  Paramètres                      ║
╠════════════════════════════════════╢
║ 🌙 Mode sombre   [◀|▶] Activé      ║
╠════════════════════════════════════╢
║ ┌────────────────────────────────┐ ║
║ │ 🌱 Économie de données         │ ║
║ │    Activé        [◀|▶]         │ ║
║ └────────────────────────────────┘ ║
╠════════════════════════════════════╢
║ ┌────────────────────────────────┐ ║
║ │ 🚪 Déconnexion                 │ ║
║ └────────────────────────────────┘ ║
╚════════════════════════════════════╝
```

---

## 🔧 Props du Composant

```tsx
<EcoModeToggle 
  // variant : Affichage
  variant="expanded"              // "compact" | "expanded" | "full"
  
  // iconType : Icône
  iconType="leaf"                 // "leaf" | "zap"
  
  // showStats : Afficher description
  showStats={false}               // boolean
  
  // label : Texte customisé
  label="Économie de données"     // string
  
  // onChange : Callback
  onChange={(isEcoMode) => {...}} // (boolean) => void
  
  // disabled : Désactiver
  disabled={false}                // boolean
  
  // className : Classes additionnelles
  className="custom-class"        // string
/>
```

---

## ✨ Comportements

### À chaque clic
1. `toggleEcoMode()` est appelé
2. `isEcoMode` s'inverse
3. localStorage est mis à jour
4. Couleurs changent (gris ↔ vert)
5. Switch icone change (`ToggleLeft` ↔ `ToggleRight`)
6. Document HTML : classe `eco-mode-no-animations` ajoutée/retirée
7. Animations CSS désactivées/réactivées
8. Images `<EcoImage />` se masquent/affichent

### Sur Desktop (Sidebar Open/Close)
- Sidebar s'ouvre → `variant="expanded"`
- Sidebar se ferme → `variant="compact"`
- Smooth transition 250ms
- Tooltip apparaît sur hover

### Sur Mobile
- Zone tactile minimum 48px (confortable)
- Full-width dans drawer
- Pas de tooltip (touch device)
- Feedback tactile immédiat

---

## 📚 Documentation Complète

| Document | Contenu |
|----------|---------|
| **SIDEBAR_INTEGRATION_GUIDE.ts** | Guide étape-par-étape |
| **SIDEBAR_CODE_FRAGMENTS.ts** | Code prêt à copier-coller |
| **ECOMODETOGGLES_SPECS.ts** | Specs détaillées + ASCII mockups |
| **ECO_MODE_SUMMARY.md** (Phase 1) | Infrastructure globale |

---

## ✅ Checklist Pré-Intégration

- [ ] Vérifier que `EcoModeProvider` enveloppe `App.tsx`
- [ ] Vérifier que `EcoModeRootWrapper` est présent
- [ ] Vérifier que CSS `eco-mode.css` est importé
- [ ] Hook `useEcoMode()` fonctionne
- [ ] Tester `<EcoImage />` sur une page (si possible)

## ✅ Checklist Post-Intégration

- [ ] Import `EcoModeToggle` ajouté
- [ ] Drawer footer remplacé (mobile)
- [ ] Sidebar footer remplacé (desktop)
- [ ] Test mobile (<768px) - Toggle complet + tactile
- [ ] Test tablet (768-1024px) - Adaptation
- [ ] Test desktop (>1024px) - Compact ↔ Expanded
- [ ] Clavier : Tab → Toggle visible, Enter/Space → Bascule
- [ ] Screen reader (NVDA/JAWS) : Label lu correctement
- [ ] localStorage sauvegarde l'état
- [ ] Colors changent immédiatement
- [ ] Animations smooth

---

## 🚀 Prochaines Étapes

1. **Tester l'intégration**
   - Copier le code
   - Remplacer le footer de la Sidebar
   - Tester sur tous les breakpoints

2. **Optimiser l'expérience**
   - Ajouter `<EcoImage />` sur pages critiques
   - Tester économies de données réelles
   - Monitorer avec analytics

3. **Polisher & Feedback**
   - Gather user feedback
   - Ajuster couleurs/layout si nécessaire
   - Ajouter animations avancées

---

## 📞 Support

**Q : Zone tactile assez grande ?**  
✅ A : 48px minimum sur mobile (>44px WCAG)

**Q : Couleurs cohérentes ?**  
✅ A : Vert (#10b981) pour ON, gris (#475569) pour OFF

**Q : Accessible au clavier ?**  
✅ A : Tab/Enter/Space fonctionnent, ARIA complète

**Q : Fonctionne en mode sombre ?**  
✅ A : Oui, couleurs adaptées (gris → vert clair)

---

**Version :** 2.0.0 (UI)  
**Date :** 2026-07-17  
**Status :** 🚀 Ready for Integration
