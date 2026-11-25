const RED_FLAGS = [
  "chest pain",
  "difficulty breathing",
  "severe bleeding",
  "unconscious",
  "stroke"
];

const YELLOW_FLAGS = [
  "high fever",
  "persistent vomiting",
  "severe headache",
  "migraine",
  "infection"
];

function evaluateTriage(symptoms = []) {
  const normalized = symptoms.map(s => s.toLowerCase().trim());

  const hasRedFlag = normalized.some(s =>
    RED_FLAGS.some(flag => s.includes(flag))
  );
  if (hasRedFlag) {
    return {
      priority: "RED",
      action: "Emergency — Seek immediate in-person care or call emergency services.",
      allowOnlineBooking: false
    };
  }

  const hasYellowFlag = normalized.some(s =>
    YELLOW_FLAGS.some(flag => s.includes(flag))
  );
  if (hasYellowFlag) {
    return {
      priority: "YELLOW",
      action: "Urgent — Priority teleconsultation within 2 hours.",
      allowOnlineBooking: true
    };
  }

  return {
    priority: "GREEN",
    action: "Routine — Standard appointment booking available.",
    allowOnlineBooking: true
  };
}

module.exports = { evaluateTriage };
