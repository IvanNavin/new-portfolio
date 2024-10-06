'use client';
import { RotateStar } from '@app/[lang]/contact/RotateStar';
import { SocialLinks } from '@app/[lang]/contact/SocialLinks';
import { useContact } from '@app/[lang]/contact/useContact';
import { DefaultProps } from '@app/types';
import { Container } from '@components/Container';
import { Input } from '@components/Input';
import { Send } from '@components/svg';
import { TextArea } from '@components/TextArea';
import { clsxm } from '@repo/utils';

import styles from './style.module.css';

export default function Page({ params: { lang } }: DefaultProps) {
  const {
    t,
    onSubmit,
    name,
    setName,
    errorName,
    message,
    errorMessage,
    setMessage,
    ref,
    sent,
    success,
    hovered,
  } = useContact(lang);

  return (
    <Container
      lang={lang}
      backText={t('ivan')}
      title={t('contacts.sayHi')}
      titleClassName='text-center'
    >
      <RotateStar />
      <SocialLinks />
      <form
        onSubmit={onSubmit}
        className='mx-auto flex w-[300px] flex-col gap-y-4'
      >
        <Input
          label={t('contacts.name')}
          value={name}
          onChange={({ target: { value } }) => {
            setName(value);
          }}
          error={errorName}
        />
        <TextArea
          label={t('contacts.message')}
          value={message}
          error={errorMessage}
          onChange={({ target: { value } }) => {
            setMessage(value);
          }}
        />
        <button
          ref={ref}
          type='submit'
          className={clsxm(
            'relative h-12 border border-white/50 bg-transparent px-4 py-2 text-white',
            sent && 'cursor-not-allowed',
          )}
          disabled={sent}
        >
          {!sent && !success && t('contacts.sendMessage')}
          {success && t('contacts.messageSent')}
          <Send
            width={20}
            height={20}
            className={clsxm(
              'absolute right-[15px] top-3 origin-center transition-all duration-200 ease-in-out',
              styles.rotateAirplane,
              hovered && styles.hoveredAirplane,
              sent && 'animate-flyGrid',
            )}
          />
        </button>
      </form>
    </Container>
  );
}
