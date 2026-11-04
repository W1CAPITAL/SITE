import test from "node:test";
import assert from "node:assert/strict";
import {PLANS,PLATFORM_SCENARIO_USD,unitEconomics,scenario} from "./lexispredict-unit-economics.mjs";

test("all recurring prices match documented LexisPredict product source",()=>{
  assert.deepEqual(Object.keys(PLANS).sort(),["essencial","financeiro","maximo","operacional"]);
  assert.equal(PLANS.essencial.monthly,197);
  assert.equal(PLANS.financeiro.monthly,297);
  assert.equal(PLANS.operacional.monthly,397);
  assert.equal(PLANS.maximo.monthly,597);
  for(const plan of Object.values(PLANS))assert.equal(plan.annual,plan.monthly*10);
});
test("modeled labor and payment processing remain explicitly hypothetical",()=>{
  const e=unitEconomics("essencial");
  assert.equal(e.supportBrl,40);
  assert.equal(e.onboardingLaborBrl,240);
  assert.equal(e.onboardingContributionBeforeOverheadsBrl,250);
  assert.equal(e.cardFeeBrl,8.25);
  assert.equal(e.monthlyContributionBeforeOverheadsBrl,148.75);
  assert.match(e.disclaimer,/hipotética/);
  assert.throws(()=>unitEconomics("inexistente"));
  assert.throws(()=>unitEconomics("essencial",{laborCostPerHourBrl:-10}));
  assert.throws(()=>unitEconomics("essencial",{cardProcessingRate:2}));
});
test("10-account example is simulated, never a claim of W1 income",()=>{
  const x=scenario({essencial:4,financeiro:3,operacional:2,maximo:1});
  assert.equal(x.accounts,10);
  assert.equal(x.simulatedMonthlyRevenueBrl,3070);
  assert.equal(x.modeledSupportBrl,620);
  assert.equal(x.modeledCardFeesBrl,126.39);
  assert.equal(x.contributionBeforeOverheadsBrl,2323.61);
  assert.equal(x.actualClientsVerified,false);
  assert.equal(x.actualRevenueVerified,false);
  assert.equal(x.platformStartingUsd,45);
  assert.match(PLATFORM_SCENARIO_USD.disclaimer,/Not an actual W1 invoice/);
  assert.throws(()=>scenario({essencial:-1}));
  assert.throws(()=>scenario({essencial:1.5}));
});
