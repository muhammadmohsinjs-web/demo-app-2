import { checkout } from "./checkout";
import { generateInvoice } from "./order";

const checkoutResult = checkout("ORDER-1001", 100, 2, 10);
const invoiceAmount = generateInvoice(100, 2);

console.log("Checkout result:", checkoutResult);
console.log("Invoice amount:", invoiceAmount);
