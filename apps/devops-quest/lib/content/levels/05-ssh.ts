import { getNode, readFile } from '../../shell/fs';
import { makeMachine } from '../../shell/machines';
import type { Level } from '../types';

const SSHD_CONFIG = [
  '# /etc/ssh/sshd_config',
  'Port 22',
  'PermitRootLogin yes',
  'PasswordAuthentication yes',
  'PubkeyAuthentication yes',
  'AuthorizedKeysFile .ssh/authorized_keys',
  'X11Forwarding no',
  'PrintMotd no',
  '',
].join('\n');

export const level05: Level = {
  id: 'l05',
  act: 2,
  title: 'SSH і віддалений доступ',
  subtitle: 'Ключі замість паролів — і чому ssh відмовляється від твого ключа.',
  brief:
    'SSH — це двері на сервер. Пароль можна підібрати, ключ — практично ні. ' +
    'Але ключі мають одну особливість, яка щодня зупиняє інженерів: OpenSSH ' +
    'просто ігнорує приватний ключ, якщо права на нього надто широкі.',
  missions: [
    {
      id: 'l05-m01',
      title: 'Своя пара ключів',
      goal: 'У тебе є пара ed25519-ключів, і ти розумієш, який із них можна показувати.',
      xp: 150,
      theory: [
        {
          kind: 'text',
          text:
            'Пара ключів — це два файли. **Приватний** (`id_ed25519`) ніколи й нікуди не виходить ' +
            'з твоєї машини. **Публічний** (`id_ed25519.pub`) можна вільно віддавати: його кладуть ' +
            'на сервери, у GitHub, у CI.',
        },
        {
          kind: 'code',
          lines: [
            'ssh-keygen -t ed25519 -C "deploy@app-01"',
            'ssh-keygen -t ed25519 -f ~/.ssh/deploy_key -C "ci"   # у конкретний файл',
          ],
        },
        {
          kind: 'table',
          rows: [
            ['-t ed25519', 'тип ключа. Сучасний вибір: короткий і швидкий'],
            [
              '-f',
              'куди зберегти приватний ключ (публічний ляже поруч із .pub)',
            ],
            ['-C', 'коментар — зазвичай пошта або «хто це»'],
          ],
        },
        {
          kind: 'note',
          text:
            'Якщо приватний ключ хоч раз потрапив у чат, репозиторій чи скріншот — він скомпрометований. ' +
            'Лікується лише генерацією нової пари й видаленням старої з усіх серверів.',
        },
      ],
      task: {
        kind: 'terminal',
        boot: () => makeMachine({ user: 'deploy' }),
        goals: [
          {
            id: 'private',
            label: 'Згенерувати приватний ключ ~/.ssh/id_ed25519',
            hintOnFail: 'Тип ключа задається прапорцем -t.',
            check: (s) =>
              getNode(s.fs, '/home/deploy/.ssh/id_ed25519') !== null,
          },
          {
            id: 'public',
            label: 'Поруч має зʼявитися публічний ключ .pub',
            hintOnFail:
              'Окремо його не створюють — ssh-keygen робить обидва файли за раз. Якщо .pub немає, значить не спрацювала сама генерація.',
            check: (s) =>
              getNode(s.fs, '/home/deploy/.ssh/id_ed25519.pub') !== null,
          },
          {
            id: 'perms',
            label: 'Переконатися, що приватний ключ має права 600',
            hintOnFail:
              'ssh-keygen ставить їх сам — просто переглянь ~/.ssh через ls -l.',
            check: (s) =>
              (getNode(s.fs, '/home/deploy/.ssh/id_ed25519')?.mode ?? 0) ===
                0o600 &&
              s.history.some(
                (line) => /^ls\b/.test(line.trim()) && /-\w*l/.test(line),
              ),
          },
        ],
      },
      hints: [
        'Одна команда генерує обидва файли одразу. Не забудь вказати сучасний тип ключа.',
        '`ssh-keygen -t ed25519` створить ~/.ssh/id_ed25519 і .pub. Потім подивись на них через ls -l ~/.ssh.',
        'ssh-keygen -t ed25519 -C "deploy@app-01"\nls -l ~/.ssh',
      ],
      solution: 'ssh-keygen -t ed25519 -C "deploy@app-01"\nls -l ~/.ssh',
    },

    {
      id: 'l05-m02',
      title: 'UNPROTECTED PRIVATE KEY FILE',
      goal: 'Ти полагодив права на ключ і каталог, і вхід за ключем нарешті працює.',
      xp: 190,
      theory: [
        {
          kind: 'text',
          text:
            'Це найчастіша помилка при роботі з SSH. Ключ скопіювали з іншої машини або витягли ' +
            'з архіву — і права стали `644`. OpenSSH бачить, що ключ доступний іншим, ' +
            'і **демонстративно його ігнорує**, навіть не пробуючи.',
        },
        {
          kind: 'text',
          text:
            'Заходять на сервер командою `ssh`, а кому й куди — пишуть одним словом ' +
            'через равлик: `ssh користувач@машина`. Ключ при цьому не вказують — ' +
            '`ssh` сам бере його з `~/.ssh`.',
        },
        {
          kind: 'code',
          lines: [
            'ssh deploy@app-01              # зайти під deploy на машину app-01',
            'ssh -i ~/.ssh/deploy_key deploy@app-01   # взяти конкретний ключ',
          ],
        },
        {
          kind: 'code',
          caption: 'Як виглядає відмова',
          lines: [
            "Permissions 0644 for '/home/deploy/.ssh/id_ed25519' are too open.",
            'This private key will be ignored.',
            'deploy@app-01: Permission denied (publickey).',
          ],
        },
        {
          kind: 'table',
          caption: 'Правильні права навколо SSH',
          rows: [
            ['~/.ssh', '700 — каталог відкриває лише власник'],
            ['id_ed25519', '600 — приватний ключ'],
            ['id_ed25519.pub', '644 — публічний, його можна читати всім'],
            ['authorized_keys', '600'],
          ],
        },
        {
          kind: 'note',
          text:
            'Права на **каталог** теж перевіряються. Якщо `~/.ssh` має 755, сервер відмовить із ' +
            '«bad ownership or modes for directory» — і повідомлення буде вже інше.',
        },
      ],
      task: {
        kind: 'terminal',
        boot: () =>
          makeMachine({
            user: 'deploy',
            dirs: [
              {
                path: '/home/deploy/.ssh',
                owner: 'deploy',
                group: 'deploy',
                mode: 0o755,
              },
            ],
            files: {
              '/home/deploy/.ssh/id_ed25519': {
                content:
                  '-----BEGIN OPENSSH PRIVATE KEY-----\nAAAAC3NzaC1lZDI1NTE5AAAAIRESTORED\n-----END OPENSSH PRIVATE KEY-----\n',
                mode: 0o644,
                owner: 'deploy',
                group: 'deploy',
              },
              '/home/deploy/.ssh/id_ed25519.pub': {
                content:
                  'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIRESTORED deploy@app-01\n',
                mode: 0o644,
                owner: 'deploy',
                group: 'deploy',
              },
              '/home/deploy/.ssh/authorized_keys': {
                content:
                  'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIRESTORED deploy@app-01\n',
                mode: 0o600,
                owner: 'deploy',
                group: 'deploy',
              },
              '/etc/ssh/sshd_config': {
                content: SSHD_CONFIG,
                owner: 'root',
                group: 'root',
              },
            },
          }),
        goals: [
          {
            id: 'tried',
            label: 'Спробувати зайти по ssh і побачити, як саме він відмовляє',
            hintOnFail:
              'Спробуй `ssh deploy@app-01` — прочитай текст помилки, він точний.',
            check: (s) => s.history.some((line) => /^ssh\b/.test(line.trim())),
          },
          {
            id: 'keyperms',
            label: 'Виставити приватному ключу права 600',
            check: (s) =>
              (getNode(s.fs, '/home/deploy/.ssh/id_ed25519')?.mode ?? 0) ===
              0o600,
          },
          {
            id: 'dirperms',
            label: 'Виставити каталогу ~/.ssh права 700',
            check: (s) =>
              (getNode(s.fs, '/home/deploy/.ssh')?.mode ?? 0) === 0o700,
          },
          {
            id: 'login',
            label: 'Успішно зайти по ssh після виправлення',
            hintOnFail:
              'Спробуй ssh ЩЕ РАЗ після зміни прав — ціль зараховується за успішним входом.',
            check: (s) => {
              const fixedAt = s.history.findIndex((line) =>
                /chmod\s+700/.test(line),
              );
              const lastSsh = s.history
                .map((line, index) => ({ line, index }))
                .filter(({ line }) => /^ssh\b/.test(line.trim()))
                .pop();
              return (
                fixedAt !== -1 &&
                lastSsh !== undefined &&
                lastSsh.index > fixedAt
              );
            },
          },
        ],
      },
      hints: [
        'Спершу просто спробуй зайти. Помилка сама скаже, що саме їй не подобається — прочитай її дослівно.',
        'Проблем дві: права на самому ключі та права на каталозі ~/.ssh. Ключ має бути 600, каталог — 700. Після виправлення спробуй ssh ще раз.',
        'ssh deploy@app-01\nchmod 600 ~/.ssh/id_ed25519\nchmod 700 ~/.ssh\nssh deploy@app-01',
      ],
      solution:
        'ssh deploy@app-01\nchmod 600 ~/.ssh/id_ed25519\nchmod 700 ~/.ssh\nssh deploy@app-01',
    },

    {
      id: 'l05-m03',
      title: 'Пускаємо CI на сервер',
      goal: 'Публічний ключ CI лежить в authorized_keys потрібного користувача.',
      xp: 180,
      theory: [
        {
          kind: 'text',
          text:
            '**CI** — це сервер, який сам збирає й розкочує твій код після кожної зміни ' +
            '(докладно про нього буде окремий рівень). Йому теж треба заходити на машину — ' +
            'і робить він це так само, ключем, тільки без людини за клавіатурою.',
        },
        {
          kind: 'text',
          text:
            'Щоб когось пустити на сервер, його **публічний** ключ дописують у файл ' +
            '`~/.ssh/authorized_keys` того користувача, під яким він заходитиме. Один ключ — один рядок.',
        },
        {
          kind: 'code',
          lines: [
            'ssh-copy-id -i ~/.ssh/ci_key.pub ci@app-01   # автоматично',
            'cat ~/.ssh/ci_key.pub >> ~/.ssh/authorized_keys   # вручну, тим самим',
          ],
        },
        {
          kind: 'note',
          text:
            'Тут `>>` критично важливий. Якщо написати `>`, ти **затреш** усі наявні ключі одним ' +
            'новим — і всі колеги втратять доступ. Це помилка, яку роблять рівно один раз.',
        },
      ],
      task: {
        kind: 'terminal',
        intro: [
          'CI-раннер прислав свій публічний ключ — він лежить у /tmp/ci_key.pub.',
          'У authorized_keys уже є ключі Alice і Bob. Вони мають там і лишитись.',
          '',
        ],
        boot: () =>
          makeMachine({
            user: 'deploy',
            users: [{ name: 'ci', groups: [] }],
            dirs: [
              {
                path: '/home/deploy/.ssh',
                owner: 'deploy',
                group: 'deploy',
                mode: 0o700,
              },
              { path: '/home/ci/.ssh', owner: 'ci', group: 'ci', mode: 0o700 },
            ],
            files: {
              '/home/deploy/.ssh/authorized_keys': {
                content:
                  'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAITEAMMATE alice@laptop\nssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAITEAMBOB bob@laptop\n',
                mode: 0o600,
                owner: 'deploy',
                group: 'deploy',
              },
              '/tmp/ci_key.pub': {
                content:
                  'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAICIRUNNER ci@github-actions\n',
                mode: 0o644,
                owner: 'deploy',
                group: 'deploy',
              },
              '/etc/ssh/sshd_config': {
                content: SSHD_CONFIG,
                owner: 'root',
                group: 'root',
              },
            },
          }),
        goals: [
          {
            id: 'added',
            label: 'Додати ключ CI у ~/.ssh/authorized_keys користувача deploy',
            check: (s) =>
              (
                readFile(s.fs, '/home/deploy/.ssh/authorized_keys') ?? ''
              ).includes('CIRUNNER'),
          },
          {
            id: 'kept',
            constraint: true,
            label: 'Ключі Alice і Bob, які там уже були, мають лишитись',
            hintOnFail:
              'Схоже, ти використав `>` замість `>>` — і затер чужі ключі. Натисни «Скинути».',
            check: (s) => {
              const keys =
                readFile(s.fs, '/home/deploy/.ssh/authorized_keys') ?? '';
              return keys.includes('TEAMMATE') && keys.includes('TEAMBOB');
            },
          },
          {
            id: 'perms',
            constraint: true,
            label: 'Файл authorized_keys має лишитися з правами 600',
            check: (s) =>
              (getNode(s.fs, '/home/deploy/.ssh/authorized_keys')?.mode ??
                0) === 0o600,
          },
        ],
      },
      hints: [
        'Ключ треба ДОПИСАТИ у файл, а не записати у файл. Це різні оператори перенаправлення.',
        '`cat /tmp/ci_key.pub >> ~/.ssh/authorized_keys` — дві стрілочки означають «додати в кінець».',
        'cat /tmp/ci_key.pub >> ~/.ssh/authorized_keys\ncat ~/.ssh/authorized_keys',
      ],
      solution:
        'cat /tmp/ci_key.pub >> ~/.ssh/authorized_keys\ncat ~/.ssh/authorized_keys',
    },

    {
      id: 'l05-m04',
      title: 'Замикаємо двері',
      goal: 'Сервер більше не пускає по паролю і не пускає root напряму.',
      xp: 200,
      theory: [
        {
          kind: 'text',
          text:
            'Будь-який сервер з публічним IP протягом години починають перебирати ботами: ' +
            '`root/123456`, `admin/admin`. Поки ввімкнений вхід за паролем, це питання часу.',
        },
        {
          kind: 'table',
          caption: 'Три рядки в /etc/ssh/sshd_config, що закривають 99% атак',
          rows: [
            ['PasswordAuthentication no', 'вхід лише за ключем'],
            ['PermitRootLogin no', 'root напряму не заходить взагалі'],
            ['PubkeyAuthentication yes', 'ключі увімкнені (має бути так)'],
          ],
        },
        {
          kind: 'note',
          text:
            'Порядок дій має значення: **спочатку** переконайся, що вхід за ключем працює, ' +
            'і лише **потім** вимикай пароль. Інакше можна замкнути себе ззовні. ' +
            'Після зміни конфіга потрібен `sudo systemctl restart sshd`.',
        },
      ],
      task: {
        kind: 'editor',
        filename: '/etc/ssh/sshd_config',
        language: 'ini',
        starter: SSHD_CONFIG,
        goals: [
          {
            id: 'password',
            label: 'Вимкнути автентифікацію за паролем',
            hintOnFail: 'Рядок PasswordAuthentication має закінчуватись на no.',
            check: (text) => /^\s*PasswordAuthentication\s+no\s*$/im.test(text),
          },
          {
            id: 'root',
            label: 'Заборонити прямий вхід під root',
            hintOnFail:
              'PermitRootLogin теж має бути no (варіант prohibit-password тут не приймається).',
            check: (text) => /^\s*PermitRootLogin\s+no\s*$/im.test(text),
          },
          {
            id: 'pubkey',
            constraint: true,
            label: 'Автентифікація за ключем має лишитись увімкненою',
            hintOnFail:
              'Якщо вимкнути і пароль, і ключі — на сервер не зайде ніхто. PubkeyAuthentication має бути yes.',
            check: (text) => /^\s*PubkeyAuthentication\s+yes\s*$/im.test(text),
          },
          {
            id: 'port',
            constraint: true,
            label: 'Порт має лишитись 22',
            check: (text) => /^\s*Port\s+22\s*$/im.test(text),
          },
        ],
      },
      hints: [
        'Треба змінити два значення з yes на no і переконатись, що третє лишилось yes.',
        'PasswordAuthentication → no, PermitRootLogin → no, PubkeyAuthentication лишається yes. Порт не чіпай.',
        'Port 22\nPermitRootLogin no\nPasswordAuthentication no\nPubkeyAuthentication yes',
      ],
      solution:
        '# /etc/ssh/sshd_config\nPort 22\nPermitRootLogin no\nPasswordAuthentication no\nPubkeyAuthentication yes\nAuthorizedKeysFile .ssh/authorized_keys\n\n# і не забути: sudo systemctl restart sshd',
    },
  ],
};
