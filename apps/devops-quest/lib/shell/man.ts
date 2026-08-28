/**
 * In-world documentation. `man` inside the terminal is how a player looks
 * something up without leaving the game — the same reflex a real engineer has.
 * Ukrainian description, English synopsis: exactly how the docs read in life.
 */
export type ManPage = {
  name: string;
  summary: string;
  synopsis: string[];
  options?: [string, string][];
  examples?: string[];
};

export const MANPAGES: Record<string, ManPage> = {
  pwd: {
    name: 'pwd',
    summary: 'Друкує абсолютний шлях поточного каталогу.',
    synopsis: ['pwd'],
  },
  printf: {
    name: 'printf',
    summary:
      'Друкує текст за форматом. На відміну від echo, розуміє \\n завжди.',
    synopsis: ['printf FORMAT [ARG]...'],
    options: [['%s', 'підставити наступний аргумент']],
    examples: [
      'printf "%s=%s\\n" APP_ENV production',
      'printf ".env\\n*.log\\n" > .gitignore',
    ],
  },
  ls: {
    name: 'ls',
    summary: 'Показує вміст каталогу.',
    synopsis: ['ls [OPTION]... [FILE]...'],
    options: [
      ['-l', 'довгий формат: права, власник, група, розмір'],
      ['-a', 'показати й приховані файли (ті, що починаються з крапки)'],
      ['-la', 'обидва разом — найчастіша комбінація'],
    ],
    examples: ['ls -la /etc', 'ls /var/log'],
  },
  cd: {
    name: 'cd',
    summary: 'Змінює поточний каталог.',
    synopsis: ['cd [DIR]'],
    examples: ['cd /var/log', 'cd ..', 'cd ~', 'cd -'],
  },
  cat: {
    name: 'cat',
    summary: 'Виводить вміст файлу.',
    synopsis: ['cat FILE...'],
    examples: ['cat /etc/passwd'],
  },
  echo: {
    name: 'echo',
    summary:
      'Друкує рядок. У парі з > або >> — найпростіший спосіб створити файл.',
    synopsis: ['echo [-n] STRING'],
    examples: ['echo "hello" > note.txt', 'echo "another line" >> note.txt'],
  },
  mkdir: {
    name: 'mkdir',
    summary: 'Створює каталог.',
    synopsis: ['mkdir [-p] DIR...'],
    options: [
      ['-p', 'створити й усі проміжні каталоги, не сваритись якщо вже є'],
    ],
    examples: ['mkdir -p /srv/app/releases'],
  },
  touch: {
    name: 'touch',
    summary: 'Створює порожній файл (або оновлює час доступу існуючого).',
    synopsis: ['touch FILE...'],
  },
  rm: {
    name: 'rm',
    summary:
      'Видаляє файли та каталоги. Кошика немає — видалене зникає назавжди.',
    synopsis: ['rm [-r] [-f] FILE...'],
    options: [
      ['-r', 'рекурсивно, для каталогів'],
      ['-f', 'не питати й не скаржитись на відсутні файли'],
    ],
  },
  cp: {
    name: 'cp',
    summary: 'Копіює файли та каталоги.',
    synopsis: ['cp [-r] SOURCE... DEST'],
    options: [['-r', 'рекурсивно, для каталогів']],
  },
  mv: {
    name: 'mv',
    summary: 'Переміщує або перейменовує.',
    synopsis: ['mv SOURCE... DEST'],
  },
  grep: {
    name: 'grep',
    summary: 'Шукає рядки за шаблоном. Головний інструмент розбору логів.',
    synopsis: ['grep [OPTION]... PATTERN [FILE]...'],
    options: [
      ['-i', 'ігнорувати регістр'],
      ['-n', 'показати номери рядків'],
      ['-v', 'інвертувати: показати те, що НЕ збігається'],
      ['-r', 'рекурсивно по каталогу'],
      ['-c', 'лише кількість збігів'],
    ],
    examples: [
      'grep -n ERROR /var/log/app.log',
      'cat access.log | grep " 500 "',
    ],
  },
  find: {
    name: 'find',
    summary: 'Шукає файли по дереву за іменем, типом чи правами.',
    synopsis: ['find PATH [-name PATTERN] [-type f|d] [-perm MODE]'],
    examples: [
      'find /etc -name "*.conf"',
      'find /home -type d',
      'find . -perm 600',
    ],
  },
  head: {
    name: 'head',
    summary: 'Перші N рядків (типово 10).',
    synopsis: ['head [-n N] [FILE]'],
  },
  tail: {
    name: 'tail',
    summary: 'Останні N рядків. Для логів — те, що треба.',
    synopsis: ['tail [-n N] [FILE]'],
    examples: ['tail -n 20 /var/log/nginx/error.log'],
  },
  wc: {
    name: 'wc',
    summary: 'Рахує рядки, слова, символи.',
    synopsis: ['wc [-l] [-w] [-c] [FILE]'],
    options: [['-l', 'лише кількість рядків — найчастіший режим']],
  },
  chmod: {
    name: 'chmod',
    summary: 'Змінює права доступу.',
    synopsis: ['chmod [-R] MODE FILE...'],
    options: [
      ['755', 'вісімковий запис: rwx для власника, r-x для групи та інших'],
      ['600', 'rw- лише власнику — так мають лежати ключі й .env'],
      ['u+x', 'символьний запис: додати власнику право на виконання'],
      ['-R', 'рекурсивно'],
    ],
    examples: ['chmod 600 ~/.ssh/id_ed25519', 'chmod +x deploy.sh'],
  },
  chown: {
    name: 'chown',
    summary: 'Змінює власника та групу. Потребує root.',
    synopsis: ['chown [-R] USER[:GROUP] FILE...'],
    examples: ['sudo chown -R deploy:deploy /srv/app'],
  },
  useradd: {
    name: 'useradd',
    summary: 'Створює користувача.',
    synopsis: ['useradd [-m] [-s SHELL] [-G GROUPS] NAME'],
    options: [
      ['-m', 'створити домашній каталог'],
      ['-s', 'оболонка за замовчуванням'],
      ['-G', 'додаткові групи через кому'],
    ],
  },
  usermod: {
    name: 'usermod',
    summary: 'Змінює вже наявного користувача.',
    synopsis: ['usermod [-aG GROUPS] NAME'],
    options: [
      ['-G', 'встановити список додаткових груп'],
      [
        '-a',
        'ДОДАТИ до списку, а не замінити його. Без -a решта груп губиться.',
      ],
    ],
    examples: ['sudo usermod -aG docker deploy'],
  },
  id: {
    name: 'id',
    summary: 'Показує uid, gid та групи користувача.',
    synopsis: ['id [USER]'],
  },
  ps: {
    name: 'ps',
    summary: 'Список процесів.',
    synopsis: ['ps aux'],
    examples: ['ps aux | grep nginx'],
  },
  kill: {
    name: 'kill',
    summary:
      'Надсилає процесу сигнал. Типово TERM (ввічливо), -9 = KILL (грубо).',
    synopsis: ['kill [-9|-15|-HUP] PID'],
    examples: ['kill 1421', 'kill -9 1421'],
  },
  systemctl: {
    name: 'systemctl',
    summary: 'Керує сервісами systemd.',
    synopsis: ['systemctl {status|start|stop|restart|enable|disable} UNIT'],
    options: [
      ['start', 'запустити зараз'],
      ['enable', 'запускати автоматично після ребуту (зараз НЕ запускає)'],
      ['enable --now', 'і те, і те'],
    ],
    examples: ['sudo systemctl restart nginx', 'systemctl status nginx'],
  },
  journalctl: {
    name: 'journalctl',
    summary: 'Читає журнал systemd.',
    synopsis: ['journalctl -u UNIT [-n N]'],
    examples: ['journalctl -u nginx -n 20'],
  },
  curl: {
    name: 'curl',
    summary: 'HTTP-клієнт у терміналі.',
    synopsis: ['curl [-I] [-X METHOD] [-H HEADER] [-d DATA] URL'],
    options: [
      ['-I', 'лише заголовки відповіді (HEAD)'],
      ['-i', 'заголовки разом із тілом'],
      ['-X', 'метод: GET, POST, PUT, DELETE'],
      ['-H', 'додати заголовок'],
    ],
    examples: [
      'curl -I https://shop.internal',
      'curl -X POST -d "a=1" http://localhost:3000/api',
    ],
  },
  dig: {
    name: 'dig',
    summary: 'Питає DNS. Показує, у що насправді резолвиться імʼя.',
    synopsis: ['dig [+short] NAME [TYPE]'],
    examples: ['dig shop.internal A', 'dig +short api.internal CNAME'],
  },
  ss: {
    name: 'ss',
    summary:
      'Показує сокети. Без прапорців — встановлені зʼєднання; слухачів дає -l.',
    synopsis: ['ss [-t] [-u] [-l] [-p] [-n]'],
    options: [
      ['-t', 'TCP'],
      ['-u', 'UDP'],
      ['-l', 'лише ті, що СЛУХАЮТЬ. Без нього слухачів не буде видно'],
      ['-p', 'показати процес і його pid'],
      ['-n', 'числа замість назв: 80, а не "http"'],
    ],
    examples: [
      'ss -tulpn          # усі пʼять прапорців разом — робоча комбінація',
      'ss -tulpn | grep 443',
    ],
  },
  ssh: {
    name: 'ssh',
    summary: 'Заходить на віддалений сервер.',
    synopsis: ['ssh [-i KEY] [-p PORT] USER@HOST'],
    examples: ['ssh deploy@app-01', 'ssh -i ~/.ssh/id_ed25519 deploy@10.0.0.5'],
  },
  'ssh-keygen': {
    name: 'ssh-keygen',
    summary: 'Генерує пару SSH-ключів.',
    synopsis: ['ssh-keygen -t ed25519 -C "comment" -f PATH'],
    options: [
      ['-t', 'тип ключа; ed25519 — сучасний вибір'],
      ['-f', 'куди покласти приватний ключ'],
      ['-C', 'коментар, зазвичай пошта'],
    ],
  },
  git: {
    name: 'git',
    summary: 'Система контролю версій.',
    synopsis: ['git <command> [args]'],
    options: [
      ['status', 'що змінено і що в індексі'],
      ['add', 'покласти зміни в індекс'],
      ['commit -m', 'зафіксувати індекс'],
      ['log --oneline', 'історія стисло'],
      [
        'revert',
        'НОВИЙ коміт, що скасовує старий — безпечно для спільної гілки',
      ],
      ['reset --hard', 'переписує історію — небезпечно, якщо вже запушено'],
    ],
  },
  docker: {
    name: 'docker',
    summary: 'Керує контейнерами й образами.',
    synopsis: ['docker <command> [args]'],
    options: [
      ['build -t NAME .', 'зібрати образ із Dockerfile'],
      ['run -d -p H:C IMAGE', 'запустити контейнер у фоні з пробросом порту'],
      ['ps [-a]', 'контейнери; -a — разом із зупиненими'],
      ['logs NAME', 'логи контейнера'],
      ['exec -it NAME sh', 'зайти всередину працюючого контейнера'],
    ],
  },
  kubectl: {
    name: 'kubectl',
    summary: 'Клієнт Kubernetes API.',
    synopsis: ['kubectl <command> [TYPE] [NAME] [flags]'],
    options: [
      ['get pods', 'список подів'],
      [
        'describe pod NAME',
        'детально + події — перше, що дивляться при аварії',
      ],
      ['logs NAME', 'логи пода'],
      ['apply -f FILE', 'застосувати маніфест'],
      ['rollout undo deployment/NAME', 'відкотити реліз'],
    ],
  },
  terraform: {
    name: 'terraform',
    summary: 'Infrastructure as Code: описує інфраструктуру файлами.',
    synopsis: ['terraform {init|plan|apply|destroy}'],
    options: [
      ['init', 'підтягнути провайдери'],
      ['plan', 'показати, що зміниться — НІЧОГО не міняє'],
      ['apply', 'застосувати зміни'],
    ],
  },
  nginx: {
    name: 'nginx',
    summary: 'Веб-сервер і reverse proxy.',
    synopsis: ['nginx -t', 'nginx -s reload'],
    options: [
      ['-t', 'перевірити конфіг, нічого не застосовуючи'],
      ['-s reload', 'перечитати конфіг без розриву зʼєднань'],
    ],
  },
};

export const renderManPage = (page: ManPage): string => {
  const lines = [
    `${page.name.toUpperCase()}(1)`,
    '',
    'NAME',
    `    ${page.name} — ${page.summary}`,
    '',
    'SYNOPSIS',
    ...page.synopsis.map((line) => `    ${line}`),
  ];
  if (page.options?.length) {
    lines.push('', 'OPTIONS');
    for (const [flag, description] of page.options) {
      lines.push(`    ${flag.padEnd(14)} ${description}`);
    }
  }
  if (page.examples?.length) {
    lines.push('', 'EXAMPLES');
    lines.push(...page.examples.map((line) => `    ${line}`));
  }
  return lines.join('\n');
};
