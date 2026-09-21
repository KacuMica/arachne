const reset = "\x1b[0m";
const bold = "\x1b[1m";
const dim = "\x1b[2m";
const purple = "\x1b[38;5;141m";
const brightPurple = "\x1b[38;5;177m";
const muted = "\x1b[38;5;103m";
const green = "\x1b[38;5;78m";
const red = "\x1b[38;5;203m";
export const paint = {
    purple: (text) => `${purple}${text}${reset}`,
    bright: (text) => `${brightPurple}${bold}${text}${reset}`,
    muted: (text) => `${muted}${text}${reset}`,
    dim: (text) => `${dim}${text}${reset}`,
    ok: (text) => `${green}${text}${reset}`,
    error: (text) => `${red}${text}${reset}`,
    bold: (text) => `${bold}${text}${reset}`
};
export const logo = () => paint.bright(`
     _    ____      _    ____ _   _ _   _ _____
    / \\  |  _ \\    / \\  / ___| | | | \\ | | ____|
   / _ \\ | |_) |  / _ \\| |   | |_| |  \\|  _|
  / ___ \\|  _ <  / ___ \\ |___|  _  | |\\  | |___
 /_/   \\_\\_| \\_\\/_/   \\_\\____|_| |_|_| \\_|_____|
`);
export const divider = () => paint.purple("─".repeat(Math.max(44, Math.min(process.stdout.columns || 72, 96))));
//# sourceMappingURL=theme.js.map