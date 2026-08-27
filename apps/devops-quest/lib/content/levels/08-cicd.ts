import { makeMachine, seed } from '../../shell/machines';
import { answerFile } from '../goals';
import type { Level } from '../types';

const WORKFLOW_SOLUTION = [
  'name: CI',
  '',
  'on:',
  '  push:',
  '    branches: [main]',
  '  pull_request:',
  '',
  'jobs:',
  '  build:',
  '    runs-on: ubuntu-latest',
  '    steps:',
  '      - uses: actions/checkout@v4',
  '      - uses: actions/setup-node@v4',
  '        with:',
  '          node-version: 20',
  '          cache: npm',
  '      - run: npm ci',
  '      - run: npm test',
  '      - run: npm run build',
  '',
  '  deploy:',
  '    needs: build',
  "    if: github.ref == 'refs/heads/main'",
  '    runs-on: ubuntu-latest',
  '    steps:',
  '      - uses: actions/checkout@v4',
  '      - run: ./deploy.sh',
  '        env:',
  '          DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}',
  '',
].join('\n');

const LEAKY_WORKFLOW = [
  'name: Deploy',
  '',
  'on:',
  '  push:',
  '    branches: [main]',
  '',
  'jobs:',
  '  deploy:',
  '    runs-on: ubuntu-latest',
  '    steps:',
  '      - uses: actions/checkout@v4',
  '      - name: Push image',
  '        run: |',
  '          docker login -u ci -p hunter2docker registry.acme.io',
  '          docker push registry.acme.io/shop-api:latest',
  '        env:',
  '          DATABASE_URL: postgres://app:s3cr3t@db-01:5432/shop',
  '',
].join('\n');

export const level08: Level = {
  id: 'l08',
  act: 3,
  title: 'CI/CD',
  subtitle: 'Від «я задеплоїв руками» до «мерджнув — і воно поїхало».',
  brief:
    'CI перевіряє кожну зміну автоматично, CD доставляє її в середовище. ' +
    'Сенс не в тому, щоб «було модно», а в тому, щоб релізи були нудними: ' +
    'однакові, повторювані й такі, які можна відкотити.',
  missions: [
    {
      id: 'l08-m01',
      title: 'Перший пайплайн',
      goal: 'Кожен push у main проганяє тести й лише після цього деплоїть.',
      xp: 220,
      theory: [
        {
          kind: 'text',
          text:
            'GitHub Actions описується YAML-файлом у `.github/workflows/`. Три поняття: ' +
            '**on** (коли запускати), **jobs** (що робити) і **steps** (кроки всередині job).',
        },
        {
          kind: 'table',
          rows: [
            ['on: push', 'тригер — подія в репозиторії'],
            ['runs-on', 'на якій машині виконувати'],
            [
              'uses:',
              'взяти готовий чужий крок: checkout завантажує твій код на машину CI, setup-node ставить Node',
            ],
            ['run:', 'просто виконати команду в shell'],
            ['needs: build', 'ця job почнеться лише після успішної build'],
            [
              'if:',
              "умова. `if: github.ref == 'refs/heads/main'` — виконувати лише для гілки main",
            ],
            [
              '${{ secrets.X }}',
              'значення з сховища секретів — у логах буде замасковане',
            ],
          ],
        },
        {
          kind: 'note',
          text:
            'Ключове — `needs`. Без нього jobs виконуються **паралельно**, і деплой поїде ' +
            'одночасно з тестами, не чекаючи їхнього результату. Це найпоширеніша помилка ' +
            'у першому пайплайні.',
        },
      ],
      task: {
        kind: 'editor',
        filename: '.github/workflows/ci.yml',
        language: 'yaml',
        starter: [
          '# Опиши пайплайн:',
          '#  1. запускається на push у main',
          '#  2. job build: checkout, встановити залежності, npm test, npm run build',
          '#  3. job deploy: виконується ПІСЛЯ build, запускає ./deploy.sh',
          '#     і бере токен з secrets.DEPLOY_TOKEN',
          '',
          'name: CI',
          '',
        ].join('\n'),
        goals: [
          {
            id: 'trigger',
            label: 'Запускати пайплайн на push у гілку main',
            hintOnFail: 'Потрібен блок on: → push: → branches: [main].',
            check: (text) =>
              /on:/m.test(text) &&
              /push:/m.test(text) &&
              /branches:\s*\[?\s*main/m.test(text),
          },
          {
            id: 'checkout',
            label: 'Забрати код через actions/checkout',
            check: (text) => /uses:\s*actions\/checkout@/m.test(text),
          },
          {
            id: 'test',
            label: 'Прогнати тести (npm test)',
            check: (text) => /run:\s*npm\s+test/m.test(text),
          },
          {
            id: 'deploy-job',
            label: 'Описати окрему job deploy, що запускає ./deploy.sh',
            check: (text) =>
              /^\s{2}deploy:/m.test(text) && /deploy\.sh/m.test(text),
          },
          {
            id: 'needs',
            label: 'Деплой має чекати на успішну збірку (needs)',
            hintOnFail:
              'Без needs: build обидві jobs стартують одночасно, і зламаний код поїде в прод.',
            check: (text) => /needs:\s*\[?\s*build/m.test(text),
          },
          {
            id: 'secret',
            label: 'Токен деплою брати з secrets, а не писати в файл',
            hintOnFail: 'Синтаксис: ${{ secrets.DEPLOY_TOKEN }}',
            check: (text) => /\$\{\{\s*secrets\.\w+\s*\}\}/m.test(text),
          },
        ],
      },
      hints: [
        'Дві jobs: одна перевіряє, друга доставляє. Друга не має права початись раніше за першу.',
        'Структура: name → on.push.branches[main] → jobs.build (checkout, npm ci, npm test, npm run build) → jobs.deploy з needs: build і ./deploy.sh, токен через ${{ secrets.DEPLOY_TOKEN }}.',
        WORKFLOW_SOLUTION,
      ],
      solution: WORKFLOW_SOLUTION,
    },

    {
      id: 'l08-m02',
      title: 'Пароль у репозиторії',
      goal: 'З workflow прибрано всі захардкоджені секрети.',
      xp: 200,
      theory: [
        {
          kind: 'text',
          text:
            'Усе, що лежить у репозиторії, бачить кожен, хто має до нього доступ, — ' +
            'а ще воно назавжди лишається в історії git і у логах CI. ' +
            'Паролі, токени й рядки підключення туди не потрапляють ніколи.',
        },
        {
          kind: 'table',
          caption: 'Куди що класти',
          rows: [
            [
              'У репозиторій',
              'код, конфіги без секретів, .env.example з порожніми значеннями',
            ],
            ['У secrets CI', 'токени, паролі, ключі, DATABASE_URL'],
            ['На сервер у .env з правами 600', 'секрети рантайму'],
          ],
        },
        {
          kind: 'note',
          text:
            'GitHub маскує значення секретів у логах — але лише ті, що прийшли зі сховища. ' +
            'Пароль, написаний прямо в `run:`, надрукується у логи як звичайний текст.',
        },
      ],
      task: {
        kind: 'editor',
        filename: '.github/workflows/deploy.yml',
        language: 'yaml',
        starter: LEAKY_WORKFLOW,
        goals: [
          {
            id: 'no-password',
            label: 'Прибрати пароль docker login із файлу',
            hintOnFail:
              'Рядок з -p hunter2docker треба замінити на посилання на secrets.',
            check: (text) => !text.includes('hunter2docker'),
          },
          {
            id: 'no-dburl',
            label: 'Прибрати справжній DATABASE_URL із паролем',
            hintOnFail: 'Рядок з s3cr3t теж має зникнути.',
            check: (text) => !text.includes('s3cr3t'),
          },
          {
            id: 'uses-secrets',
            label: 'Замінити обидва значення на посилання на secrets',
            hintOnFail:
              'Мають зʼявитись щонайменше два вирази виду ${{ secrets.ІМʼЯ }}.',
            check: (text) =>
              (text.match(/\$\{\{\s*secrets\.\w+\s*\}\}/g) ?? []).length >= 2,
          },
          {
            id: 'still-works',
            label:
              'Не зламати сам пайплайн: docker push і checkout мають лишитись',
            check: (text) =>
              /docker push/m.test(text) && /actions\/checkout@/m.test(text),
          },
        ],
      },
      hints: [
        'У файлі два секрети відкритим текстом. Знайди їх і подумай, звідки вони мають братися.',
        'Заміни `-p hunter2docker` на `-p ${{ secrets.REGISTRY_PASSWORD }}`, а значення DATABASE_URL — на ${{ secrets.DATABASE_URL }}. Решту файлу не чіпай.',
        LEAKY_WORKFLOW.replace(
          'hunter2docker',
          '${{ secrets.REGISTRY_PASSWORD }}',
        ).replace(
          'postgres://app:s3cr3t@db-01:5432/shop',
          '${{ secrets.DATABASE_URL }}',
        ),
      ],
      solution: LEAKY_WORKFLOW.replace(
        'hunter2docker',
        '${{ secrets.REGISTRY_PASSWORD }}',
      ).replace(
        'postgres://app:s3cr3t@db-01:5432/shop',
        '${{ secrets.DATABASE_URL }}',
      ),
    },

    {
      id: 'l08-m03',
      title: 'Порядок стадій',
      goal: 'Ти знаєш, у якому порядку має працювати пайплайн і чому саме так.',
      xp: 130,
      theory: [
        {
          kind: 'text',
          text:
            'Спершу два слова. **Лінтер** — програма, що перевіряє код на помилки й стиль, ' +
            'не запускаючи його. **Staging** — окреме середовище, точна копія прода, ' +
            'але з тестовими даними: туди викочують першим, щоб зламати там, а не в людей.',
        },
        {
          kind: 'text',
          text:
            'Пайплайн будують за принципом «найдешевша перевірка — найраніше». ' +
            'Лінтер падає за 10 секунд, збірка образу — за 4 хвилини. ' +
            'Немає сенсу збирати образ коду, який не проходить лінтер.',
        },
        {
          kind: 'note',
          text:
            'І окремо: деплой у прод — це завжди **після** успішного деплою й перевірки ' +
            'на staging. Пайплайн, що їде одразу в прод, рано чи пізно везе туди аварію.',
        },
      ],
      task: {
        kind: 'order',
        instruction: 'Розстав стадії CI/CD-пайплайну в правильному порядку.',
        items: [
          { id: 'checkout', label: 'Checkout — забрати код репозиторію' },
          { id: 'deps', label: 'Встановити залежності (з кешем)' },
          {
            id: 'lint',
            label: 'Лінтер і перевірка типів — найшвидші перевірки',
          },
          { id: 'test', label: 'Прогнати тести' },
          { id: 'build', label: 'Зібрати артефакт / Docker-образ' },
          { id: 'staging', label: 'Задеплоїти на staging і перевірити' },
          { id: 'prod', label: 'Задеплоїти в прод' },
        ],
        correct: [
          'checkout',
          'deps',
          'lint',
          'test',
          'build',
          'staging',
          'prod',
        ],
        explain:
          'Спершу дешеві перевірки, потім дорогі, і лише наприкінці — доставка. ' +
          'Кожна стадія відсіює частину проблем, тож до прода доїжджає тільки те, ' +
          'що пройшло всі попередні ворота.',
      },
      hints: [
        'Питай себе: що коштує 10 секунд, а що — 5 хвилин? І що не має сенсу без попереднього кроку?',
        'Код → залежності → швидкі перевірки → тести → збірка → staging → прод.',
        'checkout → deps → lint → test → build → staging → prod',
      ],
      solution: 'checkout → залежності → lint → test → build → staging → prod',
    },

    {
      id: 'l08-m04',
      title: 'Реліз і відкат',
      goal: 'Ти випустив версію через тег і за секунди відкотився на попередню.',
      xp: 220,
      theory: [
        {
          kind: 'text',
          text:
            'Реліз, який неможливо відкотити, — це не реліз, а ставка. ' +
            'Тому образи тегують **версією**, а не `latest`: тоді відкат — це просто ' +
            'запуск попереднього тега.',
        },
        {
          kind: 'code',
          lines: [
            'git tag v1.1.0                      # позначити коміт версією',
            'docker build -t shop-api:1.1.0 .    # образ із тією ж версією',
            'docker stop api && docker rm api',
            'docker run -d --name api -p 8080:3000 shop-api:1.0.0   # відкат на попередню',
          ],
        },
        {
          kind: 'note',
          text:
            'Чому не `latest`: тег `latest` вказує щоразу на інший образ, тож «відкотитись на ' +
            'latest» неможливо — ти просто отримаєш той самий зламаний образ. ' +
            'Старий образ із конкретним тегом нікуди не дівається і чекає на полиці.',
        },
      ],
      task: {
        kind: 'terminal',
        intro: [
          'Версія 1.1.0 щойно поїхала в прод і почала віддавати 500.',
          'Образ shop-api:1.0.0 ще лежить локально. Відкоти реліз.',
          '',
        ],
        boot: () =>
          seed(
            makeMachine({
              user: 'deploy',
              cwd: '/srv/shop',
              users: [{ name: 'deploy', groups: ['sudo', 'docker'] }],
              dirs: [{ path: '/srv/shop', owner: 'deploy', group: 'deploy' }],
              files: {
                '/srv/shop/Dockerfile': {
                  content:
                    'FROM node:20-alpine\nWORKDIR /app\nCOPY . .\nCMD ["node","server.js"]\n',
                  owner: 'deploy',
                  group: 'deploy',
                },
                '/srv/shop/server.js': {
                  content: 'x\n',
                  owner: 'deploy',
                  group: 'deploy',
                },
              },
            }),
            [
              'docker build -t shop-api:1.0.0 .',
              'echo "broken" >> server.js',
              'docker build -t shop-api:1.1.0 .',
              'docker run -d --name api -p 8080:3000 shop-api:1.1.0',
            ],
          ),
        goals: [
          {
            id: 'looked',
            label: 'Подивитися, які образи є локально',
            hintOnFail:
              'Потрібно переконатись, що образ попередньої версії ще на місці.',
            check: (s) =>
              s.history.some((line) => /docker\s+images/.test(line)),
          },
          {
            id: 'stopped',
            label: 'Зупинити й прибрати контейнер зі зламаною версією',
            hintOnFail:
              'Працюючий контейнер не видаляється — спершу stop, потім rm.',
            check: (s) =>
              !s.docker.containers.some(
                (c) => c.name === 'api' && c.image.includes('1.1.0'),
              ),
          },
          {
            id: 'rolled-back',
            label:
              'Підняти контейнер api на образі shop-api:1.0.0 з тим самим портом',
            check: (s) =>
              s.docker.containers.some(
                (c) =>
                  c.name === 'api' &&
                  c.status === 'running' &&
                  c.image === 'shop-api:1.0.0' &&
                  c.ports.includes('8080:3000'),
              ),
          },
        ],
      },
      hints: [
        'Відкат — це не «полагодити код», а «повернути те, що працювало». Попередній образ уже є.',
        'Подивись `docker images`. Далі: stop api, rm api, і run того самого імені з образом 1.0.0 та портом 8080:3000.',
        'docker images\ndocker stop api\ndocker rm api\ndocker run -d --name api -p 8080:3000 shop-api:1.0.0\ndocker ps',
      ],
      solution:
        'docker images\ndocker stop api\ndocker rm api\ndocker run -d --name api -p 8080:3000 shop-api:1.0.0\ndocker ps',
    },

    {
      id: 'l08-m05',
      title: 'Чому впав білд',
      goal: 'Ти прочитав лог CI і назвав конкретну причину падіння.',
      xp: 170,
      theory: [
        {
          kind: 'text',
          text:
            'Кожна команда, завершуючись, повертає системі число — **код виходу**. ' +
            '`0` означає «все добре», будь-що інше — помилку. Саме за цим числом CI ' +
            'і вирішує, червоний білд чи зелений; тому в лозі так часто видно ' +
            '`exit code 1`.',
        },
        {
          kind: 'text',
          text:
            'Лог CI довгий і більшість у ньому — шум. Читати треба **знизу вгору** ' +
            'і шукати перший рядок з `Error`, `FAIL` або ненульовим кодом виходу. ' +
            'Усе, що після нього, — це вже наслідки.',
        },
        {
          kind: 'code',
          lines: [
            'grep -n -i "error" build.log',
            'grep -n "exit code" build.log',
            'tail -n 30 build.log',
          ],
        },
      ],
      task: {
        kind: 'terminal',
        boot: () =>
          makeMachine({
            user: 'deploy',
            cwd: '/home/deploy',
            files: {
              '/home/deploy/build.log': {
                content: [
                  'Run actions/checkout@v4',
                  'Syncing repository: acme/shop',
                  'Run actions/setup-node@v4',
                  'Found in cache @ /opt/hostedtoolcache/node/20.11.0',
                  'Run npm ci',
                  'added 412 packages in 6s',
                  'Run npm test',
                  '> shop@1.0.0 test',
                  '> vitest run',
                  '',
                  ' ✓ src/cart.test.ts (12 tests)',
                  ' ✓ src/user.test.ts (8 tests)',
                  ' ❯ src/checkout.test.ts (5 tests | 1 failed)',
                  '   FAIL  applies discount for loyalty tier',
                  '   AssertionError: expected 90 to be 85',
                  '',
                  ' Test Files  1 failed | 2 passed (3)',
                  '      Tests  1 failed | 24 passed (25)',
                  'Error: Process completed with exit code 1.',
                ].join('\n'),
                owner: 'deploy',
                group: 'deploy',
              },
            },
          }),
        goals: [
          {
            id: 'searched',
            label: 'Знайти в лозі рядки з помилками',
            hintOnFail:
              'grep по слову error або перегляд кінця файлу через tail.',
            check: (s) =>
              s.history.some(
                (line) =>
                  /^(grep|tail)\b/.test(line.trim()) &&
                  line.includes('build.log'),
              ),
          },
          answerFile({
            id: 'stage',
            path: '/home/deploy/stage.txt',
            label:
              'Записати у ~/stage.txt, на якій команді впав пайплайн (npm test / npm ci / npm run build)',
            expected: 'npm test',
            hintOnFail:
              'Шукай останню команду, яка встигла запуститись перед помилкою.',
            diagnose: (value) =>
              value === 'npm ci'
                ? 'npm ci відпрацював успішно — «added 412 packages». Дивись далі по лозі.'
                : value === 'npm run build'
                  ? 'До збірки пайплайн не дійшов — він упав раніше.'
                  : null,
          }),
          answerFile({
            id: 'file',
            path: '/home/deploy/failing.txt',
            label: 'Записати у ~/failing.txt імʼя тестового файлу, який упав',
            expected: 'src/checkout.test.ts',
            hintOnFail: 'Це файл, біля якого в лозі стоїть «1 failed».',
            diagnose: (value) =>
              /cart|user/.test(value)
                ? `${value} пройшов — біля нього стоїть галочка. Шукай той, де «1 failed».`
                : !value.includes('/')
                  ? 'Потрібен шлях так, як він написаний у лозі, разом із каталогом src/.'
                  : null,
          }),
        ],
      },
      hints: [
        'Читай знизу вгору: знайди перший справжній збій, а не останній рядок логу.',
        'Пайплайн дійшов до `npm test` і там впав файл src/checkout.test.ts. Запиши це у два файли через echo.',
        'grep -n -i error build.log\ntail -n 15 build.log\necho "npm test" > ~/stage.txt\necho "src/checkout.test.ts" > ~/failing.txt',
      ],
      solution:
        'grep -n -i error build.log\ntail -n 15 build.log\necho "npm test" > ~/stage.txt\necho "src/checkout.test.ts" > ~/failing.txt',
    },
  ],
};
