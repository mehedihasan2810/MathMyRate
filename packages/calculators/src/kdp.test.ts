import assert from "node:assert/strict";
import { test } from "vitest";

import {
  calculateEbookRoyalty,
  calculatePrintingCost,
  calculatePrintRoyalty,
  PrintSpecificationError,
} from "./kdp.ts";

test("eBook royalties match KDP's own pricing page examples", () => {
  // 70%: 0.70 x ($1.99 - $0.15) = $1.288, shown as $1.29, for a 1 MB file.
  const seventy = calculateEbookRoyalty({
    listPriceCents: 199n,
    option: "70",
    fileSizeHundredthsMb: 100,
  });

  assert.equal(seventy.deliveryCostCents, 15n);
  assert.equal(seventy.royaltyCents, 129n);
  assert.equal(seventy.priceInRange, false); // $1.99 is below the $2.99 minimum for 70%

  // 35%: 0.35 x $0.99 = $0.3465, shown as $0.35.
  const thirtyFive = calculateEbookRoyalty({
    listPriceCents: 99n,
    option: "35",
    fileSizeHundredthsMb: 100,
  });

  assert.equal(thirtyFive.royaltyCents, 35n);
  assert.equal(thirtyFive.deliveryCostCents, 0n);
  assert.equal(thirtyFive.priceInRange, true);
});

test("eBook price limits and delivery costs follow KDP's tables", () => {
  // $4.99 at 70% with a 2.5 MB file: delivery 0.15 x 2.5 = $0.375, rounded to $0.38; 0.70 x $4.61 = $3.227, so $3.23.
  const book = calculateEbookRoyalty({
    listPriceCents: 499n,
    option: "70",
    fileSizeHundredthsMb: 250,
  });

  assert.equal(book.deliveryCostCents, 38n);
  assert.equal(book.royaltyCents, 323n);
  assert.equal(book.minimumListPriceCents, 299n);
  assert.equal(book.maximumListPriceCents, 1_299n);
  assert.equal(
    calculateEbookRoyalty({ listPriceCents: 1_300n, option: "70", fileSizeHundredthsMb: 100 })
      .priceInRange,
    false,
  );

  // The minimum delivery cost is $0.01.
  assert.equal(
    calculateEbookRoyalty({ listPriceCents: 299n, option: "70", fileSizeHundredthsMb: 1 })
      .deliveryCostCents,
    1n,
  );

  // 35% minimums by file size: $0.99 under 3 MB, $1.99 from 3 MB, $2.99 from 10 MB.
  assert.equal(
    calculateEbookRoyalty({ listPriceCents: 299n, option: "35", fileSizeHundredthsMb: 299 })
      .minimumListPriceCents,
    99n,
  );
  assert.equal(
    calculateEbookRoyalty({ listPriceCents: 299n, option: "35", fileSizeHundredthsMb: 300 })
      .minimumListPriceCents,
    199n,
  );
  assert.equal(
    calculateEbookRoyalty({ listPriceCents: 299n, option: "35", fileSizeHundredthsMb: 1_000 })
      .minimumListPriceCents,
    299n,
  );
});

test("printing costs match KDP's printing cost pages", () => {
  const cost = (
    format: "paperback" | "hardcover",
    ink: "black" | "groundwood" | "standard-color" | "premium-color",
    trim: "regular" | "large",
    pages: number,
  ) => calculatePrintingCost({ format, ink, trim, pages });

  assert.equal(cost("paperback", "black", "regular", 300), 460n); // 1.00 + 300 x 0.012
  assert.equal(cost("paperback", "black", "regular", 110), 230n); // fixed only through 110 pages
  assert.equal(cost("paperback", "black", "regular", 111), 233n); // 1.00 + 111 x 0.012 = 2.332
  assert.equal(cost("paperback", "black", "large", 60), 284n);
  assert.equal(cost("paperback", "standard-color", "regular", 120), 406n); // 1.00 + 120 x 0.0255
  assert.equal(cost("paperback", "premium-color", "regular", 120), 880n); // 1.00 + 120 x 0.065
  assert.equal(cost("paperback", "standard-color", "large", 120), 582n); // 1.00 + 120 x 0.0402 = 5.824
  assert.equal(cost("paperback", "premium-color", "large", 120), 1_060n); // 1.00 + 120 x 0.08
  assert.equal(cost("paperback", "groundwood", "regular", 200), 328n); // 1.00 + 200 x 0.0114
  assert.equal(cost("hardcover", "black", "regular", 300), 925n); // 5.65 + 300 x 0.012
  assert.equal(cost("hardcover", "black", "large", 100), 749n);
});

test("specifications outside KDP's tables are refused", () => {
  assert.throws(
    () =>
      calculatePrintingCost({
        format: "hardcover",
        ink: "standard-color",
        trim: "regular",
        pages: 200,
      }),
    PrintSpecificationError,
  );
  assert.throws(
    () => calculatePrintingCost({ format: "hardcover", ink: "black", trim: "regular", pages: 109 }),
    PrintSpecificationError,
  );
  assert.throws(
    () =>
      calculatePrintingCost({
        format: "paperback",
        ink: "standard-color",
        trim: "regular",
        pages: 70,
      }),
    PrintSpecificationError,
  );
  assert.throws(
    () => calculatePrintingCost({ format: "paperback", ink: "black", trim: "regular", pages: 829 }),
    PrintSpecificationError,
  );
});

test("print royalties match KDP's worked examples", () => {
  // 333-page regular black paperback: printing 1.00 + 333 x 0.012 = 4.996, so $5.00; 0.60 x $15 - $5.00 = $4.00.
  const novel = calculatePrintRoyalty({
    format: "paperback",
    ink: "black",
    trim: "regular",
    pages: 333,
    listPriceCents: 1_500n,
  });

  assert.equal(novel.printingCostCents, 500n);
  assert.equal(novel.royaltyRateBps, 6_000);
  assert.equal(novel.royaltyCents, 400n);

  // 300 pages, $4.60 printing: (0.60 x $9.99) - $4.60 = $1.39; (0.50 x $9.98) - $4.60 = $0.39.
  const at999 = calculatePrintRoyalty({
    format: "paperback",
    ink: "black",
    trim: "regular",
    pages: 300,
    listPriceCents: 999n,
  });

  const at998 = calculatePrintRoyalty({
    format: "paperback",
    ink: "black",
    trim: "regular",
    pages: 300,
    listPriceCents: 998n,
  });

  assert.equal(at999.royaltyCents, 139n);
  assert.equal(at998.royaltyCents, 39n);
  assert.equal(at998.royaltyRateBps, 5_000);

  // Minimums: $4.60 / 0.60 = $7.666..., rounded up to $7.67 (but that price gets 50%); $4.60 / 0.50 = $9.20.
  assert.equal(at999.minimumListPriceCents, 767n);
  assert.equal(at998.minimumListPriceCents, 920n);
  assert.equal(at999.minimumAtFiftyCents, 920n);
  assert.equal(at999.minimumAtSixtyCents, 767n);

  const tooCheap = calculatePrintRoyalty({
    format: "paperback",
    ink: "black",
    trim: "regular",
    pages: 300,
    listPriceCents: 800n,
  });

  assert.equal(tooCheap.priceInRange, false);
  assert.equal(tooCheap.royaltyCents, -60n);
  assert.equal(
    calculatePrintRoyalty({
      format: "hardcover",
      ink: "black",
      trim: "regular",
      pages: 300,
      listPriceCents: 25_001n,
    }).priceInRange,
    false,
  );
});
