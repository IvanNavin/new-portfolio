import { russoOne } from '@assets/fonts';
import { TransitionLink } from '@components/TransitionLink';
import { useHover } from '@mantine/hooks';
import { clsxm } from '@repo/utils';

type NavMenuItemProps = {
  first: string;
  second: string;
  href: string;
};

type Props = {
  item: NavMenuItemProps;
  className?: string;
  textClassName?: string;
  index: number;
};

export const NavMenuItem = ({
  item: { first, second, href },
  className,
  textClassName,
  index,
}: Props) => {
  const { hovered, ref } = useHover<HTMLAnchorElement>();

  return (
    <TransitionLink
      href={href}
      ref={ref}
      className={clsxm(
        'overflow-hidden flex self-start border-transparent bg-transparent p-0 text-left',
        'focus-within:border-transparent focus-within:outline-transparent select-none relative',
        className,
      )}
    >
      <span
        className={clsxm(
          'relative opacity-0 text-[8vw] text-white shadow-black transition-all duration-500 ease-in-out text-shadow hover:ml-10',
          russoOne.className,
          textClassName,
        )}
        style={{
          animation: `slideText 0.5s forwards ${index + 0.5}s`,
        }}
      >
        {hovered ? second : first}
      </span>
    </TransitionLink>
  );
};
