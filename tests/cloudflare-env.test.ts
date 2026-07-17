import { afterEach, describe, expect, it, vi } from "vitest";

describe("Cloudflare environment bindings", () => {
  afterEach(() => {
    vi.resetModules();
  });

  it("initializes the Turso client from Worker bindings", async () => {
    const { initEnv } = await import("../server/config/env");
    initEnv({
      TURSO_URL: "libsql://hotpulse-test.turso.io",
      TURSO_AUTH_TOKEN: "test-token"
    });

    const { getTursoClient } = await import("../server/db/turso");
    expect(() => getTursoClient()).not.toThrow();
  });
});
