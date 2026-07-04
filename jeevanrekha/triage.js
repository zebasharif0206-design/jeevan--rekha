/* Jeevanरेखा — START triage + protocol suggestion logic.
   Pure functions, no React/DOM dependency, so they can be unit-tested
   under plain Node (see tests/triage.test.js) as well as loaded directly
   in the browser via <script src="triage.js"></script>.
*/
function triageOf(a) {
  // Universal RED triggers
  if (a.breathing === "no") return "BLACK";
  if (a.victimCount === "many") return "RED";

  // Type-specific RED triggers
  const t = a.accidentType;
  if (t === "electric" && a.stillLive === "yes") return "RED";
  if (t === "fire" && a.burnsExtent === "large") return "RED";
  if (t === "fire" && a.trapped === "yes") return "RED";
  if (t === "water" && (a.waterTime === "long" || a.conscious === "no")) return "RED";
  if (t === "bite" && a.biteAllergy === "yes") return "RED";
  if (t === "bite" && a.biteSource === "snake") return "RED";
  if (t === "medical" && (a.medSymptom === "chest" || a.medSymptom === "weakness" || a.medSymptom === "birth" || a.medSymptom === "seizure")) return "RED";
  if (t === "poison" && (a.poisonType === "acid" || a.poisonType === "household" || a.poisonTimeAgo === "under1h")) return "RED";

  // Common RED
  if (a.conscious === "no") return "RED";
  if (a.bleeding === "severe") return "RED";

  // YELLOW
  if (a.neckPain === "yes") return "YELLOW";
  if (a.bleeding === "moderate") return "YELLOW";
  if (t === "bite") return "YELLOW";
  if (t === "fire" && a.burnsExtent === "small") return "YELLOW";
  if (t === "medical" && (a.medSymptom === "breathing" || a.medSymptom === "sugar" || a.medSymptom === "faint")) return "YELLOW";
  if (t === "poison") return "YELLOW";
  if (t === "electric") return "YELLOW";
  if (t === "water") return "YELLOW";

  if (a.conscious === "yes" && a.breathing === "yes") return "GREEN";
  return "YELLOW";
}
function suggestedProtocolId(a) {
  const t = a.accidentType;

  if (a.victimCount === "many") return "multiple-casualties";

  // Not breathing — top priority routes
  if (a.breathing === "no") {
    if (t === "water") return "drowning-rescue";
    if (t === "electric") return "electric-shock";
    return "cpr";
  }

  // Electric — current contact is the critical concern
  if (t === "electric") {
    if (a.stillLive === "yes") return "electric-shock";
    if (a.electricBurns === "yes") return "burns";
    return "electric-shock";
  }

  // Fire — trapped + burns + smoke ordering
  if (t === "fire") {
    if (a.trapped === "yes" && a.conscious === "yes") return "crush-injury";
    if (a.burnsExtent === "large" || a.burnsExtent === "small") return "burns";
    return "smoke-inhalation";
  }

  // Water
  if (t === "water") {
    if (a.dovedIn === "yes") return "spinal-injury";
    return "drowning-rescue";
  }

  // Bite — allergy beats source, snake worst case
  if (t === "bite") {
    if (a.biteAllergy === "yes") return "anaphylaxis";
    if (a.biteSource === "snake") return "snake-bite";
    if (a.biteSource === "dog") return "dog-bite";
    if (a.biteSource === "scorpion" || a.biteSource === "bee") return "scorpion-sting";
    return "snake-bite";
  }

  // Medical — symptom-driven
  if (t === "medical") {
    switch (a.medSymptom) {
      case "chest":     return "heart-attack";
      case "weakness":  return "stroke";
      case "seizure":   return "seizure";
      case "breathing": return "asthma-attack";
      case "sugar":     return "diabetic-emergency";
      case "birth":     return "emergency-childbirth";
      case "faint":     return "fainting";
      default:          return a.conscious === "no" ? "unconscious-breathing" : "fainting";
    }
  }

  // Poison
  if (t === "poison") {
    if (a.poisonType === "acid") return "acid-attack";
    if (a.poisonType === "chemical_skin") return "chemical-burn";
    return "poisoning-ingestion";
  }

  // Fall
  if (t === "fall") {
    if (a.neckPain === "yes" || a.conscious === "no") return "spinal-injury";
    if (a.bleeding === "severe") return "severe-bleeding";
    return "head-injury";
  }

  // Road / other — symptom-led
  if (a.victimCount === "few") return "multiple-casualties";
  if (a.conscious === "no" && a.breathing === "yes") return "unconscious-breathing";
  if (a.bleeding === "severe" || a.bleeding === "moderate") return "severe-bleeding";
  if (a.neckPain === "yes") return "spinal-injury";
  if (a.conscious === "yes") return "shock";
  return "unconscious-breathing";
}

/* Works as a plain global-scope <script> in the browser (attaches to window
   implicitly) AND as a CommonJS module under Node for unit testing. */
if (typeof module !== "undefined" && module.exports) {
  module.exports = { triageOf, suggestedProtocolId };
}
