import { makePod } from '../../shell/commands/k8s';
import { makeMachine } from '../../shell/machines';
import { answerFile } from '../goals';
import type { Level } from '../types';

const MANIFEST = [
  'apiVersion: apps/v1',
  'kind: Deployment',
  'metadata:',
  '  name: shop-api',
  'spec:',
  '  replicas: 3',
  '  selector:',
  '    matchLabels:',
  '      app: shop-api',
  '  template:',
  '    metadata:',
  '      labels:',
  '        app: shop-api',
  '    spec:',
  '      containers:',
  '        - name: api',
  '          image: registry.acme.io/shop-api:1.4.0',
  '          ports:',
  '            - containerPort: 8080',
  '          readinessProbe:',
  '            httpGet:',
  '              path: /health',
  '              port: 8080',
  '          livenessProbe:',
  '            httpGet:',
  '              path: /health',
  '              port: 8080',
  '',
].join('\n');

export const level11: Level = {
  id: 'l11',
  act: 4,
  title: 'Kubernetes',
  subtitle: 'Ти більше не запускаєш контейнери. Ти описуєш бажаний стан.',
  brief:
    'Kubernetes працює за принципом бажаного стану: ти кажеш «хочу 3 копії цього образу», ' +
    'а кластер сам стежить, щоб їх було рівно 3 — перезапускає впалі, переносить із мертвих ' +
    'вузлів. Твоя робота зміщується з «запустити» на «описати й діагностувати».',
  missions: [
    {
      id: 'l11-m01',
      title: 'Огляд кластера',
      goal: 'Ти вмієш подивитись, що працює в кластері, і знайти проблемний под.',
      xp: 180,
      theory: [
        {
          kind: 'text',
          text:
            '**Кластер** — це кілька серверів, обʼєднаних так, що ззовні вони поводяться ' +
            'як одна велика машина. Кожен окремий сервер у ньому називають **вузлом** ' +
            '(node). Ти більше не кажеш «запусти на цій машині» — ти кажеш «хай працює ' +
            'три копії», а кластер сам вирішує, на яких вузлах їх поставити.',
        },
        {
          kind: 'table',
          caption: 'Три обʼєкти, з яких усе починається',
          rows: [
            [
              'Pod',
              'один або кілька контейнерів, що працюють разом. Найдрібніша одиниця',
            ],
            [
              'Deployment',
              'керує подами: скільки копій, який образ, як оновлювати',
            ],
            [
              'Service',
              'стабільна адреса для звернення до подів — вони ж постійно змінюються',
            ],
          ],
        },
        {
          kind: 'code',
          lines: [
            'kubectl get pods',
            'kubectl get deployments',
            'kubectl describe pod <імʼя>   # деталі + Events — найкорисніша частина',
            'kubectl logs <імʼя>',
          ],
        },
        {
          kind: 'note',
          text:
            'Колонка `STATUS` каже, що зараз; колонка `RESTARTS` — як довго це триває. ' +
            'Под із 47 рестартами й статусом `Running` проблемніший за той, що просто впав: ' +
            'він падає по колу.',
        },
      ],
      task: {
        kind: 'terminal',
        boot: () =>
          makeMachine({
            user: 'deploy',
            k8s: {
              namespace: 'default',
              namespaces: ['default', 'kube-system'],
              deployments: [
                {
                  name: 'shop-api',
                  replicas: 3,
                  ready: 2,
                  image: 'registry.acme.io/shop-api:1.4.0',
                  revision: 4,
                  history: [
                    { revision: 3, image: 'registry.acme.io/shop-api:1.3.0' },
                  ],
                  labels: { app: 'shop-api' },
                },
              ],
              pods: [
                makePod({
                  name: 'shop-api-7d4f9c-abc12',
                  deployment: 'shop-api',
                  logs: ['listening on :8080'],
                }),
                makePod({
                  name: 'shop-api-7d4f9c-def34',
                  deployment: 'shop-api',
                  logs: ['listening on :8080'],
                }),
                makePod({
                  name: 'shop-api-7d4f9c-ghi56',
                  deployment: 'shop-api',
                  ready: '0/1',
                  status: 'CrashLoopBackOff',
                  restarts: 7,
                  age: '4m',
                  logs: [
                    'Error: missing required env DATABASE_URL',
                    'exiting with code 1',
                  ],
                  events: [
                    'Warning  BackOff    30s    Back-off restarting failed container',
                    'Normal   Pulled     4m     Container image already present on machine',
                  ],
                }),
              ],
              services: [
                {
                  name: 'shop-api',
                  type: 'ClusterIP',
                  clusterIp: '10.96.0.42',
                  ports: '80/TCP',
                  selector: 'shop-api',
                },
              ],
              configmaps: [],
              secrets: [],
              ingresses: [],
            },
          }),
        goals: [
          {
            id: 'pods',
            label: 'Подивитися список подів',
            check: (s) =>
              s.history.some((line) =>
                /kubectl\s+get\s+(pods?|po)\b/.test(line),
              ),
          },
          {
            id: 'describe',
            label: 'Подивитися деталі проблемного пода',
            hintOnFail:
              'Той, у якого статус не Running. describe покаже Events.',
            check: (s) =>
              s.history.some(
                (line) =>
                  /kubectl\s+describe/.test(line) && line.includes('ghi56'),
              ),
          },
          {
            id: 'logs',
            label: 'Прочитати його логи',
            check: (s) =>
              s.history.some(
                (line) => /kubectl\s+logs/.test(line) && line.includes('ghi56'),
              ),
          },
          answerFile({
            id: 'answer',
            path: '/home/deploy/missing.txt',
            label:
              'Записати у ~/missing.txt назву змінної оточення, якої бракує поду',
            expected: 'DATABASE_URL',
            hintOnFail: 'Логи називають її прямо. Потрібне саме імʼя змінної.',
            diagnose: (value) =>
              value.toUpperCase() === 'DATABASE_URL'
                ? 'Майже — імена змінних оточення пишуться великими літерами: DATABASE_URL.'
                : 'Тут потрібне лише імʼя змінної з логів, без решти тексту помилки.',
          }),
        ],
      },
      hints: [
        'Спершу подивись, які поди є і в якому вони стані. Один із них явно виділяється.',
        'Под shop-api-7d4f9c-ghi56 у CrashLoopBackOff. Подивись його через describe і logs — логи назвуть змінну.',
        'kubectl get pods\nkubectl describe pod shop-api-7d4f9c-ghi56\nkubectl logs shop-api-7d4f9c-ghi56\necho DATABASE_URL > ~/missing.txt',
      ],
      solution:
        'kubectl get pods\nkubectl describe pod shop-api-7d4f9c-ghi56\nkubectl logs shop-api-7d4f9c-ghi56\necho DATABASE_URL > ~/missing.txt',
    },

    {
      id: 'l11-m02',
      title: 'Перший маніфест',
      goal: 'Ти написав Deployment із трьома репліками й обома пробами.',
      xp: 250,
      theory: [
        {
          kind: 'text',
          text:
            'Маніфест — це YAML-файл, який описує **бажаний стан**. Чотири поля є завжди: ' +
            '`apiVersion`, `kind`, `metadata` і `spec`.',
        },
        {
          kind: 'text',
          text:
            'Ще два слова. **Репліка** — це одна копія пода; `replicas: 3` означає ' +
            '«тримай три однакові копії». **Мітка** (label) — довільна пара ' +
            '`ключ: значення`, наклеєна на обʼєкт; за мітками Kubernetes потім знаходить ' +
            'потрібні поди, бо їхні імена постійно змінюються.',
        },
        {
          kind: 'table',
          caption: 'Що всередині spec у Deployment',
          rows: [
            ['replicas', 'скільки копій тримати'],
            [
              'selector.matchLabels',
              'за якими мітками Deployment впізнає «свої» поди',
            ],
            ['template', 'шаблон пода: мітки + контейнери'],
            ['readinessProbe', 'коли под готовий ПРИЙМАТИ трафік'],
            ['livenessProbe', 'коли под треба ПЕРЕЗАПУСТИТИ'],
          ],
        },
        {
          kind: 'note',
          text:
            'Мітки в `selector.matchLabels` мають збігатися з мітками в `template.metadata.labels`. ' +
            'Якщо ні — Deployment створить поди й одразу їх «не впізнає», ' +
            'і кластер почне плодити нові нескінченно.',
        },
        {
          kind: 'text',
          text:
            'Різниця проб важлива: без **readiness** трафік піде в под, який ще піднімається, ' +
            'і користувачі побачать помилки під час кожного релізу. Без **liveness** зависший ' +
            'под лишиться в ротації назавжди.',
        },
      ],
      task: {
        kind: 'editor',
        filename: 'k8s/deployment.yaml',
        language: 'yaml',
        starter: [
          '# Deployment для shop-api:',
          '#   образ registry.acme.io/shop-api:1.4.0, порт 8080,',
          '#   3 репліки, readiness і liveness на /health',
          '',
          'apiVersion: apps/v1',
          'kind: Deployment',
          '',
        ].join('\n'),
        goals: [
          {
            id: 'kind',
            label: 'Це має бути Deployment з іменем shop-api',
            check: (text) =>
              /kind:\s*Deployment/m.test(text) &&
              /^\s{2}name:\s*shop-api\s*$/m.test(text),
          },
          {
            id: 'replicas',
            label: 'Задати 3 репліки',
            check: (text) => /^\s*replicas:\s*3\s*$/m.test(text),
          },
          {
            id: 'selector',
            label: 'Selector і мітки пода мають збігатися (app: shop-api)',
            hintOnFail:
              'Мітка має зʼявитись двічі: у spec.selector.matchLabels і в template.metadata.labels.',
            check: (text) => (text.match(/app:\s*shop-api/g) ?? []).length >= 2,
          },
          {
            id: 'image',
            label: 'Вказати образ registry.acme.io/shop-api:1.4.0',
            check: (text) =>
              /image:\s*registry\.acme\.io\/shop-api:1\.4\.0/m.test(text),
          },
          {
            id: 'port',
            label: 'Вказати containerPort 8080',
            check: (text) => /containerPort:\s*8080/m.test(text),
          },
          {
            id: 'probes',
            label: 'Додати readinessProbe і livenessProbe на шлях /health',
            hintOnFail: 'Потрібні обидві проби, обидві з httpGet на /health.',
            check: (text) =>
              /readinessProbe:/m.test(text) &&
              /livenessProbe:/m.test(text) &&
              (text.match(/path:\s*\/health/g) ?? []).length >= 2,
          },
        ],
      },
      hints: [
        'Скелет завжди однаковий: apiVersion, kind, metadata.name, spec. Усередині spec — replicas, selector, template.',
        'Не забудь, що мітка app: shop-api має бути і в selector.matchLabels, і в template.metadata.labels. Проби живуть усередині опису контейнера.',
        MANIFEST,
      ],
      solution: MANIFEST,
    },

    {
      id: 'l11-m03',
      title: 'Масштабування і викочування',
      goal: 'Ти застосував маніфест, масштабував застосунок і переконався, що реліз доїхав.',
      xp: 210,
      theory: [
        {
          kind: 'code',
          lines: [
            'kubectl apply -f k8s/deployment.yaml   # застосувати бажаний стан',
            'kubectl get deployments                # скільки готово',
            'kubectl scale deployment/shop-api --replicas=5',
            'kubectl rollout status deployment/shop-api',
          ],
        },
        {
          kind: 'text',
          text:
            '**Викочування** (rollout) — це процес заміни старих подів на нові після ' +
            'зміни маніфесту. Kubernetes робить її поступово: піднімає новий под, ' +
            'чекає, поки він стане готовим, і лише тоді гасить старий — щоб сайт ' +
            'не лежав під час оновлення.',
        },
        {
          kind: 'text',
          text:
            '`apply` — **декларативна** команда: ти описуєш, як має бути, і застосовуєш це ' +
            'скільки завгодно разів із тим самим результатом. Саме тому маніфести тримають у git: ' +
            'репозиторій стає джерелом правди про стан кластера.',
        },
        {
          kind: 'note',
          text:
            'Змінювати щось через `kubectl edit` або `scale` напряму — зручно в аварії, ' +
            'але наступний `apply` з git затре ці зміни. Правильно — правити маніфест і комітити.',
        },
      ],
      task: {
        kind: 'terminal',
        boot: () =>
          makeMachine({
            user: 'deploy',
            cwd: '/srv/shop',
            dirs: [{ path: '/srv/shop/k8s', owner: 'deploy', group: 'deploy' }],
            files: {
              '/srv/shop/k8s/deployment.yaml': {
                content: MANIFEST,
                owner: 'deploy',
                group: 'deploy',
              },
            },
          }),
        goals: [
          {
            id: 'applied',
            label: 'Застосувати маніфест',
            hintOnFail: 'kubectl apply -f зі шляхом до файлу.',
            check: (s) => s.k8s.deployments.some((d) => d.name === 'shop-api'),
          },
          {
            id: 'scaled',
            label: 'Масштабувати shop-api до 5 реплік',
            check: (s) =>
              s.k8s.deployments.some(
                (d) => d.name === 'shop-api' && d.replicas === 5,
              ),
          },
          {
            id: 'pods',
            label: 'Переконатися, що працює саме 5 подів',
            hintOnFail: 'kubectl get pods має показати пʼять рядків.',
            check: (s) =>
              s.k8s.pods.filter((pod) => pod.deployment === 'shop-api')
                .length === 5 &&
              s.history.some((line) =>
                /kubectl\s+get\s+(pods?|po)\b/.test(line),
              ),
          },
          {
            id: 'rollout',
            label: 'Перевірити статус викочування',
            check: (s) =>
              s.history.some((line) => /kubectl\s+rollout\s+status/.test(line)),
          },
        ],
      },
      hints: [
        'Спочатку застосуй те, що вже описано у файлі. Потім зміни кількість копій і переконайся, що кластер це зробив.',
        '`kubectl apply -f k8s/deployment.yaml`, далі `kubectl scale deployment/shop-api --replicas=5`, далі `kubectl get pods` і `kubectl rollout status deployment/shop-api`.',
        'kubectl apply -f k8s/deployment.yaml\nkubectl scale deployment/shop-api --replicas=5\nkubectl get pods\nkubectl rollout status deployment/shop-api',
      ],
      solution:
        'kubectl apply -f k8s/deployment.yaml\nkubectl scale deployment/shop-api --replicas=5\nkubectl get pods\nkubectl rollout status deployment/shop-api',
    },

    {
      id: 'l11-m04',
      title: 'CrashLoopBackOff у проді',
      goal: 'Ти діагностував зламаний реліз і відкотив його однією командою.',
      xp: 270,
      theory: [
        {
          kind: 'text',
          text:
            '`CrashLoopBackOff` означає: контейнер стартує, падає, кластер його перезапускає, ' +
            'і так по колу зі зростаючою паузою. Причина завжди в логах самого контейнера.',
        },
        {
          kind: 'text',
          text:
            'Кожне викочування Kubernetes нумерує — це **ревізія**. Він памʼятає, який ' +
            'образ був на кожній із них, тому відкат — це не «зібрати старий код заново», ' +
            'а просто «повернись на попередню ревізію».',
        },
        {
          kind: 'code',
          lines: [
            'kubectl logs <pod>              # логи поточної спроби',
            'kubectl logs <pod> --previous   # логи спроби, що ВЖЕ впала',
            'kubectl rollout history deployment/shop-api',
            'kubectl rollout undo deployment/shop-api   # відкат на попередню ревізію',
          ],
        },
        {
          kind: 'note',
          text:
            'В аварії відкат — це перша дія, а не остання. `rollout undo` повертає попередній ' +
            'образ за секунди. Розбиратись, чому новий не працює, спокійніше тоді, ' +
            'коли прод уже живий.',
        },
      ],
      task: {
        kind: 'terminal',
        intro: [
          'Реліз 1.5.0 виїхав 4 хвилини тому. Половина подів у CrashLoopBackOff.',
          '',
        ],
        boot: () =>
          makeMachine({
            user: 'deploy',
            k8s: {
              namespace: 'default',
              namespaces: ['default', 'kube-system'],
              deployments: [
                {
                  name: 'shop-api',
                  replicas: 3,
                  ready: 1,
                  image: 'registry.acme.io/shop-api:1.5.0',
                  revision: 5,
                  history: [
                    { revision: 4, image: 'registry.acme.io/shop-api:1.4.0' },
                  ],
                  labels: { app: 'shop-api' },
                },
              ],
              pods: [
                makePod({
                  name: 'shop-api-9b1e-aa11',
                  deployment: 'shop-api',
                  image: 'registry.acme.io/shop-api:1.5.0',
                  ready: '0/1',
                  status: 'CrashLoopBackOff',
                  restarts: 6,
                  logs: [
                    'Error: config schema changed: unknown key "redisUrl"',
                    'process exited with code 1',
                  ],
                  events: [
                    'Warning  BackOff  20s  Back-off restarting failed container',
                  ],
                }),
                makePod({
                  name: 'shop-api-9b1e-bb22',
                  deployment: 'shop-api',
                  image: 'registry.acme.io/shop-api:1.5.0',
                  ready: '0/1',
                  status: 'CrashLoopBackOff',
                  restarts: 6,
                  logs: [
                    'Error: config schema changed: unknown key "redisUrl"',
                    'process exited with code 1',
                  ],
                  events: [],
                }),
                makePod({
                  name: 'shop-api-9b1e-cc33',
                  deployment: 'shop-api',
                  image: 'registry.acme.io/shop-api:1.5.0',
                  logs: ['listening on :8080'],
                }),
              ],
              services: [],
              configmaps: [],
              secrets: [],
              ingresses: [],
            },
          }),
        goals: [
          {
            id: 'logs',
            label: 'Прочитати логи впалого пода',
            check: (s) => s.history.some((line) => /kubectl\s+logs/.test(line)),
          },
          {
            id: 'history',
            label: 'Подивитися історію викочувань і знайти попередню ревізію',
            hintOnFail: 'kubectl rollout history deployment/shop-api',
            check: (s) =>
              s.history.some((line) =>
                /kubectl\s+rollout\s+history/.test(line),
              ),
          },
          {
            id: 'undo',
            label: 'Відкотити deployment на попередню версію',
            check: (s) =>
              s.k8s.deployments.some(
                (d) =>
                  d.name === 'shop-api' &&
                  d.image === 'registry.acme.io/shop-api:1.4.0',
              ),
          },
          {
            id: 'healthy',
            label: 'Переконатися, що всі поди знову Running',
            check: (s) =>
              s.k8s.pods.every((pod) => pod.status === 'Running') &&
              s.history.some((line) =>
                /kubectl\s+get\s+(pods?|po)\b/.test(line),
              ),
          },
        ],
      },
      hints: [
        'Спершу дізнайся, ЩО зламалось (логи), потім поверни те, що працювало (відкат).',
        '`kubectl logs shop-api-9b1e-aa11` покаже помилку конфігу. Далі `kubectl rollout history deployment/shop-api` і `kubectl rollout undo deployment/shop-api`.',
        'kubectl get pods\nkubectl logs shop-api-9b1e-aa11\nkubectl rollout history deployment/shop-api\nkubectl rollout undo deployment/shop-api\nkubectl get pods',
      ],
      solution:
        'kubectl get pods\nkubectl logs shop-api-9b1e-aa11\nkubectl rollout history deployment/shop-api\nkubectl rollout undo deployment/shop-api\nkubectl get pods',
    },

    {
      id: 'l11-m05',
      title: 'Под зник — і зʼявився знову',
      goal: 'Ти розумієш, хто в кластері за що відповідає.',
      xp: 140,
      theory: [
        {
          kind: 'text',
          text:
            'Deployment постійно порівнює бажаний стан із фактичним. Видалив под — ' +
            'фактичних стало менше, ніж бажаних, і кластер створює новий. Це не баг, це вся суть.',
        },
        {
          kind: 'note',
          text:
            'Тому «полагодити», видаливши под, — не рішення, а перезапуск. ' +
            'Щоб под справді зник, треба змінити **бажаний стан**: зменшити `replicas` ' +
            'або видалити сам Deployment.',
        },
      ],
      task: {
        kind: 'quiz',
        question:
          'Ти виконав `kubectl delete pod shop-api-7d4f9c-abc12`, який належить Deployment із `replicas: 3`. Що станеться далі?',
        options: [
          {
            id: 'a',
            label: 'Подів стане 2, поки хтось не застосує маніфест заново',
          },
          {
            id: 'b',
            label:
              'Deployment одразу створить новий под замість видаленого — знову буде 3',
          },
          {
            id: 'c',
            label: 'Видалиться весь Deployment разом із рештою подів',
          },
          {
            id: 'd',
            label: 'Kubernetes відмовить: поди Deployment видаляти не можна',
          },
        ],
        correct: ['b'],
        explain:
          'Deployment тримає бажаний стан `replicas: 3`. Щойно подів стало 2, контролер створює ' +
          'третій. Саме тому видалення пода — це фактично спосіб його перезапустити, ' +
          'а не спосіб чогось позбутися.',
      },
      hints: [
        'Згадай головний принцип Kubernetes: ти описуєш бажаний стан, а кластер його підтримує.',
        'Бажаний стан лишився 3. Фактичний став 2. Що зробить контролер?',
        'Кластер створить новий под, щоб знову стало 3.',
      ],
      solution:
        'Deployment негайно створить заміну — бажаний стан replicas: 3 не змінився.',
    },
  ],
};
