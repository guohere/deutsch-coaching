import { NextResponse } from "next/server";
import { extractJsonObject, generateWithAi } from "@/lib/ai/providers";
import {
  getGenericCached,
  makeGlobalWordCacheKey,
  normalizeCacheText,
  setGenericCached,
} from "@/lib/assist-cache";
import { readDb } from "@/lib/db";
import { getMergedReadingArticles } from "@/lib/reading-store";
import { getMergedVocabPool } from "@/lib/vocab-pool-store";
import {
  generateGermanStemCandidates,
  isGrammarMetalanguage,
  stripArticle,
} from "@/lib/lookup-utils";

export interface SimpleExampleSentence {
  de: string;
  en?: string;
}

export interface FastWordLookupResult {
  word: string;
  baseForm: string;
  partOfSpeech: string;
  meaningEn: string;
  contextNote?: string;
  exampleDe?: string;
  examples?: SimpleExampleSentence[];
  source: "local_glossary" | "local_vocab_pool" | "disk_cache" | "ai_fast" | "web_dict";
}



function collectSimpleLocalExamples(
  rawWord: string,
  baseForm: string,
  primaryExample?: string
): SimpleExampleSentence[] {
  const seen = new Set<string>();
  const out: SimpleExampleSentence[] = [];
  const pushExample = (de?: string, en?: string) => {
    const clean = (de || "").trim();
    if (!clean) return;
    // Keep simple sentences (skip very long complex article sentences if we already have one)
    const wordCount = clean.split(/\s+/).length;
    if (out.length > 0 && wordCount > 18) return;
    const key = clean.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ de: clean, en: en?.trim() || undefined });
  };

  if (primaryExample) pushExample(primaryExample);

  const stems = new Set([
    ...generateGermanStemCandidates(rawWord),
    ...generateGermanStemCandidates(stripArticle(baseForm)),
  ].filter((s) => s.length >= 4));

  if (stems.size === 0) return out.slice(0, 3);

  const matchesStem = (sentence: string) => {
    const lower = sentence.toLowerCase();
    for (const s of stems) {
      if (lower.includes(s)) return true;
    }
    return false;
  };

  // Scan local reading glossaries & vocab pool for short simple German example sentences
  const articles = getMergedReadingArticles();
  for (const art of articles) {
    for (const g of art.glossary) {
      if (out.length >= 3) break;
      if (g.exampleDe && matchesStem(g.exampleDe)) {
        pushExample(g.exampleDe);
      }
    }
    if (out.length >= 3) break;
  }

  if (out.length < 3) {
    const db = readDb();
    const pool = getMergedVocabPool(db);
    for (const item of pool) {
      if (out.length >= 3) break;
      if (item.exampleDe && matchesStem(item.exampleDe)) {
        pushExample(item.exampleDe);
      }
    }
  }

  return out.slice(0, 3);
}



function searchLocalKnowledge(
  rawWord: string,
  surroundingSentence: string
): FastWordLookupResult | null {
  const candidates = generateGermanStemCandidates(rawWord);
  if (candidates.length === 0) return null;
  const candSet = new Set(candidates);
  const exactNorm = normalizeCacheText(rawWord);

  // 1. Search ALL reading articles' glossaries (curated + custom + enriched)
  const articles = getMergedReadingArticles();
  for (const art of articles) {
    for (const g of art.glossary) {
      const gWord = normalizeCacheText(g.word);
      const gBase = normalizeCacheText(stripArticle(g.baseForm));
      if (
        gWord === exactNorm ||
        gBase === exactNorm ||
        candSet.has(gBase) ||
        candSet.has(gWord)
      ) {
        return {
          word: rawWord,
          baseForm: g.baseForm,
          partOfSpeech: g.partOfSpeech || "Word",
          meaningEn: g.meaningEn,
          exampleDe: g.exampleDe || surroundingSentence || undefined,
          source: "local_glossary",
        };
      }
    }
  }

  // 2. Search built-in B1 vocab bank + user's saved/clicked vocab pool + Learner Memory
  const db = readDb();
  const pool = getMergedVocabPool(db);
  for (const item of pool) {
    const base = normalizeCacheText(stripArticle(item.german));
    if (!base) continue;
    if (base === exactNorm || candSet.has(base)) {
      return {
        word: rawWord,
        baseForm: item.german,
        partOfSpeech: /^(der|die|das)\s+/i.test(item.german)
          ? "Noun"
          : base.endsWith("en")
          ? "Verb"
          : "Expression",
        meaningEn: item.translation,
        exampleDe: item.exampleDe || surroundingSentence || undefined,
        source: "local_vocab_pool",
      };
    }
  }

  return null;
}

function stripHtmlTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchWiktionaryGermanEntry(
  lookupTerm: string,
  depth = 0
): Promise<{
  baseForm: string;
  partOfSpeech: string;
  meaningEn: string;
  contextNote?: string;
} | null> {
  if (!lookupTerm || depth > 1) return null;
  try {
    const url = `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(
      lookupTerm
    )}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "SprachCoach-German-Tutor/1.0 (local)" },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Record<
      string,
      Array<{
        partOfSpeech?: string;
        definitions?: Array<{ definition?: string }>;
      }>
    >;
    const deEntries = data?.de;
    if (!Array.isArray(deEntries) || deEntries.length === 0) return null;

    let firstPos = "Word";
    const defs: string[] = [];
    let inflectionTarget: string | null = null;

    for (const block of deEntries) {
      if (block.partOfSpeech && firstPos === "Word") {
        firstPos = block.partOfSpeech;
      }
      for (const d of block.definitions ?? []) {
        const clean = stripHtmlTags(d.definition || "");
        if (!clean) continue;
        // Detect Wiktionary inflection redirects like "inflection of bunt:" or "plural of Mandel"
        const inflMatch = clean.match(
          /(?:inflection|plural|genitive|dative|accusative|nominative|past|participle|singular|conjugation|form)\s+of\s+([A-Za-zÄÖÜäöüß-]+)/i
        );
        if (inflMatch?.[1] && !inflectionTarget) {
          inflectionTarget = inflMatch[1].trim();
        } else if (!isGrammarMetalanguage(clean)) {
          defs.push(clean);
        }
        if (defs.length >= 2) break;
      }
      if (defs.length >= 2) break;
    }

    // If this was only an inflection page (e.g. "spannenden" -> "inflection of spannend"), ALWAYS resolve the lemma!
    if (defs.length === 0 && inflectionTarget && depth === 0) {
      const baseRes = await fetchWiktionaryGermanEntry(inflectionTarget, 1);
      if (baseRes && !isGrammarMetalanguage(baseRes.meaningEn)) {
        return {
          baseForm: baseRes.baseForm,
          partOfSpeech: baseRes.partOfSpeech,
          meaningEn: baseRes.meaningEn,
          contextNote: `Inflected form of „${inflectionTarget}“`,
        };
      }
    }

    if (defs.length > 0 && !isGrammarMetalanguage(defs[0])) {
      return {
        baseForm: lookupTerm,
        partOfSpeech: firstPos,
        meaningEn: defs.slice(0, 2).join("; ").slice(0, 180),
      };
    }
  } catch {
    // ignore Wiktionary errors
  }
  return null;
}

async function queryGoogleGtx(
  query: string,
  targetLangCode: string
): Promise<{ direct: string; pos: string; dictMeanings: string[] } | null> {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=de&tl=${encodeURIComponent(
      targetLangCode
    )}&dt=t&dt=bd&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    const data = await res.json();
    const direct = Array.isArray(data?.[0])
      ? data[0]
          .map((seg: unknown[]) => (typeof seg?.[0] === "string" ? seg[0] : ""))
          .join("")
          .trim()
      : "";
    let pos = "Word";
    const dictMeanings: string[] = [];
    if (Array.isArray(data?.[1]) && data[1].length > 0) {
      const firstDict = data[1][0];
      if (typeof firstDict?.[0] === "string" && firstDict[0]) {
        pos = firstDict[0].charAt(0).toUpperCase() + firstDict[0].slice(1);
      }
      if (Array.isArray(firstDict?.[1])) {
        for (const m of firstDict[1].slice(0, 4)) {
          if (typeof m === "string" && m.trim()) dictMeanings.push(m.trim());
        }
      }
    }
    return { direct, pos, dictMeanings };
  } catch {
    return null;
  }
}

async function fetchFreeWebDictionary(
  word: string,
  surroundingSentence: string,
  targetLangCode: string
): Promise<FastWordLookupResult | null> {
  // 1. English Wiktionary REST API (real German dictionary with inflections -> lemmas like bunte->bunt, Lebkuchen->gingerbread!)
  if (targetLangCode === "en") {
    const wikt =
      (await fetchWiktionaryGermanEntry(word)) ??
      (word[0] === word[0]?.toUpperCase()
        ? await fetchWiktionaryGermanEntry(word.toLowerCase())
        : null);
    if (wikt) {
      return {
        word,
        baseForm: wikt.baseForm,
        partOfSpeech: wikt.partOfSpeech,
        meaningEn: wikt.meaningEn,
        contextNote:
          wikt.contextNote ||
          "Instant German dictionary entry (click 'Analyze full sentence' for deeper B1 grammar).",
        exampleDe: surroundingSentence || undefined,
        source: "web_dict",
      };
    }
  }

  // 2. Google Translate GTX (tries exact word first; if identical like "bunte"->"Bunte", tries German stems like "bunt"!)
  const candidatesToTry = [
    word,
    ...generateGermanStemCandidates(word).filter(
      (c) => c.toLowerCase() !== word.toLowerCase() && c.length >= 3
    ),
  ].slice(0, 4);

  let identicalLoanwordMatch: string | null = null;

  for (const cand of candidatesToTry) {
    const gtx = await queryGoogleGtx(cand, targetLangCode);
    if (!gtx) continue;

    // Prefer non-identical dictionary synonyms (e.g. Lebkuchen -> ["gingerbread"])
    const distinctMeanings = Array.from(
      new Set([gtx.direct, ...gtx.dictMeanings].filter(Boolean))
    ).filter((m) => m.toLowerCase() !== cand.toLowerCase());

    if (distinctMeanings.length > 0) {
      const isStemHit = cand.toLowerCase() !== word.toLowerCase();
      return {
        word,
        baseForm: isStemHit ? cand : word,
        partOfSpeech: gtx.pos,
        meaningEn: distinctMeanings.slice(0, 4).join(", "),
        contextNote: isStemHit
          ? `Base form „${cand}“ — instant dictionary lookup.`
          : "Instant dictionary lookup (click 'Analyze full sentence' for deeper B1 grammar).",
        exampleDe: surroundingSentence || undefined,
        source: "web_dict",
      };
    }

    if (gtx.direct && !identicalLoanwordMatch) {
      identicalLoanwordMatch = gtx.direct;
    }
  }

  // 3. Backup MyMemory API (also accepts valid cognates/loanwords with sentence translation!)
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      word
    )}&langpair=de|${encodeURIComponent(targetLangCode)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const json = await res.json();
      const translated = String(json?.responseData?.translatedText ?? "").trim();
      if (translated && translated.toLowerCase() !== word.toLowerCase()) {
        return {
          word,
          baseForm: word,
          partOfSpeech: "Word",
          meaningEn: translated,
          contextNote: "Instant dictionary lookup.",
          exampleDe: surroundingSentence || undefined,
          source: "web_dict",
        };
      }
      if (translated && !identicalLoanwordMatch) {
        identicalLoanwordMatch = translated;
      }
    }
  } catch {
    // ignore
  }

  // 4. Final guarantee: if it's a cognate/loanword (e.g. "Lebkuchen", "Kindergarten", "Oktoberfest"),
  // translate the surrounding sentence via GTX so the learner ALWAYS gets clear contextual meaning!
  if (identicalLoanwordMatch || surroundingSentence) {
    const sentTrans = surroundingSentence
      ? await queryGoogleGtx(surroundingSentence.slice(0, 260), targetLangCode)
      : null;
    if (identicalLoanwordMatch || sentTrans?.direct) {
      return {
        word,
        baseForm: word,
        partOfSpeech: "Word / Name",
        meaningEn: identicalLoanwordMatch || word,
        contextNote: sentTrans?.direct
          ? `In context: “${sentTrans.direct}”`
          : "German cognate / proper term used directly in English.",
        exampleDe: surroundingSentence || undefined,
        source: "web_dict",
      };
    }
  }

  return null;
}

function mapNativeLangToCode(lang: string): string {
  const l = (lang || "English").toLowerCase();
  if (l.includes("chinese") || l.includes("中文") || l.includes("mandarin")) return "zh-CN";
  if (l.includes("spanish") || l.includes("español")) return "es";
  if (l.includes("french") || l.includes("français")) return "fr";
  if (l.includes("turkish")) return "tr";
  if (l.includes("arabic")) return "ar";
  if (l.includes("russian")) return "ru";
  if (l.includes("japanese")) return "ja";
  if (l.includes("korean")) return "ko";
  return "en";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawWord = String(body.word ?? "").trim();
    const surroundingSentence = String(body.surroundingSentence ?? "").trim();
    const bypassLocal = Boolean(body.bypassLocal);

    if (!rawWord) {
      return NextResponse.json({ error: "word is required" }, { status: 400 });
    }

    const db = readDb();
    const nativeLang = db.profile.nativeLanguage || "English";
    const level = db.profile.targetLevel || "B1";

    // Tier 1: Local Knowledge Graph (0ms, 0 API calls)
    if (!bypassLocal) {
      const localHit = searchLocalKnowledge(rawWord, surroundingSentence);
      if (localHit) {
        return NextResponse.json({
          lookup: {
            ...localHit,
            examples: collectSimpleLocalExamples(
              rawWord,
              localHit.baseForm,
              localHit.exampleDe
            ),
          },
          cached: true,
        });
      }
    }

    // Tier 2: Global Cross-Article Disk Cache (~2ms, 0 API calls)
    const cacheKey = makeGlobalWordCacheKey(rawWord, nativeLang);
    if (!bypassLocal) {
      const cachedHit = getGenericCached<FastWordLookupResult>(cacheKey);
      if (
        cachedHit?.meaningEn?.trim() &&
        !isGrammarMetalanguage(cachedHit.meaningEn)
      ) {
        const examples =
          Array.isArray(cachedHit.examples) && cachedHit.examples.length > 0
            ? cachedHit.examples
            : collectSimpleLocalExamples(
                rawWord,
                cachedHit.baseForm,
                cachedHit.exampleDe
              );
        return NextResponse.json({
          lookup: {
            ...cachedHit,
            word: rawWord,
            examples,
            source: "disk_cache",
          },
          cached: true,
        });
      }
    }

    // Tier 3 & 4: Start free dictionary in parallel as instant safety net while trying Fast Micro-AI!
    const langCode = mapNativeLangToCode(nativeLang);
    const dictPromise = fetchFreeWebDictionary(
      rawWord,
      surroundingSentence,
      langCode
    );

    if (db.aiConfig.provider !== "demo") {
      try {
        const aiRes = await generateWithAi(db.aiConfig, {
          messages: [
            {
              role: "system",
              content: `Clear, learner-friendly German dictionary for ${level} students. ALWAYS give the real everyday meaning in ${nativeLang} (NEVER just grammar labels like "genitive singular") AND 3 VERY SIMPLE, short German example sentences (5–9 words each, A2/B1 level). Reply ONLY with valid JSON:
{"baseForm":"der/die/das Noun, -Pl. OR verb infinitive OR base adj","partOfSpeech":"Noun|Verb|Adjective|Adverb|Phrase","meaningEn":"clear everyday meaning in ${nativeLang}","contextNote":"brief grammar note on this form (e.g. inflected form of spannend)","examples":[{"de":"Very short simple German sentence 1.","en":"Simple translation 1."},{"de":"Very short simple German sentence 2.","en":"Simple translation 2."},{"de":"Very short simple German sentence 3.","en":"Simple translation 3."}]}`,
            },
            {
              role: "user",
              content: `Word: "${rawWord}"\nSentence: "${surroundingSentence.slice(0, 220) || rawWord}"`,
            },
          ],
          temperature: 0.25,
          jsonMode: true,
          maxTokens: 360,
          timeoutMs: 7500,
          workload: "dynamic",
        });

        const parsed = extractJsonObject<{
          baseForm?: string;
          partOfSpeech?: string;
          meaningEn?: string;
          contextNote?: string;
          exampleDe?: string;
          examples?: Array<{ de?: string; en?: string }>;
        }>(aiRes.text);

        if (
          parsed?.meaningEn?.trim() &&
          !isGrammarMetalanguage(parsed.meaningEn)
        ) {
          const cleanExamples: SimpleExampleSentence[] = Array.isArray(
            parsed.examples
          )
            ? parsed.examples
                .filter((e) => e && e.de?.trim())
                .slice(0, 3)
                .map((e) => ({
                  de: e.de!.trim(),
                  en: e.en?.trim() || undefined,
                }))
            : [];
          const finalExamples =
            cleanExamples.length > 0
              ? cleanExamples
              : collectSimpleLocalExamples(
                  rawWord,
                  parsed.baseForm?.trim() || rawWord,
                  parsed.exampleDe?.trim() || surroundingSentence
                );

          const result: FastWordLookupResult = {
            word: rawWord,
            baseForm: parsed.baseForm?.trim() || rawWord,
            partOfSpeech: parsed.partOfSpeech?.trim() || "Word",
            meaningEn: parsed.meaningEn.trim(),
            contextNote: parsed.contextNote?.trim() || undefined,
            exampleDe:
              finalExamples[0]?.de ||
              parsed.exampleDe?.trim() ||
              surroundingSentence ||
              undefined,
            examples: finalExamples,
            source: "ai_fast",
          };
          // Cache globally for BOTH the clicked inflected form AND its base form!
          setGenericCached(cacheKey, result);
          const baseKey = makeGlobalWordCacheKey(
            stripArticle(result.baseForm),
            nativeLang
          );
          if (baseKey !== cacheKey) {
            setGenericCached(baseKey, result);
          }
          return NextResponse.json({ lookup: result, cached: false });
        }
      } catch (aiErr) {
        console.warn("Fast AI word lookup fell back to web dict:", aiErr);
      }
    }

    // Tier 4: Return the already-running Wiktionary / Google GTX / MyMemory dictionary result immediately!
    const dictHit = await dictPromise;
    if (dictHit) {
      const localExamples = collectSimpleLocalExamples(
        rawWord,
        dictHit.baseForm,
        undefined
      );
      const examples =
        localExamples.length > 0
          ? localExamples
          : dictHit.exampleDe
          ? [{ de: dictHit.exampleDe }]
          : [];
      return NextResponse.json({
        lookup: {
          ...dictHit,
          examples,
        },
        cached: false,
      });
    }

    return NextResponse.json(
      {
        error: `Could not reach dictionary or AI right now for „${rawWord}“. Please click Retry.`,
      },
      { status: 503 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Word lookup failed",
      },
      { status: 500 }
    );
  }
}
