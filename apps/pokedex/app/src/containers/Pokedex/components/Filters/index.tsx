import RangeSelect from '@components/RangeSelect';
import { pokemonTypes } from '@containers/Pokedex/constants';
import { usePokedexContext } from '@containers/Pokedex/hooks/usePokedexContext';
import { MultiSelect } from '@mantine/core';

import s from './styles.module.scss';

export const Filters = () => {
  const { types, setTypes, experience, setExperience, attack, setAttack } =
    usePokedexContext();

  return (
    <div className={s.wrapper}>
      <MultiSelect
        w={200}
        data={pokemonTypes}
        value={types}
        onChange={setTypes}
        placeholder='Type'
        searchable
        clearable
      />
      <RangeSelect
        value={experience}
        onChange={setExperience}
        label='Experience'
        max={300}
      />
      <RangeSelect
        value={attack}
        onChange={setAttack}
        label='Attack'
        max={200}
      />
    </div>
  );
};
