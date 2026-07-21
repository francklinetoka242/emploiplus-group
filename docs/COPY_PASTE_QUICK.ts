/**
 * COPY-PASTE RAPIDE - Mode Économie Sidebar
 * 
 * Les 3 petites modifications à faire dans CandidateSidebar.tsx
 * Prêt à copier-coller directement
 */

// ═══════════════════════════════════════════════════════════════════════════
// MODIFICATION 1 : AJOUTER L'IMPORT
// ═══════════════════════════════════════════════════════════════════════════

// 📍 Localisation : Ligne ~30 (avec autres imports de components)

// COPIER CETTE LIGNE :
// import { EcoModeToggle } from "@/components/candidate/EcoModeToggle";

// Exemple de comment ça ressemblera :
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
  // ... rest of imports
*/

// ═══════════════════════════════════════════════════════════════════════════
// MODIFICATION 2 : FOOTER DU DRAWER MOBILE (~LIGNE 330)
// ═══════════════════════════════════════════════════════════════════════════

// 📍 CHERCHER : "Footer - Logout" dans la section if (isDrawer)

// REMPLACER :
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

// PAR CECI :
export const DRAWER_FOOTER_CODE = `
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
`;

// ═══════════════════════════════════════════════════════════════════════════
// MODIFICATION 3 : FOOTER DU SIDEBAR DESKTOP (~LIGNE 520)
// ═══════════════════════════════════════════════════════════════════════════

// 📍 CHERCHER : "Footer - Logout button" dans la section du sidebar desktop

// REMPLACER :
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

// PAR CECI :
export const DESKTOP_FOOTER_CODE = `
        {/* Footer - Eco Mode Toggle + Logout button */}
        <div className="space-y-2 border-t border-white/5 px-2 py-4">
          {/* Eco Mode Toggle - Responsive */}
          <EcoModeToggle 
            variant={open ? "expanded" : "compact"}
            iconType="leaf"
            showStats={open}
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
`;

// ═══════════════════════════════════════════════════════════════════════════
// RÉSUMÉ - 3 ACTIONS SIMPLES
// ═══════════════════════════════════════════════════════════════════════════

export const QUICK_STEPS = `
ÉTAPE 1 : Ajouter l'import (line ~30)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import { EcoModeToggle } from "@/components/candidate/EcoModeToggle";


ÉTAPE 2 : Remplacer drawer footer (line ~330)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Copier DRAWER_FOOTER_CODE ci-dessus


ÉTAPE 3 : Remplacer sidebar footer (line ~520)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Copier DESKTOP_FOOTER_CODE ci-dessus


ÉTAPE 4 : Tester
━━━━━━━━━━━━━━━━
npm run dev → http://localhost:5173 → Test le toggle
`;

// ═══════════════════════════════════════════════════════════════════════════
// VISUAL DIFF
// ═══════════════════════════════════════════════════════════════════════════

export const VISUAL_DIFF = `
STRUCTURE FINALE
═════════════════

DRAWER MOBILE :
┌─────────────────────────────┐
│ Navigation items            │
├─────────────────────────────┤
│ 🌙 Mode sombre [Toggle]     │ (existing)
├─────────────────────────────┤
│ 🌱 Éco Mode [Toggle] ✨     │ (NOUVEAU)
├─────────────────────────────┤
│ 🚪 Déconnexion              │
└─────────────────────────────┘


SIDEBAR DESKTOP (OUVERTE) :
┌─────────────────────────────┐
│ Nav items...                │
├─────────────────────────────┤
│ 🌙 Mode sombre [Toggle]     │ (existing)
├─────────────────────────────┤
│ 🌱 Éco Mode [Toggle] ✨     │ (NOUVEAU)
├─────────────────────────────┤
│ 🚪 Déconnexion              │
└─────────────────────────────┘


SIDEBAR DESKTOP (FERMÉE) :
┌──┐
│🌙│ (existing)
├──┤
│🌱│ ← (NOUVEAU) Hover = Tooltip
├──┤
│🚪│
└──┘
`;

// ═══════════════════════════════════════════════════════════════════════════
// TROUBLESHOOTING ULTRA-RAPIDE
// ═══════════════════════════════════════════════════════════════════════════

export const QUICK_FIXES = `
❌ "EcoModeToggle not found"
→ Vérifier import à ligne ~30

❌ "Pas de toggle visible"
→ Vérifier que t'as remplacé le footer (pas juste ajouté)

❌ "Toggle ne marche pas"
→ Vérifier EcoModeProvider dans App.tsx

❌ "Zone tactile trop petite"
→ Already 48px, c'est bon !

❌ "localStorage vide"
→ Vérifier useEffect dans EcoModeContext.tsx

❌ "Couleurs pas de transition"
→ Tailwind CSS chargé ? npm run dev restart
`;

// ═══════════════════════════════════════════════════════════════════════════
// FICHIER À MODIFIER
// ═══════════════════════════════════════════════════════════════════════════

export const TARGET_FILE = "src/components/candidate/CandidateSidebar.tsx";
export const TOTAL_MODIFICATIONS = 3;
export const ESTIMATED_TIME = "5 minutes";

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export default {
  DRAWER_FOOTER_CODE,
  DESKTOP_FOOTER_CODE,
  QUICK_STEPS,
  VISUAL_DIFF,
  QUICK_FIXES,
  TARGET_FILE,
  TOTAL_MODIFICATIONS,
  ESTIMATED_TIME,
};
