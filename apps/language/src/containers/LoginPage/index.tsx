'use client';
import useGoogleIdentify from '@src/hooks/useGoogleIdentify';
import { useRouter } from 'next/navigation';

export const LoginPage = () => {
  const router = useRouter();
  const nextAuthOpt = {
    redirect: true,
  };

  const googleOpt = {
    isOneTap: false,
    use_fedcm_for_prompt: true,
  };

  const { isSignedIn } = useGoogleIdentify({
    nextAuthOpt,
    googleOpt,
  });

  if (isSignedIn) {
    void router.replace('/');
  }

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
      </div>
    </div>
  );
};
