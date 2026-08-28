import { makeMachine, seed } from '../../shell/machines';
import { answerFile } from '../goals';
import type { Level } from '../types';

/**
 * Terraform's comment character is `#`, and the starter file's brief is written
 * in comments. Grading the raw text would let the instructions count as the
 * answer, so every check reads the code with comments stripped out.
 */
const code = (text: string): string => text.replace(/#.*$/gm, '');

const MAIN_TF = [
  'terraform {',
  '  required_providers {',
  '    aws = {',
  '      source  = "hashicorp/aws"',
  '      version = "~> 5.0"',
  '    }',
  '  }',
  '}',
  '',
  'provider "aws" {',
  '  region = "eu-central-1"',
  '}',
  '',
  'resource "aws_s3_bucket" "assets" {',
  '  bucket = "shop-assets-prod"',
  '}',
  '',
  'resource "aws_instance" "api" {',
  '  ami           = "ami-0abcdef1234567890"',
  '  instance_type = "t3.small"',
  '  tags = {',
  '    Name = "shop-api"',
  '  }',
  '}',
  '',
].join('\n');

export const level12: Level = {
  id: 'l12',
  act: 4,
  title: 'Хмара та Infrastructure as Code',
  subtitle: 'Фінал: інфраструктура як код і реліз від коміту до прода.',
  brief:
    'Клікати в консолі хмари можна рівно доти, доки сервер один. Далі інфраструктуру ' +
    'описують кодом: її можна ревʼювити, версіонувати й відтворити з нуля. ' +
    'Останній рівень збирає докупи все, чого ти навчився.',
  missions: [
    {
      id: 'l12-m01',
      title: 'plan перед apply',
      goal: 'Ти підняв інфраструктуру з коду й побачив, що змінюється, ще до застосування.',
      xp: 200,
      theory: [
        {
          kind: 'text',
          text:
            'Terraform порівнює три речі: **код** (як має бути), **state** — файл, у якому ' +
            'він записав, що створив минулого разу, — і **реальність** у хмарі. ' +
            'Різницю він і застосовує.',
        },
        {
          kind: 'text',
          text:
            'Сам Terraform не вміє нічого створювати. Уміють **провайдери** — окремі ' +
            'плагіни, кожен з яких знає, як говорити зі своєю хмарою: один з AWS, ' +
            'інший з Google Cloud, третій з Hetzner. Саме їх і завантажує `init`.',
        },
        {
          kind: 'table',
          rows: [
            ['terraform init', 'завантажити провайдери. Один раз на проєкт'],
            ['terraform plan', 'показати, що зміниться. НІЧОГО не змінює'],
            ['terraform apply', 'застосувати зміни'],
            ['terraform destroy', 'знести все, що описано'],
            ['terraform state list', 'що зараз під керуванням'],
          ],
        },
        {
          kind: 'note',
          text:
            'Читати `plan` перед `apply` — головна звичка в IaC. Один змінений рядок ' +
            'може означати «переставити тег», а може — «перестворити базу даних». ' +
            'Plan показує це заздалегідь, у рядку `destroy`.',
        },
      ],
      task: {
        kind: 'terminal',
        boot: () =>
          makeMachine({
            user: 'deploy',
            cwd: '/srv/infra',
            dirs: [{ path: '/srv/infra', owner: 'deploy', group: 'deploy' }],
            files: {
              '/srv/infra/main.tf': {
                content: MAIN_TF,
                owner: 'deploy',
                group: 'deploy',
              },
            },
          }),
        goals: [
          {
            id: 'init',
            label: 'Ініціалізувати проєкт (завантажити провайдери)',
            hintOnFail: 'Без цього кроку решта команд відмовляться працювати.',
            check: (s) => s.terraform.initialized,
          },
          {
            id: 'plan',
            label: 'Подивитися план змін ДО застосування',
            hintOnFail:
              'plan нічого не змінює — його безпечно запускати завжди.',
            check: (s) => {
              const planAt = s.history.findIndex((line) =>
                /terraform\s+plan/.test(line),
              );
              const applyAt = s.history.findIndex((line) =>
                /terraform\s+apply/.test(line),
              );
              return planAt !== -1 && (applyAt === -1 || planAt < applyAt);
            },
          },
          {
            id: 'apply',
            label: 'Застосувати конфігурацію',
            check: (s) => s.terraform.applied.length >= 2,
          },
          {
            id: 'state',
            label: 'Переконатися, що ресурси зʼявились у state',
            hintOnFail:
              '`terraform state list` перелічує те, чим Terraform уже керує.',
            check: (s) =>
              s.terraform.hasStateFile &&
              s.history.some((line) => /terraform\s+state\s+list/.test(line)),
          },
        ],
      },
      hints: [
        'Три команди в суворому порядку, і одна з них — обовʼязково перед застосуванням.',
        '`terraform init`, потім `terraform plan` (прочитай вивід!), потім `terraform apply`, потім `terraform state list`.',
        'terraform init\nterraform plan\nterraform apply\nterraform state list',
      ],
      solution:
        'terraform init\nterraform plan\nterraform apply\nterraform state list',
    },

    {
      id: 'l12-m02',
      title: 'Опиши сервер кодом',
      goal: 'Ти написав конфігурацію Terraform, що створює бакет і віртуальну машину.',
      xp: 230,
      theory: [
        {
          kind: 'text',
          text:
            'Конфігурація Terraform складається з блоків. `provider` каже, з якою хмарою ' +
            'працюємо, `resource "тип" "імʼя"` описує конкретний ресурс.',
        },
        {
          kind: 'code',
          caption: 'Форма блоку ресурсу',
          lines: [
            'resource "aws_s3_bucket" "assets" {',
            '  bucket = "shop-assets-prod"',
            '}',
          ],
        },
        {
          kind: 'code',
          caption: 'Провайдер оголошується так само — блоком',
          lines: [
            '# необовʼязковий, але стандартний преамбул: яку версію провайдера брати',
            'terraform {',
            '  required_providers {',
            '    aws = {',
            '      source  = "hashicorp/aws"',
            '      version = "~> 5.0"',
            '    }',
            '  }',
            '}',
            '',
            'provider "aws" {',
            '  region = "eu-central-1"   # у якому регіоні створювати ресурси',
            '}',
          ],
        },
        {
          kind: 'text',
          text:
            'Значення всередині блоку пишуть як `ключ = "значення"` — зі знаком рівності ' +
            'і в лапках, якщо це текст. Саме ці рядки й читає `terraform init`, ' +
            'щоб зрозуміти, який плагін завантажити.',
        },
        {
          kind: 'text',
          text:
            'Друге імʼя (`assets`) — це локальна адреса ресурсу всередині коду: ' +
            'на неї посилаються як `aws_s3_bucket.assets.id`. Вона не потрапляє в хмару.',
        },
        {
          kind: 'text',
          text:
            'У ресурса бувають обовʼязкові аргументи. У віртуальної машини ' +
            '`aws_instance` це `ami` — ідентифікатор образу, з якого її створюють ' +
            '(на кшталт `ami-0abcdef1234567890`). А `tags` — довільні мітки, ' +
            'за якими потім шукають ресурс у консолі хмари.',
        },
        {
          kind: 'note',
          text:
            'Файл `terraform.tfstate` містить усе, що Terraform знає про твою інфраструктуру, ' +
            'включно з чутливими значеннями. У командній роботі його тримають у віддаленому ' +
            'бекенді з блокуванням, а **не** в git.',
        },
      ],
      task: {
        kind: 'editor',
        filename: '/srv/infra/main.tf',
        language: 'bash',
        starter: [
          '# Опиши інфраструктуру:',
          '#   провайдер aws, регіон eu-central-1',
          '#   бакет aws_s3_bucket, локальне імʼя assets, bucket = shop-assets-prod',
          '#   машина aws_instance, локальне імʼя api, instance_type = t3.small',
          '',
        ].join('\n'),
        goals: [
          {
            id: 'provider',
            label: 'Оголосити провайдера aws з регіоном eu-central-1',
            hintOnFail:
              'Блок `provider "aws" { region = "eu-central-1" }` — значення в лапках.',
            check: (text) =>
              /provider\s+"aws"\s*\{[\s\S]*?region\s*=\s*"eu-central-1"[\s\S]*?\}/m.test(
                code(text),
              ),
          },
          {
            id: 'bucket',
            label: 'Описати ресурс aws_s3_bucket з локальним іменем assets',
            hintOnFail: 'Формат: resource "aws_s3_bucket" "assets" { ... }',
            check: (text) =>
              /resource\s+"aws_s3_bucket"\s+"assets"\s*\{/m.test(code(text)),
          },
          {
            id: 'bucket-name',
            label: 'Задати bucket = "shop-assets-prod"',
            hintOnFail:
              'Аргумент усередині блоку ресурсу, у лапках. Коментарі не рахуються — потрібен справжній рядок.',
            check: (text) =>
              /bucket\s*=\s*"shop-assets-prod"/m.test(code(text)),
          },
          {
            id: 'instance',
            label: 'Описати ресурс aws_instance з локальним іменем api',
            hintOnFail: 'Формат: resource "aws_instance" "api" { ... }',
            check: (text) =>
              /resource\s+"aws_instance"\s+"api"\s*\{/m.test(code(text)),
          },
          {
            id: 'type',
            label: 'Задати instance_type = "t3.small"',
            hintOnFail:
              'Аргумент усередині блоку aws_instance, значення в лапках.',
            check: (text) =>
              /instance_type\s*=\s*"t3\.small"/m.test(code(text)),
          },
        ],
      },
      hints: [
        'Три блоки: provider і два resource. Кожен ресурс має тип і локальне імʼя.',
        'provider "aws" { region = "eu-central-1" }, потім resource "aws_s3_bucket" "assets" { bucket = "..." } і resource "aws_instance" "api" { instance_type = "t3.small" }.',
        MAIN_TF,
      ],
      solution: MAIN_TF,
    },

    {
      id: 'l12-m03',
      title: 'Незмінна інфраструктура',
      goal: 'Ти розумієш, чому сервери замінюють, а не лагодять.',
      xp: 140,
      theory: [
        {
          kind: 'table',
          rows: [
            [
              'Mutable',
              'сервер живе роками, його правлять руками. З часом кожен унікальний і невідтворюваний',
            ],
            [
              'Immutable',
              'нова версія = новий інстанс з образу. Старий гаситься. Усі однакові',
            ],
          ],
        },
        {
          kind: 'text',
          text:
            'Проблема mutable-серверів має назву — **snowflake server**: конфіг на ньому ' +
            'ніхто не памʼятає повністю, відтворити його з нуля неможливо, а бекап відновлюється ' +
            'півдня. Контейнери й IaC — це і є практичне втілення immutable-підходу.',
        },
      ],
      task: {
        kind: 'quiz',
        multi: true,
        question:
          'Що дає перехід на незмінну (immutable) інфраструктуру, описану кодом? Обери **всі** правильні твердження.',
        options: [
          {
            id: 'a',
            label: 'Середовища staging і prod можна зробити справді однаковими',
          },
          {
            id: 'b',
            label:
              'Відкат стає заміною на попередній образ, а не «розлагоджуванням наживо»',
          },
          {
            id: 'c',
            label:
              'Зміни інфраструктури проходять code review, як звичайний код',
          },
          { id: 'd', label: 'Резервні копії стають непотрібними' },
        ],
        correct: ['a', 'b', 'c'],
        explain:
          'IaC дає відтворюваність, простий відкат і рев’ю змін. А от бекапи він не скасовує: ' +
          'код відтворює **інфраструктуру**, але не **дані**. База, файли користувачів і стан ' +
          'усе одно потребують резервних копій.',
      },
      hints: [
        'Три з чотирьох тверджень правильні. Подумай, чого код у принципі не може відтворити.',
        'Terraform відтворить сервер, мережу й бакет. А чи відтворить він вміст бази даних?',
        'Правильні — про однакові середовища, простий відкат і code review. Бекапи потрібні завжди.',
      ],
      solution:
        'IaC дає відтворюваність, відкат і рев’ю. Дані все одно потребують бекапів.',
    },

    {
      id: 'l12-m04',
      title: 'Фінальний бос: реліз у прод',
      goal: 'Ти провів зміну повний шлях: коміт → образ → деплой → перевірка.',
      xp: 400,
      theory: [
        {
          kind: 'text',
          text:
            'Це підсумок усього курсу. Зміна проходить той самий маршрут, що й у справжній ' +
            'компанії: git фіксує її, Docker пакує, Kubernetes розкочує, а `curl` доводить, ' +
            'що користувачу справді стало добре.',
        },
        {
          kind: 'table',
          caption: 'Маршрут релізу',
          rows: [
            ['git commit + tag', 'зафіксувати й позначити версію'],
            ['docker build -t app:версія', 'зібрати незмінний артефакт'],
            ['kubectl apply / rollout', 'розкотити бажаний стан'],
            ['curl + kubectl get pods', 'довести, що працює'],
          ],
        },
        {
          kind: 'note',
          text:
            'Реліз не закінчується словами «задеплоїв». Він закінчується перевіркою. ' +
            'Половина інцидентів — це «задеплоїв і пішов», коли поди піднялись, ' +
            'а застосунок усередині них відповідає помилкою.',
        },
      ],
      task: {
        kind: 'terminal',
        intro: [
          'Фікс уже написаний у server.js. Проведи його в прод.',
          'Кроки: закомітити → позначити тегом v1.6.0 → зібрати образ shop-api:1.6.0 →',
          'застосувати маніфест → переконатися, що поди Running.',
          '',
        ],
        boot: () =>
          seed(
            makeMachine({
              user: 'deploy',
              cwd: '/srv/shop',
              users: [{ name: 'deploy', groups: ['sudo', 'docker'] }],
              dirs: [
                { path: '/srv/shop', owner: 'deploy', group: 'deploy' },
                { path: '/srv/shop/k8s', owner: 'deploy', group: 'deploy' },
              ],
              files: {
                '/srv/shop/server.js': {
                  content:
                    "require('http').createServer((_, r) => r.end('ok')).listen(8080);\n",
                  owner: 'deploy',
                  group: 'deploy',
                },
                '/srv/shop/Dockerfile': {
                  content:
                    'FROM node:20-alpine\nWORKDIR /app\nCOPY . .\nEXPOSE 8080\nCMD ["node","server.js"]\n',
                  owner: 'deploy',
                  group: 'deploy',
                },
                '/srv/shop/k8s/deployment.yaml': {
                  content: [
                    'apiVersion: apps/v1',
                    'kind: Deployment',
                    'metadata:',
                    '  name: shop-api',
                    'spec:',
                    '  replicas: 3',
                    '  template:',
                    '    spec:',
                    '      containers:',
                    '        - name: api',
                    '          image: shop-api:1.6.0',
                    '',
                  ].join('\n'),
                  owner: 'deploy',
                  group: 'deploy',
                },
              },
            }),
            [
              'git init',
              'git config user.name "Deploy Bot"',
              'git add .',
              'git commit -m "Initial"',
              'echo "// hotfix: handle empty cart" >> server.js',
            ],
          ),
        goals: [
          {
            id: 'committed',
            label: 'Закомітити фікс',
            hintOnFail: 'Спершу git add, потім git commit -m.',
            check: (s) => s.git.commits.length >= 2,
          },
          {
            id: 'tagged',
            label: 'Позначити реліз тегом v1.6.0',
            hintOnFail: 'git tag v1.6.0',
            check: (s) => s.git.tags['v1.6.0'] !== undefined,
          },
          {
            id: 'built',
            label: 'Зібрати образ shop-api:1.6.0',
            check: (s) =>
              s.docker.images.some(
                (image) => image.repo === 'shop-api' && image.tag === '1.6.0',
              ),
          },
          {
            id: 'deployed',
            label: 'Розкотити маніфест у кластер',
            hintOnFail: 'kubectl apply -f k8s/deployment.yaml',
            check: (s) =>
              s.k8s.deployments.some(
                (d) => d.name === 'shop-api' && d.replicas === 3,
              ),
          },
          {
            id: 'verified',
            label: 'Перевірити, що всі поди Running — і що їх рівно три',
            hintOnFail: 'Реліз закінчується перевіркою, а не деплоєм.',
            check: (s) =>
              s.k8s.pods.filter((pod) => pod.deployment === 'shop-api')
                .length === 3 &&
              s.k8s.pods.every((pod) => pod.status === 'Running') &&
              s.history.some((line) =>
                /kubectl\s+get\s+(pods?|po)\b/.test(line),
              ),
          },
          answerFile({
            id: 'notes',
            path: '/home/deploy/release.txt',
            label: 'Записати у ~/release.txt тег випущеної версії',
            expected: 'v1.6.0',
            hintOnFail: 'Той самий тег, яким ти позначив коміт — разом із «v».',
            diagnose: (value) =>
              value === '1.6.0'
                ? 'Майже — тег містить літеру «v» на початку: v1.6.0.'
                : null,
          }),
        ],
      },
      hints: [
        'Той самий маршрут, що і в справжній команді: git → docker → kubectl → перевірка. Нічого нового, лише все разом.',
        'git add . && git commit -m "..." → git tag v1.6.0 → docker build -t shop-api:1.6.0 . → kubectl apply -f k8s/deployment.yaml → kubectl get pods → echo v1.6.0 > ~/release.txt',
        'git add .\ngit commit -m "Fix empty cart handling"\ngit tag v1.6.0\ndocker build -t shop-api:1.6.0 .\nkubectl apply -f k8s/deployment.yaml\nkubectl get pods\necho v1.6.0 > ~/release.txt',
      ],
      solution:
        'git add .\ngit commit -m "Fix empty cart handling"\ngit tag v1.6.0\ndocker build -t shop-api:1.6.0 .\nkubectl apply -f k8s/deployment.yaml\nkubectl get pods\necho v1.6.0 > ~/release.txt',
    },
  ],
};
