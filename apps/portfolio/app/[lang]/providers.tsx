import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};
export const Providers = ({ children }: Props) => {
  return children;

  // return (
  //   <AnimatePresence mode='wait'>
  //     <NavigationHistoryProvider key={pathName}>
  //       {children}
  //     </NavigationHistoryProvider>
  //   </AnimatePresence>
  // );
};
