import { defaultCodeMappings } from "../data/assessments";
import type { AssessmentSession, CodeMapping } from "../types";

const SESSION_KEY = "citadel-nulmetingen-engine-active-session";
const CODE_KEY = "citadel-nulmetingen-engine-code-mappings";

type StoredCodeMapping = CodeMapping & { code?: string };

const safeRead = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

export const readActiveSession = (): AssessmentSession | null => {
  const session = safeRead<AssessmentSession | null>(SESSION_KEY, null);
  if (!session) {
    return null;
  }

  return {
    ...session,
    metadata: {
      ...(session.metadata ?? { anonymousCode: session.accessCode || session.id }),
      anonymousAttemptId:
        session.metadata?.anonymousAttemptId ?? session.metadata?.anonymousCode ?? session.id,
    },
    accessCode: session.accessCode ?? session.metadata?.classToken ?? session.id,
    results: session.results ?? [],
    eventLogs: session.eventLogs ?? [],
  };
};

export const saveActiveSession = (session: AssessmentSession | null) => {
  if (!session) {
    localStorage.removeItem(SESSION_KEY);
    return;
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const readCodeMappings = (): CodeMapping[] => {
  const storedMappings = safeRead<StoredCodeMapping[]>(CODE_KEY, []);
  if (storedMappings.length === 0) {
    return defaultCodeMappings;
  }

  const mergedMappings = defaultCodeMappings.map((fallback) => {
    const match = storedMappings.find(
      (mapping) => mapping.instrumentId === fallback.instrumentId,
    );
    const storedCodes = match
      ? Array.isArray(match.codes) && match.codes.length > 0
        ? match.codes
        : match.code
          ? [match.code]
          : []
      : [];
    const mergedCodes = Array.from(new Set([...fallback.codes, ...storedCodes]));
    return match
      ? {
          ...fallback,
          codes: mergedCodes,
        }
      : fallback;
  });

  const normalizedCodes = mergedMappings.flatMap((mapping) =>
    mapping.codes.map((code) => code.trim().toLowerCase()).filter(Boolean),
  );
  const hasDuplicateCodes = new Set(normalizedCodes).size !== normalizedCodes.length;

  return hasDuplicateCodes ? defaultCodeMappings : mergedMappings;
};

export const saveCodeMappings = (mappings: CodeMapping[]) => {
  localStorage.setItem(CODE_KEY, JSON.stringify(mappings));
};
