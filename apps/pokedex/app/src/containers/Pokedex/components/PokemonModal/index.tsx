import { getGeneration } from '@containers/Pokedex/constants';
import { closeAllModals } from '@mantine/modals';
import { toCapitalize } from '@repo/utils';
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
          <h5 className={s.header}>{toCapitalize(name)}</h5>
          <span className={s.generation}>Generation {getGeneration(id)}</span>
          <span className={s.id}>{id}</span>
        </div>
        <div className={s.abilities}>
          <span>Abilities</span>
          {abilities?.map((skill, index) => (
            <span key={skill}>
              {index !== 0 && ', '}
              {toCapitalize(skill)}
            </span>
          ))}
        </div>
        <div className={s.healthExp}>
          <div className={s.health}>
            <span>Healthy Points</span>
            <span className={s.points}>{hp}</span>
            <div className={s.progressBar}>
              <div
                className={s.progress}
                style={{ width: `${(hp / 300) * 100}%` }}
              />
            </div>
          </div>
          <div className={s.exp}>
            <span>Experience</span>
            <span className={s.points}>{base_experience}</span>
            <div className={s.progressBar}>
              <div
                className={s.progress}
                style={{ width: `${(base_experience / 300) * 100}%` }}
              />
            </div>
          </div>
        </div>
        <div className={s.stat}>
          <div className={s.box}>
            <div className={s.circle}>{attack}</div>
            Attack
          </div>
          <div className={s.box}>
            <div className={s.circle}>{defense}</div>
            Defense
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
