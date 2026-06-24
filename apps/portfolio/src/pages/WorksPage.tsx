import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "@/router/router";
import { BackButton } from "@/components/BackButton";
import { WORKS } from "./works/works";
import { WorkItem } from "./works/WorkItem";
import { WorksFilter, type Filters } from "./works/WorksFilter";
import { FilterChips } from "./works/FilterChips";
import type { PageProps } from "./types";

/**
 * Works page (cube "left" face). A filterable grid of project flip-cards;
 * each opens its detail overlay at /works/<id>.
 */
export function WorksPage(_props: PageProps) {
  const { t } = useTranslation();
  const { path } = useRouter();

  const [filters, setFilters] = useState<Filters>({ workType: [], stack: [] });

  const allStacks = useMemo(() => {
    const set = new Set<string>();
    WORKS.forEach((w) => w.stack.forEach((s) => set.add(s)));
    return Array.from(set).sort();
  }, []);

  const filteredWorks = useMemo(
    () =>
      WORKS.filter((work) => {
        const typeMatch =
          !filters.workType.length ||
          work.workType.some((type) => filters.workType.includes(type));
        const stackMatch =
          !filters.stack.length ||
          filters.stack.every((s) => (work.stack as string[]).includes(s));
        return typeMatch && stackMatch;
      }),
    [filters],
  );

  return (
    <div className="relative h-full w-full overflow-y-auto bg-[#0a0a0f] text-white">
      {path === "/works" && <BackButton text={t("ivan")} />}

      <main className="mx-auto max-w-[1200px] px-8 py-16">
        <h1 className="font-russo mb-4 text-[clamp(28px,5vw,44px)]">
          {t("myWorks.myWorks")}
        </h1>
        <p className="max-w-[760px] text-sm text-white/70">
          {t("myWorks.description")}
        </p>

        <FilterChips
          filters={filters}
          onRemove={(value) =>
            setFilters((prev) => ({
              workType: prev.workType.filter((v) => v !== value),
              stack: prev.stack.filter((v) => v !== value),
            }))
          }
        />

        <div className="flex flex-row gap-8">
          <aside className="sticky top-0 hidden max-h-screen w-[220px] shrink-0 overflow-y-auto pb-6 [scrollbar-width:none] md:block">
            <WorksFilter
              filters={filters}
              allStacks={allStacks}
              onChange={setFilters}
            />
          </aside>

          <nav className="relative mx-auto flex max-w-[1200px] flex-1 flex-wrap justify-around transition-all duration-300 ease-out">
            {filteredWorks.map((item) => (
              <WorkItem item={item} key={item.id} />
            ))}
          </nav>
        </div>
      </main>
    </div>
  );
}
