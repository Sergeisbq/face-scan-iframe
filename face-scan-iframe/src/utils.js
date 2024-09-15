export const capitalizeFirstLetter = (string) => {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const getAudioPackageName = (audioServiceType) => `audio${capitalizeFirstLetter(audioServiceType || "loanDefault")}`;

export const isCameraLandscapeAlign = ({ height: videoHeight, width: videoWidth }) => videoWidth && videoHeight && videoWidth > videoHeight;

// needed in order to run workers in react - currently not in use
export default class WorkerBuilder extends Worker {
  constructor(worker) {
    const code = worker.toString();
    const blob = new Blob([`(${code})()`]);
    return new Worker(URL.createObjectURL(blob));
  }
}

export const msgParentWindow = (action, analysisData) =>
  window.parent.postMessage(
    {
      action,
      analysisData
    },
    "*"
  );

export const getBarWidthInPercentForVoiceLabel = (labelValue, valueCount) =>
  valueCount === "10" ? labelValue * 10 : valueCount === "4" ? labelValue * 25 : labelValue * 20;

export const voiceLabelsDictionary = [
  {
    key: "Adjustment",
    title: "Adjustment",
    valueCount: "5",
    description:
      "Adaptability tendency: adjusting to changes, coping, stress resilience, less affected by emotions, accept criticism, confident, calm, better handle difficulties and adjusting to demanding environments."
  },
  {
    key: "Agreeableness",
    title: "Agreeableness",
    valueCount: "5",
    description: "Tendency to get along with others, be considerate, kind, trustworthy, helpful, compromise, seek positive outcome."
  },
  {
    key: "Ambition",
    title: "Ambition",
    valueCount: "5",
    description:
      "Ambition tendency: motivated, competitive, goal- driven, task-oriented, decisive, confident, control seeking, determined, persistent, and hard-working."
  },
  {
    key: "Attentive",
    title: "Attentive",
    valueCount: "5",
    description: "Being attentive means going beyond immediate empathy and picking up on customer."
  },
  {
    key: "AttitudeLevel",
    title: "Attitude Level",
    valueCount: "10",
    description:
      "How positive or negative the caller sounds. This measurement reflects person's beliefs, values, behaviors, and motivations. Often reflecting favorable or unfavorable feelings."
  },
  {
    key: "Attrition",
    title: "Attrition",
    valueCount: "10",
    description:
      "The predicted risk for employee attrition. It combines the burnout score with other predicted behavior scores, such as stability and commitment. The score averages the recordings from the last 5 interactions."
  },
  {
    key: "BrandLoyalConsumer",
    title: "Brand Loyal Consumer",
    valueCount: "10",
    description:
      "Brand loyal buying tendency: focus on brand recognition, brand image, brand perception, past-experience, references, conservative considerations, and steadiness."
  },
  {
    key: "Burnout",
    title: "Burnout",
    valueCount: "10",
    description: "Worn-out state of mind, less energy, less coping resources, less stress tolerance, less stable at job and personal life."
  },
  {
    key: "Communication",
    title: "Communication",
    valueCount: "5",
    description:
      "Sociability tendency: active communicators - participating, convincing, consulting, influencing, seeking feedback, enjoy social interactions, enjoys working with others, feels comfortable in large groups, tends to be open and personal."
  },
  {
    key: "Conscientiousness",
    title: "Conscientiousness",
    valueCount: "5",
    description: "Tendency to be diligent, thorough, careful, responsible, persistent, organized, obligated, self-disciplined."
  },
  {
    key: "Cooperation",
    title: "Cooperation",
    valueCount: "5",
    description:
      "Tendency to be cooperative, responsive, follow rules, respect agreements, compromise, seek for positive outcome, work together towards a common outcome."
  },
  {
    key: "Creativity",
    title: "Creativity",
    valueCount: "5",
    description:
      "Creativity tendency: imaginative, artistic, intuitive, tend to be unconventional, prefer unstructured environment, unique and original tasks, dislike routine, seek new experiences and willing to take risks, may be impulsive."
  },
  {
    key: "CustomerServiceFit",
    title: "Customer Service Fit",
    valueCount: "5",
    description:
      "Customer service orientation: cooperative, engaged, trusted, customer focused, service oriented, willing to assist, sensitive to customer experience, practical, systematic, informative, thorough."
  },
  {
    key: "DebtRepaymentProbability",
    title: "Debt Repayment Probability",
    valueCount: "10",
    description: "Overall probability for collection default."
  },
  {
    key: "EmotionalStability",
    title: "Emotional Stability",
    valueCount: "5",
    description: "Tendency to cope well, better handle stress, be stable at job and personal life."
  },
  {
    key: "EnergyLevel",
    title: "Energy Level",
    valueCount: "10",
    description:
      "Tendency to be future oriented, anticipate risks, take suitable precautions, plan appropriately, cope more actively in face of a crisis."
  },
  {
    key: "Engaged",
    title: "Engaged",
    valueCount: "5",
    description: "Energetic, involved, enthusiastic, and outgoing."
  },
  {
    key: "Extraversion",
    title: "Extraversion",
    valueCount: "5",
    description: "Tendency to be energetic, active, outgoing, expressive, socially engaged."
  },
  { key: "FinancialRisk", title: "Financial Risk", valueCount: "10", description: "Overall probability for future loan default." },
  {
    key: "Fraud",
    title: "Fraud",
    valueCount: "10",
    description: "The potential to engage in fraud."
  },
  {
    key: "Innovation",
    title: "Innovation",
    valueCount: "5",
    description:
      "Innovation tendency: curious, like to explore new ideas, future oriented, investigative, logical, initiative, like changes, and problem solving, may be critical."
  },
  {
    key: "Integrity",
    title: "Integrity",
    valueCount: "5",
    description:
      "Personal integrity tendency: loyal, responsible, tend to follow rules, accept authority, identify with group goals, comply with procedures and regulations."
  },
  {
    key: "Learning",
    title: "Learning",
    valueCount: "5",
    description:
      "Ability to acquire new skills and knowledge, driven by curiosity and adaptability. Committed to lifelong growth and self-improvement, utilizing effective learning strategies for quick application in diverse contexts."
  },
  {
    key: "ManagementFit",
    title: "Management Fit",
    valueCount: "5",
    description:
      "Management orientation: motivated, ambitious, goal- driven, proactive, decisive, determined, confident, people-oriented, communicative, engaged, cooperative, trustful, systematic, planned, thorough, loyal, knowledgeable, insightful."
  },
  {
    key: "Open",
    title: "Open",
    valueCount: "5",
    description:
      "Tendency to be less structured, less involved in details, less stable; impractical, trending towards untruthful assessment of situations."
  },
  {
    key: "Openness",
    title: "Openness",
    valueCount: "5",
    description: "Tendency to be open to new experiences, art, emotion, adventure, unusual ideas, imagination, curiosity."
  },
  {
    key: "PriceValueConsumer",
    title: "Opportunistic",
    valueCount: "10",
    description:
      "Tendency to react to perceived circumstances, less concerned by formal obligations, take calculated risks, can stretch borders. An opportunist seizes every opportunity to improve things for himself, often at the expense of ethics or morals."
  },
  {
    key: "OverallWellBeing",
    title: "General Wellness",
    valueCount: "4",
    description:
      "General Well Being score measuring the dimensions of energy, emotional state, stress indication, coping mechanism, and social involvement."
  },
  {
    key: "RDFit",
    title: "Role Candidate Fit",
    valueCount: "5",
    description: "Overall predicted success score in a specified role."
  },
  {
    key: "SalesFit",
    title: "Sales Fit",
    valueCount: "5",
    description:
      "Sales orientation: goal driven, pro-active, initiative, determined, persistent, prospect-oriented, building relationships, systematic networking, patience, coping with difficulties, negotiating and closing."
  },
  {
    key: "Satisfaction",
    title: "Satisfaction",
    valueCount: "10",
    description: "A measurement of how products and services meet or surpass the customer's expectation."
  },
  {
    key: "Systematic",
    title: "Systematic",
    valueCount: "5",
    description:
      "Systematic tendency: organized, planned, detailed, thorough, and consistent, seek task completion, tend to be methodological, long-term oriented, tend to prefer accuracy over speed."
  },
  {
    key: "Temperament",
    title: "Temperament",
    valueCount: "5",
    description:
      "Energy and activity tendency: outgoing, action oriented, enthusiastic, optimistic, initiative, quick versus introversion, calmness, reserved, hesitation, steadiness, reflective, cautious."
  },
  {
    key: "WBCoping",
    title: "Coping Mechanism",
    valueCount: "4",
    description: "Reflects personal coping resources, proactivity, adaptability, resilience, and control."
  },
  {
    key: "WBEmotion",
    title: "Emotional State",
    valueCount: "4",
    description: "Reflects personal emotional state: optimistic, hopeful, and positive versus pessimistic, sad and negative."
  },
  {
    key: "WBEnergy",
    title: "Energy",
    valueCount: "4",
    description: "Reflects personal energy levels, vitality, engagement, and activity."
  },
  {
    key: "WBSocial",
    title: "Social State",
    valueCount: "4",
    description: "Reflects personal sociability, involvement, communication, outgoing."
  },
  {
    key: "WBStressControl",
    title: "Stress Control",
    valueCount: "4",
    description:
      "The degree to which you feel overwhelmed or unable to cope as a result of pressures that are unmanageable. We provide a daily (single data point) score for this dimension."
  }
];

export const matchResultsToPrettyLabel = (assessedData, labelDictionary) => {
  if (!assessedData || !labelDictionary) return [];
  const subScores = assessedData.audioSubScores;
  const setLabelDictionary = voiceLabelsDictionary;

  const displayedLabels = [];
  setLabelDictionary.forEach((labelData) => {
    const labelValue = subScores[labelData.key];
    if (labelValue || labelValue === 0) {
      displayedLabels.push({ ...labelData, labelValue });
    }
  });

  return displayedLabels;
};

export const camelCaseToCapitalizedSpace = (str) => {
  if (!str) return str;
  const words = str.replace(/([a-z])([A-Z])/g, "$1 $2").split(" ");
  const capitalizedWords = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1));
  return capitalizedWords.join(" ");
};

export const runFunctionEveryMSUntilSuccess = async (ms, repeats, initWaitInMs, callback) => {
  if (initWaitInMs) await waitInMs(initWaitInMs);

  for (let index = 0; index < repeats; index++) {
    // Will run for X times with 'repeats' secs interval
    if (index) await waitInMs(ms);

    const results = await callback();
    if (results) return results;
  }
};

export const waitInMs = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
