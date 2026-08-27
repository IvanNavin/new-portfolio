import { makeMachine } from '../../shell/machines';
import { answerFile } from '../goals';
import type { Level } from '../types';

const ok200 = (body: string) => ({
  status: 200,
  statusText: 'OK',
  headers: {
    Server: 'nginx/1.24.0',
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Length': String(body.length),
  },
  body,
});

export const level04: Level = {
  id: 'l04',
  act: 2,
  title: 'Мережа, DNS і HTTP',
  subtitle: '«У мене не відкривається» — це може бути п’ять різних поломок.',
  brief:
    'Запит проходить довгий шлях: імʼя → IP (DNS) → порт → TCP → TLS → HTTP-відповідь. ' +
    'Зламатись може будь-яка ланка, і кожна дає свою помилку. Цей рівень вчить читати ці ' +
    'помилки і звужувати пошук замість «спробуй перезавантажити».',
  missions: [
    {
      id: 'l04-m01',
      title: 'Що взагалі слухає цей сервер',
      goal: 'Ти знаєш IP сервера і повний список відкритих портів із процесами.',
      xp: 150,
      theory: [
        {
          kind: 'text',
          text:
            'Перше, що роблять на незнайомому сервері, — дивляться його адресу й те, які ' +
            'порти він слухає. Часто на цьому кроці й знаходиться проблема: сервіс не піднявся ' +
            'або слухає тільки `127.0.0.1` замість `0.0.0.0`.',
        },
        {
          kind: 'text',
          text:
            '**Інтерфейс** — це мережева картка сервера, справжня або віртуальна; ' +
            'у кожної своя IP-адреса. Майже завжди їх дві: `lo` — внутрішня, ' +
            'через яку машина говорить сама з собою (`127.0.0.1`), і `eth0` — та, ' +
            'якою вона під’єднана до мережі.',
        },
        {
          kind: 'table',
          rows: [
            ['ip a', 'мережеві інтерфейси та їхні IP-адреси'],
            ['ss -tulpn', 'які порти слухаються і яким процесом'],
            ['ping host', 'чи взагалі доходять пакети'],
          ],
        },
        {
          kind: 'note',
          text:
            '`0.0.0.0:80` означає «слухаю на всіх інтерфейсах» — доступно ззовні. ' +
            '`127.0.0.1:80` — «тільки локально»; ззовні буде Connection refused, ' +
            'хоча `systemctl status` покаже гордо active.',
        },
      ],
      task: {
        kind: 'terminal',
        boot: () =>
          makeMachine({
            user: 'deploy',
            net: {
              listening: [
                { port: 22, proto: 'tcp', process: 'sshd', address: '0.0.0.0' },
                {
                  port: 80,
                  proto: 'tcp',
                  process: 'nginx',
                  address: '0.0.0.0',
                },
                {
                  port: 5432,
                  proto: 'tcp',
                  process: 'postgres',
                  address: '127.0.0.1',
                },
                {
                  port: 6379,
                  proto: 'tcp',
                  process: 'redis-server',
                  address: '127.0.0.1',
                },
                {
                  port: 9100,
                  proto: 'tcp',
                  process: 'node_exporter',
                  address: '0.0.0.0',
                },
              ],
            },
          }),
        goals: [
          {
            id: 'ip',
            label: 'Подивитися мережеві інтерфейси й адресу сервера',
            check: (s) => s.history.some((line) => /^ip\b/.test(line.trim())),
          },
          {
            id: 'ss',
            label: 'Вивести список портів, що слухаються',
            hintOnFail: 'Комбінація прапорців, яку варто запамʼятати: -tulpn.',
            check: (s) =>
              s.history.some((line) => /^(ss|netstat)\b/.test(line.trim())),
          },
          answerFile({
            id: 'answer',
            path: '/home/deploy/exposed.txt',
            label:
              'Записати у ~/exposed.txt порт бази даних, який (на щастя) закритий ззовні',
            expected: '5432',
            hintOnFail:
              'Шукай рядок, де адреса 127.0.0.1, а процес — postgres. Потрібне лише число порту.',
            diagnose: (value) =>
              value === '6379'
                ? 'Це порт redis. Потрібен саме порт бази даних — процес postgres.'
                : value.includes(':')
                  ? `«${value}» — це адреса з портом. Залиш тільки число після двокрапки.`
                  : null,
          }),
        ],
      },
      hints: [
        'Дві оглядові команди — про адреси і про порти. Потім уважно подивись на колонку Local Address.',
        '`ss -tulpn` покаже, що postgres слухає лише на 127.0.0.1. Запиши номер цього порту у файл.',
        'ip a\nss -tulpn\necho 5432 > ~/exposed.txt',
      ],
      solution: 'ip a\nss -tulpn\necho 5432 > ~/exposed.txt',
    },

    {
      id: 'l04-m02',
      title: 'Куди насправді вказує домен',
      goal: 'Ти прочитав DNS-записи і зрозумів, чому домен веде не туди.',
      xp: 170,
      theory: [
        {
          kind: 'text',
          text:
            'DNS перетворює імʼя на адресу. Коли «сайт відкривається у мене, але не в колеги», ' +
            'у 8 випадках з 10 винен DNS — старий запис, забутий CNAME або кеш.',
        },
        {
          kind: 'table',
          caption: 'Типи записів, які треба знати',
          rows: [
            ['A', 'імʼя → IPv4-адреса'],
            ['AAAA', 'імʼя → IPv6-адреса'],
            [
              'CNAME',
              'імʼя → ІНШЕ ІМʼЯ (псевдонім). Далі треба питати вже про нього',
            ],
            ['MX', 'куди слати пошту для цього домену'],
            ['TXT', 'довільний текст: SPF, верифікації, DKIM'],
          ],
        },
        {
          kind: 'code',
          lines: [
            'dig shop.internal A',
            'dig +short api.internal CNAME    # тільки значення, без «шапки»',
            'dig shop.internal TXT',
          ],
        },
        {
          kind: 'note',
          text:
            'Файл `/etc/hosts` має пріоритет над DNS. Якщо в тебе працює, а в проді ні — ' +
            'перевір, чи не лишився там локальний «милиця-запис».',
        },
      ],
      task: {
        kind: 'terminal',
        boot: () =>
          makeMachine({
            user: 'deploy',
            net: {
              dns: {
                'shop.internal': [{ type: 'A', value: '10.0.0.5', ttl: 300 }],
                'api.internal': [
                  { type: 'CNAME', value: 'shop-old.internal', ttl: 300 },
                ],
                'shop-old.internal': [
                  { type: 'A', value: '10.0.0.99', ttl: 300 },
                ],
                'mail.internal': [
                  { type: 'MX', value: '10 mx1.internal', ttl: 3600 },
                ],
                internal: [
                  {
                    type: 'TXT',
                    value: '"v=spf1 include:_spf.internal ~all"',
                    ttl: 3600,
                  },
                ],
              },
              reachable: ['127.0.0.1', 'localhost', '10.0.0.5'],
            },
          }),
        goals: [
          {
            id: 'dig',
            label: 'Дізнатися, на що вказує api.internal',
            hintOnFail: 'Це не A-запис. Спробуй запитати тип CNAME.',
            check: (s) =>
              s.history.some((line) =>
                /^dig\b.*api\.internal/.test(line.trim()),
              ),
          },
          {
            id: 'chain',
            label: 'Пройти ланцюжок далі й дізнатися кінцевий IP',
            hintOnFail:
              'CNAME веде на інше імʼя — запитай A-запис уже для нього.',
            check: (s) =>
              s.history.some((line) =>
                /^dig\b.*shop-old\.internal/.test(line.trim()),
              ),
          },
          answerFile({
            id: 'answer',
            path: '/home/deploy/dns.txt',
            label: 'Записати кінцеву IP-адресу api.internal у ~/dns.txt',
            expected: '10.0.0.99',
            hintOnFail:
              'Це адреса, у яку зрештою розгортається ланцюжок CNAME.',
            diagnose: (value) =>
              value === '10.0.0.5'
                ? 'Це адреса shop.internal. api.internal веде через CNAME на інше імʼя — запитай A-запис уже для нього.'
                : /internal/.test(value)
                  ? `«${value}» — це імʼя, а не адреса. Пройди ланцюжок до кінця, поки не отримаєш IP.`
                  : null,
          }),
        ],
      },
      hints: [
        'api.internal не має A-запису напряму. Спитай у DNS інший тип запису.',
        '`dig api.internal CNAME` покаже аліас на shop-old.internal. Тепер запитай A-запис уже для нього — це і буде справжня адреса.',
        'dig api.internal CNAME\ndig shop-old.internal A\necho 10.0.0.99 > ~/dns.txt',
      ],
      solution:
        'dig api.internal CNAME\ndig shop-old.internal A\necho 10.0.0.99 > ~/dns.txt',
    },

    {
      id: 'l04-m03',
      title: 'Що відповідає сервер',
      goal: 'Ти вмієш читати HTTP-відповідь і відрізняти «не відповідає» від «відповідає помилкою».',
      xp: 170,
      theory: [
        {
          kind: 'text',
          text:
            'Спершу два слова, без яких далі не розібратись. **Бекенд** — це і є твій ' +
            'застосунок: програма, що рахує відповідь. **Проксі** (тут — nginx) стоїть ' +
            'перед ним і приймає запити ззовні, а сам лише передає їх бекенду й повертає ' +
            'відповідь назад. Тобто запит іде: браузер → проксі → бекенд.',
        },
        {
          kind: 'text',
          text:
            '`curl` — це браузер без картинок. Прапорець `-I` показує лише заголовки ' +
            'відповіді — це службові рядки перед самим вмістом сторінки: код статусу, ' +
            'який сервер відповів, куди він перенаправляє. ' +
            'Цього майже завжди достатньо для діагнозу.',
        },
        {
          kind: 'code',
          caption: 'Як спитати сервер',
          lines: [
            'curl -I http://shop.internal            # лише заголовки',
            'curl -I https://shop.internal/api/health',
            'curl https://shop.internal/api/health   # ще й тіло відповіді',
          ],
        },
        {
          kind: 'table',
          caption: 'Коди, які треба впізнавати миттєво',
          rows: [
            ['200', 'усе добре'],
            ['301 / 302', 'редирект — дивись заголовок Location'],
            [
              '401 / 403',
              '401 — сервер не знає, хто ти; 403 — знає, але тобі не можна',
            ],
            ['404', 'такого шляху немає — це проблема застосунку'],
            ['502 / 503', 'проксі не достукався до бекенда — бекенд лежить'],
            ['504', 'бекенд є, але не встиг відповісти — таймаут'],
          ],
        },
        {
          kind: 'note',
          text:
            'Ключова різниця: `Connection refused` — це помилка **curl**, тобто ніхто не слухає порт. ' +
            'А `502` — це вже **відповідь сервера**, тобто nginx працює, а от бекенд за ним — ні. ' +
            'Плутати їх означає лагодити не той компонент.',
        },
      ],
      task: {
        kind: 'terminal',
        boot: () =>
          makeMachine({
            user: 'deploy',
            net: {
              hosts: { localhost: '127.0.0.1', 'shop.internal': '10.0.0.5' },
              dns: {
                'shop.internal': [{ type: 'A', value: '10.0.0.5', ttl: 300 }],
              },
              reachable: [
                '127.0.0.1',
                'localhost',
                '10.0.0.5',
                'shop.internal',
              ],
              listening: [
                { port: 22, proto: 'tcp', process: 'sshd', address: '0.0.0.0' },
                {
                  port: 80,
                  proto: 'tcp',
                  process: 'nginx',
                  address: '0.0.0.0',
                },
              ],
              http: {
                'http://shop.internal/': {
                  status: 301,
                  statusText: 'Moved Permanently',
                  headers: {
                    Server: 'nginx/1.24.0',
                    Location: 'https://shop.internal/',
                  },
                  body: '',
                },
                'https://shop.internal/': ok200('<h1>shop</h1>'),
                'https://shop.internal/api/health': {
                  status: 502,
                  statusText: 'Bad Gateway',
                  headers: {
                    Server: 'nginx/1.24.0',
                    'Content-Type': 'text/html',
                  },
                  body: '<html><head><title>502 Bad Gateway</title></head></html>',
                },
                'http://localhost:3000/': {
                  status: 200,
                  statusText: 'OK',
                  headers: { 'Content-Type': 'application/json' },
                  body: '{"ok":true}',
                },
              },
            },
          }),
        goals: [
          {
            id: 'headers',
            label: 'Подивитися заголовки відповіді http://shop.internal',
            hintOnFail:
              'Прапорець, що показує лише заголовки, — велика латинська I.',
            check: (s) =>
              s.history.some(
                (line) =>
                  /curl\b.*-\w*I/.test(line) && line.includes('shop.internal'),
              ),
          },
          {
            id: 'api',
            label: 'Перевірити https://shop.internal/api/health',
            check: (s) =>
              s.history.some((line) => line.includes('/api/health')),
          },
          answerFile({
            id: 'answer',
            path: '/home/deploy/status.txt',
            label:
              'Записати код статусу, який повертає /api/health, у ~/status.txt',
            expected: '502',
            hintOnFail: 'Потрібні лише три цифри коду відповіді.',
            diagnose: (value) =>
              value === '301'
                ? 'Це код кореня сайту. Потрібен код саме для /api/health.'
                : value === '200'
                  ? 'Це код успіху. Подивись уважно, що відповів /api/health.'
                  : null,
          }),
          answerFile({
            id: 'diagnosis',
            path: '/home/deploy/diagnosis.txt',
            label:
              'Записати у ~/diagnosis.txt слово backend або nginx — хто саме зламаний',
            expected: 'backend',
            hintOnFail:
              'nginx відповів кодом, тобто сам він живий. Хто тоді не відповів ЙОМУ?',
            diagnose: (value) =>
              value.toLowerCase() === 'nginx'
                ? 'Якби зламався сам nginx, відповіді не було б узагалі — був би Connection refused. А він відповів кодом 502.'
                : null,
          }),
        ],
      },
      hints: [
        'Подивись заголовки кореня сайту, потім окремо ендпоінт /api/health. Коди будуть різні.',
        'Корінь віддає 301 (редирект на https), а /api/health — 502. 502 означає, що проксі отримав запит, але не зміг достукатись до застосунку за ним.',
        'curl -I http://shop.internal\ncurl -I https://shop.internal/api/health\necho 502 > ~/status.txt\necho backend > ~/diagnosis.txt',
      ],
      solution:
        'curl -I http://shop.internal\ncurl -I https://shop.internal/api/health\necho 502 > ~/status.txt\necho backend > ~/diagnosis.txt',
    },

    {
      id: 'l04-m04',
      title: 'Фаєрвол: відчинити рівно те, що треба',
      goal: 'Сервер приймає HTTPS і SSH, а службовий порт метрик закритий ззовні.',
      xp: 180,
      theory: [
        {
          kind: 'text',
          text:
            'Правило безпеки: за замовчуванням заборонено все, дозволено — лише те, що справді ' +
            'потрібне. В Ubuntu цим найпростіше керує `ufw`.',
        },
        {
          kind: 'code',
          lines: [
            'sudo ufw status            # що зараз',
            'sudo ufw allow 22/tcp      # SSH',
            'sudo ufw allow 443/tcp     # HTTPS',
            'sudo ufw deny 9100/tcp     # метрики — не для інтернету',
            'sudo ufw enable            # увімкнути',
          ],
        },
        {
          kind: 'note',
          text:
            'Класична катастрофа: увімкнути ufw, не дозволивши перед цим порт 22. ' +
            'Твоя ж SSH-сесія обривається, і зайти назад уже неможливо. ' +
            'Спочатку `allow 22`, і лише потім `enable`.',
        },
      ],
      task: {
        kind: 'terminal',
        boot: () =>
          makeMachine({
            user: 'deploy',
            net: {
              listening: [
                { port: 22, proto: 'tcp', process: 'sshd', address: '0.0.0.0' },
                {
                  port: 443,
                  proto: 'tcp',
                  process: 'nginx',
                  address: '0.0.0.0',
                },
                {
                  port: 9100,
                  proto: 'tcp',
                  process: 'node_exporter',
                  address: '0.0.0.0',
                },
              ],
            },
          }),
        goals: [
          {
            id: 'ssh',
            label: 'Дозволити SSH (22/tcp) — інакше ти сам себе замкнеш',
            check: (s) =>
              s.net.firewall.rules.some(
                (rule) => rule.port === 22 && rule.action === 'allow',
              ),
          },
          {
            id: 'https',
            label: 'Дозволити HTTPS (443/tcp)',
            check: (s) =>
              s.net.firewall.rules.some(
                (rule) => rule.port === 443 && rule.action === 'allow',
              ),
          },
          {
            id: 'metrics',
            label: 'Заборонити порт метрик 9100/tcp',
            check: (s) =>
              s.net.firewall.rules.some(
                (rule) => rule.port === 9100 && rule.action === 'deny',
              ),
          },
          {
            id: 'enabled',
            label:
              'Увімкнути фаєрвол — але тільки після того, як 22 вже дозволено',
            hintOnFail:
              'Перевір порядок: правило для SSH має зʼявитись раніше за enable.',
            check: (s) => {
              const enableAt = s.history.findIndex((line) =>
                /ufw\s+enable/.test(line),
              );
              const sshAt = s.history.findIndex((line) =>
                /ufw\s+allow\s+(22|ssh)/.test(line),
              );
              return s.net.firewall.enabled && sshAt !== -1 && sshAt < enableAt;
            },
          },
        ],
      },
      hints: [
        'Три правила і вмикання. Порядок має значення: одна з команд може відрізати тебе від сервера.',
        'Спершу дозволь 22/tcp, потім 443/tcp, потім заборони 9100/tcp — і лише наприкінці enable.',
        'sudo ufw allow 22/tcp\nsudo ufw allow 443/tcp\nsudo ufw deny 9100/tcp\nsudo ufw enable\nsudo ufw status',
      ],
      solution:
        'sudo ufw allow 22/tcp\nsudo ufw allow 443/tcp\nsudo ufw deny 9100/tcp\nsudo ufw enable\nsudo ufw status',
    },

    {
      id: 'l04-m05',
      title: 'Чий це код',
      goal: 'Ти безпомилково відрізняєш проблему клієнта від проблеми сервера.',
      xp: 110,
      theory: [
        {
          kind: 'table',
          caption: 'Класи кодів',
          rows: [
            ['2xx', 'успіх'],
            ['3xx', 'перенаправлення'],
            ['4xx', 'винен запит: неправильний шлях, немає прав, погані дані'],
            [
              '5xx',
              'винен сервер: впав, не встиг, не достукався до залежності',
            ],
          ],
        },
        {
          kind: 'text',
          text:
            'Практичний висновок: `4xx` — іди дивитись на клієнта й на роутинг застосунку, ' +
            '`5xx` — іди дивитись логи сервера й стан залежностей.',
        },
      ],
      task: {
        kind: 'quiz',
        multi: true,
        question:
          'Після релізу моніторинг показує сплеск помилок. Які з цих кодів вказують, що проблема на **боці сервера**, і треба будити чергового?',
        options: [
          { id: 'a', label: '`404 Not Found`' },
          { id: 'b', label: '`502 Bad Gateway`' },
          { id: 'c', label: '`403 Forbidden`' },
          { id: 'd', label: '`504 Gateway Timeout`' },
        ],
        correct: ['b', 'd'],
        explain:
          '`502` — проксі не зміг достукатись до бекенда; `504` — бекенд не встиг відповісти. ' +
          'Обидва з класу 5xx і означають зламаний сервер. `404` і `403` — це 4xx: ' +
          'сервер живий і свідомо відповів «немає такого» або «не можна».',
      },
      hints: [
        'Подивись на першу цифру кожного коду. Вона й відповідає на питання «хто винен».',
        'Коди, що починаються з 5, — це відповідальність сервера. З 4 — відповідальність запиту.',
        'Серверні тут — 502 і 504.',
      ],
      solution:
        '5xx (502, 504) — проблема сервера; 4xx (403, 404) — проблема запиту.',
    },
  ],
};
