import { readFile } from '../../shell/fs';
import { makeMachine } from '../../shell/machines';
import { answerFile } from '../goals';
import type { Level } from '../types';

const ACCESS_LOG = [
  '10.0.0.11 - - [14/Mar/2031:09:01:02] "GET /products HTTP/1.1" 200 5120 0.061',
  '10.0.0.12 - - [14/Mar/2031:09:01:11] "GET /health HTTP/1.1" 200 12 0.003',
  '10.0.0.13 - - [14/Mar/2031:09:01:44] "POST /checkout HTTP/1.1" 502 166 30.011',
  '10.0.0.11 - - [14/Mar/2031:09:02:02] "GET /products HTTP/1.1" 200 5120 0.058',
  '10.0.0.14 - - [14/Mar/2031:09:02:31] "POST /checkout HTTP/1.1" 502 166 30.004',
  '10.0.0.12 - - [14/Mar/2031:09:02:44] "GET /cart HTTP/1.1" 200 812 0.044',
  '10.0.0.15 - - [14/Mar/2031:09:03:01] "POST /checkout HTTP/1.1" 502 166 30.008',
  '10.0.0.11 - - [14/Mar/2031:09:03:19] "GET /products HTTP/1.1" 200 5120 0.062',
  '10.0.0.16 - - [14/Mar/2031:09:03:40] "GET /missing-page HTTP/1.1" 404 153 0.002',
  '10.0.0.13 - - [14/Mar/2031:09:04:02] "POST /checkout HTTP/1.1" 502 166 30.010',
  '10.0.0.12 - - [14/Mar/2031:09:04:30] "GET /health HTTP/1.1" 200 12 0.003',
  '10.0.0.17 - - [14/Mar/2031:09:05:01] "POST /checkout HTTP/1.1" 502 166 30.002',
  '',
].join('\n');

export const level10: Level = {
  id: 'l10',
  act: 4,
  title: 'Логи, метрики та інциденти',
  subtitle: 'Тебе розбудили о 3:00. Куди дивитись першим?',
  brief:
    'Спостережуваність — це здатність відповісти на питання «що зараз відбувається» ' +
    'без здогадок. Логи кажуть, що сталося; метрики — скільки й як часто; ' +
    'алерти будять тоді (і тільки тоді), коли страждає користувач.',
  missions: [
    {
      id: 'l10-m01',
      title: 'Тріаж access-логу',
      goal: 'Ти визначив, який ендпоінт генерує помилки і скільки їх було.',
      xp: 190,
      theory: [
        {
          kind: 'text',
          text:
            '**Ендпоінт** — це конкретний шлях, за яким застосунок приймає запити: ' +
            '`/products`, `/checkout`, `/health`. Кожен робить щось своє, і ламаються ' +
            'вони теж поодинці — тому в аварії насамперед зʼясовують, який саме.',
        },
        {
          kind: 'text',
          text:
            'Access-лог nginx — це по рядку на запит: IP, час, метод і шлях (той самий ' +
            'ендпоінт), код відповіді, розмір і **тривалість у секундах**. ' +
            'Останні дві колонки часто важливіші за все інше.',
        },
        {
          kind: 'code',
          caption: 'Стандартний набір для тріажу',
          lines: [
            'grep " 502 " access.log | wc -l          # скільки 502',
            'grep " 50" access.log                    # усі серверні помилки',
            'grep " 502 " access.log | grep -c checkout',
          ],
        },
        {
          kind: 'note',
          text:
            'Зверни увагу на тривалість `30.011` — це рівно **таймаут**: межа очікування, ' +
            'після якої програма кидає спробу й віддає помилку. Коли всі збої тривають ' +
            'однаково й близько до круглого числа, це майже завжди означає, що застосунок ' +
            'марно чекав на щось зовнішнє — базу, чужий сервіс, — а не випадковий збій.',
        },
      ],
      task: {
        kind: 'terminal',
        boot: () =>
          makeMachine({
            user: 'deploy',
            cwd: '/var/log/nginx',
            files: {
              '/var/log/nginx/access.log': {
                content: ACCESS_LOG,
                owner: 'deploy',
                group: 'deploy',
              },
            },
          }),
        goals: [
          {
            id: 'searched',
            label: 'Відфільтрувати з логу серверні помилки',
            check: (s) =>
              s.history.some(
                (line) => /grep/.test(line) && /50\d|"?50/.test(line),
              ),
          },
          answerFile({
            id: 'count',
            path: '/home/deploy/count-502.txt',
            label: 'Записати кількість відповідей 502 у ~/count-502.txt',
            expected: '5',
            hintOnFail: 'Відфільтруй за " 502 " і порахуй рядки через wc -l.',
            diagnose: (value) =>
              /^\d+$/.test(value)
                ? `Число «${value}» не те. Порахуй саме рядки з кодом 502 — не 404 і не всі підряд.`
                : 'Тут має бути тільки число.',
          }),
          answerFile({
            id: 'endpoint',
            path: '/home/deploy/endpoint.txt',
            label:
              'Записати проблемний ендпоінт у ~/endpoint.txt (наприклад /checkout)',
            expected: '/checkout',
            hintOnFail: 'Подивись, який шлях повторюється в усіх рядках з 502.',
            diagnose: (value) =>
              /products|health|cart/.test(value)
                ? `${value} у лозі відповідає кодом 200 — з ним усе гаразд. Шукай шлях у рядках з 502.`
                : !value.startsWith('/')
                  ? 'Шлях пишеться так, як у лозі, — починається зі скісної риски.'
                  : null,
          }),
        ],
      },
      hints: [
        'Усі помилки в лозі однакові. Знайди їх, порахуй і подивись, який шлях у них спільний.',
        '`grep " 502 " access.log` покаже пʼять рядків, усі — POST /checkout. Порахуй їх через `| wc -l` і запиши обидві відповіді у файли.',
        'grep " 502 " access.log\ngrep " 502 " access.log | wc -l > ~/count-502.txt\necho /checkout > ~/endpoint.txt',
      ],
      solution:
        'grep " 502 " access.log\ngrep " 502 " access.log | wc -l > ~/count-502.txt\necho /checkout > ~/endpoint.txt',
    },

    {
      id: 'l10-m02',
      title: 'Диск заповнився',
      goal: 'Ти знайшов, що зʼїло місце на диску, і звільнив його, не втративши потрібне.',
      xp: 200,
      theory: [
        {
          kind: 'text',
          text:
            'Переповнений диск валить усе одразу: база не пише, логи не пишуться, ' +
            'застосунок падає з дивними помилками. І винен майже завжди нерозрізаний лог.',
        },
        {
          kind: 'table',
          rows: [
            ['df -h', 'скільки місця лишилось на розділах'],
            ['du -sh /var/log/*', 'хто саме займає місце'],
            ['> file.log', 'обнулити файл, не видаляючи його'],
            [
              'logrotate',
              'штатний спосіб: різати й архівувати логи автоматично',
            ],
          ],
        },
        {
          kind: 'note',
          text:
            'Видаляти активний лог-файл через `rm` — погана ідея: програма, яка в нього ' +
            'пише, тримає його відкритим і після видалення продовжує писати «в нікуди». ' +
            'Місце при цьому не звільниться, доки сервіс не перезапустять. ' +
            'Правильно — **обнулити** файл через `> file.log`: він лишається на місці, ' +
            'просто стає порожнім.',
        },
      ],
      task: {
        kind: 'terminal',
        boot: () =>
          makeMachine({
            user: 'deploy',
            cwd: '/var/log',
            files: {
              '/var/log/app/debug.log': {
                content: `${'DEBUG verbose trace line with a lot of noise\n'.repeat(400)}`,
                owner: 'deploy',
                group: 'deploy',
              },
              '/var/log/app/app.log': {
                content: 'INFO started\nINFO ready\n',
                owner: 'deploy',
                group: 'deploy',
              },
              '/var/log/nginx/access.log': {
                content: ACCESS_LOG,
                owner: 'deploy',
                group: 'deploy',
              },
            },
          }),
        goals: [
          {
            id: 'df',
            label: 'Подивитися, скільки місця лишилось',
            check: (s) => s.history.some((line) => /^df\b/.test(line.trim())),
          },
          {
            id: 'du',
            label: 'Знайти, який каталог або файл займає найбільше',
            hintOnFail: 'du показує розмір; починай із /var/log.',
            check: (s) => s.history.some((line) => /^du\b/.test(line.trim())),
          },
          {
            id: 'truncated',
            label: 'Обнулити debug.log, не видаляючи сам файл',
            hintOnFail:
              'Перенаправлення порожнього виводу у файл робить його порожнім: `> шлях`. Не rm.',
            check: (s) =>
              (readFile(s.fs, '/var/log/app/debug.log') ?? 'x') === '',
          },
          {
            id: 'kept',
            label: 'Файл має лишитись на місці, а app.log — недоторканим',
            hintOnFail:
              'Якщо ти видалив файл — натисни «Скинути»: процес тримав би дескриптор.',
            check: (s) =>
              readFile(s.fs, '/var/log/app/debug.log') !== null &&
              (readFile(s.fs, '/var/log/app/app.log') ?? '').includes(
                'INFO started',
              ),
          },
        ],
      },
      hints: [
        'Спершу подивись загальну картину по диску, потім звузь до конкретного каталогу.',
        '`df -h`, далі `du -sh /var/log/*` покаже, що debug.log величезний. Обнули його перенаправленням, а не rm.',
        'df -h\ndu -sh /var/log/app\n> /var/log/app/debug.log\nls -l /var/log/app',
      ],
      solution:
        'df -h\ndu -sh /var/log/app\n> /var/log/app/debug.log\nls -l /var/log/app',
    },

    {
      id: 'l10-m03',
      title: 'Інцидент: 502 у проді',
      goal: 'Ти пройшов повний ланцюжок діагностики й підняв бекенд, що впав.',
      xp: 260,
      theory: [
        {
          kind: 'text',
          text:
            '`502 Bad Gateway` означає рівно одне: проксі отримав запит, спробував передати ' +
            'його далі — і не зміг. Сам nginx при цьому здоровий. Отже, шукати треба **за** ним.',
        },
        {
          kind: 'code',
          caption: 'Ланцюжок звуження',
          lines: [
            'curl -I https://shop.internal/api/health   # підтвердити симптом',
            'systemctl status shop-api                  # чи живий бекенд',
            'journalctl -u shop-api -n 30               # чому він упав',
            'ss -tulpn | grep 3000                      # чи слухає він свій порт',
          ],
        },
        {
          kind: 'note',
          text:
            'Не перезапускай сервіс, поки не прочитав, чому він упав. Перезапуск зітре ' +
            'симптом, залишить причину — і о 4:00 тебе розбудять удруге.',
        },
      ],
      task: {
        kind: 'terminal',
        intro: [
          'Алерт: shop.internal віддає 502 на /api/health.',
          'nginx працює. Розберись і полагодь.',
          '',
        ],
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
                  port: 443,
                  proto: 'tcp',
                  process: 'nginx',
                  address: '0.0.0.0',
                },
              ],
              http: {
                'https://shop.internal/api/health': {
                  status: 502,
                  statusText: 'Bad Gateway',
                  headers: { Server: 'nginx/1.24.0' },
                  body: '<html><title>502 Bad Gateway</title></html>',
                },
              },
            },
            services: [
              {
                name: 'nginx',
                description: 'A high performance web server',
                active: true,
                enabled: true,
                port: 443,
              },
              {
                name: 'shop-api',
                description: 'Shop API service',
                active: false,
                enabled: true,
                port: 3000,
                log: [
                  'Starting Shop API service...',
                  'Error: connect ECONNREFUSED 10.0.0.7:5432',
                  'FATAL: could not reach database, exiting',
                  'shop-api.service: Main process exited, code=exited, status=1/FAILURE',
                  'shop-api.service: Failed with result "exit-code".',
                ],
              },
            ],
          }),
        goals: [
          {
            id: 'symptom',
            label: 'Підтвердити симптом запитом',
            check: (s) => s.history.some((line) => /^curl\b/.test(line.trim())),
          },
          {
            id: 'status',
            label: 'Перевірити стан бекенда shop-api',
            hintOnFail:
              '502 означає, що зламаний не nginx. Дивись сервіс за ним.',
            check: (s) =>
              s.history.some((line) =>
                /systemctl\s+status\s+shop-api/.test(line),
              ),
          },
          {
            id: 'journal',
            label: 'Прочитати журнал і зʼясувати причину падіння',
            hintOnFail:
              'journalctl -u shop-api — там написано, до чого він не достукався.',
            check: (s) =>
              s.history.some((line) => /journalctl.*shop-api/.test(line)),
          },
          answerFile({
            id: 'cause',
            path: '/home/deploy/cause.txt',
            label:
              'Записати у ~/cause.txt слово database — те, до чого бекенд не достукався',
            expected: 'database',
            hintOnFail:
              'У журналі shop-api написано, до чого саме він не зміг підключитися.',
            diagnose: (value) =>
              /nginx|shop-api/.test(value.toLowerCase())
                ? 'Це той, хто впав, а не причина. Прочитай журнал: до чого він не достукався?'
                : null,
          }),
          {
            id: 'up',
            label: 'Підняти shop-api після того, як зрозумів причину',
            hintOnFail:
              'Запускати треба ПІСЛЯ читання журналу, а не замість нього.',
            check: (s) => {
              const journalAt = s.history.findIndex((line) =>
                /journalctl/.test(line),
              );
              const startAt = s.history.findIndex((line) =>
                /systemctl\s+(start|restart)\s+shop-api/.test(line),
              );
              return (
                s.services['shop-api']?.active === true &&
                journalAt !== -1 &&
                startAt > journalAt
              );
            },
          },
        ],
      },
      hints: [
        'Іди по ланцюжку: запит → проксі → сервіс за ним → його журнал. Не перестрибуй одразу до restart.',
        'curl підтвердить 502. `systemctl status shop-api` покаже inactive, `journalctl -u shop-api` — ECONNREFUSED до бази. Запиши причину у файл і лише тоді стартуй сервіс.',
        'curl -I https://shop.internal/api/health\nsystemctl status shop-api\njournalctl -u shop-api -n 30\necho database > ~/cause.txt\nsudo systemctl start shop-api',
      ],
      solution:
        'curl -I https://shop.internal/api/health\nsystemctl status shop-api\njournalctl -u shop-api -n 30\necho database > ~/cause.txt\nsudo systemctl start shop-api',
    },

    {
      id: 'l10-m04',
      title: 'SLI, SLO і бюджет помилок',
      goal: 'Ти розумієш, як вимірюють надійність і коли треба зупиняти релізи.',
      xp: 130,
      theory: [
        {
          kind: 'table',
          rows: [
            ['SLI', 'показник: частка успішних запитів, latency p99 тощо'],
            [
              'SLO',
              'ціль по цьому показнику: «99.9% запитів успішні за місяць»',
            ],
            ['Error budget', 'скільки помилок ще «можна»: 100% − SLO'],
          ],
        },
        {
          kind: 'text',
          text:
            'SLO 99.9% на місяць означає бюджет приблизно **43 хвилини** недоступності. ' +
            'Поки бюджет не вичерпано — команда котить фічі. Вичерпали — зупиняють релізи ' +
            'й займаються надійністю.',
        },
        {
          kind: 'note',
          text:
            'Сенс бюджету не в покаранні, а в тому, щоб суперечка «фічі проти стабільності» ' +
            'вирішувалась числом, а не тим, хто голосніше.',
        },
      ],
      task: {
        kind: 'quiz',
        question:
          'Ваш SLO — 99.9% успішних запитів за 30 днів. За перші 10 днів місяця ви вже спалили 95% бюджету помилок. Що правильно зробити?',
        options: [
          {
            id: 'a',
            label: 'Підняти SLO до 99.99%, щоб бюджет став більшим',
          },
          {
            id: 'b',
            label:
              'Пригальмувати релізи фіч і кинути сили на причини помилок, доки бюджет не відновиться',
          },
          {
            id: 'c',
            label: 'Вимкнути алерти — вони шумлять і заважають працювати',
          },
          {
            id: 'd',
            label: 'Нічого: бюджет усе одно обнулиться першого числа',
          },
        ],
        correct: ['b'],
        explain:
          'Спалений бюджет — це сигнал, що система вже на межі обіцяного користувачам рівня. ' +
          'Кожен наступний реліз підвищує ризик пробити SLO. Підняття SLO бюджет не збільшує, ' +
          'а **зменшує**: 99.99% дає ~4 хвилини на місяць замість 43.',
      },
      hints: [
        'Бюджет помилок — це дозволена кількість збоїв. Що означає «залишилось 5%»?',
        'Уважно з варіантом про підняття SLO: подумай, більший чи менший бюджет дає жорсткіша ціль.',
        'Правильна дія — пригальмувати релізи й зайнятись причинами.',
      ],
      solution:
        'Спалений бюджет = стоп релізам, фокус на надійності. Вища ціль SLO дає МЕНШИЙ бюджет.',
    },

    {
      id: 'l10-m05',
      title: 'Після інциденту',
      goal: 'Ти знаєш порядок дій під час і після аварії.',
      xp: 130,
      theory: [
        {
          kind: 'text',
          text:
            'Під час інциденту пріоритет один: **відновити сервіс для користувача**. ' +
            'Пошук винного й красиве рішення — усе потім.',
        },
        {
          kind: 'text',
          text:
            '**Постмортем** — це короткий документ, який пишуть після аварії: що сталося, ' +
            'коли, чому, і що зробити, щоб не повторилось. Не звіт для начальства, ' +
            'а памʼять команди.',
        },
        {
          kind: 'note',
          text:
            'Постмортем пишеться **безвинним** (blameless): шукають не людину, а те, що дозволило ' +
            'помилці доїхати до прода. Якщо на постмортемі шукають винних — наступного разу ' +
            'про інцидент просто промовчать.',
        },
      ],
      task: {
        kind: 'order',
        instruction: 'Розстав кроки роботи з інцидентом у правильному порядку.',
        items: [
          {
            id: 'ack',
            label: 'Прийняти алерт: підтвердити, що ти цим займаєшся',
          },
          {
            id: 'scope',
            label: 'Оцінити вплив: хто саме страждає і наскільки',
          },
          {
            id: 'mitigate',
            label:
              'Пом’якшити: відкат або перемикання, щоб користувачам стало добре',
          },
          {
            id: 'diagnose',
            label: 'Знайти корінну причину вже на працюючій системі',
          },
          { id: 'fix', label: 'Випустити повноцінне виправлення' },
          {
            id: 'postmortem',
            label: 'Написати безвинний постмортем із конкретними діями',
          },
        ],
        correct: ['ack', 'scope', 'mitigate', 'diagnose', 'fix', 'postmortem'],
        explain:
          'Спершу зупиняємо біль користувача (відкат — це нормально й правильно), і лише потім ' +
          'спокійно шукаємо причину. Постмортем наприкінці перетворює одну аварію на систему, ' +
          'яка більше так не падає.',
      },
      hints: [
        'Що важливіше о 3:00 — зрозуміти причину чи щоб у користувачів запрацювало?',
        'Прийняти → оцінити вплив → пом’якшити (відкат) → діагностувати → полагодити → постмортем.',
        'ack → scope → mitigate → diagnose → fix → postmortem',
      ],
      solution:
        'Прийняти алерт → оцінити вплив → пом’якшити → діагностувати → виправити → постмортем.',
    },
  ],
};
