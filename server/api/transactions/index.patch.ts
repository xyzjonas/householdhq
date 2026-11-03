import transactions from "../../controllers/transactions";
import {
  EditTransactionSchema,
  type CreateTransactionRequest,
  type EditTransactionRequest,
} from "~/types/transaction";
import doValidate from "../../validators/validator";
import type { Transaction } from "~/types";

export default defineEventHandler(async (event) => {
  const data: EditTransactionRequest = await doValidate(
    EditTransactionSchema,
    await readBody(event),
  );
  data.tags = data.tags?.filter((tag: string) => !!tag) ?? [];
  const updatedTransaction = await transactions.editTransaction(data);

  if (data.confirmed) {
    // we are confirming pending transaction, let's create another one - if recurring...
    if (updatedTransaction.recurring > 0) {
      console.info(
        `${updatedTransaction.id} is recurring, each ${updatedTransaction.recurring} monhts`,
      );
      // the persisted row also carries the foreign keys, which the shared type omits
      const previous = updatedTransaction as Transaction & {
        sourceId: number;
        targetId: number;
        categoryId: number | null;
      };
      const transactedAt = new Date(previous.transactedAt);
      transactedAt.setMonth(transactedAt.getMonth() + previous.recurring);
      const newData: CreateTransactionRequest = {
        transactedAt,
        description: previous.description,
        amount: previous.amount,
        recurring: previous.recurring,
        categoryId: previous.categoryId ?? undefined,
        sourceId: previous.sourceId,
        targetId: previous.targetId,
        projectId: previous.projectId ?? undefined,
        currency: previous.currency,
        tags: previous.tags.map((t) => t.name),
        isImportant: previous.isImportant,
        isHidden: previous.isHidden,
      };
      const createdTrans = await transactions.createTransaction(newData);
      console.info(
        `Created a new transaction: id=${createdTrans.id} date=${createdTrans.transactedAt}`,
      );
    }
  }
  setResponseStatus(event, 200);
  return {
    data: updatedTransaction,
    message: "created",
  };
});
