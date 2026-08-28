import { getNode, isDir, readFile } from '../../shell/fs';
import { makeMachine } from '../../shell/machines';
import { answerFile, notTheKey } from '../goals';
import type { Level } from '../types';

const APP_LOG = [
  '2031-03-14T08:59:01Z INFO  boot: starting shop-api v2.4.1',
  '2031-03-14T08:59:02Z INFO  db: connected to postgres://db-01:5432',
  '2031-03-14T09:01:44Z INFO  http: GET /health 200 3ms',
  '2031-03-14T09:02:10Z WARN  cache: redis latency 412ms (threshold 200ms)',
  '2031-03-14T09:02:55Z INFO  http: GET /products 200 61ms',
  '2031-03-14T09:03:12Z ERROR payment: gateway timeout after 30000ms',
  '2031-03-14T09:03:12Z INFO  http: POST /checkout 502 30011ms',
  '2031-03-14T09:04:02Z INFO  http: GET /products 200 58ms',
  '2031-03-14T09:05:31Z WARN  cache: redis latency 388ms (threshold 200ms)',
  '2031-03-14T09:06:00Z ERROR payment: gateway timeout after 30000ms',
  '2031-03-14T09:06:01Z INFO  http: POST /checkout 502 30004ms',
  '2031-03-14T09:07:19Z INFO  http: GET /health 200 2ms',
  '2031-03-14T09:08:45Z ERROR db: connection pool exhausted (size=20)',
  '2031-03-14T09:09:02Z INFO  http: GET /products 200 64ms',
  '2031-03-14T09:10:33Z INFO  http: GET /health 200 3ms',
].join('\n');

export const level01: Level = {
  id: 'l01',
  act: 1,
  title: 'Термінал і файлова система',
  subtitle: 'Перший день. Тобі дали SSH-доступ і нічого не пояснили.',
  brief:
    'Усе, що DevOps робить на сервері, починається з двох питань: «де я?» і «що тут лежить?». ' +
    'Цей рівень ставить руку на навігацію, перегляд і пошук — далі без цього нікуди.',
  missions: [
    {
      id: 'l01-m01',
      title: 'Де я взагалі?',
      goal: 'Ти вмієш зорієнтуватися в дереві каталогів і дійти до логів застосунку.',
      xp: 100,
      theory: [
        {
          kind: 'text',
          text:
            'Ти щойно зайшов на сервер. Термінал показує рядок-запрошення: ' +
            '`deploy@app-01:~$` — це твоє імʼя користувача (`deploy`), імʼя самого ' +
            'сервера (`app-01`) і каталог, у якому ти зараз стоїш. ' +
            'Тильда `~` означає домашній каталог, тобто `/home/deploy`.',
        },
        {
          kind: 'text',
          text:
            'Працює це так: ти пишеш **команду** й натискаєш Enter. Команда може мати ' +
            '**прапорці** (починаються з дефіса — вони змінюють її поведінку) ' +
            'і **аргументи** (з чим саме працювати). Порядок завжди однаковий.',
        },
        {
          kind: 'code',
          caption: 'З чого складається рядок',
          lines: [
            'ls -la /var/log',
            '│  │   │',
            '│  │   └── аргумент: над чим працюємо',
            '│  └────── прапорці: як саме працювати',
            '└───────── команда: що робимо',
          ],
        },
        {
          kind: 'table',
          caption: 'Три команди, з яких починається все',
          rows: [
            ['pwd', 'print working directory — де я зараз'],
            ['ls', 'list — що лежить у каталозі'],
            ['cd', 'change directory — перейти в інший каталог'],
          ],
        },
        {
          kind: 'text',
          text:
            'Шлях, що починається з `/` — **абсолютний**, він читається від кореня файлової системи. ' +
            'Без `/` — **відносний**, від того місця, де ти стоїш зараз. `..` означає «на рівень вище».',
        },
        {
          kind: 'code',
          caption: 'Одне й те саме, двома способами',
          lines: [
            'cd /var/log/app   # тепер ти в /var/log/app',
            'cd ../..          # два рівні вгору — і ти в /var',
          ],
        },
        {
          kind: 'note',
          text:
            'Забув, що робить команда? Прямо тут працює `man <команда>` — наприклад `man ls`. ' +
            'Реальний інженер дивиться в man постійно, це не соромно.',
        },
      ],
      task: {
        kind: 'terminal',
        intro: [
          'Linux app-01 6.8.0-41-generic x86_64',
          'Last login: Fri Mar 14 09:20:11 2031 from 10.0.0.1',
          '',
        ],
        boot: () =>
          makeMachine({
            hostname: 'app-01',
            user: 'deploy',
            files: {
              '/var/log/app/app.log': {
                content: `${APP_LOG}\n`,
                owner: 'deploy',
                group: 'deploy',
              },
              '/var/log/app/access.log': {
                content: 'x\n',
                owner: 'deploy',
                group: 'deploy',
              },
              '/var/log/syslog':
                'Mar 14 09:00:01 app-01 CRON[900]: pam_unix(cron:session)\n',
            },
          }),
        goals: [
          {
            id: 'pwd',
            label: 'Дізнатися, у якому каталозі ти зараз',
            hintOnFail: 'Є команда з трьох літер, яка друкує поточний шлях.',
            check: (s) => s.history.some((line) => line.trim() === 'pwd'),
          },
          {
            id: 'cd',
            label: 'Перейти в каталог /var/log/app',
            hintOnFail:
              'Каталог можна вказати одним абсолютним шляхом — не обовʼязково йти покроково.',
            check: (s) => s.cwd === '/var/log/app',
          },
          {
            id: 'ls',
            label: 'Подивитися, які лог-файли там лежать',
            hintOnFail: 'Дві літери. Список вмісту каталогу.',
            check: (s) =>
              s.history.some((line) => /^ls(\s|$)/.test(line.trim())),
          },
        ],
      },
      hints: [
        'Почни з того, щоб зрозуміти, де ти стоїш. Потім переходь — і вже там дивись вміст.',
        'Порядок такий: спершу команда, що друкує шлях; потім перехід у /var/log/app; потім список файлів.',
        'Це `pwd`, далі `cd /var/log/app`, далі `ls`.',
      ],
      solution: 'pwd\ncd /var/log/app\nls',
    },

    {
      id: 'l01-m02',
      title: 'Те, чого не видно',
      goal: 'Ти знайшов прихований конфіг і витяг із нього значення.',
      xp: 120,
      theory: [
        {
          kind: 'text',
          text:
            'Файли, чиє імʼя починається з крапки, `ls` за замовчуванням **не показує**. ' +
            'Саме там живуть конфіги: `.bashrc`, `.env`, `.ssh/`, `.gitignore`. ' +
            'Половина «зникань» файлів у новачків — це просто прихований файл.',
        },
        {
          kind: 'table',
          rows: [
            ['ls -a', 'показати все, включно з прихованим'],
            ['ls -l', 'довгий формат: права, власник, розмір'],
            ['ls -la', 'обидва разом — робоча комбінація на кожен день'],
          ],
        },
        {
          kind: 'text',
          text:
            'Зверни увагу на `-la`: це **не** окремий прапорець, а два склеєні — ' +
            '`-l` і `-a`. Однолітерні прапорці дозволено писати під одним дефісом ' +
            'у будь-якому порядку, тож `ls -la`, `ls -al` і `ls -l -a` — це те саме. ' +
            'Правило працює для всіх команд, і далі трапляться склейки з пʼяти літер.',
        },
        {
          kind: 'text',
          text:
            'Знайти файл — пів справи; далі його треба **прочитати**. Це робить `cat`: ' +
            'вона просто виводить вміст файлу на екран. Імʼя від «concatenate» — ' +
            'їй можна дати й кілька файлів, і вона склеїть їх один за одним.',
        },
        {
          kind: 'code',
          caption: 'Читаємо файл',
          lines: [
            'cat .app.conf          # показати вміст',
            'cat /etc/hostname      # працює з будь-яким шляхом',
            'cat a.txt b.txt        # два файли підряд',
          ],
        },
        {
          kind: 'text',
          text:
            'Майже всі конфіги в Linux мають той самий вигляд: рядок `КЛЮЧ=ЗНАЧЕННЯ`. ' +
            'Ліворуч від `=` — **назва** налаштування, праворуч — **значення**, тобто те, ' +
            'що воно насправді дорівнює. Рядки, що починаються з `#`, — це коментарі, ' +
            'їх програма ігнорує.',
        },
        {
          kind: 'code',
          caption: 'Читаємо конфіг: де назва, а де значення',
          lines: [
            '# коментар — не налаштування',
            'APP_NAME=shop-api',
            '│        │',
            '│        └── значення: shop-api',
            '└── назва: APP_NAME',
          ],
        },
        {
          kind: 'text',
          text:
            'А щоб зберегти щось не на екран, а у файл, використовують перенаправлення: ' +
            '`>` створює файл заново (затираючи старий вміст), `>>` дописує в кінець.',
        },
        {
          kind: 'code',
          lines: [
            'echo "hello" > note.txt     # створити/перезаписати',
            'echo "again" >> note.txt    # дописати',
          ],
        },
        {
          kind: 'note',
          text:
            '`echo` друкує **рівно той текст**, який ти йому дав, — він нічого не «підставляє». ' +
            '`echo APP_NAME` запише в файл слово `APP_NAME`, а не `shop-api`. ' +
            'Щоб записати значення, його треба написати самому: `echo shop-api > файл`.',
        },
      ],
      task: {
        kind: 'terminal',
        boot: () =>
          makeMachine({
            user: 'deploy',
            files: {
              '/home/deploy/.app.conf': {
                content:
                  '# налаштування середовища застосунку\nAPP_NAME=shop-api\nENVIRONMENT=production\nLOG_LEVEL=info\n',
                owner: 'deploy',
                group: 'deploy',
              },
              '/home/deploy/.bashrc': {
                content: '# ~/.bashrc\n',
                owner: 'deploy',
                group: 'deploy',
              },
              '/home/deploy/README.md': {
                content: 'Nothing to see here.\n',
                owner: 'deploy',
                group: 'deploy',
              },
            },
          }),
        goals: [
          {
            id: 'ls-a',
            label: 'Показати приховані файли в домашньому каталозі',
            hintOnFail: 'Звичайний ls їх не покаже — потрібен прапорець.',
            check: (s) =>
              s.history.some(
                (line) => /^ls\b/.test(line.trim()) && /\s-\w*a/.test(line),
              ),
          },
          {
            id: 'read',
            label: 'Прочитати знайдений прихований конфіг',
            hintOnFail: 'Вивести вміст файлу на екран — команда з трьох літер.',
            check: (s) =>
              s.history.some((line) => /\bcat\b.*\.app\.conf/.test(line)),
          },
          answerFile({
            id: 'answer',
            path: '/home/deploy/answer.txt',
            label:
              'Записати у ~/answer.txt значення ENVIRONMENT — тобто слово праворуч від «=»',
            expected: 'production',
            hintOnFail:
              'Потрібне одне слово — значення з рядка ENVIRONMENT=, а не назва змінної.',
            diagnose: notTheKey('ENVIRONMENT'),
          }),
        ],
      },
      hints: [
        'Звичайний `ls` бреше: він приховує все, що починається з крапки. Знайди прапорець, який це вимикає.',
        '`ls -la` покаже прихований конфіг. Прочитай його через `cat`, знайди рядок ENVIRONMENT і запиши саме значення у файл через `>`.',
        'ls -la\ncat .app.conf\necho production > answer.txt',
      ],
      solution: 'ls -la\ncat .app.conf\necho production > answer.txt',
    },

    {
      id: 'l01-m03',
      title: 'Розкладаємо реліз по полицях',
      goal: 'На сервері зʼявилась стандартна структура каталогів для деплою, а архів переїхав на місце.',
      xp: 140,
      theory: [
        {
          kind: 'text',
          text:
            'Майже кожен деплой на сервері виглядає однаково: каталог `releases/`, ' +
            'де лежить кожна версія окремо, і `shared/` зі спільними даними, ' +
            'які мають пережити оновлення — логи, завантажені файли, конфіг.',
        },
        {
          kind: 'table',
          rows: [
            [
              'mkdir -p a/b/c',
              'створити всю гілку одразу; -p не свариться, якщо вже є',
            ],
            ['cp file dest', 'копіювати (для каталогів потрібен -r)'],
            ['mv file dest', 'перемістити або перейменувати — оригінал зникає'],
            ['rm -r dir', 'видалити рекурсивно. Кошика немає.'],
          ],
        },
        {
          kind: 'note',
          text:
            '`rm` не питає підтвердження і нічого не відновлює. Найдорожчі аварії в кар’єрі ' +
            'починаються з `rm -rf` не в тому каталозі. Перед видаленням варто зробити `ls` того ж шляху.',
        },
      ],
      task: {
        kind: 'terminal',
        intro: [
          'Реліз приїхав на сервер, але ліг не туди: архів лежить у /tmp.',
          'Подивись `ls /tmp`, щоб дізнатись його точне імʼя.',
          '',
        ],
        boot: () =>
          makeMachine({
            user: 'deploy',
            cwd: '/home/deploy',
            dirs: [
              {
                path: '/srv/app',
                owner: 'deploy',
                group: 'deploy',
                mode: 0o755,
              },
            ],
            files: {
              '/tmp/app-v2.4.1.tar.gz': {
                content: 'BINARY-BLOB\n',
                owner: 'deploy',
                group: 'deploy',
              },
            },
          }),
        goals: [
          {
            id: 'releases',
            label: 'Створити каталог /srv/app/releases',
            check: (s) => isDir(getNode(s.fs, '/srv/app/releases')),
          },
          {
            id: 'shared',
            label:
              'Створити каталог /srv/app/shared/logs (разом із проміжним shared)',
            hintOnFail:
              'Обидва рівні можна створити однією командою з потрібним прапорцем.',
            check: (s) => isDir(getNode(s.fs, '/srv/app/shared/logs')),
          },
          {
            id: 'moved',
            label: 'Перемістити архів із /tmp у /srv/app/releases',
            check: (s) =>
              getNode(s.fs, '/srv/app/releases/app-v2.4.1.tar.gz') !== null,
          },
          {
            id: 'gone',
            label:
              'Архіву більше немає у /tmp — тобто ти перемістив його, а не скопіював',
            hintOnFail: 'Копія лишає оригінал на місці. Потрібна інша команда.',
            check: (s) => getNode(s.fs, '/tmp/app-v2.4.1.tar.gz') === null,
          },
        ],
      },
      hints: [
        'Два каталоги і одне переміщення. Зверни увагу: shared/logs — це два рівні вкладеності.',
        '`mkdir -p` створює всю гілку одразу. Для архіву потрібна команда, після якої в /tmp нічого не залишиться.',
        'ls /tmp\nmkdir -p /srv/app/releases\nmkdir -p /srv/app/shared/logs\nmv /tmp/app-v2.4.1.tar.gz /srv/app/releases/\nls /tmp\nls /srv/app/releases',
      ],
      solution:
        'ls /tmp\nmkdir -p /srv/app/releases\nmkdir -p /srv/app/shared/logs\nmv /tmp/app-v2.4.1.tar.gz /srv/app/releases/\nls /tmp\nls /srv/app/releases',
    },

    {
      id: 'l01-m04',
      title: 'Логи: труби й перенаправлення',
      goal: 'Ти вибрав з лога тільки помилки, зберіг їх окремо і порахував.',
      xp: 160,
      theory: [
        {
          kind: 'text',
          text:
            'Це вже справжня робота DevOps: у лозі десятки тисяч рядків, а тобі потрібні три. ' +
            'Інструмент — `grep`, а склеює все **пайп** `|`: вивід зліва стає входом справа.',
        },
        {
          kind: 'code',
          caption: 'Класичний ланцюжок',
          lines: [
            'cat app.log | grep ERROR          # тільки рядки з ERROR',
            'cat app.log | grep ERROR | wc -l  # скільки їх',
            'grep -n ERROR app.log             # те саме, без зайвого cat, з номерами рядків',
          ],
        },
        {
          kind: 'table',
          rows: [
            ['grep -i', 'без різниці регістру'],
            ['grep -n', 'показати номери рядків'],
            ['grep -v', 'навпаки: все, крім збігів'],
            ['wc -l', 'порахувати рядки'],
            [
              'tail -n 20',
              'останні 20 рядків — те, що дивляться першим при аварії',
            ],
          ],
        },
        {
          kind: 'note',
          text:
            '`>` перенаправляє у файл те, що інакше пішло б на екран. Комбінація `grep ... > file` — ' +
            'найдешевший спосіб зберегти вибірку для колеги.',
        },
      ],
      task: {
        kind: 'terminal',
        boot: () =>
          makeMachine({
            user: 'deploy',
            cwd: '/var/log/app',
            files: {
              '/var/log/app/app.log': {
                content: `${APP_LOG}\n`,
                owner: 'deploy',
                group: 'deploy',
              },
            },
          }),
        goals: [
          {
            id: 'errors-file',
            label:
              'Записати у /home/deploy/errors.txt лише ті рядки логу, що містять ERROR',
            hintOnFail:
              'У файлі мають бути ВСІ три рядки з ERROR і жодного зайвого. Перевір, чи не потрапив туди WARN.',
            check: (s) => {
              const text = readFile(s.fs, '/home/deploy/errors.txt');
              if (!text) return false;
              const lines = text.trim().split('\n').filter(Boolean);
              return (
                lines.length === 3 &&
                lines.every((line) => line.includes('ERROR'))
              );
            },
          },
          answerFile({
            id: 'count-file',
            path: '/home/deploy/error-count.txt',
            label:
              'Записати кількість цих помилок у /home/deploy/error-count.txt',
            expected: '3',
            hintOnFail: 'Має бути саме число — скільки рядків з ERROR у лозі.',
            diagnose: (value) =>
              /^\d+$/.test(value)
                ? `Число «${value}» не те. Перерахуй: скільки рядків містять ERROR?`
                : 'Тут має бути тільки число, без тексту навколо. Порахувати рядки вміє wc -l.',
          }),
          {
            id: 'used-pipe',
            label: 'Скористатися пайпом хоча б раз',
            check: (s) => s.history.some((line) => line.includes('|')),
          },
        ],
      },
      hints: [
        'Тобі потрібні два файли: один із самими рядками ERROR, другий — з їх кількістю.',
        'Вибірку робить `grep ERROR app.log`, а порахувати її можна, віддавши результат у `wc -l` через пайп. Не забудь `>`.',
        'grep ERROR app.log\ngrep ERROR app.log > /home/deploy/errors.txt\ngrep ERROR app.log | wc -l > /home/deploy/error-count.txt\ncat /home/deploy/error-count.txt',
      ],
      solution:
        'grep ERROR app.log\ngrep ERROR app.log > /home/deploy/errors.txt\ngrep ERROR app.log | wc -l > /home/deploy/error-count.txt\ncat /home/deploy/error-count.txt',
    },

    {
      id: 'l01-m05',
      title: 'Знайти голку в /etc',
      goal: 'Ти знайшов конфіг, у якому хтось лишив увімкнений debug у проді.',
      xp: 180,
      theory: [
        {
          kind: 'text',
          text:
            'Класична задача: «десь у конфігах лишився debug, знайди де». Файлів сотні, ' +
            'імена невідомі. Два інструменти: `find` шукає **файли** за іменем/типом/правами, ' +
            '`grep -r` шукає **текст** усередині файлів.',
        },
        {
          kind: 'code',
          lines: [
            'find /etc -name "*.conf"        # усі .conf під /etc',
            'find /etc -type d               # тільки каталоги',
            'grep -r "debug" /etc/app        # де в тексті зустрічається debug',
            'grep -rn "debug=true" /etc      # з номерами рядків',
          ],
        },
        {
          kind: 'note',
          text:
            'Різниця, яку варто закарбувати: `find` — про **імена та метадані**, `grep` — про **вміст**. ' +
            'Плутанина між ними коштує людям годин.',
        },
      ],
      task: {
        kind: 'terminal',
        boot: () =>
          makeMachine({
            user: 'deploy',
            cwd: '/home/deploy',
            files: {
              '/etc/app/api.conf':
                'listen=0.0.0.0:8080\nworkers=4\ndebug=false\n',
              '/etc/app/cache.conf': 'host=redis-01\nport=6379\ndebug=false\n',
              '/etc/app/worker/queue.conf':
                'concurrency=8\ndebug=true\nretries=3\n',
              '/etc/app/notes.txt': 'debug notes: nothing here\n',
              '/etc/nginx/nginx.conf': 'worker_processes auto;\n',
            },
          }),
        goals: [
          {
            id: 'searched',
            label:
              'Скористатися пошуком по вмісту файлів (grep -r) або по іменах (find)',
            check: (s) =>
              s.history.some(
                (line) =>
                  /^grep\b.*-\w*r/.test(line.trim()) ||
                  /^find\b/.test(line.trim()),
              ),
          },
          answerFile({
            id: 'answer',
            path: '/home/deploy/found.txt',
            label:
              'Записати повний шлях знайденого файлу в /home/deploy/found.txt',
            expected: '/etc/app/worker/queue.conf',
            hintOnFail:
              'Потрібен повний шлях від кореня до файлу, де саме debug=true.',
            diagnose: (value) =>
              value.includes('notes.txt')
                ? 'У notes.txt слово debug лише згадується — там немає debug=true. Шукай далі.'
                : !value.startsWith('/')
                  ? `«${value}» — це не повний шлях. Він має починатися з «/».`
                  : null,
          }),
        ],
      },
      hints: [
        'Слово debug зустрічається в кількох файлах. Тобі потрібен той, де воно саме `debug=true`.',
        'Шукай по вмісту рекурсивно: `grep -r "debug=true" /etc`. Вивід підкаже шлях — його й запиши у файл.',
        'grep -r "debug=true" /etc\necho /etc/app/worker/queue.conf > /home/deploy/found.txt',
      ],
      solution:
        'grep -r "debug=true" /etc\necho /etc/app/worker/queue.conf > /home/deploy/found.txt',
    },
  ],
};
