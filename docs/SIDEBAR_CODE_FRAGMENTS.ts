/**
 * FRAGMENT CODE - Footer Section Complète
 * 
 * À copier-coller directement dans CandidateSidebar.tsx
 * Remplace la section "Footer - Logout" du drawer ET le "Footer - Logout button" du sidebar
 * 
 * Fichier source : src/components/candidate/CandidateSidebar.tsx
 * 
 * 📍 LOCALISATION :
 * 1. Pour le DRAWER (mobile) : ~330 lignes, chercher "Footer - Logout"
 * 2. Pour le SIDEBAR (desktop) : ~520 lignes, chercher "Footer - Logout button"
 */

// ═══════════════════════════════════════════════════════════════════════════
// VERSION 1 : DRAWER MOBILE (À remplacer dans le drawer)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Remplacer ceci DANS le drawer (le premier if isDrawer retourne) :
 * 
 * AVANT :
 * ```
 *   {/* Footer - Logout */}
 *   <div className="border-t border-white/5 px-4 py-4">
 *     <Button onClick={() => {...}} ...>...</Button>
 *   </div>
 * ```
 * 
 * APRÈS : Copier le code ci-dessous
 */

export const DrawerFooterFragment = `
          {/* Footer - Eco Mode Toggle + Logout */}
          <div className="space-y-3 border-t border-white/5 px-4 py-4">
            {/* Eco Mode Toggle - Version expanded pour mobile */}
            <div className="rounded-lg">
              <EcoModeToggle 
                variant="expanded"
                iconType="leaf"
                showStats={false}
                label="Économie de données"
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
// VERSION 2 : SIDEBAR DESKTOP (À remplacer dans le sidebar)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Remplacer ceci dans le sidebar desktop (après le </nav>, dans la section TooltipProvider) :
 * 
 * AVANT :
 * ```
 *   {/* Footer - Logout button */}
 *   <div className="border-t border-white/5 px-2 py-4">
 *     {open ? (
 *       <Button ...>...</Button>
 *     ) : (
 *       <Tooltip>...</Tooltip>
 *     )}
 *   </div>
 * ```
 * 
 * APRÈS : Copier le code ci-dessous
 */

export const DesktopFooterFragment = `
        {/* Footer - Eco Mode Toggle + Logout button */}
        <div className="space-y-2 border-t border-white/5 px-2 py-4">
          {/* Eco Mode Toggle - Responsive */}
          <EcoModeToggle 
            variant={open ? "expanded" : "compact"}
            iconType="leaf"
            showStats={open}
            label="Économie de données"
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
// IMPORTS À AJOUTER (EN HAUT DU FICHIER)
// ═══════════════════════════════════════════════════════════════════════════

export const ImportsToAdd = `
import { EcoModeToggle } from "@/components/candidate/EcoModeToggle";
`;

// ═══════════════════════════════════════════════════════════════════════════
// STRUCTURE COMPLÈTE DU COMPONENT AVEC LES MODIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Voici à quoi ressemblera le CandidateSidebar.tsx après intégration :
 * 
 * import { EcoModeToggle } from "@/components/candidate/EcoModeToggle";  // ← NOUVEAU
 * 
 * export function CandidateSidebar({...}) {
 *   // ... state & hooks existants
 * 
 *   // DRAWER MOBILE
 *   if (isDrawer) {
 *     return (
 *       <>
 *         {/* ... overlay & header ... */}
 * 
 *         {/* Footer - Eco Mode Toggle + Logout */}
 *         <div className="space-y-3 border-t border-white/5 px-4 py-4">
 *           <EcoModeToggle 
 *             variant="expanded"
 *             iconType="leaf"
 *             showStats={false}
 *           />
 *           <Button onClick={() => {...}}>...</Button>
 *         </div>
 *       </>
 *     );
 *   }
 * 
 *   // SIDEBAR DESKTOP
 *   return (
 *     <aside>
 *       {/* ... nav, etc ... */}
 * 
 *       {/* Footer - Eco Mode Toggle + Logout button */}
 *       <div className="space-y-2 border-t border-white/5 px-2 py-4">
 *         <EcoModeToggle 
 *           variant={open ? "expanded" : "compact"}
 *           iconType="leaf"
 *           showStats={open}
 *         />
 *         {open ? <Button>...</Button> : <Tooltip><Button>...</Button></Tooltip>}
 *       </div>
 *     </aside>
 *   );
 * }
 */

// ═══════════════════════════════════════════════════════════════════════════
// RÉSUMÉ - 3 ÉTAPES SIMPLES
// ═══════════════════════════════════════════════════════════════════════════

export const QuickIntegrationSteps = `
ÉTAPE 1 : Importer le composant
---------
À la ligne 1-30 de CandidateSidebar.tsx, ajouter :
  import { EcoModeToggle } from "@/components/candidate/EcoModeToggle";

ÉTAPE 2 : Remplacer le footer du DRAWER (mobile)
---------
À la ligne ~330, remplacer le <div className="border-t border-white/5 px-4 py-4">...</div>
par le code "DrawerFooterFragment" ci-dessus.

ÉTAPE 3 : Remplacer le footer du SIDEBAR (desktop)
---------
À la ligne ~520, remplacer le <div className="border-t border-white/5 px-2 py-4">...</div>
par le code "DesktopFooterFragment" ci-dessus.

ÉTAPE 4 : Tester
---------
npm run dev
→ Ouvrir http://localhost:5173
→ Se connecter en tant que candidat
→ Tester le toggle sur mobile/tablet/desktop
→ Vérifier que les images se masquent/s'affichent
`;

export default {
  DrawerFooterFragment,
  DesktopFooterFragment,
  ImportsToAdd,
  QuickIntegrationSteps,
};
