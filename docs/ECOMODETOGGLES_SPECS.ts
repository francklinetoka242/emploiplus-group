/**
 * SPECIFICATIONS - Composant EcoModeToggle dans la Sidebar
 * 
 * Design visual, responsive, et comportementales
 */

// ═══════════════════════════════════════════════════════════════════════════
// 📱 RESPONSIVE BREAKPOINTS
// ═══════════════════════════════════════════════════════════════════════════

export const ResponsiveSpecifications = {
  // Mobile (< 768px)
  mobile: {
    breakpoint: "< 768px",
    sidebarMode: "DRAWER",
    toggleVariant: "expanded",
    toggleWidth: "100%",
    toggleHeight: "50px",
    touchZone: "48px minimum",
    padding: "px-4 py-4",
    layout: "Full-width in drawer footer",
    state: "Visible by default",
    description: "Drawer slides from left, toggle expanded with text",
  },

  // Tablet (768px - 1024px)
  tablet: {
    breakpoint: "768px - 1024px",
    sidebarMode: "SIDEBAR (collapsed possible)",
    toggleVariant: "compact or expanded",
    toggleWidth: "44px (compact) or 100% (expanded)",
    toggleHeight: "44px",
    touchZone: "44px minimum",
    padding: "px-2 py-2 (compact)",
    layout: "Toggle below nav, above logout",
    state: "Adapts with sidebar state",
    description: "Adapts based on sidebar open/close state",
  },

  // Desktop (> 1024px)
  desktop: {
    breakpoint: "> 1024px",
    sidebarMode: "SIDEBAR (fixed or collapsible)",
    toggleVariant: "compact or expanded",
    toggleWidth: "44px (collapsed) or auto (expanded)",
    toggleHeight: "40px",
    touchZone: "44px minimum",
    padding: "px-2 py-2",
    layout: "Toggle below nav, above logout",
    state: "Sidebar always visible",
    description: "Toggle adapts with sidebar collapse/expand animation",
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 🎨 DESIGN SPECIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════

export const DesignSpecifications = {
  colors: {
    inactive: {
      background: "bg-slate-950/90",
      text: "text-slate-200",
      icon: "text-slate-200",
      switch: "bg-slate-700",
      border: "border-white/10",
    },
    active: {
      background: "bg-green-600/20",
      text: "text-green-300",
      icon: "text-green-300",
      switch: "bg-green-600/50",
      border: "border-white/10",
    },
    hover: {
      inactive: "hover:bg-slate-900/90",
      active: "hover:bg-green-600/30",
    },
  },

  spacing: {
    padding: "px-3 py-2.5",
    gap: "gap-3",
    roundness: "rounded-lg",
    borderRadius: "border-white/10",
  },

  typography: {
    label: "text-sm font-medium",
    status: "text-xs text-slate-400 / text-green-200",
  },

  animations: {
    transition: "transition-all duration-250",
    hover: "group-hover:text-slate-100",
  },

  icons: {
    primary: "h-5 w-5",
    secondary: "h-4 w-4",
    container: "h-9 w-9 flex items-center justify-center rounded-lg",
  },

  switch: {
    width: "w-11",
    height: "h-6",
    padding: "p-1",
    roundness: "rounded-full",
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 🔘 TOGGLE STATES
// ═══════════════════════════════════════════════════════════════════════════

export const ToggleStates = {
  off: {
    label: "Économie de données",
    status: "Désactivé",
    icon: "leaf",
    backgroundColor: "bg-slate-950/90",
    textColor: "text-slate-200",
    switchIcon: "ToggleLeft",
    switchBackground: "bg-slate-700",
    ariaLabel: "Économie de données - désactivé",
    ariaPressed: false,
  },

  on: {
    label: "Économie de données",
    status: "Activé",
    icon: "leaf",
    backgroundColor: "bg-green-600/20",
    textColor: "text-green-300",
    switchIcon: "ToggleRight",
    switchBackground: "bg-green-600/50",
    ariaLabel: "Économie de données - activé",
    ariaPressed: true,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 📐 LAYOUT STRUCTURE
// ═══════════════════════════════════════════════════════════════════════════

export const LayoutStructure = `
SIDEBAR FOOTER STRUCTURE :
=========================

┌─────────────────────────────────┐
│  MAIN SIDEBAR CONTENT (nav)     │
│  (Existing menu items)           │
│  - Dashboard                     │
│  - Profile                       │
│  - Documents                     │
│  - Applications                  │
│  - ...                           │
├─────────────────────────────────┤  ← border-t border-white/5
│  ⚙️ SETTINGS SECTION             │
│  ┌──────────────────────────────┐│
│  │ 🌙 Mode sombre | [TOGGLE]    ││  (Existing)
│  └──────────────────────────────┘│
├─────────────────────────────────┤
│  🌱 ECO MODE TOGGLE (NEW)        │
│  ┌──────────────────────────────┐│
│  │ 🍃 Économie de données       ││
│  │    Activé/Désactivé   [⊕⊗]  ││
│  └──────────────────────────────┘│
├─────────────────────────────────┤
│  🚪 LOGOUT BUTTON                │
│  ┌──────────────────────────────┐│
│  │ 🚪 Déconnexion              ││
│  └──────────────────────────────┘│
└─────────────────────────────────┘

MOBILE DRAWER STRUCTURE :
========================

╔═════════════════════════════════╗
║ Drawer (w-4/5 of screen)        ║
║                          [✕]    ║
╠─────────────────────────────────╢
║ 👤 User Profile                 ║
║ John Doe                        ║
║ john@example.com                ║
╠─────────────────────────────────╢
║ 📋 NAVIGATION                   ║
║ - Dashboard                     ║
║ - Profile                       ║
║ - Documents                     ║
║ - Applications                  ║
║ - Saved Offers                  ║
║ - Notifications                 ║
║ - Settings                      ║
╠─────────────────────────────────╢
║ 🌙 Dark Mode | [TOGGLE]         ║
╠─────────────────────────────────╢
║ 🌱 ECO MODE TOGGLE (NEW)        ║
║ ┌────────────────────────────┐  ║
║ │ 🍃 Économie de données    │  ║
║ │    Activé/Désactivé [⊕⊗] │  ║
║ └────────────────────────────┘  ║
╠─────────────────────────────────╢
║ ┌────────────────────────────┐  ║
║ │ 🚪 Déconnexion             │  ║
║ └────────────────────────────┘  ║
╚═════════════════════════════════╝
`;

// ═══════════════════════════════════════════════════════════════════════════
// 💫 INTERACTIONS & ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════════

export const InteractionBehavior = {
  onClick: {
    action: "toggleEcoMode()",
    result: "isEcoMode inverted, localStorage updated",
    animation: "colors fade-in 250ms",
    feedback: "Colors change immediately, switch animates",
  },

  onHover: {
    desktop: "Background color changes",
    mobile: "No hover (touch devices)",
    animation: "duration-250 ease-in-out",
  },

  onFocus: {
    keyboard: "Tab to focus toggle",
    visual: "ring-2 ring-secondary (outline)",
    animation: "instant",
  },

  onKeyboard: {
    Enter: "toggleEcoMode()",
    Space: "toggleEcoMode()",
    Escape: "Close drawer (mobile only)",
  },

  responsiveAdaptation: {
    sidebarOpen: {
      variant: "expanded",
      width: "100%",
      icon: "visible",
      label: "Économie de données",
      status: "Activé / Désactivé",
    },

    sidebarClosed: {
      variant: "compact",
      width: "44px",
      icon: "visible",
      label: "hidden",
      status: "hidden",
      tooltip: "Shows on hover/focus",
    },

    mobileDrawer: {
      variant: "expanded",
      width: "100%",
      icon: "visible",
      label: "Économie de données",
      status: "Activé / Désactivé",
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// ♿ ACCESSIBILITY CHECKLIST
// ═══════════════════════════════════════════════════════════════════════════

export const AccessibilityChecklist = [
  "✅ aria-label: Descriptive label with current state",
  "✅ aria-pressed: Indicates pressed/unpressed state",
  "✅ type='button': Semantic HTML",
  "✅ Keyboard accessible: Tab, Enter, Space work",
  "✅ Focus visible: Outline visible on focus",
  "✅ Color contrast: WCAG AA compliant (4.5:1+)",
  "✅ Touch target: Min 44x44px (iOS), 48x48px (Material)",
  "✅ Screen reader: Label reads correctly",
  "✅ No hidden content: All states announced",
  "✅ Prefers-reduced-motion: Transitions disabled if set",
];

// ═══════════════════════════════════════════════════════════════════════════
// 📊 VISUAL MOCKUPS (ASCII)
// ═══════════════════════════════════════════════════════════════════════════

export const DesktopSidebarOpen = `
DESKTOP - Sidebar OPEN (expanded toggle)
═════════════════════════════════════════

┌───────────────────────────────────────┐
│ ≡  LOGO                            ◀  │  ← Collapse button
├───────────────────────────────────────┤
│ 👤 John Doe                           │
│    john@example.com                   │
├───────────────────────────────────────┤
│                                       │
│ Mon espace                            │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│ 🏠 Tableau de bord                    │
│ 👤 Mon profil                         │
│ 📄 Documents                          │
│ 📤 Mes candidatures                   │
│ ❤️  Offres enregistrées                │
│ 🔔 Notifications                      │
│ ⚙️  Paramètres                         │
│                                       │
├───────────────────────────────────────┤
│ 🌙 Mode sombre        [◀|▶]  Activé   │
├───────────────────────────────────────┤
│ 🌱 Économie de données                │
│    Activé             [◀|▶]           │  ← NEW TOGGLE
├───────────────────────────────────────┤
│ ┌─────────────────────────────────┐  │
│ │ 🚪 Déconnexion                  │  │
│ └─────────────────────────────────┘  │
└───────────────────────────────────────┘

DESKTOP - Sidebar CLOSED (compact toggle)
═════════════════════════════════════════

┌──┐
│ ≡│  ← Menu toggle
├──┤
│🏠│  
│👤│  
│📄│  
│📤│  
│❤️ │  
│🔔│  
│⚙️ │  
├──┤
│🌙│ ◀ (Hover → Tooltip: "Mode sombre")
├──┤
│🌱│ ◀ (Hover → Tooltip: "Économie de données")  NEW
├──┤
│🚪│ ◀ (Hover → Tooltip: "Déconnexion")
└──┘
`;

export const MobileDraer = `
MOBILE - Drawer (expanded toggle)
═════════════════════════════════

╔═══════════════════════════════════╗
║ ✕ CLOSE                           ║
╠═══════════════════════════════════╢
║ 👤 John Doe                       ║
║    john@example.com               ║
╠═══════════════════════════════════╢
║ ▼ NAVIGATION PUBLIQUE             ║
║ 🏠 Accueil                        ║
║ 💼 Services                       ║
║ 🔍 Emplois                        ║
║ 📚 Blog                           ║
║ ℹ️  À propos                       ║
║ 📧 Contact                        ║
╠═══════════════════════════════════╢
║ Mon espace                        ║
║ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ║
║ 🏠 Tableau de bord                ║
║ 👤 Mon profil                     ║
║ 📄 Documents                      ║
║ 📤 Mes candidatures               ║
║ ❤️  Offres enregistrées             ║
║ 🔔 Notifications                  ║
║ ⚙️  Paramètres                     ║
╠═══════════════════════════════════╢
║ 🌙 Mode sombre    [◀|▶] Activé    ║
╠═══════════════════════════════════╢
║ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓   ║
║ ┃ 🌱 Économie de données     ┃   ║
║ ┃    Désactivé   [◀|▶]       ┃   ║
║ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛   ║  NEW
╠═══════════════════════════════════╢
║ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓   ║
║ ┃ 🚪 Déconnexion              ┃   ║
║ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛   ║
╚═══════════════════════════════════╝
`;

// ═══════════════════════════════════════════════════════════════════════════
// 🎯 COMPORTEMENT UTILISATEUR
// ═══════════════════════════════════════════════════════════════════════════

export const UserBehaviorFlow = `
SCÉNARIO 1 : Activer le Mode Économie (Desktop)
═════════════════════════════════════════════════

[Utilisateur clic sur toggle] 
        ↓
[État inverse: isEcoMode = true]
        ↓
[localStorage.setItem("emploiplus_eco_mode", "true")]
        ↓
[Colors change: gray → green]
        ↓
[Switch icon: ToggleLeft → ToggleRight]
        ↓
[Document.documentElement.classList.add("eco-mode-no-animations")]
        ↓
[Animations CSS désactivées]
        ↓
[<EcoImage /> components show placeholders]
        ↓
✅ Mode Économie Activé


SCÉNARIO 2 : Fermer la Sidebar et Regarder le Toggle (Desktop)
═════════════════════════════════════════════════════════════════

[Utilisateur clic sur menu toggle] 
        ↓
[Sidebar width: 288px → 80px]
        ↓
[EcoModeToggle variant: "expanded" → "compact"]
        ↓
[Toggle width: 100% → 44px]
        ↓
[Toggle height: 50px → 44px]
        ↓
[Label et status hidden]
        ↓
[Icon only visible]
        ↓
[Hover → Tooltip appears: "Économie de données - Activé"]
        ↓
✅ Toggle adapts seamlessly


SCÉNARIO 3 : Mode Économie sur Mobile
═════════════════════════════════════

[Utilisateur ouvre le drawer]
        ↓
[Drawer slides from left]
        ↓
[EcoModeToggle variant: "expanded"]
        ↓
[Toggle takes full width]
        ↓
[Zone tactile: 48px (>44px minimum)]
        ↓
[User taps toggle]
        ↓
[Feedback immédiat: colors change]
        ↓
[Images masquées si Mode Économie ON]
        ↓
✅ Works perfectly on mobile
`;

// ═══════════════════════════════════════════════════════════════════════════
// 📋 TECHNICAL CHECKLIST
// ═══════════════════════════════════════════════════════════════════════════

export const TechnicalChecklist = [
  "✅ Import EcoModeToggle in CandidateSidebar.tsx",
  "✅ Add import in imports section (line ~30)",
  "✅ Replace drawer footer section (~line 330)",
  "✅ Replace desktop footer section (~line 520)",
  "✅ Verify useEcoMode hook available",
  "✅ Verify EcoModeProvider wraps App.tsx",
  "✅ Verify EcoModeRootWrapper in App.tsx",
  "✅ Test variant='expanded' renders full toggle",
  "✅ Test variant='compact' renders icon only",
  "✅ Test toggle click inverts isEcoMode",
  "✅ Verify localStorage saves state",
  "✅ Verify colors change on toggle",
  "✅ Verify animations smooth (250ms)",
  "✅ Test on mobile (<768px)",
  "✅ Test on tablet (768px - 1024px)",
  "✅ Test on desktop (>1024px)",
  "✅ Test keyboard navigation (Tab, Enter, Space)",
  "✅ Test screen reader (NVDA, JAWS, VoiceOver)",
  "✅ Lighthouse accessibility > 95",
];

export default {
  ResponsiveSpecifications,
  DesignSpecifications,
  ToggleStates,
  LayoutStructure,
  InteractionBehavior,
  AccessibilityChecklist,
  DesktopSidebarOpen,
  MobileDraer,
  UserBehaviorFlow,
  TechnicalChecklist,
};
