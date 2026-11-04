/** LexisPredict - analytical financial model for W1 Capital (not billing code).
 * Recurring reference prices taken from LexisPredict main
 * src/lib/planos-precos.ts at commit e99338a02f9f839388999c81a920b8ea8526cb22.
 * Setup and operational hours are assumptions and are NOT in the product.
 * This module never accesses customer records, payments or accounting.
 */
export const SOURCE = Object.freeze({
  repository: "W1CAPITAL/LexisPredict",
  commit: "e99338a02f9f839388999c81a920b8ea8526cb22",
  date: "2026-11-04",
  file: "src/lib/planos-precos.ts"
});
export const PLANS = Object.freeze({
  essencial: Object.freeze({ name: "Essencial", monthly: 197, annual: 1970, proposedOnboarding: 490, onboardingHours: 3, supportHoursMonthly: 0.5 }),
  financeiro: Object.freeze({ name: "Financeiro", monthly: 297, annual: 2970, proposedOnboarding: 690, onboardingHours: 4, supportHoursMonthly: 0.75 }),
  operacional: Object.freeze({ name: "Operacional", monthly: 397, annual: 3970, proposedOnboarding: 790, onboardingHours: 5, supportHoursMonthly: 1 }),
  maximo: Object.freeze({ name: "Máximo", monthly: 597, annual: 5970, proposedOnboarding: 990, onboardingHours: 6, supportHoursMonthly: 1.5 })
});
export const PLATFORM_SCENARIO_USD = Object.freeze({
  vercelProStarting: 20,
  supabaseProStarting: 25,
  subtotalStarting: 45,
  disclaimer: "Public starting-plan scenario. Not an actual W1 invoice; excludes additional seats, overages, worker, taxes, exchange rate and paid integrations."
});
const round = n => Math.round((n + Number.EPSILON) * 100) / 100;
const positiveNumber = (value, label) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || n > 100000000)
    throw new Error("Entrada inválida: " + label);
  return n;
};
export function unitEconomics(planId, {
  laborCostPerHourBrl = 80,
  cardProcessingRate = 0.0399,
  cardProcessingFixedBrl = 0.39,
} = {}) {
  const plan = PLANS[planId];
  if (!plan) throw new Error("Plano não reconhecido.");
  const hourly = positiveNumber(laborCostPerHourBrl, "custo horário");
  const rate = positiveNumber(cardProcessingRate, "taxa percentual");
  const fixed = positiveNumber(cardProcessingFixedBrl, "tarifa fixa");
  if (rate > 1) throw new Error("Taxa percentual deve ser uma fração até 1.");
  const supportBrl = round(plan.supportHoursMonthly * hourly);
  const onboardingLaborBrl = round(plan.onboardingHours * hourly);
  const cardFeeBrl = round(plan.monthly * rate + fixed);
  return Object.freeze({
    ...plan,
    supportBrl,
    onboardingLaborBrl,
    onboardingContributionBeforeOverheadsBrl: round(plan.proposedOnboarding - onboardingLaborBrl),
    cardFeeBrl,
    monthlyContributionBeforeOverheadsBrl: round(plan.monthly - supportBrl - cardFeeBrl),
    disclaimer: "Margem operacional hipotética antes de infraestrutura, tributos, aquisição, inadimplência, suporte excedente, câmbio e demais despesas. Não equivale a lucro contábil."
  });
}
/** Input is a simulated plan mix, never inferred from the database.
 * The function returns separate BRL operating estimates and USD baseline;
 * intentionally does not convert currencies or claim gross profit.
 */
export function scenario(planCounts, options = {}) {
  const counts = {};
  let accounts = 0;
  let recurringBrl = 0;
  let laborBrl = 0;
  let cardFeesBrl = 0;
  for (const planId of Object.keys(PLANS)) {
    const n = Number(planCounts?.[planId] ?? 0);
    if (!Number.isSafeInteger(n) || n < 0 || n > 100000)
      throw new Error("Quantidade inválida para " + planId);
    counts[planId] = n;
    const unit = unitEconomics(planId, options);
    accounts += n;
    recurringBrl += unit.monthly * n;
    laborBrl += unit.supportBrl * n;
    cardFeesBrl += unit.cardFeeBrl * n;
  }
  recurringBrl = round(recurringBrl);
  laborBrl = round(laborBrl);
  cardFeesBrl = round(cardFeesBrl);
  return Object.freeze({
    counts, accounts,
    simulatedMonthlyRevenueBrl: recurringBrl,
    modeledSupportBrl: laborBrl,
    modeledCardFeesBrl: cardFeesBrl,
    contributionBeforeOverheadsBrl: round(recurringBrl-laborBrl-cardFeesBrl),
    platformStartingUsd: PLATFORM_SCENARIO_USD.subtotalStarting,
    actualClientsVerified: false,
    actualRevenueVerified: false
  });
}
