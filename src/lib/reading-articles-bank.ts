export interface ReadingGlossaryEntry {
  word: string;
  baseForm: string;
  meaningEn: string;
  partOfSpeech: string;
  exampleDe: string;
}

export interface ReadingTransferExpression {
  de: string;
  en: string;
  useIn: "Sprechen" | "Schreiben" | "Beides";
}

export interface ReadingArticle {
  id: string;
  categoryId: string;
  level: string;
  titleDe: string;
  titleEn: string;
  summaryEn: string;
  sourceStyle: string;
  sourceUrl?: string;
  readingMinutes: number;
  paragraphs: Array<{
    de: string;
    en: string;
  }>;
  glossary: ReadingGlossaryEntry[];
  transferExpressions: ReadingTransferExpression[];
  speakingWritingPromptDe: string;
  speakingWritingPromptEn: string;
  source: "curated" | "custom" | "ai";
  createdAt?: string;
}

/**
 * 16 high-value, authentic B1 German multi-paragraph reading articles
 * (2 per category across all 8 official Goethe-Zertifikat B1 topic categories).
 * Every article includes pre-loaded paragraph translations, instant clickable glossary,
 * and reusable Redemittel designed to directly strengthen Speaking & Writing!
 */
export const CURATED_B1_READING_ARTICLES: ReadingArticle[] = [
  // =========================================================================
  // 1. ARBEIT, BERUF & BEWERBUNG (voc-work)
  // =========================================================================
  {
    id: "read-b1-work-01",
    categoryId: "voc-work",
    level: "B1",
    titleDe: "Vier-Tage-Woche oder klassische Vollzeit? Wie sich unsere Arbeitswelt verändert",
    titleEn: "Four-Day Week or Classic Full-Time? How Our Working World Is Changing",
    summaryEn:
      "Explores why many German employees want shorter workweeks, what pilot projects show, and where the limits lie.",
    sourceStyle: "DW Top-Thema / Arbeitswelt-Magazin (B1)",
    sourceUrl: "https://learngerman.dw.com/de/top-thema/s-55861562",
    readingMinutes: 3,
    paragraphs: [
      {
        de: "In den letzten Jahren hat sich die Arbeitswelt in Deutschland stark verändert. Während früher fast alle Beschäftigten von Montag bis Freitag im Büro saßen, wünschen sich heute immer mehr Menschen flexiblere Arbeitszeiten. Besonders die sogenannte Vier-Tage-Woche sorgt für lebhafte Diskussionen zwischen Arbeitnehmern und Unternehmen.",
        en: "In recent years, the working world in Germany has changed significantly. While previously almost all employees sat in the office from Monday to Friday, more and more people today want more flexible working hours. The so-called four-day week in particular sparks lively discussions between employees and companies.",
      },
      {
        de: "Einerseits zeigen erste Modellprojekte ermutigende Ergebnisse: Mitarbeiterinnen und Mitarbeiter, die einen zusätzlichen freien Tag haben, sind oft entspannter, seltener krank und arbeiten an den übrigen Tagen konzentrierter. Außerdem bleibt mehr Zeit für die Familie, für Sport oder für Weiterbildungen. Viele Firmen hoffen zudem, durch moderne Arbeitsmodelle leichter qualifizierte Fachkräfte zu gewinnen.",
        en: "On the one hand, initial pilot projects show encouraging results: employees who have an extra day off are often more relaxed, sick less often, and work more focused on the remaining days. In addition, there is more time left for family, sports, or further training. Many companies also hope to attract qualified specialists more easily through modern work models.",
      },
      {
        de: "Andererseits lässt sich dieses Modell nicht in jeder Branche einfach umsetzen. In Krankenhäusern, in der Gastronomie oder im Handwerk müssen die Aufgaben zuverlässig erledigt werden, sodass weniger Arbeitszeit schnell zu Personalmangel führt. Fachleute betonen deshalb, dass flexible Lösungen wie Gleitzeit oder hybrides Arbeiten oft realistischer sind als eine feste Regel für alle.",
        en: "On the other hand, this model cannot easily be implemented in every industry. In hospitals, gastronomy, or skilled trades, tasks must be completed reliably, so less working time quickly leads to staff shortages. Experts therefore emphasize that flexible solutions like flexitime or hybrid work are often more realistic than one fixed rule for everyone.",
      },
    ],
    glossary: [
      { word: "Beschäftigten", baseForm: "die Beschäftigten (Pl.)", meaningEn: "employees / workers", partOfSpeech: "Noun", exampleDe: "Viele Beschäftigte wünschen sich flexible Arbeitszeiten." },
      { word: "Arbeitszeiten", baseForm: "die Arbeitszeit, -en", meaningEn: "working hours", partOfSpeech: "Noun", exampleDe: "Dank Gleitzeit kann ich meine Arbeitszeit selbst einteilen." },
      { word: "Arbeitnehmern", baseForm: "der Arbeitnehmer, -", meaningEn: "employee", partOfSpeech: "Noun", exampleDe: "Arbeitnehmer und Arbeitgeber müssen eine faire Lösung finden." },
      { word: "ermutigende", baseForm: "ermutigend", meaningEn: "encouraging", partOfSpeech: "Adjective", exampleDe: "Das Projekt hat sehr ermutigende Ergebnisse geliefert." },
      { word: "Fachkräfte", baseForm: "die Fachkraft, -kräfte", meaningEn: "skilled worker / specialist", partOfSpeech: "Noun", exampleDe: "In der IT-Branche werden dringend Fachkräfte gesucht." },
      { word: "Branche", baseForm: "die Branche, -n", meaningEn: "industry / sector", partOfSpeech: "Noun", exampleDe: "In welcher Branche möchtest du später arbeiten?" },
      { word: "umsetzen", baseForm: "umsetzen (setzte um, hat umgesetzt)", meaningEn: "to implement / put into practice", partOfSpeech: "Verb", exampleDe: "Es ist nicht immer leicht, neue Ideen schnell umzusetzen." },
      { word: "Personalmangel", baseForm: "der Personalmangel (Sg.)", meaningEn: "staff shortage", partOfSpeech: "Noun", exampleDe: "Wegen des Personalmangels müssen viele Überstunden machen." },
      { word: "Gleitzeit", baseForm: "die Gleitzeit (Sg.)", meaningEn: "flexitime", partOfSpeech: "Noun", exampleDe: "Mit Gleitzeit kann man morgens etwas später anfangen." },
    ],
    transferExpressions: [
      { de: "In den letzten Jahren hat sich ... stark verändert.", en: "In recent years, ... has changed significantly.", useIn: "Beides" },
      { de: "Einerseits ..., andererseits lässt sich dieses Modell nicht überall umsetzen.", en: "On one hand ..., on the other hand this model cannot be implemented everywhere.", useIn: "Schreiben" },
      { de: "Fachleute betonen deshalb, dass ...", en: "Experts therefore emphasize that ...", useIn: "Beides" },
      { de: "Außerdem bleibt mehr Zeit für die Familie und Weiterbildungen.", en: "In addition, more time remains for family and further training.", useIn: "Sprechen" },
    ],
    speakingWritingPromptDe: "Würden Sie lieber vier längere Tage oder fünf kürzere Tage pro Woche arbeiten? Begründen Sie Ihre Meinung in 2–3 Sätzen!",
    speakingWritingPromptEn: "Would you rather work four longer days or five shorter days per week? Justify your opinion in 2–3 sentences!",
    source: "curated",
  },
  {
    id: "read-b1-work-02",
    categoryId: "voc-work",
    level: "B1",
    titleDe: "Erfolgreich im Vorstellungsgespräch: Worauf Unternehmen wirklich achten",
    titleEn: "Succeeding in a Job Interview: What Companies Really Look For",
    summaryEn:
      "Practical B1 insights on preparing for interviews in Germany: punctuality, authentic motivation, and asking smart questions.",
    sourceStyle: "Karriere-Ratgeber / Deutschland.de Style (B1)",
    sourceUrl: "https://www.deutschland.de/de/topic/wirtschaft/arbeiten-in-deutschland",
    readingMinutes: 3,
    paragraphs: [
      {
        de: "Wer eine Einladung zum Vorstellungsgespräch erhält, hat die erste wichtige Hürde bereits geschafft: Der Lebenslauf und das Anschreiben haben überzeugt. Dennoch sind viele Bewerberinnen und Bewerber vor dem persönlichen Gespräch nervös, weil sie nicht genau wissen, welche Fragen gestellt werden.",
        en: "Anyone who receives an invitation to a job interview has already cleared the first major hurdle: the resume and cover letter were convincing. Nevertheless, many applicants are nervous before the personal interview because they do not know exactly which questions will be asked.",
      },
      {
        de: "Personalverantwortliche betonen immer wieder, dass eine gründliche Vorbereitung den größten Unterschied macht. Man sollte sich vorab genau über die Produkte, die Werte und die aktuellen Projekte der Firma informieren. Noch wichtiger als perfekte Antworten auswendig zu lernen ist jedoch, ehrlich zu erklären, warum man sich gerade für diese Stelle interessiert und welche Erfahrungen man mitbringt.",
        en: "HR managers repeatedly emphasize that thorough preparation makes the biggest difference. One should inform oneself thoroughly in advance about the company's products, values, and current projects. Even more important than memorizing perfect answers, however, is honestly explaining why one is interested in this specific position and what experience one brings along.",
      },
      {
        de: "Am Ende des Gesprächs bekommen Bewerber fast immer die Gelegenheit, selbst Fragen zu stellen. Wer hier nachfragt – zum Beispiel nach der Einarbeitung, nach dem Team oder nach Entwicklungsmöglichkeiten –, zeigt echtes Interesse und Initiative. Pünktlichkeit, ein freundliches Auftreten und ein kurzes Dankeschön per E-Mail runden einen professionellen Eindruck ab.",
        en: "At the end of the interview, applicants almost always get the opportunity to ask questions themselves. Anyone who asks here — for example about onboarding, the team, or development opportunities — shows genuine interest and initiative. Punctuality, a friendly demeanor, and a brief thank-you via email round off a professional impression.",
      },
    ],
    glossary: [
      { word: "Vorstellungsgespräch", baseForm: "das Vorstellungsgespräch, -e", meaningEn: "job interview", partOfSpeech: "Noun", exampleDe: "Am Donnerstag habe ich ein wichtiges Vorstellungsgespräch." },
      { word: "Hürde", baseForm: "die Hürde, -n", meaningEn: "hurdle / obstacle", partOfSpeech: "Noun", exampleDe: "Die schriftliche Prüfung war die schwierigste Hürde." },
      { word: "Lebenslauf", baseForm: "der Lebenslauf, -läufe", meaningEn: "CV / résumé", partOfSpeech: "Noun", exampleDe: "Bitte schicken Sie Ihren aktuellen Lebenslauf als PDF." },
      { word: "Anschreiben", baseForm: "das Anschreiben, -", meaningEn: "cover letter", partOfSpeech: "Noun", exampleDe: "Im Anschreiben begründet man seine Motivation für die Stelle." },
      { word: "überzeugt", baseForm: "überzeugen (überzeugte, hat überzeugt)", meaningEn: "to convince", partOfSpeech: "Verb", exampleDe: "Seine Argumente haben mich sofort überzeugt." },
      { word: "gründliche", baseForm: "gründlich", meaningEn: "thorough", partOfSpeech: "Adjective", exampleDe: "Eine gründliche Vorbereitung nimmt viel Nervosität weg." },
      { word: "auswendig", baseForm: "auswendig lernen", meaningEn: "to memorize / learn by heart", partOfSpeech: "Adverb", exampleDe: "Es ist besser, frei zu sprechen, statt Sätze auswendig zu lernen." },
      { word: "Einarbeitung", baseForm: "die Einarbeitung (Sg.)", meaningEn: "onboarding / job training", partOfSpeech: "Noun", exampleDe: "In den ersten Wochen gibt es eine gute Einarbeitung im Team." },
      { word: "Auftreten", baseForm: "das Auftreten (Sg.)", meaningEn: "appearance / demeanor", partOfSpeech: "Noun", exampleDe: "Ein selbstbewusstes, freundliches Auftreten hinterlässt einen guten Eindruck." },
    ],
    transferExpressions: [
      { de: "Dennoch sind viele Menschen nervös, weil ...", en: "Nevertheless, many people are nervous because ...", useIn: "Beides" },
      { de: "Eine gründliche Vorbereitung macht den größten Unterschied.", en: "Thorough preparation makes the biggest difference.", useIn: "Sprechen" },
      { de: "Noch wichtiger als ... ist jedoch, ehrlich zu erklären, warum ...", en: "Even more important than ... is, however, to honestly explain why ...", useIn: "Schreiben" },
      { de: "Am Ende bekommt man die Gelegenheit, selbst Fragen zu stellen.", en: "At the end one gets the opportunity to ask questions oneself.", useIn: "Sprechen" },
    ],
    speakingWritingPromptDe: "Was finden Sie bei einer Bewerbung am wichtigsten: Berufserfahrung, Zeugnisse oder Persönlichkeit?",
    speakingWritingPromptEn: "What do you find most important in a job application: work experience, certificates, or personality?",
    source: "curated",
  },

  // =========================================================================
  // 2. WOHNEN, ALLTAG & NACHBARSCHAFT (voc-living)
  // =========================================================================
  {
    id: "read-b1-living-01",
    categoryId: "voc-living",
    level: "B1",
    titleDe: "Wohnungssuche in der Großstadt: Zwischen hohen Mieten und neuen Wohnideen",
    titleEn: "Apartment Hunting in the Big City: Between High Rents and New Housing Ideas",
    summaryEn:
      "Discusses tight urban housing markets in Germany and creative solutions like shared living and multi-generational housing.",
    sourceStyle: "Nachrichtenleicht / Wohn-Magazin (B1)",
    sourceUrl: "https://www.nachrichtenleicht.de/",
    readingMinutes: 3,
    paragraphs: [
      {
        de: "Eine bezahlbare Wohnung in einer deutschen Großstadt zu finden, ist für viele Menschen eine echte Geduldsprobe geworden. In beliebten Städten wie München, Berlin oder Hamburg bewerben sich oft mehr als hundert Interessenten auf eine einzige Anzeige. Besonders Studierende und junge Familien geben einen großen Teil ihres Einkommens allein für die Kaltmiete und die Nebenkosten aus.",
        en: "Finding an affordable apartment in a German big city has become a real test of patience for many people. In popular cities like Munich, Berlin, or Hamburg, often more than a hundred applicants apply for a single listing. Students and young families in particular spend a large part of their income solely on base rent and utility costs.",
      },
      {
        de: "Deshalb entstehen immer mehr alternative Wohnformen, die Platz und Geld sparen sollen. Neben klassischen Wohngemeinschaften werden sogenannte Mehrgenerationenhäuser immer beliebter: Dort leben ältere Menschen, Familien und Berufstätige unter einem Dach und helfen sich gegenseitig im Alltag, zum Beispiel beim Einkaufen oder bei der Kinderbetreuung.",
        en: "Therefore, more and more alternative living models are emerging to save space and money. Alongside classic shared apartments, so-called multi-generational houses are becoming increasingly popular: older people, families, and working adults live under one roof and help each other in everyday life, for example with shopping or childcare.",
      },
      {
        de: "Gleichzeitig ziehen viele Berufstätige ins Umland, weil sie dank Homeoffice nicht mehr jeden Tag ins Zentrum pendeln müssen. Dort sind die Mieten deutlich günstiger und man hat schneller Zugang zur Natur. Allerdings bleibt eine gute Anbindung an Bus und Bahn entscheidend, damit man im Alltag nicht völlig vom eigenen Auto abhängig ist.",
        en: "At the same time, many working people move to the surrounding suburbs because thanks to remote work they no longer have to commute to the city center every day. There, rents are significantly cheaper and one has faster access to nature. However, a good connection to buses and trains remains crucial so that one is not completely dependent on one's own car in everyday life.",
      },
    ],
    glossary: [
      { word: "bezahlbare", baseForm: "bezahlbar", meaningEn: "affordable", partOfSpeech: "Adjective", exampleDe: "Es ist schwer, eine bezahlbare Wohnung im Zentrum zu finden." },
      { word: "Geduldsprobe", baseForm: "die Geduldsprobe, -n", meaningEn: "test of patience", partOfSpeech: "Noun", exampleDe: "Die lange Wohnungssuche war eine echte Geduldsprobe." },
      { word: "Kaltmiete", baseForm: "die Kaltmiete, -n", meaningEn: "base rent (excluding utilities)", partOfSpeech: "Noun", exampleDe: "Die Kaltmiete beträgt 750 Euro plus 180 Euro Nebenkosten." },
      { word: "Nebenkosten", baseForm: "die Nebenkosten (Pl.)", meaningEn: "utility / additional costs", partOfSpeech: "Noun", exampleDe: "In den Nebenkosten sind Wasser, Heizung und Müllabfuhr enthalten." },
      { word: "Wohngemeinschaften", baseForm: "die Wohngemeinschaft (WG), -en", meaningEn: "shared apartment / flatshare", partOfSpeech: "Noun", exampleDe: "Während des Studiums habe ich drei Jahre in einer WG gewohnt." },
      { word: "gegenseitig", baseForm: "gegenseitig", meaningEn: "mutually / each other", partOfSpeech: "Adverb", exampleDe: "Gute Nachbarn helfen sich gegenseitig im Alltag." },
      { word: "Umland", baseForm: "das Umland (Sg.)", meaningEn: "surrounding region / suburbs", partOfSpeech: "Noun", exampleDe: "Viele Familien ziehen wegen der günstigeren Preise ins Umland." },
      { word: "pendeln", baseForm: "pendeln (pendelte, ist gependelt)", meaningEn: "to commute", partOfSpeech: "Verb", exampleDe: "Er pendelt jeden Morgen 40 Minuten mit dem Zug zur Arbeit." },
      { word: "Anbindung", baseForm: "die Anbindung, -en", meaningEn: "transport connection / link", partOfSpeech: "Noun", exampleDe: "Die Wohnung hat eine hervorragende Anbindung an die U-Bahn." },
    ],
    transferExpressions: [
      { de: "... ist für viele Menschen eine echte Geduldsprobe geworden.", en: "... has become a real test of patience for many people.", useIn: "Sprechen" },
      { de: "Dort leben ... unter einem Dach und helfen sich gegenseitig.", en: "There ... live under one roof and help each other.", useIn: "Beides" },
      { de: "Allerdings bleibt ... entscheidend, damit man nicht ... abhängig ist.", en: "However, ... remains decisive so that one is not dependent on ...", useIn: "Schreiben" },
      { de: "Im Umland sind die Mieten deutlich günstiger.", en: "In the surrounding area, rents are significantly cheaper.", useIn: "Beides" },
    ],
    speakingWritingPromptDe: "Wo möchten Sie lieber wohnen: mitten in der Großstadt oder im ruhigen Umland? Nennen Sie je einen Vorteil!",
    speakingWritingPromptEn: "Where would you rather live: right in the big city or in the quiet suburbs? Name one advantage of each!",
    source: "curated",
  },
  {
    id: "read-b1-living-02",
    categoryId: "voc-living",
    level: "B1",
    titleDe: "Gute Nachbarschaft im Mietshaus: Kleine Regeln für ein entspanntes Zusammenleben",
    titleEn: "Good Neighborliness in an Apartment Building: Small Rules for Relaxed Living Together",
    summaryEn:
      "Explains German Hausordnung customs, Ruhezeiten, and how polite communication prevents conflicts between neighbors.",
    sourceStyle: "Alltags-Ratgeber / VHS Lernportal Style (B1)",
    sourceUrl: "https://www.vhs-lernportal.de/",
    readingMinutes: 3,
    paragraphs: [
      {
        de: "Wenn viele unterschiedliche Menschen in einem Mehrfamilienhaus zusammenleben, treffen verschiedene Lebensgewohnheiten aufeinander. Während die einen früh aufstehen und abends früh schlafen gehen, hören andere vielleicht gern nach Feierabend laute Musik oder laden am Wochenende Freunde ein. Damit es dabei nicht zu Streit kommt, gibt es in fast jedem deutschen Mietshaus eine Hausordnung.",
        en: "When many different people live together in an apartment building, different lifestyle habits meet. While some get up early and go to sleep early in the evening, others perhaps like listening to loud music after work or inviting friends over on the weekend. So that this does not lead to arguments, almost every German apartment building has house rules.",
      },
      {
        de: "Ein wichtiger Punkt dieser Regeln sind die sogenannten Ruhezeiten, normalerweise zwischen 22 Uhr abends und 6 Uhr morgens sowie an Sonn- und Feiertagen. In dieser Zeit sollte man nicht bohren, saugen oder laute Partys feiern. Wer dennoch einmal Geburtstag feiern möchte, hängt am besten ein paar Tage vorher einen freundlichen Zettel im Treppenhaus auf und informiert die Nachbarn rechtzeitig.",
        en: "An important point of these rules are the so-called quiet hours, normally between 10 p.m. and 6 a.m. as well as on Sundays and public holidays. During this time one should not drill, vacuum, or throw loud parties. Anyone who still wants to celebrate a birthday once does best to put up a friendly note in the stairwell a few days beforehand and inform the neighbors in good time.",
      },
      {
        de: "Noch hilfreicher als strenge Vorschriften ist jedoch gegenseitige Rücksichtnahme und ein offenes Gespräch. Wenn man sich im Treppenhaus freundlich grüßt, ab und zu ein Paket für den Nachbarn annimmt oder im Urlaub die Blumen gießt, entsteht schnell Vertrauen. So fühlt man sich im eigenen Zuhause nicht nur sicher, sondern wirklich willkommen.",
        en: "Even more helpful than strict regulations, however, is mutual consideration and an open conversation. When you greet each other kindly in the stairwell, occasionally accept a package for your neighbor, or water their flowers during vacation, trust develops quickly. That way you feel not only safe in your own home, but truly welcome.",
      },
    ],
    glossary: [
      { word: "Mehrfamilienhaus", baseForm: "das Mehrfamilienhaus, -häuser", meaningEn: "apartment building", partOfSpeech: "Noun", exampleDe: "Ich wohne im dritten Stock eines ruhigen Mehrfamilienhauses." },
      { word: "Hausordnung", baseForm: "die Hausordnung, -en", meaningEn: "house rules", partOfSpeech: "Noun", exampleDe: "In der Hausordnung stehen die genauen Ruhezeiten." },
      { word: "Ruhezeiten", baseForm: "die Ruhezeit, -en", meaningEn: "quiet hours", partOfSpeech: "Noun", exampleDe: "Ab 22 Uhr gilt im ganzen Haus die Nachtruhe." },
      { word: "Treppenhaus", baseForm: "das Treppenhaus, -häuser", meaningEn: "stairwell / staircase", partOfSpeech: "Noun", exampleDe: "Im Treppenhaus dürfen keine Fahrräder abgestellt werden." },
      { word: "rechtzeitig", baseForm: "rechtzeitig", meaningEn: "in good time / early enough", partOfSpeech: "Adverb", exampleDe: "Bitte sag mir rechtzeitig Bescheid, falls du später kommst." },
      { word: "Vorschriften", baseForm: "die Vorschrift, -en", meaningEn: "regulation / rule", partOfSpeech: "Noun", exampleDe: "Manchmal reichen freundliche Gespräche besser als strenge Vorschriften." },
      { word: "Rücksichtnahme", baseForm: "die Rücksichtnahme (Sg.)", meaningEn: "consideration (for others)", partOfSpeech: "Noun", exampleDe: "Gegenseitige Rücksichtnahme ist die Basis für gute Nachbarschaft." },
      { word: "Vertrauen", baseForm: "das Vertrauen (Sg.)", meaningEn: "trust", partOfSpeech: "Noun", exampleDe: "Durch kleine Hilfsbereitschaft entsteht schnell Vertrauen." },
    ],
    transferExpressions: [
      { de: "Damit es dabei nicht zu Streit kommt, sollte man ...", en: "So that this does not lead to arguments, one should ...", useIn: "Beides" },
      { de: "Am besten hängt man ein paar Tage vorher einen freundlichen Zettel auf.", en: "Best of all, one puts up a friendly note a few days beforehand.", useIn: "Sprechen" },
      { de: "Noch hilfreicher als strenge Vorschriften ist gegenseitige Rücksichtnahme.", en: "Even more helpful than strict regulations is mutual consideration.", useIn: "Schreiben" },
      { de: "So fühlt man sich im eigenen Zuhause wirklich willkommen.", en: "That way one feels truly welcome in one's own home.", useIn: "Beides" },
    ],
    speakingWritingPromptDe: "Was tun Sie, wenn ein Nachbar abends sehr laut ist? Würden Sie direkt klingeln oder lieber eine Nachricht schreiben?",
    speakingWritingPromptEn: "What do you do if a neighbor is very loud in the evening? Would you ring their bell directly or prefer writing a note?",
    source: "curated",
  },

  // =========================================================================
  // 3. GESUNDHEIT, ERNÄHRUNG & SPORT (voc-health)
  // =========================================================================
  {
    id: "read-b1-health-01",
    categoryId: "voc-health",
    level: "B1",
    titleDe: "Bewegung im Alltag: Warum schon 20 Minuten Spazierengehen Körper und Kopf stärken",
    titleEn: "Everyday Movement: Why Just 20 Minutes of Walking Strengthen Body and Mind",
    summaryEn:
      "Shows why everyday movement beats extreme gym resolutions and reduces stress, back pain, and fatigue.",
    sourceStyle: "Gesundheits-Magazin / DW Style (B1)",
    sourceUrl: "https://learngerman.dw.com/de/top-thema/s-55861562",
    readingMinutes: 3,
    paragraphs: [
      {
        de: "Viele Menschen verbringen heute acht oder mehr Stunden täglich im Sitzen – am Schreibtisch, im Auto oder abends vor dem Fernseher. Dabei weiß man längst, dass Bewegungsmangel langfristig zu Rückenschmerzen, Müdigkeit und Herz-Kreislauf-Problemen führen kann. Trotzdem fehlt nach einem langen Arbeitstag oft die Energie für ein anstrengendes Training im Fitnessstudio.",
        en: "Many people today spend eight or more hours a day sitting — at a desk, in a car, or in the evening in front of the TV. Yet it has long been known that lack of exercise can lead to back pain, fatigue, and cardiovascular problems in the long term. Nevertheless, after a long workday there is often a lack of energy for a strenuous workout at the gym.",
      },
      {
        de: "Mediziner haben jedoch eine beruhigende Nachricht: Man muss kein Hochleistungssportler sein, um etwas für seine Gesundheit zu tun. Schon ein zügiger Spaziergang von zwanzig Minuten pro Tag regt den Kreislauf an, baut Stresshormone ab und verbessert die Konzentration deutlich. Wer zudem öfter die Treppe statt des Aufzugs nimmt oder kurze Strecken mit dem Fahrrad fährt, sammelt ganz nebenbei wertvolle Bewegung.",
        en: "Doctors, however, have reassuring news: you do not have to be a competitive athlete to do something for your health. Even a brisk twenty-minute walk per day stimulates circulation, breaks down stress hormones, and significantly improves concentration. Anyone who also takes the stairs instead of the elevator more often or rides a bicycle for short distances gathers valuable exercise effortlessly along the way.",
      },
      {
        de: "Entscheidend für den Erfolg ist nicht die perfekte Leistung, sondern die Regelmäßigkeit. Am einfachsten gelingt es, wenn man Bewegung fest in den Alltag einplant – zum Beispiel in der Mittagspause mit einer Kollegin oder abends beim Hören eines interessanten Podcasts. Schon nach wenigen Wochen spüren die meisten Menschen, dass sie besser schlafen und ausgeglichener sind.",
        en: "Decisive for success is not perfect performance, but regularity. It succeeds most easily when one schedules movement firmly into daily life — for example during the lunch break with a colleague or in the evening while listening to an interesting podcast. After just a few weeks, most people feel that they sleep better and are more balanced.",
      },
    ],
    glossary: [
      { word: "Bewegungsmangel", baseForm: "der Bewegungsmangel (Sg.)", meaningEn: "lack of exercise", partOfSpeech: "Noun", exampleDe: "Bewegungsmangel ist eine häufige Ursache für Rückenschmerzen." },
      { word: "langfristig", baseForm: "langfristig", meaningEn: "in the long term", partOfSpeech: "Adjective/Adv.", exampleDe: "Gesunde Gewohnheiten zahlen sich langfristig aus." },
      { word: "anstrengendes", baseForm: "anstrengend", meaningEn: "strenuous / exhausting", partOfSpeech: "Adjective", exampleDe: "Nach einer anstrengenden Woche brauche ich Ruhe." },
      { word: "zügiger", baseForm: "zügig", meaningEn: "brisk / swift", partOfSpeech: "Adjective", exampleDe: "Ein zügiger Spaziergang am Morgen macht sofort wach." },
      { word: "Kreislauf", baseForm: "der Kreislauf (Sg.)", meaningEn: "circulation", partOfSpeech: "Noun", exampleDe: "Frische Luft und Bewegung bringen den Kreislauf in Schwung." },
      { word: "Regelmäßigkeit", baseForm: "die Regelmäßigkeit (Sg.)", meaningEn: "regularity / consistency", partOfSpeech: "Noun", exampleDe: "Beim Sprachenlernen zählt vor allem Regelmäßigkeit." },
      { word: "einplant", baseForm: "einplanen (plante ein, hat eingeplant)", meaningEn: "to schedule / plan in", partOfSpeech: "Verb", exampleDe: "Ich plane jeden Tag 30 Minuten für Sport ein." },
      { word: "ausgeglichener", baseForm: "ausgeglichen", meaningEn: "balanced / calm", partOfSpeech: "Adjective", exampleDe: "Seit ich regelmäßig jogge, bin ich viel ausgeglichener." },
    ],
    transferExpressions: [
      { de: "Dabei weiß man längst, dass ... langfristig zu ... führen kann.", en: "Yet it has long been known that ... can lead to ... in the long term.", useIn: "Schreiben" },
      { de: "Entscheidend für den Erfolg ist nicht ..., sondern die Regelmäßigkeit.", en: "Decisive for success is not ..., but regularity.", useIn: "Beides" },
      { de: "Wer öfter die Treppe statt des Aufzugs nimmt, tut etwas für seine Gesundheit.", en: "Anyone who takes the stairs instead of the elevator more often does something for their health.", useIn: "Sprechen" },
      { de: "Schon nach wenigen Wochen spürt man, dass man besser schläft.", en: "After just a few weeks you feel that you sleep better.", useIn: "Beides" },
    ],
    speakingWritingPromptDe: "Wie bringen Sie Bewegung in Ihren Alltag, auch wenn Sie wenig Zeit haben?",
    speakingWritingPromptEn: "How do you fit movement into your daily routine, even when you have little time?",
    source: "curated",
  },
  {
    id: "read-b1-health-02",
    categoryId: "voc-health",
    level: "B1",
    titleDe: "Gesund kochen trotz Zeitmangel: Wie „Meal Prep“ den Feierabend entspannt",
    titleEn: "Cooking Healthily Despite Time Pressure: How 'Meal Prep' Relaxes Your Evening",
    summaryEn:
      "Looks at why people reach for fast food after work and how preparing meals ahead saves money, stress, and food waste.",
    sourceStyle: "Ernährungs-Blog / Alltags-Magazin (B1)",
    sourceUrl: "https://learngerman.dw.com/de/b1/s-60953674",
    readingMinutes: 3,
    paragraphs: [
      {
        de: "Wer abends hungrig und müde nach Hause kommt, hat selten Lust, noch lange Gemüse zu schneiden und aufwendig zu kochen. Häufig greift man dann doch zu Fertiggerichten oder bestellt etwas beim Lieferdienst. Auf Dauer ist das jedoch nicht nur ziemlich teuer, sondern enthält oft auch viel Zucker, Salz und ungesunde Fette.",
        en: "Anyone who comes home hungry and tired in the evening rarely feels like chopping vegetables for a long time and cooking elaborately. Often one reaches for ready-made meals after all or orders something from a delivery service. In the long run, however, that is not only quite expensive, but also often contains a lot of sugar, salt, and unhealthy fats.",
      },
      {
        de: "Eine praktische Lösung, die immer mehr Berufstätige und Studierende nutzen, heißt „Meal Prep“ – also das gezielte Vorkochen für mehrere Tage. Am Sonntag kocht man beispielsweise eine größere Portion Reis, Linsen oder Ofengemüse und bewahrt alles gut verpackt im Kühlschrank auf. Unter der Woche lässt sich daraus in wenigen Minuten eine abwechslungsreiche Mahlzeit zusammenstellen.",
        en: "A practical solution that more and more working people and students use is called 'meal prep' — meaning purposeful cooking ahead for several days. On Sunday, for example, you cook a larger portion of rice, lentils, or roasted vegetables and store everything well-packed in the refrigerator. During the week, a varied meal can be put together from it in just a few minutes.",
      },
      {
        de: "Neben der Zeitersparnis hat das Vorkochen noch einen weiteren Vorteil: Man kauft gezielter mit einer Einkaufsliste ein und wirft deutlich weniger Lebensmittel weg. Natürlich muss man nicht jede Mahlzeit perfekt vorausplanen – aber schon zwei oder drei vorbereitete Gerichte pro Woche machen den Alltag gesünder und entspannter.",
        en: "Besides saving time, cooking ahead has yet another advantage: you shop more purposefully with a shopping list and throw away significantly less food. Of course you do not have to plan every meal perfectly in advance — but even two or three prepared dishes per week make everyday life healthier and more relaxed.",
      },
    ],
    glossary: [
      { word: "aufwendig", baseForm: "aufwendig", meaningEn: "elaborate / time-consuming", partOfSpeech: "Adjective", exampleDe: "Unter der Woche koche ich lieber schnell statt aufwendig." },
      { word: "Fertiggerichten", baseForm: "das Fertiggericht, -e", meaningEn: "ready-made meal", partOfSpeech: "Noun", exampleDe: "Fertiggerichte enthalten oft zu viel Salz und Zucker." },
      { word: "Auf Dauer", baseForm: "auf Dauer", meaningEn: "in the long run", partOfSpeech: "Phrase", exampleDe: "Auf Dauer ist tägliches Bestellen ziemlich teuer." },
      { word: "Vorkochen", baseForm: "das Vorkochen (Sg.)", meaningEn: "cooking ahead / batch cooking", partOfSpeech: "Noun", exampleDe: "Durch das Vorkochen am Sonntag spare ich unter der Woche viel Zeit." },
      { word: "abwechslungsreiche", baseForm: "abwechslungsreich", meaningEn: "varied / diverse", partOfSpeech: "Adjective", exampleDe: "Eine abwechslungsreiche Ernährung hält Körper und Geist fit." },
      { word: "Zeitersparnis", baseForm: "die Zeitersparnis (Sg.)", meaningEn: "time saving", partOfSpeech: "Noun", exampleDe: "Die größte Zeitersparnis bringt eine gute Wochenplanung." },
      { word: "Lebensmittel", baseForm: "das Lebensmittel, -", meaningEn: "food / groceries", partOfSpeech: "Noun", exampleDe: "Wir sollten bewusster einkaufen und keine Lebensmittel wegwerfen." },
    ],
    transferExpressions: [
      { de: "Auf Dauer ist das jedoch nicht nur teuer, sondern auch ungesund.", en: "In the long run, however, that is not only expensive, but also unhealthy.", useIn: "Schreiben" },
      { de: "Neben der Zeitersparnis hat das noch einen weiteren Vorteil: ...", en: "Besides saving time, this has yet another advantage: ...", useIn: "Beides" },
      { de: "Man kauft gezielter ein und wirft deutlich weniger weg.", en: "One shops more purposefully and throws away significantly less.", useIn: "Sprechen" },
      { de: "Natürlich muss man nicht alles perfekt planen, aber ...", en: "Of course one does not have to plan everything perfectly, but ...", useIn: "Beides" },
    ],
    speakingWritingPromptDe: "Kochen Sie unter der Woche selbst frisch oder greifen Sie manchmal zu schnellen Alternativen? Erzählen Sie kurz!",
    speakingWritingPromptEn: "Do you cook fresh meals yourself during the week or sometimes reach for quick alternatives? Tell briefly!",
    source: "curated",
  },

  // =========================================================================
  // 4. REISEN, VERKEHR & MOBILITÄT (voc-travel)
  // =========================================================================
  {
    id: "read-b1-travel-01",
    categoryId: "voc-travel",
    level: "B1",
    titleDe: "Mit dem Deutschlandticket unterwegs: Lohnt sich der Umstieg auf Bus und Bahn?",
    titleEn: "On the Road with the Deutschlandticket: Is Switching to Bus and Train Worth It?",
    summaryEn:
      "Evaluates Germany's nationwide regional transit pass — its huge convenience and affordability versus rural gaps and train delays.",
    sourceStyle: "Mobilitäts-Report / DW Top-Thema Style (B1)",
    sourceUrl: "https://learngerman.dw.com/de/top-thema/s-55861562",
    readingMinutes: 3,
    paragraphs: [
      {
        de: "Seit der Einführung des Deutschlandtickets hat sich der öffentliche Nahverkehr für Millionen Fahrgäste spürbar vereinfacht. Mit einem einzigen monatlichen Abo kann man im ganzen Land alle Busse, Straßenbahnen, U-Bahnen und Regionalzüge nutzen, ohne komplizierte Tarifzonen vergleichen zu müssen. Besonders für Berufspendler und Ausflügler am Wochenende ist das Angebot äußerst attraktiv.",
        en: "Since the introduction of the Deutschlandticket, public local transport has become noticeably simpler for millions of passengers. With a single monthly subscription, you can use all buses, trams, subways, and regional trains nationwide without having to compare complicated fare zones. The offer is especially attractive for daily commuters and weekend day-trippers.",
      },
      {
        de: "Befürworter loben vor allem den positiven Effekt für den Klimaschutz und den Geldbeutel. Viele Stadtbewohner lassen das eigene Auto inzwischen häufiger stehen oder überlegen sogar, es ganz abzuschaffen. Denn im Vergleich zu Benzin, Versicherung und Parkgebühren ist das Ticket deutlich günstiger.",
        en: "Supporters above all praise the positive effect for climate protection and wallets. Many city residents now leave their own car parked more often or even consider getting rid of it altogether. Because compared to gasoline, insurance, and parking fees, the ticket is significantly cheaper.",
      },
      {
        de: "Kritiker weisen jedoch darauf hin, dass ein günstiger Preis allein noch nicht ausreicht. Auf dem Land fahren Busse oft nur selten, und im Regionalverkehr kommt es immer wieder zu Verspätungen oder Zugausfällen. Damit wirklich mehr Menschen dauerhaft umsteigen, muss deshalb nicht nur der Preis fair bleiben, sondern auch kräftig in pünktliche Züge und moderne Strecken investiert werden.",
        en: "Critics point out, however, that a low price alone is not enough. In the countryside, buses often run only rarely, and in regional rail there are repeated delays or train cancellations. So that more people truly switch permanently, not only must the price stay fair, but heavy investment must also be made in punctual trains and modern routes.",
      },
    ],
    glossary: [
      { word: "Nahverkehr", baseForm: "der öffentliche Nahverkehr (ÖPNV)", meaningEn: "public local transport", partOfSpeech: "Noun", exampleDe: "Der öffentliche Nahverkehr sollte zuverlässig und bezahlbar sein." },
      { word: "Fahrgäste", baseForm: "der Fahrgast, -gäste", meaningEn: "passenger", partOfSpeech: "Noun", exampleDe: "Viele Fahrgäste ärgern sich über plötzliche Verspätungen." },
      { word: "Tarifzonen", baseForm: "die Tarifzone, -n", meaningEn: "fare zone", partOfSpeech: "Noun", exampleDe: "Früher musste man genau wissen, welche Tarifzone man braucht." },
      { word: "Befürworter", baseForm: "der Befürworter, -", meaningEn: "supporter / advocate", partOfSpeech: "Noun", exampleDe: "Befürworter sehen darin einen wichtigen Schritt für den Klimaschutz." },
      { word: "abzuschaffen", baseForm: "abschaffen (schaffte ab, hat abgeschafft)", meaningEn: "to abolish / get rid of", partOfSpeech: "Verb", exampleDe: "In der Großstadt überlegen viele, ihr Auto abzuschaffen." },
      { word: "weisen ... darauf hin", baseForm: "hinweisen auf (+ Akk.)", meaningEn: "to point out", partOfSpeech: "Verb", exampleDe: "Kritiker weisen darauf hin, dass auf dem Land Busse fehlen." },
      { word: "Zugausfällen", baseForm: "der Zugausfall, -fälle", meaningEn: "train cancellation", partOfSpeech: "Noun", exampleDe: "Wegen eines Zugausfalls kam ich zu spät zum Termin." },
      { word: "dauerhaft", baseForm: "dauerhaft", meaningEn: "permanently / lastingly", partOfSpeech: "Adjective/Adv.", exampleDe: "Nur mit guter Qualität steigen Menschen dauerhaft auf die Bahn um." },
    ],
    transferExpressions: [
      { de: "Befürworter loben vor allem ..., Kritiker weisen jedoch darauf hin, dass ...", en: "Supporters praise above all ..., critics point out, however, that ...", useIn: "Schreiben" },
      { de: "Im Vergleich zu ... ist diese Lösung deutlich günstiger.", en: "Compared to ..., this solution is significantly cheaper.", useIn: "Beides" },
      { de: "Ein günstiger Preis allein reicht noch nicht aus.", en: "A low price alone is not enough.", useIn: "Beides" },
      { de: "Damit mehr Menschen dauerhaft umsteigen, muss in ... investiert werden.", en: "So that more people switch permanently, investment must be made in ...", useIn: "Schreiben" },
    ],
    speakingWritingPromptDe: "Wie fahren Sie im Alltag meistens zur Arbeit oder zum Kurs – mit Bus und Bahn, dem Fahrrad oder dem Auto?",
    speakingWritingPromptEn: "How do you usually get to work or class in daily life — by bus and train, bicycle, or car?",
    source: "curated",
  },
  {
    id: "read-b1-travel-02",
    categoryId: "voc-travel",
    level: "B1",
    titleDe: "Nachhaltig reisen in Europa: Warum Nachtzüge wieder im Trend liegen",
    titleEn: "Sustainable Travel in Europe: Why Night Trains Are Trending Again",
    summaryEn:
      "Explores the comeback of European sleeper trains — combining climate-friendly travel with waking up right in the city center.",
    sourceStyle: "Reise-Magazin / Deutschland.de Style (B1)",
    sourceUrl: "https://www.deutschland.de/de/topic/leben/reisen-in-deutschland",
    readingMinutes: 3,
    paragraphs: [
      {
        de: "Vor zwanzig Jahren galten Nachtzüge als veraltet, weil Billigflüge schneller und oft sogar billiger waren. Heute erleben sie jedoch ein überraschendes Comeback in ganz Europa. Immer mehr Reisende möchten ihren CO₂-Fußabdruck verringern und suchen nach einer umweltfreundlichen Alternative zum Kurzstreckenflug.",
        en: "Twenty years ago, night trains were considered outdated because budget flights were faster and often even cheaper. Today, however, they are experiencing a surprising comeback across Europe. More and more travelers want to reduce their carbon footprint and are looking for an eco-friendly alternative to short-haul flights.",
      },
      {
        de: "Der große Reiz eines Nachtzugs liegt in seiner Bequemlichkeit: Man steigt abends entspannt am Hauptbahnhof ein, schläft im Liege- oder Schlafwagen und wacht am nächsten Morgen direkt im Zentrum von Wien, Zürich oder Mailand auf. Lange Wartezeiten bei der Sicherheitskontrolle am Flughafen und teure Transfers aus der Innenstadt fallen komplett weg.",
        en: "The great appeal of a night train lies in its convenience: you board relaxed at the main station in the evening, sleep in a couchette or sleeper car, and wake up the next morning right in the center of Vienna, Zurich, or Milan. Long waiting times at airport security and expensive transfers from the city center are eliminated completely.",
      },
      {
        de: "Trotzdem gibt es noch einige Nachteile: Wer kurzfristig bucht, muss oft tief in die Tasche greifen, und für sehr weite Strecken bleibt das Flugzeug zeitlich kaum zu schlagen. Wer seine Reise aber rechtzeitig plant und das Unterwegssein selbst als Teil des Urlaubs genießt, findet im Nachtzug eine entschleunigte und klimafreundliche Art zu reisen.",
        en: "Nevertheless, there are still some drawbacks: anyone who books at short notice often has to dig deep into their pockets, and for very long distances the airplane remains hard to beat in terms of time. However, anyone who plans their trip in good time and enjoys being on the way itself as part of the vacation finds in the night train a slowed-down and climate-friendly way to travel.",
      },
    ],
    glossary: [
      { word: "veraltet", baseForm: "veraltet", meaningEn: "outdated / obsolete", partOfSpeech: "Adjective", exampleDe: "Diese Technik wirkt heute völlig veraltet." },
      { word: "verringern", baseForm: "verringern (verringerte, hat verringert)", meaningEn: "to reduce / decrease", partOfSpeech: "Verb", exampleDe: "Wir können unseren Energieverbrauch im Alltag leicht verringern." },
      { word: "Kurzstreckenflug", baseForm: "der Kurzstreckenflug, -flüge", meaningEn: "short-haul flight", partOfSpeech: "Noun", exampleDe: "Für Kurzstreckenflüge gibt es oft gute Zugverbindungen." },
      { word: "Bequemlichkeit", baseForm: "die Bequemlichkeit (Sg.)", meaningEn: "convenience / comfort", partOfSpeech: "Noun", exampleDe: "Aus Bequemlichkeit bestellen viele lieber online." },
      { word: "Sicherheitskontrolle", baseForm: "die Sicherheitskontrolle, -n", meaningEn: "security check", partOfSpeech: "Noun", exampleDe: "An der Sicherheitskontrolle mussten wir 45 Minuten warten." },
      { word: "kurzfristig", baseForm: "kurzfristig", meaningEn: "at short notice", partOfSpeech: "Adjective/Adv.", exampleDe: "Leider muss ich den Termin kurzfristig absagen." },
      { word: "tief in die Tasche greifen", baseForm: "tief in die Tasche greifen (Idiom)", meaningEn: "to pay a lot of money / dig deep", partOfSpeech: "Idiom", exampleDe: "In der Hauptsaison muss man für Hotels tief in die Tasche greifen." },
      { word: "entschleunigte", baseForm: "entschleunigt", meaningEn: "slowed-down / unhurried", partOfSpeech: "Adjective", exampleDe: "Im Urlaub genieße ich ein entschleunigtes Leben ohne Zeitdruck." },
    ],
    transferExpressions: [
      { de: "Der große Reiz liegt in seiner Bequemlichkeit.", en: "The great appeal lies in its convenience.", useIn: "Beides" },
      { de: "Lange Wartezeiten ... fallen dabei komplett weg.", en: "Long waiting times ... are completely eliminated in the process.", useIn: "Sprechen" },
      { de: "Wer kurzfristig bucht, muss oft tief in die Tasche greifen.", en: "Anyone who books at short notice often has to pay a lot.", useIn: "Beides" },
      { de: "Immer mehr Reisende suchen nach einer umweltfreundlichen Alternative zu ...", en: "More and more travelers are looking for an eco-friendly alternative to ...", useIn: "Schreiben" },
    ],
    speakingWritingPromptDe: "Würden Sie für eine Reise durch Europa lieber den Nachtzug oder das Flugzeug nehmen? Warum?",
    speakingWritingPromptEn: "Would you rather take a night train or an airplane for a trip through Europe? Why?",
    source: "curated",
  },

  // =========================================================================
  // 5. UMWELT, NATUR & KONSUM (voc-environment)
  // =========================================================================
  {
    id: "read-b1-env-01",
    categoryId: "voc-environment",
    level: "B1",
    titleDe: "Weniger Plastik im Alltag: Wie Unverpackt-Läden und Mehrwegsysteme funktionieren",
    titleEn: "Less Plastic in Daily Life: How Zero-Waste Stores and Reusable Systems Work",
    summaryEn:
      "Examines Germany's packaging waste challenge and how reusable deposit containers and unpackaged shopping help reduce trash.",
    sourceStyle: "Umwelt-Magazin / DW Style (B1)",
    sourceUrl: "https://learngerman.dw.com/de/top-thema/s-55861562",
    readingMinutes: 3,
    paragraphs: [
      {
        de: "Jedes Jahr entstehen in Deutschland Millionen Tonnen Verpackungsmüll – ein großer Teil davon stammt aus Supermärkten und vom Essen zum Mitnehmen. Ob Obst in Plastikschalen oder Kaffee im Einwegbecher: Viele Verpackungen werden nur wenige Minuten genutzt und landen sofort im Müll. Das belastet nicht nur die Umwelt, sondern verbraucht auch enorme Mengen Energie und Rohstoffe.",
        en: "Every year, millions of tons of packaging waste are generated in Germany — a large part of it comes from supermarkets and takeaway food. Whether fruit in plastic trays or coffee in disposable cups: many packages are used for only a few minutes and immediately end up in the trash. This not only burdens the environment, but also consumes enormous amounts of energy and raw materials.",
      },
      {
        de: "Um diesen Trend zu stoppen, setzen immer mehr Städte und Geschäfte auf Mehrwegsysteme. In vielen Cafés und Restaurants können Kundinnen und Kunden ihre Speisen gegen ein kleines Pfand in stabilen Behältern mitnehmen und diese später einfach zurückgeben. Auch in sogenannten Unverpackt-Läden bringt man eigene Gläser oder Stoffbeutel mit und füllt genau die Menge ab, die man tatsächlich braucht.",
        en: "To stop this trend, more and more cities and shops rely on reusable systems. In many cafés and restaurants, customers can take their food in sturdy containers for a small deposit and simply return them later. In so-called zero-waste stores as well, you bring your own jars or cloth bags and fill up the exact amount you actually need.",
      },
      {
        de: "Zwar erfordert das Einkaufen ohne Verpackung am Anfang etwas mehr Planung, doch im Alltag wird es schnell zur Routine. Niemand muss von heute auf morgen komplett müllfrei leben – schon kleine Schritte wie eine eigene Trinkflasche, ein Stoffbeutel in der Tasche und regionale Produkte vom Wochenmarkt bewirken gemeinsam sehr viel.",
        en: "Although shopping without packaging requires a bit more planning at the beginning, it quickly becomes routine in everyday life. Nobody has to live completely zero-waste overnight — even small steps like your own water bottle, a cloth bag in your pocket, and regional products from the weekly market achieve a great deal together.",
      },
    ],
    glossary: [
      { word: "Verpackungsmüll", baseForm: "der Verpackungsmüll (Sg.)", meaningEn: "packaging waste", partOfSpeech: "Noun", exampleDe: "Beim Online-Shopping fällt leider sehr viel Verpackungsmüll an." },
      { word: "Einwegbecher", baseForm: "der Einwegbecher, -", meaningEn: "disposable cup", partOfSpeech: "Noun", exampleDe: "Ich benutze meinen eigenen Thermobecher statt Einwegbecher." },
      { word: "belastet", baseForm: "belasten (belastete, hat belastet)", meaningEn: "to burden / strain / pollute", partOfSpeech: "Verb", exampleDe: "Lärm und Abgase belasten die Gesundheit der Bewohner." },
      { word: "Rohstoffe", baseForm: "der Rohstoff, -e", meaningEn: "raw material", partOfSpeech: "Noun", exampleDe: "Durch Recycling sparen wir wertvolle Rohstoffe." },
      { word: "Mehrwegsysteme", baseForm: "das Mehrwegsystem, -e", meaningEn: "reusable / returnable system", partOfSpeech: "Noun", exampleDe: "Mehrwegsysteme helfen dabei, tausende Becher zu sparen." },
      { word: "Pfand", baseForm: "das Pfand (Sg.)", meaningEn: "deposit (bottle/container)", partOfSpeech: "Noun", exampleDe: "In Deutschland bekommt man für leere Flaschen das Pfand zurück." },
      { word: "Routine", baseForm: "die Routine (Sg.)", meaningEn: "routine / habit", partOfSpeech: "Noun", exampleDe: "Mülltrennen wird nach kurzer Zeit ganz selbstverständlich zur Routine." },
      { word: "bewirken", baseForm: "bewirken (bewirkte, hat bewirkt)", meaningEn: "to achieve / bring about", partOfSpeech: "Verb", exampleDe: "Schon kleine Änderungen im Alltag können viel bewirken." },
    ],
    transferExpressions: [
      { de: "Das belastet nicht nur die Umwelt, sondern verbraucht auch ...", en: "That not only burdens the environment, but also consumes ...", useIn: "Schreiben" },
      { de: "Zwar erfordert ... am Anfang etwas mehr Planung, doch es wird schnell zur Routine.", en: "Although ... requires a bit more planning at first, it quickly becomes routine.", useIn: "Beides" },
      { de: "Niemand muss von heute auf morgen perfekt sein, aber ...", en: "Nobody has to be perfect overnight, but ...", useIn: "Sprechen" },
      { de: "Schon kleine Schritte im Alltag bewirken gemeinsam sehr viel.", en: "Even small steps in everyday life achieve a great deal together.", useIn: "Beides" },
    ],
    speakingWritingPromptDe: "Was tun Sie selbst im Alltag, um Müll oder Plastik zu vermeiden?",
    speakingWritingPromptEn: "What do you yourself do in everyday life to avoid trash or plastic?",
    source: "curated",
  },
  {
    id: "read-b1-env-02",
    categoryId: "voc-environment",
    level: "B1",
    titleDe: "Reparieren statt wegwerfen: In Repair-Cafés bekommen alte Geräte eine zweite Chance",
    titleEn: "Repairing Instead of Throwing Away: Old Devices Get a Second Chance in Repair Cafés",
    summaryEn:
      "Introduces Germany's popular volunteer Repair-Cafés where people fix broken appliances, save money, and meet neighbors.",
    sourceStyle: "Nachhaltigkeits-Report / Nachrichtenleicht Style (B1)",
    sourceUrl: "https://www.nachrichtenleicht.de/",
    readingMinutes: 3,
    paragraphs: [
      {
        de: "Wenn der Toaster streikt, der Reißverschluss der Jacke klemmt oder das Fahrrad ein defektes Licht hat, kaufen viele Menschen heute sofort etwas Neues. Häufig lohnt sich eine professionelle Reparatur finanziell kaum, weil Ersatzteile teuer sind und neue Produkte sehr günstig angeboten werden. Die Folge sind riesige Berge an Elektroschrott.",
        en: "When the toaster breaks down, the jacket zipper jams, or the bicycle has a broken light, many people today immediately buy something new. Often a professional repair is barely worth it financially because spare parts are expensive and new products are offered very cheaply. The consequence is huge mountains of electronic waste.",
      },
      {
        de: "Genau dagegen setzen sogenannte Repair-Cafés ein klares Zeichen. In hunderten deutschen Städten treffen sich dort einmal im Monat ehrenamtliche Bastler, Techniker und Schneiderinnen. Besucher bringen ihre kaputten Gegenstände mit und reparieren sie gemeinsam mit den Experten – meistens kostenlos oder gegen eine kleine Spende für Kaffee und Kuchen.",
        en: "It is precisely against this that so-called Repair Cafés set a clear example. In hundreds of German cities, volunteer tinkerers, technicians, and seamstresses meet there once a month. Visitors bring their broken items along and repair them together with the experts — usually free of charge or for a small donation for coffee and cake.",
      },
      {
        de: "Das Besondere an dieser Idee ist, dass man nicht nur ein funktionierendes Gerät mit nach Hause nimmt, sondern auch etwas Neues lernt. Außerdem entstehen bei einer Tasse Kaffee schnell nette Gespräche zwischen ganz unterschiedlichen Generationen. So verbinden Repair-Cafés Umweltschutz, Sparsamkeit und Gemeinschaft auf wunderbar einfache Weise.",
        en: "The special thing about this idea is that you do not only take a working device back home, but also learn something new. Moreover, over a cup of coffee, friendly conversations quickly arise between completely different generations. Thus Repair Cafés combine environmental protection, thriftiness, and community in a wonderfully simple way.",
      },
    ],
    glossary: [
      { word: "defektes", baseForm: "defekt", meaningEn: "broken / defective", partOfSpeech: "Adjective", exampleDe: "Der Aufzug ist leider seit gestern defekt." },
      { word: "Ersatzteile", baseForm: "das Ersatzteil, -e", meaningEn: "spare part", partOfSpeech: "Noun", exampleDe: "Oft muss man nur ein kleines Ersatzteil austauschen." },
      { word: "Elektroschrott", baseForm: "der Elektroschrott (Sg.)", meaningEn: "electronic waste (e-waste)", partOfSpeech: "Noun", exampleDe: "Alte Handys gehören nicht in den Hausmüll, sondern zum Elektroschrott." },
      { word: "ehrenamtliche", baseForm: "ehrenamtlich", meaningEn: "voluntary / unpaid", partOfSpeech: "Adjective", exampleDe: "Sie engagiert sich ehrenamtlich im Sportverein." },
      { word: "Gegenstände", baseForm: "der Gegenstand, -stände", meaningEn: "object / item", partOfSpeech: "Noun", exampleDe: "Alltägliche Gegenstände kann man oft selbst reparieren." },
      { word: "Spende", baseForm: "die Spende, -n", meaningEn: "donation", partOfSpeech: "Noun", exampleDe: "Der Eintritt ist frei, aber wir freuen uns über eine kleine Spende." },
      { word: "Sparsamkeit", baseForm: "die Sparsamkeit (Sg.)", meaningEn: "thriftiness / frugality", partOfSpeech: "Noun", exampleDe: "Sparsamkeit und Qualität schließen sich nicht aus." },
    ],
    transferExpressions: [
      { de: "Häufig lohnt sich eine Reparatur finanziell kaum, weil ...", en: "Often a repair is barely worthwhile financially because ...", useIn: "Schreiben" },
      { de: "Das Besondere an dieser Idee ist, dass man nicht nur ..., sondern auch ...", en: "The special thing about this idea is that one not only ..., but also ...", useIn: "Beides" },
      { de: "So verbindet dieses Projekt Umweltschutz und Gemeinschaft.", en: "Thus this project combines environmental protection and community.", useIn: "Sprechen" },
      { de: "Statt sofort etwas Neues zu kaufen, könnte man es erst reparieren.", en: "Instead of immediately buying something new, one could repair it first.", useIn: "Beides" },
    ],
    speakingWritingPromptDe: "Haben Sie schon einmal etwas repariert statt es wegzuwerfen? Würden Sie ein Repair-Café besuchen?",
    speakingWritingPromptEn: "Have you ever repaired something instead of throwing it away? Would you visit a Repair Café?",
    source: "curated",
  },

  // =========================================================================
  // 6. MEDIEN, DIGITALES & KOMMUNIKATION (voc-media)
  // =========================================================================
  {
    id: "read-b1-media-01",
    categoryId: "voc-media",
    level: "B1",
    titleDe: "Digital Detox: Warum immer mehr Menschen bewusst Handy-Pausen einlegen",
    titleEn: "Digital Detox: Why More and More People Consciously Take Phone Breaks",
    summaryEn:
      "Explains how constant smartphone notifications fragment attention and how simple screen-free habits restore calm and focus.",
    sourceStyle: "Digital-Magazin / DW Top-Thema Style (B1)",
    sourceUrl: "https://learngerman.dw.com/de/top-thema/s-55861562",
    readingMinutes: 3,
    paragraphs: [
      {
        de: "Morgens als Erstes die Nachrichten prüfen, in der Bahn kurz durch soziale Netzwerke scrollen und abends noch E-Mails beantworten: Für viele von uns ist das Smartphone ein ständiger Begleiter geworden. Es erleichtert zwar unseren Alltag enorm – vom Fahrplan über das Online-Banking bis zum Kontakt mit der Familie im Ausland –, doch die ständige Erreichbarkeit hat auch ihren Preis.",
        en: "Checking messages first thing in the morning, briefly scrolling through social networks on the train, and still answering emails in the evening: for many of us, the smartphone has become a constant companion. Although it makes our daily life enormously easier — from timetables to online banking to contact with family abroad — constant availability also comes at a price.",
      },
      {
        de: "Studien zeigen, dass häufige Benachrichtigungen unsere Konzentration immer wieder unterbrechen und das Gefühl von innerer Unruhe verstärken. Selbst wenn wir gar keine wichtige Nachricht erwarten, greifen wir oft aus reiner Gewohnheit alle paar Minuten zum Bildschirm. Viele berichten zudem, dass sie abends schlechter einschlafen, wenn sie kurz vor dem Schlafengehen noch auf das helle Display schauen.",
        en: "Studies show that frequent notifications repeatedly interrupt our concentration and intensify feelings of inner restlessness. Even when we do not expect any important message at all, we often reach for the screen every few minutes out of pure habit. Many also report that they fall asleep worse in the evening if they still look at the bright display shortly before bedtime.",
      },
      {
        de: "Aus diesem Grund probieren immer mehr Menschen sogenannte „Digital-Detox“-Regeln aus. Es geht dabei nicht darum, Technik komplett abzulehnen, sondern bewusster damit umzugehen. Schon einfache Maßnahmen helfen: das Handy beim Essen weglegen, unnötige Push-Mitteilungen ausschalten oder am Sonntagvormittag ein paar Stunden offline bleiben.",
        en: "For this reason, more and more people try out so-called 'digital detox' rules. It is not about rejecting technology completely, but rather dealing with it more consciously. Even simple measures help: putting the phone away during meals, turning off unnecessary push notifications, or staying offline for a few hours on Sunday morning.",
      },
    ],
    glossary: [
      { word: "Begleiter", baseForm: "der Begleiter, -", meaningEn: "companion", partOfSpeech: "Noun", exampleDe: "Das Smartphone ist heute ein ständiger Begleiter." },
      { word: "erleichtert", baseForm: "erleichtern (erleichterte, hat erleichtert)", meaningEn: "to make easier / facilitate", partOfSpeech: "Verb", exampleDe: "Lern-Apps erleichtern das tägliche Vokabeltraining enorm." },
      { word: "Erreichbarkeit", baseForm: "die Erreichbarkeit (Sg.)", meaningEn: "availability / reachability", partOfSpeech: "Noun", exampleDe: "Ständige Erreichbarkeit nach Feierabend verursacht oft Stress." },
      { word: "Benachrichtigungen", baseForm: "die Benachrichtigung, -en", meaningEn: "notification", partOfSpeech: "Noun", exampleDe: "Beim Lernen schalte ich alle Benachrichtigungen stumm." },
      { word: "Gewohnheit", baseForm: "die Gewohnheit, -en", meaningEn: "habit", partOfSpeech: "Noun", exampleDe: "Aus reiner Gewohnheit schaut man oft grundlos aufs Handy." },
      { word: "abzulehnen", baseForm: "ablehnen (lehnte ab, hat abgelehnt)", meaningEn: "to reject / decline", partOfSpeech: "Verb", exampleDe: "Ich lehne neue Technik nicht ab, möchte sie aber bewusst nutzen." },
      { word: "umzugehen", baseForm: "umgehen mit (+ Dat.)", meaningEn: "to deal with / handle", partOfSpeech: "Verb", exampleDe: "Kinder müssen lernen, sicher mit dem Internet umzugehen." },
      { word: "Maßnahmen", baseForm: "die Maßnahme, -n", meaningEn: "measure / step", partOfSpeech: "Noun", exampleDe: "Schon einfache Maßnahmen verbessern die Konzentration deutlich." },
    ],
    transferExpressions: [
      { de: "Es erleichtert zwar unseren Alltag enorm, doch ... hat auch seinen Preis.", en: "Although it makes our everyday life enormously easier, ... also has its price.", useIn: "Schreiben" },
      { de: "Aus diesem Grund probieren immer mehr Menschen ... aus.", en: "For this reason, more and more people are trying out ...", useIn: "Beides" },
      { de: "Es geht nicht darum, ... komplett abzulehnen, sondern bewusster damit umzugehen.", en: "It is not about rejecting ... completely, but dealing with it more consciously.", useIn: "Beides" },
      { de: "Schon einfache Maßnahmen helfen, zum Beispiel ...", en: "Even simple measures help, for example ...", useIn: "Sprechen" },
    ],
    speakingWritingPromptDe: "Wie viele Stunden verbringen Sie täglich am Smartphone? Welche digitale Pause könnten Sie sich gut vorstellen?",
    speakingWritingPromptEn: "How many hours a day do you spend on your smartphone? What kind of digital break could you imagine taking?",
    source: "curated",
  },
  {
    id: "read-b1-media-02",
    categoryId: "voc-media",
    level: "B1",
    titleDe: "Fake News erkennen: So prüft man Nachrichten in sozialen Netzwerken richtig",
    titleEn: "Spotting Fake News: How to Properly Verify News on Social Networks",
    summaryEn:
      "Teaches practical media-literacy habits: checking sources, noticing emotional headlines, and comparing multiple trusted outlets.",
    sourceStyle: "Medienkompetenz-Artikel / Tagesschau-Lernformat Style (B1)",
    sourceUrl: "https://www.nachrichtenleicht.de/",
    readingMinutes: 3,
    paragraphs: [
      {
        de: "Früher informierten sich die meisten Menschen über gedruckte Zeitungen, Radio oder die Abendnachrichten im Fernsehen. Heute lesen vor allem jüngere Generationen aktuelle Meldungen oft direkt in sozialen Netzwerken oder über kurze Videos. Das ist schnell und bequem, birgt aber auch ein Risiko: Falschmeldungen – sogenannte „Fake News“ – verbreiten sich online manchmal rascher als geprüfte Fakten.",
        en: "In the past, most people informed themselves via printed newspapers, radio, or the evening news on television. Today, especially younger generations often read current reports directly on social networks or via short videos. That is fast and convenient, but it also carries a risk: false reports — so-called 'fake news' — sometimes spread online faster than verified facts.",
      },
      {
        de: "Woran erkennt man, ob eine Nachricht glaubwürdig ist? Medienexperten empfehlen einen einfachen Drei-Schritte-Test: Erstens sollte man immer prüfen, wer den Beitrag veröffentlicht hat und ob es ein seriöses Impressum gibt. Zweitens lohnt sich ein Blick auf die Sprache: Übertriebene Schlagzeilen, die Angst oder Wut auslösen sollen, sind häufig ein Warnsignal.",
        en: "How do you recognize whether a news item is credible? Media experts recommend a simple three-step test: first, you should always check who published the post and whether there is a reputable imprint/legal notice. Second, it is worth looking at the language: exaggerated headlines meant to trigger fear or anger are often a warning sign.",
      },
      {
        de: "Drittens hilft es, das Thema kurz bei zwei unabhängigen, bekannten Nachrichtenseiten nachzuschlagen. Berichtet sonst niemand über ein angeblich riesiges Ereignis, ist Vorsicht geboten. Wer kritisch bleibt und zweifelhafte Beiträge nicht vorschnell weiterleitet, schützt nicht nur sich selbst, sondern trägt zu einer sachlichen Diskussionskultur bei.",
        en: "Third, it helps to briefly look up the topic on two independent, well-known news sites. If nobody else is reporting on a supposedly huge event, caution is advised. Anyone who stays critical and does not hastily forward doubtful posts not only protects themselves, but contributes to a factual culture of discussion.",
      },
    ],
    glossary: [
      { word: "Meldungen", baseForm: "die Meldung, -en", meaningEn: "report / news item", partOfSpeech: "Noun", exampleDe: "Ich prüfe überraschende Meldungen immer auf einer zweiten Website." },
      { word: "birgt", baseForm: "bergen (barg, hat geborgen)", meaningEn: "to carry / hold (a risk)", partOfSpeech: "Verb", exampleDe: "Ungeprüfte Informationen bergen das Risiko von Missverständnissen." },
      { word: "glaubwürdig", baseForm: "glaubwürdig", meaningEn: "credible / trustworthy", partOfSpeech: "Adjective", exampleDe: "Wirkt diese Quelle wirklich glaubwürdig?" },
      { word: "seriöses", baseForm: "seriös", meaningEn: "reputable / reliable", partOfSpeech: "Adjective", exampleDe: "Seriöse Medien nennen immer klar ihre Quellen." },
      { word: "Schlagzeilen", baseForm: "die Schlagzeile, -n", meaningEn: "headline", partOfSpeech: "Noun", exampleDe: "Man sollte nicht nur die Schlagzeile, sondern den ganzen Artikel lesen." },
      { word: "unabhängigen", baseForm: "unabhängig", meaningEn: "independent", partOfSpeech: "Adjective", exampleDe: "Unabhängiger Journalismus ist wichtig für eine Demokratie." },
      { word: "weiterleitet", baseForm: "weiterleiten (leitete weiter, hat weitergeleitet)", meaningEn: "to forward / pass on", partOfSpeech: "Verb", exampleDe: "Bitte leite Nachrichten erst weiter, wenn du sie geprüft hast." },
      { word: "sachlichen", baseForm: "sachlich", meaningEn: "factual / objective", partOfSpeech: "Adjective", exampleDe: "In einer Diskussion sollte man ruhig und sachlich bleiben." },
    ],
    transferExpressions: [
      { de: "Das ist zwar schnell und bequem, birgt aber auch ein Risiko.", en: "That is indeed fast and convenient, but it also carries a risk.", useIn: "Schreiben" },
      { de: "Erstens sollte man prüfen, ..., zweitens lohnt sich ein Blick auf ...", en: "First one should check ..., second it is worth looking at ...", useIn: "Beides" },
      { de: "Wer kritisch bleibt, schützt nicht nur sich selbst, sondern ...", en: "Anyone who stays critical not only protects themselves, but ...", useIn: "Schreiben" },
      { de: "Ich informiere mich am liebsten über unabhängige Quellen.", en: "I prefer to inform myself via independent sources.", useIn: "Sprechen" },
    ],
    speakingWritingPromptDe: "Wo informieren Sie sich täglich über aktuelle Nachrichten – online, im Fernsehen, per Podcast oder in der Zeitung?",
    speakingWritingPromptEn: "Where do you get your daily news — online, on TV, via podcasts, or in the newspaper?",
    source: "curated",
  },

  // =========================================================================
  // 7. FREIZEIT, KULTUR & FESTE (voc-leisure)
  // =========================================================================
  {
    id: "read-b1-leisure-01",
    categoryId: "voc-leisure",
    level: "B1",
    titleDe: "Ehrenamt und Vereine in Deutschland: Warum gemeinsames Engagement glücklich macht",
    titleEn: "Volunteering and Clubs in Germany: Why Shared Involvement Makes People Happy",
    summaryEn:
      "Highlights German Vereinskultur — sports clubs, choirs, and volunteer groups — as one of the best ways to build friendships and practice German.",
    sourceStyle: "Kultur-Magazin / Deutschland.de Style (B1)",
    sourceUrl: "https://www.deutschland.de/de/topic/leben/gesellschaft-integration",
    readingMinutes: 3,
    paragraphs: [
      {
        de: "Ob Fußballverein, Musikchor, Freiwillige Feuerwehr oder Naturschutzgruppe: Vereine spielen in Deutschland eine riesige Rolle. Fast dreißig Millionen Menschen engagieren sich hierzulande regelmäßig ehrenamtlich – also freiwillig und ohne Bezahlung in ihrer Freizeit. Gerade für Menschen, die neu in eine Stadt gezogen sind, bietet ein Verein oft die beste Möglichkeit, schnell Kontakte zu knüpfen.",
        en: "Whether a soccer club, choir, volunteer fire department, or nature conservation group: clubs play a huge role in Germany. Nearly thirty million people in this country regularly volunteer — that is, voluntarily and without pay in their free time. Especially for people who have newly moved to a city, a club often offers the best opportunity to quickly make contacts.",
      },
      {
        de: "Psychologen haben herausgefunden, dass gemeinsames Engagement nicht nur der Gesellschaft hilft, sondern auch den Helferinnen und Helfern selbst guttut. Wer regelmäßig anderen hilft oder zusammen an einem Projekt arbeitet, erlebt ein starkes Gemeinschaftsgefühl und vergisst den beruflichen Alltagsstress viel leichter. Außerdem lernt man neue Fähigkeiten – vom Organisieren von Festen bis zur Teamarbeit.",
        en: "Psychologists have discovered that shared involvement not only helps society, but also does good for the helpers themselves. Anyone who regularly helps others or works together on a project experiences a strong sense of community and forgets everyday work stress much more easily. In addition, one learns new skills — from organizing festivals to teamwork.",
      },
      {
        de: "Natürlich haben viele Berufstätige Sorge, dass ein Ehrenamt zu viel Zeit kostet. Doch heute gibt es zahlreiche flexible Angebote: Man kann zum Beispiel einmal im Monat bei einem Stadtfest mithelfen, Kindern beim Lesen unterstützen oder im Tierheim Hunde ausführen. Schon zwei Stunden im Monat reichen aus, um etwas Sinnvolles zu bewegen.",
        en: "Of course, many working people worry that volunteering costs too much time. Yet today there are numerous flexible opportunities: for example, you can help out once a month at a city festival, support children with reading, or walk dogs at an animal shelter. Even two hours a month are enough to make a meaningful difference.",
      },
    ],
    glossary: [
      { word: "Vereine", baseForm: "der Verein, -e", meaningEn: "club / association", partOfSpeech: "Noun", exampleDe: "Im Sportverein habe ich viele nette Leute kennengelernt." },
      { word: "engagieren sich", baseForm: "sich engagieren (für + Akk.)", meaningEn: "to get involved / volunteer", partOfSpeech: "Verb", exampleDe: "Viele Jugendliche engagieren sich für den Umweltschutz." },
      { word: "Kontakte zu knüpfen", baseForm: "Kontakte knüpfen", meaningEn: "to make contacts / build connections", partOfSpeech: "Phrase", exampleDe: "Über Hobbys fällt es leichter, neue Kontakte zu knüpfen." },
      { word: "Gemeinschaftsgefühl", baseForm: "das Gemeinschaftsgefühl (Sg.)", meaningEn: "sense of community", partOfSpeech: "Noun", exampleDe: "Beim gemeinsamen Kochen entsteht sofort ein tolles Gemeinschaftsgefühl." },
      { word: "Fähigkeiten", baseForm: "die Fähigkeit, -en", meaningEn: "skill / ability", partOfSpeech: "Noun", exampleDe: "Durch das Projekt konnte ich neue sprachliche Fähigkeiten entwickeln." },
      { word: "zahlreiche", baseForm: "zahlreich", meaningEn: "numerous", partOfSpeech: "Adjective", exampleDe: "In unserer Stadt gibt es zahlreiche kostenlose Kulturangebote." },
      { word: "Sinnvolles zu bewegen", baseForm: "etwas Sinnvolles bewegen", meaningEn: "to make a meaningful impact", partOfSpeech: "Phrase", exampleDe: "Mit wenig Aufwand können wir gemeinsam etwas Sinnvolles bewegen." },
    ],
    transferExpressions: [
      { de: "Gerade für Menschen, die neu in einer Stadt sind, bietet ... die beste Möglichkeit.", en: "Especially for people who are new in a city, ... offers the best opportunity.", useIn: "Beides" },
      { de: "Gemeinsames Engagement hilft nicht nur der Gesellschaft, sondern tut auch einem selbst gut.", en: "Shared involvement not only helps society, but also does oneself good.", useIn: "Schreiben" },
      { de: "Über einen Verein fällt es leicht, schnell Kontakte zu knüpfen.", en: "Through a club it is easy to quickly make contacts.", useIn: "Sprechen" },
      { de: "Schon zwei Stunden im Monat reichen aus, um etwas Sinnvolles zu bewegen.", en: "Even two hours a month are enough to make a meaningful difference.", useIn: "Beides" },
    ],
    speakingWritingPromptDe: "In welchem Verein oder sozialen Projekt würden Sie gern mitmachen, wenn Sie mehr Freizeit hätten?",
    speakingWritingPromptEn: "Which club or social project would you like to join if you had more free time?",
    source: "curated",
  },
  {
    id: "read-b1-leisure-02",
    categoryId: "voc-leisure",
    level: "B1",
    titleDe: "Lesen, Podcasts oder Streaming? Wie sich unsere Freizeitgewohnheiten wandeln",
    titleEn: "Reading, Podcasts, or Streaming? How Our Leisure Habits Are Evolving",
    summaryEn:
      "Compares modern evening relaxation — streaming series, listening to podcasts, and reading printed books — and how each affects rest.",
    sourceStyle: "Kultur-Report / Zeit-Campus Style (B1)",
    sourceUrl: "https://learngerman.dw.com/de/b1/s-60953674",
    readingMinutes: 3,
    paragraphs: [
      {
        de: "Wie wir unsere freie Zeit am Abend oder am Wochenende verbringen, hat sich durch digitale Angebote grundlegend gewandelt. Früher wartete die ganze Familie sonntags um 20:15 Uhr auf einen bestimmten Film im Fernsehen. Heute entscheiden wir selbst, wann und was wir schauen – dank Streaming-Diensten stehen tausende Serien und Dokumentationen jederzeit auf Abruf bereit.",
        en: "How we spend our free time in the evening or on the weekend has fundamentally changed through digital offerings. In the past, the whole family waited on Sundays at 8:15 p.m. for a specific movie on television. Today we decide ourselves when and what we watch — thanks to streaming services, thousands of series and documentaries are available on demand at any time.",
      },
      {
        de: "Gleichzeitig feiern aber auch Audio-Formate wie Podcasts und Hörbücher enorme Erfolge. Ihr großer Vorteil ist die Flexibilität: Man kann beim Kochen, beim Joggen oder auf dem Arbeitsweg spannende Geschichten hören, Wissen vertiefen oder sogar eine Fremdsprache trainieren, ohne auf einen Bildschirm starren zu müssen.",
        en: "At the same time, however, audio formats like podcasts and audiobooks are also celebrating enormous success. Their big advantage is flexibility: you can listen to exciting stories while cooking, jogging, or commuting, deepen knowledge, or even train a foreign language without having to stare at a screen.",
      },
      {
        de: "Und was ist mit dem klassischen gedruckten Buch? Entgegen vieler Befürchtungen ist es keineswegs verschwunden. Gerade weil viele Menschen tagsüber stundenlang am Computer arbeiten, genießen sie es abends umso mehr, echte Seiten umzublättern und tief in eine ruhige Geschichte einzutauchen. Am Ende zählt vor allem eine gute Mischung, die uns wirklich erholt.",
        en: "And what about the classic printed book? Contrary to many fears, it has by no means disappeared. Precisely because many people work for hours at a computer during the day, they enjoy turning real pages in the evening all the more and diving deeply into a quiet story. In the end, what counts most is a good mix that truly restores us.",
      },
    ],
    glossary: [
      { word: "grundlegend", baseForm: "grundlegend", meaningEn: "fundamentally", partOfSpeech: "Adjective/Adv.", exampleDe: "Das Internet hat unsere Kommunikation grundlegend verändert." },
      { word: "auf Abruf", baseForm: "auf Abruf", meaningEn: "on demand", partOfSpeech: "Phrase", exampleDe: "Über Mediatheken sind viele Sendungen kostenlos auf Abruf verfügbar." },
      { word: "vertiefen", baseForm: "vertiefen (vertiefte, hat vertieft)", meaningEn: "to deepen", partOfSpeech: "Verb", exampleDe: "Durch Lesen und Podcasts kann ich meinen Wortschatz vertiefen." },
      { word: "starren", baseForm: "starren (starrte, hat gestarrt)", meaningEn: "to stare", partOfSpeech: "Verb", exampleDe: "Nach acht Stunden möchte ich nicht noch länger auf den Bildschirm starren." },
      { word: "Befürchtungen", baseForm: "die Befürchtung, -en", meaningEn: "fear / concern", partOfSpeech: "Noun", exampleDe: "Entgegen vieler Befürchtungen lesen junge Menschen weiterhin gern Bücher." },
      { word: "keineswegs", baseForm: "keineswegs", meaningEn: "by no means / not at all", partOfSpeech: "Adverb", exampleDe: "Gedruckte Bücher sind keineswegs überflüssig geworden." },
      { word: "einzutauchen", baseForm: "eintauchen (in + Akk.)", meaningEn: "to dive into / immerse oneself", partOfSpeech: "Verb", exampleDe: "Beim Lesen kann ich wunderbar in eine andere Welt eintauchen." },
    ],
    transferExpressions: [
      { de: "... hat sich durch digitale Angebote grundlegend gewandelt.", en: "... has fundamentally changed through digital offerings.", useIn: "Schreiben" },
      { de: "Ihr großer Vorteil ist die Flexibilität: Man kann beim ..., ohne ... zu müssen.", en: "Their big advantage is flexibility: you can ... while ..., without having to ...", useIn: "Beides" },
      { de: "Entgegen vieler Befürchtungen ist ... keineswegs verschwunden.", en: "Contrary to many fears, ... has by no means disappeared.", useIn: "Schreiben" },
      { de: "Am Ende zählt vor allem eine gute Mischung, die uns wirklich erholt.", en: "In the end, what counts most is a good mix that truly restores us.", useIn: "Sprechen" },
    ],
    speakingWritingPromptDe: "Wie entspannen Sie sich nach einem langen Tag am liebsten – mit einer Serie, einem Podcast, Musik oder einem Buch?",
    speakingWritingPromptEn: "How do you most like to relax after a long day — with a series, a podcast, music, or a book?",
    source: "curated",
  },

  // =========================================================================
  // 8. BILDUNG, LERNEN & GESELLSCHAFT (voc-education)
  // =========================================================================
  {
    id: "read-b1-edu-01",
    categoryId: "voc-education",
    level: "B1",
    titleDe: "Lebenslanges Lernen: Warum Weiterbildung im Beruf heute unverzichtbar ist",
    titleEn: "Lifelong Learning: Why Continuing Education at Work Is Indispensable Today",
    summaryEn:
      "Discusses why one degree is no longer enough for an entire career and how German Bildungsurlaub and online courses support lifelong growth.",
    sourceStyle: "Bildungs-Report / DW Style (B1)",
    sourceUrl: "https://learngerman.dw.com/de/top-thema/s-55861562",
    readingMinutes: 3,
    paragraphs: [
      {
        de: "Früher galt oft ein einfaches Lebensmodell: Man machte nach der Schule eine Ausbildung oder ein Studium und arbeitete danach jahrzehntelang im selben Beruf. Durch die Digitalisierung und künstliche Intelligenz verändern sich heute jedoch viele Aufgaben deutlich schneller als früher. Deshalb sprechen Fachleute zunehmend vom „lebenslangen Lernen“.",
        en: "In the past, a simple life model often applied: after school you did an apprenticeship or university degree and afterward worked in the same profession for decades. Due to digitalization and artificial intelligence, however, many tasks today change much faster than before. Therefore experts increasingly speak of 'lifelong learning'.",
      },
      {
        de: "Weiterbildung bedeutet dabei nicht zwingend, noch einmal ein jahrelanges Studium zu beginnen. Oft reichen gezielte Kurse an der Volkshochschule, Workshops im Betrieb oder digitale Lernplattformen, um sich neue Kenntnisse anzueignen – zum Beispiel in Fremdsprachen, Software oder Projektmanagement. In den meisten deutschen Bundesländern haben Arbeitnehmer sogar Anspruch auf bezahlten Bildungsurlaub.",
        en: "Further training does not necessarily mean starting another multi-year degree program. Often targeted courses at the adult education center, workshops at the company, or digital learning platforms are enough to acquire new knowledge — for example in foreign languages, software, or project management. In most German federal states, employees are even entitled to paid educational leave.",
      },
      {
        de: "Wer neugierig bleibt und regelmäßig etwas Neues lernt, verbessert nicht nur seine Chancen auf dem Arbeitsmarkt, sondern stärkt auch das eigene Selbstvertrauen. Denn jede neu gelernte Fähigkeit zeigt uns, dass wir flexibel auf Veränderungen reagieren können – ganz egal, wie alt wir sind.",
        en: "Anyone who stays curious and regularly learns something new not only improves their chances on the job market, but also strengthens their own self-confidence. Because every newly learned skill shows us that we can react flexibly to changes — no matter how old we are.",
      },
    ],
    glossary: [
      { word: "unverzichtbar", baseForm: "unverzichtbar", meaningEn: "indispensable / essential", partOfSpeech: "Adjective", exampleDe: "Gute Sprachkenntnisse sind heute im Beruf fast unverzichtbar." },
      { word: "Ausbildung", baseForm: "die Ausbildung, -en", meaningEn: "vocational training / apprenticeship", partOfSpeech: "Noun", exampleDe: "Nach dem Schulabschluss begann er eine duale Ausbildung." },
      { word: "Weiterbildung", baseForm: "die Weiterbildung, -en", meaningEn: "further training / continuing education", partOfSpeech: "Noun", exampleDe: "Mein Arbeitgeber unterstützt berufliche Weiterbildung finanziell." },
      { word: "anzueignen", baseForm: "sich etwas aneignen", meaningEn: "to acquire (knowledge/skills)", partOfSpeech: "Verb", exampleDe: "In dem Kurs habe ich mir viele nützliche Kenntnisse angeeignet." },
      { word: "Anspruch auf", baseForm: "Anspruch haben auf (+ Akk.)", meaningEn: "to be entitled to / have a right to", partOfSpeech: "Phrase", exampleDe: "Vollzeitbeschäftigte haben Anspruch auf mindestens 20 Tage Urlaub." },
      { word: "Bildungsurlaub", baseForm: "der Bildungsurlaub (Sg.)", meaningEn: "paid educational leave", partOfSpeech: "Noun", exampleDe: "Viele nutzen ihren Bildungsurlaub für einen intensiven Sprachkurs." },
      { word: "Selbstvertrauen", baseForm: "das Selbstvertrauen (Sg.)", meaningEn: "self-confidence", partOfSpeech: "Noun", exampleDe: "Wenn man Fortschritte merkt, wächst das Selbstvertrauen." },
    ],
    transferExpressions: [
      { de: "Durch die Digitalisierung verändern sich viele Aufgaben deutlich schneller als früher.", en: "Due to digitalization, many tasks change much faster than before.", useIn: "Schreiben" },
      { de: "Oft reichen gezielte Kurse, um sich neue Kenntnisse anzueignen.", en: "Often targeted courses are enough to acquire new knowledge.", useIn: "Beides" },
      { de: "Wer neugierig bleibt, verbessert nicht nur ..., sondern stärkt auch ...", en: "Anyone who stays curious not only improves ..., but also strengthens ...", useIn: "Beides" },
      { de: "Ganz egal, wie alt man ist, man kann immer etwas Neues lernen.", en: "No matter how old one is, one can always learn something new.", useIn: "Sprechen" },
    ],
    speakingWritingPromptDe: "Welche neue Fähigkeit oder Sprache möchten Sie in den nächsten zwei Jahren unbedingt noch lernen?",
    speakingWritingPromptEn: "What new skill or language would you definitely like to learn in the next two years?",
    source: "curated",
  },
  {
    id: "read-b1-edu-02",
    categoryId: "voc-education",
    level: "B1",
    titleDe: "Effektiv eine Fremdsprache lernen: Was die Lernforschung wirklich empfiehlt",
    titleEn: "Learning a Foreign Language Effectively: What Learning Research Really Recommends",
    summaryEn:
      "Science-backed B1 insights on language learning: active use, spaced repetition across multiple days, and learning chunks in context.",
    sourceStyle: "Lern-Magazin / VHS Lernportal Style (B1)",
    sourceUrl: "https://www.vhs-lernportal.de/",
    readingMinutes: 3,
    paragraphs: [
      {
        de: "Viele Sprachlernende kennen dieses Gefühl: Man paukt stundenlang lange Vokabellisten, doch im nächsten echten Gespräch fallen einem genau die wichtigsten Wörter einfach nicht ein. Die moderne Lernforschung erklärt, warum das passiert: Unser Gehirn speichert isolierte Wörter viel schlechter als Ausdrücke, die wir in sinnvollen Sätzen und emotionalen Situationen erleben.",
        en: "Many language learners know this feeling: you cram long vocabulary lists for hours, yet in the next real conversation the exact most important words simply do not come to mind. Modern learning research explains why this happens: our brain stores isolated words much more poorly than expressions that we experience in meaningful sentences and emotional situations.",
      },
      {
        de: "Deutlich wirksamer als einmaliges Auswendiglernen ist das regelmäßige Wiederholen über mehrere Tage hinweg. Wenn man ein neues Wort am ersten Tag liest, am zweiten Tag laut ausspricht und am dritten Tag in einem eigenen Satz verwendet, verankert es sich fest im Langzeitgedächtnis. Dabei sind Fehler kein Zeichen von Schwäche, sondern ein völlig normaler und notwendiger Teil des Lernprozesses.",
        en: "Significantly more effective than one-time memorization is regular repetition across several days. When you read a new word on the first day, say it aloud on the second day, and use it in your own sentence on the third day, it anchors itself firmly in long-term memory. In doing so, mistakes are not a sign of weakness, but a completely normal and necessary part of the learning process.",
      },
      {
        de: "Darüber hinaus empfehlen Sprachdidaktiker, Lesen, Hören, Sprechen und Schreiben miteinander zu verbinden. Wer einen interessanten Artikel liest, nützliche Wendungen markiert und anschließend laut zusammenfasst, trainiert gleich mehrere Fähigkeiten auf einmal. So wird aus passivem Verstehen Schritt für Schritt lebendige, sichere Sprache.",
        en: "Beyond that, language educators recommend connecting reading, listening, speaking, and writing with each other. Anyone who reads an interesting article, marks useful expressions, and afterward summarizes it aloud trains several skills at once. In this way, passive understanding becomes living, confident language step by step.",
      },
    ],
    glossary: [
      { word: "paukt", baseForm: "pauken (paukte, hat gepaukt)", meaningEn: "to cram / study hard", partOfSpeech: "Verb", exampleDe: "Kurz vor der Prüfung sollte man nicht bis spät in die Nacht pauken." },
      { word: "fallen ... ein", baseForm: "einfallen (fiel ein, ist eingefallen)", meaningEn: "to come to mind / occur to", partOfSpeech: "Verb", exampleDe: "Im Gespräch fiel mir plötzlich das perfekte deutsche Wort ein." },
      { word: "wirksamer", baseForm: "wirksam", meaningEn: "effective", partOfSpeech: "Adjective", exampleDe: "Kurze tägliche Übungen sind wirksamer als seltene Marathons." },
      { word: "Langzeitgedächtnis", baseForm: "das Langzeitgedächtnis (Sg.)", meaningEn: "long-term memory", partOfSpeech: "Noun", exampleDe: "Durch Wiederholung über mehrere Tage wandern Wörter ins Langzeitgedächtnis." },
      { word: "Schwäche", baseForm: "die Schwäche, -n", meaningEn: "weakness", partOfSpeech: "Noun", exampleDe: "Fehler zu machen ist beim Lernen keine Schwäche." },
      { word: "Wendungen", baseForm: "die Wendung, -en", meaningEn: "expression / phrase", partOfSpeech: "Noun", exampleDe: "Ich sammle nützliche Wendungen aus Texten für meine E-Mails." },
      { word: "zusammenfasst", baseForm: "zusammenfassen (fasste zusammen, hat zusammengefasst)", meaningEn: "to summarize", partOfSpeech: "Verb", exampleDe: "Kannst du den Artikel in drei Sätzen zusammenfassen?" },
    ],
    transferExpressions: [
      { de: "Deutlich wirksamer als ... ist das regelmäßige Wiederholen.", en: "Significantly more effective than ... is regular repetition.", useIn: "Schreiben" },
      { de: "Dabei sind Fehler kein Zeichen von Schwäche, sondern ein notwendiger Teil des Lernens.", en: "In doing so, mistakes are not a sign of weakness, but a necessary part of learning.", useIn: "Beides" },
      { de: "Darüber hinaus empfehlen Fachleute, ... miteinander zu verbinden.", en: "Beyond that, experts recommend connecting ... with each other.", useIn: "Schreiben" },
      { de: "So wird Schritt für Schritt aus passivem Verstehen sichere Sprache.", en: "That way passive understanding becomes confident language step by step.", useIn: "Sprechen" },
    ],
    speakingWritingPromptDe: "Welche Lernmethode hat Ihnen persönlich beim Deutschlernen bisher am meisten geholfen?",
    speakingWritingPromptEn: "Which learning method has helped you personally the most when learning German so far?",
    source: "curated",
  },
];
