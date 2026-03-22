import { describe, expect, it } from "vitest";

import { parseTechStack } from "@/lib/github";

describe("parseTechStack", () => {
  it("returns recognized frameworks from dependencies and devDependencies", () => {
    expect(
      parseTechStack({
        dependencies: { next: "14.0.0", react: "18.0.0", "unknown-lib": "1.0.0" },
        devDependencies: { tailwindcss: "3.0.0" },
      })
    ).toEqual(expect.arrayContaining(["next", "react", "tailwindcss"]));
  });

  it("matches scoped packages like @radix-ui/react via @next/ pattern for next", () => {
    expect(
      parseTechStack({
        dependencies: { "@next/something": "1.0.0" },
      })
    ).toContain("next");
  });

  it("returns empty array for empty package object", () => {
    expect(parseTechStack({})).toEqual([]);
  });

  it("handles missing dependencies and devDependencies", () => {
    expect(parseTechStack({ dependencies: undefined, devDependencies: undefined })).toEqual([]);
  });

  it("ignores unknown dependency names", () => {
    expect(
      parseTechStack({
        dependencies: { "my-private-package": "1.0.0" },
      })
    ).toEqual([]);
  });
});
