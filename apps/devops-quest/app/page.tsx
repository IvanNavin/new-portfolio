import { WorldMap } from '@/components/map/WorldMap';
import { CharacterSays } from '@/components/story/CharacterSays';
import { Narrator } from '@/components/story/Narrator';
import { ALL_MISSIONS, LEVELS } from '@/lib/content/registry';
import { PROLOGUE } from '@/lib/content/story';

const HomePage = () => (
  <div className="space-y-8">
    <section className="rounded-2xl border border-edge bg-surface-raised px-5 py-6 sm:px-7 sm:py-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">
        deploy@app-01:~$
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        Ніч. Три сервери. Один єнот.
      </h1>
      <p className="mt-2.5 max-w-2xl text-[14px] leading-relaxed text-ink-dim">
        Ти граєш за Тараса. Кожна місія починається з поламки, яку він застав, і
        закінчується тим, що ти лагодиш її сам — у справжньому терміналі.
      </p>
      <Narrator lines={PROLOGUE} className="mt-5" />

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <CharacterSays who="hero" showRole>
          <p>Це я. Сервери тепер мої, і кожну ніч на них щось ламається.</p>
        </CharacterSays>
        <CharacterSays who="mentor" showRole>
          <p>Я на пляжі. Але телефон у мене з собою — пиши, якщо застрягнеш.</p>
        </CharacterSays>
      </div>

      <div className="mt-5 flex flex-wrap gap-x-6 gap-y-1.5 font-mono text-[12px] text-ink-faint">
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
