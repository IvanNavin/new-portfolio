import { getNode, readFile } from '../../shell/fs';
import { makeMachine } from '../../shell/machines';
import type { Level } from '../types';

const NGINX_SOLUTION = [
  'upstream shop_api {',
  '    server 127.0.0.1:3000;',
  '}',
  '',
  'server {',
  '    listen 443 ssl;',
  '    server_name shop.internal;',
  '',
  '    ssl_certificate /etc/letsencrypt/live/shop.internal/fullchain.pem;',
  '    ssl_certificate_key /etc/letsencrypt/live/shop.internal/privkey.pem;',
  '',
  '    location / {',
  '        proxy_pass http://shop_api;',
  '        proxy_set_header Host $host;',
  '        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;',
  '        proxy_set_header X-Forwarded-Proto $scheme;',
  '    }',
  '}',
  '',
].join('\n');

const BROKEN_NGINX = [
  'server {',
  '    listen 80;',
  '    server_name shop.internal;',
  '',
  '    location / {',
  '        proxy_pass http://127.0.0.1:3000',
  '        proxy_set_header Host $host;',
  '    }',
  '}',
  '',
].join('\n');

export const level09: Level = {
  id: 'l09',
  act: 3,
  title: 'Reverse proxy, env і секрети',
  subtitle: 'Один вхід у систему, нуль паролів у коді.',
  brief:
    'Перед застосунком майже завжди стоїть reverse proxy: він тримає TLS, роздає статику, ' +
    'балансує навантаження і ховає за собою кілька бекендів. А конфігурація застосунку — ' +
    'зокрема секрети — приходить із оточення, а не з репозиторію.',
  missions: [
    {
      id: 'l09-m01',
      title: 'Конфіг, який не проходить перевірку',
      goal: 'Ти знайшов синтаксичну помилку в nginx.conf, виправив її та перезавантажив конфіг.',
      xp: 190,
      theory: [
        {
          kind: 'text',
          text:
            'Конфіг nginx складається з **директив** — рядків виду «назва значення», ' +
            'кожен з яких щось налаштовує. Кожна директива закінчується крапкою з комою, ' +
            'а групи директив беруться у фігурні дужки — це **блок**. ' +
            'Забута `;` — найчастіша поломка, і вона валить увесь сервер, а не один сайт.',
        },
        {
          kind: 'table',
          rows: [
            ['nginx -t', 'перевірити конфіг, нічого не застосовуючи'],
            ['nginx -s reload', 'перечитати конфіг без розриву зʼєднань'],
            [
              'systemctl restart nginx',
              'повний перезапуск — розриває зʼєднання',
            ],
          ],
        },
        {
          kind: 'note',
          text:
            'Золоте правило: **ніколи** не робити reload без `nginx -t`. Перевірка займає ' +
            'мілісекунду, а reload зі зламаним конфігом залишає сайт лежати. ' +
            'І reload завжди краще за restart — він не рве живі зʼєднання.',
        },
      ],
      task: {
        kind: 'terminal',
        intro: ['Хтось правив конфіг і nginx більше не піднімається.', ''],
        boot: () =>
          makeMachine({
            user: 'deploy',
            files: {
              '/etc/nginx/nginx.conf': {
                content: BROKEN_NGINX,
                owner: 'root',
                group: 'root',
              },
            },
            services: [
              {
                name: 'nginx',
                description: 'A high performance web server',
                active: false,
                enabled: true,
                port: 80,
                log: ['nginx.service: Failed with result "exit-code".'],
              },
            ],
          }),
        goals: [
          {
            id: 'tested',
            label: 'Перевірити конфіг і побачити, на якому рядку помилка',
            hintOnFail:
              'Є прапорець, що робить саме перевірку без застосування.',
            check: (s) => s.history.some((line) => /nginx\s+-t/.test(line)),
          },
          {
            id: 'fixed',
            label: 'Виправити рядок proxy_pass — йому бракує крапки з комою',
            check: (s) => {
              const config = readFile(s.fs, '/etc/nginx/nginx.conf') ?? '';
              return /proxy_pass\s+http:\/\/127\.0\.0\.1:3000;/.test(config);
            },
          },
          {
            id: 'verified',
            label: 'Перевірити конфіг ЩЕ РАЗ після виправлення',
            hintOnFail:
              'Перевірка має бути після правки, інакше ти застосовуєш неперевірений конфіг.',
            check: (s) => {
              const fixAt = s.history.findIndex(
                (line) => /proxy_pass/.test(line) && />/.test(line),
              );
              const tests = s.history
                .map((line, index) => ({ line, index }))
                .filter(({ line }) => /nginx\s+-t/.test(line));
              return fixAt !== -1 && tests.some(({ index }) => index > fixAt);
            },
          },
          {
            id: 'started',
            label: 'Підняти nginx',
            check: (s) => s.services.nginx?.active === true,
          },
        ],
      },
      hints: [
        'Спершу спитай у самого nginx, що йому не подобається — він назве файл і рядок.',
        'Помилка на рядку з proxy_pass: немає `;`. Перепиши весь блок у файл (через sudo tee або перезапис файлу), знову зроби nginx -t і лише тоді стартуй сервіс.',
        'Перепиши конфіг у /tmp через echo із `>` і `>>`, скопіюй його на місце через ' +
          '`sudo cp /tmp/nginx.conf /etc/nginx/nginx.conf`, знову `sudo nginx -t`, потім ' +
          '`sudo systemctl start nginx`.',
      ],
      solution: [
        'sudo nginx -t',
        '# переписати конфіг із крапкою з комою:',
        'echo "server {" > /tmp/nginx.conf',
        'echo "    listen 80;" >> /tmp/nginx.conf',
        'echo "    server_name shop.internal;" >> /tmp/nginx.conf',
        'echo "    location / {" >> /tmp/nginx.conf',
        'echo "        proxy_pass http://127.0.0.1:3000;" >> /tmp/nginx.conf',
        'echo "    }" >> /tmp/nginx.conf',
        'echo "}" >> /tmp/nginx.conf',
        'sudo cp /tmp/nginx.conf /etc/nginx/nginx.conf',
        'sudo nginx -t',
        'sudo systemctl start nginx',
      ].join('\n'),
    },

    {
      id: 'l09-m02',
      title: 'Проксі перед застосунком',
      goal: 'Ти написав конфіг nginx, який термінує TLS і проксіює запити на застосунок.',
      xp: 240,
      theory: [
        {
          kind: 'text',
          text:
            'Типова схема: застосунок слухає `127.0.0.1:3000` і ззовні недоступний. ' +
            'Назовні дивиться лише nginx на 443: він тримає сертифікат, а всередину ' +
            'ходить звичайним HTTP.',
        },
        {
          kind: 'table',
          rows: [
            [
              'upstream ім’я { server ... }',
              'група бекендів; сюди легко додати другий сервер',
            ],
            ['listen 443 ssl;', 'слухати HTTPS'],
            ['ssl_certificate', 'ланцюжок сертифіката — файл `fullchain.pem`'],
            [
              'ssl_certificate_key',
              'приватний ключ до нього — файл `privkey.pem`',
            ],
            ['proxy_pass http://ім’я;', 'куди пересилати запит'],
            ['proxy_set_header Host $host', 'передати бекенду справжній домен'],
          ],
        },
        {
          kind: 'note',
          text:
            'Без `X-Forwarded-For` застосунок бачитиме IP проксі замість IP клієнта — ' +
            'зламаються логи, геолокація й rate limiting. Без `X-Forwarded-Proto` він ' +
            'думатиме, що працює по HTTP, і генеруватиме неправильні редиректи.',
        },
      ],
      task: {
        kind: 'editor',
        filename: '/etc/nginx/sites-available/shop.conf',
        language: 'nginx',
        starter: [
          '# Застосунок слухає 127.0.0.1:3000.',
          '# Опиши upstream і server-блок на 443 з TLS та проксуванням.',
          '#',
          '# Сертифікати вже випущені й лежать тут:',
          '#   /etc/letsencrypt/live/shop.internal/fullchain.pem   — сам сертифікат',
          '#   /etc/letsencrypt/live/shop.internal/privkey.pem     — приватний ключ',
          '',
        ].join('\n'),
        goals: [
          {
            id: 'upstream',
            label: 'Описати upstream, що вказує на 127.0.0.1:3000',
            check: (text) =>
              /upstream\s+\w+\s*\{[\s\S]*?server\s+127\.0\.0\.1:3000;[\s\S]*?\}/m.test(
                text,
              ),
          },
          {
            id: 'ssl',
            label: 'Слухати 443 з увімкненим ssl',
            check: (text) => /listen\s+443\s+ssl;/m.test(text),
          },
          {
            id: 'certs',
            label: 'Вказати сертифікат і приватний ключ',
            check: (text) =>
              /ssl_certificate\s+\S*fullchain\.pem;/m.test(text) &&
              /ssl_certificate_key\s+\S*privkey\.pem;/m.test(text),
          },
          {
            id: 'proxy',
            label: 'Проксіювати запити на upstream',
            hintOnFail:
              'proxy_pass має вказувати на імʼя upstream, а не знову на 127.0.0.1.',
            check: (text) => /proxy_pass\s+http:\/\/\w+;/m.test(text),
          },
          {
            id: 'headers',
            label: 'Передати бекенду Host, X-Forwarded-For і X-Forwarded-Proto',
            check: (text) =>
              /proxy_set_header\s+Host\s+\$host;/m.test(text) &&
              /proxy_set_header\s+X-Forwarded-For\s+\$proxy_add_x_forwarded_for;/m.test(
                text,
              ) &&
              /proxy_set_header\s+X-Forwarded-Proto\s+\$scheme;/m.test(text),
          },
        ],
      },
      hints: [
        'Дві частини: блок upstream із адресою застосунку і блок server на 443, що в нього проксіює.',
        'upstream shop_api { server 127.0.0.1:3000; } — а далі server { listen 443 ssl; ssl_certificate ...; location / { proxy_pass http://shop_api; + три proxy_set_header } }.',
        NGINX_SOLUTION,
      ],
      solution: NGINX_SOLUTION,
    },

    {
      id: 'l09-m03',
      title: 'Конфігурація з оточення',
      goal: 'Застосунок отримує налаштування зі змінних оточення, а файл із секретами закритий.',
      xp: 190,
      theory: [
        {
          kind: 'text',
          text:
            '**Змінні оточення** — це набір пар `НАЗВА=значення`, які система віддає ' +
            'програмі в момент запуску. Програма їх читає й налаштовується: ' +
            'куди ходити за базою, у якому вона режимі, який у неї ключ. ' +
            'Ніде на диску вони при цьому лежати не зобовʼязані.',
        },
        {
          kind: 'text',
          text:
            'Звідси правило (його називають 12-factor): **конфіг живе в оточенні**, не в коді. ' +
            'Один і той самий образ їде і на staging, і в прод — відрізняються лише змінні. ' +
            'Це те, що робить реліз повторюваним.',
        },
        {
          kind: 'code',
          lines: [
            'export DATABASE_URL="postgres://..."   # у поточній сесії',
            'printenv DATABASE_URL                  # прочитати',
            'env | grep -i database                 # знайти серед усіх',
          ],
        },
        {
          kind: 'note',
          text:
            'Файл `.env` на сервері обовʼязково має права `600` і власника того користувача, ' +
            'під яким працює сервіс. І він ніколи не потрапляє в git — у репозиторії лежить ' +
            'лише `.env.example` з порожніми значеннями.',
        },
      ],
      task: {
        kind: 'terminal',
        boot: () =>
          makeMachine({
            user: 'deploy',
            cwd: '/srv/shop',
            dirs: [{ path: '/srv/shop', owner: 'deploy', group: 'deploy' }],
            files: {
              '/srv/shop/.env.example': {
                content: 'DATABASE_URL=\nREDIS_URL=\nAPP_ENV=\n',
                mode: 0o644,
                owner: 'deploy',
                group: 'deploy',
              },
              '/srv/shop/.env': {
                content:
                  'DATABASE_URL=postgres://app:hunter2@db-01:5432/shop\nREDIS_URL=redis://cache-01:6379\nAPP_ENV=production\n',
                mode: 0o644,
                owner: 'deploy',
                group: 'deploy',
              },
            },
          }),
        goals: [
          {
            id: 'perms',
            label: 'Закрити .env від усіх, крім власника (600)',
            check: (s) =>
              (getNode(s.fs, '/srv/shop/.env')?.mode ?? 0) === 0o600,
          },
          {
            id: 'example-open',
            label:
              '.env.example навпаки має лишитись читабельним (644) — у ньому немає секретів',
            hintOnFail: 'Не закривай його — це шаблон для колег.',
            check: (s) =>
              (getNode(s.fs, '/srv/shop/.env.example')?.mode ?? 0) === 0o644,
          },
          {
            id: 'exported',
            label: 'Виставити змінну APP_ENV=production у поточній сесії',
            hintOnFail: 'export ІМʼЯ=значення',
            check: (s) => s.env.APP_ENV === 'production',
          },
          {
            id: 'checked',
            label: 'Переконатися, що змінна справді видима застосунку',
            check: (s) =>
              s.history.some((line) => /^(printenv|env)\b/.test(line.trim())) ||
              s.history.some((line) => /echo\s+\$APP_ENV/.test(line)),
          },
        ],
      },
      hints: [
        'Дві різні дії: закрити файл із секретами і виставити змінну в оточенні. Шаблон .env.example не чіпай.',
        'chmod 600 для .env, потім `export APP_ENV=production`, потім перевір через printenv APP_ENV.',
        'chmod 600 .env\nls -l\nexport APP_ENV=production\nprintenv APP_ENV',
      ],
      solution:
        'chmod 600 .env\nls -l\nexport APP_ENV=production\nprintenv APP_ENV',
    },

    {
      id: 'l09-m04',
      title: 'HTTPS за пʼять хвилин',
      goal: 'Домен отримав сертифікат Let’s Encrypt, а приватний ключ закритий як належить.',
      xp: 180,
      theory: [
        {
          kind: 'text',
          text:
            'TLS дає дві речі: шифрування трафіку й підтвердження, що ти справді той домен, ' +
            'за який себе видаєш. Let’s Encrypt видає сертифікати безкоштовно, ' +
            '`certbot` автоматизує весь процес.',
        },
        {
          kind: 'code',
          lines: [
            'sudo certbot --nginx -d shop.internal',
            'openssl x509 -text -noout -in fullchain.pem   # подивитись, до якої дати дійсний',
          ],
        },
        {
          kind: 'note',
          text:
            'Сертифікати Let’s Encrypt живуть 90 днів. Автопродовження — не опція, а вимога: ' +
            'прострочений сертифікат дає червоний екран у браузері, і це видно всім користувачам одразу.',
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
              },
              reachable: [
                '127.0.0.1',
                'localhost',
                '10.0.0.5',
                'shop.internal',
              ],
            },
            services: [
              {
                name: 'nginx',
                description: 'A high performance web server',
                active: true,
                enabled: true,
                port: 80,
              },
            ],
          }),
        goals: [
          {
            id: 'issued',
            label: 'Отримати сертифікат для домену shop.internal',
            hintOnFail: 'certbot потребує root і прапорця -d із доменом.',
            check: (s) =>
              getNode(
                s.fs,
                '/etc/letsencrypt/live/shop.internal/fullchain.pem',
              ) !== null,
          },
          {
            id: 'key-perms',
            label: 'Переконатися, що приватний ключ має права 600',
            hintOnFail:
              'Подивись на нього через ls -l — certbot виставляє права сам.',
            check: (s) =>
              (getNode(s.fs, '/etc/letsencrypt/live/shop.internal/privkey.pem')
                ?.mode ?? 0) === 0o600 &&
              s.history.some(
                (line) =>
                  /^(ls|stat)\b/.test(line.trim()) &&
                  line.includes('letsencrypt'),
              ),
          },
          {
            id: 'reloaded',
            label: 'Перезавантажити nginx, щоб він підхопив сертифікат',
            hintOnFail: 'reload, а не restart — щоб не рвати живі зʼєднання.',
            check: (s) =>
              s.history.some((line) =>
                /nginx\s+-s\s+reload|systemctl\s+reload\s+nginx/.test(line),
              ),
          },
        ],
      },
      hints: [
        'Одна команда випускає сертифікат, далі перевір права на ключ і скажи nginx перечитати конфіг.',
        '`sudo certbot --nginx -d shop.internal`, потім `ls -l /etc/letsencrypt/live/shop.internal/`, потім `sudo nginx -s reload`.',
        'sudo certbot --nginx -d shop.internal\nls -l /etc/letsencrypt/live/shop.internal/\nsudo nginx -s reload',
      ],
      solution:
        'sudo certbot --nginx -d shop.internal\nls -l /etc/letsencrypt/live/shop.internal/\nsudo nginx -s reload',
    },

    {
      id: 'l09-m05',
      title: 'Куди подіти секрет',
      goal: 'Ти впевнено відрізняєш безпечне зберігання секретів від небезпечного.',
      xp: 120,
      theory: [
        {
          kind: 'table',
          caption: 'Правило одного речення',
          rows: [
            [
              'Безпечно',
              'секрет живе поза кодом, доступний лише процесу, який його потребує',
            ],
            [
              'Небезпечно',
              'секрет там, де його бачить хтось іще: git, логи, образ, чат',
            ],
          ],
        },
        {
          kind: 'note',
          text:
            'Окрема пастка — Docker: `ENV SECRET=...` у Dockerfile вбудовує секрет **у шар образу**. ' +
            'Будь-хто, хто завантажить образ, дістане його через `docker history`.',
        },
      ],
      task: {
        kind: 'quiz',
        multi: true,
        question:
          'Де можна зберігати пароль від продакшн-бази? Обери **всі** безпечні варіанти.',
        options: [
          {
            id: 'a',
            label:
              'У `secrets` CI-системи, підставляючи через `${{ secrets.DB_PASSWORD }}`',
          },
          {
            id: 'b',
            label: 'У файлі `.env` на сервері з правами `600` і у `.gitignore`',
          },
          {
            id: 'c',
            label: 'У `docker-compose.yml`, який лежить у репозиторії',
          },
          { id: 'd', label: 'Рядком `ENV DB_PASSWORD=...` у Dockerfile' },
        ],
        correct: ['a', 'b'],
        explain:
          'Сховище секретів CI і закритий `.env` поза git — це саме те, для чого вони існують. ' +
          'А `docker-compose.yml` у репозиторії читає кожен, хто має доступ до коду, ' +
          'і `ENV` у Dockerfile назавжди запікає пароль у шар образу, звідки його видно через `docker history`.',
      },
      hints: [
        'Питай про кожен варіант: хто ще зможе це прочитати, крім самого застосунку?',
        'Усе, що потрапляє в репозиторій або в шар Docker-образу, — скомпрометоване. Лишається два варіанти.',
        'Безпечні — сховище секретів CI і .env з правами 600 поза git.',
      ],
      solution:
        'Secrets CI та .env (600, у .gitignore). Ніколи — репозиторій чи ENV у Dockerfile.',
    },
  ],
};
