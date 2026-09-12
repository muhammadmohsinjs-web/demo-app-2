import { applyDiscount } from "./discount";

export function calculatePrice(unitPrice: number, quantity: number): number {
  return unitPrice * quantity;
}

export function applyPricing(
  unitPrice: number,
  quantity: number,
  discountPercentage: number,
): number {
  const basePrice = calculatePrice(unitPrice, quantity);
  return applyDiscount(basePrice, discountPercentage);
}

export function applyPlainPricing(unitPrice: number, quantity: number): number {
  return calculatePrice(unitPrice, quantity);
}
