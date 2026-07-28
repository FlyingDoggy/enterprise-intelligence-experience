import { catalogRegistry } from "./src/catalog.js";
import { initializeDesignSystemTheme, renderDesignSystemRoute } from "./src/design-system-renderer.js";
import { guidanceGroupMeta, guidanceGroups, guidancePatterns } from "./src/guidance-data.js";
import { bindGuidanceSpecimen, guidanceSpecimenHtml } from "./src/guidance-specimens.js";

/**
 * EIX 2.0 Rev 0.4 static reference.
 * All interactions are deterministic fixtures. No API, LLM, permission service,
 * policy engine, database, or external action is connected.
 */

/**
 * @typedef {Object} ExperiencePromise
 * @property {string} id
 * @property {string} name
 * @property {string} cn
 * @property {string} fear
 * @property {string[]} mechanisms
 * @property {string} promise
 */

/**
 * @typedef {Object} PatternSpec
 * @property {string} id
 * @property {string} name
 * @property {"shared"|"process"|"collaborative"} contract
 * @property {string} maturity
 * @property {string} purpose
 * @property {string} fear
 * @property {string} workObject
 * @property {string} owner
 * @property {string[]} fixed
 * @property {string[]} optional
 * @property {string[]} states
 * @property {string[]} semanticAxes
 * @property {string} permissionAndAutonomy
 * @property {string} failure
 * @property {string} degradation
 * @property {string} recovery
 * @property {string} responsive
 * @property {string[]} accessibility
 * @property {string[]} dos
 * @property {string[]} donts
 * @property {string[]} tests
 * @property {string[]} extensions
 */

/**
 * @typedef {Object} SemanticState
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string[]} values
 * @property {string} color
 */

/**
 * @typedef {Object} LifecycleSpec
 * @property {string} id
 * @property {string} name
 * @property {string} subject
 * @property {string[]} states
 * @property {string[]} rules
 */

/**
 * @typedef {Object} JourneyStep
 * @property {string} id
 * @property {string} title
 * @property {string} object
 * @property {string} human
 * @property {string} system
 * @property {string} evidence
 * @property {string} controls
 * @property {string} degradation
 * @property {string} artifact
 */

/**
 * @typedef {Object} WorkObjectLink
 * @property {string} rootId
 * @property {string} from
 * @property {string} to
 * @property {string} traceId
 */

/**
 * @typedef {Object} GateDecision
 * @property {"publication"|"action"|"rule"} gateType
 * @property {string} subjectId
 * @property {number} revision
 * @property {string} evidenceSnapshot
 * @property {string} policyVersion
 * @property {string} permissionVersion
 * @property {"not-run"|"passed"|"failed"|"invalidated"} status
 * @property {{id: string, label: string, result: "pass"|"fail", detail: string}[]} checkResults
 * @property {string=} invalidationReason
 * @property {string[]} revalidationRequirements
 */

/** @type {GateDecision} */
const publicationGateFixture = {
  gateType: "publication",
  subjectId: "ART-052",
  revision: 3,
  evidenceSnapshot: "EVD-118 · 2027-06 · closed",
  policyVersion: "POL-17 v6",
  permissionVersion: "PERM-88",
  status: "not-run",
  checkResults: [
    { id: "revision", label: "Revision fixed", result: "pass", detail: "ART-052 r3" },
    { id: "narrative", label: "Narrative = Result", result: "pass", detail: "PASS" },
    { id: "freshness", label: "Evidence freshness", result: "pass", detail: "PASS" },
    { id: "permission", label: "Audience permission", result: "pass", detail: "PERM-88" },
  ],
  invalidationReason: "Evidence Snapshot changed or expired",
  revalidationRequirements: [
    "Subject ID与Revision未变化",
    "Evidence Snapshot仍为当前版本",
    "Policy与Permission版本仍有效",
  ],
};

const kernelData = [
  {
    code: "K01",
    name: "Goal",
    question: "我们真正希望实现什么业务结果？",
    definition: "用户或组织希望实现的业务结果。Goal使用业务语言表达，不能等同于Prompt或技术任务。",
    visible: ["Success Definition", "Owner与Audience", "Scope与Constraints", "Current State"],
    governance: "重大Goal变化产生新Revision，并说明对Context、Plan、Evidence和Action的影响。",
  },
  {
    code: "K02",
    name: "Context",
    question: "AI正在使用哪些信息、规则和历史？",
    definition: "与当前工作相关且获得授权的业务语义、流程状态、数据、文档、知识、规则和历史。",
    visible: ["Source与Freshness", "Permission Scope", "Session / Memory边界", "Remove与Correct"],
    governance: "Context可查看、纠正和追溯；持久化必须有明确Owner和Scope。",
  },
  {
    code: "K03",
    name: "Plan",
    question: "为了实现Goal，系统准备按什么路径工作？",
    definition: "包含节点、依赖、状态、风险、缺失输入和停止条件的可检查路径。",
    visible: ["Ready / Conditional / Blocked", "Dependencies", "Owner", "Next Step"],
    governance: "AI可以推荐Plan；超出Scope或需要高风险Action的节点必须重新确认。",
  },
  {
    code: "K04",
    name: "Evidence",
    question: "事实、建议和决定建立在什么依据上？",
    definition: "能够回到数据、文档、规则、事件或执行记录的可验证依据。",
    visible: ["Source与Semantic Version", "Method", "Scope与Freshness", "Status与Limitation"],
    governance: "Evidence Status不推出Permission或Autonomy；变化会使相关Gate Decision失效。",
  },
  {
    code: "K05",
    name: "Decision",
    question: "选择了什么、为什么、由谁负责？",
    definition: "由Evidence和业务判断形成的明确选择，包含Option、Alternative、Rationale和Owner。",
    visible: ["Selected Option", "Alternatives", "Evidence", "Owner与Approval"],
    governance: "Recommendation不是Decision；Decision变化产生新Revision，不重写历史。",
  },
  {
    code: "K06",
    name: "Action",
    question: "什么将改变外部状态，影响是什么？",
    definition: "调用工具、Agent或业务系统改变外部状态的受控操作。",
    visible: ["Actor与Target", "Parameters与Scope", "Permission与Policy", "Risk与Reversibility"],
    governance: "严格区分Prepare、Approve、Queue和Execute；执行前重新校验治理快照。",
  },
  {
    code: "K07",
    name: "Outcome",
    question: "真实发生了什么，是否符合预期？",
    definition: "分析或Action实际产生的结果，包括Success、Partial、Failure、Exception和Pending。",
    visible: ["Expected vs Actual", "Execution Result", "Postcondition", "Next State"],
    governance: "Outcome来自系统记录，不由LLM重新叙述；Partial保留已完成部分。",
  },
  {
    code: "K08",
    name: "Feedback",
    question: "这次工作应怎样修正当前任务或改进系统？",
    definition: "来自用户、业务结果、系统执行和评估机制的改进信号。",
    visible: ["Signal Type", "Scope", "Destination", "Proposed Change与Owner"],
    governance: "区分Correction、Memory Proposal、Rule Proposal和Model Feedback。",
  },
];

const routeMeta = {
  brief: {
    title: "Experience Narrative",
    description: "管理层与首次接触者的5分钟入口。",
    status: "COMPANION",
    statusClass: "companion",
    rail: "5分钟",
    railDescription: "Experience Narrative",
    invariant: "Work Object before Chat",
  },
  architecture: {
    title: "Canonical Architecture",
    description: "Kernel、Contract、语义轴与治理生命周期。",
    status: "CANONICAL",
    statusClass: "canonical",
    rail: "架构",
    railDescription: "Canonical Charter",
    invariant: "One Kernel · Two Contracts",
  },
  "design-system": {
    title: "EIX Core Design System",
    description: "品牌中性的Foundation、Primitive、Component与实现级契约。",
    status: "CANDIDATE STANDARD",
    statusClass: "candidate",
    rail: "系统",
    railDescription: "Core Design System",
    invariant: "Core components own no business lifecycle",
  },
  guidance: {
    title: "Intelligence UX Guidance",
    description: "Process Intelligence与Collaborative Intelligence的领域交互规则和组合Pattern。",
    status: "CANDIDATE COMPANION",
    statusClass: "candidate",
    rail: "指导",
    railDescription: "Two Intelligence Contracts",
    invariant: "Guidance consumes Canonical semantics",
  },
  patterns: {
    title: "Pattern Library Migration",
    description: "Rev 0.2兼容入口；新版内容已迁入Intelligence UX Guidance。",
    status: "CANDIDATE",
    statusClass: "candidate",
    rail: "Patterns",
    railDescription: "Interactive Specimens",
    invariant: "Approve ≠ Execute",
  },
  journeys: {
    title: "Reference Journeys",
    description: "Typed Work Objects之间的受控Handoff。",
    status: "COMPANION",
    statusClass: "companion",
    rail: "Journeys",
    railDescription: "Controlled Handoffs",
    invariant: "Linked objects · Separate states",
  },
  acceptance: {
    title: "Experience Acceptance",
    description: "从原则到测试、Reader Testing与SOW。",
    status: "CANONICAL",
    statusClass: "canonical",
    rail: "验收",
    railDescription: "Experience Gate",
    invariant: "No silent state transition",
  },
  document: {
    title: "Document Reader",
    description: "以UTF-8读取并渲染Canonical与Companion Markdown。",
    status: "SOURCE",
    statusClass: "canonical",
    rail: "文档",
    railDescription: "Rendered Markdown",
    invariant: "Source remains Markdown",
  },
};

const documentRegistry = {
  charter: {
    file: "ENTERPRISE_INTELLIGENCE_EXPERIENCE_2.0_CONCEPT_CHARTER.md",
    title: "Enterprise Intelligence Experience Principles 2.0",
    description: "唯一Canonical架构源：Kernel、Interaction Contract、Work Object、治理原则与验收不变量。",
    identity: "CANONICAL · CONCEPT CHARTER · REV 0.4",
    routeIdentity: "CANONICAL SOURCE",
    status: "CANONICAL",
    statusClass: "canonical",
  },
  narrative: {
    file: "EIX_2.0_EXPERIENCE_NARRATIVE.md",
    title: "EIX 2.0 Experience Narrative",
    description: "面向管理层与首次接触者的五分钟体验说明。",
    identity: "COMPANION · EXPERIENCE NARRATIVE · REV 0.4",
    routeIdentity: "COMPANION DOCUMENT",
    status: "COMPANION",
    statusClass: "companion",
  },
  "design-system": {
    file: "EIX_2.0_CORE_DESIGN_SYSTEM.md",
    title: "EIX Core Design System",
    description: "品牌中性的Token、Foundation、Primitive、Component与工程化治理标准。",
    identity: "CANDIDATE STANDARD · CORE DESIGN SYSTEM · REV 0.4",
    routeIdentity: "CANDIDATE STANDARD",
    status: "CANDIDATE",
    statusClass: "candidate",
  },
  guidance: {
    file: "EIX_2.0_INTELLIGENCE_UX_GUIDANCE.md",
    title: "Intelligence UX Guidance",
    description: "Process Intelligence与Collaborative Intelligence的领域体验指导。",
    identity: "CANDIDATE COMPANION · UX GUIDANCE · REV 0.4",
    routeIdentity: "CANDIDATE COMPANION",
    status: "CANDIDATE",
    statusClass: "candidate",
  },
  consolidation: {
    file: "EIX_2.0_CONSOLIDATION_RECORD.md",
    title: "EIX 2.0 Rev 0.4 Consolidation Record",
    description: "记录EIX Rev 0.3与Claude GAX两套方案中哪些内容被吸收、改造或拒绝，以及原因。",
    identity: "DECISION RECORD · CONSOLIDATED CANDIDATE · REV 0.4",
    routeIdentity: "CONSOLIDATION RECORD",
    status: "COMPANION",
    statusClass: "companion",
  },
  patterns: {
    file: "EIX_2.0_PATTERN_SPECIMEN_LIBRARY.md",
    title: "Pattern Specimen Library Migration",
    description: "旧Pattern文档的兼容入口与Rev 0.2归档路径。",
    identity: "MIGRATION NOTICE · REV 0.4",
    routeIdentity: "COMPATIBILITY DOCUMENT",
    status: "MIGRATED",
    statusClass: "candidate",
  },
};

/** @type {ExperiencePromise[]} */
const promiseData = [
  {
    id: "clarity",
    name: "Clarity",
    cn: "方向",
    fear: "“AI到底理解成了什么？它是不是静默改变了我的问题？”",
    mechanisms: ["Goal & Scope常驻", "Intent Patch Diff", "Work Object、Owner与Revision可见"],
    promise: "我不需要询问AI，就能看见当前目标、口径和状态。",
  },
  {
    id: "trust",
    name: "Trust",
    cn: "可信",
    fear: "“这个结论写得很好，但它真的有可靠依据吗？”",
    mechanisms: ["Typed Evidence Receipt", "Claim Kind分型", "Freshness与Limitation", "Gate随Evidence失效"],
    promise: "我能从任何重要结论回到来源、方法和边界。",
  },
  {
    id: "control",
    name: "Control",
    cn: "掌控",
    fear: "“AI是在建议、准备，还是已经替我执行了？”",
    mechanisms: ["Prepare / Approve / Execute分开", "Action Preview", "Permission与Policy独立否决"],
    promise: "改变现实之前，我先看见后果。",
  },
  {
    id: "momentum",
    name: "Momentum",
    cn: "推进",
    fear: "“系统是在工作、卡住，还是只是在播放动画？”",
    mechanisms: ["Inspectable Plan", "基础结果先返回", "Partial保留Verified Work"],
    promise: "我知道已完成什么、正在做什么、还缺什么。",
  },
  {
    id: "continuity",
    name: "Continuity",
    cn: "连续",
    fear: "“为什么追问、交接或换页面后又要重新解释背景？”",
    mechanisms: ["Root Work Object", "Revision与Branch", "Handoff Envelope", "同一Revision多密度"],
    promise: "工作可以跨角色、页面和时间继续。",
  },
  {
    id: "calm",
    name: "Calm",
    cn: "从容",
    fear: "“为了保证AI没犯错，我是不是要监督每一步？”",
    mechanisms: ["Exception-first", "Quiet Normal Path", "Unknown与Recovery可见", "不迷信自动化比例"],
    promise: "系统减少我的监督负担，而不是把我变成AI监工。",
  },
];

const architectureLayers = [
  {
    code: "L5",
    name: "Experience Outcomes",
    detail: "Clarity · Trust · Control · Momentum · Continuity · Calm",
    owner: "UX Research · Product · Business",
    output: "可衡量的任务与体验结果",
  },
  {
    code: "L4",
    name: "Canonical Surfaces",
    detail: "Home · Inbox · Case · Mission · Analysis · Decision · Control Tower",
    owner: "Product · UX · Engineering",
    output: "稳定工作面与Reference Composition",
  },
  {
    code: "L3",
    name: "Interaction Contracts",
    detail: "Process Intelligence · Collaborative Intelligence",
    owner: "Product · UX · Governance",
    output: "人机责任、状态、控制与反馈约定",
  },
  {
    code: "L2",
    name: "Shared Experience Kernel",
    detail: "Goal · Context · Plan · Evidence · Decision · Action · Outcome · Feedback",
    owner: "Product · UX · Platform",
    output: "Work Object Schema与共享行为",
    kernel: true,
  },
  {
    code: "L1",
    name: "Enterprise Intelligence Foundation",
    detail: "Ontology · Models · Agents · Tools · Systems · Identity · Governance",
    owner: "Architecture · AI · Data · Security",
    output: "系统能力、语义与政策",
  },
];

const contractData = {
  process: {
    mode: "SYSTEM-LED · STATE-DRIVEN · EXCEPTION-FIRST",
    name: "Process Intelligence",
    statement: "系统在明确规则、权限和控制范围内推进结构化工作；人在关键决定、异常和边界中保持有效控制。",
    object: "Case",
    flow: ["Event", "Interpret", "Validate", "Decide", "Prepare", "Approve", "Execute", "Verify", "Recover"],
    system: ["维护Case状态与依赖", "执行规则、权限和风险校验", "准备并执行受控Action", "记录Outcome、Exception与Feedback"],
    human: ["确认边界与高影响Decision", "处理Policy Exception", "接管无法恢复的Case", "批准Rule Proposal"],
    visible: ["Case Identity与Owner", "Required Human Decision", "Action / Approval / Execution分离", "Outcome与Recovery"],
  },
  collaborative: {
    mode: "HUMAN-LED · GOAL-DRIVEN · ARTIFACT-FIRST",
    name: "Collaborative Intelligence",
    statement: "人定义Goal、Constraints和最终判断；AI帮助理解Context、规划工作、生成可验证Artifact并准备受控行动。",
    object: "Mission",
    flow: ["Frame", "Context", "Plan", "Explore", "Validate", "Decide", "Publish", "Propose Action", "Reuse"],
    system: ["解释Goal并识别歧义", "推荐路径、工具和Artifact", "检索、分析、生成与组织", "绑定Evidence并暴露Limit"],
    human: ["确认目的和边界", "提供业务判断与新Context", "判断Evidence是否充分", "确认发布与高影响Action"],
    visible: ["Mission Goal与Context", "Plan与Artifact Canvas", "Evidence、Limit与Branch", "Publication与Action Handoff"],
  },
};

/** @type {SemanticState[]} */
const semanticAxisData = [
  {
    id: "claim",
    name: "Claim Kind",
    description: "内容在认识论上是什么，不说明它是否有权限执行。",
    values: ["Fact", "Calculation", "Hypothesis", "Forecast", "Recommendation"],
    color: "var(--claim-color)",
  },
  {
    id: "evidence",
    name: "Evidence Status",
    description: "依据质量与新鲜度，不说明风险或行动许可。",
    values: ["Unverified", "Supported", "Verified", "Contested", "Stale", "Insufficient"],
    color: "var(--validation-color)",
  },
  {
    id: "uncertainty",
    name: "Uncertainty",
    description: "只有经过校准且对决策有价值时才显示，不使用裸小数制造精确感。",
    values: ["Calibrated range", "Scenario band", "Not shown"],
    color: "#65737f",
  },
  {
    id: "risk",
    name: "Risk & Reversibility",
    description: "描述影响与恢复难度，不等于Evidence强弱。",
    values: ["Low / Medium / High", "Reversible", "Compensatable", "Irreversible"],
    color: "var(--risk-color)",
  },
  {
    id: "permission",
    name: "Permission & Policy",
    description: "绑定Subject、Object、Operation、Scope和Policy Version，拥有独立否决权。",
    values: ["Allowed", "Conditional", "Denied"],
    color: "var(--permission-color)",
  },
  {
    id: "autonomy",
    name: "Autonomy",
    description: "描述AI在当前Policy下能建议、准备还是执行。",
    values: ["Recommend", "Prepare", "Approval Required", "Execute Within Policy", "Monitor by Exception"],
    color: "#2c6474",
  },
  {
    id: "workflow",
    name: "Workflow State",
    description: "属于特定Work Object的生命周期；Approved、Executed与Outcome彼此独立。",
    values: ["Draft", "Pending", "Approved", "Queued", "Executing", "Succeeded", "Failed"],
    color: "var(--workflow-color)",
  },
];

/** @type {LifecycleSpec[]} */
const lifecycleData = [
  {
    id: "publication",
    name: "Publication",
    subject: "Artifact Revision",
    states: ["Draft", "Validated", "Approval Pending", "Published", "Superseded / Withdrawn"],
    rules: ["Validated不等于Published", "Published Revision不可静默覆盖", "Evidence或Scope变化使旧Gate失效"],
  },
  {
    id: "action",
    name: "Action",
    subject: "Controlled Action",
    states: ["Proposed", "Preflight Ready", "Awaiting Approval", "Approved", "Queued", "Executing", "Outcome"],
    rules: ["Approve不等于Execute", "执行前原子重验治理快照", "Rollback或Compensation产生新事件"],
  },
  {
    id: "rule",
    name: "Rule Change",
    subject: "Rule Proposal",
    states: ["Candidate", "Drafted", "Validated", "Approved", "Staged", "Active", "Suspended / Retired"],
    rules: ["单次判断只产生Candidate", "SoD、回放和冲突扫描先于Active", "Active只影响未来匹配Scope的Case"],
  },
];

const familyData = [
  { code: "C01", name: "Knowledge & Research", question: "我们知道什么，依据和冲突是什么？", artifact: "Research Board · Evidence Map" },
  { code: "C02", name: "Analytical", question: "发生了什么、为什么、接下来可能怎样？", artifact: "Analysis Document · Scenario Canvas" },
  { code: "C03", name: "Decision", question: "面对Option应如何形成可解释选择？", artifact: "Decision Canvas · Decision Record" },
  { code: "C04", name: "Creation & Communication", question: "如何形成可协作、可发布的业务产出？", artifact: "Document · Deck · Message" },
  { code: "C05", name: "Planning & Action", question: "如何把Goal变成计划并安全推进？", artifact: "Planning Board · Action Queue" },
];

const analysisDimensions = [
  { name: "Work Question", values: "Answer · Explore · Compare · Monitor · Diagnose · Forecast · Simulate · Decide" },
  { name: "Initiation", values: "User Pull · Scheduled · Event-triggered · Delegated Goal" },
  { name: "Control Posture", values: "Direct · Guided · Co-created · Delegated" },
  { name: "Surface / Artifact", values: "Answer · Workspace · Board · Canvas · Brief · Feed" },
  { name: "Action Authority", values: "Read · Recommend · Prepare · Approval Required · Execute Within Policy" },
];

const patternSourceData = [
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
    tests: ["十秒内复述Goal、Owner、Scope与State", "快速阅读与完整规范读取同一Revision"],
  },
  {
    id: "S02",
    name: "Intent / Change Preview",
    contract: "shared",
    maturity: "Candidate",
    purpose: "把NL、表单、拖拽和系统建议统一成可预览Typed Patch。",
    fear: "系统是不是偷偷改变了问题或范围？",
    workObject: "Patch → Target Revision",
    fixed: ["Source", "Before / After", "Affected Object", "Impact", "Validation", "Apply / Cancel", "Branch Rule"],
    states: ["Proposed", "Previewed", "Applied", "Reverted", "Branched"],
    tests: ["Scope变化不静默裁剪", "Undo产生Revert Patch", "Published对象创建Branch"],
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
  },
  {
    id: "S08",
    name: "Outcome Receipt & Handoff",
    contract: "shared",
    maturity: "Candidate",
    purpose: "证明真实结果，并让下一位用户保留Context继续工作。",
    fear: "系统说成功了，但真实结果是什么？",
    workObject: "Outcome / Handoff",
    fixed: ["Expected / Actual", "Postcondition", "Status", "Exception", "Next State", "Context Snapshot", "Requested Decision", "Trace"],
    states: ["Succeeded", "Partial", "Failed", "Compensated", "Takeover Required"],
    tests: ["Outcome来自系统记录", "Takeover保留Work Done", "关联对象可互相追踪"],
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
    tests: ["快速阅读与完整规范共享Revision", "追问不覆盖Published"],
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
  },
];

function normalizePatternSpec(pattern) {
  const owner = {
    shared: "Product Owner + Domain Steward",
    process: "Process Owner + Control Owner",
    collaborative: "Mission / Artifact Owner",
  }[pattern.contract];
  const semanticAxes = ["WorkflowState", "PermissionAndPolicy", "Autonomy"];
  if (/Evidence|Analysis|Research|Publication|Decision|Outcome/.test(pattern.name)) semanticAxes.unshift("EvidenceStatus", "ClaimKind");
  if (/Action|Exception|Recovery|Rule/.test(pattern.name)) semanticAxes.push("RiskAndReversibility");

  return {
    ...pattern,
    owner,
    optional: ["领域内容与解释", "Audience-specific guidance", "品牌表达与信息密度"],
    semanticAxes: [...new Set(semanticAxes)],
    permissionAndAutonomy: "Allowed / Conditional / Denied与Recommend / Prepare / Approval Required / Execute Within Policy分别表达。",
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

/** @type {PatternSpec[]} */
const patternData = guidancePatterns;

const patternAnatomyData = [
  { code: "A01", name: "Purpose & Fear", text: "先说明用户要完成什么、最担心什么，不从组件外形开始。" },
  { code: "A02", name: "Work Object & Owner", text: "声明Pattern作用于哪个Typed Object，谁对结果负责。" },
  { code: "A03", name: "Fixed / Optional", text: "固定区保证语义完整；扩展区只增加领域内容。" },
  { code: "A04", name: "Semantic Axes", text: "Claim、Evidence、Risk、Permission、Autonomy和Workflow独立。" },
  { code: "A05", name: "Lifecycle & Actions", text: "按钮名称必须准确对应产生的下一状态。" },
  { code: "A06", name: "Failure & Recovery", text: "失败说明保留项、缺失项和下一步，Takeover不从头开始。" },
  { code: "A07", name: "Responsive Capability", text: "小屏减少复杂操作，不删除关键风险和证据。" },
  { code: "A08", name: "Accessibility", text: "键盘、触控、Live Region、Reduced Motion和等价文本。" },
  { code: "A09", name: "Acceptance", text: "以状态理解、任务完成和治理正确性验收，不以视觉完成度替代。" },
];

/** @type {Record<string, JourneyStep[]>} */
const journeyData = {
  collaborative: [
    {
      id: "J-A1",
      title: "Frame Goal",
      object: "MIS-041 · Mission",
      human: "确认业务目标、范围和最终使用者。",
      system: "解释Goal并识别关键歧义。",
      evidence: "当前无结论；只组装有权限的Context。",
      controls: "修改Goal、移除Context、停止。",
      degradation: "目标不可判定时只问一个关键问题。",
      artifact: "Goal & Context Header",
    },
    {
      id: "J-A2",
      title: "Inspect Context",
      object: "MIS-041 r2",
      human: "检查Source、Freshness和Memory边界。",
      system: "组装授权Context Snapshot。",
      evidence: "CTX-041 · PERM-88",
      controls: "Remove、Correct、Add Source。",
      degradation: "Restricted Source显示限制但不泄露内容。",
      artifact: "Context Snapshot",
    },
    {
      id: "J-A3",
      title: "Review Plan",
      object: "ANL-118 · Analysis",
      human: "调整分析深度和优先级。",
      system: "推荐基础、诊断和条件性步骤。",
      evidence: "每个Node声明数据条件。",
      controls: "Run、Skip、Reorder、Stop。",
      degradation: "历史不足时Forecast保持Blocked。",
      artifact: "Inspectable Plan",
    },
    {
      id: "J-A4",
      title: "Read Evidence-backed Result",
      object: "ANL-118 r4",
      human: "判断Evidence是否足以支持业务结论。",
      system: "组织Result和候选解释。",
      evidence: "CLM-118 → EVD-118",
      controls: "Open Evidence、Challenge、Branch。",
      degradation: "Attribution Partial不影响Verified KPI。",
      artifact: "Analysis Document",
    },
    {
      id: "J-A5",
      title: "Form Decision",
      object: "DEC-052 · Decision",
      human: "选择Option并承担Decision Ownership。",
      system: "组织Option、Trade-off和Impact。",
      evidence: "绑定使用的Claim Revision。",
      controls: "Select、Request Evidence、Reject。",
      degradation: "Evidence不足时保持Open。",
      artifact: "Decision Record",
    },
    {
      id: "J-A6",
      title: "Publish Artifact",
      object: "ART-052 r3 · Brief",
      human: "批准发布内容和Audience。",
      system: "准备Narrative并运行一致性检查。",
      evidence: "Publication Gate绑定Revision和Evidence。",
      controls: "Publish、Return to Draft、Branch。",
      degradation: "Evidence Stale使旧Gate失效。",
      artifact: "Published Brief",
    },
    {
      id: "J-A7",
      title: "Propose Action",
      object: "ACT-077 · Proposal",
      human: "决定是否授权进入Process。",
      system: "准备Target、Impact和Constraints。",
      evidence: "Permission、Policy、Risk Preflight。",
      controls: "Prepare、Send for Approval、Cancel。",
      degradation: "Denied保持Proposal，不进入Queue。",
      artifact: "Action Preview与Handoff",
    },
  ],
  process: [
    {
      id: "J-B1",
      title: "Advance Case",
      object: "CASE-204 · Case",
      human: "监控例外与抽检，不逐条监督。",
      system: "按当前Policy推进正常节点。",
      evidence: "POL-17 v6 · Permission Snapshot",
      controls: "Pause、Takeover。",
      degradation: "无合法Policy时停止。",
      artifact: "Case State与Audit",
    },
    {
      id: "J-B2",
      title: "Raise Exception",
      object: "CASE-204 · EXC-19",
      human: "确认是否需要开放调查。",
      system: "分类Exception并保存Work Done。",
      evidence: "Failure、Inputs、Rule Evaluation。",
      controls: "Retry、Investigate、Takeover。",
      degradation: "未知原因明确显示Unknown。",
      artifact: "Exception Brief",
    },
    {
      id: "J-B3",
      title: "Create Investigation",
      object: "MIS-044 · Mission",
      human: "确认调查Scope。",
      system: "创建授权Context和Requested Decision。",
      evidence: "HOF-31 · Handoff Envelope",
      controls: "Accept、Narrow Scope、Return。",
      degradation: "Restricted字段被裁剪并说明影响。",
      artifact: "Investigation Mission",
    },
    {
      id: "J-B4",
      title: "Record Human Decision",
      object: "DEC-057 · Decision",
      human: "形成有Owner的Decision。",
      system: "整理Evidence和Option。",
      evidence: "不依赖尚不存在的新Rule。",
      controls: "Confirm、Request Evidence。",
      degradation: "证据不足时人工处理当前Case。",
      artifact: "Decision Record",
    },
    {
      id: "J-B5",
      title: "Execute Current Case",
      object: "ACT-081 · Action",
      human: "在需要时Approve，不假定已Executed。",
      system: "Preflight、重验、执行和记录。",
      evidence: "当前Policy、Permission、Target State。",
      controls: "Approve、Queue、Execute、Compensate。",
      degradation: "Target变化后重新授权。",
      artifact: "Approval、Execution、Outcome",
    },
    {
      id: "J-B6",
      title: "Propose Future Rule",
      object: "RPROP-204 · Candidate",
      human: "确认Owner、Scope和反例。",
      system: "准备Candidate和Validation范围。",
      evidence: "Replay、Counterexample、Conflict、SoD。",
      controls: "Draft、Validate、Reject。",
      degradation: "单例不足时保留Candidate。",
      artifact: "Rule Proposal",
    },
    {
      id: "J-B7",
      title: "Stage and Observe",
      object: "RULE-204 v1",
      human: "独立Approve并决定Active Scope。",
      system: "Shadow、Canary、Monitor、Kill Switch。",
      evidence: "Validation Report与Change Approval。",
      controls: "Stage、Activate、Suspend、Rollback。",
      degradation: "指标恶化时Suspend并通知Owner。",
      artifact: "Rule Change Receipt",
    },
  ],
};

/** @type {WorkObjectLink} */
const collaborativeToProcessLink = {
  rootId: "ROOT-018",
  from: "ANL-118 r4",
  to: "ACT-077 · Action Proposal",
  traceId: "TRACE-9C21",
};

const handoffFields = [
  { name: "Root & Trace", value: `${collaborativeToProcessLink.rootId} · ${collaborativeToProcessLink.traceId}`, description: "维持Goal和可追溯连续性" },
  { name: "From Revision", value: collaborativeToProcessLink.from, description: "来源对象与不可变版本" },
  { name: "To Type", value: collaborativeToProcessLink.to, description: "创建类型明确的新对象" },
  { name: "Goal & Scope", value: "GOAL-018 · Approved scope", description: "不扩大原有业务范围" },
  { name: "Context Snapshot", value: "CTX-041 · 2026-07-26", description: "授权Context与Freshness" },
  { name: "Evidence", value: "CLM-118 → EVD-118", description: "保留Claim与依据关系" },
  { name: "Decision Owner", value: "ROLE · Business Owner", description: "责任主体不是Agent人格" },
  { name: "Policy & Permission", value: "POL-17 v6 · PERM-88", description: "在执行时仍需重新校验" },
  { name: "Action Constraints", value: "Prepare only · reversible", description: "限定可执行范围和恢复方式" },
];

const referenceFlowData = [
  {
    id: "ask-conclude",
    title: "Ask → Conclude",
    contract: "Collaborative Intelligence",
    steps: ["Goal & Context", "Clarification Budget", "Plan", "Evidence-backed Result", "Decision / Publication"],
    stop: "Evidence不足时缩小Claim或请求一个关键输入；不得把Hypothesis写成Fact。",
  },
  {
    id: "event-action",
    title: "Event → Action",
    contract: "Process Intelligence",
    steps: ["Event / Case", "Policy & Context", "Capability Snapshot", "Action Preflight", "Approve", "Execute", "Outcome"],
    stop: "Capability声明不等于Permission；Denied、Scope Missing或Suspended时不渲染Execute。",
  },
  {
    id: "exception-investigation",
    title: "Exception → Investigation",
    contract: "Cross-contract Handoff",
    steps: ["Exception", "Handoff Envelope", "Investigation Mission", "Decision Record", "Return to Case"],
    stop: "Analysis与Case通过Trace ID关联，不能在同一对象上静默切换Lifecycle。",
  },
  {
    id: "decision-rule",
    title: "Decision → Rule Candidate",
    contract: "Process Intelligence",
    steps: ["Human Decision", "Rule Candidate", "Replay & Conflict Scan", "SoD Approval", "Stage", "Activate & Monitor"],
    stop: "单次人工判断只产生Candidate；未验证、未审批或未Stage时不得影响未来Case。",
  },
];

const acceptanceData = [
  { code: "A01", name: "Orientation", text: "识别Goal、Work Object、State、Owner与Revision。" },
  { code: "A02", name: "Comprehension", text: "正确解释Intent、Plan、Limit与语义轴。" },
  { code: "A03", name: "Control", text: "理解Action Consequence，并能Pause、Takeover或Recover。" },
  { code: "A04", name: "Trust Calibration", text: "Evidence质量与视觉和措辞匹配。" },
  { code: "A05", name: "Task Outcome", text: "完成业务Goal，形成可复用Artifact与真实Outcome。" },
  { code: "A06", name: "Recovery", text: "Failure保留方向、Work Done和明确下一步。" },
  { code: "A07", name: "Continuity", text: "History、Branch、Revision和Handoff可继续工作。" },
  { code: "A08", name: "Accessibility", text: "键盘、触控、辅助技术和Reduced Motion完成同一任务。" },
];

const experienceSignalData = [
  { promise: "Clarity", leading: "Scope纠正率 · 重复澄清次数", outcome: "Intent误解导致的返工率" },
  { promise: "Trust", leading: "Evidence展开率 · Limit阅读率", outcome: "Claim采用、争议与撤回比例" },
  { promise: "Control", leading: "预览、暂停与接管行为", outcome: "未授权Action与不可恢复错误为0" },
  { promise: "Momentum", leading: "首个有效Result时间 · Partial保留率", outcome: "Goal完成时间与等待中断率" },
  { promise: "Continuity", leading: "Branch、Revision与Handoff延续率", outcome: "重复解释Context的时间" },
  { promise: "Calm", leading: "Exception信噪比 · 无效提醒率", outcome: "人工监督负担与Recovery耗时" },
];

const adoptionPathData = [
  { phase: "01", title: "Reference", text: "用静态Fixture证明术语、状态、键盘和响应式契约。" },
  { phase: "02", title: "Pilot", text: "在一个真实Process和一个真实Collaborative场景验证任务与治理边界。" },
  { phase: "03", title: "Shared Contract", text: "第二个消费者复用同一Token、Component或Pattern且无领域分支。" },
  { phase: "04", title: "Productize", text: "再发布@eix/tokens、@eix/ui、版本、迁移和Deprecation机制。" },
  { phase: "05", title: "Measure", text: "用Experience Signal与Outcome持续校准，不以自动化率单独判断成功。" },
];

const readerMetrics = [
  { value: "≥90%", name: "Architecture", text: "解释一个Kernel与两种Contract" },
  { value: "≥85%", name: "Semantics", text: "区分Evidence、Risk、Permission与Autonomy" },
  { value: "≥95%", name: "State", text: "区分Prepared、Approved、Executed与Outcome" },
  { value: "≥85%", name: "Pattern", text: "为给定场景选择正确Pattern" },
  { value: "100%", name: "Identity", text: "识别Canonical、Companion与Candidate" },
];

const workstreamData = [
  {
    code: "W01",
    name: "Architecture & Governance",
    items: ["Canonical Charter", "Kernel与Contract", "Lifecycle与Semantic Axes", "Handoff与Gate"],
  },
  {
    code: "W02",
    name: "Experience & Patterns",
    items: ["Experience Narrative", "Core Design System", "Intelligence UX Guidance", "Reference Journeys"],
  },
  {
    code: "W03",
    name: "Evaluation & Delivery",
    items: ["Reader Testing", "Experience Acceptance", "Accessibility", "Design-to-Engineering Handover"],
  },
];

const lockedDecisions = [
  "只有一个Canonical Shared Experience Kernel。",
  "Process Intelligence与Collaborative Intelligence是两种Interaction Contract，不是两个孤立产品。",
  "Patch、Gate、Receipt、Revision与Handoff是机制，不是第二Kernel。",
  "Root Work Object维持连续性，Typed Child Objects拥有独立Lifecycle。",
  "Publication、Action与Rule Change分别治理。",
  "Claim、Evidence、Uncertainty、Risk、Permission、Autonomy与Workflow正交。",
  "Approve不等于Execute；Verified不等于Allowed或Auto。",
  "单次人工判断只能产生Rule Candidate。",
  "Gate绑定Revision、Evidence、Policy和Permission，并在提交时重验。",
  "Companion与Prototype不拥有架构主权。",
  "Core Design System与Intelligence UX Guidance分层；Core Component不拥有业务Lifecycle。",
  "Neutral Core与EIX Theme共享Semantic Contract，Theme不改变业务语义。",
  "Capability Snapshot是Action Preflight的输入，不是Permission、Approval或Execution Receipt。",
];

const appState = {
  route: "brief",
  density: "brief",
  selectedPromise: 0,
  selectedKernel: 0,
  selectedContract: "process",
  selectedLifecycle: "publication",
  patternFilter: "all",
  selectedPatternId: "S01",
  selectedSpecimen: "patch",
  selectedJourney: "collaborative",
  journeyStep: 0,
  activeDocument: "charter",
  documentLoadToken: 0,
  patch: {
    preview: false,
    applied: false,
    branch: false,
    revision: 4,
    message: "尚未产生任何变更。",
  },
  evidence: {
    stale: false,
    gate: "not-run",
    published: false,
    message: "Gate尚未运行。",
  },
  plan: {
    step: 0,
  },
  action: {
    permission: "allowed",
    stage: "proposed",
    message: "Action只是Proposal，尚未获得授权。",
  },
  rule: {
    stage: "candidate",
    rejected: false,
    message: "当前只创建了Candidate；不会影响任何Case。",
  },
  capability: {
    scope: "complete",
    permission: "current",
    status: "available",
    message: "Capability Snapshot完整；Action仍需通过独立Preflight和Action Gate。",
  },
};

const elements = {
  body: document.body,
  modeToggle: document.querySelector("#modeToggle"),
  modeLabel: document.querySelector("#modeLabel"),
  menuButton: document.querySelector("#menuButton"),
  sidebar: document.querySelector("#sidebar"),
  sidebarBackdrop: document.querySelector("#sidebarBackdrop"),
  sidebarTitle: document.querySelector("#sidebarTitle"),
  sidebarDescription: document.querySelector("#sidebarDescription"),
  sidebarStatus: document.querySelector("#sidebarStatus"),
  sectionNav: document.querySelector("#sectionNav"),
  mainContent: document.querySelector("#mainContent"),
  kernelTraceItems: document.querySelector("#kernelTraceItems"),
  railView: document.querySelector("#railView"),
  railViewDescription: document.querySelector("#railViewDescription"),
  railDensity: document.querySelector("#railDensity"),
  railInvariant: document.querySelector("#railInvariant"),
  promiseTabs: document.querySelector("#promiseTabs"),
  promisePanel: document.querySelector("#promisePanel"),
  architectureLayers: document.querySelector("#architectureLayers"),
  kernelTabs: document.querySelector("#kernelTabs"),
  kernelPanel: document.querySelector("#kernelPanel"),
  contractPanel: document.querySelector("#contractPanel"),
  semanticAxes: document.querySelector("#semanticAxes"),
  lifecycleTabs: document.querySelector("#lifecycleTabs"),
  lifecyclePanel: document.querySelector("#lifecyclePanel"),
  familyGrid: document.querySelector("#familyGrid"),
  analysisDimensions: document.querySelector("#analysisDimensions"),
  designSystemApp: document.querySelector("#designSystemApp"),
  guidanceRouteMeta: document.querySelector("#guidanceRouteMeta"),
  guidanceFlows: document.querySelector("#guidanceFlows"),
  patternList: document.querySelector("#patternList"),
  patternDetail: document.querySelector("#patternDetail"),
  specimenTabs: document.querySelector("#specimenTabs"),
  specimenCanvas: document.querySelector("#specimenCanvas"),
  specimenInspector: document.querySelector("#specimenInspector"),
  patternAnatomy: document.querySelector("#patternAnatomy"),
  journeyTrace: document.querySelector("#journeyTrace"),
  journeyStepPanel: document.querySelector("#journeyStepPanel"),
  journeyPrev: document.querySelector("#journeyPrev"),
  journeyNext: document.querySelector("#journeyNext"),
  journeyPosition: document.querySelector("#journeyPosition"),
  handoffEnvelope: document.querySelector("#handoffEnvelope"),
  acceptanceGrid: document.querySelector("#acceptanceGrid"),
  readerMetrics: document.querySelector("#readerMetrics"),
  experienceSignals: document.querySelector("#experienceSignals"),
  workstreamGrid: document.querySelector("#workstreamGrid"),
  adoptionPath: document.querySelector("#adoptionPath"),
  lockedDecisions: document.querySelector("#lockedDecisions"),
  documentBack: document.querySelector("#documentBack"),
  documentBackLabel: document.querySelector("#documentBackLabel"),
  documentRouteIdentity: document.querySelector("#documentRouteIdentity"),
  documentIdentity: document.querySelector("#documentIdentity"),
  documentTitle: document.querySelector("#documentTitle"),
  documentDescription: document.querySelector("#documentDescription"),
  documentPath: document.querySelector("#documentPath"),
  documentContent: document.querySelector("#documentContent"),
  documentToc: document.querySelector("#documentToc"),
};

const allowedRoutes = new Set(Object.keys(routeMeta));

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function list(items) {
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function setSidebar(open) {
  elements.sidebar.classList.toggle("open", open);
  elements.menuButton.setAttribute("aria-expanded", String(open));
  elements.menuButton.setAttribute("aria-label", open ? "关闭导航" : "打开导航");
  elements.sidebarBackdrop.hidden = !open;
}

function currentRoutePath() {
  return window.location.hash.replace(/^#\/?/, "").split(/[?#]/)[0].replace(/^\/+|\/+$/g, "");
}

function parseRoute() {
  const base = currentRoutePath().split("/")[0];
  return allowedRoutes.has(base) ? base : "brief";
}

function hasValidRouteHash() {
  const base = currentRoutePath().split("/")[0];
  return allowedRoutes.has(base);
}

function hashParameters() {
  const query = window.location.hash.split("?")[1] || "";
  return new URLSearchParams(query);
}

function safeReturnRoute(value) {
  const base = String(value || "").split("/")[0];
  return allowedRoutes.has(base) && !["document", "patterns"].includes(base) ? base : "brief";
}

function currentDocumentRequest() {
  const parameters = hashParameters();
  const requestedDocument = parameters.get("doc");
  return {
    documentId: Object.hasOwn(documentRegistry, requestedDocument) ? requestedDocument : "charter",
    from: safeReturnRoute(parameters.get("from")),
  };
}

function documentRouteUrl(documentId, from = appState.route) {
  const safeDocumentId = Object.hasOwn(documentRegistry, documentId) ? documentId : "charter";
  const safeFrom = appState.route === "document" ? currentDocumentRequest().from : safeReturnRoute(from);
  return `#/document?doc=${encodeURIComponent(safeDocumentId)}&from=${encodeURIComponent(safeFrom)}`;
}

function documentIdFromHref(href) {
  const cleanHref = decodeURIComponent(href.split(/[?#]/)[0]).replace(/^\.\//, "");
  const basename = cleanHref.split("/").pop();
  return Object.entries(documentRegistry).find(([, documentSpec]) => documentSpec.file === basename)?.[0] || null;
}

function sanitizeMarkdownHtml(html) {
  const template = document.createElement("template");
  template.innerHTML = html;
  template.content.querySelectorAll("script, style, iframe, object, embed, form, input, button, textarea, select, meta, link").forEach((node) => node.remove());
  template.content.querySelectorAll("*").forEach((node) => {
    [...node.attributes].forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim().toLowerCase();
      if (name.startsWith("on") || name === "style" || name === "srcdoc") node.removeAttribute(attribute.name);
      if ((name === "href" || name === "src") && (value.startsWith("javascript:") || value.startsWith("data:text/html"))) {
        node.removeAttribute(attribute.name);
      }
    });
  });
  return template.innerHTML;
}

function slugifyHeading(value, index, usedSlugs) {
  const base =
    value
      .normalize("NFKC")
      .toLowerCase()
      .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
      .replace(/^-+|-+$/g, "") || `section-${index + 1}`;
  const count = usedSlugs.get(base) || 0;
  usedSlugs.set(base, count + 1);
  return count ? `${base}-${count + 1}` : base;
}

let documentTocObserver;

function renderDocumentToc() {
  if (documentTocObserver) documentTocObserver.disconnect();
  const headings = [...elements.documentContent.querySelectorAll("h2, h3")];
  const usedSlugs = new Map();
  headings.forEach((heading, index) => {
    heading.id = slugifyHeading(heading.textContent || "", index, usedSlugs);
    heading.tabIndex = -1;
  });

  elements.documentToc.innerHTML = headings
    .map(
      (heading) => `
        <a href="#${escapeHtml(heading.id)}" data-heading-id="${escapeHtml(heading.id)}" class="level-${heading.tagName.toLowerCase()}">
          ${escapeHtml(heading.textContent || "")}
        </a>
      `,
    )
    .join("");

  elements.documentToc.querySelectorAll("[data-heading-id]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const heading = document.getElementById(link.dataset.headingId);
      heading?.scrollIntoView({ block: "start" });
      heading?.focus({ preventScroll: true });
    });
  });

  if ("IntersectionObserver" in window && headings.length) {
    documentTocObserver = new IntersectionObserver(
      (entries) => {
        const active = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (!active) return;
        elements.documentToc.querySelectorAll("a").forEach((link) => {
          link.classList.toggle("active", link.dataset.headingId === active.target.id);
        });
      },
      { rootMargin: "-18% 0px -72% 0px", threshold: [0, 0.5, 1] },
    );
    headings.forEach((heading) => documentTocObserver.observe(heading));
  }
}

function wireRenderedDocumentLinks() {
  const returnRoute = currentDocumentRequest().from;
  elements.documentContent.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href") || "";
    const linkedDocumentId = documentIdFromHref(href);
    if (linkedDocumentId) {
      link.href = documentRouteUrl(linkedDocumentId, returnRoute);
      link.dataset.documentId = linkedDocumentId;
      return;
    }
    if (href.includes("index.html")) {
      link.href = `#/${returnRoute}`;
      return;
    }
    if (/^https?:\/\//i.test(href)) {
      link.target = "_blank";
      link.rel = "noreferrer noopener";
    }
  });
}

async function renderDocument() {
  const request = currentDocumentRequest();
  const spec = documentRegistry[request.documentId];
  const loadToken = appState.documentLoadToken + 1;
  appState.documentLoadToken = loadToken;
  appState.activeDocument = request.documentId;

  elements.documentIdentity.textContent = spec.identity;
  elements.documentRouteIdentity.textContent = spec.routeIdentity;
  elements.documentTitle.textContent = spec.title;
  elements.documentDescription.textContent = spec.description;
  elements.documentPath.textContent = spec.file;
  elements.documentBackLabel.textContent = `返回 ${routeMeta[request.from].title}`;
  elements.documentContent.setAttribute("aria-busy", "true");
  elements.documentContent.innerHTML = `<p class="document-loading">正在以UTF-8读取Markdown文档…</p>`;
  elements.documentToc.innerHTML = "";
  document.querySelectorAll(".suite-map [data-document-id]").forEach((link) => {
    const active = link.dataset.documentId === request.documentId;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });

  elements.sidebarTitle.textContent = spec.title;
  elements.sidebarDescription.textContent = spec.description;
  elements.sidebarStatus.className = `doc-status ${spec.statusClass}`;
  elements.sidebarStatus.innerHTML = `<span></span>${escapeHtml(spec.status)}`;
  elements.railView.textContent = "文档";
  elements.railViewDescription.textContent = spec.title;
  elements.railInvariant.textContent = "Source remains Markdown";
  document.title = `${spec.title} · EIX 2.0`;

  try {
    const response = await fetch(`./${encodeURI(spec.file)}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const bytes = await response.arrayBuffer();
    if (loadToken !== appState.documentLoadToken) return;
    const markdown = new TextDecoder("utf-8").decode(bytes).replace(/^\uFEFF/, "");
    if (!window.marked?.parse) throw new Error("Markdown renderer unavailable");
    const rendered = window.marked.parse(markdown, { gfm: true, breaks: false });
    elements.documentContent.innerHTML = sanitizeMarkdownHtml(rendered);

    const sourceTitle = elements.documentContent.querySelector("h1");
    if (sourceTitle) {
      elements.documentTitle.textContent = sourceTitle.textContent || spec.title;
      sourceTitle.remove();
    }

    elements.documentContent.querySelectorAll("table").forEach((table) => {
      const wrapper = document.createElement("div");
      wrapper.className = "markdown-table-scroll";
      wrapper.tabIndex = 0;
      wrapper.setAttribute("role", "region");
      wrapper.setAttribute("aria-label", "可横向滚动的数据表");
      table.parentNode?.insertBefore(wrapper, table);
      wrapper.append(table);
    });
    elements.documentContent.querySelectorAll("pre").forEach((pre) => {
      pre.tabIndex = 0;
      pre.setAttribute("aria-label", "代码或结构化文本");
    });

    wireRenderedDocumentLinks();
    renderDocumentToc();
    elements.documentContent.setAttribute("aria-busy", "false");
  } catch (error) {
    if (loadToken !== appState.documentLoadToken) return;
    elements.documentContent.setAttribute("aria-busy", "false");
    elements.documentContent.innerHTML = `
      <div class="document-error" role="alert">
        <strong>文档未能加载。</strong>
        <p>${escapeHtml(error instanceof Error ? error.message : "Unknown error")}</p>
        <p>Markdown源文件没有被修改。请确认本地静态服务仍在运行。</p>
      </div>
    `;
  }
}

function setDensity(density) {
  appState.density = density === "deep" ? "deep" : "brief";
  elements.body.dataset.density = appState.density;
  document.querySelectorAll("[data-density-option]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.densityOption === appState.density));
  });
  elements.railDensity.textContent = appState.density === "deep" ? "完整规范" : "快速阅读";
  try {
    localStorage.setItem("eix-density", appState.density);
  } catch {
    // Device-local preference is optional.
  }
}

function setMode(mode, persist = true) {
  const safeMode = mode === "dark" ? "dark" : "light";
  elements.body.dataset.mode = safeMode;
  if (elements.modeToggle) {
    elements.modeToggle.setAttribute("aria-pressed", String(safeMode === "dark"));
    elements.modeToggle.setAttribute("aria-label", safeMode === "dark" ? "切换到浅色模式" : "切换到深色模式");
  }
  if (elements.modeLabel) elements.modeLabel.textContent = safeMode.toUpperCase();
  document.querySelectorAll("[data-ds-mode]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.dsMode === safeMode));
  });
  if (persist) {
    try {
      localStorage.setItem("eix-mode", safeMode);
    } catch {
      // Device-local preference is optional.
    }
  }
}

function renderKernelTrace() {
  elements.kernelTraceItems.innerHTML = kernelData
    .map(
      (item, index) => `
        <a href="#/architecture" data-trace-index="${index}" aria-label="查看${escapeHtml(item.name)}">
          <span>${escapeHtml(item.code.slice(1))}</span>${escapeHtml(item.name)}
        </a>
      `,
    )
    .join("");

  elements.kernelTraceItems.querySelectorAll("[data-trace-index]").forEach((link) => {
    link.addEventListener("click", () => {
      appState.selectedKernel = Number(link.dataset.traceIndex);
      renderKernelExplorer();
      window.requestAnimationFrame(() => {
        document.querySelector("#architecture-kernel")?.scrollIntoView({ block: "start" });
      });
    });
  });
}

let sectionObserver;

function renderSectionNav(routeView) {
  if (sectionObserver) sectionObserver.disconnect();
  const sections = [...routeView.querySelectorAll("[data-section-title]")];
  elements.sectionNav.innerHTML = sections
    .map(
      (section, index) => `
        <a href="#${escapeHtml(section.id)}" data-section-link="${escapeHtml(section.id)}">
          <span>${String(index + 1).padStart(2, "0")}</span>${escapeHtml(section.dataset.sectionTitle)}
        </a>
      `,
    )
    .join("");

  elements.sectionNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      document.querySelector(link.getAttribute("href"))?.scrollIntoView({ block: "start" });
      setSidebar(false);
    });
  });

  if ("IntersectionObserver" in window) {
    sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        elements.sectionNav.querySelectorAll("a").forEach((link) => {
          link.classList.toggle("active", link.dataset.sectionLink === visible.target.id);
        });
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: [0.05, 0.25, 0.6] },
    );
    sections.forEach((section) => sectionObserver.observe(section));
  }
}

function renderRoute({ focusMain = false } = {}) {
  if (currentRoutePath().split("/")[0] === "patterns") {
    history.replaceState(null, "", "#/guidance");
  }
  if (!hasValidRouteHash()) {
    history.replaceState(null, "", "#/brief");
  }
  appState.route = parseRoute();
  elements.body.dataset.route = appState.route;
  document.documentElement.style.setProperty(
    "--active-trace-height",
    appState.route === "architecture" ? "var(--trace-height)" : "0px",
  );
  const meta = routeMeta[appState.route];
  document.querySelectorAll("[data-route-view]").forEach((view) => {
    view.hidden = view.dataset.routeView !== appState.route;
  });
  document.querySelectorAll("[data-route-link]").forEach((link) => {
    const active = link.dataset.routeLink === appState.route;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });

  elements.sidebarTitle.textContent = meta.title;
  elements.sidebarDescription.textContent = meta.description;
  elements.sidebarStatus.className = `doc-status ${meta.statusClass}`;
  elements.sidebarStatus.innerHTML = `<span></span>${escapeHtml(meta.status)}`;
  elements.railView.textContent = meta.rail;
  elements.railViewDescription.textContent = meta.railDescription;
  elements.railInvariant.textContent = meta.invariant;
  document.title = `${meta.title} · EIX 2.0`;

  const routeView = document.querySelector(`[data-route-view="${appState.route}"]`);
  if (appState.route === "guidance") {
    syncGuidanceRoute();
    renderPatterns();
  }
  if (appState.route === "design-system" && elements.designSystemApp) {
    elements.designSystemApp.setAttribute("aria-busy", "true");
    void renderDesignSystemRoute(elements.designSystemApp)
      .then(() => {
        elements.designSystemApp.setAttribute("aria-busy", "false");
        renderSectionNav(routeView);
      })
      .catch((error) => {
        elements.designSystemApp.setAttribute("aria-busy", "false");
        elements.designSystemApp.innerHTML = `<div class="ds-load-error" role="alert"><strong>Design System未能加载。</strong><p>${escapeHtml(error instanceof Error ? error.message : "Unknown error")}</p></div>`;
        renderSectionNav(routeView);
      });
  } else {
    renderSectionNav(routeView);
  }
  setSidebar(false);

  if (appState.route === "document") {
    void renderDocument();
  } else {
    appState.documentLoadToken += 1;
    if (documentTocObserver) documentTocObserver.disconnect();
    document.querySelectorAll(".suite-map [data-document-id]").forEach((link) => {
      link.classList.remove("active");
      link.removeAttribute("aria-current");
    });
  }

  if (focusMain) {
    window.scrollTo({ top: 0, behavior: "auto" });
    elements.mainContent.focus({ preventScroll: true });
  }
}

function renderPromises() {
  elements.promiseTabs.innerHTML = promiseData
    .map(
      (item, index) => `
        <button
          type="button"
          role="tab"
          data-promise-index="${index}"
          aria-selected="${index === appState.selectedPromise}"
          tabindex="${index === appState.selectedPromise ? "0" : "-1"}"
          aria-controls="promisePanel"
        >${escapeHtml(item.name)} · ${escapeHtml(item.cn)}</button>
      `,
    )
    .join("");
  const item = promiseData[appState.selectedPromise];
  elements.promisePanel.innerHTML = `
    <section>
      <span>USER FEAR</span>
      <blockquote>${escapeHtml(item.fear)}</blockquote>
    </section>
    <section>
      <span>DESIGN MECHANISMS</span>
      ${list(item.mechanisms)}
    </section>
    <section>
      <span>FELT PROMISE</span>
      <strong>${escapeHtml(item.promise)}</strong>
    </section>
  `;
  bindTabButtons(elements.promiseTabs, "[data-promise-index]", (button) => {
    appState.selectedPromise = Number(button.dataset.promiseIndex);
    renderPromises();
  });
}

function renderLayers() {
  elements.architectureLayers.innerHTML = architectureLayers
    .map(
      (layer) => `
        <article class="${layer.kernel ? "kernel" : ""}">
          <span class="layer-code">${escapeHtml(layer.code)}</span>
          <div class="layer-main"><strong>${escapeHtml(layer.name)}</strong><small>${escapeHtml(layer.detail)}</small></div>
          <div class="layer-owner"><span>OWNER</span><small>${escapeHtml(layer.owner)}</small></div>
          <div class="layer-output"><span>OUTPUT</span><small>${escapeHtml(layer.output)}</small></div>
        </article>
      `,
    )
    .join("");
}

function renderKernelExplorer() {
  elements.kernelTabs.innerHTML = kernelData
    .map(
      (item, index) => `
        <button
          type="button"
          role="tab"
          data-kernel-index="${index}"
          aria-selected="${index === appState.selectedKernel}"
          tabindex="${index === appState.selectedKernel ? "0" : "-1"}"
          aria-controls="kernelPanel"
        ><span>${escapeHtml(item.code)}</span>${escapeHtml(item.name)}</button>
      `,
    )
    .join("");
  const item = kernelData[appState.selectedKernel];
  elements.kernelPanel.innerHTML = `
    <header>
      <span class="kernel-code">${escapeHtml(item.code)}</span>
      <div><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.question)}</p></div>
    </header>
    <div class="kernel-body">
      <section><span>DEFINITION</span><p>${escapeHtml(item.definition)}</p></section>
      <section><span>MUST BE VISIBLE</span>${list(item.visible)}</section>
      <section><span>GOVERNANCE</span><p>${escapeHtml(item.governance)}</p></section>
      <section><span>NOT A SECOND KERNEL</span><p>Patch、Gate、Receipt、Revision与Handoff是作用于${escapeHtml(item.name)}的控制机制。</p></section>
    </div>
  `;
  bindTabButtons(elements.kernelTabs, "[data-kernel-index]", (button) => {
    appState.selectedKernel = Number(button.dataset.kernelIndex);
    renderKernelExplorer();
  });
  elements.kernelTraceItems.querySelectorAll("[data-trace-index]").forEach((link) => {
    link.classList.toggle("active", Number(link.dataset.traceIndex) === appState.selectedKernel);
  });
}

function renderContract() {
  const item = contractData[appState.selectedContract];
  document.querySelectorAll("[data-contract-option]").forEach((button) => {
    const selected = button.dataset.contractOption === appState.selectedContract;
    button.setAttribute("aria-selected", String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
  elements.contractPanel.innerHTML = `
    <header>
      <div class="contract-title">
        <span>${escapeHtml(item.mode)}</span>
        <h3>${escapeHtml(item.name)}</h3>
        <p>${escapeHtml(item.statement)}</p>
      </div>
      <div class="contract-object"><span>PRIMARY WORK OBJECT</span><strong>${escapeHtml(item.object)}</strong></div>
    </header>
    <div class="contract-flow">${item.flow.map((step) => `<span>${escapeHtml(step)}</span>`).join("")}</div>
    <div class="contract-details">
      <section><span>SYSTEM DEFAULT</span>${list(item.system)}</section>
      <section><span>HUMAN DEFAULT</span>${list(item.human)}</section>
      <section><span>MUST BE VISIBLE</span>${list(item.visible)}</section>
    </div>
  `;
}

function renderSemanticAxes() {
  elements.semanticAxes.innerHTML = semanticAxisData
    .map(
      (axis) => `
        <article class="semantic-axis-card">
          <header><i style="background:${axis.color}"></i><span>AXIS · ${escapeHtml(axis.id)}</span></header>
          <h3>${escapeHtml(axis.name)}</h3>
          <p>${escapeHtml(axis.description)}</p>
          <div class="axis-values">${axis.values.map((value) => `<span>${escapeHtml(value)}</span>`).join("")}</div>
        </article>
      `,
    )
    .join("");
}

function renderLifecycles() {
  elements.lifecycleTabs.innerHTML = lifecycleData
    .map(
      (item) => `
        <button
          type="button"
          role="tab"
          data-lifecycle-id="${item.id}"
          aria-selected="${item.id === appState.selectedLifecycle}"
          tabindex="${item.id === appState.selectedLifecycle ? "0" : "-1"}"
          aria-controls="lifecyclePanel"
        >${escapeHtml(item.name)}</button>
      `,
    )
    .join("");
  const item = lifecycleData.find((entry) => entry.id === appState.selectedLifecycle);
  elements.lifecyclePanel.innerHTML = `
    <header><h3>${escapeHtml(item.name)} Lifecycle</h3><span>SUBJECT · ${escapeHtml(item.subject)}</span></header>
    <div class="lifecycle-track">${item.states.map((state) => `<span>${escapeHtml(state)}</span>`).join("")}</div>
    <div class="lifecycle-rules">${item.rules.map((rule) => `<p>${escapeHtml(rule)}</p>`).join("")}</div>
  `;
  bindTabButtons(elements.lifecycleTabs, "[data-lifecycle-id]", (button) => {
    appState.selectedLifecycle = button.dataset.lifecycleId;
    renderLifecycles();
  });
}

function renderFamilies() {
  elements.familyGrid.innerHTML = familyData
    .map(
      (family) => `
        <article class="family-card">
          <span>${escapeHtml(family.code)}</span>
          <h3>${escapeHtml(family.name)}</h3>
          <p>${escapeHtml(family.question)}</p>
          <small>${escapeHtml(family.artifact)}</small>
        </article>
      `,
    )
    .join("");
  elements.analysisDimensions.innerHTML = analysisDimensions
    .map(
      (item) => `
        <article class="analysis-dimension">
          <b>${escapeHtml(item.name)}</b>
          <span>${escapeHtml(item.values)}</span>
        </article>
      `,
    )
    .join("");
}

function syncGuidanceRoute() {
  const parts = currentRoutePath().split("/");
  const requestedGroup = ["shared", "process", "collaborative", "handoff"].includes(parts[1]) ? parts[1] : "all";
  const allowedIds = requestedGroup === "all" ? patternData.map((pattern) => pattern.id) : guidanceGroups[requestedGroup];
  const requestedId = parts[2];
  appState.patternFilter = requestedGroup;
  if (requestedId && allowedIds.includes(requestedId)) {
    appState.selectedPatternId = requestedId;
  } else if (!allowedIds.includes(appState.selectedPatternId)) {
    appState.selectedPatternId = allowedIds[0];
  }

  if (elements.guidanceRouteMeta) {
    const meta =
      requestedGroup === "all"
        ? {
            title: "All Intelligence Patterns",
            description: "共享机制、Process Composition、Collaborative Composition与Cross-contract Handoff。",
          }
        : guidanceGroupMeta[requestedGroup];
    elements.guidanceRouteMeta.innerHTML = `<strong>${escapeHtml(meta.title)}</strong><span>${escapeHtml(meta.description)}</span>`;
  }
}

function filteredPatterns() {
  if (appState.patternFilter === "all") return patternData;
  const ids = guidanceGroups[appState.patternFilter] || [];
  return ids.map((id) => patternData.find((pattern) => pattern.id === id)).filter(Boolean);
}

function renderPatterns() {
  document.querySelectorAll("[data-pattern-filter]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.patternFilter === appState.patternFilter));
  });
  const items = filteredPatterns();
  if (!items.some((item) => item.id === appState.selectedPatternId)) {
    appState.selectedPatternId = items[0].id;
  }
  elements.patternList.innerHTML = items
    .map(
      (pattern) => `
        <button
          type="button"
          role="option"
          data-pattern-id="${pattern.id}"
          aria-selected="${pattern.id === appState.selectedPatternId}"
        >
          <span class="pattern-code">${escapeHtml(pattern.id)}</span>
          <span><b>${escapeHtml(pattern.name)}</b><small>${escapeHtml(pattern.contract)} · ${escapeHtml(pattern.workObject)}</small></span>
        </button>
      `,
    )
    .join("");
  const pattern = patternData.find((item) => item.id === appState.selectedPatternId);
  elements.patternDetail.innerHTML = `
    <header>
      <div>
        <span>${escapeHtml(pattern.id)} · ${escapeHtml(pattern.contract.toUpperCase())}</span>
        <h3>${escapeHtml(pattern.name)}</h3>
        <p>${escapeHtml(pattern.purpose)}</p>
      </div>
      <span class="pattern-maturity">${escapeHtml(pattern.maturity)}</span>
    </header>
    ${guidanceSpecimenHtml(pattern)}
    <div class="pattern-detail-grid">
      <section><span>USER FEAR</span><p>${escapeHtml(pattern.fear)}</p></section>
      <section><span>WORK OBJECT / OWNER</span><p>${escapeHtml(pattern.workObject)}<br>${escapeHtml(pattern.owner)}</p></section>
      <section><span>FIXED REGIONS</span>${list(pattern.fixed)}</section>
      <section><span>STATES</span>${list(pattern.states)}</section>
      <section><span>CORE COMPONENTS</span><div class="pattern-component-links">${pattern.coreComponents
        .map((id) => {
          const entry = catalogRegistry.find((item) => item.kind === "components" && item.id === id);
          return entry
            ? `<a href="#${escapeHtml(entry.route)}">${escapeHtml(entry.title)}</a>`
            : `<span>${escapeHtml(id)}</span>`;
        })
        .join("")}</div></section>
      <section><span>ACCEPTANCE</span>${list(pattern.tests)}</section>
      <section><span>EXTENSION RULE</span>${list(pattern.extensions)}</section>
      <section class="deep-only"><span>OPTIONAL REGIONS</span>${list(pattern.optional)}</section>
      <section class="deep-only"><span>SEMANTIC AXES</span>${list(pattern.semanticAxes)}</section>
      <section class="deep-only"><span>PERMISSION / AUTONOMY</span><p>${escapeHtml(pattern.permissionAndAutonomy)}</p></section>
      <section class="deep-only"><span>FAILURE / DEGRADATION / RECOVERY</span><p>${escapeHtml(pattern.failure)} ${escapeHtml(pattern.degradation)} ${escapeHtml(pattern.recovery)}</p></section>
      <section class="deep-only"><span>RESPONSIVE / ACCESSIBILITY</span><p>${escapeHtml(pattern.responsive)}</p>${list(pattern.accessibility)}</section>
      <section class="deep-only"><span>DO / DON'T</span><b>Do</b>${list(pattern.dos)}<b>Don't</b>${list(pattern.donts)}</section>
    </div>
  `;
  bindGuidanceSpecimen(elements.patternDetail, pattern);
  const patternButtons = [...elements.patternList.querySelectorAll("[data-pattern-id]")];
  patternButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
      appState.selectedPatternId = button.dataset.patternId;
      const selected = patternData.find((item) => item.id === appState.selectedPatternId);
      const routeGroup = appState.patternFilter === "handoff" ? "handoff" : selected.contract;
      window.location.hash = `#/guidance/${routeGroup}/${selected.id}`;
    });
    button.addEventListener("keydown", (event) => {
      let nextIndex = null;
      if (event.key === "ArrowDown" || event.key === "ArrowRight") nextIndex = (index + 1) % patternButtons.length;
      if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        nextIndex = (index - 1 + patternButtons.length) % patternButtons.length;
      }
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = patternButtons.length - 1;
      if (nextIndex === null) return;
      event.preventDefault();
      appState.selectedPatternId = patternButtons[nextIndex].dataset.patternId;
      const selected = patternData.find((item) => item.id === appState.selectedPatternId);
      const routeGroup = appState.patternFilter === "handoff" ? "handoff" : selected.contract;
      window.location.hash = `#/guidance/${routeGroup}/${selected.id}`;
      window.requestAnimationFrame(() => {
        elements.patternList.querySelector(`[data-pattern-id="${appState.selectedPatternId}"]`)?.focus();
      });
    });
  });
}

function renderGuidanceFlows() {
  elements.guidanceFlows.innerHTML = referenceFlowData
    .map(
      (flow) => `
        <article class="guidance-flow-card">
          <header><span>${escapeHtml(flow.contract)}</span><h3>${escapeHtml(flow.title)}</h3></header>
          <ol class="guidance-flow-track">
            ${flow.steps.map((step) => `<li><span>${escapeHtml(step)}</span></li>`).join("")}
          </ol>
          <div class="guidance-flow-stop"><span>STOP / DEGRADE</span><p>${escapeHtml(flow.stop)}</p></div>
        </article>
      `,
    )
    .join("");
}

const specimenMeta = [
  { id: "patch", label: "Intent Patch", principle: "Intent and State Must Be Visible", object: "ANL-118", invariant: "Undo产生Revert Patch，不删除Revision。" },
  { id: "evidence", label: "Evidence & Gate", principle: "Evidence before Eloquence", object: "ART-052", invariant: "Stale使Gate失效；Passed不等于Published。" },
  { id: "plan", label: "Plan & Partial", principle: "Failure Must Preserve Orientation", object: "ANL-118", invariant: "高阶失败不抹掉Verified基础结果。" },
  { id: "action", label: "Controlled Action", principle: "Preview Consequence before Action", object: "ACT-077", invariant: "Approve不等于Execute；Permission独立否决。" },
  { id: "rule", label: "Rule Proposal", principle: "Feedback Improves Transparently", object: "RPROP-204", invariant: "单次判断只产生Candidate。" },
  { id: "capability", label: "Capability & Scope", principle: "Capability Is Not Authorization", object: "CAP-031", invariant: "声明能做什么，不等于当前Action获准执行。" },
];

function renderSpecimenTabs() {
  elements.specimenTabs.innerHTML = specimenMeta
    .map(
      (item) => `
        <button
          type="button"
          role="tab"
          data-specimen-id="${item.id}"
          aria-selected="${item.id === appState.selectedSpecimen}"
          tabindex="${item.id === appState.selectedSpecimen ? "0" : "-1"}"
          aria-controls="specimenCanvas"
        >${escapeHtml(item.label)}</button>
      `,
    )
    .join("");
  bindTabButtons(elements.specimenTabs, "[data-specimen-id]", (button) => {
    appState.selectedSpecimen = button.dataset.specimenId;
    renderSpecimenTabs();
    renderSpecimen();
  });
}

function inspectorHtml(meta, states, tests) {
  return `
    <h3>${escapeHtml(meta.label)}</h3>
    <p>${escapeHtml(meta.principle)}</p>
    <div class="inspector-group"><span>WORK OBJECT</span><p>${escapeHtml(meta.object)}</p></div>
    <div class="inspector-group"><span>INVARIANT</span><p>${escapeHtml(meta.invariant)}</p></div>
    <div class="inspector-group"><span>VISIBLE AXES</span>${list(states)}</div>
    <div class="inspector-group"><span>WHAT TO TEST</span>${list(tests)}</div>
  `;
}

function renderPatchSpecimen() {
  const state = appState.patch;
  const objectId = state.branch ? "ANL-118-B1" : "ANL-118";
  const breakdown = state.applied ? "Entity" : "—";
  const period = state.applied ? "Q2 2027" : "YTD Jun 2027";
  elements.specimenCanvas.innerHTML = `
    <div class="specimen-frame">
      <header><span>INTENT / CHANGE PREVIEW · ${escapeHtml(objectId)} r${state.revision}</span><span class="fixture-label">FIXTURE</span></header>
      <div class="intent-ribbon">
        <span class="intent-chip"><span>Metric</span>Entity Profit</span>
        <span class="intent-chip ${state.applied ? "changed" : ""}"><span>Breakdown</span>${escapeHtml(breakdown)}</span>
        <span class="intent-chip ${state.applied ? "changed" : ""}"><span>Period</span>${escapeHtml(period)}</span>
        <span class="intent-chip"><span>Compare</span>vs MBBP</span>
        <span class="intent-chip"><span>Currency</span>EUR</span>
      </div>
      <div class="specimen-body">
        <div class="specimen-prompt">
          <p>自然语言变更：“改成按Entity拆分，只看Q2。”</p>
          <button class="button secondary" type="button" data-patch-action="preview">${state.preview ? "收起Diff" : "预览Diff"}</button>
        </div>
        ${
          state.preview
            ? `
              <div class="diff-table">
                <div class="diff-row"><span>Breakdown</span><span class="diff-value"><b class="diff-before">—</b><i class="diff-arrow">→</i><b class="diff-after">Entity</b></span></div>
                <div class="diff-row"><span>Period</span><span class="diff-value"><b class="diff-before">YTD Jun 2027</b><i class="diff-arrow">→</i><b class="diff-after">Q2 2027</b></span></div>
                <div class="diff-row"><span>Impact</span><span>2个Result Blocks重算 · Scope变化 · Publication Gate失效</span></div>
              </div>
            `
            : ""
        }
        <div class="specimen-actions">
          <button class="button primary" type="button" data-patch-action="apply" ${!state.preview || state.applied ? "disabled" : ""}>应用Patch并生成r${state.revision + 1}</button>
          <button class="button secondary" type="button" data-patch-action="revert" ${!state.applied ? "disabled" : ""}>创建Revert Patch</button>
          <button class="button secondary" type="button" data-patch-action="branch" ${!state.applied || state.branch ? "disabled" : ""}>从当前Revision创建Branch</button>
        </div>
        <div class="status-message" role="status">${escapeHtml(state.message)}</div>
      </div>
    </div>
  `;
  elements.specimenInspector.innerHTML = inspectorHtml(
    specimenMeta[0],
    ["Workflow · Draft r" + state.revision, "Scope · " + (state.applied ? "Changed" : "Original"), "Permission · Allowed"],
    ["Scope变化必须显示Impact", "Revert产生新Revision", "Branch不污染Parent"],
  );

  elements.specimenCanvas.querySelectorAll("[data-patch-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.patchAction;
      if (action === "preview") state.preview = !state.preview;
      if (action === "apply" && state.preview && !state.applied) {
        state.applied = true;
        state.preview = false;
        state.revision += 1;
        state.message = `Patch已应用为Draft r${state.revision}；受影响Gate已失效。`;
      }
      if (action === "revert" && state.applied) {
        state.applied = false;
        state.branch = false;
        state.revision += 1;
        state.message = `已创建Revert Patch并生成Draft r${state.revision}；历史Revision仍保留。`;
      }
      if (action === "branch" && state.applied && !state.branch) {
        state.branch = true;
        state.message = `已创建ANL-118-B1，Parent保持ANL-118 r${state.revision}。`;
      }
      renderPatchSpecimen();
    });
  });
}

function evidenceGateLabel(status) {
  return {
    "not-run": "Not Run",
    passed: "Passed",
    failed: "Failed",
    invalidated: "Invalidated",
  }[status];
}

function renderEvidenceSpecimen() {
  const state = appState.evidence;
  const gatePassed = state.gate === "passed" && !state.stale;
  const gateChecks = publicationGateFixture.checkResults.map((check) =>
    check.id === "freshness" && state.stale
      ? { ...check, result: "fail", detail: "FAIL · snapshot expired" }
      : check,
  );
  elements.specimenCanvas.innerHTML = `
    <div class="specimen-frame">
      <header><span>EVIDENCE RECEIPT · EVD-118</span><span class="fixture-label">FIXTURE</span></header>
      <div class="specimen-body">
        <div class="receipt-table">
          <div class="receipt-row"><span>Source</span><span>FIN.PROFIT.ENTITY · semantic v6</span></div>
          <div class="receipt-row"><span>Snapshot</span><span>2027-06 · closed · UTC+8</span></div>
          <div class="receipt-row"><span>Scope</span><span>6 Entity · YTD · ACT vs MBBP</span></div>
          <div class="receipt-row"><span>Method</span><span>Certified variance calculation · q7f3a</span></div>
          <div class="receipt-row"><span>Policy</span><span>${escapeHtml(publicationGateFixture.policyVersion)}</span></div>
          <div class="receipt-row"><span>Permission</span><span><span class="state-badge permission">Allowed · ${escapeHtml(publicationGateFixture.permissionVersion)}</span></span></div>
          <div class="receipt-row"><span>Validation</span><span><span class="state-badge ${state.stale ? "blocking" : "validation"}">${state.stale ? "Stale" : "Verified"}</span></span></div>
          <div class="receipt-row"><span>Limitation</span><span>Attribution缺Q1 baseline；基础KPI仍有效</span></div>
        </div>

        <div class="gate-card">
          <header><strong>Publication Gate · ${escapeHtml(publicationGateFixture.subjectId)} r${publicationGateFixture.revision}</strong><span class="state-badge ${state.gate === "invalidated" ? "blocking" : "workflow"}">${escapeHtml(evidenceGateLabel(state.gate))}</span></header>
          <ul class="gate-checks">
            ${gateChecks
              .map(
                (check) => `
                  <li class="${check.result === "fail" ? "fail" : ""}">
                    <span>${check.result === "fail" ? "×" : "✓"}</span>
                    <span>${escapeHtml(check.label)}</span>
                    <small>${escapeHtml(check.detail)}</small>
                  </li>
                `,
              )
              .join("")}
          </ul>
        </div>

        <div class="specimen-actions">
          <button class="button secondary" type="button" data-evidence-action="toggle-stale">${state.stale ? "恢复当前Snapshot" : "模拟Evidence变为Stale"}</button>
          <button class="button primary" type="button" data-evidence-action="run-gate" ${state.stale ? "disabled" : ""}>运行Publication Gate</button>
          <button class="button primary" type="button" data-evidence-action="publish" ${!gatePassed ? "disabled" : ""}>发布Artifact</button>
        </div>
        <div class="status-message ${state.stale ? "blocked" : ""}" role="status">${escapeHtml(state.message)}</div>
      </div>
    </div>
  `;
  elements.specimenInspector.innerHTML = inspectorHtml(
    specimenMeta[1],
    [
      `Evidence · ${state.stale ? "Stale" : "Verified"}`,
      `Permission · Allowed`,
      `Workflow · ${state.published ? "Published" : "Draft"}`,
      `Gate · ${evidenceGateLabel(state.gate)}`,
    ],
    ["Stale不等于Denied", "Passed不等于Published", "Evidence变化使Gate失效"],
  );

  elements.specimenCanvas.querySelectorAll("[data-evidence-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.evidenceAction;
      if (action === "toggle-stale") {
        state.stale = !state.stale;
        state.gate = state.stale ? "invalidated" : "not-run";
        state.message = state.stale
          ? `${publicationGateFixture.invalidationReason}；旧Gate失效。已发布Revision保持不可变，新的发布需要刷新Evidence并完成：${publicationGateFixture.revalidationRequirements.join("、")}。`
          : "Snapshot已恢复为当前版本；必须重新运行Gate。";
      }
      if (action === "run-gate" && !state.stale) {
        state.gate = "passed";
        state.message = `Gate已针对${publicationGateFixture.subjectId} r${publicationGateFixture.revision}、${publicationGateFixture.evidenceSnapshot}、${publicationGateFixture.policyVersion}和${publicationGateFixture.permissionVersion}通过；尚未发布。`;
      }
      if (action === "publish" && state.gate === "passed" && !state.stale) {
        state.published = true;
        state.message = `${publicationGateFixture.subjectId} r${publicationGateFixture.revision}已发布。后续修改必须创建新Revision或Branch。`;
      }
      renderEvidenceSpecimen();
    });
  });
}

function planNodeState(step, threshold, partial = false) {
  if (step < threshold) return "Ready";
  if (partial && step >= threshold) return "Partial";
  return "Verified";
}

function renderPlanSpecimen() {
  const state = appState.plan;
  const nodes = [
    { name: "基础KPI", detail: "Certified Result", status: planNodeState(state.step, 1) },
    { name: "Entity排名", detail: "Ranking & variance", status: planNodeState(state.step, 2) },
    { name: "变化归因", detail: "Attribution Playbook", status: planNodeState(state.step, 3, true) },
  ];
  elements.specimenCanvas.innerHTML = `
    <div class="specimen-frame">
      <header><span>PLAN & PROGRESS · ANL-118</span><span class="fixture-label">STEP-DRIVEN FIXTURE</span></header>
      <div class="specimen-body">
        <ol class="plan-list">
          ${nodes
            .map(
              (node, index) => `
                <li class="plan-node">
                  <span class="node-index">0${index + 1}</span>
                  <span><b>${escapeHtml(node.name)}</b><small>${escapeHtml(node.detail)}</small></span>
                  <span class="state-badge ${node.status === "Partial" ? "risk" : node.status === "Verified" ? "validation" : "workflow"}">${escapeHtml(node.status)}</span>
                </li>
              `,
            )
            .join("")}
        </ol>
        ${
          state.step >= 3
            ? `
              <div class="degradation" role="status">
                <strong>归因分析未能完成。</strong>
                <p>缺少Q1 baseline，充分性检查未通过。基础KPI与Entity排名仍然Verified。需要补充已关账数据，或先查看排名下钻。</p>
              </div>
            `
            : ""
        }
        <div class="specimen-actions">
          <button class="button primary" type="button" data-plan-action="advance" ${state.step >= 3 ? "disabled" : ""}>推进下一个Fixture事件</button>
          <button class="button secondary" type="button" data-plan-action="reset" ${state.step === 0 ? "disabled" : ""}>重置Fixture</button>
        </div>
        <div class="status-message" role="status">步骤 ${state.step} / 3 · 每次点击对应一个明确Fixture事件，不使用计时器伪造Verified。</div>
      </div>
    </div>
  `;
  elements.specimenInspector.innerHTML = inspectorHtml(
    specimenMeta[2],
    [
      `Base Result · ${nodes[0].status}`,
      `Ranking · ${nodes[1].status}`,
      `Attribution · ${nodes[2].status}`,
    ],
    ["基础结果先返回", "Partial保留Verified Work", "Degradation回答五个固定问题"],
  );

  elements.specimenCanvas.querySelectorAll("[data-plan-action]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.planAction === "advance" && state.step < 3) state.step += 1;
      if (button.dataset.planAction === "reset") state.step = 0;
      renderPlanSpecimen();
    });
  });
}

const actionStages = ["proposed", "preflight", "awaiting", "approved", "queued", "executing", "succeeded"];
const actionStageLabels = {
  proposed: "Proposed",
  preflight: "Preflight Ready",
  awaiting: "Awaiting Approval",
  approved: "Approved",
  queued: "Queued",
  executing: "Executing",
  succeeded: "Succeeded",
};
const actionNextLabels = {
  proposed: "运行Preflight",
  preflight: "提交审批",
  awaiting: "批准",
  approved: "加入执行队列",
  queued: "执行模拟",
  executing: "记录Outcome",
  succeeded: "已完成",
};

function renderActionSpecimen() {
  const state = appState.action;
  const activeIndex = actionStages.indexOf(state.stage);
  const denied = state.permission === "denied";
  const nextDisabled = denied || state.stage === "succeeded";
  elements.specimenCanvas.innerHTML = `
    <div class="specimen-frame">
      <header><span>CONTROLLED ACTION · ACT-077</span><span class="fixture-label">NO EXTERNAL ACTION</span></header>
      <div class="specimen-body">
        <div class="decision-card">
          <header>
            <span class="micro-label">ACTION PROPOSAL</span>
            <h3>准备3条记录的修复动作</h3>
          </header>
          <dl class="decision-meta">
            <dt>依据</dt><dd><span class="state-badge validation">Evidence Verified</span> · DEC-052</dd>
            <dt>Permission</dt><dd><span class="state-badge ${denied ? "blocking" : "permission"}">${denied ? "Denied" : "Allowed"} · PERM-88</span></dd>
            <dt>Policy</dt><dd>POL-17 v6 · execute requires approval</dd>
            <dt>影响</dt><dd>3 records · reversible · 5 minute window</dd>
            <dt>Workflow</dt><dd><span class="state-badge workflow">${escapeHtml(actionStageLabels[state.stage])}</span></dd>
          </dl>
          <footer>
            <div class="lifecycle-mini">
              ${actionStages
                .map((stage, index) => {
                  const cls = index < activeIndex ? "completed" : index === activeIndex ? "active" : "";
                  return `<span class="${cls}">${escapeHtml(actionStageLabels[stage])}</span>`;
                })
                .join("")}
            </div>
            <div class="specimen-actions">
              <button class="button secondary" type="button" data-action-demo="toggle-permission">${denied ? "切换为Allowed" : "模拟Permission Denied"}</button>
              <button class="button primary" type="button" data-action-demo="advance" ${nextDisabled ? "disabled" : ""}>${escapeHtml(actionNextLabels[state.stage])}</button>
              <button class="button secondary" type="button" data-action-demo="reset" ${state.stage === "proposed" && !denied ? "disabled" : ""}>重置Action</button>
            </div>
          </footer>
        </div>
        <div class="status-message ${denied ? "blocked" : ""}" role="status">${escapeHtml(state.message)}</div>
      </div>
    </div>
  `;
  elements.specimenInspector.innerHTML = inspectorHtml(
    specimenMeta[3],
    [
      "Evidence · Verified",
      `Permission · ${denied ? "Denied" : "Allowed"}`,
      "Risk · Low / Reversible",
      `Workflow · ${actionStageLabels[state.stage]}`,
    ],
    ["High Confidence + Denied仍阻断", "Approve与Execute分开", "Outcome由独立事件记录"],
  );

  elements.specimenCanvas.querySelectorAll("[data-action-demo]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.actionDemo;
      if (action === "toggle-permission") {
        state.permission = denied ? "allowed" : "denied";
        state.stage = "proposed";
        state.message =
          state.permission === "denied"
            ? "即使Evidence Verified且Risk较低，Permission Denied仍阻断Preflight。"
            : "Permission恢复Allowed；Action仍只是Proposal，必须重新Preflight。";
      }
      if (action === "advance" && state.permission === "allowed" && state.stage !== "succeeded") {
        const currentIndex = actionStages.indexOf(state.stage);
        state.stage = actionStages[currentIndex + 1];
        state.message = {
          preflight: "Preflight通过；尚未提交审批。",
          awaiting: "已提交审批；尚未Approved。",
          approved: "Approval Receipt已生成；尚未Queued或Executed。",
          queued: "Action已加入Fixture Queue；尚未改变外部状态。",
          executing: "Fixture显示Executing；下一步记录真实Outcome。",
          succeeded: "Outcome Receipt记录Succeeded。本演示没有外部写入。",
        }[state.stage];
      }
      if (action === "reset") {
        state.permission = "allowed";
        state.stage = "proposed";
        state.message = "Action只是Proposal，尚未获得授权。";
      }
      renderActionSpecimen();
    });
  });
}

const ruleStages = ["candidate", "drafted", "validated", "approved", "staged", "active"];
const ruleStageLabels = {
  candidate: "Candidate",
  drafted: "Drafted",
  validated: "Validated",
  approved: "Approved",
  staged: "Staged",
  active: "Active",
  rejected: "Rejected",
};
const ruleNextLabels = {
  candidate: "完善Rule Draft",
  drafted: "运行回放与冲突验证",
  validated: "提交SoD审批",
  approved: "进入Staged",
  staged: "激活未来Scope",
  active: "已Active",
};

function renderRuleSpecimen() {
  const state = appState.rule;
  const displayedStage = state.rejected ? "rejected" : state.stage;
  const activeIndex = state.rejected ? -1 : ruleStages.indexOf(state.stage);
  const canAdvance = !state.rejected && state.stage !== "active";
  const canReject = !state.rejected && !["active"].includes(state.stage);
  elements.specimenCanvas.innerHTML = `
    <div class="specimen-frame">
      <header><span>RULE PROPOSAL · RPROP-204</span><span class="fixture-label">FUTURE CASES ONLY</span></header>
      <div class="specimen-body">
        <div class="receipt-table">
          <div class="receipt-row"><span>Current Case</span><span>CASE-204 · handled by human Decision DEC-057</span></div>
          <div class="receipt-row"><span>Existing basis</span><span>POL-17 v6 + EVD-204 · not the proposed rule</span></div>
          <div class="receipt-row"><span>Candidate</span><span>RPROP-204 · owner: Rule Owner</span></div>
          <div class="receipt-row"><span>Validation</span><span>Historical replay · counterexamples · conflict scan</span></div>
          <div class="receipt-row"><span>SoD</span><span>Proposer ≠ Approver · required before Stage</span></div>
          <div class="receipt-row"><span>Impact</span><span>${state.stage === "active" && !state.rejected ? "Future matching Cases only" : "None · no Case is affected"}</span></div>
        </div>
        <div class="lifecycle-mini">
          ${ruleStages
            .map((stage, index) => {
              const cls = !state.rejected && index < activeIndex ? "completed" : !state.rejected && index === activeIndex ? "active" : "";
              return `<span class="${cls}">${escapeHtml(ruleStageLabels[stage])}</span>`;
            })
            .join("")}
        </div>
        <div class="specimen-actions">
          <button class="button primary" type="button" data-rule-action="advance" ${!canAdvance ? "disabled" : ""}>${escapeHtml(state.rejected ? "已Rejected" : ruleNextLabels[state.stage])}</button>
          <button class="button danger" type="button" data-rule-action="reject" ${!canReject ? "disabled" : ""}>Reject Candidate</button>
          <button class="button secondary" type="button" data-rule-action="reset" ${state.stage === "candidate" && !state.rejected ? "disabled" : ""}>重置Candidate</button>
        </div>
        <div class="status-message ${state.rejected ? "blocked" : ""}" role="status">${escapeHtml(state.message)}</div>
      </div>
    </div>
  `;
  elements.specimenInspector.innerHTML = inspectorHtml(
    specimenMeta[4],
    [
      `Rule Workflow · ${ruleStageLabels[displayedStage]}`,
      `Current Case · Unchanged`,
      `Future Scope · ${state.stage === "active" && !state.rejected ? "Enabled" : "No impact"}`,
    ],
    ["Candidate不作为当前Case依据", "Approval前无Active状态", "Reject不保留派生效果"],
  );

  elements.specimenCanvas.querySelectorAll("[data-rule-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.ruleAction;
      if (action === "advance" && canAdvance) {
        const currentIndex = ruleStages.indexOf(state.stage);
        state.stage = ruleStages[currentIndex + 1];
        state.message = {
          drafted: "Draft已完善；仍未验证、未审批、未生效。",
          validated: "回放、反例和冲突扫描完成；仍未审批、未生效。",
          approved: "独立SoD Approval完成；Rule仍未Staged或Active。",
          staged: "Rule进入Staged / Shadow；只观察，不影响真实Case。",
          active: "Rule已Active，仅影响未来符合Scope的Case；保留Monitor与Kill Switch。",
        }[state.stage];
      }
      if (action === "reject" && canReject) {
        state.rejected = true;
        state.message = "Candidate已Rejected；没有Rule Active，也没有任何自动化范围变化。";
      }
      if (action === "reset") {
        state.stage = "candidate";
        state.rejected = false;
        state.message = "当前只创建了Candidate；不会影响任何Case。";
      }
      renderRuleSpecimen();
    });
  });
}

function renderCapabilitySpecimen() {
  const state = appState.capability;
  const ready = state.scope === "complete" && state.permission === "current" && state.status === "available";
  const capabilityStatus =
    state.status === "suspended"
      ? "Suspended"
      : state.scope === "missing"
        ? "Scope Missing"
        : state.permission === "drift"
          ? "Permission Drift"
          : "Complete";
  elements.specimenCanvas.innerHTML = `
    <div class="specimen-frame">
      <header><span>CAPABILITY SNAPSHOT · CAP-031 v4</span><span class="fixture-label">DECLARATION · NOT AUTHORIZATION</span></header>
      <div class="specimen-body">
        <div class="receipt-table">
          <div class="receipt-row"><span>Owner / Version</span><span>Finance Automation Platform · CAP-031 v4</span></div>
          <div class="receipt-row"><span>Scope</span><span>${state.scope === "missing" ? "Missing · target scope unavailable" : "Entity planning workspace · approved data domain"}</span></div>
          <div class="receipt-row"><span>Declared actions</span><span>Read · Prepare update · Submit for approval</span></div>
          <div class="receipt-row"><span>Risk / Recovery</span><span>Moderate · reversible before settlement · compensation after</span></div>
          <div class="receipt-row"><span>Policy / Permission</span><span>${state.permission === "drift" ? "POL-17 v7 · snapshot expects v6" : "POL-17 v6 · PERM-88 current"}</span></div>
          <div class="receipt-row"><span>Receipt / Escalation</span><span>Execution Receipt · Process Owner</span></div>
          <div class="receipt-row"><span>Capability status</span><span><span class="state-badge ${ready ? "validation" : "blocking"}">${escapeHtml(capabilityStatus)}</span></span></div>
        </div>
        <div class="specimen-actions">
          <button class="button secondary" type="button" data-capability-action="scope">${state.scope === "missing" ? "恢复Scope" : "模拟Scope缺失"}</button>
          <button class="button secondary" type="button" data-capability-action="permission">${state.permission === "drift" ? "更新Permission Snapshot" : "模拟Permission漂移"}</button>
          <button class="button danger" type="button" data-capability-action="suspend">${state.status === "suspended" ? "恢复Capability" : "模拟Suspended"}</button>
          <button class="button primary" type="button" data-capability-action="preflight" ${!ready ? "disabled" : ""}>进入Action Preflight</button>
        </div>
        <div class="status-message ${ready ? "" : "blocked"}" role="status">${escapeHtml(state.message)}</div>
      </div>
    </div>
  `;
  elements.specimenInspector.innerHTML = inspectorHtml(
    specimenMeta[5],
    [
      `Capability · ${capabilityStatus}`,
      `Permission · ${state.permission === "drift" ? "Conditional / stale snapshot" : "Current snapshot"}`,
      "Autonomy · Prepare",
      "Workflow · Proposal only",
    ],
    ["Capability状态不推出Permission", "Complete不等于Approved", "失效时隐藏Execute但保留Proposal与升级路径"],
  );

  elements.specimenCanvas.querySelectorAll("[data-capability-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.capabilityAction;
      if (action === "scope") {
        state.scope = state.scope === "missing" ? "complete" : "missing";
        state.message =
          state.scope === "missing"
            ? "Scope缺失；保留Action Proposal，但不显示可执行控制。"
            : "Scope已恢复；仍需检查Permission、Policy与Risk。";
      }
      if (action === "permission") {
        state.permission = state.permission === "drift" ? "current" : "drift";
        state.message =
          state.permission === "drift"
            ? "Permission Snapshot漂移；旧Preflight失效，必须重新校验。"
            : "Permission Snapshot已更新；Capability仍不等于授权。";
      }
      if (action === "suspend") {
        state.status = state.status === "suspended" ? "available" : "suspended";
        state.message =
          state.status === "suspended"
            ? "Capability已Suspended；路由到Process Owner，当前Action不可执行。"
            : "Capability已恢复Available；仍需独立Action Gate。";
      }
      if (action === "preflight" && ready) {
        state.message = "已进入Action Preflight；将针对Actor、Target、Parameters、Policy、Permission和Risk重新校验，尚未Approved或Executed。";
      }
      renderCapabilitySpecimen();
    });
  });
}

function renderSpecimen() {
  const renderers = {
    patch: renderPatchSpecimen,
    evidence: renderEvidenceSpecimen,
    plan: renderPlanSpecimen,
    action: renderActionSpecimen,
    rule: renderRuleSpecimen,
    capability: renderCapabilitySpecimen,
  };
  renderers[appState.selectedSpecimen]();
}

function renderPatternAnatomy() {
  elements.patternAnatomy.innerHTML = patternAnatomyData
    .map(
      (item) => `
        <article class="anatomy-card"><span>${escapeHtml(item.code)}</span><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.text)}</p></article>
      `,
    )
    .join("");
}

function renderJourney() {
  const steps = journeyData[appState.selectedJourney];
  if (appState.journeyStep >= steps.length) appState.journeyStep = steps.length - 1;
  document.querySelectorAll("[data-journey-option]").forEach((button) => {
    const selected = button.dataset.journeyOption === appState.selectedJourney;
    button.setAttribute("aria-selected", String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
  elements.journeyTrace.innerHTML = steps
    .map(
      (step, index) => `
        <button
          type="button"
          data-journey-step="${index}"
          class="${index === appState.journeyStep ? "active" : index < appState.journeyStep ? "completed" : ""}"
          ${index === appState.journeyStep ? 'aria-current="step"' : ""}
        >${escapeHtml(step.title)}</button>
      `,
    )
    .join("");
  const step = steps[appState.journeyStep];
  elements.journeyStepPanel.innerHTML = `
    <header>
      <span class="step-number">${escapeHtml(step.id)}</span>
      <h3>${escapeHtml(step.title)}</h3>
      <span class="object-chip">${escapeHtml(step.object)}</span>
    </header>
    <div class="journey-step-grid">
      <section><span>HUMAN RESPONSIBILITY</span><p>${escapeHtml(step.human)}</p></section>
      <section><span>SYSTEM RESPONSIBILITY</span><p>${escapeHtml(step.system)}</p></section>
      <section><span>EVIDENCE / POLICY</span><p>${escapeHtml(step.evidence)}</p></section>
      <section><span>AVAILABLE CONTROLS</span><p>${escapeHtml(step.controls)}</p></section>
      <section><span>DEGRADATION</span><p>${escapeHtml(step.degradation)}</p></section>
      <section><span>STABLE ARTIFACT</span><p>${escapeHtml(step.artifact)}</p></section>
    </div>
  `;
  elements.journeyPosition.textContent = `${appState.journeyStep + 1} / ${steps.length}`;
  elements.journeyPrev.disabled = appState.journeyStep === 0;
  elements.journeyNext.disabled = appState.journeyStep === steps.length - 1;
  elements.journeyTrace.querySelectorAll("[data-journey-step]").forEach((button) => {
    button.addEventListener("click", () => {
      appState.journeyStep = Number(button.dataset.journeyStep);
      renderJourney();
    });
  });
}

function renderHandoffEnvelope() {
  elements.handoffEnvelope.innerHTML = handoffFields
    .map(
      (field) => `
        <article class="envelope-field">
          <span>${escapeHtml(field.name)}</span>
          <strong>${escapeHtml(field.value)}</strong>
          <p>${escapeHtml(field.description)}</p>
        </article>
      `,
    )
    .join("");
}

function renderAcceptance() {
  elements.acceptanceGrid.innerHTML = acceptanceData
    .map(
      (item) => `
        <article class="acceptance-card"><span>${escapeHtml(item.code)}</span><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.text)}</p></article>
      `,
    )
    .join("");
  elements.readerMetrics.innerHTML = readerMetrics
    .map(
      (item) => `
        <article class="reader-metric"><strong>${escapeHtml(item.value)}</strong><b>${escapeHtml(item.name)}</b><p>${escapeHtml(item.text)}</p></article>
      `,
    )
    .join("");
  elements.experienceSignals.innerHTML = experienceSignalData
    .map(
      (item) => `
        <article class="experience-signal-card">
          <h3>${escapeHtml(item.promise)}</h3>
          <div><span>LEADING</span><p>${escapeHtml(item.leading)}</p></div>
          <div><span>OUTCOME</span><p>${escapeHtml(item.outcome)}</p></div>
        </article>
      `,
    )
    .join("");
  elements.workstreamGrid.innerHTML = workstreamData
    .map(
      (item) => `
        <article class="workstream-card"><span>${escapeHtml(item.code)}</span><h3>${escapeHtml(item.name)}</h3>${list(item.items)}</article>
      `,
    )
    .join("");
  elements.adoptionPath.innerHTML = adoptionPathData
    .map(
      (item) => `
        <li><span>${escapeHtml(item.phase)}</span><div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.text)}</p></div></li>
      `,
    )
    .join("");
  elements.lockedDecisions.innerHTML = lockedDecisions.map((decision) => `<li><span>${escapeHtml(decision)}</span></li>`).join("");
}

function bindTabButtons(container, selector, onSelect) {
  const buttons = [...container.querySelectorAll(selector)];
  buttons.forEach((button, index) => {
    button.addEventListener("click", () => onSelect(button));
    button.addEventListener("keydown", (event) => {
      let nextIndex = null;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (index + 1) % buttons.length;
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (index - 1 + buttons.length) % buttons.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = buttons.length - 1;
      if (nextIndex === null) return;
      event.preventDefault();
      buttons[nextIndex].focus();
      onSelect(buttons[nextIndex]);
    });
  });
}

function bindStaticControls() {
  elements.menuButton.addEventListener("click", () => setSidebar(!elements.sidebar.classList.contains("open")));
  elements.sidebarBackdrop.addEventListener("click", () => setSidebar(false));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setSidebar(false);
  });

  document.querySelectorAll("[data-density-option]").forEach((button) => {
    button.addEventListener("click", () => setDensity(button.dataset.densityOption));
  });

  elements.modeToggle?.addEventListener("click", () => {
    setMode(elements.body.dataset.mode === "dark" ? "light" : "dark");
  });
  document.addEventListener("eix-mode-change", (event) => setMode(event.detail?.mode, false));

  document.querySelectorAll("[data-document-id]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      window.location.hash = documentRouteUrl(link.dataset.documentId);
    });
  });

  elements.documentBack.addEventListener("click", () => {
    window.location.hash = `#/${currentDocumentRequest().from}`;
  });

  document.querySelectorAll("[data-contract-option]").forEach((button, index, buttons) => {
    button.addEventListener("click", () => {
      appState.selectedContract = button.dataset.contractOption;
      renderContract();
    });
    button.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const next = buttons[(index + direction + buttons.length) % buttons.length];
      appState.selectedContract = next.dataset.contractOption;
      renderContract();
      next.focus();
    });
  });

  document.querySelectorAll("[data-pattern-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      appState.patternFilter = button.dataset.patternFilter;
      window.location.hash =
        appState.patternFilter === "all" ? "#/guidance" : `#/guidance/${appState.patternFilter}`;
    });
  });

  document.querySelectorAll("[data-journey-option]").forEach((button, index, buttons) => {
    button.addEventListener("click", () => {
      appState.selectedJourney = button.dataset.journeyOption;
      appState.journeyStep = 0;
      renderJourney();
    });
    button.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const next = buttons[(index + direction + buttons.length) % buttons.length];
      appState.selectedJourney = next.dataset.journeyOption;
      appState.journeyStep = 0;
      renderJourney();
      next.focus();
    });
  });

  elements.journeyPrev.addEventListener("click", () => {
    if (appState.journeyStep > 0) {
      appState.journeyStep -= 1;
      renderJourney();
    }
  });
  elements.journeyNext.addEventListener("click", () => {
    const steps = journeyData[appState.selectedJourney];
    if (appState.journeyStep < steps.length - 1) {
      appState.journeyStep += 1;
      renderJourney();
    }
  });

  window.addEventListener("hashchange", () => renderRoute({ focusMain: true }));
}

function initialize() {
  initializeDesignSystemTheme();
  try {
    const savedDensity = localStorage.getItem("eix-density");
    if (savedDensity === "deep" || savedDensity === "brief") appState.density = savedDensity;
  } catch {
    // Device-local preference is optional.
  }
  setMode(elements.body.dataset.mode, false);

  renderKernelTrace();
  renderPromises();
  renderLayers();
  renderKernelExplorer();
  renderContract();
  renderSemanticAxes();
  renderLifecycles();
  renderFamilies();
  renderPatterns();
  renderGuidanceFlows();
  renderSpecimenTabs();
  renderSpecimen();
  renderPatternAnatomy();
  renderJourney();
  renderHandoffEnvelope();
  renderAcceptance();
  bindStaticControls();
  setDensity(appState.density);
  renderRoute();

}

initialize();
