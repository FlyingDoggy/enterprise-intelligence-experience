export const kernelRecordLabels = {
  goal: "Goal",
  context: "Context",
  plan: "Plan",
  evidence: "Evidence",
  result: "Work Result",
  resolution: "Goal Resolution",
  artifact: "Artifact",
  decision: "Decision",
  action: "Action",
  "business-outcome": "Business Outcome",
  feedback: "Feedback",
};

export const taskProjectionData = [
  {
    id: "trustworthy-answer",
    name: "Trustworthy Answer",
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
    stop: "Result已交付，Goal criteria已评估；无需创建Artifact、Decision或Action。",
    unobserved: "用户直接离开时：Result = Delivered；Goal Resolution = Unobserved。系统不宣称Goal已完成。",
  },
  {
    id: "analysis-artifact",
    name: "Analysis Artifact",
    label: "分析产物",
    example: "把一组Result整理成可复用、可评审或可发布的分析文档。",
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
    stop: "Artifact Revision稳定，来源Result与Evidence可追溯；是否发布由独立Publication lifecycle决定。",
    unobserved: "产出文档不意味着业务问题已经改善。",
  },
  {
    id: "decision-support",
    name: "Decision Support",
    label: "决策支持",
    example: "基于Result与Evidence比较选项，由明确Owner形成Decision。",
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
    stop: "Decision由Owner确认并引用稳定Result；Recommendation不得伪装成Decision。",
    unobserved: "Decision已形成仍不代表已执行。",
  },
  {
    id: "controlled-action",
    name: "Controlled Action",
    label: "受控行动",
    example: "从Decision或Action Proposal进入授权、执行与后续业务观察。",
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
    stop: "Action结束于Succeeded、Partial或Failed；Business Outcome作为关联记录另行观察。",
    unobserved: "Compensation是引用原Action的新Action，不能覆盖原执行事实。",
  },
  {
    id: "process-case",
    name: "Process Case",
    label: "流程Case",
    example: "系统按Policy推进Case，人只处理审批、异常、接管和规则变更。",
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
    stop: "Case达到合法终态或进入可见的Exception / Takeover；Rule Proposal拥有独立生命周期。",
    unobserved: "自动推进比例不等于业务Outcome，Unknown与失败必须进入分母。",
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
