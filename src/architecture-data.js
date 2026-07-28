export const kernelRecordLabels = {
  goal: "目标",
  context: "上下文",
  plan: "计划",
  evidence: "依据",
  result: "工作结果",
  resolution: "目标完成判断",
  artifact: "交付物",
  decision: "决策",
  action: "业务操作",
  "business-outcome": "业务成效",
  feedback: "反馈",
};

export const taskProjectionData = [
  {
    id: "trustworthy-answer",
    name: "可信回答",
    label: "可信回答",
    example: "用户问一个明确问题，拿到有依据的答案后离开。",
    statuses: {
      goal: "required",
      context: "required",
      plan: "conditional",
      evidence: "required",
      result: "required",
      resolution: "required",
      artifact: "na",
      decision: "na",
      action: "na",
      "business-outcome": "na",
      feedback: "linked",
    },
    stop: "工作结果已交付，目标完成标准已评估；无需创建交付物、决策或业务操作。",
    unobserved: "用户直接离开时：工作结果 = 已交付；目标完成判断 = 未观测。系统不宣称目标已完成。",
  },
  {
    id: "analysis-artifact",
    name: "分析交付物",
    label: "分析交付物",
    example: "把一组工作结果整理成可复用、可评审或可发布的分析文档。",
    statuses: {
      goal: "required",
      context: "required",
      plan: "conditional",
      evidence: "required",
      result: "required",
      resolution: "required",
      artifact: "required",
      decision: "na",
      action: "na",
      "business-outcome": "na",
      feedback: "linked",
    },
    stop: "交付物修订版本稳定，来源工作结果与依据可追溯；是否发布由独立发布生命周期决定。",
    unobserved: "产出文档不意味着业务问题已经改善。",
  },
  {
    id: "decision-support",
    name: "决策支持",
    label: "决策支持",
    example: "基于工作结果与依据比较选项，由明确负责人形成决策。",
    statuses: {
      goal: "required",
      context: "required",
      plan: "conditional",
      evidence: "required",
      result: "required",
      resolution: "required",
      artifact: "conditional",
      decision: "required",
      action: "na",
      "business-outcome": "na",
      feedback: "linked",
    },
    stop: "决策由负责人确认并引用稳定工作结果；建议不得伪装成决策。",
    unobserved: "决策已形成仍不代表已经执行。",
  },
  {
    id: "controlled-action",
    name: "受控业务操作",
    label: "受控业务操作",
    example: "从决策或业务操作提案进入授权、执行与后续业务观察。",
    statuses: {
      goal: "required",
      context: "required",
      plan: "conditional",
      evidence: "required",
      result: "required",
      resolution: "required",
      artifact: "conditional",
      decision: "required",
      action: "required",
      "business-outcome": "linked",
      feedback: "linked",
    },
    stop: "业务操作结束于成功、部分完成或失败；业务成效作为关联记录另行观察。",
    unobserved: "补偿是引用原业务操作的新业务操作，不能覆盖原执行事实。",
  },
  {
    id: "process-case",
    name: "流程事项",
    label: "流程事项",
    example: "系统按管控策略推进事项，人只处理审批、异常、接管和规则变更。",
    statuses: {
      goal: "required",
      context: "required",
      plan: "required",
      evidence: "required",
      result: "required",
      resolution: "required",
      artifact: "conditional",
      decision: "conditional",
      action: "conditional",
      "business-outcome": "linked",
      feedback: "linked",
    },
    stop: "流程事项达到合法终态或进入可见的异常 / 人工接管；规则提案拥有独立生命周期。",
    unobserved: "自动推进比例不等于业务成效，未知与失败必须计入分母。",
  },
];

export function projectionRecords(projection, status) {
  return Object.entries(projection.statuses)
    .filter(([, value]) => value === status)
    .map(([id]) => kernelRecordLabels[id]);
}

export function projectionMarkdownRow(projection) {
  const cell = (status) => projectionRecords(projection, status).join("、") || "—";
  return `| ${projection.name} | ${cell("required")} | ${cell("conditional")} | ${cell("linked")} | ${cell("na")} | ${projection.stop} |`;
}
