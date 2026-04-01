import { BASE_URL, crawlFullStory, prisma } from "./crawl-site-v3.mjs";

function slugify(value) {
  return String(value ?? "")
    .replace(/[\u0111\u0110]/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function resolveStorySourceUrl(story) {
  if (story.sourceUrl) {
    return story.sourceUrl;
  }

  const fallbackSlug = slugify(story.title || story.slug);
  return `${BASE_URL}/${fallbackSlug}/`;
}

async function main() {
  const stories = await prisma.story.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      sourceUrl: true,
    },
    orderBy: {
      id: "asc",
    },
  });

  const summary = {
    stories: {
      processed: 0,
      created: 0,
      updated: 0,
      errors: 0,
    },
    chapters: {
      created: 0,
      updated: 0,
      skipped: 0,
    },
  };

  for (const story of stories) {
    const sourceUrl = resolveStorySourceUrl(story);

    try {
      console.log(`Reindexing: ${story.title} -> ${sourceUrl}`);
      const result = await crawlFullStory(sourceUrl);
      summary.stories.processed += 1;
      summary.stories[result.stats.story] += 1;
      summary.chapters.created += result.stats.chapters.created;
      summary.chapters.updated += result.stats.chapters.updated;
      summary.chapters.skipped += result.stats.chapters.skipped;
      console.log(
        `[reindex:${result.stats.story}] ${result.story.slug} | chapters c/u/s = ${result.stats.chapters.created}/${result.stats.chapters.updated}/${result.stats.chapters.skipped}`,
      );
    } catch (error) {
      summary.stories.errors += 1;
      console.error(`Reindex error: ${sourceUrl}`, error);
    }
  }

  console.log(JSON.stringify(summary, null, 2));
}

try {
  await main();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
