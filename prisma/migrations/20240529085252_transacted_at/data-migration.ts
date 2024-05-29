import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {

  // (1) Fill in the transactedAt timestamp
  let transactions = await prisma.$transaction(async tx => tx.transaction.findMany());
  for (const trans of transactions) {
    const i = transactions.indexOf(trans)

    console.info(`Updating transaction ${i + 1}/${transactions.length}`)
    if (trans.trasactedAt) {
      continue
    }

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

  // (2) Copy over: tags -> categories
  await prisma.$transaction(async (tx) => {
    const tags = await tx.tag.findMany();
    for (const tag of tags) {
      const newCategory = await tx.category.upsert({
        where: {
          name: tag.name,
        },
        create: {
          name: tag.name,
          color: tag.color,
          description: tag.description,
          icon: tag.icon,
        },
        update: {}
      });

      await tx.transaction.updateMany({
        where: {
          tags: {
            some: {
              id: tag.id,
            },
          },
        },
        data: {
          categoryId: newCategory.id,
        },
      });
    }
  });

  // (3) Reset the previous legacy created timestamp (since it is auto-updated)
  transactions = await prisma.$transaction(async tx => tx.transaction.findMany());
  for (const trans of transactions) {
    const i = transactions.indexOf(trans)

    console.info(`Resetting created timestamp ${i + 1}/${transactions.length}`)
    await prisma.$transaction(async (tx) => {  
      await tx.transaction.update({
        where: { id: trans.id },
        data: {
          created: trans.trasactedAt ?? undefined,
        },
      });
    })
  }

}

main()
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
