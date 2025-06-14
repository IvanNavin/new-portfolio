import { PokemonModal } from '@containers/Pokedex/components/PokemonModal';
import { useMediaQuery } from '@mantine/hooks';
import { openModal } from '@mantine/modals';
import { toCapitalize } from '@repo/utils';
import { PokemonType } from '@src/types/api-types';
import cn from 'classnames';
import Image from 'next/image';
import { forwardRef } from 'react';

import s from './styles.module.scss';

import SOON from '../../assets/soon.png';

type Props = {
  data: PokemonType;
};
export const Pokemon = forwardRef<HTMLDivElement, Props>(
  ({ data }: Props, ref) => {
    const { types, name, img, attack, defense } = data;
    const pictureWrap = cn(s.pictureWrap, s[types[0] as keyof typeof s]);
    const isMobile = useMediaQuery('(max-width: 767px)');

    const onClick = () => {
      openModal({
        centered: true,
        withCloseButton: false,
        overlayProps: {
          opacity: 0.8,
          color: '#171C23',
        },
        styles: {
          content: {
            overflow: 'visible',
            background: 'transparent',
          },
          body: {
            padding: 0,
          },
          inner: {
            padding: 0,
          },
        },
        size: isMobile ? '100%' : 800,
        withOverlay: true,
        children: <PokemonModal data={data} />,
      });
    };

    return (
      <div ref={ref} className={s.root} onClick={onClick} role='dialog'>
        <div className={s.container}>
          <div className={s.infoWrap}>
            <h5 className={s.titleName}>{toCapitalize(name)}</h5>
            <div className={s.statWrap}>
              <div className={s.statItem}>
                <div className={s.statValue}>{attack}</div>
                Attack
              </div>
              <div className={s.statItem}>
                <div className={s.statValue}>{defense}</div>
                Defense
              </div>
            </div>
            <div className={s.labelWrap}>
              {types.map((type) => {
                const labelClass = cn(s.label, s[type as keyof typeof s]);
                return (
                  <span key={type} className={labelClass}>
                    {type}
                  </span>
                );
              })}
            </div>
          </div>
          <div className={pictureWrap}>
            <Image src={img || SOON} alt={name} priority={false} fill />
          </div>
        </div>
      </div>
    );
  },
);
