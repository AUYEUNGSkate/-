import { describe, expect, it } from "vitest";
import { shouldMarkNew } from "../server/services/ai";

describe("AI threshold", () => {
  it("marks high confidence recent items as new", () => {
    expect(
      shouldMarkNew(
        {
          relevanceScore: 88,
          credibilityScore: 80,
          noveltyScore: 75,
          hotnessScore: 82,
          isImpersonationLikely: false,
          summary: "summary",
          reason: "reason",
          recommendedAction: "notify"
        },
        new Date().toISOString()
      )
    ).toBe(true);
  });

  it("does not mark impersonation risks as new", () => {
    expect(
      shouldMarkNew(
        {
          relevanceScore: 95,
          credibilityScore: 90,
          noveltyScore: 90,
          hotnessScore: 90,
          isImpersonationLikely: true,
          summary: "summary",
          reason: "reason",
          recommendedAction: "notify"
        },
        new Date().toISOString()
      )
    ).toBe(false);
  });
});
