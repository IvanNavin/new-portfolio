'use client';
import useGoogleIdentify from '@src/hooks/useGoogleIdentify';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Stable identity across renders (avoids re-triggering the GSI effect).
const NEXT_AUTH_OPT = { redirect: true };
const GOOGLE_OPT = { isOneTap: false, use_fedcm_for_prompt: true };

export const LoginPage = () => {
  const router = useRouter();

  const { isSignedIn } = useGoogleIdentify({
    nextAuthOpt: NEXT_AUTH_OPT,
    googleOpt: GOOGLE_OPT,
  });

  // Redirect is a side effect — never navigate during render.
  useEffect(() => {
    if (isSignedIn) {
      void router.replace('/');
    }
  }, [isSignedIn, router]);

  return (
    <div className='container'>
      <div className='main'>
        <h2>Login Page</h2>
        <div
          className='g_id_signin'
          data-type='standard'
          data-size='medium'
          data-theme='outline'
          data-text='continue_with'
          data-shape='pill'
          data-locale='en'
          data-logo_alignment='left'
        />
        <button onClick={() => router.push('/')}>Home</button>
      </div>
    </div>
  );
};
