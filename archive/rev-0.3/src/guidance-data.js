/**
 * Process Intelligence and Collaborative Intelligence UX Guidance.
 * Canonical semantics remain owned by the Concept Charter.
 */

const sourcePatterns = [
  {
    id: "S01",
    name: "Goal & Context Header",
    contract: "shared",
    maturity: "Candidate",
    purpose: "不读Transcript也能识别Goal、Scope、Owner、State和Context。",
    fear: "AI到底在处理什么、使用了哪些信息？",
    workObject: "Root / Typed Work Object",
    fixed: ["Goal", "Object ID", "Owner", "State & Revision", "Scope", "Context Snapshot", "Permission", "Freshness"],
    states: ["Complete", "Needs Confirmation", "Scope Changed", "Restricted", "Stale"],
    tests: ["十秒内复述Goal、Owner、Scope与State", "Brief与Deep读取同一Revision"],
    coreComponents: ["heading", "text", "badge", "disclosure", "application-shell"],
  },
  {
    id: "S02",
    name: "Intent / Change Preview",
    contract: "shared",
    maturity: "Candidate",
    purpose: "把自然语言、表单、拖拽和系统建议统一成可预览Typed Patch。",
    fear: "系统是不是偷偷改变了问题或范围？",
    workObject: "Patch → Target Revision",
    fixed: ["Source", "Before / After", "Affected Object", "Impact", "Validation", "Apply / Cancel", "Branch Rule"],
    states: ["Proposed", "Previewed", "Applied", "Reverted", "Branched"],
    tests: ["Scope变化不静默裁剪", "Undo产生Revert Patch", "Published对象创建Branch"],
    coreComponents: ["card", "table", "badge", "button", "callout"],
  },
  {
    id: "S03",
    name: "Plan & Progress",
    contract: "shared",
    maturity: "Candidate",
    purpose: "展示路径、依赖、条件、真实进度和降级。",
    fear: "系统是在工作、卡住，还是播放动画？",
    workObject: "Plan",
    fixed: ["Node", "Purpose", "Dependency", "State", "Owner", "Missing Input", "Stop / Retry / Takeover"],
    states: ["Ready", "Conditional", "Running", "Verified", "Partial", "Blocked", "Failed"],
    tests: ["基础结果先返回", "高阶失败保留Verified Work", "无计时器伪造业务验证"],
    coreComponents: ["progress", "badge", "callout", "disclosure", "button"],
  },
  {
    id: "S04",
    name: "Evidence Receipt",
    contract: "shared",
    maturity: "Candidate",
    purpose: "把Claim、Calculation或Decision连接到可追溯依据。",
    fear: "数字和解释到底从哪里来？",
    workObject: "Evidence",
    fixed: ["Source", "Semantic Version", "Snapshot", "Scope", "Method", "Permission", "Validation", "Limitation"],
    states: ["Unverified", "Supported", "Verified", "Contested", "Stale", "Insufficient"],
    tests: ["关键Claim Evidence Coverage 100%", "Evidence变化使Gate失效"],
    coreComponents: ["table", "badge", "link", "callout", "disclosure"],
  },
  {
    id: "S05",
    name: "Decision Record",
    contract: "shared",
    maturity: "Candidate",
    purpose: "记录选择、依据、Alternative和Accountable Owner。",
    fear: "这是建议、共识，还是正式决定？",
    workObject: "Decision",
    fixed: ["Decision Question", "Selected Option", "Alternatives", "Rationale", "Evidence", "Owner", "Approval"],
    states: ["Open", "Evidence Pending", "Proposed", "Confirmed", "Superseded", "Reopened"],
    tests: ["无Owner不得Confirmed", "Recommendation不显示为Decision"],
    coreComponents: ["card", "badge", "segmented-control", "button", "callout"],
  },
  {
    id: "S06",
    name: "Publication Gate",
    contract: "shared",
    maturity: "Candidate",
    purpose: "阻止无Evidence、不一致、过期或越权内容被发布。",
    fear: "报告看起来完成，但数字或依据可能已变化。",
    workObject: "Artifact Revision",
    fixed: ["Subject Revision", "Checks", "Evidence Snapshot", "Policy / Permission", "Invalidation Reason"],
    states: ["Not Run", "Checking", "Passed", "Failed", "Invalidated"],
    tests: ["Passed不等于Published", "Stale后Publish禁用", "提交时原子重验"],
    coreComponents: ["table", "badge", "button", "callout", "progress"],
  },
  {
    id: "S07",
    name: "Action Preview & Authorization",
    contract: "shared",
    maturity: "Candidate",
    purpose: "在改变外部状态前解释动作、影响、权限与恢复。",
    fear: "我点击的是批准、执行，还是已经发生改变？",
    workObject: "Action",
    fixed: ["Action / Target", "Actor", "Parameters", "Evidence", "Permission / Policy", "Impact / Risk", "Reversibility", "State"],
    states: ["Proposed", "Preflight Ready", "Awaiting Approval", "Approved", "Queued", "Executing", "Outcome"],
    tests: ["Approve不等于Execute", "Denied不能Queued", "执行前重验"],
    coreComponents: ["dialog", "table", "badge", "button", "callout"],
  },
  {
    id: "S08",
    name: "Outcome Receipt & Human Handoff",
    contract: "shared",
    maturity: "Candidate",
    purpose: "证明真实结果，并让下一位用户保留Context继续工作。",
    fear: "系统说成功了，但真实结果是什么？",
    workObject: "Outcome / Handoff",
    fixed: ["Expected / Actual", "Postcondition", "Status", "Exception", "Next State", "Context Snapshot", "Requested Decision", "Trace"],
    states: ["Succeeded", "Partial", "Failed", "Compensated", "Takeover Required"],
    tests: ["Outcome来自系统记录", "Takeover保留Work Done", "关联对象可互相追踪"],
    coreComponents: ["card", "table", "badge", "link", "callout"],
  },
  {
    id: "P01",
    name: "Exception-first Console",
    contract: "process",
    maturity: "Composition",
    purpose: "让运营者关注异常、审批、恢复和边界，而不是逐条监督。",
    fear: "自动化是否隐藏了未知、失败和恢复债务？",
    workObject: "Case Portfolio",
    fixed: ["Queue Universe", "Unknown / Failure", "SLA", "Recovery", "Owner", "Pause / Takeover"],
    states: ["Healthy", "Attention", "Degraded", "Paused"],
    tests: ["不以自动化比例作唯一指标", "失败和分母可见"],
    coreComponents: ["application-shell", "table", "badge", "tabs", "drawer"],
  },
  {
    id: "P02",
    name: "Rule Proposal & Change Approval",
    contract: "process",
    maturity: "Composition",
    purpose: "把人工判断转化为可验证的未来能力提案。",
    fear: "一次判断会不会未经验证直接变成规则？",
    workObject: "Rule Proposal",
    fixed: ["Source Decision", "Owner / Scope", "Replay", "Conflict Scan", "SoD", "Stage", "Monitor", "Rollback"],
    states: ["Candidate", "Drafted", "Validated", "Approved", "Staged", "Active", "Suspended"],
    tests: ["审批前不得Active", "Reject后无派生Active状态", "只影响未来Case"],
    coreComponents: ["progress", "table", "badge", "button", "callout"],
  },
  {
    id: "P03",
    name: "Recovery & Rollback Workspace",
    contract: "process",
    maturity: "Composition",
    purpose: "在Failure或Partial后恢复业务方向。",
    fear: "失败后是否只能从头处理？",
    workObject: "Recovery Case",
    fixed: ["Failure", "Impact", "Completed / Pending", "Retry", "Compensation", "Takeover", "Owner", "Audit"],
    states: ["Detected", "Contained", "Recovering", "Recovered", "Takeover Required"],
    tests: ["Recovery不删除Failure", "Compensation引用原Action"],
    coreComponents: ["application-shell", "callout", "table", "button", "drawer"],
  },
  {
    id: "C01",
    name: "Mission Workspace",
    contract: "collaborative",
    maturity: "Composition",
    purpose: "围绕Goal与Artifact组织知识工作，而不是围绕消息。",
    fear: "换页面或追问后上下文会不会丢失？",
    workObject: "Mission",
    fixed: ["Goal Header", "Plan", "Artifact Canvas", "Evidence / Context", "Revision / Branch", "Next Action"],
    states: ["Framing", "Working", "Review", "Published", "Branched"],
    tests: ["Brief与Deep共享Revision", "追问不覆盖Published"],
    coreComponents: ["application-shell", "tabs", "drawer", "badge", "button"],
  },
  {
    id: "C02",
    name: "Analysis / Research Document",
    contract: "collaborative",
    maturity: "Composition",
    purpose: "组织探索、Evidence、Result、Claim和Narrative。",
    fear: "漂亮叙事会不会重新发明事实？",
    workObject: "Analysis",
    fixed: ["Intent", "Result Blocks", "Typed Claims", "Evidence", "Supporting Data", "Plan / Degradation", "Gate"],
    states: ["Draft", "Running", "Partial", "Validated", "Published"],
    tests: ["Narrative数字引用Result", "Correlation不写成Causation", "Partial保留基础结果"],
    coreComponents: ["application-shell", "table", "disclosure", "badge", "callout"],
  },
  {
    id: "C03",
    name: "Audience Brief & Revision History",
    contract: "collaborative",
    maturity: "Composition",
    purpose: "让管理层读取同一事实的低密度表达。",
    fear: "简化页面是否隐藏限制或创造另一份事实？",
    workObject: "Artifact",
    fixed: ["What / Where / Why", "Scope / Freshness", "Evidence", "Limitation", "Revision", "Question Pin", "Owner"],
    states: ["Draft", "Validated", "Published", "Superseded", "Branched"],
    tests: ["Brief不创建另一份事实", "Question Pin创建Branch"],
    coreComponents: ["heading", "text", "link", "badge", "disclosure"],
  },
];

function normalizePattern(pattern) {
  const owner = {
    shared: "Product Owner + Domain Steward",
    process: "Process Owner + Control Owner",
    collaborative: "Mission / Artifact Owner",
  }[pattern.contract];
  const semanticAxes = ["WorkflowState", "PermissionAndPolicy", "Autonomy"];
  if (/Evidence|Analysis|Research|Publication|Decision|Outcome|Brief/.test(pattern.name)) {
    semanticAxes.unshift("EvidenceStatus", "ClaimKind");
  }
  if (/Action|Exception|Recovery|Rule|Handoff/.test(pattern.name)) {
    semanticAxes.push("RiskAndReversibility");
  }

  return {
    ...pattern,
    owner,
    optional: ["领域内容与解释", "Audience-specific guidance", "品牌表达与信息密度"],
    semanticAxes: [...new Set(semanticAxes)],
    permissionAndAutonomy:
      "Allowed / Conditional / Denied与Recommend / Prepare / Approval Required / Execute Within Policy分别表达。",
    failure: "显示失败对象、已完成工作、未完成工作与影响范围。",
    degradation: "先说明发生了什么、保留了什么、缺少什么、下一步是什么、谁负责。",
    recovery: "Retry、Revert、Branch、Takeover或Compensate必须产生可追踪事件。",
    responsive: "Desktop保留完整Inspector；Tablet转单栏与抽屉；Mobile保留阅读、证据、状态与评论式控制。",
    accessibility: ["键盘完成核心任务", "状态不只依赖颜色", "ARIA live报告状态变化", "Reduced Motion与44px触控目标"],
    dos: ["显示Work Object、Owner和Revision", "让按钮名称准确对应下一状态"],
    donts: ["不把Verified写成Allowed或Auto", "不在失败后删除已验证工作"],
    extensions: ["增加领域字段与帮助文本", "增加受同一生命周期约束的状态视图"],
  };
}

export const guidancePatterns = sourcePatterns.map(normalizePattern);

export const guidanceGroups = {
  shared: guidancePatterns.filter((pattern) => pattern.contract === "shared").map((pattern) => pattern.id),
  process: guidancePatterns.filter((pattern) => pattern.contract === "process").map((pattern) => pattern.id),
  collaborative: guidancePatterns.filter((pattern) => pattern.contract === "collaborative").map((pattern) => pattern.id),
  handoff: ["S02", "S07", "S08", "P03", "C03"],
};

export const guidanceGroupMeta = {
  shared: {
    title: "Shared Intelligence Patterns",
    description: "两种Interaction Contract共同使用的可见状态、Evidence、Gate和Handoff机制。",
  },
  process: {
    title: "Process Intelligence",
    description: "围绕Case、Exception、执行、恢复和Rule Change组织人机责任。",
  },
  collaborative: {
    title: "Collaborative Intelligence",
    description: "围绕Mission、Analysis、Decision和Artifact组织可分支、可发布的知识工作。",
  },
  handoff: {
    title: "Cross-contract Handoff",
    description: "通过关联Typed Work Objects传递Goal、Context、Evidence、Decision与Constraints。",
  },
};

export function findGuidancePattern(id) {
  return guidancePatterns.find((pattern) => pattern.id === id) || null;
}
