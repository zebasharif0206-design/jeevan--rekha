/* Unit tests for the START triage engine + protocol suggestion logic.
   Run with:  node --test tests/
   Requires Node 18+ (built-in test runner, no install needed).
*/
const test = require("node:test");
const assert = require("node:assert/strict");
const { triageOf, suggestedProtocolId } = require("../triage.js");

function base(overrides) {
  return Object.assign({
    accidentType: "road",
    conscious: "yes",
    breathing: "yes",
    bleeding: "none",
    neckPain: "no",
    victimCount: "one",
  }, overrides);
}

test("not breathing is always BLACK regardless of other answers", () => {
  assert.equal(triageOf(base({ breathing: "no" })), "BLACK");
  assert.equal(triageOf(base({ breathing: "no", conscious: "yes" })), "BLACK");
});

test("many victims is RED even if individually stable", () => {
  assert.equal(triageOf(base({ victimCount: "many" })), "RED");
});

test("unconscious victim is RED", () => {
  assert.equal(triageOf(base({ conscious: "no" })), "RED");
});

test("severe bleeding is RED", () => {
  assert.equal(triageOf(base({ bleeding: "severe" })), "RED");
});

test("moderate bleeding is YELLOW, not RED", () => {
  assert.equal(triageOf(base({ bleeding: "moderate" })), "YELLOW");
});

test("suspected neck/spinal injury is YELLOW", () => {
  assert.equal(triageOf(base({ neckPain: "yes" })), "YELLOW");
});

test("conscious, breathing, no bleeding/neck pain is GREEN", () => {
  assert.equal(triageOf(base()), "GREEN");
});

test("electric shock: still in contact with live current is RED", () => {
  assert.equal(triageOf(base({ accidentType: "electric", stillLive: "yes" })), "RED");
});

test("electric shock: no longer live current is YELLOW", () => {
  assert.equal(triageOf(base({ accidentType: "electric", stillLive: "no" })), "YELLOW");
});

test("fire: large burns is RED", () => {
  assert.equal(triageOf(base({ accidentType: "fire", burnsExtent: "large" })), "RED");
});

test("fire: trapped victim is RED even with small/no burns", () => {
  assert.equal(triageOf(base({ accidentType: "fire", trapped: "yes", burnsExtent: "small" })), "RED");
});

test("fire: small burns, not trapped is YELLOW", () => {
  assert.equal(triageOf(base({ accidentType: "fire", burnsExtent: "small", trapped: "no" })), "YELLOW");
});

test("water: long submersion time is RED", () => {
  assert.equal(triageOf(base({ accidentType: "water", waterTime: "long" })), "RED");
});

test("water: short submersion, conscious is YELLOW", () => {
  assert.equal(triageOf(base({ accidentType: "water", waterTime: "short" })), "YELLOW");
});

test("bite: known allergic reaction is RED", () => {
  assert.equal(triageOf(base({ accidentType: "bite", biteAllergy: "yes" })), "RED");
});

test("bite: snake bite is RED even without known allergy", () => {
  assert.equal(triageOf(base({ accidentType: "bite", biteAllergy: "no", biteSource: "snake" })), "RED");
});

test("bite: dog bite without allergy is YELLOW", () => {
  assert.equal(triageOf(base({ accidentType: "bite", biteAllergy: "no", biteSource: "dog" })), "YELLOW");
});

test("medical: chest pain is RED", () => {
  assert.equal(triageOf(base({ accidentType: "medical", medSymptom: "chest" })), "RED");
});

test("medical: one-sided weakness (stroke) is RED", () => {
  assert.equal(triageOf(base({ accidentType: "medical", medSymptom: "weakness" })), "RED");
});

test("medical: seizure is RED", () => {
  assert.equal(triageOf(base({ accidentType: "medical", medSymptom: "seizure" })), "RED");
});

test("medical: difficulty breathing (asthma) is YELLOW", () => {
  assert.equal(triageOf(base({ accidentType: "medical", medSymptom: "breathing" })), "YELLOW");
});

test("poison: acid is RED", () => {
  assert.equal(triageOf(base({ accidentType: "poison", poisonType: "acid" })), "RED");
});

test("poison: swallowed under an hour ago is RED", () => {
  assert.equal(triageOf(base({ accidentType: "poison", poisonType: "other", poisonTimeAgo: "under1h" })), "RED");
});

test("poison: swallowed long ago, non-acid is YELLOW", () => {
  assert.equal(triageOf(base({ accidentType: "poison", poisonType: "other", poisonTimeAgo: "longAgo" })), "YELLOW");
});

// ---- protocol suggestion ----

test("not breathing routes to CPR by default", () => {
  assert.equal(suggestedProtocolId(base({ breathing: "no" })), "cpr");
});

test("not breathing + water routes to drowning rescue", () => {
  assert.equal(suggestedProtocolId(base({ accidentType: "water", breathing: "no" })), "drowning-rescue");
});

test("not breathing + electric routes to electric shock protocol", () => {
  assert.equal(suggestedProtocolId(base({ accidentType: "electric", breathing: "no" })), "electric-shock");
});

test("many victims always routes to multiple-casualties protocol", () => {
  assert.equal(suggestedProtocolId(base({ victimCount: "many" })), "multiple-casualties");
});

test("bite + allergy routes to anaphylaxis over snake-bite", () => {
  assert.equal(suggestedProtocolId(base({ accidentType: "bite", biteAllergy: "yes", biteSource: "snake" })), "anaphylaxis");
});

test("bite + snake (no allergy) routes to snake-bite", () => {
  assert.equal(suggestedProtocolId(base({ accidentType: "bite", biteAllergy: "no", biteSource: "snake" })), "snake-bite");
});

test("medical chest pain routes to heart-attack protocol", () => {
  assert.equal(suggestedProtocolId(base({ accidentType: "medical", medSymptom: "chest" })), "heart-attack");
});

test("medical weakness routes to stroke protocol", () => {
  assert.equal(suggestedProtocolId(base({ accidentType: "medical", medSymptom: "weakness" })), "stroke");
});

test("fall with neck pain routes to spinal-injury", () => {
  assert.equal(suggestedProtocolId(base({ accidentType: "fall", neckPain: "yes" })), "spinal-injury");
});

test("fall with severe bleeding (no neck pain) routes to severe-bleeding", () => {
  assert.equal(suggestedProtocolId(base({ accidentType: "fall", neckPain: "no", bleeding: "severe" })), "severe-bleeding");
});

test("road default with severe bleeding routes to severe-bleeding", () => {
  assert.equal(suggestedProtocolId(base({ accidentType: "road", bleeding: "severe" })), "severe-bleeding");
});

test("road default unconscious-but-breathing routes correctly", () => {
  assert.equal(suggestedProtocolId(base({ accidentType: "road", conscious: "no", breathing: "yes" })), "unconscious-breathing");
});
