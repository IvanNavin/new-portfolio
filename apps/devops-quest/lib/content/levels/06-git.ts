import { readFile } from '../../shell/fs';
import { makeMachine, seed } from '../../shell/machines';
import type { ShellState } from '../../shell/types';
import type { Level } from '../types';

const SHOP_FILES = {
  '/srv/shop/server.js': {
    content:
      "const express = require('express');\nconst app = express();\napp.listen(3000);\n",
    owner: 'deploy',
    group: 'deploy',
  },
  '/srv/shop/package.json': {
    content: '{\n  "name": "shop",\n  "version": "1.0.0"\n}\n',
    owner: 'deploy',
    group: 'deploy',
  },
};

const repoBase = (
  extra: Record<
    string,
    { content: string; owner?: string; group?: string }
  > = {},
) =>
  makeMachine({
    user: 'deploy',
    cwd: '/srv/shop',
    dirs: [{ path: '/srv/shop', owner: 'deploy', group: 'deploy' }],
    files: { ...SHOP_FILES, ...extra },
  });

/** A repo with one commit on main, built by running real git commands. */
const committedRepo = (
  extra: Record<
    string,
    { content: string; owner?: string; group?: string }
  > = {},
  more: string[] = [],
): ShellState =>
  seed(repoBase(extra), [
    'git init',
    'git config user.name "Deploy Bot"',
    'git config user.email "deploy@app-01"',
    'git add .',
    'git commit -m "Initial commit"',
    ...more,
  ]);

export const level06: Level = {
  id: 'l06',
  act: 2,
  title: 'Git у команді',
  subtitle: 'Гілки, конфлікти й те, чому reset --hard страшніший за revert.',
  brief:
    'Git — це не «зберегти файл». Це журнал змін, який дозволяє кільком людям правити одне ' +
    'й те саме і не втратити роботу. Для DevOps він ще й джерело правди: те, що в git, ' +
    'їде в прод.',
  missions: [
    {
      id: 'l06-m01',
      title: 'Перший коміт',
      goal: 'Каталог застосунку став git-репозиторієм із першим комітом.',
      xp: 150,
      theory: [
        {
          kind: 'text',
          text:
            '**Репозиторій** — це звичайний каталог, за яким git почав стежити. ' +
            'Усередині зʼявляється прихована тека `.git`, де він тримає всю історію; ' +
            'решта файлів лишаються такими ж, як були.',
        },
        {
          kind: 'text',
          text:
            'Зміни живуть у трьох місцях: **робочий каталог** (файли, які ти правиш), ' +
            '**індекс** (те, що ти відібрав для наступного коміту) і **історія** ' +
            '(вже зафіксовані коміти). **Коміт** — це збережений знімок усіх ' +
            'відібраних файлів разом із підписом, хто й навіщо їх змінив.',
        },
        {
          kind: 'table',
          rows: [
            ['git init', 'зробити каталог репозиторієм'],
            [
              'git status',
              'що змінено, що в індексі, що взагалі не відстежується',
            ],
            ['git add file', 'перекласти зміни в індекс'],
            ['git add .', 'усе одразу'],
            ['git commit -m "текст"', 'зафіксувати вміст індексу в історію'],
            ['git log --oneline', 'подивитись історію стисло'],
          ],
        },
        {
          kind: 'note',
          text:
            'Коміт фіксує **індекс**, а не робочий каталог. Змінив файл після `git add`? ' +
            'Ця зміна не потрапить у коміт, доки ти не додаси файл ще раз. ' +
            '`git status` завжди чесно це показує.',
        },
      ],
      task: {
        kind: 'terminal',
        boot: () => repoBase(),
        goals: [
          {
            id: 'init',
            label: 'Ініціалізувати репозиторій у /srv/shop',
            check: (s) => s.git.initialized && s.git.root === '/srv/shop',
          },
          {
            id: 'status',
            label: 'Подивитися статус до коміту',
            check: (s) =>
              s.history.some((line) => /^git\s+status/.test(line.trim())),
          },
          {
            id: 'commit',
            label: 'Зробити коміт із повідомленням',
            hintOnFail:
              'Файли спочатку треба додати в індекс — інакше комітити нічого.',
            check: (s) => s.git.commits.length >= 1,
          },
          {
            id: 'both-files',
            label:
              'У коміт мають потрапити обидва файли: server.js і package.json',
            hintOnFail: 'Схоже, ти додав лише один файл. `git add .` бере все.',
            check: (s) => {
              const tree = s.git.commits[s.git.commits.length - 1]?.tree ?? {};
              return 'server.js' in tree && 'package.json' in tree;
            },
          },
        ],
      },
      hints: [
        'Чотири кроки: зробити репозиторій, подивитись статус, додати файли, зафіксувати.',
        '`git init`, потім `git status`, потім `git add .`, потім `git commit -m "повідомлення"`.',
        'git init\ngit status\ngit add .\ngit commit -m "Initial commit"\ngit log --oneline',
      ],
      solution:
        'git init\ngit status\ngit add .\ngit commit -m "Initial commit"\ngit log --oneline',
    },

    {
      id: 'l06-m02',
      title: 'Секрет, який ледь не поїхав у GitHub',
      goal: 'Файл .env ігнорується git-ом і гарантовано не потрапить у репозиторій.',
      xp: 170,
      theory: [
        {
          kind: 'text',
          text:
            'Найдорожча помилка новачка в git — закомітити `.env` із паролями. ' +
            'Видалити його наступним комітом **не допомагає**: він назавжди лишається в історії, ' +
            'і будь-хто з доступом до репозиторію може його дістати.',
        },
        {
          kind: 'code',
          caption: 'Типовий .gitignore',
          lines: ['.env', '.env.local', 'node_modules/', '*.log', 'dist/'],
        },
        {
          kind: 'code',
          caption: 'Створюємо .gitignore і комітимо без секрету',
          lines: [
            'echo ".env" > .gitignore       # перший рядок — створити файл',
            'echo "*.log" >> .gitignore     # другий — дописати',
            'cat .gitignore                 # перевірити, що вийшло',
            'git add .                      # тепер .env уже не потрапить',
            'git commit -m "Add app"',
          ],
        },
        {
          kind: 'text',
          text:
            'У `git status` файли діляться на **відстежувані** (git про них знає) ' +
            'і **невідстежувані** — ті, що просто лежать поруч. `.gitignore` ' +
            'прибирає файл навіть із цього другого списку: git перестає його помічати ' +
            'і `git add .` більше його не підхопить.',
        },
        {
          kind: 'note',
          text:
            'Якщо секрет уже потрапив у коміт — правильна реакція не «прибрати з історії», ' +
            'а **відкликати сам секрет**: змінити пароль, перевипустити ключ. Вважай його вкраденим.',
        },
      ],
      task: {
        kind: 'terminal',
        boot: () =>
          repoBase({
            '/srv/shop/.env': {
              content: 'DATABASE_URL=postgres://app:hunter2@db-01:5432/shop\n',
              owner: 'deploy',
              group: 'deploy',
            },
            '/srv/shop/debug.log': {
              content: 'noise\n',
              owner: 'deploy',
              group: 'deploy',
            },
          }),
        goals: [
          {
            id: 'init',
            label: 'Ініціалізувати репозиторій',
            check: (s) => s.git.initialized,
          },
          {
            id: 'gitignore',
            label: 'Створити .gitignore, який ігнорує .env і файли *.log',
            hintOnFail:
              'Один рядок на шаблон. Для логів працює маска зі зірочкою.',
            feedback: (s) => {
              const text = readFile(s.fs, '/srv/shop/.gitignore');
              if (text === null) return null;
              const hasEnv = /^\s*\.env\s*$/m.test(text);
              const hasLog = /^\s*\*\.log\s*$/m.test(text);
              if (hasEnv && hasLog) return null;
              if (!hasEnv && !hasLog) {
                return 'Файл є, але потрібних рядків у ньому немає. Має бути два: .env і *.log';
              }
              if (!hasEnv)
                return 'Бракує рядка .env — саме він і ховає секрет.';
              return /debug\.log/.test(text)
                ? 'Вказано конкретний файл. Потрібна маска на всі логи: *.log'
                : 'Бракує рядка для логів. Маска на всі такі файли — *.log';
            },
            check: (s) => {
              const text = readFile(s.fs, '/srv/shop/.gitignore') ?? '';
              return (
                /^\s*\.env\s*$/m.test(text) && /^\s*\*\.log\s*$/m.test(text)
              );
            },
          },
          {
            id: 'committed',
            label: 'Закомітити код',
            check: (s) => s.git.commits.length >= 1,
          },
          {
            id: 'clean',
            label: 'У коміті НЕ має бути ні .env, ні debug.log',
            hintOnFail:
              'Якщо ти зробив `git add .` до створення .gitignore — секрет уже в індексі. Натисни «Скинути».',
            check: (s) => {
              const tree = s.git.commits[s.git.commits.length - 1]?.tree ?? {};
              return (
                !('.env' in tree) &&
                !('debug.log' in tree) &&
                'server.js' in tree
              );
            },
          },
        ],
      },
      hints: [
        'Порядок критичний: спершу навчи git ігнорувати зайве, і лише потім додавай усе в індекс.',
        'Створи .gitignore з рядками `.env` і `*.log` (через echo і >>), а вже після цього роби git add . та коміт.',
        'git init\necho ".env" > .gitignore\necho "*.log" >> .gitignore\ngit add .\ngit commit -m "Add app with gitignore"\ngit status',
      ],
      solution:
        'git init\necho ".env" > .gitignore\necho "*.log" >> .gitignore\ngit add .\ngit commit -m "Add app with gitignore"\ngit status',
    },

    {
      id: 'l06-m03',
      title: 'Гілка під фічу',
      goal: 'Фіча зроблена в окремій гілці й влита в main.',
      xp: 170,
      theory: [
        {
          kind: 'text',
          text:
            'Гілка — це рухома закладка на коміт. Робота в окремій гілці означає, що `main` ' +
            'лишається робочим, поки ти щось ламаєш у себе. **Злиття** (англійською merge) — ' +
            'це коли зміни з однієї гілки переносять в іншу.',
        },
        {
          kind: 'table',
          rows: [
            ['git branch', 'список гілок; зірочка — поточна'],
            [
              'git checkout -b feature/x',
              'створити гілку і одразу перейти в неї',
            ],
            ['git checkout main', 'повернутись у main'],
            ['git merge feature/x', 'влити гілку в поточну'],
            ['git branch -d feature/x', 'прибрати за собою'],
          ],
        },
        {
          kind: 'note',
          text:
            'Мерджити треба **з тієї гілки, у яку** вливаєш. Щоб влити фічу в main, ' +
            'спочатку перейди в main і лише тоді роби `git merge feature/x`. ' +
            'Половина плутанини в git — від переплутаного напрямку.',
        },
      ],
      task: {
        kind: 'terminal',
        boot: () => committedRepo(),
        goals: [
          {
            id: 'branch',
            label: 'Створити гілку feature/health і перейти в неї',
            check: (s) =>
              s.git.branches['feature/health'] !== undefined &&
              s.history.some((line) => /git\s+(checkout|switch)/.test(line)),
          },
          {
            id: 'work',
            label: 'Додати файл health.js і закомітити його у цій гілці',
            hintOnFail:
              'Створи файл (echo ... > health.js), додай в індекс і зроби коміт.',
            check: (s) =>
              s.git.commits.some((commit) => 'health.js' in commit.tree) &&
              s.git.commits.length >= 2,
          },
          {
            id: 'merged',
            label: 'Повернутися в main і влити туди фічу',
            hintOnFail:
              'Merge робиться з гілки-приймача. Спершу checkout main.',
            check: (s) => {
              const head = s.git.branches.main;
              const commit = s.git.commits.find((each) => each.hash === head);
              return (
                s.git.branch === 'main' &&
                commit !== undefined &&
                'health.js' in commit.tree
              );
            },
          },
        ],
      },
      hints: [
        'Три фази: створити гілку → попрацювати й закомітити → повернутись у main і влити.',
        '`git checkout -b feature/health`, далі створи health.js, `git add health.js`, `git commit -m "..."`. Потім `git checkout main` і `git merge feature/health`.',
        'git checkout -b feature/health\necho "module.exports = () => \'ok\'" > health.js\ngit add health.js\ngit commit -m "Add health endpoint"\ngit checkout main\ngit merge feature/health',
      ],
      solution:
        'git checkout -b feature/health\necho "module.exports = () => \'ok\'" > health.js\ngit add health.js\ngit commit -m "Add health endpoint"\ngit checkout main\ngit merge feature/health',
    },

    {
      id: 'l06-m04',
      title: 'Конфлікт',
      goal: 'Ти розвʼязав конфлікт злиття вручну й довів мердж до коміту.',
      xp: 220,
      theory: [
        {
          kind: 'text',
          text:
            'Конфлікт виникає, коли **той самий рядок** змінили у двох гілках по-різному. ' +
            'Git не вгадує — він зупиняється і залишає обидва варіанти прямо у файлі. ' +
            'Позначка `HEAD` означає «те, що вже було у твоїй гілці», а нижче, ' +
            'після імені гілки, — те, що прийшло ззовні.',
        },
        {
          kind: 'code',
          caption: 'Як конфлікт виглядає всередині файлу',
          lines: [
            '<<<<<<< HEAD',
            'version=1.0.0',
            '=======',
            'version=2.0.0',
            '>>>>>>> feature/bump',
          ],
        },
        {
          kind: 'code',
          caption: 'Як розвʼязати конфлікт',
          lines: [
            'git status                     # які файли конфліктують',
            'cat VERSION                    # подивитись обидва варіанти',
            'echo "version=2.0.0" > VERSION # лишити правильний, без маркерів',
            'git add VERSION                # це і означає «я розвʼязав»',
            'git commit -m "Merge feature/bump"',
          ],
        },
        {
          kind: 'text',
          text:
            'Твоя робота: відкрити файл, **прибрати всі три маркери** (`<<<<<<<`, `=======`, `>>>>>>>`) ' +
            'і залишити той текст, який має бути насправді. Потім `git add файл` — це і є сигнал ' +
            '«я розвʼязав» — і `git commit`.',
        },
        {
          kind: 'note',
          text:
            'Якщо забути прибрати маркери й закомітити — вони поїдуть у прод як частина файлу. ' +
            'Тому git і не дає закомітити файл, у якому маркери ще стоять.',
        },
      ],
      task: {
        kind: 'terminal',
        intro: [
          'Ти зробив мердж, і git зупинився на конфлікті.',
          'Подивись `git status`, потім `cat VERSION`.',
          '',
        ],
        boot: () =>
          seed(
            committedRepo({
              '/srv/shop/VERSION': {
                content: 'version=1.0.0\n',
                owner: 'deploy',
                group: 'deploy',
              },
            }),
            [
              'git checkout -b feature/bump',
              'echo "version=2.0.0" > VERSION',
              'git add VERSION',
              'git commit -m "Bump to 2.0.0"',
              'git checkout main',
              'echo "version=1.0.1" > VERSION',
              'git add VERSION',
              'git commit -m "Patch release 1.0.1"',
              'git merge feature/bump',
            ],
          ),
        goals: [
          {
            id: 'looked',
            label: 'Подивитися, що саме конфліктує',
            check: (s) =>
              s.history.some((line) => /^git\s+status/.test(line.trim())) ||
              s.history.some((line) => /^cat\b.*VERSION/.test(line.trim())),
          },
          {
            id: 'markers',
            label: 'Прибрати з VERSION усі маркери конфлікту',
            hintOnFail:
              'У файлі не має лишитись ані <<<<<<<, ані =======, ані >>>>>>>.',
            check: (s) => {
              const text = readFile(s.fs, '/srv/shop/VERSION') ?? '';
              return (
                !text.includes('<<<<<<<') &&
                !text.includes('=======') &&
                !text.includes('>>>>>>>')
              );
            },
          },
          {
            id: 'resolved',
            label: 'Залишити версію 2.0.0 як переможця',
            hintOnFail:
              'З двох варіантів у файлі має лишитись той, що прийшов із гілки feature/bump.',
            feedback: (s) => {
              const text = (readFile(s.fs, '/srv/shop/VERSION') ?? '').trim();
              if (text === '' || text.includes('<<<<<<<')) return null;
              if (text.includes('version=2.0.0')) return null;
              return text.includes('version=1.0.1')
                ? 'Ти лишив версію з main (1.0.1). За умовою перемагає 2.0.0 — та, що з гілки feature/bump.'
                : `Зараз у VERSION «${text.replace(/\s+/g, ' ').slice(0, 40)}». Має лишитись рядок version=2.0.0`;
            },
            // The conflict block quotes both versions, so «contains 2.0.0» is
            // true before the player touches anything. The goal is only met
            // once the markers are gone AND that is the line left standing.
            check: (s) => {
              const text = readFile(s.fs, '/srv/shop/VERSION') ?? '';
              return (
                !text.includes('<<<<<<<') &&
                !text.includes('>>>>>>>') &&
                text.includes('version=2.0.0')
              );
            },
          },
          {
            id: 'committed',
            label: 'Завершити мердж комітом',
            hintOnFail:
              'Спершу `git add VERSION` — це і означає «конфлікт розвʼязано».',
            check: (s) =>
              s.git.conflicts.length === 0 && s.git.merging === null,
          },
        ],
      },
      hints: [
        'Git уже зупинився й лишив обидва варіанти у файлі. Подивись на нього і виріши, який правильний.',
        'Перезапиши VERSION одним рядком `version=2.0.0` (через echo > VERSION), потім `git add VERSION` і `git commit -m "..."`.',
        'git status\ncat VERSION\necho "version=2.0.0" > VERSION\ngit add VERSION\ngit commit -m "Merge feature/bump"',
      ],
      solution:
        'git status\ncat VERSION\necho "version=2.0.0" > VERSION\ngit add VERSION\ngit commit -m "Merge feature/bump"',
    },

    {
      id: 'l06-m05',
      title: 'Відкотити, не переписуючи історію',
      goal: 'Поганий коміт скасовано способом, безпечним для спільної гілки.',
      xp: 190,
      theory: [
        {
          kind: 'table',
          caption: 'Два способи «прибрати» коміт',
          rows: [
            [
              'git revert',
              'створює НОВИЙ коміт, який скасовує зміни. Історія лишається цілою',
            ],
            [
              'git reset --hard',
              'відкидає коміти, ніби їх не було. Історія переписується',
            ],
          ],
        },
        {
          kind: 'text',
          text:
            'Якщо коміт **уже запушений** і його бачили колеги — тільки `revert`. ' +
            '`reset --hard` на спільній гілці зламає репозиторій усім, хто встиг зробити pull: ' +
            'у них лишаться коміти, яких «більше не існує».',
        },
        {
          kind: 'text',
          text:
            'Обидві команди треба на щось націлити — на конкретний коміт. Його адреса — ' +
            '**хеш**, короткий набір символів у лівій колонці `git log --oneline`. ' +
            'Є й зручний псевдонім `HEAD` — він завжди означає «той коміт, на якому ' +
            'я стою зараз», тобто останній.',
        },
        {
          kind: 'code',
          caption: 'Скасовуємо останній коміт',
          lines: [
            'git log --oneline        # знайти коміт: ліворуч хеш, праворуч повідомлення',
            'git revert 4f2a1c9       # скасувати конкретний коміт за хешем',
            'git revert HEAD          # те саме для останнього — без пошуку хеша',
            'cat app.conf             # переконатись, що значення повернулось',
          ],
        },
        {
          kind: 'text',
          text:
            'Відкіт існує лише в тебе на машині, поки його не відправили назад у спільний ' +
            'репозиторій. Робить це `git push origin main`: `origin` — коротке імʼя ' +
            'сервера, звідки клонували, `main` — гілка, яку відправляємо.',
        },
        {
          kind: 'note',
          text:
            '`reset --hard` доречний лише для власних, ще нікуди не відправлених комітів. ' +
            'Він до того ж мовчки затирає незбережені зміни в робочому каталозі.',
        },
      ],
      task: {
        kind: 'terminal',
        intro: [
          'У main поїхав коміт, який зламав конфіг. Його вже запушено в origin.',
          'Подивись `git log --oneline`.',
          '',
        ],
        boot: () =>
          seed(
            committedRepo({
              '/srv/shop/app.conf': {
                content: 'workers=4\n',
                owner: 'deploy',
                group: 'deploy',
              },
            }),
            [
              'git remote add origin git@github.com:acme/shop.git',
              'git push origin main',
              'echo "workers=0" > app.conf',
              'git add app.conf',
              'git commit -m "Tune worker count"',
              'git push origin main',
            ],
          ),
        goals: [
          {
            id: 'log',
            label: 'Подивитися історію й знайти поганий коміт',
            check: (s) =>
              s.history.some((line) => /^git\s+log/.test(line.trim())),
          },
          {
            id: 'reverted',
            label: 'Скасувати його через revert (без переписування історії)',
            hintOnFail:
              'reset тут не підходить — коміт уже запушено. Потрібна команда, що створює НОВИЙ коміт.',
            check: (s) =>
              s.git.commits.some((commit) =>
                commit.message.startsWith('Revert'),
              ) && !s.history.some((line) => /git\s+reset\s+--hard/.test(line)),
          },
          {
            id: 'restored',
            label: 'Значення в app.conf повернулося до workers=4',
            check: (s) =>
              (readFile(s.fs, '/srv/shop/app.conf') ?? '').includes(
                'workers=4',
              ),
          },
        ],
      },
      hints: [
        'Коміт уже бачили інші. Один із двох способів відкоту для цієї ситуації заборонений.',
        'Потрібен `git revert <hash>` — він створить новий коміт, що скасовує зміни. Хеш візьми з `git log --oneline`.',
        'git log --oneline\ngit revert HEAD\ncat app.conf',
      ],
      solution:
        'git log --oneline\ngit revert HEAD\ncat app.conf\ngit push origin main',
    },
  ],
};
