import { russoOne } from '@assets/fonts';
import { useHover } from '@mantine/hooks';
import { clsxm } from '@repo/utils';
import { useRouter } from 'next/navigation';

type NavMenuItemProps = {
  first: string;
  second: string;
  href: string;
};

type Props = {
  item: NavMenuItemProps;
  className?: string;
  textClassName?: string;
};

export const NavMenuItem = ({
  item: { first, second, href },
  className,
  textClassName,
}: Props) => {
  const { hovered, ref } = useHover<HTMLButtonElement>();
  const router = useRouter();

  return (
    <button
      ref={ref}
      className={clsxm(
        'overflow-hidden opacity-0 animate-slideText ease-in-out duration-300',
        'flex self-start border-transparent bg-transparent p-0 text-left',
        'focus-within:border-transparent focus-within:outline-transparent select-none',
        className,
      )}
      onClick={() => {
        router.push(href);
      }}
    >
      <span
        className={clsxm(
          'text-[8vw] text-white shadow-black transition-all duration-500 ease-in-out text-shadow hover:ml-10',
          textClassName,
        )}
        style={{
          ...russoOne.style,
        }}
      >
        {hovered ? second : first}
      </span>
    </button>
  );
};
