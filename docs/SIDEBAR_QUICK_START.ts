/**
 * SIDEBAR INTEGRATION - EXPORT & INDEX
 * 
 * Point de départ pour intégrer le Mode Économie dans la Sidebar
 */

// ═══════════════════════════════════════════════════════════════════════════
// 📂 FICHIERS CRÉÉS - PHASE 2
// ═══════════════════════════════════════════════════════════════════════════

export const PHASE2_FILES = {
  component: {
    path: "src/components/candidate/EcoModeToggle.tsx",
    size: "7 KB",
    type: "React Component",
    description: "Composant toggle Mode Économie - 3 variantes",
  },
  documentation: {
    guide: "docs/SIDEBAR_INTEGRATION_GUIDE.ts",
    fragments: "docs/SIDEBAR_CODE_FRAGMENTS.ts",
    specs: "docs/ECOMODETOGGLES_SPECS.ts",
    summary: "docs/PHASE2_SIDEBAR_UI_SUMMARY.md",
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 🎯 ÉTAPES RAPIDES
// ═══════════════════════════════════════════════════════════════════════════

export const QUICK_INTEGRATION = [
  {
    step: 1,
    title: "Ouvrir le fichier",
    action: "src/components/candidate/CandidateSidebar.tsx",
    time: "30s",
  },
  {
    step: 2,
    title: "Ajouter l'import",
    action: 'import { EcoModeToggle } from "@/components/candidate/EcoModeToggle";',
    location: "Line ~30 (avec autres imports)",
    time: "10s",
  },
  {
    step: 3,
    title: "Remplacer le footer du DRAWER",
    action: "Copier le code depuis SIDEBAR_CODE_FRAGMENTS.ts > DrawerFooterFragment",
    location: "Line ~330",
    time: "1min",
  },
  {
    step: 4,
    title: "Remplacer le footer du SIDEBAR",
    action: "Copier le code depuis SIDEBAR_CODE_FRAGMENTS.ts > DesktopFooterFragment",
    location: "Line ~520",
    time: "1min",
  },
  {
    step: 5,
    title: "Tester",
    action: "npm run dev && Ouvrir http://localhost:5173",
    time: "2min",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 📚 GUIDE DE LECTURE (Ordre recommandé)
// ═══════════════════════════════════════════════════════════════════════════

export const READING_ORDER = [
  {
    num: 1,
    file: "PHASE2_SIDEBAR_UI_SUMMARY.md",
    reason: "Vue d'ensemble + visuels ASCII",
    time: "5 min",
  },
  {
    num: 2,
    file: "SIDEBAR_CODE_FRAGMENTS.ts",
    reason: "Code prêt à copier-coller",
    time: "3 min",
  },
  {
    num: 3,
    file: "SIDEBAR_INTEGRATION_GUIDE.ts",
    reason: "Guide détaillé étape-par-étape",
    time: "10 min",
  },
  {
    num: 4,
    file: "ECOMODETOGGLES_SPECS.ts",
    reason: "Specs complètes & checklists",
    time: "15 min",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 🎨 COMPOSANT ECOMODETOGGLES - PREVIEW
// ═══════════════════════════════════════════════════════════════════════════

export const COMPONENT_PREVIEW = {
  name: "EcoModeToggle",
  location: "src/components/candidate/EcoModeToggle.tsx",
  variants: ["compact", "expanded", "full"],
  icons: ["leaf", "zap"],
  colors: {
    inactive: "Gris (slate-950/90)",
    active: "Vert (green-600/20)",
  },
  responsiveness: {
    mobile: "Expanded, full-width",
    tablet: "Adapts with sidebar",
    desktop: "Compact or expanded",
  },
  accessibility: {
    ariaLabel: "✅ Oui",
    ariaPressed: "✅ Oui",
    keyboardNav: "✅ Tab, Enter, Space",
    screenReader: "✅ Compatible",
    touchTarget: "✅ 44x44px minimum",
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 💡 CAS D'UTILISATION
// ═══════════════════════════════════════════════════════════════════════════

export const USE_CASES = [
  {
    device: "📱 Mobile",
    screen: "< 768px",
    mode: "Drawer",
    toggle: "Expanded (full-width)",
    example: '<EcoModeToggle variant="expanded" />',
  },
  {
    device: "📱 Tablet",
    screen: "768px - 1024px",
    mode: "Sidebar",
    toggle: "Adapts (open/close)",
    example: '<EcoModeToggle variant={open ? "expanded" : "compact"} />',
  },
  {
    device: "🖥️ Desktop",
    screen: "> 1024px",
    mode: "Sidebar",
    toggle: "Adapts (open/close)",
    example: '<EcoModeToggle variant={open ? "expanded" : "compact"} showStats={open} />',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 🔍 INTEGRATION CHECKLIST
// ═══════════════════════════════════════════════════════════════════════════

export const INTEGRATION_CHECKLIST = {
  before: [
    "✅ CandidateSidebar.tsx ouvert en tant que fichier de travail",
    "✅ Vérifier ligne count du fichier (~600 lignes)",
    "✅ Lire les commentaires sections (Footer - Logout)",
    "✅ Vérifier structure du drawer et sidebar",
  ],
  during: [
    "✅ Ajouter import EcoModeToggle (~ligne 30)",
    "✅ Remplacer drawer footer (~ligne 330)",
    "✅ Remplacer sidebar footer (~ligne 520)",
    "✅ Vérifier pas d'erreurs TypeScript",
  ],
  after: [
    "✅ npm run dev pour démarrer dev server",
    "✅ Tester toggle fonctionne",
    "✅ Tester localStorage sauvegarde état",
    "✅ Tester responsive (DevTools)",
    "✅ Tester keyboard navigation",
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// ⚙️ PROPS REFERENCE
// ═══════════════════════════════════════════════════════════════════════════

export const PROPS_REFERENCE = {
  variant: {
    type: '"compact" | "expanded" | "full"',
    default: '"expanded"',
    description: "Affichage du toggle",
    usage: 'variant={open ? "expanded" : "compact"}',
  },
  iconType: {
    type: '"leaf" | "zap"',
    default: '"leaf"',
    description: "Icône affichée",
    usage: 'iconType="leaf"',
  },
  showStats: {
    type: "boolean",
    default: "false",
    description: "Afficher description",
    usage: "showStats={open}",
  },
  label: {
    type: "string",
    default: '"Économie de données"',
    description: "Texte du label",
    usage: 'label="Mode Économe"',
  },
  onChange: {
    type: "(isEcoMode: boolean) => void",
    default: "undefined",
    description: "Callback au changement",
    usage: "onChange={(mode) => console.log(mode)}",
  },
  disabled: {
    type: "boolean",
    default: "false",
    description: "Désactiver le toggle",
    usage: "disabled={isLoading}",
  },
  className: {
    type: "string",
    default: "undefined",
    description: "Classes Tailwind additionnelles",
    usage: 'className="custom-class"',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 🚨 PROBLÈMES COURANTS & SOLUTIONS
// ═══════════════════════════════════════════════════════════════════════════

export const TROUBLESHOOTING = [
  {
    problem: "❌ EcoModeToggle not found",
    cause: "Import path incorrect ou fichier non créé",
    solution: 'Vérifier : import { EcoModeToggle } from "@/components/candidate/EcoModeToggle";',
  },
  {
    problem: "❌ Toggle ne change pas l'état",
    cause: "EcoModeProvider manquant dans App.tsx",
    solution: "Vérifier que EcoModeProvider enveloppe l'app complètement",
  },
  {
    problem: "❌ Images ne se masquent pas",
    cause: "<img> au lieu de <EcoImage />",
    solution: "Remplacer <img> par <EcoImage /> pour avoir l'effet",
  },
  {
    problem: "❌ localStorage ne persiste pas",
    cause: "EcoModeProvider config manquante",
    solution: "Vérifier useEffect dans EcoModeContext.tsx",
  },
  {
    problem: "❌ Zone tactile trop petite",
    cause: "Hauteur insuffisante sur mobile",
    solution: "Vérifier h-10 (40px) minimum, idéalement h-12 (48px)",
  },
  {
    problem: "❌ Pas de transition smooth",
    cause: "Tailwind CSS duration-250 non appliqué",
    solution: "Vérifier que Tailwind est chargé correctement",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 📊 FICHIERS PHASE 1 + PHASE 2
// ═══════════════════════════════════════════════════════════════════════════

export const ALL_FILES = {
  phase1: {
    contexts: "src/contexts/EcoModeContext.tsx",
    components: "src/components/EcoImage.tsx",
    hooks: "src/hooks/useEcoMode.ts",
    lib: "src/lib/eco-mode-utils.ts",
    types: "src/types/eco-mode.types.ts",
    styles: "src/styles/eco-mode.css",
  },
  phase2: {
    component: "src/components/candidate/EcoModeToggle.tsx",
    guide: "docs/SIDEBAR_INTEGRATION_GUIDE.ts",
    fragments: "docs/SIDEBAR_CODE_FRAGMENTS.ts",
    specs: "docs/ECOMODETOGGLES_SPECS.ts",
    summary: "docs/PHASE2_SIDEBAR_UI_SUMMARY.md",
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 📋 COMMANDES UTILES
// ═══════════════════════════════════════════════════════════════════════════

export const USEFUL_COMMANDS = [
  {
    cmd: "npm run dev",
    desc: "Lancer le dev server",
  },
  {
    cmd: "npm run build",
    desc: "Build production",
  },
  {
    cmd: "npm run lint",
    desc: "Vérifier erreurs",
  },
  {
    cmd: "npm run type-check",
    desc: "Vérifier types TypeScript",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 🎯 RÉSUMÉ VISUEL
// ═══════════════════════════════════════════════════════════════════════════

export const VISUAL_SUMMARY = `
AVANT (Sidebar actuelle)
════════════════════════

┌─────────────────────────────┐
│ ... Nav items ...           │
├─────────────────────────────┤
│ 🌙 Mode sombre [Toggle]    │
├─────────────────────────────┤
│ 🚪 Déconnexion              │
└─────────────────────────────┘


APRÈS (Avec Mode Économie)
════════════════════════════

┌─────────────────────────────┐
│ ... Nav items ...           │
├─────────────────────────────┤
│ 🌙 Mode sombre [Toggle]    │
├─────────────────────────────┤
│ 🌱 Éco Mode [Toggle] ✨    │  ← NOUVEAU
├─────────────────────────────┤
│ 🚪 Déconnexion              │
└─────────────────────────────┘
`;

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export default {
  PHASE2_FILES,
  QUICK_INTEGRATION,
  READING_ORDER,
  COMPONENT_PREVIEW,
  USE_CASES,
  INTEGRATION_CHECKLIST,
  PROPS_REFERENCE,
  TROUBLESHOOTING,
  ALL_FILES,
  USEFUL_COMMANDS,
  VISUAL_SUMMARY,
};
