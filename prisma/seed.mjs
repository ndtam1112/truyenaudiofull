import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.storyGenre.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.genre.deleteMany();
  await prisma.story.deleteMany();

  await prisma.story.create({
    data: {
      title: "Co Vo Bi An",
      slug: "co-vo-bi-an",
      description: "Mot cuoc hon nhan day bi an va nhung su that dan he lo.",
      author: "Tac Gia A",
      status: "ongoing",
      genres: {
        create: [
          {
            genre: {
              connectOrCreate: {
                where: { name: "Ngon Tinh" },
                create: { name: "Ngon Tinh" },
              },
            },
          },
          {
            genre: {
              connectOrCreate: {
                where: { name: "Bi An" },
                create: { name: "Bi An" },
              },
            },
          },
        ],
      },
      chapters: {
        create: [
          {
            chapterNumber: 1,
            title: "Chuong 1",
            content: "Noi dung chuong 1...",
          },
          {
            chapterNumber: 2,
            title: "Chuong 2",
            content: "Noi dung chuong 2...",
          },
        ],
      },
    },
  });

  await prisma.story.create({
    data: {
      title: "Dem Dai Tinh Mo",
      slug: "dem-dai-tinh-mo",
      description: "Tinh yeu, thu han va nhung bi mat duoc giau trong bong toi.",
      author: "Tac Gia B",
      status: "completed",
      genres: {
        create: [
          {
            genre: {
              connectOrCreate: {
                where: { name: "Do Thi" },
                create: { name: "Do Thi" },
              },
            },
          },
          {
            genre: {
              connectOrCreate: {
                where: { name: "Ngon Tinh" },
                create: { name: "Ngon Tinh" },
              },
            },
          },
        ],
      },
      chapters: {
        create: [
          {
            chapterNumber: 1,
            title: "Gap Go",
            content: "Noi dung mo dau cua truyen...",
          },
        ],
      },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
