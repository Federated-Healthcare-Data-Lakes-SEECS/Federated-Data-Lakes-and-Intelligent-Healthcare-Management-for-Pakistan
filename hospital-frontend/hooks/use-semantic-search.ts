"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { DoctorWithSlotsForDate } from "@/lib/api-patient";

// ─── Types ───────────────────────────────────────────────────────────────────

type Pipeline = any; // avoid importing the full type from @xenova/transformers

interface CachedEmbedding {
  doctorId: number;
  embedding: Float32Array;
  /** The text that was embedded (for debug) */
  document: string;
}

interface SpecialtyEmbedding {
  specialty: string;
  embedding: Float32Array;
}

interface SemanticSearchResult {
  results: DoctorWithSlotsForDate[];
  isModelReady: boolean;
  isSearching: boolean;
}

// ─── Specialty Descriptions ─────────────────────────────────────────────────
// Short natural-language descriptions of what each specialty treats.
// These get embedded once by the model so that queries like "memory loss"
// or "Parkinson's disease" are matched to the correct specialty purely
// through the embedding model's understanding – NO manual symptom→specialty
// mapping required.
//
// Keep descriptions rich in symptoms, diseases, and colloquial terms so
// the model captures the semantic neighbourhood of each specialty.

const SPECIALTY_DESCRIPTIONS: Record<string, string> = {
  neurology:
    "neurology neurologist brain nervous system headache migraine seizure epilepsy stroke dementia alzheimer parkinson tremor numbness tingling neuropathy multiple sclerosis memory loss confusion nerve damage movement disorders",
  psychiatry:
    "psychiatry psychiatrist mental health depression anxiety stress bipolar disorder schizophrenia ocd adhd panic attacks insomnia psychosis ptsd emotional behavioral mental illness counseling",
  cardiology:
    "cardiology cardiologist heart chest pain palpitations blood pressure hypertension cardiac arrhythmia heart attack coronary cholesterol angina heart failure murmur valve disease echocardiogram interventional cardiology angioplasty stent",
  orthopedics:
    "orthopedics orthopedic surgeon bones joints fracture broken bone sprain arthritis back pain knee hip shoulder spine scoliosis osteoporosis sports injury ligament tendon musculoskeletal",
  dermatology:
    "dermatology dermatologist skin rash acne eczema psoriasis itching hair loss mole allergy hives fungal infection warts skin cancer melanoma cosmetic dermatology",
  gastroenterology:
    "gastroenterology gastroenterologist stomach abdominal pain digestion acid reflux gerd ulcer liver hepatitis gallbladder constipation diarrhea nausea vomiting ibs crohn colitis bloating colon endoscopy colonoscopy",
  pulmonology:
    "pulmonology pulmonologist lung breathing shortness of breath asthma cough bronchitis pneumonia copd tuberculosis tb sleep apnea wheezing respiratory chest infection oxygen",
  ent:
    "ent otolaryngology otolaryngologist ear nose throat sinus sinusitis tonsil hearing hearing loss deafness snoring voice hoarseness vertigo dizziness ear infection nasal",
  ophthalmology:
    "ophthalmology ophthalmologist eye eyes vision blurry vision cataract glaucoma blindness retina laser eye surgery cornea dry eyes macular degeneration",
  urology:
    "urology urologist kidney kidneys kidney stone urinary urine bladder prostate urinary tract infection incontinence erectile dysfunction reproductive male health",
  nephrology:
    "nephrology nephrologist kidney disease dialysis renal chronic kidney disease creatinine electrolyte filtration transplant",
  endocrinology:
    "endocrinology endocrinologist diabetes sugar thyroid hormones hormone pcos insulin metabolic obesity weight gain adrenal pituitary growth hormone",
  oncology:
    "oncology oncologist cancer tumor tumour lump chemotherapy radiation leukemia lymphoma biopsy malignant benign remission staging",
  gynecology:
    "gynecology gynecologist obstetrics obstetrician pregnancy pregnant menstrual period fertility ovary uterus pelvic miscarriage cesarean women health reproductive cervical pap smear",
  pediatrics:
    "pediatrics pediatrician child children baby infant newborn toddler vaccination growth development childhood illness fever in children neonatal",
  "general medicine":
    "general medicine internal medicine general physician fever flu cold infection fatigue weakness weight loss pain swelling routine checkup primary care general health",
  dentistry:
    "dentistry dentist tooth teeth dental gum cavity toothache root canal crown filling braces orthodontics oral health",
  hematology:
    "hematology hematologist blood anemia bleeding clotting platelet hemoglobin transfusion sickle cell thalassemia coagulation white blood cell",
  rheumatology:
    "rheumatology rheumatologist lupus autoimmune fibromyalgia gout arthritis joint inflammation connective tissue vasculitis",
  surgery:
    "surgery surgeon general surgery operation hernia appendix appendicitis gallbladder removal laparoscopic surgical procedure wound",
  physiotherapy:
    "physiotherapy physical therapy rehabilitation rehab exercise therapy mobility recovery sports rehabilitation musculoskeletal therapy post surgical recovery",
  neurosurgery:
    "neurosurgery neurosurgeon brain surgery spinal surgery tumor removal disc herniation craniotomy nerve decompression head injury trauma",
};

// ─── Cosine Similarity ──────────────────────────────────────────────────────

function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

// ─── Levenshtein distance (for fuzzy matching on partial input) ─────────────

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0),
  );
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

// ─── Fuzzy prefix match for doctor fields ───────────────────────────────────
// Handles partial / incomplete input by matching typed tokens against doctor
// names, specialization, department, and qualification.

function fuzzyPrefixMatch(
  doctor: DoctorWithSlotsForDate,
  query: string,
): number {
  const q = query.toLowerCase().trim();
  const tokens = q.split(/\s+/).filter(Boolean);

  const fields = [
    doctor.firstName.toLowerCase(),
    doctor.lastName.toLowerCase(),
    doctor.specialization.toLowerCase(),
    doctor.departmentName.toLowerCase(),
    doctor.qualification.toLowerCase(),
  ];

  let totalScore = 0;
  let matched = 0;

  for (const token of tokens) {
    let bestTokenScore = 0;
    for (const field of fields) {
      const words = field.split(/\s+/);
      for (const word of words) {
        // Exact prefix
        if (word.startsWith(token) || token.startsWith(word)) {
          const s =
            Math.min(token.length, word.length) /
            Math.max(token.length, word.length);
          bestTokenScore = Math.max(bestTokenScore, s);
        }
        // Contains
        if (field.includes(token) || token.includes(word)) {
          bestTokenScore = Math.max(bestTokenScore, 0.5);
        }
        // Fuzzy ≥ 3 chars
        if (token.length >= 3) {
          const dist = levenshtein(token, word);
          const maxDist = token.length <= 4 ? 1 : 2;
          if (dist <= maxDist) {
            const fs = 1 - dist / Math.max(token.length, word.length);
            bestTokenScore = Math.max(bestTokenScore, fs * 0.8);
          }
        }
      }
    }
    if (bestTokenScore > 0) matched++;
    totalScore += bestTokenScore;
  }

  const coverage = tokens.length > 0 ? matched / tokens.length : 0;
  return tokens.length > 0
    ? (totalScore / tokens.length) * (0.5 + 0.5 * coverage)
    : 0;
}

// ─── Hybrid Scoring ─────────────────────────────────────────────────────────

function hybridScore(
  semantic: number,
  specialtyBoost: number,
  doctor: DoctorWithSlotsForDate,
): number {
  const stats = doctor.stats ?? {
    totalAppointments: 0,
    completedCheckups: 0,
    returningPatients: 0,
  };

  const availability = doctor.availableSlotsCount / 12;
  const experience = Math.min(doctor.experience, 20) / 20;
  const popularity = Math.min(stats.totalAppointments, 200) / 200;
  const reliability =
    stats.completedCheckups / (stats.totalAppointments || 1);
  const loyalty = Math.min(stats.returningPatients, 50) / 50;

  // Clamp the effective semantic + specialty boost
  const effective = Math.min(semantic + specialtyBoost * 0.4, 1);

  return (
    effective * 0.55 +
    specialtyBoost * 0.15 +
    popularity * 0.1 +
    reliability * 0.08 +
    availability * 0.06 +
    experience * 0.04 +
    loyalty * 0.02
  );
}

// ─── Build rich document for doctor embedding ───────────────────────────────
// Includes the doctor's info + any matching specialty descriptions so the
// embedding captures what conditions this doctor treats.

function buildDoctorDocument(
  doctor: DoctorWithSlotsForDate,
): string {
  const baseFields = [
    doctor.firstName,
    doctor.lastName,
    doctor.specialization,
    doctor.departmentName,
    doctor.qualification,
  ];

  // Append the specialty description if the doctor's spec/dept matches
  const docSpec = doctor.specialization.toLowerCase();
  const docDept = doctor.departmentName.toLowerCase();
  const extraContext: string[] = [];

  for (const [key, desc] of Object.entries(SPECIALTY_DESCRIPTIONS)) {
    if (docSpec.includes(key) || docDept.includes(key)) {
      extraContext.push(desc);
    }
  }

  return [...baseFields, ...extraContext].join(" ").toLowerCase();
}

// ─── Fallback search (fuzzy + prefix, no model) ────────────────────────────

function fallbackSearch(
  doctors: DoctorWithSlotsForDate[],
  query: string,
): DoctorWithSlotsForDate[] {
  const q = query.toLowerCase().trim();

  const scored = doctors
    .map((doctor) => {
      const fullName =
        `${doctor.firstName} ${doctor.lastName}`.toLowerCase();
      const spec = doctor.specialization.toLowerCase();
      const dept = doctor.departmentName.toLowerCase();
      const qual = doctor.qualification.toLowerCase();

      let score = 0;
      if (fullName.includes(q)) score = Math.max(score, 1.0);
      if (spec.includes(q)) score = Math.max(score, 0.95);
      if (dept.includes(q)) score = Math.max(score, 0.9);
      if (qual.includes(q)) score = Math.max(score, 0.85);

      // Fuzzy prefix match (handles partial typing)
      const fuzzy = fuzzyPrefixMatch(doctor, q);
      score = Math.max(score, fuzzy);

      return { doctor, score };
    })
    .filter((item) => item.score > 0.15)
    .sort((a, b) => b.score - a.score);

  return scored.map((s) => s.doctor);
}

// ─── Singleton model loader ─────────────────────────────────────────────────

let pipelinePromise: Promise<Pipeline> | null = null;

function getEmbeddingPipeline(): Promise<Pipeline> {
  if (!pipelinePromise) {
    pipelinePromise = (async () => {
      const { pipeline } = await import("@xenova/transformers");
      return pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    })();
  }
  return pipelinePromise;
}

// ─── Embed helper ───────────────────────────────────────────────────────────

async function embed(
  pipe: Pipeline,
  text: string,
): Promise<Float32Array> {
  const output = await pipe(text, { pooling: "mean", normalize: true });
  return output.data as Float32Array;
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useSemanticSearch(
  doctors: DoctorWithSlotsForDate[],
  query: string,
): SemanticSearchResult {
  const [isModelReady, setIsModelReady] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<DoctorWithSlotsForDate[]>(doctors);

  const pipeRef = useRef<Pipeline | null>(null);
  const embeddingsRef = useRef<CachedEmbedding[]>([]);
  const specialtyEmbeddingsRef = useRef<SpecialtyEmbedding[]>([]);
  const doctorIdsHashRef = useRef<string>("");
  const modelFailedRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── 1. Load model (once) ──────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const pipe = await getEmbeddingPipeline();
        if (!cancelled) {
          pipeRef.current = pipe;
        }
      } catch (err) {
        console.warn(
          "[useSemanticSearch] Model load failed, using string matching:",
          err,
        );
        if (!cancelled) {
          modelFailedRef.current = true;
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // ── 2. Pre-compute specialty + doctor embeddings ──────────────────────────

  const computeEmbeddings = useCallback(
    async (cancelled: { value: boolean }) => {
      if (!pipeRef.current || modelFailedRef.current) return;

      const idsHash = doctors.map((d) => d.id).join(",");
      if (
        idsHash === doctorIdsHashRef.current &&
        embeddingsRef.current.length > 0
      ) {
        if (!cancelled.value) setIsModelReady(true);
        return;
      }

      try {
        const pipe = pipeRef.current!;

        // 2a. Embed specialty descriptions (only once globally)
        if (specialtyEmbeddingsRef.current.length === 0) {
          const specEmbeddings: SpecialtyEmbedding[] = [];
          for (const [specialty, desc] of Object.entries(
            SPECIALTY_DESCRIPTIONS,
          )) {
            if (cancelled.value) return;
            const emb = await embed(pipe, desc);
            specEmbeddings.push({ specialty, embedding: emb });
          }
          if (!cancelled.value) {
            specialtyEmbeddingsRef.current = specEmbeddings;
          }
        }

        // 2b. Embed each doctor
        const embeddings: CachedEmbedding[] = [];
        for (const doctor of doctors) {
          if (cancelled.value) return;
          const doc = buildDoctorDocument(doctor);
          const emb = await embed(pipe, doc);
          embeddings.push({
            doctorId: doctor.id,
            embedding: emb,
            document: doc,
          });
        }

        if (!cancelled.value) {
          embeddingsRef.current = embeddings;
          doctorIdsHashRef.current = idsHash;
          setIsModelReady(true);
        }
      } catch (err) {
        console.warn(
          "[useSemanticSearch] Embedding computation failed:",
          err,
        );
        if (!cancelled.value) {
          modelFailedRef.current = true;
          setIsModelReady(false);
        }
      }
    },
    [doctors],
  );

  useEffect(() => {
    const cancelled = { value: false };
    computeEmbeddings(cancelled);
    return () => {
      cancelled.value = true;
    };
  }, [computeEmbeddings]);

  // Re-trigger when pipe becomes available
  useEffect(() => {
    if (isModelReady || modelFailedRef.current) return;

    const interval = setInterval(() => {
      if (pipeRef.current && embeddingsRef.current.length === 0) {
        clearInterval(interval);
        const cancelled = { value: false };
        computeEmbeddings(cancelled);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [doctors, isModelReady, computeEmbeddings]);

  // ── 3. Compute specialty boost for a doctor via model ─────────────────────
  // Instead of a manual keyword map, we compare the query embedding to each
  // specialty embedding, find the best-matching specialties, then check if
  // the doctor belongs to one of those specialties.

  const computeSpecialtyBoost = useCallback(
    (
      queryEmbedding: Float32Array,
      doctor: DoctorWithSlotsForDate,
    ): number => {
      if (specialtyEmbeddingsRef.current.length === 0) return 0;

      const docSpec = doctor.specialization.toLowerCase();
      const docDept = doctor.departmentName.toLowerCase();
      const docQual = doctor.qualification.toLowerCase();
      const docFields = `${docSpec} ${docDept} ${docQual}`;

      let bestBoost = 0;

      for (const specEmb of specialtyEmbeddingsRef.current) {
        const sim = cosineSimilarity(queryEmbedding, specEmb.embedding);
        // If the query is semantically close to this specialty AND the
        // doctor belongs to it, give a boost proportional to that similarity.
        if (sim > 0.35 && docFields.includes(specEmb.specialty)) {
          bestBoost = Math.max(bestBoost, sim);
        }
        // Also check partial specialty name match (e.g. "cardio" in "cardiology")
        const specWords = specEmb.specialty.split(/\s+/);
        for (const sw of specWords) {
          if (
            sw.length >= 4 &&
            (docSpec.includes(sw) || docDept.includes(sw))
          ) {
            if (sim > 0.3) {
              bestBoost = Math.max(bestBoost, sim * 0.9);
            }
          }
        }
      }

      return bestBoost;
    },
    [],
  );

  // ── 4. Search (debounced) ─────────────────────────────────────────────────

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const trimmed = query.trim();

    // Empty query → full list
    if (!trimmed) {
      setResults(doctors);
      setIsSearching(false);
      return;
    }

    // Fallback while model is loading / failed
    if (!isModelReady || modelFailedRef.current) {
      setResults(fallbackSearch(doctors, trimmed));
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    // Slightly longer debounce for very short queries (user still typing)
    const debounceMs = trimmed.length <= 3 ? 400 : 250;

    debounceRef.current = setTimeout(async () => {
      try {
        const pipe = pipeRef.current;
        if (!pipe || embeddingsRef.current.length === 0) {
          setResults(fallbackSearch(doctors, trimmed));
          setIsSearching(false);
          return;
        }

        // Embed the raw query as-is – the model handles semantic understanding
        const queryEmbedding = await embed(pipe, trimmed.toLowerCase());

        const scored = doctors
          .map((doctor) => {
            const cached = embeddingsRef.current.find(
              (e) => e.doctorId === doctor.id,
            );
            if (!cached) return null;

            // Direct semantic similarity (query ↔ doctor document)
            const semantic = cosineSimilarity(
              queryEmbedding,
              cached.embedding,
            );

            // Specialty boost via model (query ↔ specialty descriptions)
            const specBoost = computeSpecialtyBoost(queryEmbedding, doctor);

            // Fuzzy/prefix match (handles partial typing gracefully)
            const fuzzy = fuzzyPrefixMatch(doctor, trimmed);

            // Gate: pass if ANY signal is strong enough
            const gate = Math.max(semantic, specBoost, fuzzy);
            if (gate < 0.15) return null;

            const score =
              hybridScore(semantic, specBoost, doctor) +
              fuzzy * 0.1;

            return { doctor, score };
          })
          .filter(
            (
              item,
            ): item is {
              doctor: DoctorWithSlotsForDate;
              score: number;
            } => item !== null,
          )
          .sort((a, b) => b.score - a.score);

        setResults(scored.map((s) => s.doctor));
      } catch (err) {
        console.warn(
          "[useSemanticSearch] Search failed, using fallback:",
          err,
        );
        setResults(fallbackSearch(doctors, trimmed));
      } finally {
        setIsSearching(false);
      }
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, doctors, isModelReady, computeSpecialtyBoost]);

  return { results, isModelReady, isSearching };
}
