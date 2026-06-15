import { describe, expect, it } from "vitest";
import { getCityDerivedStatus, getLandmarkStatus, getTravelReadiness } from "./progressSelectors";

describe("progress selectors", () => {
  it("derives in-progress Chengdu from the mock progress data", () => {
    expect(getCityDerivedStatus("city_chengdu")).toBe("inProgress");
  });

  it("keeps preview cities as preview", () => {
    expect(getCityDerivedStatus("city_dunhuang")).toBe("preview");
  });

  it("locks dependent landmarks until their prerequisite is complete", () => {
    expect(getLandmarkStatus("lm_chengdu_hotpot")).toBe("locked");
  });

  it("derives travel readiness from unlocked readiness items", () => {
    expect(getTravelReadiness()).toBe(24);
  });
});
