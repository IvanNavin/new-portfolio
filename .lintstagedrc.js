// Functions returning command strings ignore the staged-file paths
// that lint-staged would otherwise append. Required because turbo
// >=2.9 treats positional args as task names.
module.exports = {
  "*.{js,jsx,ts,tsx}": () => [
    "turbo run lint --filter='apps/**' -- --fix",
    "turbo run lint --filter='packages/**' -- --fix",
    "turbo run lint --filter='apps/**'",
    "turbo run lint --filter='packages/**'",
  ],
  "*.{js,jsx,ts,tsx,json,md}": (files) =>
    `prettier --write ${files.map((f) => JSON.stringify(f)).join(" ")}`,
};
