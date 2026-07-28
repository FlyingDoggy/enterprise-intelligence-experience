import { catalogRegistry } from "./src/catalog.js";
import { taskProjectionData } from "./src/architecture-data.js";
import {
  acceptanceProtocols,
  conformancePaths,
  journeyConformanceRefs,
} from "./src/conformance-data.js";
import { initializeDesignSystemTheme, renderDesignSystemRoute } from "./src/design-system-renderer.js";
import {
  canonicalPatternCoverage,
  guidanceGroupMeta,
  guidanceGroups,
  guidancePatterns,
} from "./src/guidance-data.js";
import { bindGuidanceSpecimen, guidanceSpecimenHtml } from "./src/guidance-specimens.js";

/**
 * EIX 2.0 Rev 0.5 static reference.
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
 * @typedef {Object} SemanticField
 * @property {string} id
 * @property {string} name
 * @property {string} question
 * @property {string} description
 * @property {string[]} values
 * @property {string} color
 */

/**
 * @typedef {Object} LifecycleSpec
 * @property {string} id
 * @property {string} name
 * @property {string} subject
 * @property {{label:string, kind?:string, qualifier?:string}[]} steps
 * @property {{label:string, kind:string, items:string[], note:string}[]} branches
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
    id: "goal",
    code: "GOAL",
    name: "Goal",
    question: "本次工作要回答、建立或改变什么？",
    definition: "用户或组织希望本次工作满足的目标与判断条件。Goal可以是“得到可信答案”，不必总是业务KPI改善。",
    visible: ["Goal statement", "Resolution criteria", "Owner与Audience", "Scope与Constraints"],
    governance: "Goal变化产生新Revision；不得用用户离开或系统完成输出代替Goal Resolution。",
  },
  {
    id: "context",
    code: "CONTEXT",
    name: "Context",
    question: "AI正在使用哪些信息、规则和历史？",
    definition: "与当前工作相关且获得授权的业务语义、流程状态、数据、文档、知识、规则和历史。",
    visible: ["Source与Freshness", "Permission Scope", "Session / Memory边界", "Remove与Correct"],
    governance: "Context可查看、纠正和追溯；持久化必须有明确Owner和Scope。",
  },
  {
    id: "plan",
    code: "PLAN",
    name: "Plan",
    question: "为了实现Goal，系统准备按什么路径工作？",
    definition: "复杂任务需要的可检查路径。简单问答无需为了满足框架而创建Plan。",
    visible: ["Ready / Conditional / Blocked", "Dependencies", "Owner", "Next Step"],
    governance: "AI可以推荐Plan；超出Scope或需要高风险Action的节点必须重新确认。",
  },
  {
    id: "evidence",
    code: "EVIDENCE",
    name: "Evidence",
    question: "Result、Claim或Decision建立在什么依据上？",
    definition: "能够回到数据、文档、规则、事件或执行记录的可验证依据。",
    visible: ["Source与Semantic Version", "Method", "Scope与Freshness", "Status与Limitation"],
    governance: "Evidence Status不推出Permission或Autonomy；变化会使相关Gate Decision失效。",
  },
  {
    id: "result",
    code: "RESULT",
    name: "Work Result",
    question: "系统本次实际交付了什么？",
    definition: "由某个Work Object Revision产生、可引用且不可静默改写的输出记录，例如直接回答、计算结果、分析块或草稿。",
    visible: ["Result ID与Revision", "Kind与Content", "Scope与Freshness", "Evidence Refs与Limitations"],
    governance: "Result不自动等于Artifact、Decision、Action或Business Outcome；后续工作引用它，而不是回写它。",
  },
  {
    id: "resolution",
    code: "GOAL RESOLUTION",
    name: "Goal Resolution",
    question: "本次Goal的判断条件是否已经满足？",
    definition: "绑定Goal Revision与Result Revision的版本化评估；Assessment与Observation Basis分别记录。",
    visible: ["Goal criteria", "Assessment status", "Observation basis", "Assessed by / at"],
    governance: "系统可以依据明确条件评估；用户离开只表示Unobserved，不能推断成功。",
  },
  {
    id: "artifact",
    code: "ARTIFACT",
    name: "Artifact",
    question: "Result是否需要被整理、版本化并面向受众发布？",
    definition: "可选的稳定工作产物，例如Brief、Analysis Document、研究板或方案稿；它可以打包一个或多个Result。",
    visible: ["Artifact ID与Revision", "Audience", "Source Result Refs", "Publication State"],
    governance: "只有存在复用、协作或发布需要时才创建；Artifact不可重新发明Result里的事实。",
  },
  {
    id: "decision",
    code: "DECISION",
    name: "Decision",
    question: "选择了什么、为什么、由谁负责？",
    definition: "由Evidence和业务判断形成的明确选择，包含Option、Alternative、Rationale和Owner。",
    visible: ["Selected Option", "Alternatives", "Evidence", "Owner与Approval"],
    governance: "Recommendation不是Decision；Decision变化产生新Revision，不重写历史。",
  },
  {
    id: "action",
    code: "ACTION",
    name: "Action",
    question: "什么将改变外部状态，影响是什么？",
    definition: "调用工具、Agent或业务系统改变外部状态的受控操作。",
    visible: ["Actor与Target", "Parameters与Scope", "Permission与Policy", "Risk与Reversibility"],
    governance: "严格区分Prepare、Approve、Queue和Execute；执行前重新校验治理快照。",
  },
  {
    id: "business-outcome",
    code: "BUSINESS OUTCOME",
    name: "Business Outcome",
    question: "真实业务状态是否在观察窗口内发生变化？",
    definition: "只在真实Action或Process后，由System of Record证明的业务后置条件；与Action执行状态分开。",
    visible: ["Linked Action / Case", "Expected vs Observed", "System of Record", "Observation Window"],
    governance: "Action Succeeded不自动推出业务改善；无法观察时保持Pending或Inconclusive。",
  },
  {
    id: "feedback",
    code: "FEEDBACK",
    name: "Feedback",
    question: "这次工作应怎样修正当前任务或改进系统？",
    definition: "来自用户、业务结果、系统执行和评估机制的改进信号。",
    visible: ["Signal Type", "Scope", "Destination", "Proposed Change与Owner"],
    governance: "区分Correction、Memory Proposal、Rule Proposal和Model Feedback。",
  },
];

const kernelDistinctionData = [
  { id: "result", title: "Work Result", when: "系统产生输出时", owns: "内容、范围、依据与限制", not: "不自动等于可发布文档" },
  { id: "artifact", title: "Artifact", when: "需要复用、协作或发布时", owns: "打包、受众、Revision与发布", not: "不重新定义Result里的事实" },
  { id: "resolution", title: "Goal Resolution", when: "判断本次任务是否满足时", owns: "Goal criteria与观察依据", not: "用户离开不等于成功" },
  { id: "business-outcome", title: "Business Outcome", when: "真实Action或Process之后", owns: "System-of-record业务后置条件", not: "Action Succeeded不等于业务改善" },
];

const objectLineageData = [
  { id: "root", type: "Root", ref: "ROOT-018", state: "Active", parent: "", purpose: "维持Goal、Owner和跨对象连续性。", lifecycle: "Root自身不冒充子对象生命周期。" },
  { id: "analysis", type: "Analysis", ref: "ANL-118 r4", state: "Result Ready", parent: "ROOT-018", purpose: "产生可验证分析Result。", lifecycle: "Analysis工作状态。" },
  { id: "result", type: "Work Result", ref: "RSLT-118 r1", state: "Delivered", parent: "ANL-118 r4", purpose: "保存不可静默改写的计算与Claim。", lifecycle: "无独立流程；通过Revision引用。" },
  { id: "artifact", type: "Artifact", ref: "ART-052 r3", state: "Published", parent: "RSLT-118 r1", purpose: "把Result整理成Audience Brief。", lifecycle: "Publication lifecycle。" },
  { id: "decision", type: "Decision", ref: "DEC-052 r1", state: "Confirmed", parent: "RSLT-118 r1", purpose: "记录Owner作出的明确选择。", lifecycle: "Decision record state。" },
  { id: "action", type: "Action", ref: "ACT-077 r2", state: "Succeeded", parent: "DEC-052 r1", purpose: "记录受控外部改变及执行事实。", lifecycle: "Action lifecycle，结束于执行状态。" },
  { id: "business-outcome", type: "Business Outcome", ref: "BOUT-077 r1", state: "Pending Observation", parent: "ACT-077 r2", purpose: "等待System of Record证明业务后置条件。", lifecycle: "独立观察记录，不回写Action。" },
];

const routeMeta = {
  brief: {
    title: "Experience Narrative",
    description: "管理层与首次接触者的5分钟入口。",
    status: "COMPANION",
    statusClass: "companion",
    rail: "5分钟",
    railDescription: "Experience Narrative",
    invariant: "工作围绕稳定对象持续",
  },
  architecture: {
    title: "Canonical Architecture",
    description: "五层架构、跨层机制与两种人机协作约定。",
    status: "CANONICAL",
    statusClass: "canonical",
    rail: "架构",
    railDescription: "Canonical Charter",
    invariant: "层级、机制与生命周期各自明确",
  },
  "design-system": {
    title: "EIX Core Design System",
    description: "通用视觉基础、布局原语、组件与实现规范。",
    status: "CANDIDATE STANDARD",
    statusClass: "candidate",
    rail: "系统",
    railDescription: "Core Design System",
    invariant: "通用组件不承载业务生命周期",
  },
  guidance: {
    title: "Intelligence UX Guidance",
    description: "面向流程自动化与知识协作场景的交互规则和Pattern。",
    status: "CANDIDATE COMPANION",
    statusClass: "candidate",
    rail: "指导",
    railDescription: "Two Intelligence Contracts",
    invariant: "Pattern引用Canonical架构",
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
    description: "展示Result、Decision、Action和Case如何交接并保留Trace。",
    status: "COMPANION",
    statusClass: "companion",
    rail: "Journeys",
    railDescription: "Controlled Handoffs",
    invariant: "关联对象保留独立状态",
  },
  acceptance: {
    title: "Experience Acceptance",
    description: "理解、控制、恢复、可访问性与采用验收。",
    status: "CANONICAL",
    statusClass: "canonical",
    rail: "验收",
    railDescription: "Experience Gate",
    invariant: "所有状态变化均有明确记录",
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
    identity: "CANONICAL · CONCEPT CHARTER · REV 0.5",
    routeIdentity: "CANONICAL SOURCE",
    status: "CANONICAL",
    statusClass: "canonical",
  },
  narrative: {
    file: "EIX_2.0_EXPERIENCE_NARRATIVE.md",
    title: "EIX 2.0 Experience Narrative",
    description: "面向管理层与首次接触者的五分钟体验说明。",
    identity: "COMPANION · EXPERIENCE NARRATIVE · REV 0.5",
    routeIdentity: "COMPANION DOCUMENT",
    status: "COMPANION",
    statusClass: "companion",
  },
  "design-system": {
    file: "EIX_2.0_CORE_DESIGN_SYSTEM.md",
    title: "EIX Core Design System",
    description: "品牌中性的Token、Foundation、Primitive、Component与工程化治理标准。",
    identity: "CANDIDATE STANDARD · CORE DESIGN SYSTEM · REV 0.5",
    routeIdentity: "CANDIDATE STANDARD",
    status: "CANDIDATE",
    statusClass: "candidate",
  },
  guidance: {
    file: "EIX_2.0_INTELLIGENCE_UX_GUIDANCE.md",
    title: "Intelligence UX Guidance",
    description: "Process Intelligence与Collaborative Intelligence的领域体验指导。",
    identity: "CANDIDATE COMPANION · UX GUIDANCE · REV 0.5",
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
  rev05: {
    file: "EIX_2.0_REV_0.5_DECISION_RECORD.md",
    title: "EIX 2.0 Rev 0.5 Decision Record",
    description: "记录Kernel从固定序列改为任务投影关系模型，以及Result、Artifact、Goal Resolution与Business Outcome的边界。",
    identity: "DECISION RECORD · REV 0.5",
    routeIdentity: "CANONICAL CHANGE RECORD",
    status: "COMPANION",
    statusClass: "companion",
  },
  patterns: {
    file: "EIX_2.0_PATTERN_SPECIMEN_LIBRARY.md",
    title: "Pattern Specimen Library Migration",
    description: "旧Pattern文档的兼容入口与Rev 0.2归档路径。",
    identity: "MIGRATION NOTICE · REV 0.5",
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
    promise: "当前目标、口径和状态始终可见。",
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
    promise: "正常路径保持安静，只有需要判断的Exception请求我的注意。",
  },
];

const architectureLayers = [
  {
    code: "L5",
    name: "Experience Outcomes",
    cn: "体验结果",
    detail: "Clarity · Trust · Control · Momentum · Continuity · Calm",
    owner: "UX Research · Product · Business",
    output: "可衡量的任务与体验结果",
    target: "architecture-outcomes",
    expands: "用户最终感受到什么，以及如何验证",
  },
  {
    code: "L4",
    name: "Canonical Surfaces",
    cn: "稳定工作界面",
    detail: "Home · Inbox · Case · Mission · Analysis · Decision · Control Tower",
    owner: "Product · UX · Engineering",
    output: "稳定工作面与Reference Composition",
    target: "architecture-surfaces",
    expands: "工作对象出现在哪里，界面承担什么责任",
  },
  {
    code: "L3",
    name: "Interaction Contracts",
    cn: "人机协作约定",
    detail: "Process Intelligence · Collaborative Intelligence",
    owner: "Product · UX · Governance",
    output: "人机责任、状态、控制与反馈约定",
    target: "architecture-contracts",
    expands: "谁发起、谁判断、谁推进、何时停下",
  },
  {
    code: "L2",
    name: "Shared Experience Kernel",
    cn: "共享工作模型",
    detail: "Goal与Context为起点；Result与Resolution形成最短闭环；其余记录按任务需要关联",
    owner: "Product · UX · Platform",
    output: "关系模型、任务投影与共享记录契约",
    target: "architecture-kernel",
    expands: "工作需要记录什么，以及对象如何保持连续",
    kernel: true,
  },
  {
    code: "L1",
    name: "Enterprise Intelligence Foundation",
    cn: "企业智能基础",
    detail: "业务概念与口径 · Models · Agents · Tools · Systems · Identity · Governance",
    owner: "Architecture · AI · Data · Security",
    output: "系统能力、语义与政策",
    target: "architecture-foundation",
    expands: "能力、数据、身份与治理约束",
  },
];

const architectureNavigationGroups = [
  {
    id: "overview",
    label: "架构总览",
    items: [{ id: "architecture-model", code: "MAP", label: "整体关系" }],
  },
  {
    id: "layers",
    label: "五层架构",
    items: [
      { id: "architecture-foundation", code: "L1", label: "企业智能基础" },
      { id: "architecture-kernel", code: "L2", label: "共享工作模型" },
      { id: "architecture-contracts", code: "L3", label: "人机协作约定" },
      { id: "architecture-surfaces", code: "L4", label: "稳定工作界面" },
      { id: "architecture-outcomes", code: "L5", label: "体验结果" },
    ],
  },
  {
    id: "cross-layer",
    label: "跨层机制",
    items: [
      { id: "architecture-lineage", code: "X1", label: "对象关系" },
      { id: "architecture-semantics", code: "X2", label: "三个判断" },
      { id: "architecture-lifecycles", code: "X3", label: "治理生命周期" },
    ],
  },
  {
    id: "application",
    label: "应用分类",
    items: [{ id: "architecture-families", code: "A1", label: "协作任务类型" }],
  },
];

const contractData = {
  process: {
    mode: "SYSTEM-LED · STATE-DRIVEN · EXCEPTION-FIRST",
    name: "Process Intelligence",
    statement: "系统在明确规则、权限和控制范围内推进结构化工作；人在关键决定、异常和边界中保持有效控制。",
    object: "Case",
    flow: {
      label: "Process Intelligence主路径与异常分支",
      steps: [
        { label: "Event" },
        { label: "Interpret" },
        { label: "Validate" },
        { label: "Decide", kind: "decision" },
        { label: "Prepare" },
        { label: "Approve", kind: "gate", qualifier: "WHEN REQUIRED" },
        { label: "Execute" },
        { label: "Verify" },
      ],
      branches: [
        {
          label: "EXCEPTION PATH",
          kind: "recovery",
          items: ["Recover"],
          note: "Execute或Verify出现Failure / Partial时进入，不是固定下一步。",
        },
      ],
    },
    system: ["维护Case状态与依赖", "执行规则、权限和风险校验", "准备并执行受控Action", "记录Action State、Business Outcome与Feedback"],
    human: ["确认边界与高影响Decision", "处理Policy Exception", "接管无法恢复的Case", "批准Rule Proposal"],
    visible: ["Case Identity与Owner", "Required Human Decision", "Action / Approval / Execution分离", "Business Outcome与Recovery"],
  },
  collaborative: {
    mode: "HUMAN-LED · GOAL-DRIVEN · RESULT-FIRST",
    name: "Collaborative Intelligence",
    statement: "人定义Goal、Constraints和最终判断；AI先交付可验证Result，再按需要延伸为Artifact、Decision或受控Action。",
    object: "Mission",
    flow: {
      label: "Collaborative Intelligence最短闭环与可选延伸",
      steps: [
        { label: "Frame" },
        { label: "Context" },
        { label: "Produce Result" },
        { label: "Assess Goal" },
        { label: "Stop / Continue", kind: "gate" },
      ],
      branches: [
        {
          label: "STOP",
          kind: "terminal",
          items: ["Goal Resolution"],
          note: "结果已经回答当前Goal时，可以在这里合法结束。",
        },
        {
          label: "CONTINUE · WHEN NEEDED",
          kind: "conditional",
          items: ["Artifact", "Decision", "Action Proposal"],
          note: "只有任务需要时才创建新的关联Work Object。",
        },
      ],
    },
    system: ["解释Goal并识别歧义", "生成可引用Result", "绑定Evidence并暴露Limit", "推荐但不强迫可选延伸"],
    human: ["确认目的和边界", "提供业务判断与新Context", "判断Evidence是否充分", "决定结束、继续、发布或行动"],
    visible: ["Mission Goal与Context", "Work Result与Goal Resolution", "Evidence、Limit与Branch", "可选Plan、Artifact与Action Handoff"],
  },
};

/** @type {{id:string, label:string, title:string, explanation:string, fields:SemanticField[]}[]} */
const semanticQuestionData = [
  {
    id: "trust",
    label: "01 · READ THE RESULT",
    title: "这个结论能信到什么程度？",
    explanation: "先看它说的是什么、依据够不够，以及是否需要说明不确定性。",
    fields: [
      {
        id: "claim",
        name: "内容类型",
        question: "这句话是事实、计算、假设、预测，还是建议？",
        description: "不同内容需要不同的证据和措辞；内容类型本身不代表可以执行。",
        values: ["Fact", "Calculation", "Hypothesis", "Forecast", "Recommendation"],
        color: "var(--claim-color)",
      },
      {
        id: "evidence",
        name: "依据状态",
        question: "来源、范围和新鲜度足够支撑这句话吗？",
        description: "只回答依据是否充分，不回答风险或权限。",
        values: ["Unverified", "Supported", "Verified", "Contested", "Stale", "Insufficient"],
        color: "var(--validation-color)",
      },
      {
        id: "uncertainty",
        name: "不确定性",
        question: "是否有经过校准、对决策有用的区间？",
        description: "没有可靠校准时不展示一个看似精确的小数。",
        values: ["Calibrated range", "Scenario band", "Not shown"],
        color: "var(--semantic-text-tertiary)",
      },
    ],
  },
  {
    id: "control",
    label: "02 · CONTROL THE ACTION",
    title: "这件事能不能做，谁来做？",
    explanation: "分别检查影响、权限和AI可推进到哪一步；任何一项都不能替代另外两项。",
    fields: [
      {
        id: "risk",
        name: "影响与可恢复性",
        question: "影响有多大，失败后能撤回或补偿吗？",
        description: "风险描述后果与恢复难度，不等于证据强弱。",
        values: ["Low / Medium / High", "Reversible", "Compensatable", "Irreversible"],
        color: "var(--risk-color)",
      },
      {
        id: "permission",
        name: "权限与政策",
        question: "当前主体对这个对象和范围有权限吗？",
        description: "Allowed、Conditional或Denied绑定具体主体、操作、范围和Policy Version。",
        values: ["Allowed", "Conditional", "Denied"],
        color: "var(--permission-color)",
      },
      {
        id: "autonomy",
        name: "AI可推进范围",
        question: "AI现在只能建议、可以准备，还是获准执行？",
        description: "权限通过后，仍要按当前Policy明确AI最多可以推进到哪一步。",
        values: ["Recommend", "Prepare", "Approval Required", "Execute Within Policy", "Monitor by Exception"],
        color: "var(--eix-workflow-accent)",
      },
    ],
  },
  {
    id: "progress",
    label: "03 · LOCATE THE WORK",
    title: "工作现在走到哪一步？",
    explanation: "只描述对象自身的进展，不把“审批过”“执行过”和“业务改善”混成一件事。",
    fields: [
      {
        id: "workflow",
        name: "工作状态",
        question: "这个对象当前是草稿、待处理、已批准、执行中还是已结束？",
        description: "每类Work Object拥有自己的生命周期；Approved、Executed与Business Outcome彼此独立。",
        values: ["Draft", "Pending", "Approved", "Queued", "Executing", "Succeeded", "Failed"],
        color: "var(--workflow-color)",
      },
    ],
  },
];

/** @type {LifecycleSpec[]} */
const lifecycleData = [
  {
    id: "publication",
    name: "Publication",
    subject: "Artifact Revision",
    label: "Publication主路径与发布后的版本状态",
    steps: [
      { label: "Draft" },
      { label: "Validated" },
      { label: "Approval Pending", kind: "gate", qualifier: "WHEN REQUIRED" },
      { label: "Published" },
    ],
    branches: [
      {
        label: "LATER REVISION STATE",
        kind: "exit",
        items: ["Superseded", "Withdrawn"],
        note: "发布后的版本可以被替代或撤回，但不会被静默覆盖。",
      },
    ],
    rules: ["Validated不等于Published", "Published Revision不可静默覆盖", "Evidence或Scope变化使旧Gate失效"],
  },
  {
    id: "action",
    name: "Action",
    subject: "Controlled Action",
    label: "Action主路径、执行结果与恢复关系",
    steps: [
      { label: "Proposed" },
      { label: "Preflight Ready" },
      { label: "Awaiting Approval", kind: "gate", qualifier: "WHEN REQUIRED" },
      { label: "Approved" },
      { label: "Queued" },
      { label: "Executing" },
    ],
    branches: [
      {
        label: "EXECUTION RESULT",
        kind: "terminal",
        items: ["Succeeded", "Partial", "Failed"],
        note: "三种结果互斥记录；Partial或Failed不会删除已经完成的工作。",
      },
      {
        label: "RECOVERY · WHEN NEEDED",
        kind: "recovery",
        items: ["Compensating Action"],
        note: "恢复操作创建一条引用原Action的新记录，不改写原执行事实。",
      },
    ],
    rules: ["Approve不等于Execute", "执行前原子重验治理快照", "Compensation是引用原Action的新Action", "Business Outcome是独立关联记录"],
  },
  {
    id: "rule",
    name: "Rule Change",
    subject: "Rule Proposal",
    label: "Rule Change主路径与停用状态",
    steps: [
      { label: "Candidate" },
      { label: "Drafted" },
      { label: "Validated" },
      { label: "Approved", kind: "gate" },
      { label: "Staged" },
      { label: "Active" },
    ],
    branches: [
      {
        label: "CONTROLLED EXIT",
        kind: "exit",
        items: ["Suspended", "Retired"],
        note: "停用和退役是显式变更记录，不把历史Active状态抹掉。",
      },
    ],
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
    purpose: "Goal & Context Header常驻展示Goal、Scope、Owner、State和Context。",
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
    states: ["Proposed", "Preflight Ready", "Awaiting Approval", "Approved", "Queued", "Executing", "Succeeded", "Partial", "Failed"],
    tests: ["Approve不等于Execute", "Denied不能Queued", "执行前重验"],
  },
  {
    id: "S08",
    name: "Business Outcome Receipt",
    contract: "shared",
    maturity: "Candidate",
    purpose: "从System of Record证明Action之后的业务后置条件。",
    fear: "Action成功是否被错误描述成业务改善？",
    workObject: "Business Outcome",
    fixed: ["Linked Action / Case", "Expected / Observed", "System of Record", "Observation Window", "Status"],
    states: ["Pending Observation", "Improved", "No Change", "Worsened", "Inconclusive"],
    tests: ["Action Succeeded不推出业务改善", "Business Outcome来自System of Record"],
  },
  {
    id: "P01",
    name: "Exception-first Console",
    contract: "process",
    maturity: "Composition",
    purpose: "Exception-first Console集中呈现异常、审批、恢复和控制边界。",
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
    purpose: "Mission Workspace围绕Goal、Context、Result与Artifact组织知识工作。",
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
  { code: "A03", name: "Kernel Coverage", text: "明确哪些记录Required、Conditional、Linked或N/A，以及合法停止点。" },
  { code: "A04", name: "Fixed / Optional", text: "固定区保证语义完整；扩展区只增加领域内容或任务深度。" },
  { code: "A05", name: "Independent States", text: "每个预览控制只改变明确的一类状态；依据、风险、权限、AI可推进范围和工作进展彼此独立。" },
  { code: "A06", name: "Outputs & Termination", text: "说明产生什么稳定记录、何时可以结束、哪些延伸只是可选。" },
  { code: "A07", name: "Failure & Recovery", text: "失败说明保留项、缺失项和下一步，Takeover不从头开始。" },
  { code: "A08", name: "Responsive & Accessibility", text: "小屏减少复杂操作，但保留关键风险、证据、键盘和等价文本。" },
  { code: "A09", name: "Maturity Evidence", text: "区分Canonical Listed、Specified、Behavioral Specimen与Validated Pattern。" },
];

const independentStateFieldLabels = {
  ClaimKind: "内容类型（ClaimKind）",
  EvidenceStatus: "依据状态（EvidenceStatus）",
  Uncertainty: "不确定性（Uncertainty）",
  RiskAndReversibility: "影响与可恢复性（RiskAndReversibility）",
  PermissionAndPolicy: "权限与政策（PermissionAndPolicy）",
  Autonomy: "AI可推进范围（Autonomy）",
  WorkflowState: "工作状态（WorkflowState）",
};

/** @type {Record<string, JourneyStep[]>} */
const journeyData = {
  "quick-answer": [
    {
      id: "J-Q1",
      title: "Frame Goal & Context",
      object: "MIS-021 · Mission",
      human: "提出问题；只在口径会改变答案时确认关键边界。",
      system: "解释Goal，组装有权限且足够的Context。",
      evidence: "CTX-021 · source / scope / freshness",
      controls: "Correct scope、Remove source、Stop。",
      degradation: "无法判定Goal时只问一个会改变答案的问题。",
      artifact: "Goal Record + Context Snapshot",
    },
    {
      id: "J-Q2",
      title: "Deliver Trustworthy Result",
      object: "RSLT-021 r1 · Work Result",
      human: "读取答案；按需打开来源或挑战结论。",
      system: "生成可引用Result，绑定Evidence、Scope和Limitation。",
      evidence: "RSLT-021 → EVD-021 · Verified",
      controls: "Open Evidence、Challenge、Continue analysis。",
      degradation: "依据不足时缩小Claim或明确Insufficient，不编造确定答案。",
      artifact: "Work Result Record",
    },
    {
      id: "J-Q3",
      title: "Assess Goal & Stop",
      object: "GRES-021 r1 · Goal Resolution",
      human: "可以直接离开，也可以确认、追问或继续分析。",
      system: "依据明确criteria记录Met / Partial / Not Met；无法观察用户判断时记录Unobserved。",
      evidence: "Goal revision + Result revision + observation basis",
      controls: "Done、Continue、Package as Artifact。",
      degradation: "用户离开不推断成功；Result保持Delivered，Goal Resolution保持Unobserved。",
      artifact: "Goal Resolution Assessment · legal stop",
    },
  ],
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
      title: "Produce Stable Result",
      object: "ANL-118 · Analysis",
      human: "检查分析范围；复杂任务才调整Plan和优先级。",
      system: "先返回基础Result；按数据条件运行可选高阶方法。",
      evidence: "RSLT-118 → EVD-118；可选Plan声明依赖。",
      controls: "Open Evidence、Run optional step、Stop。",
      degradation: "高阶方法失败不清除Verified基础Result。",
      artifact: "Work Result Record",
    },
    {
      id: "J-A4",
      title: "Assess Goal & Choose",
      object: "GRES-118 r1",
      human: "决定当前Result是否足够，以及结束还是延伸。",
      system: "记录Goal Resolution，并给出不超过三个有意义的可选延伸。",
      evidence: "Goal revision + RSLT-118 r1",
      controls: "Done、Create Artifact、Open Decision、Propose Action。",
      degradation: "无法观察用户判断时记录Unobserved，不假定成功。",
      artifact: "Goal Resolution Assessment · legal stop",
    },
    {
      id: "J-A5",
      title: "Optional · Form Decision",
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
      title: "Optional · Package / Publish Artifact",
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
      title: "Optional · Propose Action",
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
      artifact: "Approval Receipt + Execution Receipt",
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

const journeyMeta = {
  "quick-answer": {
    root: "ROOT-021",
    label: "可信回答（最短路径）",
    stop: "RSLT-021已交付；GRES-021记录Goal是否满足或Unobserved。",
    lineage: ["Mission", "Work Result", "Goal Resolution", "STOP"],
    optionalFrom: Number.POSITIVE_INFINITY,
  },
  collaborative: {
    root: "ROOT-018",
    label: "分析及可选延伸",
    stop: "GRES-118之后可以合法结束；Decision、Artifact和Action是三条可选分支。",
    lineage: ["Mission", "Analysis", "Work Result", "Goal Resolution", "OPTIONAL BRANCHES"],
    optionalFrom: 4,
  },
  process: {
    root: "ROOT-204",
    label: "Exception → 规则改进",
    stop: "Case、Investigation、Action和Rule Proposal通过Trace相连，状态彼此独立。",
    lineage: ["Case", "Exception", "Investigation", "Decision", "Action", "Rule Candidate"],
    optionalFrom: Number.POSITIVE_INFINITY,
  },
};

const handoffExamples = {
  "quick-answer": [
    { name: "Current Journey", value: "ROOT-021 · 可信回答", description: "当前选择与上方Journey一致" },
    { name: "Handoff State", value: "Not Applicable", description: "Result与Goal Resolution已经完成当前Goal" },
    { name: "Optional Trigger", value: "New scope or controlled action", description: "任务继续变深时再创建关联对象" },
  ],
  collaborative: [
    { name: "Current Journey", value: "ROOT-018 · 分析及可选延伸", description: "Analysis向Action Proposal交接" },
    { name: "Root & Trace", value: "ROOT-018 · TRACE-9C21", description: "维持Goal和可追溯连续性" },
    { name: "From Revision", value: "ANL-118 r4", description: "来源对象与不可变版本" },
    { name: "To Type", value: "ACT-077 · Action Proposal", description: "创建类型明确的新对象" },
    { name: "Goal & Scope", value: "GOAL-018 · Approved scope", description: "沿用已确认的业务范围" },
    { name: "Context Snapshot", value: "CTX-041 · 2026-07-26", description: "授权Context与Freshness" },
    { name: "Evidence", value: "CLM-118 → EVD-118", description: "保留Claim与依据关系" },
    { name: "Decision Owner", value: "ROLE · Business Owner", description: "记录承担决策责任的业务角色" },
    { name: "Policy & Permission", value: "POL-17 v6 · PERM-88", description: "执行前按当前快照重新校验" },
  ],
  process: [
    { name: "Current Journey", value: "ROOT-204 · Exception调查", description: "Case向Investigation Mission交接" },
    { name: "Root & Trace", value: "ROOT-204 · TRACE-2041", description: "关联Case与调查对象" },
    { name: "From Revision", value: "CASE-204 · EXC-19", description: "保留触发调查的Exception" },
    { name: "To Type", value: "MIS-044 · Investigation", description: "创建独立生命周期的Mission" },
    { name: "Goal & Scope", value: "Investigate EXC-19 only", description: "限定调查目标与边界" },
    { name: "Context Snapshot", value: "CTX-204 · restricted", description: "裁剪后的授权Context" },
    { name: "Evidence", value: "EXC-19 → EVD-204", description: "携带Failure与Rule Evaluation" },
    { name: "Decision Owner", value: "ROLE · Case Owner", description: "记录接收调查结论的责任角色" },
    { name: "Return Contract", value: "DEC-057 → CASE-204", description: "Decision通过Trace返回原Case" },
  ],
};

const referenceFlowData = [
  {
    id: "ask-conclude",
    title: "Ask → Conclude",
    contract: "Collaborative Intelligence",
    label: "从提出问题到形成可信答案",
    steps: [
      { label: "Goal & Context" },
      { label: "Clarification", qualifier: "ONLY IF DECISIVE" },
      { label: "Evidence-backed Work Result" },
      { label: "Goal Resolution", kind: "decision" },
    ],
    branches: [
      {
        label: "LEGAL STOP",
        kind: "terminal",
        items: ["Done"],
        note: "可信Result已经回答当前Goal时，任务可以在这里结束。",
      },
      {
        label: "OPTIONAL · WHEN NEEDED",
        kind: "conditional",
        items: ["Artifact", "Decision", "Action Proposal"],
        note: "只有问题继续变深时才创建新的关联对象。",
      },
    ],
    stop: "可信Result后可以合法结束。Plan、Artifact、Decision和Action只在问题继续变深时出现。",
  },
  {
    id: "event-action",
    title: "Event → Action",
    contract: "Process Intelligence",
    label: "从业务事件到受控执行",
    steps: [
      { label: "Event / Case" },
      { label: "Policy & Context" },
      { label: "Capability Snapshot" },
      { label: "Action Preflight" },
      { label: "Approve", kind: "gate", qualifier: "WHEN REQUIRED" },
      { label: "Execute" },
      { label: "Action State" },
    ],
    branches: [
      {
        label: "LINKED OBSERVATION",
        kind: "linked",
        items: ["Business Outcome"],
        note: "Outcome由后续系统事实证明，不是Action自动进入的下一状态。",
      },
    ],
    stop: "Capability声明不等于Permission；Denied、Scope Missing或Suspended时不渲染Execute。",
  },
  {
    id: "exception-investigation",
    title: "Exception → Investigation",
    contract: "Cross-contract Handoff",
    label: "从流程异常到调查再返回Case",
    steps: [
      { label: "Exception" },
      { label: "Handoff Envelope" },
      { label: "Investigation Mission" },
      { label: "Decision Record", kind: "decision" },
      { label: "Return to Case" },
    ],
    branches: [],
    stop: "Analysis与Case通过Trace ID关联，不能在同一对象上静默切换Lifecycle。",
  },
  {
    id: "decision-rule",
    title: "Decision → Rule Candidate",
    contract: "Process Intelligence",
    label: "从一次人工判断到未来规则",
    steps: [
      { label: "Human Decision" },
      { label: "Rule Candidate" },
      { label: "Replay & Conflict Scan" },
      { label: "SoD Approval", kind: "gate" },
      { label: "Stage" },
      { label: "Activate & Monitor" },
    ],
    branches: [
      {
        label: "LEGAL STOP",
        kind: "terminal",
        items: ["Keep Candidate", "Reject"],
        note: "证据不足或审批未通过时可以停止，不会影响未来Case。",
      },
    ],
    stop: "单次人工判断只产生Candidate；未验证、未审批或未Stage时不得影响未来Case。",
  },
];

const experienceSignalData = [
  { promise: "Clarity", leading: "Scope纠正率 · 重复澄清次数", outcome: "Intent误解导致的返工率" },
  { promise: "Trust", leading: "Evidence展开率 · Limit阅读率", outcome: "Claim采用、争议与撤回比例" },
  { promise: "Control", leading: "预览、暂停与接管行为", outcome: "未授权Action与不可恢复错误为0" },
  { promise: "Momentum", leading: "首个有效Result时间 · Partial保留率", outcome: "Goal完成时间与等待中断率" },
  { promise: "Continuity", leading: "Branch、Revision与Handoff延续率", outcome: "重复解释Context的时间" },
  { promise: "Calm", leading: "Exception信噪比 · 无效提醒率", outcome: "人工监督负担与Recovery耗时" },
];

const readerMetrics = [
  { value: "≥90%", name: "Architecture", text: "解释Kernel如何按任务组合记录与关系" },
  { value: "≥85%", name: "Semantics", text: "区分Evidence、Risk、Permission与Autonomy" },
  { value: "≥95%", name: "State", text: "区分Result、Goal Resolution、Action State与Business Outcome" },
  { value: "≥85%", name: "Pattern", text: "为给定场景选择正确Pattern及合法停止点" },
  { value: "100%", name: "Identity", text: "识别Canonical、Companion与Candidate" },
];

const appState = {
  route: "brief",
  density: "brief",
  selectedPromise: 0,
  selectedKernel: 0,
  selectedProjection: "trustworthy-answer",
  selectedLineage: "result",
  selectedContract: "process",
  selectedLifecycle: "publication",
  patternFilter: "all",
  selectedPatternId: "S01",
  selectedSpecimen: "patch",
  selectedJourney: "quick-answer",
  journeyStep: 0,
  axisLab: {
    evidence: "Insufficient",
    permission: "Conditional",
    autonomy: "Approval Required",
    workflow: "Approved",
  },
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
  railView: document.querySelector("#railView"),
  railViewDescription: document.querySelector("#railViewDescription"),
  railDensity: document.querySelector("#railDensity"),
  railInvariant: document.querySelector("#railInvariant"),
  promiseTabs: document.querySelector("#promiseTabs"),
  promisePanel: document.querySelector("#promisePanel"),
  architectureLayers: document.querySelector("#architectureLayers"),
  architectureCrossLinks: document.querySelector("#architectureCrossLinks"),
  taskProjectionTabs: document.querySelector("#taskProjectionTabs"),
  kernelRelationshipMap: document.querySelector("#kernelRelationshipMap"),
  taskProjectionPanel: document.querySelector("#taskProjectionPanel"),
  conformancePathPanel: document.querySelector("#conformancePathPanel"),
  kernelDistinctions: document.querySelector("#kernelDistinctions"),
  kernelTabs: document.querySelector("#kernelTabs"),
  kernelPanel: document.querySelector("#kernelPanel"),
  objectLineageMap: document.querySelector("#objectLineageMap"),
  objectLineageInspector: document.querySelector("#objectLineageInspector"),
  contractPanel: document.querySelector("#contractPanel"),
  semanticAxes: document.querySelector("#semanticAxes"),
  axisLabControls: document.querySelector("#axisLabControls"),
  axisLabResult: document.querySelector("#axisLabResult"),
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
  patternCoverageSummary: document.querySelector("#patternCoverageSummary"),
  patternCoverageTable: document.querySelector("#patternCoverageTable"),
  journeyLineage: document.querySelector("#journeyLineage"),
  journeyTrace: document.querySelector("#journeyTrace"),
  journeyStepPanel: document.querySelector("#journeyStepPanel"),
  journeyPrev: document.querySelector("#journeyPrev"),
  journeyNext: document.querySelector("#journeyNext"),
  journeyPosition: document.querySelector("#journeyPosition"),
  handoffEnvelope: document.querySelector("#handoffEnvelope"),
  acceptanceGrid: document.querySelector("#acceptanceGrid"),
  readerMetrics: document.querySelector("#readerMetrics"),
  experienceSignals: document.querySelector("#experienceSignals"),
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

function stateClass(value) {
  return String(value).toLocaleLowerCase("en-US").replaceAll(/[^a-z0-9]+/g, "-");
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

function focusRequestedAcceptanceProtocol() {
  document.querySelectorAll(".acceptance-card.is-focused").forEach((card) => card.classList.remove("is-focused"));
  if (appState.route !== "acceptance") return;
  const requestedId = String(hashParameters().get("focus") || "").toUpperCase();
  if (!/^A0[1-8]$/.test(requestedId)) return;
  const card = document.querySelector(`#acceptance-${requestedId}`);
  if (!card) return;
  card.classList.add("is-focused");
  const details = card.querySelector("details");
  if (details) details.open = true;
  requestAnimationFrame(() => {
    card.scrollIntoView({ block: "center", behavior: "auto" });
  });
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

let sectionObserver;

function syncArchitectureMap(section) {
  if (!section || appState.route !== "architecture") return;
  const activeLayer = section.dataset.architectureLayer || "";
  const relatedLayer = section.dataset.architectureRelatedLayer || "";
  const scope = section.dataset.architectureScope || (activeLayer ? "layer" : "");

  elements.architectureLayers?.querySelectorAll("[data-architecture-layer]").forEach((button) => {
    const isActive = button.dataset.architectureLayer === activeLayer;
    const isRelated = !isActive && button.dataset.architectureLayer === relatedLayer;
    button.classList.toggle("is-active", isActive);
    button.classList.toggle("is-related", isRelated);
    if (isActive) button.setAttribute("aria-current", "location");
    else button.removeAttribute("aria-current");
  });

  elements.architectureCrossLinks?.querySelectorAll("[data-architecture-target]").forEach((button) => {
    const isActive = button.dataset.architectureTarget === section.id;
    button.classList.toggle("is-active", isActive);
    if (isActive) button.setAttribute("aria-current", "location");
    else button.removeAttribute("aria-current");
  });

  if (elements.architectureLayers) elements.architectureLayers.dataset.activeScope = scope;
}

function activateSectionNavigation(section) {
  if (!section) return;
  elements.sectionNav.querySelectorAll("a").forEach((link) => {
    const isActive = link.dataset.sectionLink === section.id;
    link.classList.toggle("active", isActive);
    if (isActive) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
  syncArchitectureMap(section);
}

function scrollToPageSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (!section) return;
  if (appState.route === "architecture" && appState.density === "brief" && sectionId !== "architecture-model") {
    setDensity("deep");
  }
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  requestAnimationFrame(() => {
    section.scrollIntoView({ block: "start", behavior: reduceMotion ? "auto" : "smooth" });
    activateSectionNavigation(section);
  });
  setSidebar(false);
}

function renderSectionNav(routeView) {
  if (sectionObserver) sectionObserver.disconnect();
  const sections = [...routeView.querySelectorAll("[data-section-title]")];
  const sectionIds = new Set(sections.map((section) => section.id));

  if (appState.route === "architecture") {
    elements.sectionNav.innerHTML = architectureNavigationGroups
      .map((group) => {
        const items = group.items.filter((item) => sectionIds.has(item.id));
        if (!items.length) return "";
        return `
          <section class="section-nav-group" data-nav-group="${escapeHtml(group.id)}">
            <span class="section-nav-group-title">${escapeHtml(group.label)}</span>
            ${items
              .map(
                (item) => `
                  <a
                    href="#${escapeHtml(item.id)}"
                    data-section-link="${escapeHtml(item.id)}"
                    data-nav-code="${escapeHtml(item.code)}"
                  >
                    <span>${escapeHtml(item.code)}</span><b>${escapeHtml(item.label)}</b>
                  </a>
                `,
              )
              .join("")}
          </section>
        `;
      })
      .join("");
  } else {
    elements.sectionNav.innerHTML = sections
      .map(
        (section, index) => `
          <a href="#${escapeHtml(section.id)}" data-section-link="${escapeHtml(section.id)}">
            <span>${String(index + 1).padStart(2, "0")}</span>${escapeHtml(section.dataset.sectionTitle)}
          </a>
        `,
      )
      .join("");
  }

  elements.sectionNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      scrollToPageSection(link.dataset.sectionLink);
    });
  });

  if ("IntersectionObserver" in window) {
    sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        activateSectionNavigation(visible.target);
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: [0.05, 0.25, 0.6] },
    );
    sections.forEach((section) => sectionObserver.observe(section));
  }

  activateSectionNavigation(sections[0]);
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
  focusRequestedAcceptanceProtocol();
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
  elements.architectureLayers.innerHTML = [...architectureLayers]
    .reverse()
    .map(
      (layer) => `
        <button
          type="button"
          class="layer-row ${layer.kernel ? "kernel" : ""}"
          data-architecture-layer="${escapeHtml(layer.code)}"
          data-architecture-target="${escapeHtml(layer.target)}"
          aria-controls="${escapeHtml(layer.target)}"
          aria-label="查看${escapeHtml(layer.code)} ${escapeHtml(layer.cn)}"
        >
          <span class="layer-code">${escapeHtml(layer.code)}</span>
          <div class="layer-main">
            <span class="layer-title"><strong>${escapeHtml(layer.name)}</strong><b>${escapeHtml(layer.cn)}</b></span>
            <small>${escapeHtml(layer.detail)}</small>
          </div>
          <div class="layer-owner"><span>OWNER</span><small>${escapeHtml(layer.owner)}</small></div>
          <div class="layer-output">
            <span>EXPANDS TO</span>
            <small>${escapeHtml(layer.expands)}</small>
            <i aria-hidden="true">→</i>
          </div>
        </button>
      `,
    )
    .join("");

  elements.architectureCrossLinks.innerHTML = `
    <div>
      <span>CROSS-LAYER MECHANISMS</span>
      <strong>贯穿多个Work Object、状态与界面。</strong>
    </div>
    ${architectureNavigationGroups
      .find((group) => group.id === "cross-layer")
      .items.map(
        (item) => `
          <button
            type="button"
            data-architecture-target="${escapeHtml(item.id)}"
            aria-controls="${escapeHtml(item.id)}"
          ><span>${escapeHtml(item.code)}</span>${escapeHtml(item.label)}</button>
        `,
      )
      .join("")}
  `;

  document.querySelectorAll("[data-architecture-target]").forEach((button) => {
    button.addEventListener("click", () => scrollToPageSection(button.dataset.architectureTarget));
  });
}

function renderTaskProjection() {
  const projection = taskProjectionData.find((item) => item.id === appState.selectedProjection) || taskProjectionData[0];
  elements.taskProjectionTabs.innerHTML = taskProjectionData
    .map(
      (item) => `
        <button
          type="button"
          role="tab"
          data-projection-id="${escapeHtml(item.id)}"
          aria-selected="${String(item.id === projection.id)}"
          tabindex="${item.id === projection.id ? "0" : "-1"}"
          aria-controls="taskProjectionPanel"
        >${escapeHtml(item.label)}</button>
      `,
    )
    .join("");

  const groups = [
    { label: "ORIENT", ids: ["goal", "context"] },
    { label: "PRODUCE & ASSESS", ids: ["plan", "evidence", "result", "resolution"] },
    { label: "OPTIONAL EXTENSIONS", ids: ["artifact", "decision", "action", "business-outcome"] },
    { label: "LEARN", ids: ["feedback"] },
  ];
  const statusLabel = {
    required: "必需",
    conditional: "条件性",
    linked: "关联",
    na: "不适用",
  };
  elements.kernelRelationshipMap.innerHTML = `
    <div class="projection-legend" aria-label="任务投影图例">
      ${Object.entries(statusLabel)
        .map(([status, label]) => `<span class="is-${status}"><i></i>${escapeHtml(label)}</span>`)
        .join("")}
    </div>
    <div class="relationship-groups">
      ${groups
        .map(
          (group) => `
            <section class="relationship-group">
              <span>${escapeHtml(group.label)}</span>
              <div>
                ${group.ids
                  .map((id) => {
                    const record = kernelData.find((item) => item.id === id);
                    const status = projection.statuses[id] || "na";
                    return `
                      <button
                        type="button"
                        class="relationship-node is-${status}"
                        data-kernel-record="${escapeHtml(id)}"
                        aria-label="${escapeHtml(`${record.name}：${statusLabel[status]}`)}"
                      >
                        <b>${escapeHtml(record.name)}</b>
                        <small>${escapeHtml(statusLabel[status])}</small>
                      </button>
                    `;
                  })
                  .join("")}
              </div>
            </section>
          `,
        )
        .join("")}
    </div>
  `;
  elements.taskProjectionPanel.innerHTML = `
    <span>TASK PROJECTION · ${escapeHtml(projection.label.toUpperCase())}</span>
    <h3>${escapeHtml(projection.example)}</h3>
    <dl>
      <div><dt>合法停止点</dt><dd>${escapeHtml(projection.stop)}</dd></div>
      <div><dt>无法观察时</dt><dd>${escapeHtml(projection.unobserved)}</dd></div>
    </dl>
    <p>地图按Required、Conditional、Linked和Not Applicable标记本任务需要的记录。</p>
  `;
  renderConformancePath();
  bindTabButtons(elements.taskProjectionTabs, "[data-projection-id]", (button) => {
    appState.selectedProjection = button.dataset.projectionId;
    renderTaskProjection();
  });
  elements.kernelRelationshipMap.querySelectorAll("[data-kernel-record]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = kernelData.findIndex((item) => item.id === button.dataset.kernelRecord);
      if (index < 0) return;
      appState.selectedKernel = index;
      setDensity("deep");
      renderKernelExplorer();
      window.requestAnimationFrame(() => elements.kernelPanel?.scrollIntoView({ block: "center" }));
    });
  });
}

function renderConformancePath() {
  if (!elements.conformancePathPanel) return;
  const path = conformancePaths.find((item) => item.taskShape === appState.selectedProjection);
  if (!path) {
    elements.conformancePathPanel.innerHTML = "";
    return;
  }
  const projection = taskProjectionData.find((item) => item.id === path.taskShape);
  const patternLinks = path.patternIds
    .map((id) => {
      const pattern = patternData.find((item) => item.id === id);
      return pattern
        ? `<a href="#/guidance/${escapeHtml(pattern.contract)}/${escapeHtml(id)}">${escapeHtml(id)}</a>`
        : `<span>${escapeHtml(id)}</span>`;
    })
    .join("");
  const componentLinks = path.componentIds
    .map((id) => {
      const component = catalogRegistry.find((item) => item.kind === "components" && item.id === id);
      return component
        ? `<a href="#${escapeHtml(component.route)}">${escapeHtml(component.title)}</a>`
        : `<span>${escapeHtml(id)}</span>`;
    })
    .join("");
  const acceptanceLinks = path.acceptanceIds
    .map((id) => `<a href="#/acceptance?focus=${escapeHtml(id)}">${escapeHtml(id)}</a>`)
    .join("");
  elements.conformancePathPanel.innerHTML = `
    <header>
      <span>FROM TASK TO INTERFACE</span>
      <h3>${escapeHtml(path.label)}使用${escapeHtml(path.contract)}，并引用以下Pattern、组件和验收协议。</h3>
    </header>
    <div class="conformance-path-grid">
      <section><span>CONTRACT</span><strong>${escapeHtml(path.contract)}</strong></section>
      <section><span>GUIDANCE PATTERNS</span><div>${patternLinks}</div></section>
      <section><span>CORE COMPONENTS</span><div>${componentLinks}</div></section>
      <section><span>ACCEPTANCE</span><div>${acceptanceLinks}</div></section>
      <section class="conformance-path-stop"><span>LEGAL STOP</span><p>${escapeHtml(projection?.stop || "")}</p></section>
    </div>
  `;
}

function renderKernelDistinctions() {
  elements.kernelDistinctions.innerHTML = kernelDistinctionData
    .map(
      (item) => `
        <article>
          <span>${escapeHtml(item.title)}</span>
          <dl>
            <div><dt>WHEN</dt><dd>${escapeHtml(item.when)}</dd></div>
            <div><dt>OWNS</dt><dd>${escapeHtml(item.owns)}</dd></div>
            <div><dt>DOES NOT MEAN</dt><dd>${escapeHtml(item.not)}</dd></div>
          </dl>
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
        ><span>${escapeHtml(item.code)}</span><b>${escapeHtml(item.name)}</b></button>
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
      <section><span>APPLICABILITY</span><p>是否出现由Task Projection决定；记录定义不代表固定顺序。</p></section>
    </div>
  `;
  bindTabButtons(elements.kernelTabs, "[data-kernel-index]", (button) => {
    appState.selectedKernel = Number(button.dataset.kernelIndex);
    renderKernelExplorer();
  });
}

function renderObjectLineage() {
  const selected = objectLineageData.find((item) => item.id === appState.selectedLineage) || objectLineageData[0];
  elements.objectLineageMap.innerHTML = objectLineageData
    .map(
      (item, index) => `
        <button
          type="button"
          class="lineage-node ${item.id === selected.id ? "active" : ""} ${item.id === "root" ? "root" : ""}"
          data-lineage-id="${escapeHtml(item.id)}"
          aria-pressed="${String(item.id === selected.id)}"
        >
          <span>${escapeHtml(item.type)}</span>
          <strong>${escapeHtml(item.ref)}</strong>
          <small>${escapeHtml(item.state)}</small>
          ${index > 0 ? `<i aria-hidden="true">${escapeHtml(item.parent)}</i>` : ""}
        </button>
      `,
    )
    .join("");
  elements.objectLineageInspector.innerHTML = `
    <span>SELECTED TYPED OBJECT</span>
    <h3>${escapeHtml(selected.type)}</h3>
    <p>${escapeHtml(selected.purpose)}</p>
    <dl>
      <div><dt>REFERENCE</dt><dd>${escapeHtml(selected.ref)}</dd></div>
      <div><dt>OWN STATE</dt><dd>${escapeHtml(selected.state)}</dd></div>
      <div><dt>LINKED FROM</dt><dd>${escapeHtml(selected.parent || "Root of lineage")}</dd></div>
      <div><dt>LIFECYCLE RULE</dt><dd>${escapeHtml(selected.lifecycle)}</dd></div>
    </dl>
  `;
  elements.objectLineageMap.querySelectorAll("[data-lineage-id]").forEach((button) => {
    button.addEventListener("click", () => {
      appState.selectedLineage = button.dataset.lineageId;
      renderObjectLineage();
    });
  });
}

function renderSemanticFlow(flow, options = {}) {
  const legacyPrefix = options.legacyPrefix || "";
  const variant = options.variant || "standard";
  const scope = options.scope || "reference-flow";
  const classNames = (part) =>
    `semantic-flow-${part}${legacyPrefix ? ` ${legacyPrefix}-${part}` : ""}`;
  const steps = flow.steps
    .map(
      (step, index) => `
        <div
          class="${classNames("step")}"
          data-step-kind="${escapeHtml(step.kind || "standard")}"
          role="listitem"
        >
          <span>${escapeHtml(step.label)}</span>
          ${step.qualifier ? `<small>${escapeHtml(step.qualifier)}</small>` : ""}
        </div>
        ${index < flow.steps.length - 1 ? `<i class="${classNames("connector")}" aria-hidden="true"></i>` : ""}
      `,
    )
    .join("");
  const branches = (flow.branches || [])
    .map(
      (branch) => `
        <article class="${classNames("branch")}" data-branch-kind="${escapeHtml(branch.kind)}">
          <header>
            <span>${escapeHtml(branch.label)}</span>
            <p>${escapeHtml(branch.note)}</p>
          </header>
          <div class="${classNames("branch-items")}" role="list" aria-label="${escapeHtml(branch.label)}">
            ${branch.items
              .map((item) => `<span role="listitem">${escapeHtml(item)}</span>`)
              .join("")}
          </div>
        </article>
      `,
    )
    .join("");

  return `
    <div
      class="semantic-flow semantic-flow-${escapeHtml(variant)}${legacyPrefix ? ` ${legacyPrefix}` : ""}"
      data-semantic-flow="${escapeHtml(scope)}"
    >
      <div
        class="${classNames("scroll")}"
        role="region"
        tabindex="0"
        aria-label="${escapeHtml(flow.label)}"
      >
        <div class="${classNames("main")}" role="list">${steps}</div>
      </div>
      ${branches ? `<div class="${classNames("branches")}">${branches}</div>` : ""}
    </div>
  `;
}

function renderContractFlow(flow) {
  return renderSemanticFlow(flow, {
    legacyPrefix: "contract-flow",
    scope: `contract-${appState.selectedContract}`,
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
    ${renderContractFlow(item.flow)}
    <div class="contract-details">
      <section><span>SYSTEM DEFAULT</span>${list(item.system)}</section>
      <section><span>HUMAN DEFAULT</span>${list(item.human)}</section>
      <section><span>MUST BE VISIBLE</span>${list(item.visible)}</section>
    </div>
  `;
}

function renderSemanticAxes() {
  elements.semanticAxes.innerHTML = semanticQuestionData
    .map(
      (group) => `
        <article class="semantic-question-card" data-question-group="${escapeHtml(group.id)}">
          <header>
            <span>${escapeHtml(group.label)}</span>
            <h3>${escapeHtml(group.title)}</h3>
            <p>${escapeHtml(group.explanation)}</p>
          </header>
          <ol>
            ${group.fields
              .map(
                (field) => `
                  <li style="--field-accent:${field.color}">
                    <div>
                      <i aria-hidden="true"></i>
                      <strong>${escapeHtml(field.name)}</strong>
                    </div>
                    <p>${escapeHtml(field.question)}</p>
                    <div class="semantic-field-detail deep-only">
                      <span>${escapeHtml(field.description)}</span>
                      <div class="axis-values">${field.values.map((value) => `<code>${escapeHtml(value)}</code>`).join("")}</div>
                    </div>
                  </li>
                `,
              )
              .join("")}
          </ol>
        </article>
      `,
    )
    .join("");
}

const axisLabControlData = [
  {
    id: "evidence",
    axis: "EVIDENCE",
    label: "证据是否足够？",
    values: [
      { value: "Verified", detail: "来源、范围和Freshness均达到当前Policy要求。" },
      { value: "Supported", detail: "可以支撑判断，但尚未达到执行Gate要求。" },
      { value: "Insufficient", detail: "关键支撑材料缺失，不能据此执行。" },
      { value: "Stale", detail: "Evidence Snapshot已过期，需要重新校验。" },
    ],
  },
  {
    id: "permission",
    axis: "PERMISSION",
    label: "当前主体有权限吗？",
    values: [
      { value: "Allowed", detail: "Subject、Operation、Scope和Policy Version均匹配。" },
      { value: "Conditional", detail: "必须先解析并满足额外Policy条件。" },
      { value: "Denied", detail: "当前主体或Scope没有执行权限。" },
    ],
  },
  {
    id: "autonomy",
    axis: "AUTONOMY",
    label: "AI最多可以做到哪一步？",
    values: [
      { value: "Recommend", detail: "只能提出建议，不能准备或执行Action。" },
      { value: "Prepare", detail: "可以生成Action Preview，不能进入执行。" },
      { value: "Approval Required", detail: "必须取得有效Approval Receipt后才能继续。" },
      { value: "Execute Within Policy", detail: "其他Gate通过后，可以在Policy范围内执行。" },
    ],
  },
  {
    id: "workflow",
    axis: "ACTION STATE",
    label: "这次Action走到哪一步？",
    values: [
      { value: "Proposed", detail: "Action已经提出，尚未完成Preflight。" },
      { value: "Preflight Ready", detail: "执行前检查已经准备完成。" },
      { value: "Awaiting Approval", detail: "正在等待独立的Approval Receipt。" },
      { value: "Approved", detail: "审批记录存在，但还没有Queued或Executed。" },
      { value: "Queued", detail: "Action已经进入执行队列。" },
      { value: "Executing", detail: "外部操作正在进行。" },
      { value: "Succeeded", detail: "Action执行成功；Business Outcome仍需独立观察。" },
      { value: "Partial", detail: "部分执行完成，需要Recovery或Compensation判断。" },
      { value: "Failed", detail: "执行失败；原Action状态必须保留。" },
    ],
  },
];

function evaluateAxisGate(state) {
  const approvalRecorded = ["Approved", "Queued", "Executing", "Succeeded", "Partial", "Failed"].includes(state.workflow);
  const activeState = ["Queued", "Executing"].includes(state.workflow);
  const terminalState = ["Succeeded", "Partial", "Failed"].includes(state.workflow);
  const checks = [];

  const evidenceCheck = {
    id: "evidence",
    label: "Evidence Gate",
    value: state.evidence,
    status: state.evidence === "Verified" ? "pass" : "block",
    detail: {
      Verified: "Evidence Snapshot满足AP-Control v4.2。",
      Supported: "可以支撑人工判断，但当前Policy要求Verified。",
      Insufficient: "关键支撑材料缺失。",
      Stale: "Snapshot已过期，旧Gate必须失效。",
    }[state.evidence],
  };
  checks.push(evidenceCheck);

  const permissionCheck = {
    id: "permission",
    label: "Permission Gate",
    value: state.permission,
    status: state.permission === "Allowed" ? "pass" : state.permission === "Denied" ? "denied" : "block",
    detail: {
      Allowed: "Subject、Operation、Scope和Policy Version匹配。",
      Conditional: "附加条件尚未证明已经满足。",
      Denied: "当前主体或Scope没有执行权限。",
    }[state.permission],
  };
  checks.push(permissionCheck);

  let autonomyStatus = "pass";
  let autonomyDetail = "当前Autonomy允许在其他Gate通过后继续。";
  if (state.autonomy === "Recommend") {
    autonomyStatus = "limit";
    autonomyDetail = "AI只能提出建议，不能准备或执行Action。";
  } else if (state.autonomy === "Prepare") {
    autonomyStatus = "limit";
    autonomyDetail = "AI只能准备Action Preview，不能进入执行。";
  } else if (state.autonomy === "Approval Required" && !approvalRecorded) {
    autonomyStatus = "block";
    autonomyDetail = "尚未取得有效Approval Receipt。";
  } else if (state.autonomy === "Approval Required") {
    autonomyDetail = "Approval Receipt已记录；它只满足审批要求。";
  }
  checks.push({
    id: "autonomy",
    label: "Autonomy Gate",
    value: state.autonomy,
    status: autonomyStatus,
    detail: autonomyDetail,
  });

  const workflowStatus =
    activeState ? "active" : terminalState ? "record" : state.workflow === "Approved" ? "pass" : "record";
  checks.push({
    id: "workflow",
    label: "Action State",
    value: state.workflow,
    status: workflowStatus,
    detail: {
      Proposed: "Action尚未完成Preflight。",
      "Preflight Ready": "Preflight已准备；仍需读取其他Gate。",
      "Awaiting Approval": "等待Approval Receipt，不等于Denied。",
      Approved: "Approval存在，但Approved不等于Queued或Executed。",
      Queued: "Action已进入执行队列。",
      Executing: "外部操作正在进行。",
      Succeeded: "Execution Receipt记录Succeeded；Business Outcome仍独立。",
      Partial: "保留Partial状态，并判断Recovery或Compensation。",
      Failed: "保留Failure；Retry或Compensation必须创建关联Action。",
    }[state.workflow],
  });

  const blockingChecks = checks.filter((check) => ["block", "denied", "limit"].includes(check.status));
  const hasEvidenceBlock = evidenceCheck.status === "block";
  const hasPermissionBlock = ["block", "denied"].includes(permissionCheck.status);
  const nextActions = [];
  if (state.evidence === "Insufficient") nextActions.push("补充缺失Evidence并生成新的Snapshot");
  if (state.evidence === "Stale") nextActions.push("刷新Evidence并使旧Gate明确失效");
  if (state.evidence === "Supported") nextActions.push("完成Evidence验证，或记录Policy Exception");
  if (state.permission === "Conditional") nextActions.push("解析并满足Permission条件");
  if (state.permission === "Denied") nextActions.push("交给正确Owner或申请合法Scope");
  if (state.autonomy === "Approval Required" && !approvalRecorded) nextActions.push("获取独立Approval Receipt");
  if (state.autonomy === "Recommend") nextActions.push("保留Recommendation，不创建Action");
  if (state.autonomy === "Prepare") nextActions.push("生成Action Preview与Preflight材料");
  if (state.workflow === "Proposed") nextActions.push("运行Preflight并记录检查结果");

  let decision = {
    status: "blocked",
    label: "BLOCKED",
    title: "仍不可执行",
    summary: "至少一个执行条件没有满足。Gate会阻断Action，但不会替你改写任何输入状态。",
  };

  if (terminalState) {
    decision = {
      status: blockingChecks.length ? "attention" : "complete",
      label: blockingChecks.length ? "REVALIDATE FOR NEW ACTION" : "TERMINAL RECORDED",
      title: "终态已记录，禁止静默重跑",
      summary: "当前选择不会改写原Action终态；如需Retry或Compensation，必须创建新的关联Action。",
    };
    nextActions.push("查看Execution Receipt与关联Business Outcome");
  } else if (activeState) {
    decision = blockingChecks.length
      ? {
          status: "attention",
          label: "PAUSE · REVALIDATE",
          title: "暂停并重新校验",
          summary: "Action已经进入执行路径，但Evidence、Permission或Autonomy发生阻断，必须保留当前状态并触发人工处理。",
        }
      : {
          status: "active",
          label: "IN PROGRESS",
          title: state.workflow === "Queued" ? "已进入执行队列" : "正在执行",
          summary: "等待Execution Receipt；不得提前描述为Succeeded或产生Business Outcome。",
        };
    nextActions.push("监控Action State并等待Execution Receipt");
  } else if (!blockingChecks.length) {
    const ready =
      state.workflow === "Approved" ||
      (state.workflow === "Preflight Ready" && state.autonomy === "Execute Within Policy");
    decision = ready
      ? {
          status: "ready",
          label: "READY FOR QUEUE",
          title: "可以进入执行队列",
          summary: "四项检查允许下一步，但Queued和Executed仍需要新的状态记录与Execution Receipt。",
        }
      : {
          status: "review",
          label: "CONTINUE PREFLIGHT",
          title: "继续准备，尚未进入执行",
          summary: "当前没有轴互相冲突，但Action State尚未达到可入队状态。",
        };
    nextActions.push(ready ? "提交Queued状态并绑定Gate Snapshot" : "推进到Preflight Ready或Approved");
  } else if (state.workflow === "Approved" && (hasEvidenceBlock || hasPermissionBlock)) {
    decision.summary = "审批记录存在，但它没有补足Evidence，也没有解除Permission条件。";
  }

  return {
    ...decision,
    checks,
    blockingCount: blockingChecks.length,
    nextActions: [...new Set(nextActions)].slice(0, 3),
    prohibited: terminalState
      ? ["不覆盖原Action终态", "不把Action成功写成Business Outcome", "不静默重跑原Action"]
      : ["不把Approved写成Executed", "不把Permission改写为Evidence", "不在Gate通过前创建Execution Receipt"],
  };
}

function renderAxisLab() {
  const state = appState.axisLab;
  const decision = evaluateAxisGate(state);
  const statusLabels = {
    pass: "PASS",
    block: "BLOCK",
    denied: "DENIED",
    limit: "LIMIT",
    active: "ACTIVE",
    record: "RECORDED",
  };

  elements.axisLabResult.innerHTML = `
    <section class="axis-gate-summary" data-gate-status="${escapeHtml(decision.status)}">
      <span>CURRENT GATE DECISION</span>
      <strong>${escapeHtml(decision.title)}</strong>
      <p>${escapeHtml(decision.summary)}</p>
      <div>
        <b>${escapeHtml(decision.label)}</b>
        <small>${decision.blockingCount} BLOCKING CHECK${decision.blockingCount === 1 ? "" : "S"}</small>
      </div>
    </section>
    <div class="axis-gate-detail">
      <section class="axis-gate-check-section">
        <header><span>WHY</span><strong>Gate逐项读取四条独立事实</strong></header>
        <div class="axis-gate-checks">
          ${decision.checks
            .map(
              (check) => `
                <article data-check-status="${escapeHtml(check.status)}">
                  <div><span>${escapeHtml(check.label)}</span><strong>${escapeHtml(check.value)}</strong></div>
                  <p><b>${escapeHtml(statusLabels[check.status])}</b>${escapeHtml(check.detail)}</p>
                </article>
              `,
            )
            .join("")}
        </div>
      </section>
      <section class="axis-gate-actions">
        <div><span>NEXT ALLOWED</span>${list(decision.nextActions)}</div>
        <div><span>DO NOT INFER</span>${list(decision.prohibited)}</div>
      </section>
    </div>
  `;

  elements.axisLabControls.innerHTML = axisLabControlData
    .map((control) => {
      const selected = control.values.find((item) => item.value === state[control.id]);
      return `
        <label>
          <span>${escapeHtml(control.axis)}</span>
          <strong>${escapeHtml(control.label)}</strong>
          <select
            data-axis-lab="${escapeHtml(control.id)}"
            aria-describedby="axis-lab-${escapeHtml(control.id)}-detail"
          >
            ${control.values
              .map(
                (item) =>
                  `<option value="${escapeHtml(item.value)}" ${state[control.id] === item.value ? "selected" : ""}>${escapeHtml(item.value)}</option>`,
              )
              .join("")}
          </select>
          <small id="axis-lab-${escapeHtml(control.id)}-detail">${escapeHtml(selected.detail)}</small>
        </label>
      `;
    })
    .join("");

  elements.axisLabControls.querySelectorAll("[data-axis-lab]").forEach((select) => {
    select.addEventListener("change", () => {
      appState.axisLab[select.dataset.axisLab] = select.value;
      renderAxisLab();
    });
  });
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
    ${renderSemanticFlow(item, {
      legacyPrefix: "lifecycle-flow",
      scope: `lifecycle-${item.id}`,
      variant: "lifecycle",
    })}
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
          <span><b>${escapeHtml(pattern.name)}</b><small>${escapeHtml(pattern.contract)} · ${escapeHtml(pattern.evidenceLevel)}</small></span>
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
      <span class="pattern-maturity">${escapeHtml(pattern.maturity)}<small>${escapeHtml(pattern.evidenceLevel)}</small></span>
    </header>
    ${guidanceSpecimenHtml(pattern)}
    <div class="pattern-detail-grid">
      <section><span>USER FEAR</span><p>${escapeHtml(pattern.fear)}</p></section>
      <section><span>WORK OBJECT / OWNER</span><p>${escapeHtml(pattern.workObject)}<br>${escapeHtml(pattern.owner)}</p></section>
      <section><span>KERNEL COVERAGE</span>${list(pattern.kernelCoverage)}</section>
      <section><span>FIXED REGIONS</span>${list(pattern.fixed)}</section>
      <section>
        <span>REFERENCE STATE FIELDS</span>
        ${pattern.previewAxes
          .map(
            (axis) => `
              <div class="pattern-axis-group">
                <b>${escapeHtml(axis.label)}</b>
                ${list(axis.values)}
              </div>
            `,
          )
          .join("")}
        <p class="pattern-axis-note">每个字段独立存储；组合是否合法由该Pattern的校验规则判断。</p>
      </section>
      <section><span>OUTPUTS / TERMINATION</span>${list(pattern.outputs)}<b>Legal stop</b>${list(pattern.terminationConditions)}</section>
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
      <section><span>OPTIONAL TASK EXTENSIONS</span>${list(pattern.optionalExtensions)}</section>
      <section class="deep-only"><span>OPTIONAL REGIONS</span>${list(pattern.optional)}</section>
      <section class="deep-only"><span>INDEPENDENT STATE FIELDS</span>${list(
        pattern.semanticAxes.map((field) => independentStateFieldLabels[field] || field),
      )}</section>
      <section class="deep-only"><span>PERMISSION / AUTONOMY</span><p>${escapeHtml(pattern.permissionAndAutonomy)}</p></section>
      <section class="deep-only"><span>FAILURE / DEGRADATION / RECOVERY</span><p>${escapeHtml(pattern.failure)} ${escapeHtml(pattern.degradation)} ${escapeHtml(pattern.recovery)}</p></section>
      <section class="deep-only"><span>RESPONSIVE / ACCESSIBILITY</span><p>${escapeHtml(pattern.responsive)}</p>${list(pattern.accessibility)}</section>
      <section class="deep-only"><span>DO / DON'T</span><b>Do</b>${list(pattern.dos)}<b>Don't</b>${list(pattern.donts)}</section>
    </div>
  `;
  bindGuidanceSpecimen(elements.patternDetail, pattern);
  const patternButtons = [...elements.patternList.querySelectorAll("[data-pattern-id]")];
  const selectedPatternButton = patternButtons.find((button) => button.dataset.patternId === appState.selectedPatternId);
  if (selectedPatternButton && elements.patternList.scrollWidth > elements.patternList.clientWidth) {
    const left = selectedPatternButton.offsetLeft;
    const right = left + selectedPatternButton.offsetWidth;
    const visibleLeft = elements.patternList.scrollLeft;
    const visibleRight = visibleLeft + elements.patternList.clientWidth;
    if (left < visibleLeft) elements.patternList.scrollLeft = left;
    if (right > visibleRight) elements.patternList.scrollLeft = right - elements.patternList.clientWidth;
  }
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
          ${renderSemanticFlow(flow, {
            legacyPrefix: "guidance-flow",
            scope: `guidance-${flow.id}`,
            variant: "compact",
          })}
          <div class="guidance-flow-stop"><span>BOUNDARY / DEGRADATION</span><p>${escapeHtml(flow.stop)}</p></div>
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
  { id: "capability", label: "Capability & Scope", principle: "Capability and Authorization Are Independent", object: "CAP-031", invariant: "Capability声明与当前Action授权分别记录和校验。" },
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
    <div class="inspector-group"><span>VISIBLE STATE FIELDS</span>${list(states)}</div>
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
  executing: "记录执行结果",
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
            <div class="lifecycle-mini" data-flow-contract="progress-indicator">
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
    ["High Confidence + Denied仍阻断", "Approve与Execute分开", "Business Outcome使用独立关联记录"],
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
          executing: "Fixture显示Executing；下一步记录Action执行状态。",
          succeeded: "Execution Receipt记录Action Succeeded；Business Outcome仍为Pending Observation。本演示没有外部写入。",
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
        <div class="lifecycle-mini" data-flow-contract="progress-indicator">
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

function renderPatternCoverage() {
  const maturityOrder = ["Canonical Listed", "Specified", "Behavioral Specimen", "Validated Pattern"];
  const counts = Object.fromEntries(
    maturityOrder.map((maturity) => [
      maturity,
      canonicalPatternCoverage.filter((item) => item.maturity === maturity).length,
    ]),
  );
  elements.patternCoverageSummary.innerHTML = `
    <article><strong>${canonicalPatternCoverage.length}</strong><span>Canonical Patterns</span><p>全部登记，不允许静默缺失。</p></article>
    ${maturityOrder
      .map(
        (maturity) =>
          `<article class="maturity-${stateClass(maturity)}"><strong>${counts[maturity]}</strong><span>${escapeHtml(maturity)}</span><p>${
            maturity === "Validated Pattern"
              ? "需要自动契约测试与真实Reader / User证据。"
              : maturity === "Behavioral Specimen"
                ? "主要行为、失败与恢复可以观察。"
                : maturity === "Specified"
                  ? "规格完整，但尚未获得真实验证。"
                  : "只有Canonical身份与不变量。"
          }</p></article>`,
      )
      .join("")}
  `;
  elements.patternCoverageTable.innerHTML = canonicalPatternCoverage
    .map(
      (item) => `
        <tr>
          <th scope="row">${escapeHtml(item.name)}</th>
          <td>${escapeHtml(item.contract)}</td>
          <td><span class="coverage-maturity maturity-${stateClass(item.maturity)}">${escapeHtml(item.maturity)}</span></td>
          <td>${escapeHtml(item.evidence)}</td>
          <td>${escapeHtml(item.next)}</td>
        </tr>
      `,
    )
    .join("");
}

function renderJourney() {
  const steps = journeyData[appState.selectedJourney];
  const meta = journeyMeta[appState.selectedJourney];
  if (appState.journeyStep >= steps.length) appState.journeyStep = steps.length - 1;
  document.querySelectorAll("[data-journey-option]").forEach((button) => {
    const selected = button.dataset.journeyOption === appState.selectedJourney;
    button.setAttribute("aria-selected", String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
  elements.journeyLineage.innerHTML = `
    <div>
      <span>ROOT · ${escapeHtml(meta.root)}</span>
      <strong>${escapeHtml(meta.label)}</strong>
      <p>${escapeHtml(meta.stop)}</p>
    </div>
    <div class="journey-lineage-track" data-flow-contract="lineage-summary">
      ${meta.lineage
        .map((item, index) => `<span class="${item.includes("OPTIONAL") ? "optional" : item === "STOP" ? "stop" : ""}">${escapeHtml(item)}${index < meta.lineage.length - 1 ? "<i>→</i>" : ""}</span>`)
        .join("")}
    </div>
  `;
  const optionalFrom = Number.isFinite(meta.optionalFrom) ? meta.optionalFrom : steps.length;
  const mainSteps = steps.slice(0, optionalFrom);
  const optionalSteps = steps.slice(optionalFrom);
  const journeyButton = (step, index, optional = false) => {
    const active = index === appState.journeyStep;
    const completed = !optional && index < Math.min(appState.journeyStep, optionalFrom);
    const adaptiveWidth = Math.max(10, Math.min(optional ? 24 : 18, Math.ceil(step.title.length * 0.68)));
    return `
      <button
        type="button"
        role="listitem"
        data-journey-step="${index}"
        class="semantic-flow-step journey-trace-step${active ? " active" : ""}${completed ? " completed" : ""}${optional ? " optional" : ""}"
        style="--journey-step-width:${adaptiveWidth}ch"
        ${active ? 'aria-current="step"' : ""}
      >${escapeHtml(step.title)}</button>
    `;
  };
  const mainPath = mainSteps
    .map(
      (step, index) => `
        ${journeyButton(step, index)}
        ${index < mainSteps.length - 1 ? '<i class="semantic-flow-connector journey-trace-connector" aria-hidden="true"></i>' : ""}
      `,
    )
    .join("");
  elements.journeyTrace.innerHTML = `
    <div
      class="semantic-flow-scroll journey-trace-scroll"
      data-journey-flow="${escapeHtml(appState.selectedJourney)}"
      role="region"
      tabindex="0"
      aria-label="${escapeHtml(meta.label)}主路径"
    >
      <div class="semantic-flow-main journey-trace-main" role="list">${mainPath}</div>
    </div>
    ${
      optionalSteps.length
        ? `
          <div class="semantic-flow-branches journey-trace-branches">
            <article class="semantic-flow-branch journey-trace-branch" data-branch-kind="conditional">
              <header>
                <span>OPTIONAL BRANCHES</span>
                <p>下面三种延伸彼此独立，可按当前任务需要分别进入。</p>
              </header>
              <div class="semantic-flow-branch-items journey-trace-branch-items" role="list" aria-label="可选延伸">
                ${optionalSteps.map((step, index) => journeyButton(step, optionalFrom + index, true)).join("")}
              </div>
            </article>
          </div>
        `
        : ""
    }
  `;
  const step = steps[appState.journeyStep];
  const refs = journeyConformanceRefs[step.id] || { patterns: [], components: [], acceptance: [] };
  const patternRefs = refs.patterns
    .map((id) => {
      const pattern = patternData.find((item) => item.id === id);
      return pattern
        ? `<a href="#/guidance/${escapeHtml(pattern.contract)}/${escapeHtml(id)}">${escapeHtml(id)}</a>`
        : `<span>${escapeHtml(id)}</span>`;
    })
    .join("");
  const componentRefs = refs.components
    .map((id) => {
      const component = catalogRegistry.find((item) => item.kind === "components" && item.id === id);
      return component
        ? `<a href="${escapeHtml(component.route)}">${escapeHtml(component.title)}</a>`
        : `<span>${escapeHtml(id)}</span>`;
    })
    .join("");
  const acceptanceRefs = refs.acceptance
    .map((id) => `<a href="#/acceptance?focus=${escapeHtml(id)}">${escapeHtml(id)}</a>`)
    .join("");
  elements.journeyStepPanel.innerHTML = `
    <header>
      <span class="step-number">${escapeHtml(step.id)}</span>
      <h3>${escapeHtml(step.title)}</h3>
      <span class="object-chip">${escapeHtml(step.object)}</span>
      ${appState.journeyStep >= meta.optionalFrom ? '<span class="optional-chip">OPTIONAL EXTENSION</span>' : ""}
    </header>
    <div class="journey-step-grid">
      <section><span>HUMAN RESPONSIBILITY</span><p>${escapeHtml(step.human)}</p></section>
      <section><span>SYSTEM RESPONSIBILITY</span><p>${escapeHtml(step.system)}</p></section>
      <section><span>EVIDENCE / POLICY</span><p>${escapeHtml(step.evidence)}</p></section>
      <section><span>AVAILABLE CONTROLS</span><p>${escapeHtml(step.controls)}</p></section>
      <section><span>DEGRADATION</span><p>${escapeHtml(step.degradation)}</p></section>
      <section><span>STABLE OUTPUT / RECORD</span><p>${escapeHtml(step.artifact)}</p></section>
    </div>
    <section class="journey-conformance">
      <span>CONFORMANCE REFERENCES</span>
      <div><b>Patterns</b>${patternRefs}</div>
      <div><b>Core Components</b>${componentRefs}</div>
      <div><b>Acceptance</b>${acceptanceRefs}</div>
    </section>
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
  const fields = handoffExamples[appState.selectedJourney] ?? handoffExamples["quick-answer"];
  elements.handoffEnvelope.dataset.journey = appState.selectedJourney;
  elements.handoffEnvelope.innerHTML = fields
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
  elements.acceptanceGrid.innerHTML = acceptanceProtocols
    .map(
      (item) => `
        <article id="acceptance-${escapeHtml(item.code)}" class="acceptance-card" data-acceptance-id="${escapeHtml(item.code)}">
          <header>
            <span>${escapeHtml(item.code)} · TEST PROTOCOL</span>
            <b>${escapeHtml(item.status.toUpperCase())}</b>
          </header>
          <h3>${escapeHtml(item.name)}</h3>
          <p>${escapeHtml(item.summary)}</p>
          <details>
            <summary>查看可执行验收协议</summary>
            <dl>
              <div><dt>GIVEN</dt><dd>${escapeHtml(item.given)}</dd></div>
              <div><dt>WHEN</dt><dd>${escapeHtml(item.when)}</dd></div>
              <div><dt>THEN</dt><dd>${escapeHtml(item.then)}</dd></div>
              <div><dt>EVIDENCE</dt><dd>${escapeHtml(item.evidence)}</dd></div>
              <div><dt>THRESHOLD</dt><dd>${escapeHtml(item.threshold)}</dd></div>
              <div><dt>OWNER</dt><dd>${escapeHtml(item.owner)}</dd></div>
            </dl>
          </details>
        </article>
      `,
    )
    .join("");
  elements.readerMetrics.innerHTML = readerMetrics
    .map(
      (item) => `
        <article class="reader-metric"><span>REV 0.5 TARGET · NOT YET MEASURED</span><strong>${escapeHtml(item.value)}</strong><b>${escapeHtml(item.name)}</b><p>${escapeHtml(item.text)}</p></article>
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
  document.querySelectorAll("[data-density-option-inline]").forEach((button) => {
    button.addEventListener("click", () => setDensity(button.dataset.densityOptionInline));
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
      renderHandoffEnvelope();
    });
    button.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const next = buttons[(index + direction + buttons.length) % buttons.length];
      appState.selectedJourney = next.dataset.journeyOption;
      appState.journeyStep = 0;
      renderJourney();
      renderHandoffEnvelope();
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

  renderPromises();
  renderLayers();
  renderTaskProjection();
  renderKernelDistinctions();
  renderKernelExplorer();
  renderObjectLineage();
  renderContract();
  renderSemanticAxes();
  renderAxisLab();
  renderLifecycles();
  renderFamilies();
  renderPatterns();
  renderGuidanceFlows();
  renderSpecimenTabs();
  renderSpecimen();
  renderPatternAnatomy();
  renderPatternCoverage();
  renderJourney();
  renderHandoffEnvelope();
  renderAcceptance();
  bindStaticControls();
  setDensity(appState.density);
  renderRoute();

}

initialize();
