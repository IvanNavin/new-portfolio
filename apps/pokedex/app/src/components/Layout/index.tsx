import { ReactNode } from 'react';
import cn from 'classnames';

import s from './Layout.module.scss';
import Header from '@app/src/components/Header';
import Footer from '@app/src/components/Footer';

interface LayoutProps {
  className?: string;
  children: ReactNode;
}

const Layout = ({ children, className }: LayoutProps) => (
  <>
    <Header />
    <div className={cn(s.root, className)}>{children}</div>
    <Footer />
  </>
);

export default Layout;
