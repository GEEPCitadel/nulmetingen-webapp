// Fase 3 — selectielogica meetmoment: de voortgangsmeting gebruikt per variabel
// slot de bankvariant (parallelVariantItems) en de PT9-postervorm; ankers blijven
// identiek aan de nulmeting.
import { describe, expect, it } from "vitest";
import {
  assessmentMap,
  assessmentMapForMoment,
  voortgangsAssessmentMap,
} from "../data/assessments.server";
import selectedResponseSource from "../../nulmetingen_selected_response_herontwerp_v3.json";
import type { AssessmentItem, AssessmentVersion, AssessmentVersionId } from "../types";

const versionIds: AssessmentVersionId[] = ["lj1-vmbo", "lj1-hv", "lj3-vmbo", "lj3-hv"];

type BankItem = { itemVersion?: string; parallelTo?: string; targetGroup?: string };
const bank = (
  selectedResponseSource as unknown as { parallelVariantItems?: BankItem[] }
).parallelVariantItems ?? [];

const flatItems = (assessment: AssessmentVersion): AssessmentItem[] =>
  assessment.sections.flatMap((section) => section.items);

const isVariable = (item: AssessmentItem) =>
  item.anchorStatus === "variable" || item.anchorStatus === "variable-slot";

describe("meetmoment-selectie (fase 3)", () => {
  it("levert voor elk meetmoment alle vier de versies", () => {
    for (const versionId of versionIds) {
      expect(assessmentMap[versionId]).toBeDefined();
      expect(voortgangsAssessmentMap[versionId]).toBeDefined();
    }
  });

  it("kiest de juiste map per meetmoment; ontbrekend moment = nulmeting", () => {
    expect(assessmentMapForMoment("nulmeting")).toBe(assessmentMap);
    expect(assessmentMapForMoment("voortgangsmeting")).toBe(voortgangsAssessmentMap);
    expect(assessmentMapForMoment(undefined)).toBe(assessmentMap);
  });

  for (const versionId of versionIds) {
    describe(versionId, () => {
      const nul = assessmentMap[versionId];
      const voortgang = voortgangsAssessmentMap[versionId];
      const nulItems = flatItems(nul);
      const voortgangItems = flatItems(voortgang);

      it("heeft gelijke maxScore en gelijk aantal items in beide vormen", () => {
        expect(voortgang.maxScore).toBe(nul.maxScore);
        expect(voortgangItems.length).toBe(nulItems.length);
      });

      it("houdt ankeritems identiek tussen nulmeting en voortgangsmeting", () => {
        nulItems.forEach((nulItem, index) => {
          const voortgangItem = voortgangItems[index];
          if (isVariable(nulItem) || nulItem.id.startsWith("pt9")) {
            return;
          }
          expect(voortgangItem.id).toBe(nulItem.id);
          expect(voortgangItem.itemVersion).toBe(nulItem.itemVersion);
          expect(voortgangItem.points).toBe(nulItem.points);
        });
      });

      it("vervangt elk variabel slot door de juiste bankvariant", () => {
        const variableSlots = nulItems
          .map((item, index) => ({ item, index }))
          .filter(({ item }) => isVariable(item));
        // 4 SR-slots + 2 mini-PT's per versie.
        expect(variableSlots.length).toBe(6);

        for (const { item, index } of variableSlots) {
          const voortgangItem = voortgangItems[index];
          expect(voortgangItem.itemVersion).not.toBe(item.itemVersion);
          expect(voortgangItem.internalSlot).toBe(item.internalSlot);
          expect(voortgangItem.points).toBe(item.points);
          expect(voortgangItem.subgoal).toBe(item.subgoal);

          const bankVariant = bank.find(
            (candidate) =>
              candidate.targetGroup === versionId &&
              candidate.parallelTo === item.itemVersion,
          );
          expect(bankVariant?.itemVersion).toBe(voortgangItem.itemVersion);
        }
      });

      it("gebruikt PT9-slidevorm bij nulmeting en postervorm bij voortgangsmeting", () => {
        const nulPt9 = nulItems.find((item) => item.type === "powerpoint_design_task");
        const voortgangPt9 = voortgangItems.find(
          (item) => item.type === "powerpoint_design_task",
        );
        expect(nulPt9?.itemVersion).toContain("slide");
        expect(voortgangPt9?.itemVersion).toContain("poster");
        expect(voortgangPt9?.points).toBe(nulPt9?.points);
      });
    });
  }
});
