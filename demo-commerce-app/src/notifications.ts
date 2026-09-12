export function notifyOrderConfirmed(orderId: string): string {
  return `Order ${orderId} confirmed`;
}

export function notifyOrderShipped(orderId: string): string {
  return `Order ${orderId} shipped`;
}
