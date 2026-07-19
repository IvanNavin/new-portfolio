import { log } from '@repo/utils';
import { AnyType } from '@src/types';
import { isInIframe } from '@src/utils/isInIframe';
import { signIn, useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';

interface GoogleOpt {
  isOneTap?: boolean;
  [key: string]: AnyType;
}

interface UseGoogleIdentifyProps {
  nextAuthOpt?: Record<string, unknown>;
  googleOpt?: GoogleOpt;
}

interface GoogleAccounts {
  id: {
    initialize: (options: {
      client_id: string;
      callback: (response: { credential: string }) => void;
      [key: string]: AnyType;
    }) => void;
    prompt: (callback: (notification: AnyType) => void) => void;
    renderButton: (element: HTMLElement, options?: AnyType) => void; // Додано для рендерингу кнопки
  };
}

declare global {
  interface Window {
    google?: {
      accounts: GoogleAccounts;
    };
  }
}

const useGoogleIdentify = (props?: UseGoogleIdentifyProps) => {
  const url = 'https://accounts.google.com/gsi/client';
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const { nextAuthOpt, googleOpt } = props || {};

  // Latest values for the run-once script effect, without making them deps.
  // Callers pass inline object literals (new identity each render) that would
  // otherwise tear down + re-append the GSI <script> every render. Also avoids
  // stale closures.
  const latest = useRef({ nextAuthOpt, googleOpt, session, isLoading });
  latest.current = { nextAuthOpt, googleOpt, session, isLoading };

  useEffect(() => {
    setIsSignedIn(!!session);
  }, [session]);

  useEffect(() => {
    if (isInIframe()) {
      console.warn('Iframe detected: skipping Google Identify logic.');
      return;
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId) {
      // Without a client id, Google Identity Services only logs errors —
      // skip loading it entirely.
      return;
    }
    // add Google Identify script
    const script = document.createElement('script');
    script.src = url;
    script.async = true;

    // handle script loading
    script.onload = async () => {
      const { google } = window;
      const { session, isLoading, googleOpt } = latest.current;
      let isLoggedIn = !!session;

      if (!isLoggedIn) {
        const result = await fetch('/api/check-session').then((res) =>
          res.json(),
        );

        if (result.isLoggedIn) {
          isLoggedIn = true;
        }
      }

      if (!isLoading && !isLoggedIn && google) {
        google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: { credential: string }) => {
            setIsLoading(true);
            log('Google response:', response);
            // call provider with the token provided by google
            await signIn('google', {
              credential: response.credential,
              ...latest.current.nextAuthOpt,
            });

            log('logged in');
            setIsLoading(false);
          },
          ...googleOpt,
        });

        // prompt one tap if enabled
        if (googleOpt?.isOneTap && !session && !isLoading) {
          google.accounts.id.prompt((notification: AnyType) => {
            log('OneTap prompt:', notification);
          });
        }

        // Рендер кнопки Google
        const buttonContainer = document.querySelector('.g_id_signin');
        if (buttonContainer) {
          google.accounts.id.renderButton(buttonContainer as HTMLElement, {
            type: 'standard',
            size: 'medium',
            theme: 'outline',
            text: 'continue_with',
            shape: 'pill',
            locale: 'en',
            logo_alignment: 'left',
          });
        }
      }
    };

    document.head?.appendChild(script);

    return () => {
      // Unmount-only; parentNode guard against a late-onload double-remove.
      if (script.parentNode) script.parentNode.removeChild(script);
    };
    // Load the GSI script exactly once; live values are read from `latest`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isLoading, isSignedIn };
};

export default useGoogleIdentify;
