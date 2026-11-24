"use client";

import React from "react";

export interface InteractiveSelectionPayload {
  selectedText: string;
  surroundingSentence: string;
  selectionType: "word" | "phrase" | "sentence";
}

interface InteractiveGermanTextProps {
  text: string;
  clickMode: "word" | "sentence";
  activeSelectionText?: string;
  className?: string;
  onSelectChunk: (payload: InteractiveSelectionPayload) => void;
  onHighlightPhrase?: (payload: InteractiveSelectionPayload) => void;
}

const GERMAN_ABBREVIATIONS = new Set([
  "bzw.",
  "ca.",
  "dr.",
  "nr.",
  "usw.",
  "inkl.",
  "max.",
  "min.",
  "abs.",
  "std.",
  "mio.",
  "mrd.",
  "prof.",
  "str.",
  "tel.",
  "evtl.",
  "ggf.",
  "etc.",
  "z.",
  "b.",
  "u.",
  "a.",
  "d.",
  "h.",
  "v.",
  "s.",
  "mo.",
  "di.",
  "mi.",
  "do.",
  "fr.",
  "sa.",
  "so.",
]);

/**
 * Splits a German paragraph into sentences while preserving abbreviations
 * like "bzw.", "z. B.", "ca.", "Dr.", "Nr." and ordinal dates like "15. Mai".
 */
function splitGermanSentences(paragraph: string): string[] {
  const trimmed = paragraph.trim();
  if (!trimmed) return [];

  const tokens = trimmed.split(/(\s+)/);
  const sentences: string[] = [];
  let current = "";

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    current += tok;

    if (/^\s+$/.test(tok)) continue;

    const cleanEnd = tok.replace(/[„“"‚‘'»«)\]]+$/g, "");
    const endsSentencePunct = /[.!?]$/.test(cleanEnd);
    if (!endsSentencePunct) continue;

    const lowerClean = cleanEnd.toLowerCase();
    // Skip known abbreviations (bzw., Dr., ca., z., B., etc.)
    if (GERMAN_ABBREVIATIONS.has(lowerClean)) continue;
    // Skip ordinals or numbered headings like "1." or "15."
    if (/^\d+\.$/.test(cleanEnd)) continue;

    // Peek at next non-whitespace token to ensure it starts a new sentence (capital/quote/§/digit)
    let nextWord = "";
    for (let j = i + 1; j < tokens.length; j++) {
      if (!/^\s+$/.test(tokens[j])) {
        nextWord = tokens[j];
        break;
      }
    }

    if (!nextWord) {
      sentences.push(current.trim());
      current = "";
      continue;
    }

    const startsNew = /^[A-ZÄÖÜ„"«(§0-9]/.test(nextWord);
    if (startsNew) {
      sentences.push(current.trim());
      current = "";
    }
  }

  if (current.trim()) {
    sentences.push(current.trim());
  }

  return sentences;
}

/**
 * Splits a sentence into alternating word tokens and punctuation/whitespace tokens
 * so German words (including umlauts, ß, and hyphenated compounds) can be clicked individually.
 */
function tokenizeSentence(sentence: string): Array<{ raw: string; word?: string }> {
  const regex = /([A-Za-zÄÖÜäöüß]+(?:-[A-Za-zÄÖÜäöüß]+)*)/g;
  const parts: Array<{ raw: string; word?: string }> = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(sentence)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ raw: sentence.slice(lastIndex, match.index) });
    }
    parts.push({ raw: match[0], word: match[0] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < sentence.length) {
    parts.push({ raw: sentence.slice(lastIndex) });
  }

  return parts;
}

export function InteractiveGermanText({
  text,
  clickMode,
  activeSelectionText,
  className = "text-base leading-relaxed text-zinc-900",
  onSelectChunk,
  onHighlightPhrase,
}: InteractiveGermanTextProps) {
  const paragraphs = text.split(/\n/);

  function findSurroundingSentence(selected: string): string {
    const normSel = selected.trim().toLowerCase();
    for (const para of paragraphs) {
      const sents = splitGermanSentences(para);
      for (const s of sents) {
        if (s.toLowerCase().includes(normSel)) {
          return s;
        }
      }
    }
    return selected.trim();
  }

  function handleSelectionEnd() {
    if (!onHighlightPhrase) return;
    const selObj = window.getSelection();
    const raw = selObj?.toString().trim() ?? "";
    if (!raw || raw.length < 2) return;
    // Only trigger phrase-highlight action when user drags across multiple words or > 1 token
    if (!/\s/.test(raw)) return;
    const clipped = raw.length > 350 ? raw.slice(0, 350).trim() : raw;
    onHighlightPhrase({
      selectedText: clipped,
      surroundingSentence: findSurroundingSentence(clipped),
      selectionType: /[.!?]$/.test(clipped) && clipped.split(/\s+/).length >= 5 ? "sentence" : "phrase",
    });
  }

  const normalizedActive = activeSelectionText?.trim().toLowerCase();

  return (
    <div
      className={`space-y-3 select-text ${className}`}
      onMouseUp={handleSelectionEnd}
      onTouchEnd={handleSelectionEnd}
    >
      {paragraphs.map((para, pIdx) => {
        if (!para.trim()) {
          return <div key={pIdx} className="h-1" />;
        }

        const sentences = splitGermanSentences(para);
        const isHeadingLine =
          /^§\s*\d+/.test(para.trim()) ||
          (sentences.length === 1 &&
            para.trim().length < 75 &&
            !/[.!?]$/.test(para.trim()));

        return (
          <p
            key={pIdx}
            className={isHeadingLine ? "font-bold text-zinc-950" : undefined}
          >
            {sentences.map((sentence, sIdx) => {
              const isSentenceActive =
                clickMode === "sentence" &&
                normalizedActive === sentence.trim().toLowerCase();

              if (clickMode === "sentence") {
                return (
                  <React.Fragment key={sIdx}>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        const dragSel = window.getSelection()?.toString().trim();
                        if (dragSel && /\s/.test(dragSel)) return;
                        onSelectChunk({
                          selectedText: sentence,
                          surroundingSentence: sentence,
                          selectionType: "sentence",
                        });
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onSelectChunk({
                            selectedText: sentence,
                            surroundingSentence: sentence,
                            selectionType: "sentence",
                          });
                        }
                      }}
                      className={`rounded-md px-0.5 py-0.5 transition cursor-pointer ${
                        isSentenceActive
                          ? "bg-indigo-100 text-indigo-950 ring-1 ring-indigo-300"
                          : "hover:bg-indigo-50/90 hover:text-indigo-950"
                      }`}
                      title="Click sentence for full translation, vocab & grammar rules"
                    >
                      {sentence}
                    </span>
                    {sIdx < sentences.length - 1 ? " " : ""}
                  </React.Fragment>
                );
              }

              // Word-click mode
              const tokens = tokenizeSentence(sentence);
              return (
                <React.Fragment key={sIdx}>
                  <span>
                    {tokens.map((tok, tIdx) => {
                      if (!tok.word) {
                        return <React.Fragment key={tIdx}>{tok.raw}</React.Fragment>;
                      }
                      const isWordActive =
                        normalizedActive === tok.word.toLowerCase();
                      return (
                        <span
                          key={tIdx}
                          role="button"
                          tabIndex={0}
                          onClick={() => {
                            const dragSel = window.getSelection()?.toString().trim();
                            if (dragSel && /\s/.test(dragSel)) return;
                            onSelectChunk({
                              selectedText: tok.word!,
                              surroundingSentence: sentence,
                              selectionType: "word",
                            });
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              onSelectChunk({
                                selectedText: tok.word!,
                                surroundingSentence: sentence,
                                selectionType: "word",
                              });
                            }
                          }}
                          className={`rounded px-0.5 transition cursor-pointer ${
                            isWordActive
                              ? "bg-amber-200/90 text-amber-950 font-semibold ring-1 ring-amber-400"
                              : "hover:bg-amber-100/80 hover:text-amber-950"
                          }`}
                          title="Click word for meaning & grammar (or highlight a phrase)"
                        >
                          {tok.raw}
                        </span>
                      );
                    })}
                  </span>
                  {sIdx < sentences.length - 1 ? " " : ""}
                </React.Fragment>
              );
            })}
          </p>
        );
      })}
    </div>
  );
}
