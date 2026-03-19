import transactions from "../../controllers/transactions";
import {
  TransactionRecentQuerySchema,
  type TransactionRecentQueryRequest,
} from "~/types/transaction";
import doValidate from "../../validators/validator";

export default defineEventHandler(async (event) => {
  const start = new Date();
  const query = getQuery(event);
  const constraints: TransactionRecentQueryRequest = await doValidate(
    TransactionRecentQuerySchema,
    query,
  );

  if (constraints.search) {
    const data = await transactions.searchFulltext(constraints.search);
    const end = new Date();

    console.info(`Request took ${(end.getTime() - start.getTime()) / 1000}s`);
    return {
      month: "search",
      count: data.length,
      data,
    };
  }

  const data = await transactions.findRecent({
    month: constraints.month,
    year: constraints.year,
  });
  const end = new Date();

  console.info(`Request took ${(end.getTime() - start.getTime()) / 1000}s`);
  return data;
});
