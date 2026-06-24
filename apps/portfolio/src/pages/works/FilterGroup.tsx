type Option = { label: string; value: string };

type Props = {
  title: string;
  options: Option[];
  selected: string[];
  onChange: (value: string) => void;
};

/** A labelled list of toggle checkboxes (plain Tailwind, no Mantine). */
export const FilterGroup = ({ title, options, selected, onChange }: Props) => (
  <div className="space-y-2">
    <h3 className="font-russo text-sm text-white">{title}</h3>
    <div className="flex flex-col gap-1.5">
      {options.map((option) => (
        <label
          key={option.value}
          className="flex cursor-pointer items-center gap-2 text-sm text-white/80 select-none hover:text-white"
        >
          <input
            type="checkbox"
            checked={selected.includes(option.value)}
            onChange={() => onChange(option.value)}
            className="size-4 accent-yellow-300"
          />
          {option.label}
        </label>
      ))}
    </div>
  </div>
);
