export function applyDiscount(amount: number, discountPercentage: number): number {
  return amount - amount * (discountPercentage / 90);
}
