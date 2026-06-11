import { AnalysisGroup, AnalysisResponse, ApiStudent, ImportStudentRow, ItemAnalysisRow, ResultsAnalysis, StudentsResponse, assessmentLabels, createPdfDocument, downloadFile, escapeHtml, requestJson } from "../app/shared";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import {
  assessmentMap,
  defaultCodeMappings,
  themes,
} from "../data/assessments";
import {
  calculateResult,
  completeSession,
  createSession,
  getAssessment,
  getItemByStep,
  getPresentedInteractionOrder,
  getPresentedOrder,
  getSectionById,
  getStepDescriptors,
  submitItemAnswer,
} from "../lib/assessment";
import {
  buildPath,
  copyNode,
  createFile,
  createFolder,
  deleteNode,
  getChildren,
  getNodeById,
  moveNode,
  renameNode,
  undoPt1,
} from "../lib/pt1";
import {
  readActiveSession,
  saveActiveSession,
} from "../lib/storage";
import type {
  AssessmentItem,
  AssessmentSection,
  AssessmentSession,
  AssessmentVersion,
  EventLog,
  GoalScore,
  IncomingMailStimulus,
  InteractionGroup,
  MeasurementMoment,
  Option,
  Pt1Node,
  Pt1State,
  ProgrammingBlockDefinition,
  SelectedAnswer,
  SessionMetadata,
  StepDescriptor,
  ThemeDefinition,
  WhutsuppChoice,
  WhutsuppMessage,
  WhutsuppPathEntry,
} from "../types";


export const AdminScreen = ({
  adminPassword,
  onBack,
}: {
  adminPassword: string;
  onBack: () => void;
}) => {
  const [students, setStudents] = useState<ApiStudent[]>([]);
  const [versionId, setVersionId] = useState<AssessmentVersion["id"]>("lj1-vmbo");
  const [measurementMoment, setMeasurementMoment] = useState<MeasurementMoment>("nulmeting");
  const [gradeLevel, setGradeLevel] = useState<"lj1" | "lj3">("lj1");
  const [track, setTrack] = useState<"vmbo" | "hv">("vmbo");
  const [classCodeInput, setClassCodeInput] = useState("vmbo1a");
  const [assessmentWindow, setAssessmentWindow] = useState("");
  const [cohort, setCohort] = useState("");
  const [importBatch, setImportBatch] = useState("");
  const [nameListText, setNameListText] = useState("Sanne Jansen\nMilan Verbeek\nNoor Peters");
  const [classPlanText, setClassPlanText] = useState("");
  const [previewRows, setPreviewRows] = useState<ImportStudentRow[]>([]);
  const [createdCodeRows, setCreatedCodeRows] = useState<ApiStudent[]>([]);
  const [analysis, setAnalysis] = useState<ResultsAnalysis | null>(null);
  const [analysisTab, setAnalysisTab] = useState<"groups" | "items">("groups");
  const [adminTab, setAdminTab] = useState<"codes" | "results">("codes");
  const [analysisFilters, setAnalysisFilters] = useState({
    assessmentWindow: "",
    gradeLevel: "",
    track: "",
    classCode: "",
    cohort: "",
    assessmentId: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAccessCodes, setSelectedAccessCodes] = useState<string[]>([]);

  const adminHeaders = { "x-admin-password": adminPassword };
  const goalColumns = ["21A", "21B", "21C", "21D", "22A", "22B", "23A", "23B", "23C"];
  const formatMetric = (value: number | null | undefined, suffix = "%") =>
    value === null || value === undefined ? "n.v.t." : `${value}${suffix}`;
  const formatRate = (value: number | null | undefined) =>
    value === null || value === undefined ? "n.v.t." : `${Math.round(value * 1000) / 10}%`;
  const versionFilterOptions = [
    ["lj1-vmbo", "VMBO 1"],
    ["lj1-hv", "HV 1"],
    ["lj3-vmbo", "VMBO 3"],
    ["lj3-hv", "HV 3"],
  ] as const;
  const readableFilterOption = (key: string, option: string) => {
    if (key === "assessmentId") {
      return versionFilterOptions.find(([value]) => value === option)?.[1] ?? assessmentLabels[option as AssessmentVersion["id"]] ?? option;
    }
    if (key === "gradeLevel") return option === "lj3" ? "Leerjaar 3" : "Leerjaar 1";
    if (key === "track") return option === "hv" ? "HAVO/VWO" : "VMBO";
    return option;
  };
  const readableQuestionLabel = (item: ItemAnalysisRow) => {
    if (item.itemId === "self-assessment") return "Zelfinschatting";
    if (item.questionNumber !== "" && item.questionNumber !== null && item.questionNumber !== undefined) {
      return `Vraag ${item.questionNumber}`;
    }
    return "Onbekende vraag";
  };
  const formatDistribution = (distribution: Record<string, number>) =>
    Object.entries(distribution).map(([key, value]) => `${key}: ${value}`).join(", ") || "n.v.t.";
  const formatErrorCategories = (categories: Record<string, number>) =>
    Object.entries(categories).map(([key, value]) => `${key}: ${value}`).join(", ") || "n.v.t.";
  const metadataForVersion = (id: AssessmentVersion["id"]) => ({
    gradeLevel: id.startsWith("lj3") ? "lj3" : "lj1",
    track: id.endsWith("-hv") ? "hv" : "vmbo",
  });
  const versionForMetadata = (nextGradeLevel = gradeLevel, nextTrack = track) =>
    `${nextGradeLevel}-${nextTrack}` as AssessmentVersion["id"];

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      const data = await requestJson<StudentsResponse>("/api/students", {
        method: "GET",
        headers: adminHeaders,
      });
      setStudents(data.students);
      setError("");
    } catch {
      setError("Leerlingen ophalen is niet gelukt. Controleer de databasekoppeling.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnalysis = async () => {
    try {
      const params = new URLSearchParams(
        Object.entries(analysisFilters).filter(([, value]) => value.trim()),
      );
      const data = await requestJson<AnalysisResponse>(`/api/results?${params.toString()}`, {
        method: "GET",
        headers: adminHeaders,
      });
      setAnalysis(data.analysis);
    } catch {
      setError("Resultatenanalyse ophalen is niet gelukt.");
    }
  };

  useEffect(() => {
    void loadStudents();
  }, []);

  useEffect(() => {
    setVersionId(versionForMetadata());
  }, [gradeLevel, track]);

  useEffect(() => {
    void loadAnalysis();
  }, [analysisFilters]);

  const parseClassPlanRowsFromText = (text: string): ImportStudentRow[] =>
    text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .flatMap((line, lineIndex) => {
        const [classCodeRaw = "", countRaw = "", namesRaw = ""] = line.split(";").map((part) => part.trim());
        const classCode = classCodeRaw.toLowerCase();
        const count = Number.parseInt(countRaw, 10);

        if (!classCode) throw new Error(`Regel ${lineIndex + 1}: klasnaam ontbreekt.`);
        if (!Number.isFinite(count) || count < 1 || count > 250) {
          throw new Error(`Regel ${lineIndex + 1}: aantal moet tussen 1 en 250 liggen.`);
        }

        const names = namesRaw
          .split(/[,|]/)
          .map((name) => name.trim())
          .filter(Boolean);

        return Array.from({ length: count }, (_, index) => ({
          classCode,
          participantLabel: names[index] || `Leerling ${String(index + 1).padStart(2, "0")}`,
        }));
      });

  const parseClassPlanRows = () => parseClassPlanRowsFromText(classPlanText);

  const parseBulkNameRows = (): ImportStudentRow[] => {
    const classCode = classCodeInput.trim().toLowerCase();
    const windowLabel = assessmentWindow.trim();
    const cohortLabel = cohort.trim() || windowLabel;
    if (!gradeLevel || !track || !classCode || !versionId) {
      throw new Error("Vul leerjaar, niveau/meting, klas en assessment in.");
    }
    const names = nameListText
      .split(/[\r\n;]+/)
      .map((name) => name.trim().replace(/\s+/g, " "))
      .filter(Boolean);
    if (names.length === 0) throw new Error("Plak minimaal een leerlingnaam.");
    return names.map((participantLabel) => ({
      participantLabel,
      classCode,
      classId: classCode,
      assessmentId: versionId,
      gradeLevel,
      track,
      cohort: cohortLabel,
      assessmentWindow: windowLabel,
    }));
  };

  const duplicateNamesForPreview = (rows: ImportStudentRow[]) => {
    const counts = rows.reduce<Record<string, number>>((acc, row) => {
      const key = `${row.classCode}::${row.participantLabel.toLowerCase()}`;
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
    const existing = new Set(
      students
        .filter((student) => student.classCode === classCodeInput.trim().toLowerCase())
        .map((student) => student.participantLabel?.trim().toLowerCase())
        .filter(Boolean) as string[],
    );
    return new Set(
      rows
        .filter((row) => counts[`${row.classCode}::${row.participantLabel.toLowerCase()}`] > 1 || existing.has(row.participantLabel.toLowerCase()))
        .map((row) => row.participantLabel.toLowerCase()),
    );
  };

  const prepareBulkPreview = () => {
    try {
      const rows = parseBulkNameRows();
      setPreviewRows(rows);
      setCreatedCodeRows([]);
      setMessage(`${rows.length} leerlingen klaargezet. Controleer de preview en bevestig daarna.`);
      setError("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "De namen konden niet worden gelezen.");
    }
  };

  const rowsToClassPlanText = (rows: ImportStudentRow[]) => {
    const grouped = rows.reduce<Record<string, string[]>>((acc, row) => {
      const classCode = row.classCode.trim().toLowerCase();
      if (!classCode) return acc;
      acc[classCode] = acc[classCode] ?? [];
      acc[classCode].push(row.participantLabel.trim());
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([classCode, names]) => {
        const cleanNames = names.filter(Boolean);
        return `${classCode}; ${names.length}; ${cleanNames.join(", ")}`;
      })
      .join("\n");
  };

  const valueFromRecord = (record: Record<string, unknown>, names: string[]) => {
    const normalized = new Map(
      Object.entries(record).map(([key, value]) => [key.trim().toLowerCase(), value]),
    );
    for (const name of names) {
      const value = normalized.get(name.toLowerCase());
      if (value !== undefined && value !== null) return String(value).trim();
    }
    return "";
  };

  const parseTableRecords = (records: Array<Record<string, unknown>>): ImportStudentRow[] =>
    records.flatMap((record, index) => {
      const classCode = valueFromRecord(record, ["klas", "class", "classcode", "class_code"]) || classCodeInput;
      const yearRaw = valueFromRecord(record, ["leerjaar", "jaar", "year"]);
      const fallbackName = Object.entries(record)
        .filter(([key]) => !["klas", "class", "classcode", "class_code", "leerjaar", "jaar", "year", "aantal", "count"].includes(key.trim().toLowerCase()))
        .map(([, value]) => String(value ?? "").trim())
        .find(Boolean);
      const name =
        valueFromRecord(record, ["leerling", "naam", "student", "participantlabel", "participant_label", "name"]) ||
        fallbackName ||
        "";
      const countRaw = valueFromRecord(record, ["aantal", "count"]);
      const count = countRaw ? Number.parseInt(countRaw, 10) : 1;

      if (!classCode) throw new Error(`Rij ${index + 1}: klas ontbreekt.`);
      if (!name && (!Number.isFinite(count) || count < 1)) {
        throw new Error(`Rij ${index + 1}: vul een leerlingnaam of geldig aantal in.`);
      }

      const normalizedClass = classCode.trim().toLowerCase();
      const labelPrefix = yearRaw ? `Leerjaar ${yearRaw} ` : "";
      return Array.from({ length: Math.max(count, 1) }, (_, rowIndex) => ({
        classCode: normalizedClass,
        participantLabel: name || `${labelPrefix}Leerling ${String(rowIndex + 1).padStart(2, "0")}`,
        classId: normalizedClass,
        assessmentId: versionId,
        gradeLevel,
        track,
        cohort: cohort.trim() || assessmentWindow.trim(),
        assessmentWindow: assessmentWindow.trim(),
      }));
    });

  const parseDelimitedFile = (text: string) => {
    const delimiter = text.includes(";") ? ";" : ",";
    const [headerLine = "", ...lines] = text.split(/\r?\n/).filter((line) => line.trim());
    const headers = headerLine.split(delimiter).map((header) => header.trim());
    return parseTableRecords(
      lines.map((line) => {
        const values = line.split(delimiter).map((value) => value.trim());
        return headers.reduce<Record<string, string>>((record, header, index) => {
          record[header] = values[index] ?? "";
          return record;
        }, {});
      }),
    );
  };

  const readImportFile = async (file: File): Promise<ImportStudentRow[]> => {
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (extension === "xlsx" || extension === "xls") {
      const XLSX = await import("xlsx");
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const records = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[sheetName], {
        defval: "",
      });
      return parseTableRecords(records);
    }

    if (extension === "docx") {
      const mammoth = await import("mammoth/mammoth.browser");
      const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
      return parseClassPlanRowsFromText(result.value);
    }

    if (extension === "csv" || extension === "txt") {
      return parseDelimitedFile(await file.text());
    }

    throw new Error("Gebruik een Excelbestand (.xlsx/.xls), Wordbestand (.docx), csv of tekstbestand.");
  };

  const handleImportFile = async (file: File | null) => {
    if (!file) return;
    setIsLoading(true);
    try {
      const rows = await readImportFile(file);
      if (rows.length === 0) throw new Error("Geen leerlingen gevonden in het bestand.");
      const data = await requestJson<StudentsResponse>("/api/students", {
        method: "POST",
        headers: adminHeaders,
        body: JSON.stringify({
          versionId,
          measurementMoment,
          importBatch: cohort.trim() || assessmentWindow.trim(),
          students: rows,
        }),
      });
      setStudents(data.students);
      setCreatedCodeRows(data.createdStudents ?? []);
      setPreviewRows([]);
      setMessage(`${data.importedCount ?? rows.length} leerlingen uit ${file.name} toegevoegd.`);
      setError("");
      void loadAnalysis();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Het bestand kon niet worden geïmporteerd.");
    } finally {
      setIsLoading(false);
    }
  };

  const importStudents = async (rowsFromPreview = previewRows) => {
    let rows: ImportStudentRow[];
    try {
      rows = rowsFromPreview.length > 0 ? rowsFromPreview : parseBulkNameRows();
      if (rows.length === 0) {
        setError("Plak minimaal een leerlingnaam.");
        return;
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "De namen konden niet worden gelezen.");
      return;
    }

    setIsLoading(true);
    try {
      const data = await requestJson<StudentsResponse>("/api/students", {
        method: "POST",
        headers: adminHeaders,
        body: JSON.stringify({
          versionId,
          measurementMoment,
          importBatch: cohort.trim() || assessmentWindow.trim(),
          students: rows,
        }),
      });
      setStudents(data.students);
      setCreatedCodeRows(data.createdStudents ?? []);
      setPreviewRows([]);
      setMessage(`${data.importedCount ?? rows.length} afnamecodes aangemaakt.`);
      setError("");
      void loadAnalysis();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Importeren is niet gelukt.");
    } finally {
      setIsLoading(false);
    }
  };

  const getExportRows = () =>
    filteredStudents.map((student) => ({
      Afnamecode: student.accessCode,
      Leerling: student.participantLabel || "",
      Klas: student.classCode,
      Nulmeting: assessmentLabels[student.versionId] ?? student.versionId,
      Meetmoment: student.measurementMoment === "voortgangsmeting" ? "Voortgangsmeting" : "Nulmeting",
      Status: statusLabel(student.status),
      "Import-batch": student.importBatch ?? "",
      "Afgerond op": student.completedAt ? new Date(student.completedAt).toLocaleString("nl-NL") : "",
    }));

  const exportBaseName = () => {
    const yearSuffix = yearFilter === "all" ? "alle-leerjaren" : yearFilter;
    const classSuffix = classFilter.length === 0 ? "alle-klassen" : classFilter.join("-");
    return `afnamecodes-${yearSuffix}-${classSuffix}-${new Date().toISOString().slice(0, 10)}`;
  };

  const exportCodesExcel = async () => {
    const XLSX = await import("xlsx");
    const worksheet = XLSX.utils.json_to_sheet(getExportRows());
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Afnamecodes");
    XLSX.writeFile(workbook, `${exportBaseName()}.xlsx`);
  };

  const exportCodesWord = () => {
    const rows = getExportRows();
    const htmlRows = rows
      .map(
        (row) =>
          `<tr><td>${escapeHtml(row.Afnamecode)}</td><td>${escapeHtml(row.Leerling)}</td><td>${escapeHtml(row.Klas)}</td><td>${escapeHtml(row.Nulmeting)}</td><td>${escapeHtml(row.Status)}</td><td>${escapeHtml(row["Import-batch"])}</td></tr>`,
      )
      .join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Afnamecodes</title><style>body{font-family:Arial,sans-serif}table{border-collapse:collapse;width:100%}td,th{border:1px solid #999;padding:6px;text-align:left}th{background:#eee}</style></head><body><h1>Afnamecodes nulmeting</h1><table><thead><tr><th>Afnamecode</th><th>Leerling</th><th>Klas</th><th>Nulmeting</th><th>Status</th><th>Import-batch</th></tr></thead><tbody>${htmlRows}</tbody></table></body></html>`;
    downloadFile(`${exportBaseName()}.doc`, html, "application/msword");
  };

  const exportCodesPdf = () => {
    const rows = getExportRows();
    const lines = [
      "Afnamecodes nulmeting Digitale Geletterdheid",
      "",
      ...rows.flatMap((row) => [
        `${row.Klas} | ${row.Leerling || "Geen label"} | ${row.Afnamecode} | ${row.Status}`,
      ]),
    ];
    downloadFile(`${exportBaseName()}.pdf`, createPdfDocument(lines), "application/pdf");
  };

  const getGroupAnalysisExportRows = (rows: AnalysisGroup[]) =>
    rows.map((row) => ({
      Klas: row.classCode || "Alle klassen",
      Leerjaar: readableFilterOption("gradeLevel", row.gradeLevel),
      Niveau: readableFilterOption("track", row.track),
      "Afnamevenster": row.assessmentWindow || "",
      Cohort: row.cohort || "",
      Assessment: readableFilterOption("assessmentId", row.assessmentId),
      "Aangemaakte codes": row.createdCodes,
      "Gestarte afnames": row.startedCount,
      "Afgeronde afnames": row.completedCount,
      "Afronding": formatMetric(row.completionPercentage),
      "Gemiddelde totaalscore": formatMetric(row.averageTotalScore),
      "Gemiddelde meerkeuzescore": formatMetric(row.averageSrScore),
      "Gemiddelde taakscore": formatMetric(row.averagePtScore),
      "Gemiddelde zelfinschatting": formatMetric(row.averageSelfAssessment),
      "Verschil zelfinschatting-score": formatMetric(row.averageSelfAssessmentDifference, " pt"),
      ...Object.fromEntries(goalColumns.map((goalId) => [`Kerndoel ${goalId}`, formatMetric(row.goalScores[goalId])])),
    }));

  const getItemAnalysisExportRows = () =>
    (analysis?.itemAnalysis ?? []).map((item) => ({
      Vraag: readableQuestionLabel(item),
      "Gekoppelde item-id": item.itemId,
      Subdoel: item.goalId || "n.v.t.",
      "Aantal antwoorden": item.answerCount,
      "Percentage goed": formatRate(item.correctRate),
      "Percentage ik weet het niet": formatRate(item.unknownRate),
      "Meest gekozen onjuist antwoord": item.topDistractor || "n.v.t.",
      "Alle gekozen antwoorden": formatDistribution(item.distribution),
      "Percentage risicovolle keuze": formatRate(item.harmfulOptionRate),
      "Foutcategorieen bij taken": formatErrorCategories(item.ptErrorCategories),
      Signalen: item.signals.join(", ") || "Geen signaal",
    }));

  const analysisBaseName = () => `resultatenanalyse-${new Date().toISOString().slice(0, 10)}`;

  const exportAnalysisExcel = async () => {
    const XLSX = await import("xlsx");
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet([{
      "Aangemaakte codes": analysis?.overview.createdCodes ?? 0,
      "Gestarte afnames": analysis?.overview.startedCount ?? 0,
      "Afgeronde afnames": analysis?.overview.completedCount ?? 0,
      "Afronding": formatMetric(analysis?.overview.completionPercentage ?? 0),
      "Gemiddelde totaalscore": formatMetric(analysis?.overview.averageTotalScore),
      "Gemiddelde zelfinschatting": formatMetric(analysis?.overview.averageSelfAssessment),
    }]), "Samenvatting");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(getGroupAnalysisExportRows(analysis?.byClass ?? [])), "Per klas");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(getGroupAnalysisExportRows(analysis?.byGrade ?? [])), "Per leerjaar");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(getItemAnalysisExportRows()), "Itemanalyse");
    XLSX.writeFile(workbook, `${analysisBaseName()}.xlsx`);
  };

  const exportAnalysisWord = () => {
    const renderRows = (rows: Array<Record<string, string | number>>) => {
      const headers = Object.keys(rows[0] ?? {});
      return `<table><thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${headers.map((header) => `<td>${escapeHtml(String(row[header] ?? ""))}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
    };
    const classRows = getGroupAnalysisExportRows(analysis?.byClass ?? []);
    const itemRows = getItemAnalysisExportRows();
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Resultatenanalyse</title><style>body{font-family:Arial,sans-serif;color:#1b1d22}h1,h2{margin-bottom:8px}table{border-collapse:collapse;width:100%;margin:12px 0 24px}td,th{border:1px solid #999;padding:6px;text-align:left;vertical-align:top}th{background:#eee}</style></head><body><h1>Resultatenanalyse nulmeting Digitale Geletterdheid</h1><p>Exportdatum: ${new Date().toLocaleDateString("nl-NL")}</p><h2>Samenvatting</h2>${renderRows([{
      "Aangemaakte codes": analysis?.overview.createdCodes ?? 0,
      "Gestarte afnames": analysis?.overview.startedCount ?? 0,
      "Afgeronde afnames": analysis?.overview.completedCount ?? 0,
      "Afronding": formatMetric(analysis?.overview.completionPercentage ?? 0),
      "Gemiddelde totaalscore": formatMetric(analysis?.overview.averageTotalScore),
    }])}<h2>Analyse per klas</h2>${renderRows(classRows)}<h2>Itemanalyse</h2>${renderRows(itemRows)}</body></html>`;
    downloadFile(`${analysisBaseName()}.doc`, html, "application/msword");
  };

  const exportAnalysisPdf = () => {
    const lines = [
      "Resultatenanalyse nulmeting Digitale Geletterdheid",
      "",
      `Exportdatum: ${new Date().toLocaleDateString("nl-NL")}`,
      `Aangemaakte codes: ${analysis?.overview.createdCodes ?? 0}`,
      `Gestarte afnames: ${analysis?.overview.startedCount ?? 0}`,
      `Afgeronde afnames: ${analysis?.overview.completedCount ?? 0}`,
      `Afronding: ${formatMetric(analysis?.overview.completionPercentage ?? 0)}`,
      `Gemiddelde totaalscore: ${formatMetric(analysis?.overview.averageTotalScore)}`,
      "",
      "Analyse per klas",
      ...getGroupAnalysisExportRows(analysis?.byClass ?? []).map((row) =>
        `${row.Klas} | ${row.Leerjaar} | ${row.Niveau} | afgerond: ${row["Afgeronde afnames"]} | score: ${row["Gemiddelde totaalscore"]}`,
      ),
      "",
      "Itemanalyse",
      ...getItemAnalysisExportRows().map((row) =>
        `${row.Vraag} | ${row["Gekoppelde item-id"]} | antwoorden: ${row["Aantal antwoorden"]} | goed: ${row["Percentage goed"]}`,
      ),
    ];
    downloadFile(`${analysisBaseName()}.pdf`, createPdfDocument(lines), "application/pdf");
  };

  const reopenStudent = async (student: ApiStudent) => {
    setIsLoading(true);
    try {
      const data = await requestJson<StudentsResponse>("/api/students", {
        method: "PATCH",
        headers: adminHeaders,
        body: JSON.stringify({
          action: "reopen",
          accessCode: student.accessCode,
        }),
      });
      setStudents(data.students);
      setMessage(`${student.accessCode} is opnieuw opengezet.`);
      setError("");
    } catch {
      setError("Opnieuw openzetten is niet gelukt.");
    } finally {
      setIsLoading(false);
    }
  };

  const statusLabel = (status?: ApiStudent["status"]) => {
    if (status === "completed") return "Afgerond";
    if (status === "in_progress") return "Bezig";
    return "Niet gestart";
  };

  const versionToPalette: Record<string, "p1" | "p2" | "p3" | "p4" | "p5"> = {
    "lj1-vmbo": "p4",
    "lj1-hv": "p3",
    "lj3-vmbo": "p2",
    "lj3-hv": "p5",
  };

  const getYearForVersion = (id: AssessmentVersion["id"]) =>
    id.startsWith("lj1") ? "lj1" : "lj3";

  const [yearFilter, setYearFilter] = useState<"all" | "lj1" | "lj3">("all");
  const [classFilter, setClassFilter] = useState<string[]>([]);
  const yearFilteredStudents =
    yearFilter === "all"
      ? students
      : students.filter((student) => getYearForVersion(student.versionId) === yearFilter);
  const availableClassCodes = Array.from(
    new Set(yearFilteredStudents.map((student) => student.classCode).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b, "nl"));
  const filteredStudents =
    classFilter.length === 0
      ? yearFilteredStudents
      : yearFilteredStudents.filter((student) => classFilter.includes(student.classCode));
  const filteredAccessCodes = filteredStudents.map((student) => student.accessCode);
  const selectedVisibleAccessCodes = selectedAccessCodes.filter((code) =>
    filteredAccessCodes.includes(code),
  );
  const allVisibleSelected =
    filteredAccessCodes.length > 0 && selectedVisibleAccessCodes.length === filteredAccessCodes.length;
  const classFilterLabel =
    classFilter.length === 0
      ? "Alle klassen"
      : classFilter.length === 1
        ? classFilter[0]
        : `${classFilter.length} klassen`;

  const deleteStudents = async (
    action: "deleteStudents" | "deleteClasses" | "deleteYears",
    payload: Record<string, unknown>,
    label: string,
  ) => {
    if (!window.confirm("Weet je zeker dat je wilt wissen?")) return;

    setIsLoading(true);
    try {
      const data = await requestJson<StudentsResponse>("/api/students", {
        method: "DELETE",
        headers: adminHeaders,
        body: JSON.stringify({
          action,
          ...payload,
        }),
      });
      setStudents(data.students);
      setSelectedAccessCodes([]);
      setMessage(`${data.deletedCount ?? 0} leerlingen gewist (${label}).`);
      setError("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Wissen is niet gelukt.");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSingleStudent = (student: ApiStudent) =>
    deleteStudents("deleteStudents", { accessCodes: [student.accessCode] }, student.accessCode);

  useEffect(() => {
    setClassFilter((selected) =>
      selected.filter((classCode) => availableClassCodes.includes(classCode)),
    );
  }, [availableClassCodes.join("|")]);

  useEffect(() => {
    const availableCodes = new Set(students.map((student) => student.accessCode));
    setSelectedAccessCodes((selected) => selected.filter((code) => availableCodes.has(code)));
  }, [students]);

  const completedCount = students.filter((s) => s.status === "completed").length;
  const busyCount = students.filter((s) => s.status === "in_progress").length;
  const notStartedCount = students.filter((s) => !s.status || s.status === "not_started").length;
  const stats: Array<{
    label: string;
    value: string;
    delta: string;
    up: boolean;
  }> = [
    {
      label: "Totaal leerlingen",
      value: String(students.length),
      delta: "Alle klassen samen",
      up: true,
    },
    {
      label: "Bezig",
      value: String(busyCount),
      delta: busyCount > 0 ? "Actief nu" : "Niemand actief",
      up: true,
    },
    {
      label: "Afgerond",
      value: String(completedCount),
      delta: "Status zonder scorekoppeling",
      up: true,
    },
    {
      label: "Niet gestart",
      value: String(notStartedCount),
      delta: notStartedCount > 0 ? "Herinnering nodig" : "Iedereen onderweg",
      up: notStartedCount === 0,
    },
  ];

  return (
    <>
      <section className="admin-hero">
        <div>
          <span className="badge">Docentomgeving</span>
          <h1>
            Beheer afnamecodes<br />en klasvoortgang
          </h1>
          <p className="intro">
            Importeer per klas wie een code nodig heeft en volg alleen de afnamestatus.
            Resultaten worden los van leerlingen opgeslagen voor rapportage op klasniveau.
          </p>
        </div>
        <div className="admin-side-card">
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 999,
                background: "var(--t-accent-deep)",
                color: "#fff",
                display: "grid",
                placeItems: "center",
                fontFamily: "var(--font-display)",
                fontWeight: 900,
              }}
            >
              CC
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: ".95rem" }}>
                Docentaccount
              </div>
              <div style={{ fontSize: ".82rem", color: "var(--c-ink-soft)" }}>Sessie actief</div>
            </div>
          </div>
          <hr style={{ border: 0, borderTop: "1px solid var(--c-line)", margin: "12px 0" }} />
          <div style={{ display: "flex", gap: 24, fontSize: ".88rem" }}>
            <div>
              <div style={{ color: "var(--c-ink-soft)", fontWeight: 500 }}>Leerlingen</div>
              <div style={{ fontWeight: 700 }}>{students.length}</div>
            </div>
            <div>
              <div style={{ color: "var(--c-ink-soft)", fontWeight: 500 }}>Afgerond</div>
              <div style={{ fontWeight: 700 }}>{completedCount}</div>
            </div>
            <div>
              <div style={{ color: "var(--c-ink-soft)", fontWeight: 500 }}>Bezig</div>
              <div style={{ fontWeight: 700 }}>{busyCount}</div>
            </div>
          </div>
        </div>
      </section>

      <div className="stats-strip">
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <span className="accent-strip" />
            <div className="label">{s.label}</div>
            <div className="value">{s.value}</div>
            <div className={`delta ${s.up ? "up" : "down"}`}>{s.delta}</div>
          </div>
        ))}
      </div>

      <nav className="admin-main-tabs" aria-label="Beheeromgeving">
        <button className={adminTab === "codes" ? "active" : ""} type="button" onClick={() => setAdminTab("codes")}>
          Inlogcodes
        </button>
        <button className={adminTab === "results" ? "active" : ""} type="button" onClick={() => setAdminTab("results")}>
          Resultatenanalyse
        </button>
      </nav>

      {adminTab === "results" ? (
      <section className="analysis-panel">
        <div className="rd-section-head">
          <div>
            <span className="overline">Beheer &gt; Resultatenanalyse</span>
            <h3 style={{ marginTop: 6 }}>Resultatenanalyse</h3>
          </div>
          <div className="rd-result-actions">
            <button className="filter-chip" type="button" onClick={() => void loadAnalysis()}>
              Vernieuwen
            </button>
            <details className="admin-export-menu">
              <summary className={`filter-chip ${!analysis ? "disabled" : ""}`}>
                Exporteer resultaten
              </summary>
              <div className="admin-export-options">
                <button className="filter-chip" type="button" onClick={exportAnalysisWord} disabled={!analysis}>
                  Word
                </button>
                <button className="filter-chip" type="button" onClick={exportAnalysisExcel} disabled={!analysis}>
                  Excel
                </button>
                <button className="filter-chip" type="button" onClick={exportAnalysisPdf} disabled={!analysis}>
                  PDF
                </button>
              </div>
            </details>
          </div>
        </div>
        <div className="analysis-filters">
          {[
            ["assessmentWindow", "Afnamevenster", analysis?.filters.assessmentWindows ?? []],
            ["gradeLevel", "Leerjaar", analysis?.filters.gradeLevels ?? []],
            ["track", "Niveau / meting", analysis?.filters.tracks ?? []],
            ["classCode", "Klas", analysis?.filters.classCodes ?? []],
            ["cohort", "Cohort", analysis?.filters.cohorts ?? []],
            ["assessmentId", "Leerjaar/niveau", versionFilterOptions.map(([value]) => value)],
          ].map(([key, label, options]) => (
            <label className="admin-filter-select" key={String(key)}>
              <span>{String(label)}</span>
              <select
                value={analysisFilters[key as keyof typeof analysisFilters]}
                onChange={(event) =>
                  setAnalysisFilters((current) => ({ ...current, [String(key)]: event.target.value }))
                }
              >
                <option value="">Alles</option>
                {(options as string[]).map((option) => (
                  <option key={option} value={option}>
                    {readableFilterOption(String(key), option)}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
        <div className="stats-strip analysis-stats">
          {[
            ["Aangemaakte codes", analysis?.overview.createdCodes ?? 0, ""],
            ["Gestarte afnames", analysis?.overview.startedCount ?? 0, ""],
            ["Afgeronde afnames", analysis?.overview.completedCount ?? 0, ""],
            ["Afrondingspercentage", analysis?.overview.completionPercentage ?? 0, "%"],
            ["Gem. totaalscore", analysis?.overview.averageTotalScore ?? null, "%"],
            ["Gem. SR-score", analysis?.overview.averageSrScore ?? null, "%"],
            ["Gem. PT-score", analysis?.overview.averagePtScore ?? null, "%"],
            ["Gem. zelfinschatting", analysis?.overview.averageSelfAssessment ?? null, "%"],
            ["Gem. verschil", analysis?.overview.averageSelfAssessmentDifference ?? null, " pt"],
          ].map(([label, value, suffix]) => (
            <div className="stat-card compact" key={String(label)}>
              <span className="accent-strip" />
              <div className="label">{String(label)}</div>
              <div className="value">{typeof value === "number" ? formatMetric(value, String(suffix)) : "n.v.t."}</div>
            </div>
          ))}
        </div>
        <div className="analysis-tabs">
          <button className={analysisTab === "groups" ? "active" : ""} type="button" onClick={() => setAnalysisTab("groups")}>
            Klas en leerjaar
          </button>
          <button className={analysisTab === "items" ? "active" : ""} type="button" onClick={() => setAnalysisTab("items")}>
            Itemanalyse
          </button>
        </div>
        {analysisTab === "groups" ? (
          <>
            {[
              ["Analyse per klas", analysis?.byClass ?? []],
              ["Analyse per leerjaar", analysis?.byGrade ?? []],
            ].map(([title, rows]) => (
              <div className="admin-preview-block" key={String(title)}>
                <h4>{String(title)}</h4>
                <div className="analysis-table wide">
                  <div className="analysis-row head">
                    <span>Klas</span>
                    <span>Leerjaar</span>
                    <span>Niveau</span>
                    <span>Aantal afgerond</span>
                    <span>Gemiddelde totaalscore</span>
                    <span>Gemiddelde meerkeuzescore</span>
                    <span>Gemiddelde taakscore</span>
                    <span>Zelfinschatting</span>
                    {goalColumns.map((goalId) => <span key={goalId}>{goalId}</span>)}
                  </div>
                  {(rows as AnalysisGroup[]).map((row) => (
                    <div className="analysis-row" key={`${String(title)}-${row.classCode}-${row.gradeLevel}-${row.track}-${row.assessmentWindow}-${row.cohort}`}>
                      <span>{row.classCode || "Alle klassen"}</span>
                      <span>{readableFilterOption("gradeLevel", row.gradeLevel)}</span>
                      <span>{readableFilterOption("track", row.track)}</span>
                      <span>{row.completedCount}</span>
                      <span>{formatMetric(row.averageTotalScore)}</span>
                      <span>{formatMetric(row.averageSrScore)}</span>
                      <span>{formatMetric(row.averagePtScore)}</span>
                      <span>{formatMetric(row.averageSelfAssessment)}</span>
                      {goalColumns.map((goalId) => <span key={goalId}>{formatMetric(row.goalScores[goalId])}</span>)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="admin-preview-block">
              <h4>Domeinvisualisatie</h4>
              <div className="heatmap-grid" style={{ gridTemplateColumns: `minmax(120px, 1fr) repeat(${goalColumns.length}, minmax(54px, 1fr))` }}>
                <strong>Groep</strong>
                {goalColumns.map((goalId) => <strong key={goalId}>{goalId}</strong>)}
                {(analysis?.byClass ?? []).map((row) => (
                  <div className="heatmap-row" key={`heat-${row.classCode}`}>
                    <span>{row.classCode || row.gradeLevel}</span>
                    {goalColumns.map((goalId) => {
                      const value = row.goalScores[goalId] ?? 0;
                      return <span key={goalId} style={{ "--heat": value / 100 } as CSSProperties}>{formatMetric(row.goalScores[goalId])}</span>;
                    })}
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="admin-preview-block">
            <h4>Itemanalyse</h4>
            <div className="analysis-table item-analysis">
              <div className="analysis-row head">
                <span>Vraag</span>
                <span>Gekoppelde item-id</span>
                <span>Subdoel</span>
                <span>Antwoorden</span>
                <span>Percentage goed</span>
                <span>Percentage ik weet het niet</span>
                <span>Meest gekozen onjuist antwoord</span>
                <span>Alle gekozen antwoorden</span>
                <span>Percentage risicovolle keuze</span>
                <span>Foutcategorieen bij taken</span>
                <span>Signalen</span>
              </div>
              {(analysis?.itemAnalysis ?? []).map((item) => (
                <div className="analysis-row" key={item.itemId}>
                  <span>{readableQuestionLabel(item)}</span>
                  <span>{item.itemId}</span>
                  <span>{item.goalId}</span>
                  <span>{item.answerCount}</span>
                  <span>{formatRate(item.correctRate)}</span>
                  <span>{formatRate(item.unknownRate)}</span>
                  <span>{item.topDistractor || "n.v.t."}</span>
                  <span>{formatDistribution(item.distribution)}</span>
                  <span>{formatRate(item.harmfulOptionRate)}</span>
                  <span>{formatErrorCategories(item.ptErrorCategories)}</span>
                  <span>{item.signals.join(", ") || "Geen signaal"}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
      ) : null}

      {adminTab === "codes" ? (
      <>
      <section className="import-panel">
        <span className="overline">Beheer &gt; Toegangscodes &gt; Leerlingen toevoegen</span>
        <h3>Leerlingen toevoegen</h3>
        <p className="help">
          Plak meerdere namen tegelijk. De naam wordt alleen gebruikt om de toegangscode uit te delen;
          resultaten worden in de analyse alleen als aggregaat getoond.
        </p>
        <div className="grid">
          <label>
            <span>Leerjaar</span>
            <select value={gradeLevel} onChange={(event) => setGradeLevel(event.target.value as "lj1" | "lj3")}>
              <option value="lj1">Leerjaar 1</option>
              <option value="lj3">Leerjaar 3</option>
            </select>
          </label>
          <label>
            <span>Niveau / meting</span>
            <select value={track} onChange={(event) => setTrack(event.target.value as "vmbo" | "hv")}>
              <option value="vmbo">VMBO</option>
              <option value="hv">HAVO/VWO</option>
            </select>
          </label>
          <label>
            <span>Klas</span>
            <input value={classCodeInput} onChange={(event) => setClassCodeInput(event.target.value)} placeholder="bv. vmbo1a" />
          </label>
          <label>
            <span>Afnamevenster</span>
            <input value={assessmentWindow} onChange={(event) => setAssessmentWindow(event.target.value)} placeholder="bv. najaar-2026" />
          </label>
          <label>
            <span>Assessment</span>
            <select
              value={versionId}
              onChange={(event) => {
                const nextVersion = event.target.value as AssessmentVersion["id"];
                const nextMetadata = metadataForVersion(nextVersion);
                setVersionId(nextVersion);
                setGradeLevel(nextMetadata.gradeLevel as "lj1" | "lj3");
                setTrack(nextMetadata.track as "vmbo" | "hv");
              }}
            >
              {defaultCodeMappings.map((mapping) => (
                <option key={mapping.instrumentId} value={mapping.instrumentId}>
                  {mapping.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Meetmoment</span>
            <select
              value={measurementMoment}
              onChange={(event) =>
                setMeasurementMoment(event.target.value as MeasurementMoment)
              }
            >
              <option value="nulmeting">Nulmeting</option>
              <option value="voortgangsmeting">Voortgangsmeting</option>
            </select>
          </label>
          <label>
            <span>Cohort</span>
            <input value={cohort} onChange={(event) => setCohort(event.target.value)} placeholder="optioneel, standaard afnamevenster" />
          </label>
          <label>
            <span>Naam</span>
            <textarea
              value={nameListText}
              onChange={(event) => setNameListText(event.target.value)}
              placeholder={"Plak hier leerlingnamen.\nEen leerling per regel.\n\nVoorbeeld:\nSanne Jansen\nMilan Verbeek\nNoor Peters"}
            />
          </label>
          <label className="file-import-control">
            <span>CSV importeren</span>
            <input
              type="file"
              accept=".csv,.txt"
              onChange={(event) => {
                void handleImportFile(event.target.files?.[0] ?? null);
                event.currentTarget.value = "";
              }}
              disabled={isLoading}
            />
          </label>
          <button className="btn-import" type="button" onClick={() => void importStudents([])} disabled={isLoading}>
            {isLoading ? "Toevoegen..." : "Toevoegen"}
          </button>
        </div>
        {message ? (
          <div className="success-banner-inline">{message}</div>
        ) : null}
        {error ? (
          <div className="error-banner-inline" style={{ marginTop: 16 }}>
            {error}
          </div>
        ) : null}
        {createdCodeRows.length > 0 ? (
          <div className="admin-preview-block printable-code-overview">
            <h4>Code-overzicht</h4>
            <div className="rd-result-actions">
              <button
                className="filter-chip"
                type="button"
                onClick={() => {
                  const text = createdCodeRows
                    .map((student) => `${student.participantLabel ?? ""}\t${student.classCode}\t${student.accessCode}`)
                    .join("\n");
                  void navigator.clipboard?.writeText(`Naam\tKlas\tToegangscode\n${text}`);
                }}
              >
                Kopieer
              </button>
              <button className="filter-chip" type="button" onClick={() => window.print()}>
                Print
              </button>
            </div>
            <div className="analysis-table compact">
              <div className="analysis-row head">
                <span>Naam</span>
                <span>Klas</span>
                <span>Toegangscode</span>
              </div>
              {createdCodeRows.map((student) => (
                <div className="analysis-row" key={student.accessCode}>
                  <span>{student.participantLabel || "Geen label"}</span>
                  <span>{student.classCode}</span>
                  <span className="code-cell">{student.accessCode}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {false ? (
      <section className="import-panel">
        <h3>Afnamecodes genereren</h3>
        <p className="help">
          Maak per klas of leerjaar in een keer genoeg codes aan. Gebruik tekstregels
          <code> klas; aantal; namen gescheiden door komma&apos;s</code>, of lever Excel aan met kolommen
          <code>klas</code>, <code>leerling</code> en optioneel <code>aantal</code>/<code>leerjaar</code>.
          Een Wordbestand (.docx) mag dezelfde tekstregels bevatten.
        </p>
        <div className="grid">
          <label>
            <span>Nulmeting</span>
            <select
              value={versionId}
              onChange={(event) => setVersionId(event.target.value as AssessmentVersion["id"])}
            >
              {defaultCodeMappings.map((mapping) => (
                <option key={mapping.instrumentId} value={mapping.instrumentId}>
                  {mapping.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Import-batch (optioneel)</span>
            <input
              value={importBatch}
              onChange={(event) => setImportBatch(event.target.value)}
              placeholder="bv. najaar-2026"
            />
          </label>
          <label>
            <span>Leerlingen (één per regel)</span>
            <textarea
              value={classPlanText}
              onChange={(event) => setClassPlanText(event.target.value)}
              placeholder={"vmbo1a; 28; Noor Jansen, Samira B., Ali K.\nhavo1b; 30; Mila S., Adam V."}
            />
          </label>
          <label className="file-import-control">
            <span>Excel/Word import</span>
            <input
              type="file"
              accept=".xlsx,.xls,.csv,.txt,.docx"
              onChange={(event) => {
                void handleImportFile(event.target.files?.[0] ?? null);
                event.currentTarget.value = "";
              }}
            />
          </label>
          <button
            className="btn-import"
            type="button"
            onClick={() => void importStudents()}
            disabled={isLoading}
          >
            Codes genereren
          </button>
        </div>
        {message ? (
          <div className="success-banner-inline">{message}</div>
        ) : null}
        {error ? (
          <div className="error-banner-inline" style={{ marginTop: 16 }}>
            {error}
          </div>
        ) : null}
      </section>
      ) : null}

      <section className="rd-student-section">
        <div className="rd-section-head">
          <div>
            <span className="overline">Overzicht</span>
            <h3 style={{ marginTop: 6 }}>Leerlingen ({filteredStudents.length})</h3>
          </div>
          <div className="rd-section-head" style={{ marginBottom: 0, gap: 12 }}>
            <div className="filters">
              <label className="admin-filter-select">
                <span>Leerjaar</span>
                <select
                  value={yearFilter}
                  onChange={(event) => {
                    setYearFilter(event.target.value as "all" | "lj1" | "lj3");
                    setClassFilter([]);
                  }}
                >
                  <option value="all">Alle leerjaren</option>
                  <option value="lj1">Leerjaar 1</option>
                  <option value="lj3">Leerjaar 3</option>
                </select>
              </label>
              <details className="admin-filter-menu">
                <summary className="filter-chip">Klas: {classFilterLabel}</summary>
                <div className="admin-filter-popover">
                  <label className="check-row compact">
                    <input
                      type="checkbox"
                      checked={classFilter.length === 0}
                      onChange={() => setClassFilter([])}
                    />
                    <span>Alle klassen</span>
                  </label>
                  {availableClassCodes.map((classCode) => (
                    <label className="check-row compact" key={classCode}>
                      <input
                        type="checkbox"
                        checked={classFilter.includes(classCode)}
                        onChange={(event) => {
                          setClassFilter((selected) =>
                            event.target.checked
                              ? Array.from(new Set([...selected, classCode]))
                              : selected.filter((item) => item !== classCode),
                          );
                        }}
                      />
                      <span>{classCode}</span>
                    </label>
                  ))}
                </div>
              </details>
            </div>
            <button
              className="filter-chip"
              type="button"
              onClick={loadStudents}
              disabled={isLoading}
            >
              ↻ Vernieuwen
            </button>
            <button
              className="filter-chip danger"
              type="button"
              onClick={() =>
                deleteStudents(
                  "deleteStudents",
                  { accessCodes: selectedVisibleAccessCodes },
                  `${selectedVisibleAccessCodes.length} geselecteerd`,
                )
              }
              disabled={isLoading || selectedVisibleAccessCodes.length === 0}
            >
              Wis selectie
            </button>
            <button
              className="filter-chip danger"
              type="button"
              onClick={() =>
                deleteStudents("deleteClasses", { classCodes: classFilter }, classFilter.join(", "))
              }
              disabled={isLoading || classFilter.length === 0}
            >
              Wis klas(sen)
            </button>
            <button
              className="filter-chip danger"
              type="button"
              onClick={() =>
                deleteStudents(
                  "deleteYears",
                  { yearIds: [yearFilter] },
                  yearFilter === "lj1" ? "leerjaar 1" : "leerjaar 3",
                )
              }
              disabled={isLoading || yearFilter === "all"}
            >
              Wis leerjaar
            </button>
            <details className="admin-export-menu">
              <summary className={`filter-chip ${filteredStudents.length === 0 ? "disabled" : ""}`}>
                Exporteer
              </summary>
              <div className="admin-export-options">
                <button className="filter-chip" type="button" onClick={exportCodesWord} disabled={filteredStudents.length === 0}>
                  Word
                </button>
                <button className="filter-chip" type="button" onClick={exportCodesExcel} disabled={filteredStudents.length === 0}>
                  Excel
                </button>
                <button className="filter-chip" type="button" onClick={exportCodesPdf} disabled={filteredStudents.length === 0}>
                  PDF
                </button>
              </div>
            </details>
          </div>
        </div>

        <div className="rd-student-table">
          <div className="rd-student-row head">
            <span>
              <input
                aria-label="Selecteer alle zichtbare leerlingen"
                type="checkbox"
                checked={allVisibleSelected}
                disabled={filteredAccessCodes.length === 0}
                onChange={(event) => {
                  setSelectedAccessCodes((selected) =>
                    event.target.checked
                      ? Array.from(new Set([...selected, ...filteredAccessCodes]))
                      : selected.filter((code) => !filteredAccessCodes.includes(code)),
                  );
                }}
              />
            </span>
            <span>Code</span>
            <span>Leerling</span>
            <span>Klas</span>
            <span>Meting</span>
            <span>Status</span>
            <span>Score</span>
            <span>Actie</span>
          </div>
          {filteredStudents.length === 0 ? (
            <div className="rd-student-row" style={{ gridTemplateColumns: "1fr" }}>
              <span style={{ color: "var(--c-ink-soft)", fontStyle: "italic" }}>
                Nog geen leerlingen in deze selectie.
              </span>
            </div>
          ) : (
            filteredStudents.map((student) => {
              const palette = versionToPalette[student.versionId] ?? "p1";
              const metingBase = assessmentMap[student.versionId]?.level ?? student.versionId;
              const meting =
                student.measurementMoment === "voortgangsmeting"
                  ? `${metingBase} · voortgang`
                  : metingBase;
              const hasScore = false;
              return (
                <div
                  className="rd-student-row"
                  key={`${student.classCode}-${student.accessCode}`}
                >
                  <span>
                    <input
                      aria-label={`${student.accessCode} selecteren`}
                      type="checkbox"
                      checked={selectedAccessCodes.includes(student.accessCode)}
                      onChange={(event) => {
                        setSelectedAccessCodes((selected) =>
                          event.target.checked
                            ? Array.from(new Set([...selected, student.accessCode]))
                            : selected.filter((code) => code !== student.accessCode),
                        );
                      }}
                    />
                  </span>
                  <span className="code-cell">{student.accessCode}</span>
                  <span>{student.participantLabel || "Geen label"}</span>
                  <span>{student.classCode}</span>
                  <span>
                    <span className="meting-pill" data-p={palette}>
                      <span className="swatch" />
                      {meting}
                    </span>
                  </span>
                  <span>
                    <span
                      className="rd-status-pill"
                      data-s={
                        student.status === "completed"
                          ? "done"
                          : student.status === "in_progress"
                            ? "busy"
                            : ""
                      }
                    >
                      {statusLabel(student.status)}
                    </span>
                  </span>
                  <span className={`score-cell ${hasScore ? "" : "dim"}`}>
                    {hasScore
                      ? `${student.totalScore}/${student.maxScore}`
                      : "—"}
                  </span>
                  <span className="action-btns">
                    <button
                      type="button"
                      onClick={() => reopenStudent(student)}
                      disabled={isLoading}
                    >
                      Heropenen
                    </button>
                    <button
                      type="button"
                      className="danger-text"
                      onClick={() => void deleteSingleStudent(student)}
                      disabled={isLoading}
                    >
                      Verwijderen
                    </button>
                  </span>
                </div>
              );
            })
          )}
        </div>
      </section>
      </>
      ) : null}

      <div style={{ marginTop: 32 }}>
        <button className="btn btn-ghost" type="button" onClick={onBack}>
          ← Terug naar leerlingstart
        </button>
      </div>
    </>
  );
};
