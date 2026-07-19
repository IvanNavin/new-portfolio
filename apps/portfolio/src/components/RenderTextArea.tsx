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
  // Keep only string values — if a locale ever nests an object/array under one
  // of these keys, rendering it as a child throws "Objects are not valid as a
  // React child" and blanks the page. Filtering also drops the `as` assertion.
  const allText =
    value && typeof value === "object"
      ? Object.values(value).filter((v): v is string => typeof v === "string")
      : [];

  return (
    <>
      {allText.map((text, index) =>
        text ? <p key={index}>{text}</p> : <br key={index} />,
      )}
    </>
  );
};
