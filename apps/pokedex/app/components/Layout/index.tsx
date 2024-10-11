import { ReactNode } from 'react';
import cn from 'classnames';

import s from './Layout.module.scss';

interface LayoutProps {
  className?: string;
  children: ReactNode;
}

const Layout = ({ children, className }: LayoutProps) => (
  <div className={cn(s.root, className)}>{children}</div>
);

export default Layout;
