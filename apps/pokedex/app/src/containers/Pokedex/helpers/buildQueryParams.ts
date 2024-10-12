export const buildQueryParams = (
  types: string[],
  experience: [number, number],
  attack: [number, number],
  search: string,
) => {
  const params = new URLSearchParams();

  if (types.length > 0) {
    params.append('types', types.join(','));
  }

  params.append('experience_min', String(experience[0]));
  params.append('experience_max', String(experience[1]));
  params.append('attack_min', String(attack[0]));
  params.append('attack_max', String(attack[1]));

  if (search) {
    params.append('search', search);
  }

  return params.toString();
};
