/**
 * German Lexical & Lookup Processing Utilities
 *
 * Provides stem candidate expansion, article stripping, and grammatical metalanguage
 * filtering to ensure clean B1 definitions without raw inflection jargon.
 */

export function isGrammarMetalanguage(text: string): boolean {
  const t = (text || "").toLowerCase();
  if (!t) return true;
  if (
    /\b(inflection of|conjugation of|declension of|plural of|form of|participle of|comparative of|superlative of)\b/.test(
      t
    )
  ) {
    return true;
  }
  const grammarTerms = t.match(
    /\b(genitive|dative|accusative|nominative|masculine|feminine|neuter|singular|plural|strong|weak|mixed|first-person|second-person|third-person|subjunctive|preterite|imperative|all-gender)\b/g
  );
  return (grammarTerms?.length ?? 0) >= 2;
}

export function stripArticle(text: string): string {
  return text
    .trim()
    .replace(/^(der|die|das|ein|eine|einen|einem|einer|sich)\s+/i, "")
    .split(/[,(]/)[0]
    .trim();
}

export function generateGermanStemCandidates(rawWord: string): string[] {
  const clean = (rawWord || "")
    .toLowerCase()
    .replace(/[„“".,!?:;()[\]{}]/g, "")
    .trim();
  if (!clean) return [];
  const candidates = new Set<string>([clean]);

  // Common German inflections -> infinitive / base noun / base adjective
  if (clean.length >= 4) {
    if (clean.endsWith("st") || clean.endsWith("te")) {
      candidates.add(`${clean.slice(0, -2)}en`);
      candidates.add(`${clean.slice(0, -2)}n`);
    }
    if (clean.endsWith("t") && !clean.endsWith("st")) {
      candidates.add(`${clean.slice(0, -1)}en`);
      candidates.add(`${clean.slice(0, -1)}n`);
    }
    if (clean.endsWith("ten") || clean.endsWith("tet")) {
      candidates.add(`${clean.slice(0, -3)}en`);
    }
    if (
      clean.endsWith("en") ||
      clean.endsWith("er") ||
      clean.endsWith("es") ||
      clean.endsWith("em")
    ) {
      candidates.add(clean.slice(0, -2));
      candidates.add(`${clean.slice(0, -2)}e`);
    }
    if (clean.endsWith("e") || clean.endsWith("n") || clean.endsWith("s")) {
      candidates.add(clean.slice(0, -1));
    }
    // Past participle ge-...-t / ge-...-en
    if (clean.startsWith("ge") && clean.length >= 6) {
      const noGe = clean.slice(2);
      if (noGe.endsWith("t")) candidates.add(`${noGe.slice(0, -1)}en`);
      if (noGe.endsWith("en")) candidates.add(noGe);
    }
  }
  return Array.from(candidates);
}
