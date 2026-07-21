/**
 * EXEMPLE D'INTÉGRATION - Mode Économie de Données
 * 
 * Ce fichier montre le point d'entrée complet du système.
 * À adapter selon votre structure existante.
 * 
 * Chemin : src/App.tsx (ou main.tsx selon votre setup)
 */

// ─────────────────────────────────────────────────────────────────
// 1. IMPORTS - Contexte & Providers
// ─────────────────────────────────────────────────────────────────

import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";

// Eco Mode
import { EcoModeProvider } from "@/contexts/EcoModeContext";
import { EcoModeRootWrapper } from "@/hooks/useEcoMode";

// UI & Styles
import "@/styles/eco-mode.css"; // ← IMPORTANT : Importer le CSS global
import "@/styles.css";

// Providers existants
import { I18nProvider } from "@/i18n";
import { Toaster } from "@/components/ui/sonner";
import { CandidateSidebarProvider } from "@/contexts/CandidateSidebarContext";

// Pages
import { HomePage, AuthPage, NotFoundPage } from "@/pages";

// ─────────────────────────────────────────────────────────────────
// 2. COMPOSANT APP PRINCIPAL
// ─────────────────────────────────────────────────────────────────

/**
 * Composant principal de l'application
 * 
 * Structure :
 * EcoModeProvider (top-level)
 *   └─ EcoModeRootWrapper (synchronise le contexte avec le DOM)
 *       └─ Autres providers (I18n, Sidebar, etc.)
 *           └─ Routes
 */
export function App(): React.ReactElement {
  return (
    <EcoModeProvider>
      {/* 
        EcoModeRootWrapper synchronise isEcoMode avec le document HTML
        et ajoute/retire les classes CSS d'animations
      */}
      <EcoModeRootWrapper>
        <I18nProvider>
          <CandidateSidebarProvider>
            {/* Notifications globales */}
            <Toaster />

            {/* Routes de l'application */}
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </CandidateSidebarProvider>
        </I18nProvider>
      </EcoModeRootWrapper>
    </EcoModeProvider>
  );
}

// ─────────────────────────────────────────────────────────────────
// 3. EXEMPLES D'UTILISATION DANS LES COMPOSANTS
// ─────────────────────────────────────────────────────────────────

/**
 * Exemple 1 : Composant avec images conditionnelles
 */
export function HeroSection(): React.ReactElement {
  import { EcoImage } from "@/components/EcoImage";

  return (
    <section className="hero">
      <EcoImage
        src="/images/hero-banner.jpg"
        alt="Banner principal"
        width={1200}
        height={400}
        ecoPlaceholderColor="#f0f0f0"
        ecoPlaceholderText="Bannière masquée (Mode Économie)"
      />
      <h1>Bienvenue sur EmploiPlus</h1>
    </section>
  );
}

/**
 * Exemple 2 : Composant avec animations conditionnelles
 */
export function AnimatedCard({ title, content }: { title: string; content: string }): React.ReactElement {
  import { useConditionalAnimation } from "@/hooks/useEcoMode";

  const animStyle = useConditionalAnimation("slideInUp");

  return (
    <div style={animStyle} className="card">
      <h2>{title}</h2>
      <p>{content}</p>
    </div>
  );
}

/**
 * Exemple 3 : Affichage conditionnel de contenu lourd
 */
export function VideoSection(): React.ReactElement {
  import { useEcoMode } from "@/contexts/EcoModeContext";

  const { isEcoMode } = useEcoMode();

  if (isEcoMode) {
    return (
      <section className="video-section">
        <div className="placeholder">
          <p>🎬 Vidéo masquée (Mode Économie)</p>
          <button onClick={() => window.location.reload()}>
            Charger la vidéo
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="video-section">
      <video controls width="100%" height="auto">
        <source src="/video.mp4" type="video/mp4" />
      </video>
    </section>
  );
}

/**
 * Exemple 4 : Bouton de contrôle du Mode Économie
 * (À placer dans la navigation ou un menu utilisateur)
 */
export function EcoModeToggleButton(): React.ReactElement {
  import { useEcoMode } from "@/contexts/EcoModeContext";

  const { isEcoMode, toggleEcoMode } = useEcoMode();

  return (
    <button
      onClick={toggleEcoMode}
      className="eco-mode-toggle"
      title={isEcoMode ? "Désactiver Mode Économie" : "Activer Mode Économie"}
      aria-label={isEcoMode ? "Mode Économie activé" : "Mode Économie désactivé"}
    >
      {isEcoMode ? "🌱 Mode Éco" : "📡 Mode Normal"}
    </button>
  );
}

/**
 * Exemple 5 : Affichage des statistiques
 */
export function EcoModeStats(): React.ReactElement {
  import { useEcoMode } from "@/contexts/EcoModeContext";
  import { EcoModeAnalytics, formatBytes } from "@/lib/eco-mode-utils";

  const { isEcoMode } = useEcoMode();
  const stats = EcoModeAnalytics.getStats();

  if (!isEcoMode) return <></>;

  return (
    <div className="eco-stats">
      <h3>📊 Économies du Mode Économie</h3>
      <ul>
        <li>Images bloquées : {stats.imagesBlocked}</li>
        <li>Données sauvegardées : {formatBytes(stats.estimatedBytesSaved)}</li>
        <li>Vidéos bloquées : {stats.videosBlocked}</li>
      </ul>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// 4. CHECKLIST D'INTÉGRATION
// ─────────────────────────────────────────────────────────────────

/**
 * ✅ CHECKLIST AVANT DE LANCER LA PRODUCTION
 * 
 * [ ] Importer @/styles/eco-mode.css dans main.tsx ou styles.css
 * [ ] Envelopper App avec <EcoModeProvider>
 * [ ] Ajouter <EcoModeRootWrapper> juste après le Provider
 * [ ] Remplacer les <img> critiques par <EcoImage />
 * [ ] Ajouter useEcoAnimations() aux animations importantes
 * [ ] Tester sur mobile (Chrome DevTools -> Network)
 * [ ] Vérifier localStorage quota (>5MB disponible)
 * [ ] Tester le toggle du Mode Économie
 * [ ] Valider que les images masquées affichent le placeholder
 * [ ] Vérifier les animations désactivées (className="eco-mode-no-animations")
 * [ ] Tester SSR (si applicable)
 * [ ] Vérifier l'accessibilité (screen readers)
 */

// ─────────────────────────────────────────────────────────────────
// 5. EXPORT
// ─────────────────────────────────────────────────────────────────

export default App;
