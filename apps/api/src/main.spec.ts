import test from "node:test";
import assert from "node:assert/strict";

import { loadEnv } from "./config/env";

test("loadEnv returns default port", () => {
  const env = loadEnv({});
  assert.equal(env.port, 4000);
});

