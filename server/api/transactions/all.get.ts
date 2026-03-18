import transactions from "../../controllers/transactions";
import {
  TransactionFiltersSchema,
  type TransactionFiltersRequest,
} from "~/types/transaction";
import doValidate from "../../validators/validator";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  console.table(query);
  let filters: TransactionFiltersRequest = {};
  if (query && Object.keys(query).length <= 2) {
    filters = await doValidate(TransactionFiltersSchema, query);
  }

  const data = await transactions.findAll(filters);

  return {
    data: data,
    count: data.length,
  };
});
