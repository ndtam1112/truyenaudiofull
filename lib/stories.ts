export type Chapter = {
  id: string;
  slug: string;
  title: string;
  order: number;
  readingTime: string;
  excerpt: string;
  content: string[];
};

export type Story = {
  id: string;
  slug: string;
  title: string;
  author: string;
  genre: string;
  summary: string;
  coverLabel: string;
  coverAccentFrom: string;
  coverAccentTo: string;
  chapters: Chapter[];
};

const stories: Story[] = [
  {
    id: "ember-archive",
    slug: "ember-archive",
    title: "The Ember Archive",
    author: "A. Varen",
    genre: "Mystery / Fantasy",
    summary:
      "An archivist decodes a living manuscript while a city built around furnaces begins to rewrite its own history.",
    coverLabel: "EA",
    coverAccentFrom: "#ef4444",
    coverAccentTo: "#7c2d12",
    chapters: [
      {
        id: "embers-at-dawn",
        slug: "embers-at-dawn",
        title: "Embers at Dawn",
        order: 1,
        readingTime: "8 min",
        excerpt:
          "Mira discovers a catalogue entry that changes every time she blinks.",
        content: [
          "The furnace bells began before sunrise, ringing low and metallic across the archive quarter. Mira was halfway through repairing a cracked index drawer when the first impossible card slid out onto the floor.",
          "Its title read The Ember Archive, Volume Zero. When she bent to retrieve it, the subtitle had changed. On the second reading it named her district. On the third, it named her.",
          "By noon she had locked the drawer, copied the sequence, and done the one thing archivists never admit to doing: she read ahead.",
        ],
      },
      {
        id: "the-ink-remembers",
        slug: "the-ink-remembers",
        title: "The Ink Remembers",
        order: 2,
        readingTime: "11 min",
        excerpt:
          "An erased footnote resurfaces in the margins of a forbidden ledger.",
        content: [
          "The ledger room smelled of rain, soot, and old glue. Every erased passage glimmered under the angled lamp like a scar refusing to fade.",
          "Mira traced the margin mark to a hidden shelf where a burnt folio waited beneath municipal census books. Someone had buried testimony inside routine paperwork, trusting bureaucracy more than secrecy.",
          "The page ended with a warning written in three different hands: when the city edits the past, it invoices the future.",
        ],
      },
    ],
  },
  {
    id: "salt-and-lanterns",
    slug: "salt-and-lanterns",
    title: "Salt and Lanterns",
    author: "Nell Arden",
    genre: "Adventure / Maritime",
    summary:
      "A tide cartographer navigates unstable coastlines, chasing a map that only appears during eclipses.",
    coverLabel: "SL",
    coverAccentFrom: "#0f766e",
    coverAccentTo: "#1d4ed8",
    chapters: [
      {
        id: "the-chart-beneath-the-tide",
        slug: "the-chart-beneath-the-tide",
        title: "The Chart Beneath the Tide",
        order: 1,
        readingTime: "9 min",
        excerpt:
          "A vanished harbor flickers into view for seventeen minutes.",
        content: [
          "On the morning of the eclipse, the sea withdrew with deliberate grace. Piers that had rotted centuries earlier rose from the surf like the ribs of a sleeping animal.",
          "Nell marked every exposed stone, but the harbor did not stay still. Streets shifted between measurements, as though memory itself had a current.",
          "When the light returned, one lane remained inked on her map, glowing faintly with salt crystals in the paper grain.",
        ],
      },
    ],
  },
];

export async function getHomePage() {
  return {
    featuredStory: stories[0],
    stories,
  };
}

export async function getStoryDetail(slug: string) {
  const story = stories.find((item) => item.slug === slug) ?? null;

  if (!story) {
    return null;
  }

  return {
    story,
    chapters: story.chapters,
  };
}

export async function getChapterDetail(slug: string, id: string) {
  const story = stories.find((item) => item.slug === slug) ?? null;

  if (!story) {
    return null;
  }

  const chapter = story.chapters.find((item) => item.id === id) ?? null;

  if (!chapter) {
    return null;
  }

  return {
    story,
    chapter,
    previousChapter:
      story.chapters.find((item) => item.order === chapter.order - 1) ?? null,
    nextChapter:
      story.chapters.find((item) => item.order === chapter.order + 1) ?? null,
  };
}
