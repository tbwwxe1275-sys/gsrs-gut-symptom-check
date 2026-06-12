const DIMENSION_BAR_COLOR = "#f2652e";

export const DIMENSIONS = {
  reflux: {
    label: "反流信号",
    shortLabel: "反流",
    color: DIMENSION_BAR_COLOR,
    description: "烧心、反酸、胃内容物上返感更突出。",
    suggestion: "更适合先观察夜间反流、餐后躺卧、咖啡酒精和高脂饮食等触发因素。",
  },
  abdominalPain: {
    label: "腹痛信号",
    shortLabel: "腹痛",
    color: DIMENSION_BAR_COLOR,
    description: "上腹不适、饥饿痛、恶心一类体验更明显。",
    suggestion: "更适合记录疼痛和进食、压力、睡眠、药物之间的关系。",
  },
  indigestion: {
    label: "消化不良信号",
    shortLabel: "消化不良",
    color: DIMENSION_BAR_COLOR,
    description: "腹胀、嗳气、肠鸣、排气等胀满感更集中。",
    suggestion: "更适合从进食速度、餐量、产气食物和餐后活动开始排查。",
  },
  diarrhea: {
    label: "腹泻信号",
    shortLabel: "腹泻",
    color: DIMENSION_BAR_COLOR,
    description: "稀便、排便次数增多、便意急迫更突出。",
    suggestion: "更适合记录近期饮食变化、感染线索、乳糖/酒精/辛辣刺激和作息波动。",
  },
  constipation: {
    label: "便秘信号",
    shortLabel: "便秘",
    color: DIMENSION_BAR_COLOR,
    description: "排便减少、粪便偏硬、排不尽感更突出。",
    suggestion: "更适合先看饮水、膳食纤维、久坐、运动和排便节律。",
  },
};

export const SCALE_OPTIONS = [
  { value: 1, label: "没有", detail: "过去一周基本没有" },
  { value: 2, label: "很轻", detail: "偶尔出现，不太影响" },
  { value: 3, label: "轻度", detail: "能注意到，但可忽略" },
  { value: 4, label: "中度", detail: "会影响当天状态" },
  { value: 5, label: "较重", detail: "明显困扰，需要处理" },
  { value: 6, label: "严重", detail: "频繁或影响工作生活" },
  { value: 7, label: "很严重", detail: "强烈困扰，建议就医评估" },
];

export const GSRS_SCHEMA = {
  title: "胃肠症状自测",
  reference: "Inspired by the 15-item, 5-cluster structure of GSRS.",
  timeframe: "过去一周",
  scale: SCALE_OPTIONS,
  items: [
    {
      id: "reflux_heartburn",
      dimension: "reflux",
      title: "胸口或上腹有烧灼感",
      plainTitle: "像烧心、灼热、火辣辣的感觉。",
    },
    {
      id: "reflux_regurgitation",
      dimension: "reflux",
      title: "反酸或食物/酸水上返",
      plainTitle: "胃里的东西往上涌，嘴里发酸或发苦。",
    },
    {
      id: "pain_upper_abdominal",
      dimension: "abdominalPain",
      title: "上腹部疼痛或明显不舒服",
      plainTitle: "胃口附近发痛、顶着、拧着或不自在。",
    },
    {
      id: "pain_hunger",
      dimension: "abdominalPain",
      title: "空腹时胃部疼痛或不适",
      plainTitle: "饿的时候更容易不舒服，吃点东西可能缓解。",
    },
    {
      id: "pain_nausea",
      dimension: "abdominalPain",
      title: "恶心、想吐或胃里翻腾",
      plainTitle: "不一定真的吐，但会有反胃感。",
    },
    {
      id: "indigestion_borborygmus",
      dimension: "indigestion",
      title: "肚子咕噜响或肠鸣明显",
      plainTitle: "肠胃声音比平时明显，自己也能注意到。",
    },
    {
      id: "indigestion_bloating",
      dimension: "indigestion",
      title: "腹胀、胃胀或肚子鼓",
      plainTitle: "吃完或一天中某些时段胀得明显。",
    },
    {
      id: "indigestion_eructation",
      dimension: "indigestion",
      title: "嗳气、打嗝或气往上顶",
      plainTitle: "总想打嗝，或者气卡在上腹。",
    },
    {
      id: "indigestion_flatus",
      dimension: "indigestion",
      title: "排气增多",
      plainTitle: "放屁次数、气味或憋胀感让你困扰。",
    },
    {
      id: "diarrhea_loose",
      dimension: "diarrhea",
      title: "大便偏稀或不成形",
      plainTitle: "便形松散、糊状或水样。",
    },
    {
      id: "diarrhea_increased",
      dimension: "diarrhea",
      title: "排便次数比平时增多",
      plainTitle: "一天跑厕所的次数明显增加。",
    },
    {
      id: "diarrhea_urgency",
      dimension: "diarrhea",
      title: "便意急，忍不住想马上去",
      plainTitle: "来得突然，拖一会儿会很难受。",
    },
    {
      id: "constipation_reduced",
      dimension: "constipation",
      title: "排便次数减少",
      plainTitle: "比你平常的节律明显少。",
    },
    {
      id: "constipation_hard",
      dimension: "constipation",
      title: "大便干硬或排出费力",
      plainTitle: "需要用力，或者便便又干又硬。",
    },
    {
      id: "constipation_incomplete",
      dimension: "constipation",
      title: "排便不尽感",
      plainTitle: "上完厕所还觉得没排干净。",
    },
  ],
};

const round2 = (value) => Math.round(value * 100) / 100;

export function getDimensionScores(answers) {
  return Object.fromEntries(
    Object.keys(DIMENSIONS).map((dimensionId) => {
      const values = GSRS_SCHEMA.items
        .filter((item) => item.dimension === dimensionId)
        .map((item) => Number(answers[item.id]))
        .filter((value) => Number.isFinite(value));

      if (!values.length) {
        return [dimensionId, null];
      }

      return [dimensionId, round2(values.reduce((sum, value) => sum + value, 0) / values.length)];
    }),
  );
}

export function getBurdenLevel(mean) {
  if (mean == null) return { id: "unknown", label: "待完成", tone: "neutral" };
  if (mean < 2.5) return { id: "low", label: "轻负担", tone: "green" };
  if (mean < 4.5) return { id: "moderate", label: "中等负担", tone: "amber" };
  return { id: "high", label: "高负担", tone: "red" };
}

export function calculateAssessment(answers) {
  const answeredCount = GSRS_SCHEMA.items.filter((item) => Number.isFinite(Number(answers[item.id]))).length;
  const missingCount = GSRS_SCHEMA.items.length - answeredCount;

  if (missingCount > 0) {
    return {
      complete: false,
      answeredCount,
      missingCount,
      dimensionScores: getDimensionScores(answers),
      rankedDimensions: [],
      totalMean: null,
      burdenLevel: getBurdenLevel(null),
      summary: "完成 15 题后才生成结果，避免用不完整信息制造临床感。",
    };
  }

  const dimensionScores = getDimensionScores(answers);
  const values = GSRS_SCHEMA.items.map((item) => Number(answers[item.id]));
  const totalMean = round2(values.reduce((sum, value) => sum + value, 0) / values.length);
  const rankedDimensions = Object.entries(dimensionScores)
    .map(([id, mean]) => ({ id, mean, ...DIMENSIONS[id] }))
    .sort((a, b) => b.mean - a.mean);
  const top = rankedDimensions[0];
  const second = rankedDimensions[1];

  return {
    complete: true,
    answeredCount,
    missingCount,
    dimensionScores,
    rankedDimensions,
    totalMean,
    burdenLevel: getBurdenLevel(totalMean),
    summary: `你的回答更倾向于「${top.shortLabel}」信号突出，${second.shortLabel}信号排在第二。这个结果用于自我观察，不替代医生面诊或检查。`,
  };
}
