import { prisma } from "../lib/prisma";
import { runCrawler } from "../lib/crawler-site";

async function main() {
  const results = await runCrawler({
    categoryLimit: 5,
    pageLimit: 3,
    storyLimitPerPage: 10,
    chapterLimitPerStory: 10,
  });

  console.log(JSON.stringify(results, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
