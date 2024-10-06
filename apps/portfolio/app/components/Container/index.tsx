'use client';
import { ROUTES } from '@app/constants/routes';
import BackButton from '@components/BackButton';
import { clsxm } from '@repo/utils';
import { ReactNode } from 'react';

type Props = {
  backPath?: string;
  backText: string;
  title: string;
  children: ReactNode;
  className?: string;
  titleClassName?: string;
};

export const Container = ({
  backPath = ROUTES.root(),
  backText,
  title,
  children,
  className,
  titleClassName,
}: Props) => {
  return (
    <main
      className={clsxm('mx-auto max-w-[1000px] p-8 min-h-screen', className)}
    >
      <BackButton backPath={backPath} text={backText} />
      <h2 className={clsxm('mb-10 mt-5 text-[32px]', titleClassName)}>
        {title}
      </h2>
      {children}
    </main>
  );
};
