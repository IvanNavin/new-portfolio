import Footer from '@app/src/components/Footer';
import Header from '@app/src/components/Header';
import cn from 'classnames';
import { ReactNode } from 'react';

import s from './Layout.module.scss';

interface LayoutProps {
  className?: string;
  children: ReactNode;
}

const Layout = ({ children, className }: LayoutProps) => (
  <>
    <Header />
    <div className={cn(s.root, className)}>{children}</div>
    <div />
    <Footer />
  </>
);

export default Layout;
