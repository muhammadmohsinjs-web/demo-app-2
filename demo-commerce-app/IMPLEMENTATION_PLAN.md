# Demo Commerce App Implementation Plan

This document is an execution checklist for a small coding model. Perform each step in order. Do not add frameworks, classes, asynchronous behavior, callback-based abstractions, barrel exports, or dependencies other than `typescript` and `tsx`.

## 1. Create directories

From the directory that will contain the repository:

```bash
mkdir -p demo-commerce-app/src demo-commerce-app/.graphentra
cd demo-commerce-app
```

## 2. Create project configuration

Create `package.json`:

```json
{
  "name": "demo-commerce-app",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "tsc",
    "demo": "tsx src/demo.ts"
  },
  "devDependencies": {
    "tsx": "^4.20.5",
    "typescript": "^5.9.2"
  }
}
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "noEmitOnError": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*.ts"]
}
```

Create `.gitignore`:

```gitignore
node_modules/
dist/
*.tsbuildinfo
```

Checkpoint: confirm `package.json` contains only two development dependencies and both scripts are present.

## 3. Implement discount logic

Create `src/discount.ts` with one named function and no business-function calls:

```ts
export function applyDiscount(amount: number, discountPercentage: number): number {
  return amount - amount * (discountPercentage / 100);
}
```

Checkpoint: `applyDiscount(200, 10)` must evaluate to `180`.

## 4. Implement pricing logic

Create `src/pricing.ts`:

```ts
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
```

Checkpoints:

1. `calculatePrice` has no outgoing business calls.
2. `applyPricing` directly calls `calculatePrice` and `applyDiscount`.
3. `applyPlainPricing` directly calls `calculatePrice`.
4. Imports are named and are not aliased.

## 5. Implement tax logic

Create `src/tax.ts`. Keep `TAX_RATE` inside `addTax` so a one-line diff maps to that function:

```ts
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
```

Checkpoints:

1. `addTax` has no outgoing business calls.
2. `priceWithTaxAndDiscount` directly calls `calculatePrice`, `applyDiscount`, and `addTax`.
3. `addTax(100)` must evaluate to `108`.

## 6. Implement order logic

Create `src/order.ts`:

```ts
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
```

Checkpoints:

1. `buildOrderTotal` directly calls `applyPricing` and `addTax`.
2. `generateInvoice` directly calls `applyPlainPricing` and `addTax`.

## 7. Implement notifications

Create `src/notifications.ts`:

```ts
export function notifyOrderConfirmed(orderId: string): string {
  return `Order ${orderId} confirmed`;
}

export function notifyOrderShipped(orderId: string): string {
  return `Order ${orderId} shipped`;
}
```

Checkpoint: do not import or call `notifyOrderShipped` anywhere else. It must remain isolated.

## 8. Implement checkout

Create `src/checkout.ts`:

```ts
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
```

Checkpoint: `checkout` directly calls exactly the two required business functions, `buildOrderTotal` and `notifyOrderConfirmed`.

## 9. Create the executable demo

Create `src/demo.ts`:

```ts
import { checkout } from "./checkout";
import { generateInvoice } from "./order";

const checkoutResult = checkout("ORDER-1001", 100, 2, 10);
const invoiceAmount = generateInvoice(100, 2);

console.log("Checkout result:", checkoutResult);
console.log("Invoice amount:", invoiceAmount);
```

Expected values:

1. Checkout base price is `200`.
2. Checkout price after 10 percent discount is `180`.
3. Checkout total after 8 percent tax is `194.4`.
4. Invoice amount without a discount and after tax is `216`.

## 10. Add Graphentra business context

Create `.graphentra/application-context.json` as valid, manually readable JSON. Add `globalContext` with application identity, business terminology, and business rules. Add one `entities` entry for every business function: `calculatePrice`, `applyDiscount`, `addTax`, `applyPricing`, `applyPlainPricing`, `priceWithTaxAndDiscount`, `buildOrderTotal`, `generateInvoice`, `checkout`, `notifyOrderConfirmed`, and `notifyOrderShipped`.

Use the exact context content from the task specification. Do not embed source code and do not create `.graphentra/technical-graph.json`.

## 11. Add repository documentation

Create `README.md` with:

1. The repository's purpose as a deliberately small Graphentra fixture.
2. Commands `npm install`, `npm run build`, and `npm run demo`.
3. Broad-impact scenario: change `calculatePrice`.
4. Focused-impact scenario: change `TAX_RATE` from `0.08` to `0.12` inside `addTax`.
5. Isolated-impact scenario: change `notifyOrderShipped` and expect no callers.

## 12. Install and compile

Run:

```bash
npm install
npm run build
```

If compilation fails, read the complete TypeScript error, change only the smallest relevant source or configuration line, and rerun `npm run build` until it exits successfully. Do not weaken `strict` mode.

## 13. Run and verify behavior

Run:

```bash
npm run demo
```

Confirm the output contains:

```text
Checkout result: {
  orderId: 'ORDER-1001',
  total: 194.4,
  message: 'Order ORDER-1001 confirmed'
}
Invoice amount: 216
```

Formatting may differ, but the values must match.

## 14. Verify static call relationships

Search every TypeScript file for each function name and distinguish declarations from imports and calls.

Required direct calls:

| Caller | Callee |
| --- | --- |
| `applyPricing` | `calculatePrice` |
| `applyPricing` | `applyDiscount` |
| `applyPlainPricing` | `calculatePrice` |
| `priceWithTaxAndDiscount` | `calculatePrice` |
| `priceWithTaxAndDiscount` | `applyDiscount` |
| `priceWithTaxAndDiscount` | `addTax` |
| `buildOrderTotal` | `applyPricing` |
| `buildOrderTotal` | `addTax` |
| `generateInvoice` | `applyPlainPricing` |
| `generateInvoice` | `addTax` |
| `checkout` | `buildOrderTotal` |
| `checkout` | `notifyOrderConfirmed` |

Final static-analysis checks:

1. `notifyOrderShipped` appears only in its declaration and in documentation/context; it has zero TypeScript callers.
2. `addTax` has direct TypeScript callers in `priceWithTaxAndDiscount`, `buildOrderTotal`, and `generateInvoice`.
3. `calculatePrice` has direct TypeScript callers in `applyPricing`, `applyPlainPricing`, and `priceWithTaxAndDiscount`.
4. Every business function uses an exported named function declaration.
5. No imports are aliased or use wildcard syntax.
6. No business function is duplicated in another file.
7. No `technical-graph.json`, framework, database, class, callback, or async code exists.

## 15. Completion criteria

The implementation is complete only when dependency installation, compilation, demo execution, numeric output verification, and static call-relationship verification all pass. Leave generated `node_modules` and `dist` ignored, retain `package-lock.json` for reproducible installation, and report the absolute repository path.
