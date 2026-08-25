import { WorldMap } from '@/components/map/WorldMap';
import { ALL_MISSIONS, LEVELS } from '@/lib/content/registry';

const HomePage = () => (
  <div className="space-y-8">
    <section className="rounded-2xl border border-edge bg-surface-raised px-5 py-6 sm:px-7 sm:py-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">
        deploy@app-01:~$
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        Стань DevOps-інженером, а не прочитай про це
      </h1>
      <p className="mt-2.5 max-w-2xl text-[14px] leading-relaxed text-ink-dim">
        Тобі дали SSH-доступ до сервера і продукт, який «працює на моєму ноуті».
        Треба довести його до прода. Кожна місія — трохи теорії та багато
        практики у справжньому терміналі: файли, права, процеси, мережа, Git,
        Docker, CI/CD, Kubernetes.
      </p>
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1.5 font-mono text-[12px] text-ink-faint">
        <span>
          <span className="text-ink">{LEVELS.length}</span> рівнів
        </span>
        <span>
          <span className="text-ink">{ALL_MISSIONS.length}</span> місій
        </span>
        <span>
          <span className="text-ink">80%</span> практики
        </span>
        <span>прогрес зберігається автоматично</span>
      </div>
    </section>

    <WorldMap />
  </div>
);

export default HomePage;
