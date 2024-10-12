import { closeAllModals } from '@mantine/modals';
import { PokemonType } from '@src/types/api-types';
import cn from 'classnames';
import Image from 'next/image';

import s from './styles.module.scss';

import SOON from '../../assets/soon.png';

type Props = {
  data: PokemonType;
};

export const PokemonModal = ({ data }: Props) => {
  const {
    abilities,
    base_experience,
    name,
    img,
    types,
    id,
    attack,
    defense,
    hp,
  } = data;

  const imageBackground = cn(s.pokeWrap, s[types[0] as keyof typeof s]);

  return (
    <div className={s.container}>
      <button
        type='button'
        className={s.button}
        data-dismiss='modal'
        aria-label='Close'
        onClick={() => closeAllModals()}
      >
        <span aria-hidden='true'>&times;</span>
      </button>
      <div className={imageBackground}>
        <Image src={img || SOON} alt={name} fill />
        <div className={s.modalLabelWrap}>
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
      <div className={s.statPokeWrap}>
        <div className={s.row}>
          <h5 className={s.header}>{name}</h5>
          <span className={s.generation}>Generation 1</span>
          <span className={s.id}>{id}</span>
        </div>
        <div className={s.abilities}>
          <span>Abilities</span>
          {abilities?.map((skill, index) => {
            return (
              <span key={skill}>
                {index !== 0 && '-'}
                {skill}
              </span>
            );
          })}
        </div>
        <div className={s.healthExp}>
          <div className={s.health}>
            <span>Healthy Points</span>
            <span className={s.points}>{hp}</span>
            <div className={s.progressBar}>
              <div className={s.progress} style={{ width: '20%' }} />
            </div>
          </div>
          <div className={s.exp}>
            <span>Experience</span>
            <span className={s.points}>{base_experience}</span>
            <div className={s.progressBar}>
              <div className={s.progress} style={{ width: '60%' }} />
            </div>
          </div>
        </div>
        <div className={s.stat}>
          <div className={s.box}>
            <div className={s.circle}>{attack}</div>
            Defense
          </div>
          <div className={s.box}>
            <div className={s.circle}>{defense}</div>
            Attack
          </div>
          <div className={s.box}>
            <div className={s.circle}>{data.special_attack}</div>
            Sp Attack
          </div>
          <div className={s.box}>
            <div className={s.circle}>{data.special_defense}</div>
            Sp Defense
          </div>
        </div>
      </div>
    </div>
  );
};
