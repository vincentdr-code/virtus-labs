import { describe, it, expect } from "vitest";
import { cn, formatCurrency, formatDate, slugify } from "./utils";

describe("formatCurrency", () => {
  it("formats whole-dollar USD without cents", () => {
    expect(formatCurrency(45000)).toBe("$45,000");
  });
  it("returns em dash for null and undefined", () => {
    expect(formatCurrency(null)).toBe("—");
    expect(formatCurrency(undefined)).toBe("—");
  });
  it("formats zero as $0", () => {
    expect(formatCurrency(0)).toBe("$0");
  });
});

describe("formatDate", () => {
  it("formats a Date object", () => {
    expect(formatDate(new Date("2026-09-01T12:00:00Z"))).toMatch(
      /Sep 1, 2026|Aug 31, 2026/ // timezone-dependent day boundary
    );
  });
  it("formats an ISO string", () => {
    expect(formatDate("2026-01-15T12:00:00Z")).toMatch(/Jan 1[45], 2026/);
  });
  it("returns em dash for null and undefined", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate(undefined)).toBe("—");
  });
});

describe("slugify", () => {
  it("lowercases and hyphenates spaces", () => {
    expect(slugify("Medical Device Manufacturing")).toBe(
      "medical-device-manufacturing"
    );
  });
  it("strips non-alphanumerics and collapses hyphens", () => {
    expect(slugify("MEP / AEC")).toBe("mep-aec");
  });
  it("trims leading/trailing hyphens", () => {
    expect(slugify("  hello world  ")).toBe("hello-world");
  });
});

describe("cn", () => {
  it("merges conflicting tailwind classes, last wins", () => {
    expect(cn("p-4", "p-2")).toBe("p-2");
  });
  it("drops falsy values", () => {
    expect(cn("a", false && "b", undefined, "c")).toBe("a c");
  });
});
