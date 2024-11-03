import { TFunction } from 'next-i18next';

type Props = {
  t: TFunction;
  tKey: string;
};
export const RenderTextArea = ({ t, tKey }: Props) => {
  const allText = Object.values(t(tKey, { returnObjects: true }));

  return (
    <>
      {allText.map((value, index) =>
        value ? <p key={index}>{value as string}</p> : <br key={index} />,
      )}
    </>
  );
};
