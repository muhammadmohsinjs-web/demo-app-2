import { applyDiscount } from "./discount";
import { calculatePrice } from "./pricing";

export function addTax(amount: number): number {
  const TAX_RATE = 0.08;
  return amount + amount * TAX_RATE;
}

export function priceWithTaxAndDiscount(
  unitPrice: number,
  quantity: number,
  discountPercentage: number,
): number {
  const basePrice = calculatePrice(unitPrice, quantity);
  const discountedPrice = applyDiscount(basePrice, discountPercentage);
  return addTax(discountedPrice);
}
