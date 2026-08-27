import { getNode } from '../../shell/fs';
import { makeMachine } from '../../shell/machines';
import type { Level } from '../types';

export const level02: Level = {
  id: 'l02',
  act: 1,
  title: 'Користувачі, групи, права',
  subtitle: 'Чому «Permission denied» — це не помилка, а політика.',
  brief:
    'Linux нікому не вірить на слово. Кожен файл має власника, групу і три набори прав. ' +
    'Половина інцидентів у проді — це або занадто вузькі права («сервіс не читає конфіг»), ' +
    'або занадто широкі («ключ лежав з правами 644 і його прочитали всі»).',
  missions: [
    {
      id: 'l02-m01',
      title: 'Хто я і що мені можна',
      goal: 'Ти розумієш, під ким працюєш, у яких ти групах і коли потрібен sudo.',
      xp: 120,
      theory: [
        {
          kind: 'text',
          text:
            'У Linux ти завжди хтось конкретний. `whoami` каже імʼя, `id` — ще й числовий ' +
            'ідентифікатор (**uid**), основну групу і всі додаткові. Групи вирішують, ' +
            'до чого ти маєш доступ: файл дозволяє щось «своїй» групі, і всі в ній це можуть.',
        },
        {
          kind: 'text',
          text:
            'Окремо стоїть **root** — головний користувач системи, у якого uid дорівнює `0`. ' +
            'Йому дозволено все й завжди: права файлів на нього просто не діють. ' +
            'Саме тому під root не працюють постійно.',
        },
        {
          kind: 'table',
          rows: [
            ['whoami', 'імʼя поточного користувача'],
            ['id', 'uid, gid і список груп'],
            ['groups', 'коротко: лише групи'],
            [
              '/etc/passwd',
              'список усіх акаунтів системи — звичайний текстовий файл',
            ],
          ],
        },
        {
          kind: 'text',
          text:
            '`sudo` виконує **одну команду** від імені root. Він працює лише якщо ти в групі ' +
            '`sudo`. Інакше отримаєш `is not in the sudoers file`.',
        },
        {
          kind: 'text',
          text:
            'Перед цим `sudo` перевірить, що це справді ти, — і спитає **твій власний** ' +
            'пароль, а не рутовий. Пароль Тараса Оксана продиктувала в дзвінку: ' +
            '`horih2031`. Під час набору він не показується — ні крапок, ні зірочок. ' +
            'Це нормально, просто друкуй і тисни Enter.',
        },
        {
          kind: 'note',
          text:
            'Спитає він лише **раз**: далі `sudo` памʼятає, що ти вже підтвердився, ' +
            'приблизно 15 хвилин для цього термінала. Тому наступні команди підуть мовчки. ' +
            'А на хмарних серверах його часто взагалі налаштовують не питати ' +
            '(`NOPASSWD`) — щоб скрипти й CI могли працювати без людини.',
        },
        {
          kind: 'note',
          text:
            'Працювати постійно під root — погана звичка: одна помилка в шляху, і `rm -rf` ' +
            'зносить систему. Правило: звичайний користувач + sudo там, де справді треба.',
        },
      ],
      task: {
        kind: 'terminal',
        boot: () =>
          makeMachine({
            user: 'deploy',
            // The only mission where sudo asks: every later one assumes the
            // credential cache from earlier in the shift, as it works for real.
            sudoLocked: true,
            files: {
              '/root/.secret-plan': {
                content: 'ship it on friday\n',
                mode: 0o600,
                owner: 'root',
              },
            },
          }),
        goals: [
          {
            id: 'id',
            label: 'Подивитися свій uid і список груп',
            hintOnFail: 'Команда з двох літер показує uid, gid і групи одразу.',
            check: (s) => s.history.some((line) => /^id\b/.test(line.trim())),
          },
          {
            id: 'passwd',
            label: 'Переглянути список акаунтів системи (/etc/passwd)',
            check: (s) =>
              s.history.some((line) => line.includes('/etc/passwd')),
          },
          {
            id: 'sudo',
            label:
              'Прочитати /root/.secret-plan — файл, до якого твій користувач доступу не має',
            hintOnFail:
              'Просто cat поверне Permission denied. Потрібно виконати ту саму команду від імені root.',
            check: (s) =>
              s.history.some(
                (line) =>
                  /^sudo\b/.test(line.trim()) && line.includes('.secret-plan'),
              ),
          },
        ],
      },
      hints: [
        'Спершу дізнайся, хто ти. Потім подивись, хто ще є в системі. І лише тоді — файл, який тобі «не можна».',
        '`id` покаже групи. `/etc/passwd` читається звичайним `cat`. А для чужого файлу потрібен префікс, що піднімає права на одну команду — і він спитає пароль.',
        'id\ncat /etc/passwd\nsudo cat /root/.secret-plan\nhorih2031',
      ],
      solution: 'id\ncat /etc/passwd\nsudo cat /root/.secret-plan\nhorih2031',
    },

    {
      id: 'l02-m02',
      title: 'Вісім, чотири, два, один',
      goal: 'Скрипт деплою став виконуваним, а конфіг — доступним на читання групі.',
      xp: 150,
      theory: [
        {
          kind: 'text',
          text:
            'Кожен файл дозволяє три дії: `r` — читати (read), `w` — змінювати (write), ' +
            '`x` — виконувати (execute), тобто запускати як програму. ' +
            'І задаються вони окремо для трьох категорій: **власника** файлу, ' +
            'його **групи** й усіх **інших**.',
        },
        {
          kind: 'code',
          caption: 'Ось що показує ls -l у першій колонці',
          lines: [
            '-rwxr-xr-x',
            '│└┬┘└┬┘└┬┘',
            '│ │  │  └── інші:   r-x → читати й виконувати',
            '│ │  └───── група:  r-x → читати й виконувати',
            '│ └──────── власник: rwx → усе',
            '└────────── тип: «-» файл, «d» каталог',
          ],
        },
        {
          kind: 'text',
          text:
            'Тепер звідки беруться цифри. Для кожної категорії є три перемикачі — ' +
            '`r`, `w`, `x` — і кожен або увімкнений, або ні. Три перемикачі дають ' +
            'рівно вісім комбінацій, тож усю категорію можна записати **однією цифрою** ' +
            'від 0 до 7.',
        },
        {
          kind: 'text',
          text:
            'Щоб із перемикачів вийшло число, кожному дали вагу: `r` = **4**, `w` = **2**, ' +
            '`x` = **1**. Ваги не випадкові — це 4, 2, 1, тобто розряди двійкового числа. ' +
            'Саме тому будь-яка комбінація дає своє унікальне число: досить **додати** ' +
            'ваги увімкнених.',
        },
        {
          kind: 'table',
          caption: 'Усі вісім цифр — цю таблицю варто просто знати',
          rows: [
            ['7', 'rwx — читати, писати, виконувати (4+2+1)'],
            ['6', 'rw- — читати й писати (4+2)'],
            ['5', 'r-x — читати й виконувати (4+1)'],
            ['4', 'r-- — тільки читати'],
            ['3', '-wx — писати й виконувати (2+1), майже не трапляється'],
            ['2', '-w- — тільки писати, теж рідкість'],
            ['1', '--x — тільки виконувати'],
            ['0', '--- — нічого не можна'],
          ],
        },
        {
          kind: 'text',
          text:
            'Категорій три — власник, група, інші, — тому й цифр у числі завжди три, ' +
            'у тому самому порядку. Перша цифра про власника, друга про групу, ' +
            'третя про всіх решту.',
        },
        {
          kind: 'code',
          caption: 'Складаємо два приклади',
          lines: [
            '755:  власник rwx = 4+2+1 = 7',
            '      група   r-x = 4+0+1 = 5',
            '      інші    r-x = 4+0+1 = 5',
            '',
            '644:  власник rw- = 4+2+0 = 6',
            '      група   r-- = 4+0+0 = 4',
            '      інші    r-- = 4+0+0 = 4',
          ],
        },
        {
          kind: 'table',
          caption: 'Ті числа, які треба знати напамʼять',
          rows: [
            ['755', 'rwxr-xr-x — виконувані файли й каталоги'],
            ['644', 'rw-r--r-- — звичайні файли, конфіги'],
            ['600', 'rw------- — секрети: ключі, .env, паролі'],
            ['700', 'rwx------ — приватні каталоги, наприклад ~/.ssh'],
          ],
        },
        {
          kind: 'code',
          caption: 'Як це застосувати',
          lines: [
            'chmod 755 deploy.sh            # rwx власнику, r-x групі й іншим',
            'chmod 644 app.conf             # rw- власнику, r-- решті',
            'chmod 600 ~/.ssh/id_ed25519    # rw- і більше нікому',
            'ls -l deploy.sh                # перевірити, що вийшло',
          ],
        },
        {
          kind: 'text',
          text:
            'Тобто формула проста: `chmod` — число — файл. Число завжди з трьох цифр, ' +
            'у тому самому порядку, що й трійки в `ls -l`: власник, група, інші.',
        },
        {
          kind: 'text',
          text:
            'Є й символьний запис: `chmod u+x file` (додати власнику виконання), ' +
            '`chmod go-w file` (забрати запис групі й іншим), `chmod a=r file` (усім лише читання). ' +
            'Перевірити результат — `ls -l`.',
        },
        {
          kind: 'note',
          text:
            'Для **каталогу** `x` означає не «виконати», а «зайти всередину». Каталог із правами ' +
            '`644` неможливо відкрити навіть власнику — класична пастка.',
        },
      ],
      task: {
        kind: 'terminal',
        boot: () =>
          makeMachine({
            user: 'deploy',
            cwd: '/srv/app',
            dirs: [{ path: '/srv/app', owner: 'deploy', group: 'deploy' }],
            files: {
              '/srv/app/deploy.sh': {
                content: '#!/bin/bash\nset -e\necho "deploying..."\n',
                mode: 0o644,
                owner: 'deploy',
                group: 'deploy',
              },
              '/srv/app/app.conf': {
                content: 'listen=0.0.0.0:8080\n',
                mode: 0o600,
                owner: 'deploy',
                group: 'deploy',
              },
            },
          }),
        goals: [
          {
            id: 'exec',
            label: 'Зробити deploy.sh виконуваним (755)',
            hintOnFail:
              'Зараз у нього 644 — біт виконання не стоїть у жодній трійці.',
            check: (s) =>
              (getNode(s.fs, '/srv/app/deploy.sh')?.mode ?? 0) === 0o755,
          },
          {
            id: 'conf',
            label: 'Дати групі право читати app.conf (644)',
            hintOnFail: 'Зараз 600 — читає лише власник. Потрібно 644.',
            check: (s) =>
              (getNode(s.fs, '/srv/app/app.conf')?.mode ?? 0) === 0o644,
          },
          {
            id: 'verified',
            label: 'Перевірити результат через ls -l',
            check: (s) =>
              s.history.some(
                (line) => /^ls\b/.test(line.trim()) && /-\w*l/.test(line),
              ),
          },
        ],
      },
      hints: [
        'Два файли, два різних числа. Порахуй суму r=4, w=2, x=1 для кожної з трьох трійок.',
        'Виконуваний скрипт — це 755 (rwx для власника, r-x решті). Конфіг, який читає група, — 644.',
        'chmod 755 deploy.sh\nchmod 644 app.conf\nls -l',
      ],
      solution: 'chmod 755 deploy.sh\nchmod 644 app.conf\nls -l',
    },

    {
      id: 'l02-m03',
      title: 'Секрет, який побачили всі',
      goal: 'Файл із секретами більше не читається нікому, крім власника.',
      xp: 160,
      theory: [
        {
          kind: 'text',
          text:
            'Це найчастіший реальний баг безпеки на серверах: `.env` із паролем від бази лежить ' +
            'з правами `644`. Тобто **будь-який** користувач на машині може його прочитати — ' +
            'включно з процесом, який зламали.',
        },
        {
          kind: 'code',
          caption: 'Як це виглядає в ls -l',
          lines: [
            '-rw-r--r-- 1 deploy deploy  128 Mar 14 09:20 .env   # погано: читають усі',
            '-rw------- 1 deploy deploy  128 Mar 14 09:20 .env   # добре: тільки власник',
          ],
        },
        {
          kind: 'text',
          text:
            'Лікується тим самим `chmod`, що й у попередній місії, — просто інше число. ' +
            'Для секрету потрібне `600`: читати й писати може лише власник, ' +
            'групі й іншим не лишається нічого.',
        },
        {
          kind: 'code',
          caption: 'Закриваємо секрет',
          lines: [
            'chmod 600 .env                 # тепер його не прочитає ніхто інший',
            'chmod 600 secrets/api.key',
            'ls -l .env                     # переконатись: -rw-------',
          ],
        },
        {
          kind: 'text',
          text:
            'Із **каталогом** хитріше. Права `600` для теки не працюють: щоб у неї зайти, ' +
            'власнику потрібен ще й біт `x`. Тому приватний каталог закривають на `700` — ' +
            '`rwx` власнику й нічого решті.',
        },
        {
          kind: 'code',
          caption: 'Закриваємо каталог',
          lines: [
            'chmod 700 secrets              # зайти може лише власник',
            'ls -l                          # у теки перший символ «d»: drwx------',
          ],
        },
        {
          kind: 'note',
          text:
            'Файл `600`, каталог `700` — цю пару варто запамʼятати: саме так мають лежати ' +
            '`.env`, ключі та все, що не можна показувати. Ті самі числа знадобляться ' +
            'у рівні про SSH.',
        },
      ],
      task: {
        kind: 'terminal',
        boot: () =>
          makeMachine({
            user: 'deploy',
            cwd: '/srv/app',
            users: [{ name: 'intern', groups: [] }],
            dirs: [
              { path: '/srv/app', owner: 'deploy', group: 'deploy' },
              {
                path: '/srv/app/secrets',
                owner: 'deploy',
                group: 'deploy',
                mode: 0o755,
              },
            ],
            files: {
              '/srv/app/.env': {
                content:
                  'DATABASE_URL=postgres://app:hunter2@db-01:5432/shop\nSTRIPE_KEY=sk_live_51H\n',
                mode: 0o644,
                owner: 'deploy',
                group: 'deploy',
              },
              '/srv/app/secrets/api.key': {
                content: 'sk_live_51HxxYYzz\n',
                mode: 0o664,
                owner: 'deploy',
                group: 'deploy',
              },
            },
          }),
        goals: [
          {
            id: 'env',
            label: 'Закрити /srv/app/.env усім, крім власника (600)',
            check: (s) => (getNode(s.fs, '/srv/app/.env')?.mode ?? 0) === 0o600,
          },
          {
            id: 'key',
            label: 'Те саме для /srv/app/secrets/api.key',
            check: (s) =>
              (getNode(s.fs, '/srv/app/secrets/api.key')?.mode ?? 0) === 0o600,
          },
          {
            id: 'dir',
            label:
              'Закрити сам каталог secrets (700) — інакше в нього можна зайти',
            hintOnFail: 'Для каталогу потрібні rwx власнику й нічого решті.',
            check: (s) =>
              (getNode(s.fs, '/srv/app/secrets')?.mode ?? 0) === 0o700,
          },
        ],
      },
      hints: [
        'Три об’єкти: два файли з секретами і каталог навколо них. Файли й каталоги закриваються різними числами.',
        'Для файлів із секретами — 600. Для приватного каталогу потрібен ще біт x, щоб власник міг у нього зайти: 700.',
        'chmod 600 /srv/app/.env\nchmod 600 /srv/app/secrets/api.key\nchmod 700 /srv/app/secrets',
      ],
      solution:
        'chmod 600 /srv/app/.env\nchmod 600 /srv/app/secrets/api.key\nchmod 700 /srv/app/secrets',
    },

    {
      id: 'l02-m04',
      title: 'Новий інженер у команді',
      goal: 'У системі зʼявився сервісний користувач у потрібних групах.',
      xp: 180,
      theory: [
        {
          kind: 'text',
          text:
            'Сервіси не повинні працювати під root і не повинні ділити акаунт із людьми. ' +
            'Типовий крок при налаштуванні сервера — створити окремого користувача для деплою.',
        },
        {
          kind: 'table',
          rows: [
            [
              'useradd -m ci',
              'створити користувача разом із домашнім каталогом',
            ],
            [
              'useradd -m -s /bin/bash ci',
              'ще й задати оболонку — програму, що зустрічає користувача при вході',
            ],
            ['groupadd deployers', 'створити групу'],
            ['usermod -aG deployers ci', 'ДОДАТИ користувача в групу'],
          ],
        },
        {
          kind: 'text',
          text:
            'Групу можна вказати не одну. Кілька перелічують **через кому і без пробілів** — ' +
            'пробіл shell сприйме як початок наступного аргументу, і команда зрозуміє тебе неправильно.',
        },
        {
          kind: 'code',
          caption: 'Заводимо сервісного користувача',
          lines: [
            'sudo groupadd deployers              # спершу група, інакше нікуди додавати',
            'sudo useradd -m -s /bin/bash ci      # користувач із домашнім каталогом',
            'sudo usermod -aG deployers ci        # одна група',
            'sudo usermod -aG deployers,docker ci # кілька — через кому, без пробілу',
            'id ci                                # перевірити, що вийшло',
          ],
        },
        {
          kind: 'note',
          text:
            'Пастка на все життя: `usermod -G docker ci` **замінює** всі додаткові групи ' +
            'користувача на одну. Так люди випадково викидають себе з групи `sudo` і втрачають ' +
            'доступ. Завжди `-aG` — `a` означає append.',
        },
      ],
      task: {
        kind: 'terminal',
        boot: () =>
          makeMachine({
            user: 'deploy',
            groups: ['docker'],
          }),
        goals: [
          {
            id: 'group',
            label: 'Створити групу deployers',
            check: (s) => s.groups.deployers !== undefined,
          },
          {
            id: 'user',
            label: 'Створити користувача ci з домашнім каталогом /home/ci',
            hintOnFail:
              'Без потрібного прапорця домашній каталог не створиться.',
            check: (s) =>
              s.users.ci !== undefined && getNode(s.fs, '/home/ci') !== null,
          },
          {
            id: 'groups',
            label:
              'Додати ci у групи deployers і docker, не втративши власну групу ci',
            hintOnFail:
              'Якщо після твоєї команди в списку груп ci залишилась лише одна — ти замінив список замість того, щоб додати.',
            check: (s) =>
              (s.users.ci?.groups ?? []).includes('deployers') &&
              (s.users.ci?.groups ?? []).includes('docker') &&
              (s.users.ci?.groups ?? []).includes('ci'),
          },
        ],
      },
      hints: [
        'Спочатку має існувати група — інакше додати в неї когось не вийде. Усе це вимагає root.',
        'Порядок: groupadd, потім useradd з прапорцем для домашнього каталогу, потім usermod. Не забудь про append-прапорець.',
        'sudo groupadd deployers\nsudo useradd -m -s /bin/bash ci\nsudo usermod -aG deployers,docker ci',
      ],
      solution:
        'sudo groupadd deployers\nsudo useradd -m -s /bin/bash ci\nsudo usermod -aG deployers,docker ci',
    },

    {
      id: 'l02-m05',
      title: 'Чужий каталог',
      goal: 'Каталог застосунку належить сервісному користувачеві, і той нарешті може в нього писати.',
      xp: 170,
      theory: [
        {
          kind: 'text',
          text:
            'Права кажуть **що** можна робити. Але «власник rwx» саме по собі нічого не варте, ' +
            'поки не сказано, **хто** цей власник. Тому кожен файл і кожен каталог носить із собою ' +
            'ще дві позначки: імʼя користувача-власника й імʼя групи.',
        },
        {
          kind: 'code',
          caption: 'Ці дві позначки видно в ls -l — третя й четверта колонки',
          lines: [
            'drwxr-xr-x 2 root root 4096 Mar 14 09:20 logs',
            '           │ │    └──── група:   root',
            '           │ └───────── власник: root',
            '           └─────────── скільки посилань (нам не важливо)',
          ],
        },
        {
          kind: 'text',
          text:
            'Звідси й береться найчастіша поломка деплою. Архів розпакували під `root` — ' +
            'отже, власник усього дерева `root`. А сервіс працює під користувачем `app`. ' +
            'Для нього це «чужі файли»: діють права **інших**, а вони зазвичай `r-x`. ' +
            'Записати лог або оновити реліз він не може, і падає з `Permission denied`.',
        },
        {
          kind: 'text',
          text:
            'Лікує це `chown` (change owner). Через двокрапку можна одразу задати й групу, ' +
            'а прапорець `-R` (recursive) проходить по всьому дереву — сам каталог, ' +
            'усе, що всередині, і все, що всередині того.',
        },
        {
          kind: 'code',
          lines: [
            'sudo chown app /srv/shop            # лише власник',
            'sudo chown app:app /srv/shop        # власник і група, через двокрапку',
            'sudo chown -R app:app /srv/shop     # те саме, але й для всього вмісту',
            'ls -l /srv/shop                     # перевірити, що колонки змінились',
          ],
        },
        {
          kind: 'note',
          text:
            '`chown` завжди потребує root: віддати свій файл комусь іншому звичайний ' +
            'користувач не може — інакше можна було б підкидати файли чужим акаунтам.',
        },
        {
          kind: 'note',
          text:
            '`chown` і `chmod` — різні інструменти, і часто потрібні обидва. ' +
            'Спершу `chown` віддає каталог правильному користувачеві, потім `chmod` ' +
            'ставить йому потрібні цифри. Змінити власника й забути про права — ' +
            'значить отримати той самий `Permission denied`, тільки під іншим імʼям.',
        },
      ],
      task: {
        kind: 'terminal',
        intro: [
          'Сервіс shop не стартує: у логах Permission denied.',
          'Реліз розпакували під root, а працює сервіс під користувачем app.',
          'Почни з `ls -l /srv/shop` — подивись на колонки власника й на права logs.',
          '',
        ],
        boot: () =>
          makeMachine({
            user: 'deploy',
            users: [{ name: 'app', groups: [] }],
            dirs: [
              { path: '/srv/shop', owner: 'root', group: 'root', mode: 0o755 },
              // Someone «fixed» a leak with chmod -R 555: nothing here is
              // writable any more, not even for whoever ends up owning it.
              {
                path: '/srv/shop/logs',
                owner: 'root',
                group: 'root',
                mode: 0o555,
              },
            ],
            files: {
              '/srv/shop/server.js': {
                content: 'console.log("shop")\n',
                owner: 'root',
                group: 'root',
              },
              '/srv/shop/logs/app.log': {
                content: '',
                owner: 'root',
                group: 'root',
              },
            },
          }),
        goals: [
          {
            id: 'looked',
            label: 'Подивитися, кому зараз належить /srv/shop',
            hintOnFail:
              'Довгий формат списку показує власника й групу: ls -l /srv/shop',
            check: (s) =>
              s.history.some((line) => /^ls\b.*-.*l/.test(line.trim())),
          },
          {
            id: 'owner',
            label:
              'Передати весь каталог /srv/shop користувачу app і групі app',
            hintOnFail:
              'Перевір, чи ти застосував зміну рекурсивно — вкладені файли теж мають змінити власника.',
            feedback: (s) => {
              const root = getNode(s.fs, '/srv/shop');
              const inner = getNode(s.fs, '/srv/shop/logs/app.log');
              if (root?.owner !== 'app') return null;
              if (inner?.owner === 'app' && inner?.group === 'app') return null;
              return 'Сам каталог уже належить app, а от файли всередині — ще ні. Потрібен прапорець -R.';
            },
            check: (s) => {
              const paths = [
                '/srv/shop',
                '/srv/shop/server.js',
                '/srv/shop/logs',
                '/srv/shop/logs/app.log',
              ];
              return paths.every((path) => {
                const node = getNode(s.fs, path);
                return node?.owner === 'app' && node?.group === 'app';
              });
            },
          },
          {
            id: 'writable',
            label:
              'Повернути каталогу logs права 755 — зараз у власника немає навіть w',
            hintOnFail:
              'Зараз у logs права 555 (r-xr-xr-x): писати не може ніхто. Власнику потрібне rwx — це 7.',
            feedback: (s) => {
              const mode = getNode(s.fs, '/srv/shop/logs')?.mode ?? 0;
              if (mode === 0o755 || mode === 0o555) return null;
              return `Зараз у logs права ${mode.toString(8).padStart(3, '0')}. Потрібно рівно 755.`;
            },
            check: (s) =>
              (getNode(s.fs, '/srv/shop/logs')?.mode ?? 0) === 0o755,
          },
        ],
      },
      hints: [
        'Спершу подивись `ls -l /srv/shop`: там дві проблеми одразу — не той власник і у logs немає біта w.',
        'Власник міняється через chown, і за замовчуванням команда зачіпає лише сам каталог, не вміст — потрібен -R та запис `користувач:група`. Права окремо, через chmod. Обидві операції від root.',
        'ls -l /srv/shop\nsudo chown -R app:app /srv/shop\nsudo chmod 755 /srv/shop/logs\nls -l /srv/shop',
      ],
      solution:
        'ls -l /srv/shop\nsudo chown -R app:app /srv/shop\nsudo chmod 755 /srv/shop/logs\nls -l /srv/shop',
    },
  ],
};
