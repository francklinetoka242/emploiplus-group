import React from 'react';
import { useEcoMode } from '../../contexts/EcoModeContext';

type Props = {
  /** Optionnel : classe additionnelle pour le wrapper */
  className?: string;
};

/**
 * EcoModeToggle
 * - Conçu pour être placé en bas de la Sidebar (juste au-dessus du bouton Déconnexion)
 * - Responsive et accessible
 * - Utilise Tailwind CSS pour le style
 */
export const EcoModeToggle: React.FC<Props> = ({ className = '' }) => {
  const { isEcoMode, toggleEcoMode } = useEcoMode();

  return (
    <div className={`w-full ${className}`}>
      <button
        type="button"
        onClick={toggleEcoMode}
        role="switch"
        aria-checked={isEcoMode}
        aria-label={`Économie de données ${isEcoMode ? 'activée' : 'désactivée'}`}
        className="w-full flex items-center justify-between gap-3 px-3 py-3 min-h-[44px] rounded-md hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-3">
          {/* Icône feuille simple */}
          <span className="flex-none text-green-500 dark:text-green-400" aria-hidden>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 13c0-4 4-7 8-7V4c-5 0-9 4-9 9a1 1 0 001 1h1z" />
              <path d="M12 3c0 1.1-1 3-3 4 1 0 3-1 4-2V3z" opacity=".25" />
            </svg>
          </span>

          <div className="text-left">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-200">Économie de données (Mo)</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Réduit le chargement des médias et animations</div>
          </div>
        </div>

        {/* Switch visuel */}
        <span className="flex-none">
          <span
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
              isEcoMode ? 'bg-emerald-500' : 'bg-slate-300'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                isEcoMode ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </span>
        </span>
      </button>
    </div>
  );
};

export default EcoModeToggle;
