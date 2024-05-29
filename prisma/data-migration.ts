import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction(async (tx) => {
    const transactions = await tx.transaction.findMany({
      include: { tags: true },
    });

    Promise.all(
      transactions.map((trans) => {
        tx.transaction.update({
          where: {
            id: trans.id,
          },
          data: {
            createdAt: trans.created ?? undefined,
            transactedAt: trans.created,
            created: trans.created,
          },
        });
      })
    );
  });

//   await prisma.$transaction(async (tx) => {
//     const tags = await tx.tag.findMany();
//     const transactions = await tx.transaction.findMany({
//       include: { tags: true },
//     });
//     for (const tag of tags) {
//       const newCategory = await tx.category.create({
//         data: {
//           name: tag.name,
//           color: tag.color,
//           description: tag.description,
//           icon: tag.icon,
//         },
//       });

//       await tx.transaction.updateMany({
//         where: {
//           tags: {
//             some: {
//               id: tag.id,
//             },
//           },
//         },
//         data: {
//           categoryId: newCategory.id,
//         },
//       });
//     }
//   });
}

main()
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
