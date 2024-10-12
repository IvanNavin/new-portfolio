import { createElement, ReactNode } from 'react';

interface HeadingProps {
  tag: string;
  className?: string;
  children: ReactNode;
}

const Heading = ({ tag, children, ...props }: HeadingProps) => {
  return createElement(tag, { ...props }, children);
};

export default Heading;
