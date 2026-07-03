import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function CandidateConfirmPage() {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Le lien de confirmation est invalide ou manquant.');
      return;
    }

    const confirmUrl = `/api/confirm?token=${encodeURIComponent(token)}`;
    window.location.assign(confirmUrl);
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-2xl rounded-[32px] border border-slate-200 bg-white p-10 shadow-xl">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-blue-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12l2 2 4-4" />
              <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10Z" />
            </svg>
          </div>
          <h1 className="text-3xl font-semibold text-slate-900">Confirmation réussie</h1>
          <p className="max-w-xl text-base leading-7 text-slate-600">
            Votre e-mail a été validé. Vous êtes redirigé vers la page de connexion pour accéder à votre espace candidat.
          </p>
        </div>

        {error ? (
          <div className="mt-10 rounded-3xl border border-red-200 bg-red-50 p-6 text-left">
            <p className="text-red-700 text-base font-medium">Erreur de confirmation</p>
            <p className="mt-2 text-slate-700">{error}</p>
            <div className="mt-6 text-center">
              <Link to="/candidate/login">
                <Button type="button" variant="secondary">Retour à la connexion</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-10 rounded-3xl border border-blue-200 bg-blue-50 p-6 text-left">
            <p className="text-blue-700 text-base font-medium">Redirection en cours...</p>
            <p className="mt-2 text-slate-700">Si la redirection ne se fait pas automatiquement, cliquez sur le bouton ci-dessous.</p>
            <div className="mt-6 text-center">
              <a href={token ? `/api/confirm?token=${encodeURIComponent(token)}` : '/candidate/login'}>
                <Button type="button">Confirmer mon e-mail</Button>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
