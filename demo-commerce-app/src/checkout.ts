import { notifyOrderConfirmed } from "./notifications";
import { buildOrderTotal } from "./order";

export function checkout(
  orderId: string,
  unitPrice: number,
  quantity: number,
  discountPercentage: number,
) {
  const total = buildOrderTotal(unitPrice, quantity, discountPercentage);
  const message = notifyOrderConfirmed(orderId);

  return { orderId, total, message };
}
