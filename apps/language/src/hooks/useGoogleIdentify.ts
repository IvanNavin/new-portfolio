import { log } from '@repo/utils';
import { AnyType } from '@src/types';
import { signIn, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

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

  useEffect(() => {
    setIsSignedIn(!!session);
  }, [session]);

  useEffect(() => {
    // add Google Identify script
    const script = document.createElement('script');
    script.src = url;
    script.async = true;

    // handle script loading
    script.onload = async () => {
      const { google } = window;
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
          client_id: process.env
            .NEXT_PUBLIC_GOOGLE_CLIENT_ID as unknown as string,
          callback: async (response: { credential: string }) => {
            setIsLoading(true);

            // call provider with the token provided by google
            await signIn('google', {
              credential: response.credential,
              ...nextAuthOpt,
            });

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
      }
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup script on component unmount
      document.head.removeChild(script);
    };
  }, [googleOpt, isLoading, isSignedIn, nextAuthOpt]);

  return { isLoading, isSignedIn };
};

export default useGoogleIdentify;
