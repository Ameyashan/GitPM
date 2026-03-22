import { describe, expect, it } from "vitest";

import { generateSlug, generateUniqueSlug, isValidUsername } from "@/lib/validation";

describe("isValidUsername", () => {
  it("accepts alphanumeric, hyphen, underscore within length", () => {
    expect(isValidUsername("ab1")).toBe(true);
    expect(isValidUsername("user_name")).toBe(true);
    expect(isValidUsername("user-name")).toBe(true);
  });

  it("rejects uppercase and spaces", () => {
    expect(isValidUsername("User")).toBe(false);
    expect(isValidUsername("a b")).toBe(false);
  });

  it("enforces length 3–30", () => {
    expect(isValidUsername("ab")).toBe(false);
    expect(isValidUsername("a".repeat(31))).toBe(false);
  });
});

describe("generateSlug", () => {
  it("lowercases and replaces non-alphanumeric runs with hyphens", () => {
    expect(generateSlug("My Cool App!")).toBe("my-cool-app");
  });

  it("trims leading and trailing hyphens", () => {
    expect(generateSlug("  ---Hello---  ")).toBe("hello");
  });
});

describe("generateUniqueSlug", () => {
  it("returns base when unused", () => {
    expect(generateUniqueSlug("my-app", new Set(["other"]))).toBe("my-app");
  });

  it("appends -2, -3 when base slug is taken", () => {
    const taken = new Set(["my-app", "my-app-2"]);
    expect(generateUniqueSlug("my-app", taken)).toBe("my-app-3");
  });
});
