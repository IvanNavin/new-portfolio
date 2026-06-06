"use client";

import { signIn, useSession } from "next-auth/react";
import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Google One Tap — shows the GSI prompt to unauthenticated visitors and
 * pipes the resulting ID token through next-auth's Credentials provider.
 * No "Sign in" button: the prompt itself IS the call to action.
 *
 * Google handles cooldowns when the user dismisses the prompt so we
 * don't need our own backoff logic. promptedRef guards against
 * re-prompting on every effect re-run within a single page session.
 */
type GoogleAccountsId = {
  initialize: (config: {
    client_id: string;
    callback: (response: { credential: string }) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
    use_fedcm_for_prompt?: boolean;
  }) => void;
  prompt: () => void;
};

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: GoogleAccountsId;
      };
    };
  }
}

export function OneTap() {
  const { data: session, status } = useSession();
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const promptedRef = useRef(false);

  const initialize = useCallback(async () => {
    if (typeof window === "undefined") return;
    if (status !== "unauthenticated") return;
    if (promptedRef.current) return;
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;
    const gsi = window.google?.accounts?.id;
    if (!gsi) return;

    gsi.initialize({
      client_id: clientId,
      callback: async (response) => {
        const result = await signIn("google-one-tap", {
          credential: response.credential,
          redirect: false,
        });
        if (result?.ok) window.location.reload();
      },
      auto_select: false,
      cancel_on_tap_outside: true,
      use_fedcm_for_prompt: true,
    });
    gsi.prompt();
    promptedRef.current = true;
  }, [status]);

  useEffect(() => {
    if (scriptLoaded) initialize();
  }, [scriptLoaded, initialize]);

  // Already signed in — render nothing, no script needed.
  if (session) return null;

  return (
    <Script
      src="https://accounts.google.com/gsi/client"
      strategy="afterInteractive"
      onLoad={() => setScriptLoaded(true)}
    />
  );
}
