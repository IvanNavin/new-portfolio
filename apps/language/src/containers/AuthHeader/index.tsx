import useGoogleIdentify from '@src/hooks/useGoogleIdentify';
import Image from 'next/image';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';

import s from '@src/containers/Home/home.module.scss';

export const AuthHeader = () => {
  const [showLogout, setShowLogout] = useState(false);
  const { data: session } = useSession();

  const nextAuthOpt = {
    redirect: false,
  };

  const googleOpt = {
    prompt_parent_id: 'oneTap',
    isOneTap: true,
    use_fedcm_for_prompt: true,
  };

  const { isSignedIn } = useGoogleIdentify({
    nextAuthOpt,
    googleOpt,
  });

  const toggleLogout = () => setShowLogout((p) => !p);

  return (
    <div className={s.authorization_wrap}>
      {isSignedIn ? (
        <>
          {showLogout && (
            <button className={s.link} onClick={() => signOut()}>
              Logout
            </button>
          )}
          <button onClick={() => toggleLogout()}>
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                height={40}
                width={40}
                alt={session?.user?.name || 'user photo'}
                className={s.user}
              />
            ) : (
              <div className='size-10 bg-red-600 rounded-full' />
            )}
          </button>
        </>
      ) : (
        <a className={s.link} href='/login'>
          Login
        </a>
      )}
    </div>
  );
};
