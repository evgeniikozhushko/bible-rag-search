export type EvaluationCategory =
  | "reference"
  | "quotation"
  | "paraphrase"
  | "concept"
  | "person-event";

export type VerseRange = {
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd: number;
};

export type EvaluationCase = {
  id: string;
  category: EvaluationCategory;
  query: string;
  relevant: VerseRange[];
};

export const evaluationCases = [
  {
    id: "reference-01",
    category: "reference",
    query: "John 3:16",
    relevant: [{ book: "John", chapter: 3, verseStart: 16, verseEnd: 16 }],
  },
  {
    id: "reference-02",
    category: "reference",
    query: "Jn 3:16",
    relevant: [{ book: "John", chapter: 3, verseStart: 16, verseEnd: 16 }],
  },
  {
    id: "reference-03",
    category: "reference",
    query: "1 Corinthians 13:4-7",
    relevant: [
      {
        book: "1 Corinthians",
        chapter: 13,
        verseStart: 4,
        verseEnd: 7,
      },
    ],
  },
  {
    id: "reference-04",
    category: "reference",
    query: "Psalm 23:1-4",
    relevant: [{ book: "Psalms", chapter: 23, verseStart: 1, verseEnd: 4 }],
  },
  {
    id: "reference-05",
    category: "reference",
    query: "Genesis 1:1",
    relevant: [{ book: "Genesis", chapter: 1, verseStart: 1, verseEnd: 1 }],
  },
  {
    id: "reference-06",
    category: "reference",
    query: "Romans 8:28",
    relevant: [{ book: "Romans", chapter: 8, verseStart: 28, verseEnd: 28 }],
  },
  {
    id: "reference-07",
    category: "reference",
    query: "Matthew 5:3-10",
    relevant: [{ book: "Matthew", chapter: 5, verseStart: 3, verseEnd: 10 }],
  },
  {
    id: "reference-08",
    category: "reference",
    query: "Exodus 20:1-3",
    relevant: [{ book: "Exodus", chapter: 20, verseStart: 1, verseEnd: 3 }],
  },
  {
    id: "reference-09",
    category: "reference",
    query: "1 John 4:7-8",
    relevant: [{ book: "1 John", chapter: 4, verseStart: 7, verseEnd: 8 }],
  },
  {
    id: "reference-10",
    category: "reference",
    query: "Revelation 21:4",
    relevant: [{ book: "Revelation", chapter: 21, verseStart: 4, verseEnd: 4 }],
  },

  {
    id: "quotation-01",
    category: "quotation",
    query: "In the beginning God created the heaven and the earth",
    relevant: [{ book: "Genesis", chapter: 1, verseStart: 1, verseEnd: 1 }],
  },
  {
    id: "quotation-02",
    category: "quotation",
    query: "The Lord is my shepherd I shall not want",
    relevant: [{ book: "Psalms", chapter: 23, verseStart: 1, verseEnd: 1 }],
  },
  {
    id: "quotation-03",
    category: "quotation",
    query: "For where your treasure is there will your heart be also",
    relevant: [{ book: "Matthew", chapter: 6, verseStart: 21, verseEnd: 21 }],
  },
  {
    id: "quotation-04",
    category: "quotation",
    query: "Jesus wept",
    relevant: [{ book: "John", chapter: 11, verseStart: 35, verseEnd: 35 }],
  },
  {
    id: "quotation-05",
    category: "quotation",
    query: "Faith without works is dead",
    relevant: [{ book: "James", chapter: 2, verseStart: 26, verseEnd: 26 }],
  },
  {
    id: "quotation-06",
    category: "quotation",
    query: "Be still and know that I am God",
    relevant: [{ book: "Psalms", chapter: 46, verseStart: 10, verseEnd: 10 }],
  },
  {
    id: "quotation-07",
    category: "quotation",
    query: "Charity suffereth long and is kind",
    relevant: [
      {
        book: "1 Corinthians",
        chapter: 13,
        verseStart: 4,
        verseEnd: 4,
      },
    ],
  },
  {
    id: "quotation-08",
    category: "quotation",
    query: "I can do all things through Christ which strengtheneth me",
    relevant: [
      {
        book: "Philippians",
        chapter: 4,
        verseStart: 13,
        verseEnd: 13,
      },
    ],
  },
  {
    id: "quotation-09",
    category: "quotation",
    query: "No weapon that is formed against thee shall prosper",
    relevant: [{ book: "Isaiah", chapter: 54, verseStart: 17, verseEnd: 17 }],
  },
  {
    id: "quotation-10",
    category: "quotation",
    query: "Train up a child in the way he should go",
    relevant: [{ book: "Proverbs", chapter: 22, verseStart: 6, verseEnd: 6 }],
  },

  {
    id: "paraphrase-01",
    category: "paraphrase",
    query: "Love is patient, kind, and does not envy or boast",
    relevant: [
      {
        book: "1 Corinthians",
        chapter: 13,
        verseStart: 4,
        verseEnd: 7,
      },
    ],
  },
  {
    id: "paraphrase-02",
    category: "paraphrase",
    query: "God loved the world so much that he sent his Son to save it",
    relevant: [{ book: "John", chapter: 3, verseStart: 16, verseEnd: 17 }],
  },
  {
    id: "paraphrase-03",
    category: "paraphrase",
    query: "Treat other people the way you want them to treat you",
    relevant: [{ book: "Matthew", chapter: 7, verseStart: 12, verseEnd: 12 }],
  },
  {
    id: "paraphrase-04",
    category: "paraphrase",
    query: "Do not worry about tomorrow because today has enough trouble",
    relevant: [{ book: "Matthew", chapter: 6, verseStart: 34, verseEnd: 34 }],
  },
  {
    id: "paraphrase-05",
    category: "paraphrase",
    query: "There is a proper season and time for everything in life",
    relevant: [
      {
        book: "Ecclesiastes",
        chapter: 3,
        verseStart: 1,
        verseEnd: 8,
      },
    ],
  },
  {
    id: "paraphrase-06",
    category: "paraphrase",
    query: "Trust God instead of relying entirely on your own understanding",
    relevant: [{ book: "Proverbs", chapter: 3, verseStart: 5, verseEnd: 6 }],
  },
  {
    id: "paraphrase-07",
    category: "paraphrase",
    query: "Keep forgiving someone even when they repeatedly wrong you",
    relevant: [{ book: "Matthew", chapter: 18, verseStart: 21, verseEnd: 22 }],
  },
  {
    id: "paraphrase-08",
    category: "paraphrase",
    query: "A father celebrates when his lost son returns home",
    relevant: [{ book: "Luke", chapter: 15, verseStart: 20, verseEnd: 24 }],
  },
  {
    id: "paraphrase-09",
    category: "paraphrase",
    query: "Prepare for spiritual struggle by putting on God's armor",
    relevant: [{ book: "Ephesians", chapter: 6, verseStart: 11, verseEnd: 17 }],
  },
  {
    id: "paraphrase-10",
    category: "paraphrase",
    query: "Jesus promises life beyond death to everyone who believes in him",
    relevant: [{ book: "John", chapter: 11, verseStart: 25, verseEnd: 26 }],
  },

  {
    id: "concept-01",
    category: "concept",
    query: "comfort for someone who is grieving",
    relevant: [
      { book: "Psalms", chapter: 34, verseStart: 18, verseEnd: 18 },
      { book: "Matthew", chapter: 5, verseStart: 4, verseEnd: 4 },
      {
        book: "2 Corinthians",
        chapter: 1,
        verseStart: 3,
        verseEnd: 4,
      },
    ],
  },
  {
    id: "concept-02",
    category: "concept",
    query: "where wisdom comes from",
    relevant: [
      { book: "Proverbs", chapter: 2, verseStart: 6, verseEnd: 6 },
      { book: "James", chapter: 1, verseStart: 5, verseEnd: 5 },
    ],
  },
  {
    id: "concept-03",
    category: "concept",
    query: "dealing with anxiety and worry",
    relevant: [
      {
        book: "Philippians",
        chapter: 4,
        verseStart: 6,
        verseEnd: 7,
      },
      { book: "1 Peter", chapter: 5, verseStart: 7, verseEnd: 7 },
    ],
  },
  {
    id: "concept-04",
    category: "concept",
    query: "defending the poor and seeking justice",
    relevant: [
      { book: "Isaiah", chapter: 1, verseStart: 17, verseEnd: 17 },
      { book: "Proverbs", chapter: 31, verseStart: 8, verseEnd: 9 },
    ],
  },
  {
    id: "concept-05",
    category: "concept",
    query: "the value of loyal friendship",
    relevant: [
      { book: "Proverbs", chapter: 17, verseStart: 17, verseEnd: 17 },
      {
        book: "Ecclesiastes",
        chapter: 4,
        verseStart: 9,
        verseEnd: 10,
      },
    ],
  },
  {
    id: "concept-06",
    category: "concept",
    query: "resisting temptation",
    relevant: [
      {
        book: "1 Corinthians",
        chapter: 10,
        verseStart: 13,
        verseEnd: 13,
      },
      { book: "James", chapter: 1, verseStart: 12, verseEnd: 15 },
    ],
  },
  {
    id: "concept-07",
    category: "concept",
    query: "living with humility instead of selfish pride",
    relevant: [
      {
        book: "Philippians",
        chapter: 2,
        verseStart: 3,
        verseEnd: 8,
      },
      { book: "James", chapter: 4, verseStart: 6, verseEnd: 10 },
    ],
  },
  {
    id: "concept-08",
    category: "concept",
    query: "how believers should pray",
    relevant: [
      { book: "Matthew", chapter: 6, verseStart: 5, verseEnd: 13 },
      {
        book: "1 Thessalonians",
        chapter: 5,
        verseStart: 17,
        verseEnd: 17,
      },
    ],
  },
  {
    id: "concept-09",
    category: "concept",
    query: "remaining faithful while suffering",
    relevant: [
      { book: "Job", chapter: 1, verseStart: 20, verseEnd: 22 },
      { book: "Romans", chapter: 5, verseStart: 3, verseEnd: 5 },
    ],
  },
  {
    id: "concept-10",
    category: "concept",
    query: "human responsibility to care for creation",
    relevant: [
      { book: "Genesis", chapter: 2, verseStart: 15, verseEnd: 15 },
    ],
  },
  {
    id: "person-event-01",
    category: "person-event",
    query: "David defeats Goliath with a sling and a stone",
    relevant: [
      { book: "1 Samuel", chapter: 17, verseStart: 48, verseEnd: 51 },
    ],
  },
  {
    id: "person-event-02",
    category: "person-event",
    query: "Moses encounters God in the burning bush",
    relevant: [
      { book: "Exodus", chapter: 3, verseStart: 2, verseEnd: 6 },
    ],
  },
  {
    id: "person-event-03",
    category: "person-event",
    query: "Daniel survives the lions' den",
    relevant: [
      { book: "Daniel", chapter: 6, verseStart: 19, verseEnd: 23 },
    ],
  },
  {
    id: "person-event-04",
    category: "person-event",
    query: "Jonah is swallowed by a great fish",
    relevant: [
      { book: "Jonah", chapter: 1, verseStart: 17, verseEnd: 17 },
    ],
  },
  {
    id: "person-event-05",
    category: "person-event",
    query: "Jesus calms a storm while crossing the sea",
    relevant: [
      { book: "Mark", chapter: 4, verseStart: 37, verseEnd: 41 },
    ],
  },
  {
    id: "person-event-06",
    category: "person-event",
    query: "Paul and Silas sing in prison before an earthquake",
    relevant: [
      { book: "Acts", chapter: 16, verseStart: 25, verseEnd: 34 },
    ],
  },
  {
    id: "person-event-07",
    category: "person-event",
    query: "Elijah challenges the prophets of Baal",
    relevant: [
      { book: "1 Kings", chapter: 18, verseStart: 36, verseEnd: 39 },
    ],
  },
  {
    id: "person-event-08",
    category: "person-event",
    query: "Jesus raises Lazarus from the dead",
    relevant: [
      { book: "John", chapter: 11, verseStart: 41, verseEnd: 44 },
    ],
  },
  {
    id: "person-event-09",
    category: "person-event",
    query: "The Holy Spirit comes upon the disciples at Pentecost",
    relevant: [
      { book: "Acts", chapter: 2, verseStart: 1, verseEnd: 4 },
    ],
  },
  {
    id: "person-event-10",
    category: "person-event",
    query: "Children are mauled by bears after mocking a bald prophet",
    relevant: [
      { book: "2 Kings", chapter: 2, verseStart: 23, verseEnd: 24 },
    ],
  },
] satisfies EvaluationCase[];
