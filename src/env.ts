import { defineEnvVars } from "@sveltejs/kit/env";

export const variables = defineEnvVars({
  DATABASE_URL: {
    description: "MySQL connection string, e.g. mysql://user:pass@host:3306/db",
    // optional at build time; getCore() fails loudly when it is missing at runtime
    schema: (value) => value || undefined,
  },
});
