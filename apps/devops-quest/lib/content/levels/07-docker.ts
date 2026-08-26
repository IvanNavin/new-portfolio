import { makeMachine } from '../../shell/machines';
import type { Level } from '../types';

const DOCKERFILE = [
  'FROM node:20-alpine',
  'WORKDIR /app',
  'COPY package.json package-lock.json ./',
  'RUN npm ci --omit=dev',
  'COPY . .',
  'EXPOSE 3000',
  'CMD ["node", "server.js"]',
  '',
].join('\n');

const COMPOSE = [
  'services:',
  '  api:',
  '    build: .',
  '    ports:',
  '      - "3000:3000"',
  '    environment:',
  '      - DATABASE_URL=postgres://app:secret@db:5432/shop',
  '    depends_on:',
  '      - db',
  '  db:',
  '    image: postgres:16-alpine',
  '    environment:',
  '      - POSTGRES_PASSWORD=secret',
  '',
].join('\n');

const appFiles = {
  '/srv/shop/server.js': {
    content:
      "require('http').createServer((_, res) => res.end('ok')).listen(3000);\n",
    owner: 'deploy',
    group: 'deploy',
  },
  '/srv/shop/package.json': {
    content: '{\n  "name": "shop",\n  "version": "1.0.0"\n}\n',
    owner: 'deploy',
    group: 'deploy',
  },
  '/srv/shop/package-lock.json': {
    content: '{}\n',
    owner: 'deploy',
    group: 'deploy',
  },
};

export const level07: Level = {
  id: 'l07',
  act: 3,
  title: 'Docker',
  subtitle: '«У мене працює» перестає бути виправданням.',
  brief:
    'Контейнер — це застосунок разом із його оточенням: тією ж версією рантайму, тими ж ' +
    'бібліотеками, тим самим користувачем. Образ збирається один раз і запускається однаково ' +
    'на ноуті, у CI та в проді. Саме це прибирає клас «у мене працює».',
  missions: [
    {
      id: 'l07-m01',
      title: 'Docker не пускає',
      goal: 'Ти отримав доступ до демона Docker і підняв перший контейнер.',
      xp: 170,
      theory: [
        {
          kind: 'text',
          text:
            'Docker влаштований як **демон** — фонова програма, що постійно працює від root ' +
            'і робить усю справжню роботу. Команда `docker`, яку ти набираєш, сама нічого ' +
            'не запускає: вона лише передає прохання демону через службовий файл ' +
            '`/var/run/docker.sock`. Свіжий користувач до цього файлу доступу не має — ' +
            'звідси `permission denied while trying to connect to the Docker daemon socket`.',
        },
        {
          kind: 'text',
          text:
            'Лікується додаванням користувача в групу `docker`. Це фактично рівносильно root ' +
            'на цій машині — тому в групу додають свідомо, а не «всіх про всяк випадок».',
        },
        {
          kind: 'table',
          rows: [
            ['docker pull image', 'завантажити образ'],
            ['docker images', 'які образи вже є локально'],
            [
              'docker run -d --name x image',
              'запустити контейнер у фоні під іменем x',
            ],
            [
              'docker ps / docker ps -a',
              'працюючі / усі, включно зі зупиненими',
            ],
            ['docker logs x', 'що контейнер надрукував на екран за час роботи'],
          ],
        },
        {
          kind: 'note',
          text:
            '**Образ** — це шаблон на диску. **Контейнер** — запущений екземпляр цього шаблону. ' +
            'З одного образу можна запустити хоч десять контейнерів.',
        },
      ],
      task: {
        kind: 'terminal',
        boot: () => makeMachine({ user: 'deploy', groups: ['docker'] }),
        goals: [
          {
            id: 'group',
            label: 'Додати користувача deploy у групу docker',
            hintOnFail:
              'Спробуй спершу просто `docker ps` — помилка сама підкаже, у чому річ. Не забудь про -aG.',
            check: (s) => (s.users.deploy?.groups ?? []).includes('docker'),
          },
          {
            id: 'pulled',
            label: 'Завантажити образ nginx:alpine',
            check: (s) =>
              s.docker.images.some(
                (image) => image.repo === 'nginx' && image.tag === 'alpine',
              ),
          },
          {
            id: 'running',
            label:
              'Запустити з нього контейнер із іменем web у фоновому режимі',
            hintOnFail: 'Потрібні прапорці -d (фон) і --name web.',
            check: (s) =>
              s.docker.containers.some(
                (container) =>
                  container.name === 'web' && container.status === 'running',
              ),
          },
          {
            id: 'checked',
            label: 'Переконатися, що він у списку працюючих',
            check: (s) => s.history.some((line) => /docker\s+ps/.test(line)),
          },
        ],
      },
      hints: [
        'Спершу просто спробуй `docker ps` — і уважно прочитай помилку. Вона про права, а не про Docker.',
        'Додай себе у групу docker через usermod -aG (з sudo). Далі: pull образу, run з -d і --name, потім ps.',
        'sudo usermod -aG docker deploy\ndocker pull nginx:alpine\ndocker run -d --name web nginx:alpine\ndocker ps',
      ],
      solution:
        'docker ps\nsudo usermod -aG docker deploy\ndocker pull nginx:alpine\ndocker run -d --name web nginx:alpine\ndocker ps',
    },

    {
      id: 'l07-m02',
      title: 'Свій Dockerfile',
      goal: 'Ти написав Dockerfile, який збирає застосунок і правильно використовує кеш шарів.',
      xp: 220,
      theory: [
        {
          kind: 'text',
          text:
            'Dockerfile — це рецепт образу: список інструкцій згори вниз. ' +
            'Кожна інструкція створює **шар** — збережений результат саме цього кроку. ' +
            'Docker їх запамʼятовує, тож якщо інструкція та її вхідні файли не змінились, ' +
            'він не виконує крок заново, а бере готовий шар із кешу.',
        },
        {
          kind: 'text',
          text:
            'Збирають образ командою `docker build -t імʼя .`. Крапка в кінці — це ' +
            '**контекст збірки**: каталог, файли з якого Docker бачить і може покласти ' +
            'в образ через `COPY`. Що поза цим каталогом — для збірки не існує.',
        },
        {
          kind: 'table',
          rows: [
            ['FROM', 'базовий образ. Завжди перша інструкція'],
            ['WORKDIR', 'робочий каталог усередині образу'],
            ['COPY src dst', 'покласти файли з контексту збірки в образ'],
            ['RUN', 'виконати команду під час ЗБІРКИ'],
            ['EXPOSE', 'задокументувати порт, який слухає застосунок'],
            ['CMD ["node","server.js"]', 'що виконати при ЗАПУСКУ контейнера'],
          ],
        },
        {
          kind: 'text',
          text:
            'Головний трюк: спочатку копіюй **лише** файли залежностей і став їх, і тільки потім ' +
            'копіюй решту коду. Тоді зміна одного рядка в коді не змушує перевстановлювати ' +
            'усі npm-пакети — цей шар лишається в кеші.',
        },
        {
          kind: 'note',
          text:
            'Різниця, яку часто плутають: `RUN` виконується один раз під час збірки образу, ' +
            '`CMD` — щоразу при старті контейнера.',
        },
      ],
      task: {
        kind: 'editor',
        filename: '/srv/shop/Dockerfile',
        language: 'dockerfile',
        starter:
          '# Напиши Dockerfile для Node-застосунку.\n# Точка входу — server.js, порт 3000.\n\n',
        goals: [
          {
            id: 'from',
            label: 'Почати з базового образу node (наприклад node:20-alpine)',
            hintOnFail: 'FROM має бути першою значущою інструкцією.',
            check: (text) => /^\s*FROM\s+node:/im.test(text),
          },
          {
            id: 'workdir',
            label: 'Задати робочий каталог через WORKDIR',
            check: (text) => /^\s*WORKDIR\s+\S+/im.test(text),
          },
          {
            id: 'deps-first',
            label:
              'Скопіювати package.json ОКРЕМО і встановити залежності до копіювання решти коду',
            hintOnFail:
              'Має бути COPY package*.json, потім RUN npm ci/install, і лише потім COPY решти. Інакше кеш не працює.',
            check: (text) => {
              const lines = text
                .split('\n')
                .map((line) => line.trim())
                .filter((line) => line !== '' && !line.startsWith('#'));
              const pkgCopy = lines.findIndex(
                (line) =>
                  /^COPY\s/i.test(line) &&
                  /package(-lock)?\.json|package\*\.json/i.test(line),
              );
              const install = lines.findIndex((line) =>
                /^RUN\s+.*npm\s+(ci|install)/i.test(line),
              );
              const fullCopy = lines.findIndex((line) =>
                /^COPY\s+\.\s+\./i.test(line),
              );
              return pkgCopy !== -1 && install > pkgCopy && fullCopy > install;
            },
          },
          {
            id: 'expose',
            label: 'Задокументувати порт 3000 через EXPOSE',
            check: (text) => /^\s*EXPOSE\s+3000\s*$/im.test(text),
          },
          {
            id: 'cmd',
            label: 'Задати CMD, що запускає server.js',
            hintOnFail:
              'Рекомендована форма — масив: CMD ["node", "server.js"].',
            check: (text) =>
              /^\s*CMD\s+\[\s*"node"\s*,\s*"server\.js"\s*\]/im.test(text),
          },
        ],
      },
      hints: [
        'Сім рядків. Порядок важливіший за вміст: подумай, що змінюється рідко, а що — щокоміту.',
        'FROM → WORKDIR → COPY файлів залежностей → RUN встановлення → COPY решти коду → EXPOSE → CMD.',
        DOCKERFILE,
      ],
      solution: DOCKERFILE,
    },

    {
      id: 'l07-m03',
      title: 'Збери і запусти',
      goal: 'Образ зібрано, контейнер працює й реально відповідає на HTTP-запит.',
      xp: 200,
      theory: [
        {
          kind: 'code',
          caption: 'Повний цикл',
          lines: [
            'docker build -t shop-api:1.0 .        # зібрати образ із Dockerfile у поточному каталозі',
            'docker run -d --name api -p 8080:3000 shop-api:1.0',
            'curl -I http://localhost:8080         # перевірити, що відповідає',
          ],
        },
        {
          kind: 'text',
          text:
            'Контейнер має власну мережу, тож зовні його портів не видно, поки їх явно ' +
            'не «пробросиш». **Хост** — це сама машина, на якій працює Docker, тобто твій ' +
            'сервер. У `-p 8080:3000` перше число — порт хоста, за яким стукають ззовні; ' +
            'друге — порт усередині контейнера, який слухає застосунок. ' +
            'Плутанина тут дає класичне «контейнер працює, але нічого не відкривається».',
        },
        {
          kind: 'text',
          text:
            'У `-t shop-api:1.0` після двокрапки стоїть **тег** — мітка версії образу. ' +
            'Той самий образ може мати кілька тегів, і саме за тегом ти потім кажеш, ' +
            'яку версію запускати.',
        },
        {
          kind: 'note',
          text:
            'Правило перевірки: `docker ps` каже лише, що процес живий. Що застосунок справді ' +
            'відповідає, доводить лише запит — `curl`.',
        },
      ],
      task: {
        kind: 'terminal',
        boot: () =>
          makeMachine({
            user: 'deploy',
            cwd: '/srv/shop',
            users: [{ name: 'deploy', groups: ['sudo', 'docker'] }],
            dirs: [{ path: '/srv/shop', owner: 'deploy', group: 'deploy' }],
            files: {
              ...appFiles,
              '/srv/shop/Dockerfile': {
                content: DOCKERFILE,
                owner: 'deploy',
                group: 'deploy',
              },
            },
            net: {
              hosts: { localhost: '127.0.0.1' },
              reachable: ['127.0.0.1', 'localhost'],
              http: {
                'http://localhost:8080/': {
                  status: 200,
                  statusText: 'OK',
                  headers: {
                    'Content-Type': 'text/plain',
                    'X-Powered-By': 'shop-api',
                  },
                  body: 'ok',
                },
              },
            },
          }),
        goals: [
          {
            id: 'built',
            label: 'Зібрати образ із тегом shop-api:1.0',
            hintOnFail:
              'Тег задається прапорцем -t, а крапка в кінці — це контекст збірки.',
            check: (s) =>
              s.docker.images.some(
                (image) => image.repo === 'shop-api' && image.tag === '1.0',
              ),
          },
          {
            id: 'running',
            label:
              'Запустити контейнер api, пробросивши порт 8080 хоста на 3000 у контейнері',
            hintOnFail: 'Формат -p ХОСТ:КОНТЕЙНЕР. Тут це -p 8080:3000.',
            check: (s) =>
              s.docker.containers.some(
                (container) =>
                  container.name === 'api' &&
                  container.status === 'running' &&
                  container.ports.includes('8080:3000'),
              ),
          },
          {
            id: 'verified',
            label:
              'Довести запитом, що застосунок відповідає на localhost:8080',
            check: (s) =>
              s.history.some((line) => /curl.*localhost:8080/.test(line)),
          },
        ],
      },
      hints: [
        'Три кроки: зібрати, запустити з пробросом порту, перевірити запитом.',
        '`docker build -t shop-api:1.0 .`, потім `docker run -d --name api -p 8080:3000 shop-api:1.0`, потім curl.',
        'docker build -t shop-api:1.0 .\ndocker run -d --name api -p 8080:3000 shop-api:1.0\ndocker ps\ncurl -I http://localhost:8080',
      ],
      solution:
        'docker build -t shop-api:1.0 .\ndocker run -d --name api -p 8080:3000 shop-api:1.0\ndocker ps\ncurl -I http://localhost:8080',
    },

    {
      id: 'l07-m04',
      title: 'Чому збірка триває пʼять хвилин',
      goal: 'Ти розумієш, як порядок інструкцій у Dockerfile впливає на швидкість збірки.',
      xp: 130,
      theory: [
        {
          kind: 'text',
          text:
            'Docker кешує шари згори вниз. Як тільки один шар змінився, **усі наступні** ' +
            'перебудовуються заново. Тому найстабільніші речі мають бути зверху, ' +
            'а те, що змінюється щокоміту, — знизу.',
        },
        {
          kind: 'note',
          text:
            'Практичний ефект: правильний порядок перетворює 5-хвилинну збірку на 15-секундну ' +
            'для звичайної зміни коду. Це найдешевша оптимізація CI, яку взагалі можна зробити.',
        },
      ],
      task: {
        kind: 'order',
        instruction:
          'Розстав інструкції Dockerfile так, щоб зміна одного рядка в коді **не** призводила до перевстановлення npm-залежностей.',
        items: [
          { id: 'from', label: '`FROM node:20-alpine`' },
          { id: 'workdir', label: '`WORKDIR /app`' },
          { id: 'copypkg', label: '`COPY package.json package-lock.json ./`' },
          { id: 'install', label: '`RUN npm ci --omit=dev`' },
          { id: 'copyall', label: '`COPY . .`' },
          { id: 'cmd', label: '`CMD ["node", "server.js"]`' },
        ],
        correct: ['from', 'workdir', 'copypkg', 'install', 'copyall', 'cmd'],
        explain:
          'Файли залежностей змінюються рідко, тому шар `npm ci` лишається в кеші. ' +
          'Якби `COPY . .` стояв перед установкою, будь-яка правка коду інвалідувала б кеш ' +
          'і тягнула повну перевстановку пакетів щоразу.',
      },
      hints: [
        'Подумай, що змінюється рідко (базовий образ, залежності), а що — при кожному коміті (код).',
        'Рідкозмінне — вгору, часто змінюване — вниз. Файли залежностей копіюються ОКРЕМО і РАНІШЕ за код.',
        'FROM → WORKDIR → COPY package*.json → RUN npm ci → COPY . . → CMD',
      ],
      solution:
        'FROM → WORKDIR → COPY package*.json → RUN npm ci → COPY . . → CMD',
    },

    {
      id: 'l07-m05',
      title: 'Кілька сервісів разом',
      goal: 'Застосунок і база піднімаються однією командою через Docker Compose.',
      xp: 190,
      theory: [
        {
          kind: 'text',
          text:
            'Реальний застосунок — це не один контейнер: є ще база, кеш, черга. ' +
            '`docker compose` описує їх усі в одному файлі й піднімає однією командою, ' +
            'автоматично зʼєднавши спільною мережею.',
        },
        {
          kind: 'text',
          text:
            'Файл пишеться у форматі **YAML**. Правило в нього одне, але суворе: ' +
            'вкладеність задається **відступами з пробілів** (табуляція заборонена), ' +
            'а `-` на початку рядка означає елемент списку. Двокрапка відділяє назву ' +
            'від значення.',
        },
        {
          kind: 'code',
          caption: 'docker-compose.yml, коротко',
          lines: [
            'services:',
            '  api:',
            '    build: .',
            '    ports: ["3000:3000"]',
            '    depends_on: [db]',
            '  db:',
            '    image: postgres:16-alpine',
          ],
        },
        {
          kind: 'table',
          rows: [
            ['docker compose up -d', 'підняти все у фоні'],
            ['docker compose ps', 'що зараз працює'],
            ['docker compose down', 'зупинити й прибрати'],
          ],
        },
        {
          kind: 'note',
          text:
            'Усередині compose-мережі сервіси звертаються один до одного **за іменем сервісу**: ' +
            'застосунок ходить у базу за хостом `db`, а не за `localhost`. ' +
            'Це найчастіша причина «connection refused» у новачків.',
        },
      ],
      task: {
        kind: 'terminal',
        boot: () =>
          makeMachine({
            user: 'deploy',
            cwd: '/srv/shop',
            users: [{ name: 'deploy', groups: ['sudo', 'docker'] }],
            dirs: [{ path: '/srv/shop', owner: 'deploy', group: 'deploy' }],
            files: {
              ...appFiles,
              '/srv/shop/Dockerfile': {
                content: DOCKERFILE,
                owner: 'deploy',
                group: 'deploy',
              },
              '/srv/shop/docker-compose.yml': {
                content: COMPOSE,
                owner: 'deploy',
                group: 'deploy',
              },
            },
          }),
        goals: [
          {
            id: 'read',
            label:
              'Прочитати docker-compose.yml і зрозуміти, які сервіси в ньому описані',
            check: (s) => s.history.some((line) => /cat\b.*compose/.test(line)),
          },
          {
            id: 'up',
            label: 'Підняти обидва сервіси (api і db)',
            hintOnFail: 'Одна команда піднімає все описане у файлі.',
            check: (s) =>
              s.docker.containers.some(
                (c) => c.name === 'shop-api' && c.status === 'running',
              ) &&
              s.docker.containers.some(
                (c) => c.name === 'shop-db' && c.status === 'running',
              ),
          },
          {
            id: 'listed',
            label: 'Переконатися, що обидва контейнери працюють',
            check: (s) =>
              s.history.some((line) => /docker\s+(compose\s+)?ps/.test(line)),
          },
        ],
      },
      hints: [
        'Файл уже написаний — спершу прочитай його, потім підніми описане однією командою.',
        '`docker compose up -d` підніме api і db разом. Далі перевір через `docker compose ps`.',
        'cat docker-compose.yml\ndocker compose up -d\ndocker compose ps',
      ],
      solution:
        'cat docker-compose.yml\ndocker compose up -d\ndocker compose ps',
    },
  ],
};
