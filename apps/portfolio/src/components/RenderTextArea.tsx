import type { TFunction } from "i18next";

type Props = {
  t: TFunction;
  tKey: string;
};

/** Renders an i18n object/array of paragraphs; empty values become <br>. */
export const RenderTextArea = ({ t, tKey }: Props) => {
  // Before i18n resources load, t() with returnObjects returns the key string,
  // not an object — guard so we don't render it char-by-char or crash.
  const value = t(tKey, { returnObjects: true });
  const allText: string[] =
    value && typeof value === "object"
      ? (Object.values(value) as string[])
      : [];

  return (
    <>
      {allText.map((text, index) =>
        text ? <p key={index}>{text}</p> : <br key={index} />,
      )}
    </>
  );
};
