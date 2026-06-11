import { describe, expect, it } from "vitest";
import source from "../../nulmetingen_selected_response_herontwerp_v3.json";

// Fase 2 — leesbaarheidscheck (taligheidsnorm, toetsmatrijs regel 4):
// - 3–4 inhoudelijke opties + "Ik weet het niet" als laatste optie
// - opties <= ~10 woorden (harde grens 12)
// - stam <= 2 korte zinnen (plus eventueel een losse vraagzin; harde grens 3 zinnen)
// - geen ontkenningen ("niet", "geen") in de stam

type JsonOption = {
  text?: string;
  label?: string;
  isUnknownOption?: boolean;
  unknown?: boolean;
};

type JsonSubQuestion = {
  id: string;
  question: string;
  options: JsonOption[];
};

type JsonItem = {
  id: string;
  itemType?: string;
  itemVersion?: string;
  question: string;
  options?: JsonOption[];
  subQuestions?: JsonSubQuestion[];
};

const typedSource = source as {
  selectedResponseItems: JsonItem[];
  parallelVariantItems?: JsonItem[];
};
// Actieve SR-items én parallelvarianten (itembank voortgangsmeting) moeten
// allebei aan de taligheidsnorm voldoen.
const items = [...typedSource.selectedResponseItems, ...(typedSource.parallelVariantItems ?? [])];

const MAX_OPTION_WORDS = 12;
// Vraag 9 (mini-PT AI) toont AI-prompts en handelingen als opties; dat is een ander
// genre dan een gewone antwoordoptie en krijgt daarom een ruimere woordgrens.
const MAX_PROMPT_OPTION_WORDS = 25;
const MAX_STEM_SENTENCES = 3;

const stripQuotes = (text: string) => text.replace(/[“"„'’][^“”"„'’]*[”"'’]/g, "QUOTE");

const sentenceCount = (text: string) =>
  stripQuotes(text)
    .split(/[.!?]+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0).length;

const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

const isUnknown = (option: JsonOption) =>
  option.isUnknownOption === true ||
  option.unknown === true ||
  String(option.text ?? option.label ?? "")
    .trim()
    .replace(/\.$/, "") === "Ik weet het niet";

const hasNegation = (text: string) => /\b(niet|geen|nooit)\b/i.test(stripQuotes(text));

const optionGroups = (item: JsonItem) =>
  item.subQuestions?.length
    ? item.subQuestions.map((sub) => ({
        id: `${item.id}:${sub.id}`,
        question: sub.question,
        options: sub.options,
      }))
    : [{ id: item.id, question: item.question, options: item.options ?? [] }];

describe("leesbaarheid selected-response-items (taligheidsnorm)", () => {
  it.each(items.map((item) => [item.id, item] as const))(
    "%s voldoet aan de taligheidsnorm",
    (_id, item) => {
      expect(sentenceCount(item.question), `stam van ${item.id} heeft te veel zinnen`).toBeLessThanOrEqual(
        MAX_STEM_SENTENCES,
      );
      expect(hasNegation(item.question), `stam van ${item.id} bevat een ontkenning`).toBe(false);

      for (const group of optionGroups(item)) {
        if (group.question !== item.question) {
          expect(
            sentenceCount(group.question),
            `stam van ${group.id} heeft te veel zinnen`,
          ).toBeLessThanOrEqual(MAX_STEM_SENTENCES);
          expect(hasNegation(group.question), `stam van ${group.id} bevat een ontkenning`).toBe(false);
        }

        const content = group.options.filter((option) => !isUnknown(option));
        expect(content.length, `${group.id} heeft geen 3-4 inhoudelijke opties`).toBeGreaterThanOrEqual(3);
        expect(content.length, `${group.id} heeft geen 3-4 inhoudelijke opties`).toBeLessThanOrEqual(4);

        const last = group.options[group.options.length - 1];
        expect(isUnknown(last), `${group.id}: laatste optie is geen weet-niet-optie`).toBe(true);

        const maxWords = item.itemVersion?.startsWith("vraag9-ai")
          ? MAX_PROMPT_OPTION_WORDS
          : MAX_OPTION_WORDS;
        for (const option of content) {
          const text = String(option.text ?? option.label ?? "");
          expect(
            wordCount(text),
            `${group.id}: optie te lang (${wordCount(text)} woorden): "${text}"`,
          ).toBeLessThanOrEqual(maxWords);
        }
      }
    },
  );
});
