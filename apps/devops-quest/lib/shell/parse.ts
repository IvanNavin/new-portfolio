/**
 * A small but honest shell parser: quotes, escapes, `$VAR` expansion, `~`,
 * pipes, `>` / `>>` / `2>` redirects and the `&&` / `||` / `;` separators.
 *
 * It deliberately stops short of subshells, globbing and here-docs — the
 * missions never need them, and a parser that pretends to support a feature
 * it gets wrong teaches worse habits than one that says "not supported".
 */

export type Redirect = {
  fd: 1 | 2;
  path: string;
  append: boolean;
};

export type SimpleCommand = {
  argv: string[];
  redirects: Redirect[];
};

export type Segment = {
  commands: SimpleCommand[];
  /** How this segment joins to the NEXT one. */
  next: '&&' | '||' | ';' | null;
};

export type ParseResult =
  { ok: true; segments: Segment[] } | { ok: false; error: string };

type Token =
  | { kind: 'word'; value: string }
  | { kind: 'op'; value: '|' | '>' | '>>' | '2>' | '2>>' | '&&' | '||' | ';' };

const OPERATORS = ['2>>', '2>', '>>', '&&', '||', '>', '|', ';'] as const;

const expand = (text: string, env: Record<string, string>): string =>
  text.replace(/\$\{(\w+)\}|\$(\w+)/g, (_, braced: string, bare: string) => {
    const name = braced ?? bare;
    return env[name] ?? '';
  });

const tokenize = (
  line: string,
  env: Record<string, string>,
  home: string,
): Token[] | string => {
  const tokens: Token[] = [];
  let current = '';
  let started = false; // distinguishes an empty quoted word from no word
  let i = 0;

  const push = () => {
    if (started) {
      tokens.push({ kind: 'word', value: current });
      current = '';
      started = false;
    }
  };

  while (i < line.length) {
    const ch = line[i];

    if (ch === ' ' || ch === '\t') {
      push();
      i += 1;
      continue;
    }

    if (ch === '\\') {
      if (i + 1 >= line.length) return 'unexpected end of input after \\';
      current += line[i + 1];
      started = true;
      i += 2;
      continue;
    }

    if (ch === "'") {
      const end = line.indexOf("'", i + 1);
      if (end === -1) return 'unterminated quote';
      current += line.slice(i + 1, end); // single quotes: no expansion
      started = true;
      i = end + 1;
      continue;
    }

    if (ch === '"') {
      const end = line.indexOf('"', i + 1);
      if (end === -1) return 'unterminated quote';
      current += expand(line.slice(i + 1, end), env);
      started = true;
      i = end + 1;
      continue;
    }

    const op = OPERATORS.find((candidate) => line.startsWith(candidate, i));
    if (op) {
      push();
      tokens.push({ kind: 'op', value: op });
      i += op.length;
      continue;
    }

    // Bare text run up to the next special character.
    let run = '';
    while (i < line.length) {
      const c = line[i];
      if (
        c === ' ' ||
        c === '\t' ||
        c === "'" ||
        c === '"' ||
        c === '\\' ||
        OPERATORS.some((candidate) => line.startsWith(candidate, i))
      ) {
        break;
      }
      run += c;
      i += 1;
    }
    if (!started && (run === '~' || run.startsWith('~/'))) {
      run = home + run.slice(1);
    }
    current += expand(run, env);
    started = true;
  }

  push();
  return tokens;
};

export const parseLine = (
  line: string,
  env: Record<string, string>,
  home: string,
): ParseResult => {
  const tokens = tokenize(line, env, home);
  if (typeof tokens === 'string') {
    return { ok: false, error: `bash: syntax error: ${tokens}` };
  }

  const segments: Segment[] = [];
  let commands: SimpleCommand[] = [];
  let command: SimpleCommand = { argv: [], redirects: [] };

  const endCommand = (): boolean => {
    if (command.argv.length === 0 && command.redirects.length === 0) {
      return false;
    }
    commands.push(command);
    command = { argv: [], redirects: [] };
    return true;
  };

  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];

    if (token.kind === 'word') {
      command.argv.push(token.value);
      continue;
    }

    if (token.value === '|') {
      if (!endCommand()) {
        return {
          ok: false,
          error: "bash: syntax error near unexpected token `|'",
        };
      }
      continue;
    }

    if (token.value === '&&' || token.value === '||' || token.value === ';') {
      endCommand();
      if (commands.length === 0) {
        return {
          ok: false,
          error: `bash: syntax error near unexpected token \`${token.value}'`,
        };
      }
      segments.push({ commands, next: token.value });
      commands = [];
      continue;
    }

    // Redirection: the next token must be a plain word (the target path).
    const target = tokens[i + 1];
    if (!target || target.kind !== 'word') {
      return {
        ok: false,
        error: "bash: syntax error near unexpected token `newline'",
      };
    }
    command.redirects.push({
      fd: token.value.startsWith('2') ? 2 : 1,
      path: target.value,
      append: token.value.endsWith('>>'),
    });
    i += 1;
  }

  endCommand();
  if (commands.length > 0) segments.push({ commands, next: null });

  return { ok: true, segments };
};
