import { describe, expect, it } from "vitest";
import { shouldMarkNew } from "../server/services/ai";

const strongQuality = {
  qualityScore: 86,
  evidenceCount: 2,
  communitySource: false,
  sourceReliability: "trusted" as const
};

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
        new Date().toISOString(),
        strongQuality
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
        new Date().toISOString(),
        strongQuality
      )
    ).toBe(false);
  });

  it("does not mark low quality items as new", () => {
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
        new Date().toISOString(),
        { ...strongQuality, qualityScore: 62 }
      )
    ).toBe(false);
  });

  it("does not mark single-source community items as new by default", () => {
    expect(
      shouldMarkNew(
        {
          relevanceScore: 88,
          credibilityScore: 78,
          noveltyScore: 75,
          hotnessScore: 82,
          isImpersonationLikely: false,
          summary: "summary",
          reason: "reason",
          recommendedAction: "notify"
        },
        new Date().toISOString(),
        { qualityScore: 86, evidenceCount: 1, communitySource: true, sourceReliability: "community" }
      )
    ).toBe(false);
  });
});
