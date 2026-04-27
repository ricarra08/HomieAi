import { describe, it, expect } from "vitest";
import {
  getStateConfig,
  isValidStateCode,
  getContingencyDefaults,
  SUPPORTED_STATES,
  STATE_LABELS,
} from "../state-configs";
import { addDays } from "../state-configs/day-counting";
import { computeDeadlinesFromOffer, computeDeadlinesFromSetupForm } from "../computed";
import type { OfferDetails } from "../types";

/* ================================================================== */
/*  State Config Registry                                              */
/* ================================================================== */

describe("state config registry", () => {
  it("supports exactly FL, TX, AZ, CA", () => {
    expect(SUPPORTED_STATES).toEqual(["FL", "TX", "AZ", "CA"]);
  });

  it("has labels for all supported states", () => {
    for (const code of SUPPORTED_STATES) {
      expect(STATE_LABELS[code]).toBeTruthy();
    }
  });

  it("getStateConfig returns config for each supported state", () => {
    for (const code of SUPPORTED_STATES) {
      const config = getStateConfig(code);
      expect(config.state_code).toBe(code);
      expect(config.state_name).toBeTruthy();
    }
  });

  it("getStateConfig throws for unsupported state", () => {
    expect(() => getStateConfig("XX")).toThrow("Unsupported state: XX");
    expect(() => getStateConfig("")).toThrow("Unsupported state: ");
  });

  it("isValidStateCode returns true for supported, false for unsupported", () => {
    expect(isValidStateCode("FL")).toBe(true);
    expect(isValidStateCode("TX")).toBe(true);
    expect(isValidStateCode("AZ")).toBe(true);
    expect(isValidStateCode("CA")).toBe(true);
    expect(isValidStateCode("NY")).toBe(false);
    expect(isValidStateCode("")).toBe(false);
  });
});

/* ================================================================== */
/*  State Config Data Integrity                                        */
/* ================================================================== */

describe("FL config", () => {
  const fl = getStateConfig("FL");

  it("has correct closing structure", () => {
    expect(fl.closing.type).toBe("title_company");
    expect(fl.closing.style).toBe("wet");
    expect(fl.closing.signing_to_keys_gap_days).toBe(0);
  });

  it("uses inspection contingency (not option period)", () => {
    expect(fl.buyer_protection.type).toBe("inspection_contingency");
    expect(fl.option_period.enabled).toBe(false);
  });

  it("has correct contingency defaults", () => {
    expect(fl.contingency_defaults.inspection_days).toBe(15);
    expect(fl.contingency_defaults.financing_days).toBe(30);
    expect(fl.contingency_defaults.appraisal_days).toBeNull(); // embedded in financing
  });

  it("does not require active contingency removal", () => {
    expect(fl.contingency_removal.active_removal_required).toBe(false);
    expect(fl.contingency_removal.silence_means).toBe("acceptance");
  });

  it("uses calendar days without weekend extension", () => {
    expect(fl.day_counting.type).toBe("calendar");
    expect(fl.day_counting.weekend_extension).toBe(false);
  });

  it("has FL-specific insurance types", () => {
    const types = fl.insurance_types.map((i) => i.type);
    expect(types).toContain("wind");
    expect(types).toContain("sinkhole");
  });

  it("has mortgage tax (FL-unique)", () => {
    expect(fl.taxes.mortgage_tax.exists).toBe(true);
    expect(fl.taxes.mortgage_tax.rate_per_thousand).toBe(5.5);
  });

  it("is not a community property state", () => {
    expect(fl.community_property).toBe(false);
  });
});

describe("TX config", () => {
  const tx = getStateConfig("TX");

  it("has option period enabled", () => {
    expect(tx.buyer_protection.type).toBe("option_period");
    expect(tx.option_period.enabled).toBe(true);
    expect(tx.option_period.default_days).toBe(7);
    expect(tx.option_period.fee_recipient).toBe("seller");
    expect(tx.option_period.unrestricted_termination).toBe(true);
  });

  it("uses dry closing", () => {
    expect(tx.closing.style).toBe("dry");
    expect(tx.closing.signing_to_keys_gap_days).toBeGreaterThan(0);
  });

  it("has promulgated forms", () => {
    expect(tx.standard_contracts.promulgated).toBe(true);
  });

  it("has no transfer or mortgage tax", () => {
    expect(tx.taxes.transfer_tax.exists).toBe(false);
    expect(tx.taxes.mortgage_tax.exists).toBe(false);
  });

  it("is a community property state", () => {
    expect(tx.community_property).toBe(true);
  });
});

describe("AZ config", () => {
  const az = getStateConfig("AZ");

  it("uses inspection contingency with weekend extension", () => {
    expect(az.buyer_protection.type).toBe("inspection_contingency");
    expect(az.day_counting.weekend_extension).toBe(true);
    expect(az.contingency_defaults.inspection_days).toBe(10);
  });

  it("silence means acceptance (BINSR)", () => {
    expect(az.contingency_removal.silence_means).toBe("acceptance");
  });

  it("has non-resident withholding", () => {
    expect(az.non_resident_withholding.state_withholding).toBe(true);
    expect(az.non_resident_withholding.rate_percent).toBe(2.0);
  });

  it("uses business days for EMD deposit", () => {
    expect(az.earnest_money.deposit_deadline_type).toBe("business");
  });
});

describe("CA config", () => {
  const ca = getStateConfig("CA");

  it("uses investigation contingency with active removal", () => {
    expect(ca.buyer_protection.type).toBe("investigation_contingency");
    expect(ca.contingency_removal.active_removal_required).toBe(true);
    expect(ca.contingency_removal.silence_means).toBe("contingency_persists");
    expect(ca.contingency_removal.nbp_mechanism).toBe(true);
    expect(ca.contingency_removal.nbp_response_hours).toBe(48);
  });

  it("has standalone appraisal contingency", () => {
    expect(ca.contingency_defaults.appraisal_days).toBe(17);
  });

  it("uses escrow company closing", () => {
    expect(ca.closing.type).toBe("escrow_company");
    expect(ca.closing.style).toBe("escrow");
  });

  it("has supplemental tax", () => {
    expect(ca.taxes.supplemental_tax).toBe(true);
  });

  it("has non-resident withholding at 3.33%", () => {
    expect(ca.non_resident_withholding.state_withholding).toBe(true);
    expect(ca.non_resident_withholding.rate_percent).toBe(3.33);
  });

  it("has weekend extension", () => {
    expect(ca.day_counting.weekend_extension).toBe(true);
  });
});

/* ================================================================== */
/*  getContingencyDefaults                                             */
/* ================================================================== */

describe("getContingencyDefaults", () => {
  it("returns FL defaults", () => {
    const d = getContingencyDefaults("FL");
    expect(d.inspectionDays).toBe("15");
    expect(d.appraisalDays).toBe(""); // embedded in financing
    expect(d.loanDays).toBe("30");
    expect(d.showAppraisal).toBe(false);
    expect(d.showOptionPeriod).toBe(false);
    expect(d.inspectionLabel).toBe("Inspection Contingency");
  });

  it("returns TX defaults with option period", () => {
    const d = getContingencyDefaults("TX");
    expect(d.inspectionDays).toBe("7");
    expect(d.loanDays).toBe("25");
    expect(d.showOptionPeriod).toBe(true);
    expect(d.optionPeriodDays).toBe("7");
    expect(d.inspectionLabel).toBe("Option Period");
  });

  it("returns CA defaults with standalone appraisal", () => {
    const d = getContingencyDefaults("CA");
    expect(d.inspectionDays).toBe("17");
    expect(d.appraisalDays).toBe("17");
    expect(d.loanDays).toBe("21");
    expect(d.showAppraisal).toBe(true);
    expect(d.inspectionLabel).toBe("Investigation Contingency");
  });
});

/* ================================================================== */
/*  Day Counting                                                       */
/* ================================================================== */

describe("addDays", () => {
  it("adds calendar days", () => {
    expect(addDays("2026-05-01", 10, "calendar", false)).toBe("2026-05-11");
  });

  it("adds calendar days crossing month boundary", () => {
    expect(addDays("2026-05-25", 10, "calendar", false)).toBe("2026-06-04");
  });

  it("adds business days (skips weekends)", () => {
    // 2026-05-01 is Friday. 5 business days = Mon-Fri of next week = 2026-05-08
    expect(addDays("2026-05-01", 5, "business", false)).toBe("2026-05-08");
  });

  it("applies weekend extension when landing on Saturday", () => {
    // 2026-05-01 (Fri) + 8 calendar days = 2026-05-09 (Sat) → push to Mon 2026-05-11
    expect(addDays("2026-05-01", 8, "calendar", true)).toBe("2026-05-11");
  });

  it("applies weekend extension when landing on Sunday", () => {
    // 2026-05-01 (Fri) + 9 calendar days = 2026-05-10 (Sun) → push to Mon 2026-05-11
    expect(addDays("2026-05-01", 9, "calendar", true)).toBe("2026-05-11");
  });

  it("no extension when landing on weekday", () => {
    // 2026-05-01 (Fri) + 10 = 2026-05-11 (Mon), no extension needed
    expect(addDays("2026-05-01", 10, "calendar", true)).toBe("2026-05-11");
  });

  it("handles Date object input", () => {
    const date = new Date("2026-05-01T00:00:00");
    expect(addDays(date, 5, "calendar", false)).toBe("2026-05-06");
  });
});

/* ================================================================== */
/*  computeDeadlinesFromOffer — state-aware                           */
/* ================================================================== */

function makeOffer(overrides: Partial<OfferDetails> = {}): OfferDetails {
  return {
    id: "offer-1",
    deal_id: "deal-1",
    offer_price: 400_000,
    earnest_money: 10_000,
    closing_date: "2026-07-15",
    contingency_inspection_days: 10,
    contingency_appraisal_days: 15,
    contingency_financing_days: 21,
    contingency_disclosure_days: 5,
    pre_approval_doc_id: null,
    proof_of_funds_doc_id: null,
    checklist_items: {},
    status: "accepted",
    option_period_days: null,
    option_fee: null,
    option_fee_delivered: false,
    option_fee_delivery_date: null,
    investigation_contingency_days: null,
    contract_type: null,
    seller_repair_cap_percent: null,
    created_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("computeDeadlinesFromOffer with FL config", () => {
  const fl = getStateConfig("FL");

  it("generates EMD deadline from FL config", () => {
    const offer = makeOffer();
    const result = computeDeadlinesFromOffer(offer, "2026-05-01", fl);
    const emd = result.find((d) => d.type === "earnest-money");
    expect(emd).toBeTruthy();
    // FL: 3 calendar days
    expect(emd!.due_date).toBe("2026-05-04");
  });

  it("labels as Inspection Contingency for FL", () => {
    const offer = makeOffer();
    const result = computeDeadlinesFromOffer(offer, "2026-05-01", fl);
    const insp = result.find((d) => d.type === "inspection");
    expect(insp).toBeTruthy();
    expect(insp!.name).toBe("Inspection Contingency");
  });

  it("does NOT generate option period deadlines for FL", () => {
    const offer = makeOffer();
    const result = computeDeadlinesFromOffer(offer, "2026-05-01", fl);
    expect(result.find((d) => d.type === "option-period")).toBeUndefined();
    expect(result.find((d) => d.type === "option-fee-delivery")).toBeUndefined();
  });
});

describe("computeDeadlinesFromOffer with TX config", () => {
  const tx = getStateConfig("TX");

  it("generates option period deadline when option_period_days set", () => {
    const offer = makeOffer({ option_period_days: 7 });
    const result = computeDeadlinesFromOffer(offer, "2026-05-01", tx);

    const option = result.find((d) => d.type === "option-period");
    expect(option).toBeTruthy();
    expect(option!.due_date).toBe("2026-05-08");

    const feeDelivery = result.find((d) => d.type === "option-fee-delivery");
    expect(feeDelivery).toBeTruthy();
    expect(feeDelivery!.due_date).toBe("2026-05-04"); // 3 days
  });

  it("does NOT generate option period if days not provided", () => {
    const offer = makeOffer({ option_period_days: null });
    const result = computeDeadlinesFromOffer(offer, "2026-05-01", tx);
    expect(result.find((d) => d.type === "option-period")).toBeUndefined();
  });
});

describe("computeDeadlinesFromOffer with CA config", () => {
  const ca = getStateConfig("CA");

  it("labels as Investigation Contingency for CA", () => {
    const offer = makeOffer();
    const result = computeDeadlinesFromOffer(offer, "2026-05-01", ca);
    const inv = result.find((d) => d.type === "investigation");
    expect(inv).toBeTruthy();
    expect(inv!.name).toContain("Investigation");
  });

  it("applies weekend extension for CA", () => {
    // 2026-05-01 (Fri) + 17 = 2026-05-18 (Mon) — no extension needed
    const offer = makeOffer({ contingency_inspection_days: 17 });
    const result = computeDeadlinesFromOffer(offer, "2026-05-01", ca);
    const inv = result.find((d) => d.type === "investigation");
    expect(inv!.due_date).toBe("2026-05-18");
  });

  it("uses business days for EMD deposit", () => {
    const offer = makeOffer();
    const result = computeDeadlinesFromOffer(offer, "2026-05-01", ca);
    const emd = result.find((d) => d.type === "earnest-money");
    // CA: 3 business days from Fri 05/01 = Wed 05/06
    expect(emd!.due_date).toBe("2026-05-06");
  });
});

/* ================================================================== */
/*  computeDeadlinesFromOffer — backward compat (no stateConfig)      */
/* ================================================================== */

describe("computeDeadlinesFromOffer without stateConfig", () => {
  it("generates legacy deadlines without EMD", () => {
    const offer = makeOffer();
    const result = computeDeadlinesFromOffer(offer, "2026-05-01");
    // No EMD deadline when no state config
    expect(result.find((d) => d.type === "earnest-money")).toBeUndefined();
    // Still has inspection, appraisal, financing, disclosure, closing
    expect(result.find((d) => d.type === "inspection")).toBeTruthy();
    expect(result.find((d) => d.type === "appraisal")).toBeTruthy();
  });

  it("uses calendar days by default", () => {
    const offer = makeOffer({ contingency_inspection_days: 10 });
    const result = computeDeadlinesFromOffer(offer, "2026-05-01");
    const insp = result.find((d) => d.type === "inspection");
    expect(insp!.due_date).toBe("2026-05-11");
  });
});

/* ================================================================== */
/*  computeDeadlinesFromSetupForm                                      */
/* ================================================================== */

describe("computeDeadlinesFromSetupForm", () => {
  it("generates basic deadlines without state config", () => {
    const result = computeDeadlinesFromSetupForm({
      acceptanceDate: "2026-05-01",
      inspectionDays: 15,
      loanDays: 30,
      closingDate: "2026-06-15",
    });
    expect(result.find((d) => d.type === "inspection")).toBeTruthy();
    expect(result.find((d) => d.type === "financing")).toBeTruthy();
    expect(result.find((d) => d.type === "closing")).toBeTruthy();
    // No EMD without state config
    expect(result.find((d) => d.type === "earnest-money")).toBeUndefined();
  });

  it("generates FL deadlines with EMD", () => {
    const fl = getStateConfig("FL");
    const result = computeDeadlinesFromSetupForm({
      acceptanceDate: "2026-05-01",
      inspectionDays: 15,
      loanDays: 30,
      closingDate: "2026-06-15",
    }, fl);
    const emd = result.find((d) => d.type === "earnest-money");
    expect(emd).toBeTruthy();
    expect(emd!.due_date).toBe("2026-05-04");
  });

  it("generates TX option period deadlines", () => {
    const tx = getStateConfig("TX");
    const result = computeDeadlinesFromSetupForm({
      acceptanceDate: "2026-05-01",
      inspectionDays: 7,
      loanDays: 25,
      optionPeriodDays: 7,
      closingDate: "2026-06-15",
    }, tx);

    expect(result.find((d) => d.type === "option-period")).toBeTruthy();
    expect(result.find((d) => d.type === "option-fee-delivery")).toBeTruthy();
    // TX uses "inspection" type (not "investigation")
    expect(result.find((d) => d.type === "inspection")).toBeTruthy();
  });

  it("generates CA investigation + appraisal deadlines", () => {
    const ca = getStateConfig("CA");
    const result = computeDeadlinesFromSetupForm({
      acceptanceDate: "2026-05-01",
      inspectionDays: 17,
      appraisalDays: 17,
      loanDays: 21,
      closingDate: "2026-06-01",
    }, ca);

    expect(result.find((d) => d.type === "investigation")).toBeTruthy();
    expect(result.find((d) => d.type === "appraisal")).toBeTruthy();
    expect(result.find((d) => d.type === "inspection")).toBeUndefined(); // CA uses "investigation" not "inspection"
  });

  it("returns empty when no acceptance date deadlines needed", () => {
    const result = computeDeadlinesFromSetupForm({
      acceptanceDate: "2026-05-01",
    });
    expect(result).toHaveLength(0);
  });
});
