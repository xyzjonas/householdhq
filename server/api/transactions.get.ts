import transactions from "../controllers/transactions";


export default defineEventHandler((event) => {
    return transactions.findAll();
})