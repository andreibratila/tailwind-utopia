const validOptions = ["dist", "configPath"];

export function parseArgs(args) {
  const parsed = {};

  args.forEach((arg) => {
    if (arg.includes("=")) {
      const [key, value] = arg.split("=");

      // Solo guardamos si la clave es válida
      if (validOptions.includes(key)) {
        parsed[key] = value;
      }
    }
  });

  return parsed;
}
