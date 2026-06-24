import { useMemo } from "react";
import { EWorkType, workTypeOptions } from "./works";
import { FilterGroup } from "./FilterGroup";

export type Filters = {
  workType: EWorkType[];
  stack: string[];
};

type Props = {
  filters: Filters;
  allStacks: string[];
  onChange: (filters: Filters) => void;
};

export const WorksFilter = ({ filters, allStacks, onChange }: Props) => {
  const technologyOptions = useMemo(
    () =>
      allStacks
        .map((s) => ({ label: s, value: s }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [allStacks],
  );

  const toggle = (list: string[], value: string) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  return (
    <div className="flex flex-col gap-6">
      <FilterGroup
        title="Work Type"
        options={workTypeOptions}
        selected={filters.workType}
        onChange={(v) =>
          onChange({
            ...filters,
            workType: toggle(filters.workType, v) as EWorkType[],
          })
        }
      />
      <FilterGroup
        title="Technologies"
        options={technologyOptions}
        selected={filters.stack}
        onChange={(v) =>
          onChange({ ...filters, stack: toggle(filters.stack, v) })
        }
      />
    </div>
  );
};
