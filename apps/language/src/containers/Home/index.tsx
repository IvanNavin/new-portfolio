'use client';
import {
  BackgroundBlock,
  Button,
  CardList,
  ClockCircleOutlined,
  Footer,
  Header,
  HomeOutlined,
  Paragraph,
  Section,
  SmileOutlined,
} from '@src/components';
import useGoogleIdentify from '@src/hooks/useGoogleIdentify';
import Image from 'next/image';
import { signOut, useSession } from 'next-auth/react';
import { Suspense, useState } from 'react';

import s from './home.module.scss';

import secondBackground from '../../assets/back2.jpg';
import firstBackground from '../../assets/background.jpg';

export const HomePage = () => {
  const [showLogout, setShowLogout] = useState(false);
  const { data: session } = useSession();

  const nextAuthOpt = {
    redirect: false,
  };

  const googleOpt = {
    prompt_parent_id: 'oneTap',
    isOneTap: true,
  };

  const { isSignedIn } = useGoogleIdentify({
    nextAuthOpt,
    googleOpt,
  });

  const toggleLogout = () => setShowLogout((p) => !p);

  return (
    <Suspense fallback={<>Loading...</>}>
      {!isSignedIn && <div id='oneTap' />}
      <section className={s.authorization_wrap}>
        {isSignedIn ? (
          <>
            {showLogout && (
              <button className={s.link} onClick={() => signOut()}>
                Logout
              </button>
            )}
            <button onClick={() => toggleLogout()}>
              <Image
                src={session?.user?.image || ''}
                height={40}
                width={40}
                alt={session?.user?.name || 'user photo'}
                className={s.user}
              />
            </button>
          </>
        ) : (
          <a className={s.link} href='/login'>
            Login
          </a>
        )}
      </section>

      <BackgroundBlock backgroundImg={firstBackground} fullHeight>
        <Header white>Time to learn words online</Header>
        <Paragraph white>
          Use flashcards and expand your active vocabulary.
        </Paragraph>
      </BackgroundBlock>
      <Section bgColor='#f0f0f0' className={s.textCenter}>
        <Header size='l'>It's easy to start learning English</Header>
        <Paragraph>
          Click on the cards and learn new words, quickly and easily!
        </Paragraph>
        <CardList />
      </Section>
      <Section className={s.textCenter}>
        <Header size='l'>
          We've created lessons to help you become more confident in speaking
          English.
        </Header>
        <div className={s.motivation}>
          <div className={s.motivationBlock}>
            <div className={s.icons}>
              <ClockCircleOutlined />
            </div>
            <Paragraph small>Study when you have a free moment</Paragraph>
          </div>

          <div className={s.motivationBlock}>
            <div className={s.icons}>
              <HomeOutlined />
            </div>
            <Paragraph small>
              From anywhere - at home, in&nbsp;the&nbsp;office,
              in&nbsp;a&nbsp;cafe
            </Paragraph>
          </div>

          <div className={s.motivationBlock}>
            <div className={s.icons}>
              <SmileOutlined />
            </div>
            <Paragraph small>
              Conversations in English without&nbsp;awkward pauses and
              «mmm,&nbsp;how&nbsp;to&nbsp;say…»
            </Paragraph>
          </div>
        </div>
      </Section>
      <BackgroundBlock backgroundImg={secondBackground}>
        <Header size='l' white>
          Learn English with a personal assistant website
        </Header>
        <Paragraph white>Get started now</Paragraph>
        <Button>Start a free lesson</Button>
      </BackgroundBlock>
      <Footer />
    </Suspense>
  );
};
