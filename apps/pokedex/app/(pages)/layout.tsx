import type { Metadata } from 'next';
import './globals.css';
import { ReactNode } from 'react';
import Header from '@app/components/Header';
import Footer from '@app/components/Footer';

export const metadata: Metadata = {
  title: 'Pokédex',
};

type RootProps = Readonly<{
  children: ReactNode;
}>;

export default function Layout({ children }: RootProps) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
