import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {

  const transactions = await prisma.$transaction(async tx => tx.transaction.findMany());
  for (const trans of transactions) {
    const i = transactions.indexOf(trans)
    console.info(`Updating transaction ${i + 1}/${transactions.length}`)
    await prisma.$transaction(async (tx) => {  
      await tx.transaction.update({
        where: { id: trans.id },
        data: {
          trasactedAt: trans.created,
          created: trans.created,
        },
      });
    })
  }

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
