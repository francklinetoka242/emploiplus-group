/**
 * GUIDE D'INTÉGRATION - EcoModeToggle dans CandidateSidebar
 * 
 * Ce fichier montre exactement comment intégrer le toggle Mode Économie
 * dans le composant CandidateSidebar existant.
 * 
 * 📍 Localisation des modifications :
 * Fichier : src/components/candidate/CandidateSidebar.tsx
 */

// ═══════════════════════════════════════════════════════════════════════════
// ÉTAPE 1 : IMPORTER LE COMPOSANT ECOMODETOGGLES
// ═══════════════════════════════════════════════════════════════════════════

// ✅ Ajouter cette ligne aux imports existants (vers le haut du fichier) :

import { EcoModeToggle } from "@/components/candidate/EcoModeToggle";

// L'import complet ressemblera à :
/*
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { useCandidate } from "@/hooks/useCandidate";
import { EcoModeToggle } from "@/components/candidate/EcoModeToggle";  // ← NOUVEAU
import {
  Home,
  User,
  Briefcase,
  // ... autres icons
};
*/

// ═══════════════════════════════════════════════════════════════════════════
// ÉTAPE 2 : INTÉGRER DANS LA SECTION MOBILE (DRAWER)
// ═══════════════════════════════════════════════════════════════════════════

// ✅ LOCALISATION : Ligne ~330 du fichier (avant le bouton "Déconnexion")
// ✅ CHERCHER : "Footer - Logout" dans le drawer (isDrawer === true)

// AVANT :
/*
          {/* Footer - Logout */}
          <div className="border-t border-white/5 px-4 py-4">
            <Button
              onClick={() => {
                onOpenChange?.(false);
                onLogout?.();
              }}
              className="w-full gap-3 rounded-lg bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-2.5 text-sm font-medium transition-all duration-250 hover:from-red-600/20 hover:to-red-700/20 hover:text-red-300"
              variant="ghost"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </Button>
          </div>
*/

// APRÈS (✅ À REMPLACER) :
/*
          {/* Footer - Eco Mode Toggle + Logout */}
          <div className="space-y-3 border-t border-white/5 px-4 py-4">
            {/* Eco Mode Toggle - Version expanded pour mobile */}
            <div className="rounded-lg">
              <EcoModeToggle 
                variant="expanded"
                iconType="leaf"
                showStats={false}
              />
            </div>

            {/* Logout Button */}
            <Button
              onClick={() => {
                onOpenChange?.(false);
                onLogout?.();
              }}
              className="w-full gap-3 rounded-lg bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-2.5 text-sm font-medium transition-all duration-250 hover:from-red-600/20 hover:to-red-700/20 hover:text-red-300"
              variant="ghost"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </Button>
          </div>
*/

// ═══════════════════════════════════════════════════════════════════════════
// ÉTAPE 3 : INTÉGRER DANS LA SECTION DESKTOP (SIDEBAR)
// ═══════════════════════════════════════════════════════════════════════════

// ✅ LOCALISATION : Ligne ~520 du fichier (avant le bouton "Déconnexion")
// ✅ CHERCHER : "Footer - Logout button" dans le sidebar desktop

// AVANT :
/*
        {/* Footer - Logout button */}
        <div className="border-t border-white/5 px-2 py-4">
          {open ? (
            <Button
              onClick={onLogout}
              className={cn(
                "w-full gap-3 rounded-lg bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-2.5 text-sm font-medium transition-all duration-250 hover:from-red-600/20 hover:to-red-700/20 hover:text-red-300",
              )}
              variant="ghost"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </Button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onLogout}
                  size="icon"
                  className="h-10 w-10 rounded-lg bg-slate-800/50 transition-all duration-250 hover:bg-red-600/20 hover:text-red-300"
                  variant="ghost"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="rounded-lg border border-white/10 bg-slate-900 text-xs font-medium"
              >
                Déconnexion
              </TooltipContent>
            </Tooltip>
          )}
        </div>
*/

// APRÈS (✅ À REMPLACER) :
/*
        {/* Footer - Eco Mode Toggle + Logout button */}
        <div className="space-y-2 border-t border-white/5 px-2 py-4">
          {/* Eco Mode Toggle */}
          <EcoModeToggle 
            variant={open ? "expanded" : "compact"}
            iconType="leaf"
            showStats={open}  // Afficher stats quand sidebar ouverte
          />

          {/* Logout Button */}
          {open ? (
            <Button
              onClick={onLogout}
              className={cn(
                "w-full gap-3 rounded-lg bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-2.5 text-sm font-medium transition-all duration-250 hover:from-red-600/20 hover:to-red-700/20 hover:text-red-300",
              )}
              variant="ghost"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </Button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onLogout}
                  size="icon"
                  className="h-10 w-10 rounded-lg bg-slate-800/50 transition-all duration-250 hover:bg-red-600/20 hover:text-red-300"
                  variant="ghost"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="rounded-lg border border-white/10 bg-slate-900 text-xs font-medium"
              >
                Déconnexion
              </TooltipContent>
            </Tooltip>
          )}
        </div>
*/

// ═══════════════════════════════════════════════════════════════════════════
// RÉSUMÉ DES MODIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 📝 CHECKLIST :
 * 
 * [ ] Importer EcoModeToggle en haut du fichier
 * [ ] Remplacer la section "Footer - Logout" du DRAWER (mobile)
 *     - Ajouter <EcoModeToggle variant="expanded" />
 *     - Garder le bouton Déconnexion en dessous
 * 
 * [ ] Remplacer la section "Footer - Logout button" du SIDEBAR (desktop)
 *     - Ajouter <EcoModeToggle variant={open ? "expanded" : "compact"} />
 *     - Le toggle s'adapte automatiquement selon que la sidebar est ouverte
 * 
 * [ ] Tester sur :
 *     - Desktop (sidebar ouverte/fermée)
 *     - Tablette (drawer mobile)
 *     - Mobile (drawer mobile)
 * 
 * [ ] Vérifier que le toggle se déclenche et bascule le Mode Économie
 * [ ] Vérifier que localStorage persiste l'état
 * [ ] Vérifier que les images se masquent/s'affichent
 */

// ═══════════════════════════════════════════════════════════════════════════
// OPTIONS DU COMPOSANT ECOMODETOGGLES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Props disponibles pour <EcoModeToggle />
 * 
 * variant? : "compact" | "expanded" | "full"
 *   - "compact"   : Icône seule (44px x 44px) - Pour sidebar fermée
 *   - "expanded"  : Icône + texte + switch - Pour sidebar ouverte
 *   - "full"      : Avec description détaillée
 * 
 * iconType? : "leaf" | "zap"
 *   - "leaf" : Feuille (naturel) - Par défaut
 *   - "zap"  : Éclair (énergie)
 * 
 * showStats? : boolean
 *   - true  : Affiche "Images et animations masquées" / "Réduisez votre consommation"
 *   - false : Pas de description - Par défaut
 * 
 * label? : string
 *   - Texte personnalisé (défaut: "Économie de données")
 * 
 * onChange? : (isEcoMode: boolean) => void
 *   - Callback optionnel quand le toggle change
 * 
 * disabled? : boolean
 *   - Désactiver le toggle
 * 
 * className? : string
 *   - Classes Tailwind supplémentaires
 */

// ═══════════════════════════════════════════════════════════════════════════
// EXEMPLES D'UTILISATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Exemple 1 : Usage simple (valeur par défaut)
 * <EcoModeToggle />
 * → variant="expanded", iconType="leaf", showStats=false
 */

/**
 * Exemple 2 : Adaptation responsive
 * <EcoModeToggle 
 *   variant={open ? "expanded" : "compact"}
 *   iconType="leaf"
 *   showStats={open}
 * />
 * → Icône seule quand sidebar fermée, complet quand ouverte
 */

/**
 * Exemple 3 : Avec callback
 * <EcoModeToggle 
 *   onChange={(isEcoMode) => {
 *     console.log("Mode Eco basculé :", isEcoMode);
 *     // Envoyer analytics, etc.
 *   }}
 * />
 */

/**
 * Exemple 4 : Mobile drawer
 * <EcoModeToggle 
 *   variant="expanded"
 *   iconType="leaf"
 *   showStats={false}
 * />
 * → Zone tactile : ~50px (min 44px recommandé)
 */

// ═══════════════════════════════════════════════════════════════════════════
// ACCESSIBILITÉ & PERFORMANCE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * ✅ Accessibilité (déjà gérée) :
 * - aria-label: Label dynamique selon l'état
 * - aria-pressed: Indique si activé/désactivé
 * - type="button": Sémantique correcte
 * - Keyboard accessible: Enter/Space bascule le toggle
 * - Contraste: Couleurs conformes WCAG AA
 * 
 * ✅ Performance :
 * - Aucun appel réseau (localStorage uniquement)
 * - Re-render minimal (useEcoMode hook)
 * - Pas de dépendance externe lourde
 * - Animations GPU-optimisées (transform, opacity)
 * 
 * ✅ Responsivité :
 * - Zone tactile: 44px minimum (iOS) / 48px (Material)
 * - Padding adapté sur mobile
 * - Flex layout responsive
 * - Support écrans petits (<320px) jusqu'aux grands écrans
 */

// ═══════════════════════════════════════════════════════════════════════════
// TROUBLESHOOTING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * ❓ Q: Le toggle ne change pas l'état ?
 * ✅ A: Vérifiez que EcoModeProvider enveloppe l'app dans App.tsx
 * 
 * ❓ Q: Les images ne se masquent pas ?
 * ✅ A: Remplacez <img> par <EcoImage /> pour avoir le effet
 * 
 * ❓ Q: Le toggle n'apparaît pas ?
 * ✅ A: Vérifiez que l'import est correct et que le chemin est bon
 * 
 * ❓ Q: Pas de transition smooth ?
 * ✅ A: Assurez-vous que Tailwind CSS est chargé avec duration-250
 * 
 * ❓ Q: Zone tactile trop petite sur mobile ?
 * ✅ A: La hauteur min est 10 (40px), utilisez h-12 (48px) si besoin
 */

export default {
  documentation: "INTEGRATION_GUIDE",
  version: "1.0.0",
  lastUpdated: "2026-07-17",
};
