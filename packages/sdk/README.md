# MiniTrigger SDK

Install the SDK:

```sh
pnpm add @minitrigger/sdk
```

Create an API key in the MiniTrigger dashboard, then verify it when your app
starts:

```ts
import { MiniTrigger } from "@minitrigger/sdk";

const minitrigger = new MiniTrigger({
  apiKey: process.env.MINITRIGGER_API_KEY!,
  // Omit this when using the local server on http://localhost:5000.
  baseUrl: process.env.MINITRIGGER_API_URL,
});

const auth = await minitrigger.authenticate();
console.log(`Authenticated for ${auth.project.name} (${auth.environment.type})`);
```

Use the SDK in trusted server-side code only. An API key must not be embedded in
a browser bundle or committed to source control.

`authenticate()` (or its `verify()` alias) is the only API for now. Job
registration and execution APIs will be added separately.
