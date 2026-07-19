// Functions returning command strings ignore the staged-file paths
// that lint-staged would otherwise append. Required because turbo
// >=2.9 treats positional args as task names.
const fs = require("fs");

module.exports = {
  "*.{js,jsx,ts,tsx}": () => [
    "turbo run lint --filter='apps/**' -- --fix",
    "turbo run lint --filter='packages/**' -- --fix",
    "turbo run lint --filter='apps/**'",
    "turbo run lint --filter='packages/**'",
  ],
  // Skip symlinks (e.g. CLAUDE.md -> AGENTS.md): prettier errors out when an
  // explicitly-passed path is a symbolic link, which would fail the whole hook.
  "*.{js,jsx,ts,tsx,json,md}": (files) => {
    const real = files.filter((f) => !fs.lstatSync(f).isSymbolicLink());
    if (real.length === 0) return [];
    return `prettier --write ${real.map((f) => JSON.stringify(f)).join(" ")}`;
  },
};
