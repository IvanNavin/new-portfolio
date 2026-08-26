'use client';

import Script from 'next/script';
import { signIn, useSession } from 'next-auth/react';
import { useCallback, useEffect, useRef } from 'react';

type GoogleCredentialResponse = { credential?: string };

type GoogleIdentity = {
  accounts: {
    id: {
      initialize: (options: {
        client_id: string;
        callback: (response: GoogleCredentialResponse) => void;
        use_fedcm_for_prompt?: boolean;
      }) => void;
      prompt: () => void;
    };
  };
};

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';

/**
 * Google One Tap, same approach as apps/devpulse. Signing in is optional — it
 * only enables cross-device progress sync — so this renders nothing at all
 * when no client id is configured.
 */
export const OneTap = () => (CLIENT_ID ? <OneTapPrompt /> : null);

const OneTapPrompt = () => {
  const { status } = useSession();
  const started = useRef(false);

  const start = useCallback(() => {
    if (started.current || status !== 'unauthenticated' || !CLIENT_ID) return;
    const google = (window as unknown as { google?: GoogleIdentity }).google;
    if (!google) return;

    started.current = true;
    google.accounts.id.initialize({
      client_id: CLIENT_ID,
      use_fedcm_for_prompt: true,
      callback: (response) => {
        if (!response.credential) return;
        void signIn('google-one-tap', {
          credential: response.credential,
          redirect: false,
        });
      },
    });
    google.accounts.id.prompt();
  }, [status]);

  useEffect(() => {
    start();
  }, [start]);

  return (
    <Script
      src="https://accounts.google.com/gsi/client"
      strategy="afterInteractive"
      onLoad={start}
    />
  );
};
