# Demo Commerce App

This deliberately small ecommerce application is a fixture repository for Graphentra change-impact analysis. Its direct, reusable functions create predictable cross-file call paths, while one intentionally isolated function demonstrates a change with no caller blast radius.

## Install and run

```bash
npm install
npm run build
npm run demo
```

## Demonstration scenarios

### Scenario A: Broad impact

Change something inside `calculatePrice()`.

Expected: several downstream functions may be affected because discounted pricing, plain pricing, order totals, checkout, invoices, and tax-and-discount pricing depend on it.

### Scenario B: Focused impact

Change this line inside `addTax()`:

```ts
const TAX_RATE = 0.08;
```

to:

```ts
const TAX_RATE = 0.12;
```

Expected: Graphentra should discover paths involving `buildOrderTotal`, `checkout`, `generateInvoice`, and `priceWithTaxAndDiscount`.

### Scenario C: Isolated impact

Change `notifyOrderShipped()`.

Expected: no application callers should be discovered.

Graphentra's persistent business context is stored in `.graphentra/application-context.json`. The analyzer is expected to generate its own technical graph later; this repository does not include a manually authored `technical-graph.json`.
