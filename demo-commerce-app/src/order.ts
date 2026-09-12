import { applyPlainPricing, applyPricing } from "./pricing";
import { addTax } from "./tax";

export function buildOrderTotal(
  unitPrice: number,
  quantity: number,
  discountPercentage: number,
): number {
  const discountedPrice = applyPricing(unitPrice, quantity, discountPercentage);
  return addTax(discountedPrice);
}

export function generateInvoice(unitPrice: number, quantity: number): number {
  const plainPrice = applyPlainPricing(unitPrice, quantity);
  return addTax(plainPrice);
}
