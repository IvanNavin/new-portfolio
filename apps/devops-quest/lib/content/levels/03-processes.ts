import { makeMachine } from '../../shell/machines';
import { answerFile } from '../goals';
import type { Level } from '../types';

export const level03: Level = {
  id: 'l03',
  act: 1,
  title: 'Процеси та сервіси',
  subtitle: 'Щось їсть увесь процесор, а сайт лежить. Розберись.',
  brief:
    'Програма, що працює, — це процес. Програма, якою керує система, — це сервіс (unit systemd). ' +
    'Уміти подивитись процеси, прибити зависле і підняти сервіс — це буквальний зміст фрази ' +
    '«сервер лежить, глянь, будь ласка».',
  missions: [
    {
      id: 'l03-m01',
      title: 'Хто зʼїв процесор',
      goal: 'Ти знайшов процес-пожирач і зупинив його правильним сигналом.',
      xp: 150,
      theory: [
        {
          kind: 'text',
          text:
            'Кожна запущена програма — це **процес**, і система дає йому номер: **PID** ' +
            '(process id). Саме за цим номером до процесу звертаються — щоб подивитись ' +
            'на нього чи зупинити.',
        },
        {
          kind: 'text',
          text:
            '`ps aux` показує всі процеси в системі: користувача, PID, скільки відсотків ' +
            'процесора й памʼяті вони їдять, і саму команду. `top` — те саме, але живим ' +
            'списком, відсортованим за навантаженням.',
        },
        {
          kind: 'code',
          lines: [
            'ps aux                  # усі процеси',
            'ps aux | grep node      # тільки ті, де є "node"',
            'top                     # інтерактивний список за CPU',
          ],
        },
        {
          kind: 'table',
          caption: 'Сигнали: не всі однакові',
          rows: [
            [
              'kill PID',
              'SIGTERM (15) — «завершись, будь ласка». Процес встигає прибрати за собою',
            ],
            [
              'kill -9 PID',
              'SIGKILL — ядро вбиває миттєво. Дані в буферах губляться',
            ],
            ['kill -HUP PID', 'перечитати конфіг, не перезапускаючись'],
            ['killall name', 'по імені, а не по PID'],
          ],
        },
        {
          kind: 'text',
          text:
            'Зупиняють процес не «кнопкою», а **сигналом** — коротким повідомленням від ' +
            'системи до процесу. Різні сигнали означають різне, і саме тому в `kill` ' +
            'стільки варіантів.',
        },
        {
          kind: 'note',
          text:
            'Починай завжди з `kill` без прапорців. `-9` — це коли ввічливий варіант не спрацював. ' +
            'Звичка одразу бити `-9` призводить до побитих файлів і незакритих транзакцій.',
        },
      ],
      task: {
        kind: 'terminal',
        boot: () =>
          makeMachine({
            user: 'deploy',
            processes: [
              {
                pid: 1290,
                user: 'deploy',
                command: 'node /srv/app/server.js',
                cpu: 2.1,
                mem: 4.2,
              },
              {
                pid: 1421,
                user: 'deploy',
                command: 'node /srv/app/import-worker.js',
                cpu: 98.4,
                mem: 31.7,
              },
              {
                pid: 1502,
                user: 'postgres',
                command: 'postgres: writer process',
                cpu: 1.2,
                mem: 8.1,
              },
            ],
          }),
        goals: [
          {
            id: 'listed',
            label: 'Подивитися список процесів',
            hintOnFail:
              'Класична пара літер + три прапорці: покажи всі процеси всіх користувачів.',
            check: (s) =>
              s.history.some((line) => /^(ps|top|htop)\b/.test(line.trim())),
          },
          {
            id: 'killed',
            label: 'Зупинити процес, який їсть майже весь процесор',
            hintOnFail:
              'Прибити треба саме пожирача — сервер на 1290 і postgres мають вижити.',
            check: (s) => !s.processes.some((p) => p.pid === 1421),
          },
          {
            id: 'survivors',
            constraint: true,
            label: 'Основний сервер і база мають лишитись живими',
            hintOnFail:
              'Якщо ця ціль почервоніла — ти прибив зайве. Натисни «Скинути» й спробуй точніше.',
            check: (s) =>
              s.processes.some((p) => p.pid === 1290) &&
              s.processes.some((p) => p.pid === 1502),
          },
        ],
      },
      hints: [
        'Спершу подивись, що взагалі крутиться. Виснови роби за колонкою %CPU.',
        '`ps aux` покаже PID 1421 з майже 100% CPU. Зупини саме його — за номером.',
        'ps aux\nkill 1421\nps aux',
      ],
      solution: 'ps aux\nkill 1421\nps aux',
    },

    {
      id: 'l03-m02',
      title: 'Сайт не відкривається',
      goal: 'nginx запущено і він буде підніматися сам після перезавантаження сервера.',
      xp: 160,
      theory: [
        {
          kind: 'text',
          text:
            'systemd — це те, що керує сервісами в сучасному Linux. Кожен сервіс — «unit», ' +
            'наприклад `nginx.service`. Керує ним команда `systemctl`.',
        },
        {
          kind: 'table',
          rows: [
            ['systemctl status nginx', 'працює чи ні + останні рядки логу'],
            ['systemctl start nginx', 'запустити ЗАРАЗ'],
            [
              'systemctl enable nginx',
              'запускати ПІСЛЯ РЕБУТУ (зараз не запускає!)',
            ],
            ['systemctl enable --now nginx', 'і те, і те однією командою'],
            ['systemctl restart nginx', 'перезапустити'],
          ],
        },
        {
          kind: 'note',
          text:
            'Найпоширеніша помилка новачка: зробити `start`, переконатися, що працює, піти. ' +
            'Сервер перезавантажили вночі — сервіс не піднявся, бо не було `enable`. ' +
            'І навпаки: `enable` без `--now` нічого не запускає прямо зараз.',
        },
        {
          kind: 'text',
          text:
            'Керування сервісами змінює систему, тому потребує root — тобто `sudo`. ' +
            'А от `status` можна дивитись і без нього.',
        },
        {
          kind: 'text',
          text:
            'І остання перевірка. «Сервіс active» означає лише те, що процес живий; ' +
            'що він справді приймає зʼєднання, показує `ss` — вона перелічує **порти**, ' +
            'які хтось слухає. Порт — це номер «дверей» на сервері: 80 для HTTP, ' +
            '443 для HTTPS, 22 для SSH.',
        },
        {
          kind: 'code',
          caption: 'Комбінація прапорців, яку варто просто запамʼятати',
          lines: [
            'ss -tulpn',
            '   ││││└── n: числа замість назв — 80, а не "http"',
            '   │││└─── p: показати процес і його pid',
            '   ││└──── l: лише ті, що СЛУХАЮТЬ (listening)',
            '   │└───── u: протокол UDP',
            '   └────── t: протокол TCP',
          ],
        },
        {
          kind: 'text',
          text:
            'Це знову пʼять окремих прапорців під одним дефісом — той самий ' +
            'принцип, що й `ls -la`. Головний тут `l`: **саме він** просить ' +
            'показати слухачів. Без нього `ss` покаже встановлені зʼєднання, ' +
            'а не тих, хто тримає порти, — тож `ss -n` на це питання не відповідає. ' +
            'А `p` додає колонку з процесом і його **pid** — тим самим номером, ' +
            'за яким процес потім зупиняють.',
        },
        {
          kind: 'code',
          caption:
            'Ось як виглядає відповідь: pid шукати всередині users:((…))',
          lines: [
            'tcp LISTEN 0 4096 0.0.0.0:80  0.0.0.0:*  users:(("python3",pid=2201,fd=6))',
            '                        │                          │        └── ось pid',
            '                        └── порт                   └── імʼя процесу',
          ],
        },
      ],
      task: {
        kind: 'terminal',
        boot: () =>
          makeMachine({
            user: 'deploy',
            services: [
              {
                name: 'nginx',
                description:
                  'A high performance web server and a reverse proxy server',
                active: false,
                enabled: false,
                port: 80,
                log: [
                  'Stopped A high performance web server and a reverse proxy server.',
                ],
              },
              {
                name: 'postgresql',
                description: 'PostgreSQL RDBMS',
                active: true,
                enabled: true,
                port: 5432,
              },
            ],
          }),
        goals: [
          {
            id: 'status',
            label: 'Перевірити стан nginx',
            check: (s) =>
              s.history.some((line) => /systemctl\s+status\s+nginx/.test(line)),
          },
          {
            id: 'running',
            label: 'Запустити nginx прямо зараз',
            check: (s) => s.services.nginx?.active === true,
          },
          {
            id: 'enabled',
            label: 'Зробити так, щоб він піднімався після перезавантаження',
            hintOnFail: 'Запущений ≠ увімкнений в автозапуск. Це різні дії.',
            check: (s) => s.services.nginx?.enabled === true,
          },
          {
            id: 'port',
            label: 'Переконатися, що порт 80 тепер слухається',
            hintOnFail: 'Подивись сокети: ss -tulpn',
            check: (s) =>
              s.net.listening.some((entry) => entry.port === 80) &&
              // Credit only a form that actually lists listeners: bare `ss`
              // shows established connections, so it answers nothing here.
              s.history.some((line) =>
                /^(ss|netstat)\s+-\S*[la]/.test(line.trim()),
              ),
          },
        ],
      },
      hints: [
        'Спочатку подивись, у якому він стані. Далі потрібні дві різні речі: запустити зараз і увімкнути на майбутнє.',
        'Команди міняють систему, тож із sudo. Можна зробити двома командами (start + enable) або однією з прапорцем --now. Наприкінці перевір порт через ss -tulpn.',
        'systemctl status nginx\nsudo systemctl enable --now nginx\nss -tulpn',
      ],
      solution:
        'systemctl status nginx\nsudo systemctl enable --now nginx\nss -tulpn',
    },

    {
      id: 'l03-m03',
      title: 'Читаємо журнал, а не гадаємо',
      goal: 'Ти знайшов у журналі причину падіння сервісу і записав її.',
      xp: 180,
      theory: [
        {
          kind: 'text',
          text:
            'Коли сервіс не піднімається, відповідь майже завжди вже написана в журналі. ' +
            '`journalctl -u <unit>` показує логи конкретного юніта.',
        },
        {
          kind: 'code',
          lines: [
            'journalctl -u nginx           # усе, що писав nginx',
            'journalctl -u nginx -n 20     # останні 20 рядків',
            'journalctl -u nginx | grep -i error',
          ],
        },
        {
          kind: 'note',
          text:
            'Порядок дій під час аварії: `systemctl status` (що зараз) → `journalctl -u` (що сталося) ' +
            '→ `ss -tulpn` (хто зайняв порт). Гадати й перезапускати навмання — марна трата часу.',
        },
      ],
      task: {
        kind: 'terminal',
        boot: () =>
          makeMachine({
            user: 'deploy',
            processes: [
              {
                pid: 2201,
                user: 'root',
                command: 'python3 -m http.server 80',
                cpu: 0.3,
                mem: 1.1,
              },
            ],
            net: {
              interfaces: [
                { name: 'lo', ip: '127.0.0.1', prefix: 8, up: true },
                { name: 'eth0', ip: '10.0.0.5', prefix: 24, up: true },
              ],
              hosts: { localhost: '127.0.0.1' },
              dns: {},
              listening: [
                { port: 22, proto: 'tcp', process: 'sshd', address: '0.0.0.0' },
                {
                  port: 80,
                  proto: 'tcp',
                  process: 'python3',
                  address: '0.0.0.0',
                },
              ],
              firewall: { enabled: false, rules: [] },
              http: {},
              reachable: ['127.0.0.1', 'localhost', '10.0.0.5'],
            },
            services: [
              {
                name: 'nginx',
                description: 'A high performance web server',
                active: false,
                enabled: true,
                port: 80,
                log: [
                  'Starting A high performance web server...',
                  'emerg: bind() to 0.0.0.0:80 failed (98: Address already in use)',
                  'emerg: still could not bind()',
                  'nginx.service: Failed with result "exit-code".',
                  'Failed to start A high performance web server.',
                ],
              },
            ],
          }),
        goals: [
          {
            id: 'journal',
            label: 'Прочитати журнал юніта nginx',
            hintOnFail: 'journalctl з прапорцем -u і назвою юніта.',
            check: (s) =>
              s.history.some((line) => /journalctl.*nginx/.test(line)),
          },
          {
            id: 'sockets',
            label: 'Подивитися, хто зайняв порт 80',
            check: (s) =>
              // Credit only a form that actually lists listeners: bare `ss`
              // shows established connections, so it answers nothing here.
              s.history.some((line) =>
                /^(ss|netstat)\s+-\S*[la]/.test(line.trim()),
              ),
          },
          answerFile({
            id: 'answer',
            path: '/home/deploy/culprit.txt',
            label: 'Записати PID процесу-загарбника у /home/deploy/culprit.txt',
            expected: '2201',
            hintOnFail:
              'У виводі ss pid стоїть усередині users:(("імʼя",pid=…)). У ps aux — це колонка PID.',
            diagnose: (value) =>
              value === '80'
                ? 'Це номер порту, а не PID. PID — це номер процесу зі списку ps.'
                : /^\d+$/.test(value)
                  ? `PID «${value}» не той. Знайди в ss або ps саме того, хто зайняв порт 80.`
                  : 'Тут має бути лише число — PID процесу.',
          }),
          {
            id: 'fixed',
            label: 'Звільнити порт і підняти nginx',
            hintOnFail:
              'Поки порт зайнятий, nginx не стартує — скільки не перезапускай.',
            check: (s) => s.services.nginx?.active === true,
          },
        ],
      },
      hints: [
        'Не перезапускай навмання. Спершу дізнайся з журналу, ЧОМУ він падає, потім — хто заважає.',
        'У журналі буде «Address already in use» — значить порт 80 уже кимось зайнятий. Знайди його через ss -tulpn або ps aux, запиши PID у файл, прибий процес і тільки тоді стартуй nginx.',
        'journalctl -u nginx\nss -tulpn\nps aux\necho 2201 > /home/deploy/culprit.txt\nsudo kill 2201\nsudo systemctl start nginx\nsystemctl status nginx',
      ],
      solution:
        'journalctl -u nginx\nss -tulpn\nps aux\necho 2201 > /home/deploy/culprit.txt\nsudo kill 2201\nsudo systemctl start nginx\nsystemctl status nginx',
    },

    {
      id: 'l03-m04',
      title: 'Порядок дій під час аварії',
      goal: 'Ти знаєш, у якій послідовності діагностувати впалий сервіс.',
      xp: 110,
      theory: [
        {
          kind: 'text',
          text:
            'Під тиском люди починають тикати `restart` наосліп. Це рідко допомагає і завжди ' +
            'знищує докази. Робочий порядок — від найдешевшого й найінформативнішого до дій.',
        },
        {
          kind: 'text',
          text:
            'В останньому кроці зустрінеться `curl` — це «браузер без картинок»: ' +
            'команда, що робить HTTP-запит прямо з термінала й показує відповідь. ' +
            'Прапорець `-I` виводить лише службові заголовки, серед яких код відповіді. ' +
            'Докладно про неї — наступного рівня; тут вона потрібна тільки як фінальна перевірка.',
        },
        {
          kind: 'note',
          text:
            'Перезапуск — це **останній** крок, а не перший. Спершу зʼясуй причину, інакше ' +
            'через годину все впаде знову, і ти вже не матимеш логів того падіння.',
        },
      ],
      task: {
        kind: 'order',
        instruction:
          'Сервіс `nginx` не стартує. Розстав кроки діагностики в правильному порядку — від першого до останнього.',
        items: [
          {
            id: 'status',
            label: '`systemctl status nginx` — подивитися поточний стан юніта',
          },
          {
            id: 'journal',
            label:
              '`journalctl -u nginx -n 50` — прочитати, з якою помилкою він упав',
          },
          {
            id: 'ports',
            label: '`ss -tulpn` — перевірити, чи не зайнятий потрібний порт',
          },
          {
            id: 'fix',
            label: 'Усунути саму причину (звільнити порт / полагодити конфіг)',
          },
          {
            id: 'start',
            label: '`sudo systemctl start nginx` — підняти сервіс',
          },
          {
            id: 'verify',
            label:
              '`curl -I localhost` — переконатися, що він реально відповідає',
          },
        ],
        correct: ['status', 'journal', 'ports', 'fix', 'start', 'verify'],
        explain:
          'Стан → причина → перевірка гіпотези → усунення → запуск → підтвердження. Останній крок ' +
          'найважливіший: «сервіс active» і «сайт відповідає» — це не одне й те саме.',
      },
      hints: [
        'Спочатку збираєш інформацію, потім щось міняєш. Дія без діагнозу — це вгадування.',
        'Найдешевша команда — status. Далі журнал скаже, ЩО саме зламалось, і лише тоді ти перевіряєш конкретну гіпотезу про порт.',
        'status → journalctl → ss → усунути причину → start → curl для перевірки.',
      ],
      solution:
        'systemctl status → journalctl -u → ss -tulpn → усунути причину → systemctl start → curl -I',
    },

    {
      id: 'l03-m05',
      title: 'Start чи enable?',
      goal: 'Ти більше не переплутаєш запуск і автозапуск.',
      xp: 100,
      theory: [
        {
          kind: 'table',
          caption: 'Дві незалежні речі',
          rows: [
            ['active', 'працює прямо зараз, у цю секунду'],
            ['enabled', 'systemd підніме його після наступного ребуту'],
          ],
        },
        {
          kind: 'text',
          text:
            'Ці стани не повʼязані. Сервіс може бути `active` і `disabled` (працює, але після ' +
            'ребуту зникне) або `inactive` і `enabled` (зараз лежить, але після ребуту встане).',
        },
      ],
      task: {
        kind: 'quiz',
        question:
          'Ти виконав `sudo systemctl enable nginx` на щойно налаштованому сервері й пішов. Що станеться?',
        options: [
          {
            id: 'a',
            label:
              'nginx запуститься одразу, працюватиме далі й сам підніметься після перезавантаження',
          },
          {
            id: 'b',
            label:
              'nginx **не** запуститься зараз, але підніметься після перезавантаження сервера',
          },
          {
            id: 'c',
            label:
              'nginx запуститься зараз, але після перезавантаження сервера вже не підніметься',
          },
          {
            id: 'd',
            label:
              'Команда поверне помилку: спершу сервіс треба запустити через start',
          },
        ],
        correct: ['b'],
        explain:
          '`enable` лише створює символьне посилання в автозавантаженні — він нічого не запускає ' +
          'у цю мить. Щоб зробити обидві дії одразу, є `systemctl enable --now nginx`.',
      },
      hints: [
        'Подумай, що фізично робить `enable`: він щось запускає чи щось записує на майбутнє?',
        '`enable` створює symlink у systemd, щоб юніт піднявся при завантаженні. На поточний стан це не впливає.',
        'Правильна відповідь — та, де сервіс зараз НЕ запускається, але підніметься після ребуту.',
      ],
      solution:
        'enable вмикає автозапуск на майбутнє; щоб ще й запустити зараз — enable --now.',
    },
  ],
};
