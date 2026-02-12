'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-red-400" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Oups, une erreur !</h1>
          <p className="text-muted-foreground">
            Quelque chose s&apos;est mal passé. Pas de panique, on gère.
          </p>
        </div>

        <Button
          onClick={reset}
          className="bg-primary text-black font-bold"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Réessayer
        </Button>

        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 text-left">
            <summary className="text-sm text-muted-foreground cursor-pointer">
              Détails techniques
            </summary>
            <pre className="mt-2 p-4 bg-card rounded-lg text-xs text-red-400 overflow-auto">
              {error.message}
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
