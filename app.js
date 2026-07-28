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
import { componentLabel, guidanceLabel, uiLabel } from "./src/locales/zh-CN.js";
import { enhanceMockBrowserFrames, mockBrowserFrameHtml } from "./src/mock-browser-frame.js";

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
    { id: "revision", label: "修订版本已固定", result: "pass", detail: "ART-052 r3" },
    { id: "narrative", label: "叙事数字与工作结果一致", result: "pass", detail: "通过" },
    { id: "freshness", label: "依据仍在有效期内", result: "pass", detail: "通过" },
    { id: "permission", label: "受众权限有效", result: "pass", detail: "PERM-88" },
  ],
  invalidationReason: "依据快照已变化或过期",
  revalidationRequirements: [
    "对象 ID 与修订版本未变化",
    "依据快照仍为当前版本",
    "管控策略与权限版本仍有效",
  ],
};

const kernelData = [
  {
    id: "goal",
    code: "GOAL",
    name: "目标",
    question: "本次工作要回答、建立或改变什么？",
    definition: "用户或组织希望本次工作满足的目标与判断条件。目标可以是“得到可信答案”，不必总是业务 KPI 改善。",
    visible: ["目标说明", "完成条件", "负责人与受众", "范围与约束"],
    governance: "目标变化会产生新的修订版本；不得用用户离开或系统完成输出代替目标完成判断。",
  },
  {
    id: "context",
    code: "CONTEXT",
    name: "上下文",
    question: "人工智能正在使用哪些信息、规则和历史？",
    definition: "与当前工作相关且获得授权的业务语义、流程状态、数据、文档、知识、规则和历史。",
    visible: ["来源与更新时间", "权限范围", "会话与长期记忆边界", "移除与纠正"],
    governance: "上下文必须可查看、纠正和追溯；持久化必须有明确的负责人和适用范围。",
  },
  {
    id: "plan",
    code: "PLAN",
    name: "计划",
    question: "为了实现目标，系统准备按什么路径工作？",
    definition: "复杂任务需要一条可检查的工作路径。简单问答无需为了满足框架而额外创建计划。",
    visible: ["可开始 / 按条件 / 已阻断", "依赖项", "负责人", "下一步"],
    governance: "人工智能可以推荐计划；超出范围或涉及高风险业务操作的节点必须重新确认。",
  },
  {
    id: "evidence",
    code: "EVIDENCE",
    name: "依据",
    question: "工作结果、结论或决策建立在什么依据上？",
    definition: "能够回到数据、文档、规则、事件或执行记录的可验证依据。",
    visible: ["来源与语义版本", "方法", "范围与更新时间", "状态与限制"],
    governance: "依据状态不能推出权限或人工智能可推进范围；依据变化会使相关校验结果失效。",
  },
  {
    id: "result",
    code: "RESULT",
    name: "工作结果",
    question: "系统本次实际交付了什么？",
    definition: "由某个工作对象的修订版本产生、可引用且不可静默改写的输出记录，例如直接回答、计算结果、分析块或草稿。",
    visible: ["结果 ID 与修订版本", "类型与内容", "范围与更新时间", "依据引用与限制"],
    governance: "工作结果不自动等于交付物、决策、业务操作或业务成效；后续工作引用它，而不是回写它。",
  },
  {
    id: "resolution",
    code: "GOAL RESOLUTION",
    name: "目标完成判断",
    question: "本次目标的判断条件是否已经满足？",
    definition: "绑定目标修订版本与工作结果修订版本的评估记录；判断结果与观察依据分别记录。",
    visible: ["目标条件", "判断状态", "观察依据", "判断人及时间"],
    governance: "系统可以依据明确条件评估；用户离开只表示“未观测”，不能据此推断成功。",
  },
  {
    id: "artifact",
    code: "ARTIFACT",
    name: "交付物",
    question: "工作结果是否需要被整理、版本化并面向受众发布？",
    definition: "可选的稳定工作产物，例如简报、分析文档、研究看板或方案稿；它可以汇集一个或多个工作结果。",
    visible: ["交付物 ID 与修订版本", "受众", "来源结果引用", "发布状态"],
    governance: "只有存在复用、协作或发布需要时才创建；交付物不得重新发明工作结果中的事实。",
  },
  {
    id: "decision",
    code: "DECISION",
    name: "决策",
    question: "选择了什么、为什么、由谁负责？",
    definition: "由依据和业务判断形成的明确选择，包含选项、备选方案、理由和负责人。",
    visible: ["已选方案", "备选方案", "依据", "负责人与审批"],
    governance: "建议不是决策；决策变化会产生新的修订版本，不重写历史。",
  },
  {
    id: "action",
    code: "ACTION",
    name: "业务操作",
    question: "什么将改变外部状态，影响是什么？",
    definition: "调用工具、智能体或业务系统改变外部状态的受控操作。",
    visible: ["执行主体与目标对象", "参数与范围", "权限与管控策略", "风险与可恢复性"],
    governance: "严格区分准备、批准、排队和执行；执行前重新校验治理快照。",
  },
  {
    id: "business-outcome",
    code: "BUSINESS OUTCOME",
    name: "业务成效",
    question: "真实业务状态是否在观察窗口内发生变化？",
    definition: "只在真实业务操作或流程发生后，由权威记录系统证明的业务后置条件；与业务操作的执行状态分开。",
    visible: ["关联业务操作 / 事项", "预期与实际", "权威记录系统", "观察窗口"],
    governance: "业务操作执行成功不自动代表业务改善；无法观察时保持“等待观测”或“无法判断”。",
  },
  {
    id: "feedback",
    code: "FEEDBACK",
    name: "反馈",
    question: "这次工作应怎样修正当前任务或改进系统？",
    definition: "来自用户、业务结果、系统执行和评估机制的改进信号。",
    visible: ["信号类型", "适用范围", "去向", "拟议变更与负责人"],
    governance: "区分即时纠正、记忆提案、规则提案和模型反馈。",
  },
];

const kernelDistinctionData = [
  { id: "result", title: "工作结果", when: "系统产生输出时", owns: "内容、范围、依据与限制", not: "不自动等于可发布文档" },
  { id: "artifact", title: "交付物", when: "需要复用、协作或发布时", owns: "内容组织、受众、修订版本与发布", not: "不重新定义工作结果中的事实" },
  { id: "resolution", title: "目标完成判断", when: "判断本次任务是否满足时", owns: "目标条件与观察依据", not: "用户离开不等于成功" },
  { id: "business-outcome", title: "业务成效", when: "真实业务操作或流程发生后", owns: "权威记录系统中的业务后置条件", not: "业务操作成功不等于业务改善" },
];

const objectLineageData = [
  { id: "root", type: "根工作对象", ref: "ROOT-018", state: "Active", parent: "", purpose: "维持目标、负责人和跨对象连续性。", lifecycle: "根对象自身不冒充子对象的生命周期。" },
  { id: "analysis", type: "分析", ref: "ANL-118 r4", state: "Result Ready", parent: "ROOT-018", purpose: "产生可验证的分析结果。", lifecycle: "分析工作的状态。" },
  { id: "result", type: "工作结果", ref: "RSLT-118 r1", state: "Delivered", parent: "ANL-118 r4", purpose: "保存不可静默改写的计算与结论。", lifecycle: "无独立流程；通过修订版本引用。" },
  { id: "artifact", type: "交付物", ref: "ART-052 r3", state: "Published", parent: "RSLT-118 r1", purpose: "把工作结果整理成受众简报。", lifecycle: "使用发布生命周期。" },
  { id: "decision", type: "决策", ref: "DEC-052 r1", state: "Confirmed", parent: "RSLT-118 r1", purpose: "记录负责人作出的明确选择。", lifecycle: "使用决策记录状态。" },
  { id: "action", type: "业务操作", ref: "ACT-077 r2", state: "Succeeded", parent: "DEC-052 r1", purpose: "记录受控的外部改变及执行事实。", lifecycle: "使用业务操作生命周期，结束于执行状态。" },
  { id: "business-outcome", type: "业务成效", ref: "BOUT-077 r1", state: "Pending Observation", parent: "ACT-077 r2", purpose: "等待权威记录系统证明业务后置条件。", lifecycle: "独立观察记录，不回写业务操作。" },
];

const routeMeta = {
  brief: {
    title: "体验叙事",
    description: "管理层与首次接触者的五分钟入口。",
    status: "配套说明",
    statusClass: "companion",
    railQuestion: "这套设计解决什么问题？",
    railReading: "先看核心判断和改造前后，再按你的问题进入架构、设计系统或体验设计指导。",
    railNext: { route: "architecture", label: "查看规范架构", description: "理解界面规则背后的工作模型" },
  },
  architecture: {
    title: "核心架构",
    description: "五层架构、跨层机制与两种人机协作约定。",
    status: "核心规范",
    statusClass: "canonical",
    railQuestion: "系统需要保存哪些工作信息？",
    railReading: "先看五层整体关系，再按左侧目录查看共享工作模型、人机协作约定和生命周期。",
    railNext: { route: "guidance", label: "查看体验设计指导", description: "把架构规则落实到完整界面" },
  },
  "design-system": {
    title: "EIX 核心设计系统",
    description: "通用视觉基础、布局原语、组件与实现规范。",
    status: "候选标准",
    statusClass: "candidate",
    railQuestion: "界面如何一致地构建？",
    railReading: "从基础样式、布局原语进入通用组件；业务协作规则不在这里定义。",
    railNext: { route: "guidance", label: "查看体验设计指导", description: "了解组件如何组合成企业人工智能工作界面" },
  },
  guidance: {
    title: "体验设计指导",
    description: "完整界面参考，以及两类智能协作场景的交互规则和模式。",
    status: "候选配套规范",
    statusClass: "candidate",
    railQuestion: "两类企业人工智能界面应该怎样工作？",
    railReading: "先切换三套完整界面；需要实施细节时，再展开交互模式规范。",
    railNext: { route: "journeys", label: "查看端到端场景", description: "检验界面组合后能否完成一项工作" },
  },
  patterns: {
    title: "交互模式库迁移说明",
    description: "Rev 0.2 兼容入口；新版内容已迁入智能体验设计指导。",
    status: "候选内容",
    statusClass: "candidate",
    railQuestion: "旧版交互模式去哪里了？",
    railReading: "此兼容入口会带你进入新版体验设计指导。",
    railNext: { route: "guidance", label: "进入新版体验设计指导", description: "查看完整界面和交互模式" },
  },
  journeys: {
    title: "端到端场景",
    description: "展示用户目标如何跨页面推进、结束或交给另一个工作对象继续。",
    status: "配套说明",
    statusClass: "companion",
    railQuestion: "一项工作如何从开始走到结束？",
    railReading: "先选一个业务场景，再逐步查看人的责任、系统责任、依据、控制和降级路径。",
    railNext: { route: "acceptance", label: "进入设计检查", description: "验证场景中的界面是否清楚、可控、可恢复" },
  },
  acceptance: {
    title: "设计检查",
    description: "供产品、界面与用户体验及工程团队评审理解、控制、恢复与无障碍。",
    status: "核心规范",
    statusClass: "canonical",
    railQuestion: "设计方案交付前要检查什么？",
    railReading: "先执行八项界面检查；自动化通过后，再安排真实用户理解测试。",
    railNext: { route: "brief", label: "返回五分钟导读", description: "从全局重新确认设计目标和适用对象" },
  },
  document: {
    title: "文档阅读器",
    description: "以 UTF-8 读取并渲染核心规范与配套 Markdown 文档。",
    status: "源文档",
    statusClass: "canonical",
    railQuestion: "这份源文档定义了什么？",
    railReading: "使用左侧目录定位章节；浏览结束后返回进入文档前的页面。",
    railNext: { route: "brief", label: "返回站点导读", description: "重新选择适合你的阅读入口" },
  },
};

const documentRegistry = {
  charter: {
    file: "ENTERPRISE_INTELLIGENCE_EXPERIENCE_2.0_CONCEPT_CHARTER.md",
    title: "企业智能体验原则 2.0",
    description: "唯一核心架构源：共享工作模型、人机协作约定、工作对象、治理原则与验收不变量。",
    identity: "核心规范 · 概念章程 · 修订0.5",
    routeIdentity: "核心架构源",
    status: "核心规范",
    statusClass: "canonical",
  },
  narrative: {
    file: "EIX_2.0_EXPERIENCE_NARRATIVE.md",
    title: "EIX 2.0 体验叙事",
    description: "面向管理层与首次接触者的五分钟体验说明。",
    identity: "配套说明 · 体验叙事 · 修订0.5",
    routeIdentity: "配套文档",
    status: "配套说明",
    statusClass: "companion",
  },
  "design-system": {
    file: "EIX_2.0_CORE_DESIGN_SYSTEM.md",
    title: "EIX 核心设计系统",
    description: "品牌中性的设计变量、基础规范、布局基础件、通用组件与工程治理标准。",
    identity: "候选标准 · 核心设计系统 · 修订0.5",
    routeIdentity: "候选标准",
    status: "候选内容",
    statusClass: "candidate",
  },
  visualization: {
    file: "EIX_2.0_COLLABORATIVE_VISUALIZATION_STANDARD.md",
    title: "Collaborative Intelligence 数据表达规范",
    description: "工作问题到图形语法、ChartBlock、前置检查、依据绑定与降级表达的候选扩展。",
    identity: "候选扩展 · 数据表达规范 · 修订0.1",
    routeIdentity: "设计系统领域扩展",
    status: "候选内容",
    statusClass: "candidate",
  },
  guidance: {
    file: "EIX_2.0_INTELLIGENCE_UX_GUIDANCE.md",
    title: "智能体验设计指导",
    description: "Process Intelligence 与 Collaborative Intelligence 的领域体验指导。",
    identity: "候选配套规范 · 智能体验设计指导 · 修订0.5",
    routeIdentity: "候选配套规范",
    status: "候选内容",
    statusClass: "candidate",
  },
  consolidation: {
    file: "EIX_2.0_CONSOLIDATION_RECORD.md",
    title: "EIX 2.0 Rev 0.4 方案合并记录",
    description: "记录 EIX Rev 0.3 与 Claude GAX 两套方案中哪些内容被吸收、改造或拒绝，以及原因。",
    identity: "决策记录 · 合并候选稿 · 修订0.4",
    routeIdentity: "方案合并记录",
    status: "配套说明",
    statusClass: "companion",
  },
  rev05: {
    file: "EIX_2.0_REV_0.5_DECISION_RECORD.md",
    title: "EIX 2.0 Rev 0.5 决策记录",
    description: "记录共享工作模型从固定序列改为任务投影关系模型，以及工作结果、交付物、目标完成判断与业务成效的边界。",
    identity: "决策记录 · 修订0.5",
    routeIdentity: "核心架构变更记录",
    status: "配套说明",
    statusClass: "companion",
  },
  patterns: {
    file: "EIX_2.0_PATTERN_SPECIMEN_LIBRARY.md",
    title: "交互模式示例库迁移说明",
    description: "旧交互模式文档的兼容入口与 Rev 0.2 归档路径。",
    identity: "迁移说明 · 修订0.5",
    routeIdentity: "兼容文档",
    status: "已迁移",
    statusClass: "candidate",
  },
};

/** @type {ExperiencePromise[]} */
const promiseData = [
  {
    id: "clarity",
    name: "清晰",
    cn: "方向",
    fear: "“人工智能到底理解成了什么？它是不是静默改变了我的问题？”",
    mechanisms: ["目标与范围常驻", "意图变更差异", "工作对象、负责人与修订版本可见"],
    promise: "当前目标、口径和状态始终可见。",
  },
  {
    id: "trust",
    name: "可信",
    cn: "可信",
    fear: "“这个结论写得很好，但它真的有可靠依据吗？”",
    mechanisms: ["类型明确的依据回执", "结论类型分层", "更新时间与限制", "依据变化会使校验失效"],
    promise: "我能从任何重要结论回到来源、方法和边界。",
  },
  {
    id: "control",
    name: "掌控",
    cn: "掌控",
    fear: "“人工智能是在建议、准备，还是已经替我执行了？”",
    mechanisms: ["准备 / 批准 / 执行分开", "业务操作预览", "权限与管控策略分别校验"],
    promise: "改变现实之前，我先看见后果。",
  },
  {
    id: "momentum",
    name: "推进",
    cn: "推进",
    fear: "“系统是在工作、卡住，还是只是在播放动画？”",
    mechanisms: ["计划可检查", "基础结果先返回", "部分失败仍保留已核验结果"],
    promise: "我知道已完成什么、正在做什么、还缺什么。",
  },
  {
    id: "continuity",
    name: "连续",
    cn: "连续",
    fear: "“为什么追问、交接或换页面后又要重新解释背景？”",
    mechanisms: ["根工作对象", "修订版本与分支", "交接信息包", "同一修订版本支持不同阅读密度"],
    promise: "工作可以跨角色、页面和时间继续。",
  },
  {
    id: "calm",
    name: "从容",
    cn: "从容",
    fear: "“为了保证人工智能没犯错，我是不是要监督每一步？”",
    mechanisms: ["异常优先", "正常路径保持安静", "未知与恢复过程可见", "不把自动化比例当作唯一目标"],
    promise: "正常路径保持安静，只有需要判断的异常请求我的注意。",
  },
];

const architectureLayers = [
  {
    code: "L5",
    name: "体验结果",
    cn: "任务与体验成效",
    detail: "清晰 · 可信 · 掌控 · 推进 · 连续 · 从容",
    owner: "用户研究 · 产品 · 业务",
    output: "可衡量的任务与体验结果",
    target: "architecture-outcomes",
    expands: "用户最终感受到什么，以及如何验证",
  },
  {
    code: "L4",
    name: "稳定工作界面",
    cn: "工作对象的承载界面",
    detail: "首页 · 收件箱 · 事项 · 协作任务 · 分析 · 决策 · 流程控制台",
    owner: "产品 · 体验设计 · 工程",
    output: "稳定工作界面与参考组合",
    target: "architecture-surfaces",
    expands: "工作对象出现在哪里，界面承担什么责任",
  },
  {
    code: "L3",
    name: "人机协作约定",
    cn: "两种协作方式",
    detail: "Process Intelligence · Collaborative Intelligence",
    owner: "产品 · 体验设计 · 治理",
    output: "人机责任、状态、控制与反馈约定",
    target: "architecture-contracts",
    expands: "谁发起、谁判断、谁推进、何时停下",
  },
  {
    code: "L2",
    name: "共享工作模型",
    cn: "跨场景的记录关系",
    detail: "目标与上下文是起点；工作结果与目标完成判断形成最短闭环；其余记录按任务需要关联",
    owner: "产品 · 体验设计 · 平台",
    output: "关系模型、任务投影与共享记录契约",
    target: "architecture-kernel",
    expands: "工作需要记录什么，以及对象如何保持连续",
    kernel: true,
  },
  {
    code: "L1",
    name: "企业智能基础",
    cn: "系统能力与治理底座",
    detail: "业务概念与口径 · 模型 · 智能体 · 工具 · 系统 · 身份 · 治理",
    owner: "架构 · 人工智能 · 数据 · 安全",
    output: "系统能力、语义与政策",
    target: "architecture-foundation",
    expands: "能力、数据、身份与治理约束",
  },
];

const architectureNavigationGroups = [
  {
    id: "overview",
    label: "架构总览",
    items: [{ id: "architecture-model", code: "总览", label: "整体关系" }],
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
    mode: "系统主导 · 状态驱动 · 异常优先",
    name: "Process Intelligence",
    statement: "系统在明确规则、权限和控制范围内推进结构化工作；人在关键决定、异常和边界中保持有效控制。",
    object: "事项",
    flow: {
      label: "Process Intelligence主路径与异常分支",
      steps: [
        { label: "业务事件" },
        { label: "理解" },
        { label: "校验" },
        { label: "决策", kind: "decision" },
        { label: "准备" },
        { label: "批准", kind: "gate", qualifier: "按需" },
        { label: "执行" },
        { label: "核验" },
      ],
      branches: [
        {
          label: "异常路径",
          kind: "recovery",
          items: ["恢复"],
          note: "执行或核验出现失败 / 部分完成时进入，不是固定下一步。",
        },
      ],
    },
    system: ["维护事项状态与依赖", "执行规则、权限和风险校验", "准备并执行受控业务操作", "记录业务操作状态、业务成效与反馈"],
    human: ["确认边界与高影响决策", "处理管控策略例外", "接管无法恢复的事项", "批准规则提案"],
    visible: ["事项标识与负责人", "必须由人完成的决策", "业务操作 / 批准 / 执行分离", "业务成效与恢复"],
  },
  collaborative: {
    mode: "人主导 · 目标驱动 · 结果优先",
    name: "Collaborative Intelligence",
    statement: "人定义目标、约束和最终判断；人工智能先交付可验证的工作结果，再按需要延伸为交付物、决策或受控业务操作。",
    object: "协作任务",
    flow: {
      label: "Collaborative Intelligence最短闭环与可选延伸",
      steps: [
        { label: "明确任务" },
        { label: "组织上下文" },
        { label: "产出工作结果" },
        { label: "判断目标是否满足" },
        { label: "结束 / 继续", kind: "gate" },
      ],
      branches: [
        {
          label: "合法结束",
          kind: "terminal",
          items: ["目标完成判断"],
          note: "结果已经回答当前目标时，可以在这里合法结束。",
        },
        {
          label: "按需继续",
          kind: "conditional",
          items: ["交付物", "决策", "业务操作提案"],
          note: "只有任务需要时才创建新的关联工作对象。",
        },
      ],
    },
    system: ["解释目标并识别歧义", "生成可引用的工作结果", "绑定依据并说明限制", "推荐但不强迫可选延伸"],
    human: ["确认目的和边界", "提供业务判断与新上下文", "判断依据是否充分", "决定结束、继续、发布或行动"],
    visible: ["协作任务目标与上下文", "工作结果与目标完成判断", "依据、限制与分支", "可选计划、交付物与业务操作交接"],
  },
};

/** @type {{id:string, label:string, title:string, explanation:string, fields:SemanticField[]}[]} */
const semanticQuestionData = [
  {
    id: "trust",
    label: "01 · 判断结论可信度",
    title: "这个结论能信到什么程度？",
    explanation: "先看它说的是什么、依据够不够，以及是否需要说明不确定性。",
    fields: [
      {
        id: "claim",
        name: "内容类型",
        question: "这句话是事实、计算、假设、预测，还是建议？",
        description: "不同内容需要不同的证据和措辞；内容类型本身不代表可以执行。",
        values: ["事实", "计算", "假设", "预测", "建议"],
        color: "var(--claim-color)",
      },
      {
        id: "evidence",
        name: "依据状态",
        question: "来源、范围和新鲜度足够支撑这句话吗？",
        description: "只回答依据是否充分，不回答风险或权限。",
        values: ["未核验", "有依据", "已核验", "有争议", "已过期", "依据不足"],
        color: "var(--validation-color)",
      },
      {
        id: "uncertainty",
        name: "不确定性",
        question: "是否有经过校准、对决策有用的区间？",
        description: "没有可靠校准时不展示一个看似精确的小数。",
        values: ["经校准的区间", "情景范围", "不展示"],
        color: "var(--semantic-text-tertiary)",
      },
    ],
  },
  {
    id: "control",
    label: "02 · 控制业务操作",
    title: "这件事能不能做，谁来做？",
    explanation: "分别检查影响、权限和人工智能可推进到哪一步；任何一项都不能替代另外两项。",
    fields: [
      {
        id: "risk",
        name: "影响与可恢复性",
        question: "影响有多大，失败后能撤回或补偿吗？",
        description: "风险描述后果与恢复难度，不等于证据强弱。",
        values: ["低 / 中 / 高", "可撤销", "可补偿", "不可逆"],
        color: "var(--risk-color)",
      },
      {
        id: "permission",
        name: "权限与政策",
        question: "当前主体对这个对象和范围有权限吗？",
        description: "允许、按条件或拒绝必须绑定具体主体、操作、范围和管控策略版本。",
        values: ["允许", "按条件", "拒绝"],
        color: "var(--permission-color)",
      },
      {
        id: "autonomy",
        name: "人工智能可推进范围",
        question: "人工智能现在只能建议、可以准备，还是获准执行？",
        description: "权限通过后，仍要按当前管控策略明确人工智能最多可以推进到哪一步。",
        values: ["建议", "准备", "需要审批", "在管控策略范围内执行", "异常时介入"],
        color: "var(--eix-workflow-accent)",
      },
    ],
  },
  {
    id: "progress",
    label: "03 · 定位工作进展",
    title: "工作现在走到哪一步？",
    explanation: "只描述对象自身的进展，不把“审批过”“执行过”和“业务改善”混成一件事。",
    fields: [
      {
        id: "workflow",
        name: "工作状态",
        question: "这个对象当前是草稿、待处理、已批准、执行中还是已结束？",
        description: "每类工作对象拥有自己的生命周期；已批准、已执行与业务成效彼此独立。",
        values: ["草稿", "待处理", "已批准", "已排队", "执行中", "成功", "失败"],
        color: "var(--workflow-color)",
      },
    ],
  },
];

/** @type {LifecycleSpec[]} */
const lifecycleData = [
  {
    id: "publication",
    name: "发布",
    subject: "交付物修订版本",
    label: "发布主路径与发布后的版本状态",
    steps: [
      { label: "草稿" },
      { label: "已校验" },
      { label: "等待审批", kind: "gate", qualifier: "按需" },
      { label: "已发布" },
    ],
    branches: [
      {
        label: "后续版本状态",
        kind: "exit",
        items: ["已被取代", "已撤回"],
        note: "发布后的版本可以被替代或撤回，但不会被静默覆盖。",
      },
    ],
    rules: ["已校验不等于已发布", "已发布版本不可静默覆盖", "依据或范围变化会使旧校验失效"],
  },
  {
    id: "action",
    name: "业务操作",
    subject: "受控业务操作",
    label: "业务操作主路径、执行结果与恢复关系",
    steps: [
      { label: "已提出" },
      { label: "预检通过" },
      { label: "等待审批", kind: "gate", qualifier: "按需" },
      { label: "已批准" },
      { label: "已排队" },
      { label: "执行中" },
    ],
    branches: [
      {
        label: "执行结果",
        kind: "terminal",
        items: ["成功", "部分完成", "失败"],
        note: "三种结果互斥记录；部分完成或失败不会删除已经完成的工作。",
      },
      {
        label: "按需恢复",
        kind: "recovery",
        items: ["补偿操作"],
        note: "恢复操作创建一条引用原业务操作的新记录，不改写原执行事实。",
      },
    ],
    rules: ["批准不等于执行", "执行前原子重验治理快照", "补偿是引用原业务操作的新业务操作", "业务成效是独立关联记录"],
  },
  {
    id: "rule",
    name: "规则变更",
    subject: "规则提案",
    label: "规则变更主路径与停用状态",
    steps: [
      { label: "候选" },
      { label: "已起草" },
      { label: "已校验" },
      { label: "已批准", kind: "gate" },
      { label: "已进入预发布" },
      { label: "已启用" },
    ],
    branches: [
      {
        label: "受控退出",
        kind: "exit",
        items: ["已暂停", "已退役"],
        note: "暂停和退役是显式变更记录，不会抹掉历史启用状态。",
      },
    ],
    rules: ["单次判断只产生候选规则", "职责分离、回放和冲突扫描先于启用", "启用只影响未来范围匹配的事项"],
  },
];

const familyData = [
  { code: "C01", name: "知识与研究", question: "我们知道什么，依据和冲突是什么？", artifact: "研究看板 · 依据地图" },
  { code: "C02", name: "分析", question: "发生了什么、为什么、接下来可能怎样？", artifact: "分析文档 · 情景画布" },
  { code: "C03", name: "决策支持", question: "面对不同选项，应如何形成可解释的选择？", artifact: "决策画布 · 决策记录" },
  { code: "C04", name: "创作与沟通", question: "如何形成可协作、可发布的业务产出？", artifact: "文档 · 演示稿 · 消息" },
  { code: "C05", name: "规划与行动", question: "如何把目标变成计划并安全推进？", artifact: "规划看板 · 业务操作队列" },
];

const analysisDimensions = [
  { name: "工作问题", values: "回答 · 探索 · 对比 · 监控 · 诊断 · 预测 · 模拟 · 决策" },
  { name: "发起方式", values: "用户发起 · 定时发起 · 事件触发 · 委托目标" },
  { name: "协作姿态", values: "直接操作 · 引导完成 · 共同创作 · 委托执行" },
  { name: "界面 / 交付物", values: "答案 · 工作区 · 看板 · 画布 · 简报 · 信息流" },
  { name: "业务操作权限", values: "读取 · 建议 · 准备 · 需要审批 · 在管控策略范围内执行" },
];

/** @type {PatternSpec[]} */
const patternData = guidancePatterns;

const patternAnatomyData = [
  { code: "A01", name: "用途与用户担忧", text: "先说明用户要完成什么、最担心什么，不从组件外形开始。" },
  { code: "A02", name: "工作对象与负责人", text: "声明交互模式作用于哪个工作对象，谁对结果负责。" },
  { code: "A03", name: "共享工作模型覆盖", text: "明确哪些记录必需、按条件出现、仅关联或不适用，以及合法停止点。" },
  { code: "A04", name: "固定区域与可选区域", text: "固定区保证含义完整；扩展区只增加领域内容或任务深度。" },
  { code: "A05", name: "独立状态字段", text: "每个预览控制只改变明确的一类状态；依据、风险、权限、人工智能可推进范围和工作进展彼此独立。" },
  { code: "A06", name: "产出与结束条件", text: "说明产生什么稳定记录、何时可以结束、哪些延伸只是可选。" },
  { code: "A07", name: "失败与恢复", text: "失败说明保留项、缺失项和下一步，人工接管不从头开始。" },
  { code: "A08", name: "响应式与无障碍", text: "小屏减少复杂操作，但保留关键风险、依据、键盘操作和等价文本。" },
  { code: "A09", name: "成熟度证据", text: "区分已收录、已定义、行为示例与已验证模式。" },
];

const independentStateFieldLabels = {
  ClaimKind: "内容类型",
  EvidenceStatus: "依据状态",
  Uncertainty: "不确定性",
  RiskAndReversibility: "影响与可恢复性",
  PermissionAndPolicy: "权限与管控策略",
  Autonomy: "人工智能可推进范围",
  WorkflowState: "工作状态",
};

/** @type {Record<string, JourneyStep[]>} */
const journeyData = {
  "quick-answer": [
    {
      id: "J-Q1",
      title: "明确目标与上下文",
      object: "MIS-021 · 协作任务",
      human: "提出问题；只在口径会改变答案时确认关键边界。",
      system: "解释目标，组装有权限且足够的上下文。",
      evidence: "CTX-021 · 来源 / 范围 / 更新时间",
      controls: "纠正范围、移除来源、结束。",
      degradation: "无法判定目标时，只问一个会改变答案的问题。",
      artifact: "目标记录 + 上下文快照",
    },
    {
      id: "J-Q2",
      title: "交付可信工作结果",
      object: "RSLT-021 r1 · 工作结果",
      human: "读取答案；按需打开来源或挑战结论。",
      system: "生成可引用的工作结果，绑定依据、范围和限制。",
      evidence: "RSLT-021 → EVD-021 · 已核验",
      controls: "查看依据、质疑结论、继续分析。",
      degradation: "依据不足时缩小结论范围或明确标记“依据不足”，不编造确定答案。",
      artifact: "工作结果记录",
    },
    {
      id: "J-Q3",
      title: "判断目标是否满足并结束",
      object: "GRES-021 r1 · 目标完成判断",
      human: "可以直接离开，也可以确认、追问或继续分析。",
      system: "依据明确条件记录“已满足 / 部分满足 / 未满足”；无法观察用户判断时记录“未观测”。",
      evidence: "目标修订版本 + 工作结果修订版本 + 观察依据",
      controls: "结束、继续、整理成交付物。",
      degradation: "用户离开不代表成功；工作结果保持“已交付”，目标完成判断保持“未观测”。",
      artifact: "目标完成判断 · 合法停止点",
    },
  ],
  collaborative: [
    {
      id: "J-A1",
      title: "明确目标",
      object: "MIS-041 · 协作任务",
      human: "确认业务目标、范围和最终使用者。",
      system: "解释目标并识别关键歧义。",
      evidence: "当前无结论；只组装有权限的上下文。",
      controls: "修改目标、移除上下文、结束。",
      degradation: "目标不可判定时只问一个关键问题。",
      artifact: "目标与上下文页头",
    },
    {
      id: "J-A2",
      title: "检查上下文",
      object: "MIS-041 r2",
      human: "检查来源、更新时间和记忆边界。",
      system: "组装已授权的上下文快照。",
      evidence: "CTX-041 · PERM-88",
      controls: "移除、纠正、增加来源。",
      degradation: "受限来源只显示限制及其影响，不泄露内容。",
      artifact: "上下文快照",
    },
    {
      id: "J-A3",
      title: "产出稳定工作结果",
      object: "ANL-118 · 分析",
      human: "检查分析范围；复杂任务才调整计划和优先级。",
      system: "先返回基础工作结果；按数据条件运行可选高阶方法。",
      evidence: "RSLT-118 → EVD-118；可选计划声明依赖。",
      controls: "查看依据、运行可选步骤、结束。",
      degradation: "高阶方法失败不清除已核验的基础工作结果。",
      artifact: "工作结果记录",
    },
    {
      id: "J-A4",
      title: "判断目标并选择后续",
      object: "GRES-118 r1",
      human: "决定当前工作结果是否足够，以及结束还是延伸。",
      system: "记录目标完成判断，并给出不超过三个有意义的可选延伸。",
      evidence: "目标修订版本 + RSLT-118 r1",
      controls: "结束、创建交付物、建立决策、提出业务操作。",
      degradation: "无法观察用户判断时记录“未观测”，不假定成功。",
      artifact: "目标完成判断 · 合法停止点",
    },
    {
      id: "J-A5",
      title: "可选 · 形成决策",
      object: "DEC-052 · 决策",
      human: "选择方案并承担决策责任。",
      system: "组织选项、取舍和影响。",
      evidence: "绑定使用的结论修订版本。",
      controls: "选择、要求补充依据、拒绝。",
      degradation: "依据不足时保持待处理。",
      artifact: "决策记录",
    },
    {
      id: "J-A6",
      title: "可选 · 整理并发布交付物",
      object: "ART-052 r3 · 简报",
      human: "批准发布内容和受众。",
      system: "准备叙事并运行一致性检查。",
      evidence: "发布校验绑定修订版本和依据。",
      controls: "发布、退回草稿、创建分支。",
      degradation: "依据过期会使旧发布校验失效。",
      artifact: "已发布简报",
    },
    {
      id: "J-A7",
      title: "可选 · 提出业务操作",
      object: "ACT-077 · 提案",
      human: "决定是否授权进入 Process Intelligence。",
      system: "准备目标对象、影响和约束。",
      evidence: "权限、管控策略与风险的执行前检查。",
      controls: "准备、提交审批、取消。",
      degradation: "权限拒绝时保持提案状态，不进入队列。",
      artifact: "业务操作预览与交接",
    },
  ],
  process: [
    {
      id: "J-B1",
      title: "推进事项",
      object: "CASE-204 · 事项",
      human: "监控例外与抽检，不逐条监督。",
      system: "按当前管控策略推进正常节点。",
      evidence: "POL-17 v6 · 权限快照",
      controls: "暂停、人工接管。",
      degradation: "无合法管控策略时停止。",
      artifact: "事项状态与审计记录",
    },
    {
      id: "J-B2",
      title: "提出异常",
      object: "CASE-204 · EXC-19",
      human: "确认是否需要开放调查。",
      system: "分类异常并保存已完成工作。",
      evidence: "失败记录、输入、规则评估。",
      controls: "重试、调查、人工接管。",
      degradation: "原因未知时明确显示“未知”。",
      artifact: "异常简报",
    },
    {
      id: "J-B3",
      title: "创建调查任务",
      object: "MIS-044 · 协作任务",
      human: "确认调查范围。",
      system: "创建已授权上下文和待回答的决策问题。",
      evidence: "HOF-31 · 交接信息包",
      controls: "接收、缩小范围、退回。",
      degradation: "受限字段被裁剪，并说明对调查的影响。",
      artifact: "调查任务",
    },
    {
      id: "J-B4",
      title: "记录人工决策",
      object: "DEC-057 · 决策",
      human: "形成有负责人的决策。",
      system: "整理依据和选项。",
      evidence: "不依赖尚不存在的新Rule。",
      controls: "确认、要求补充依据。",
      degradation: "证据不足时人工处理当前Case。",
      artifact: "决策记录",
    },
    {
      id: "J-B5",
      title: "处理当前事项",
      object: "ACT-081 · 业务操作",
      human: "在需要时批准，不假定已经执行。",
      system: "执行前检查、重验、执行和记录。",
      evidence: "当前管控策略、权限、目标状态。",
      controls: "批准、排队、执行、补偿。",
      degradation: "目标发生变化后重新授权。",
      artifact: "审批回执 + 执行回执",
    },
    {
      id: "J-B6",
      title: "提出未来规则",
      object: "RPROP-204 · 候选规则",
      human: "确认负责人、适用范围和反例。",
      system: "准备候选规则和校验范围。",
      evidence: "回放、反例、冲突、职责分离。",
      controls: "起草、校验、拒绝。",
      degradation: "单个案例不足时保留为候选规则。",
      artifact: "规则提案",
    },
    {
      id: "J-B7",
      title: "预发布并观察",
      object: "RULE-204 v1",
      human: "独立批准并决定启用范围。",
      system: "影子运行、小范围试运行、监控与紧急停用。",
      evidence: "校验报告与变更审批。",
      controls: "预发布、启用、暂停、回滚。",
      degradation: "指标恶化时暂停规则并通知负责人。",
      artifact: "规则变更回执",
    },
  ],
};

const journeyMeta = {
  "quick-answer": {
    root: "ROOT-021",
    label: "得到可信答案并结束",
    stop: "用户已经得到有依据、有限制说明的答案；当前目标完成，可以在这里结束。",
    lineage: ["提出问题", "形成工作结果", "判断目标是否满足", "结束"],
    optionalFrom: Number.POSITIVE_INFINITY,
  },
  collaborative: {
    root: "ROOT-018",
    label: "从分析继续形成决定或交付物",
    stop: "得到可信分析后可以结束；只有用户明确继续，才进入决策、交付物或业务操作分支。",
    lineage: ["建立分析目标", "开展分析", "形成工作结果", "判断是否继续", "可选延伸"],
    optionalFrom: 4,
  },
  process: {
    root: "ROOT-204",
    label: "处理流程异常并提出规则改进",
    stop: "先解决当前异常；只有经过单独验证和审批，候选规则才可能影响未来事项。",
    lineage: ["流程事项", "发现异常", "调查原因", "人工决定", "处理当前事项", "候选规则"],
    optionalFrom: Number.POSITIVE_INFINITY,
  },
};

const handoffExamples = {
  "quick-answer": [
    { name: "当前场景", value: "得到可信答案并结束", description: "用户目标已经满足" },
    { name: "是否需要交接", value: "不需要", description: "没有新的负责人、业务操作或未完成事项" },
    { name: "何时重新开始", value: "问题范围改变或用户要求继续", description: "届时创建新的工作分支或关联对象" },
  ],
  collaborative: [
    { name: "当前场景", value: "分析继续形成决策或交付物", description: "分析向下一项明确工作交接" },
    { name: "根对象与追踪编号", value: "ROOT-018 · TRACE-9C21", description: "维持目标和可追溯连续性" },
    { name: "来源修订版本", value: "ANL-118 r4", description: "来源对象与不可变版本" },
    { name: "目标对象类型", value: "ACT-077 · 业务操作提案", description: "创建类型明确的新对象" },
    { name: "目标与范围", value: "GOAL-018 · 已批准范围", description: "沿用已确认的业务范围" },
    { name: "上下文快照", value: "CTX-041 · 2026-07-26", description: "已授权上下文与更新时间" },
    { name: "依据", value: "CLM-118 → EVD-118", description: "保留结论与依据关系" },
    { name: "决策负责人", value: "角色 · 业务负责人", description: "记录承担决策责任的业务角色" },
    { name: "管控策略与权限", value: "POL-17 v6 · PERM-88", description: "执行前按当前快照重新校验" },
  ],
  process: [
    { name: "当前场景", value: "流程异常处理与规则改进", description: "事项向调查任务交接" },
    { name: "根对象与追踪编号", value: "ROOT-204 · TRACE-2041", description: "关联事项与调查对象" },
    { name: "来源修订版本", value: "CASE-204 · EXC-19", description: "保留触发调查的异常" },
    { name: "目标对象类型", value: "MIS-044 · 调查任务", description: "创建拥有独立生命周期的协作任务" },
    { name: "目标与范围", value: "仅调查 EXC-19", description: "限定调查目标与边界" },
    { name: "上下文快照", value: "CTX-204 · 受限", description: "裁剪后的已授权上下文" },
    { name: "依据", value: "EXC-19 → EVD-204", description: "携带失败记录与规则评估" },
    { name: "决策负责人", value: "角色 · 事项负责人", description: "记录接收调查结论的责任角色" },
    { name: "返回约定", value: "DEC-057 → CASE-204", description: "决策通过追踪编号返回原事项" },
  ],
};

const referenceFlowData = [
  {
    id: "ask-conclude",
    title: "提问 → 形成结论",
    contract: "Collaborative Intelligence",
    label: "从提出问题到形成可信答案",
    steps: [
      { label: "目标与上下文" },
      { label: "澄清", qualifier: "仅在会改变答案时" },
      { label: "有依据的工作结果" },
      { label: "目标完成判断", kind: "decision" },
    ],
    branches: [
      {
        label: "合法结束",
        kind: "terminal",
        items: ["结束"],
        note: "可信工作结果已经回答当前目标时，任务可以在这里结束。",
      },
      {
        label: "按需延伸",
        kind: "conditional",
        items: ["交付物", "决策", "业务操作提案"],
        note: "只有问题继续变深时才创建新的关联对象。",
      },
    ],
    stop: "可信工作结果交付后可以合法结束。计划、交付物、决策和业务操作只在问题继续变深时出现。",
  },
  {
    id: "event-action",
    title: "业务事件 → 业务操作",
    contract: "Process Intelligence",
    label: "从业务事件到受控执行",
    steps: [
      { label: "业务事件 / 事项" },
      { label: "管控策略与上下文" },
      { label: "能力快照" },
      { label: "业务操作预检" },
      { label: "批准", kind: "gate", qualifier: "按需" },
      { label: "执行" },
      { label: "业务操作状态" },
    ],
    branches: [
      {
        label: "关联观察",
        kind: "linked",
        items: ["业务成效"],
        note: "业务成效由后续系统事实证明，不是业务操作自动进入的下一状态。",
      },
    ],
    stop: "能力声明不等于权限；权限拒绝、范围缺失或能力暂停时不显示执行入口。",
  },
  {
    id: "exception-investigation",
    title: "异常 → 调查",
    contract: "Cross-contract Handoff",
    label: "从流程异常到调查再返回Case",
    steps: [
      { label: "异常" },
      { label: "交接信息包" },
      { label: "调查任务" },
      { label: "决策记录", kind: "decision" },
      { label: "返回事项" },
    ],
    branches: [],
    stop: "分析与事项通过追踪编号关联，不能在同一对象上静默切换生命周期。",
  },
  {
    id: "decision-rule",
    title: "决策 → 候选规则",
    contract: "Process Intelligence",
    label: "从一次人工判断到未来规则",
    steps: [
      { label: "人工决策" },
      { label: "候选规则" },
      { label: "回放与冲突扫描" },
      { label: "职责分离审批", kind: "gate" },
      { label: "预发布" },
      { label: "启用并监控" },
    ],
    branches: [
      {
        label: "合法结束",
        kind: "terminal",
        items: ["保留候选规则", "拒绝"],
        note: "依据不足或审批未通过时可以停止，不会影响未来事项。",
      },
    ],
    stop: "单次人工判断只产生候选规则；未验证、未审批或未进入预发布时不得影响未来事项。",
  },
];

const experienceSignalData = [
  { promise: "清晰", leading: "范围纠正率 · 重复澄清次数", outcome: "意图误解导致的返工率" },
  { promise: "可信", leading: "依据展开率 · 限制阅读率", outcome: "结论采用、争议与撤回比例" },
  { promise: "掌控", leading: "预览、暂停与接管行为", outcome: "未授权业务操作与不可恢复错误为 0" },
  { promise: "推进", leading: "首个有效结果时间 · 部分结果保留率", outcome: "目标完成时间与等待中断率" },
  { promise: "连续", leading: "分支、修订版本与交接延续率", outcome: "重复解释上下文的时间" },
  { promise: "从容", leading: "异常信噪比 · 无效提醒率", outcome: "人工监督负担与恢复耗时" },
];

const readerMetrics = [
  {
    name: "架构是否易懂",
    question: "首次阅读者能否解释共享工作模型如何按任务需要组合记录与关系？",
    method: "无上下文复述与场景归类",
    threshold: "至少九成关键关系判断正确",
  },
  {
    name: "状态是否会被混淆",
    question: "用户能否区分依据质量、风险、权限和人工智能可推进范围？",
    method: "独立状态组合判断题",
    threshold: "至少八成半组合判断正确",
  },
  {
    name: "工作进展是否清楚",
    question: "用户能否区分工作结果、目标完成判断、业务操作状态与业务成效？",
    method: "任务状态辨识与口头解释",
    threshold: "至少九成半关键状态判断正确",
  },
  {
    name: "能否选对界面模式",
    question: "用户能否为给定场景选择合适的交互模式和停止点？",
    method: "场景卡片排序与理由访谈",
    threshold: "至少八成半场景选择正确",
  },
  {
    name: "文档身份是否明确",
    question: "读者能否区分核心规范、配套说明、参考实现和候选内容？",
    method: "站点定位复述",
    threshold: "所有参与者都能指出各自用途",
  },
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
  selectedGuidanceComposition: "collaborative",
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
    message: "发布校验尚未运行。",
  },
  plan: {
    step: 0,
  },
  action: {
    permission: "allowed",
    stage: "proposed",
    message: "业务操作只是提案，尚未获得授权。",
  },
  rule: {
    stage: "candidate",
    rejected: false,
    message: "当前只创建了候选规则；不会影响任何事项。",
  },
  capability: {
    scope: "complete",
    permission: "current",
    status: "available",
    message: "能力快照完整；业务操作仍需通过独立的执行前检查和业务操作校验。",
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
  railReading: document.querySelector("#railReading"),
  railNext: document.querySelector("#railNext"),
  railNextLabel: document.querySelector("#railNextLabel"),
  railNextDescription: document.querySelector("#railNextDescription"),
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
  guidanceCompositionTabs: document.querySelector("#guidanceCompositionTabs"),
  guidanceCompositionCanvas: document.querySelector("#guidanceCompositionCanvas"),
  guidanceCompositionSummary: document.querySelector("#guidanceCompositionSummary"),
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
let pendingInPageScroll = null;

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

function contractLabel(value) {
  return {
    shared: "共享",
    Shared: "共享",
    process: "Process Intelligence",
    Process: "Process Intelligence",
    collaborative: "Collaborative Intelligence",
    Collaborative: "Collaborative Intelligence",
    "Cross-contract Handoff": "跨约定交接",
  }[value] || value;
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

function rememberInPageScroll() {
  pendingInPageScroll = {
    left: window.scrollX,
    top: window.scrollY,
  };
}

function navigateHash(nextHash, { preserveScroll = false } = {}) {
  if (preserveScroll) rememberInPageScroll();
  if (window.location.hash === nextHash) {
    renderRoute({ focusMain: false });
    const savedScroll = pendingInPageScroll;
    pendingInPageScroll = null;
    if (savedScroll) {
      requestAnimationFrame(() => window.scrollTo(savedScroll));
    }
    return;
  }
  window.location.hash = nextHash;
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
  elements.documentContent.innerHTML = `<p class="document-loading">正在以 UTF-8 读取 Markdown 文档…</p>`;
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
  elements.railView.textContent = "这份源文档定义了什么？";
  elements.railViewDescription.textContent = spec.title;
  elements.railReading.textContent = "使用左侧目录定位章节；浏览结束后返回进入文档前的页面。";
  elements.railNext.href = `#/${request.from}`;
  elements.railNextLabel.textContent = `返回${routeMeta[request.from].title}`;
  elements.railNextDescription.textContent = "继续刚才的站点阅读路径";
  document.title = `${spec.title} · EIX 2.0`;

  try {
    const response = await fetch(`./${encodeURI(spec.file)}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const bytes = await response.arrayBuffer();
    if (loadToken !== appState.documentLoadToken) return;
    const markdown = new TextDecoder("utf-8").decode(bytes).replace(/^\uFEFF/, "");
    if (!window.marked?.parse) throw new Error("Markdown 渲染器不可用");
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
        <p>${escapeHtml(error instanceof Error ? error.message : "未知错误")}</p>
        <p>Markdown 源文件没有被修改。请确认本地静态服务仍在运行。</p>
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
  if (elements.modeLabel) elements.modeLabel.textContent = safeMode === "dark" ? "深色" : "浅色";
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
  elements.railView.textContent = meta.railQuestion;
  elements.railViewDescription.textContent = meta.description;
  elements.railReading.textContent = meta.railReading;
  elements.railNext.href = `#/${meta.railNext.route}`;
  elements.railNextLabel.textContent = meta.railNext.label;
  elements.railNextDescription.textContent = meta.railNext.description;
  document.title = `${meta.title} · EIX 2.0`;

  const routeView = document.querySelector(`[data-route-view="${appState.route}"]`);
  if (appState.route === "guidance") {
    syncGuidanceRoute();
    renderGuidanceComposition();
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
        elements.designSystemApp.innerHTML = `<div class="ds-load-error" role="alert"><strong>设计系统未能加载。</strong><p>${escapeHtml(error instanceof Error ? error.message : "未知错误")}</p></div>`;
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
        >${escapeHtml(item.name)}</button>
      `,
    )
    .join("");
  const item = promiseData[appState.selectedPromise];
  elements.promisePanel.innerHTML = `
    <section>
      <span>用户担忧</span>
      <blockquote>${escapeHtml(item.fear)}</blockquote>
    </section>
    <section>
      <span>设计机制</span>
      ${list(item.mechanisms)}
    </section>
    <section>
      <span>体验承诺</span>
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
          <div class="layer-owner"><span>负责人</span><small>${escapeHtml(layer.owner)}</small></div>
          <div class="layer-output">
            <span>展开查看</span>
            <small>${escapeHtml(layer.expands)}</small>
            <i aria-hidden="true">→</i>
          </div>
        </button>
      `,
    )
    .join("");

  elements.architectureCrossLinks.innerHTML = `
    <div>
      <span>跨层机制</span>
      <strong>贯穿多个工作对象、状态与界面。</strong>
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
    { label: "明确方向", ids: ["goal", "context"] },
    { label: "产出与判断", ids: ["plan", "evidence", "result", "resolution"] },
    { label: "可选延伸", ids: ["artifact", "decision", "action", "business-outcome"] },
    { label: "学习改进", ids: ["feedback"] },
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
    <span>任务投影 · ${escapeHtml(projection.label)}</span>
    <h3>${escapeHtml(projection.example)}</h3>
    <dl>
      <div><dt>合法停止点</dt><dd>${escapeHtml(projection.stop)}</dd></div>
      <div><dt>无法观察时</dt><dd>${escapeHtml(projection.unobserved)}</dd></div>
    </dl>
    <p>地图按“必需、条件性、关联、不适用”标记本任务需要的记录。</p>
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
        ? `<a href="#/guidance/${escapeHtml(pattern.contract)}/${escapeHtml(id)}">${escapeHtml(id)} · ${escapeHtml(guidanceLabel(pattern))}</a>`
        : `<span>${escapeHtml(id)}</span>`;
    })
    .join("");
  const componentLinks = path.componentIds
    .map((id) => {
      const component = catalogRegistry.find((item) => item.kind === "components" && item.id === id);
      return component
        ? `<a href="#${escapeHtml(component.route)}">${escapeHtml(componentLabel(component.id))}</a>`
        : `<span>${escapeHtml(id)}</span>`;
    })
    .join("");
  const acceptanceLinks = path.acceptanceIds
    .map((id) => `<a href="#/acceptance?focus=${escapeHtml(id)}">${escapeHtml(id)}</a>`)
    .join("");
  elements.conformancePathPanel.innerHTML = `
    <header>
      <span>从任务到界面</span>
      <h3>${escapeHtml(path.label)}采用 ${escapeHtml(contractLabel(path.contract))}，并引用以下交互模式、组件和验收方案。</h3>
    </header>
    <div class="conformance-path-grid">
      <section><span>适用的人机协作约定：</span><strong>${escapeHtml(contractLabel(path.contract))}</strong></section>
      <section><span>智能体验交互模式</span><div>${patternLinks}</div></section>
      <section><span>通用组件</span><div>${componentLinks}</div></section>
      <section><span>设计检查</span><div>${acceptanceLinks}</div></section>
      <section class="conformance-path-stop"><span>合法停止点</span><p>${escapeHtml(projection?.stop || "")}</p></section>
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
            <div><dt>何时产生</dt><dd>${escapeHtml(item.when)}</dd></div>
            <div><dt>负责记录</dt><dd>${escapeHtml(item.owns)}</dd></div>
            <div><dt>不代表</dt><dd>${escapeHtml(item.not)}</dd></div>
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
        ><b>${escapeHtml(item.name)}</b></button>
      `,
    )
    .join("");
  const item = kernelData[appState.selectedKernel];
  elements.kernelPanel.innerHTML = `
    <header>
      <div><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.question)}</p></div>
    </header>
    <div class="kernel-body">
      <section><span>定义</span><p>${escapeHtml(item.definition)}</p></section>
      <section><span>界面必须显示</span>${list(item.visible)}</section>
      <section><span>治理要求</span><p>${escapeHtml(item.governance)}</p></section>
      <section><span>适用方式</span><p>是否出现由任务投影决定；记录定义不代表固定顺序。</p></section>
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
          <small>${escapeHtml(uiLabel(item.state))}</small>
          ${index > 0 ? `<i aria-hidden="true">${escapeHtml(item.parent)}</i>` : ""}
        </button>
      `,
    )
    .join("");
  elements.objectLineageInspector.innerHTML = `
    <span>当前工作对象</span>
    <h3>${escapeHtml(selected.type)}</h3>
    <p>${escapeHtml(selected.purpose)}</p>
    <dl>
      <div><dt>引用编号</dt><dd>${escapeHtml(selected.ref)}</dd></div>
      <div><dt>自身状态</dt><dd>${escapeHtml(uiLabel(selected.state))}</dd></div>
      <div><dt>来源对象</dt><dd>${escapeHtml(selected.parent || "关系链起点")}</dd></div>
      <div><dt>生命周期规则</dt><dd>${escapeHtml(selected.lifecycle)}</dd></div>
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
      <div class="contract-object"><span>主要工作对象</span><strong>${escapeHtml(item.object)}</strong></div>
    </header>
    ${renderContractFlow(item.flow)}
    <div class="contract-details">
      <section><span>系统默认负责</span>${list(item.system)}</section>
      <section><span>人默认负责</span>${list(item.human)}</section>
      <section><span>界面必须显示</span>${list(item.visible)}</section>
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
    axis: "依据状态",
    label: "当前依据足以支撑这次业务操作吗？",
    values: [
      { value: "Verified", detail: "来源、范围和更新时间均达到当前管控策略要求。" },
      { value: "Supported", detail: "可以支撑人工判断，但尚未达到执行校验要求。" },
      { value: "Insufficient", detail: "关键支撑材料缺失，不能据此执行。" },
      { value: "Stale", detail: "依据快照已过期，需要重新校验。" },
    ],
  },
  {
    id: "permission",
    axis: "权限状态",
    label: "当前主体有权限吗？",
    values: [
      { value: "Allowed", detail: "执行主体、操作、范围和管控策略版本均匹配。" },
      { value: "Conditional", detail: "必须先解析并满足额外管控条件。" },
      { value: "Denied", detail: "当前主体或范围没有执行权限。" },
    ],
  },
  {
    id: "autonomy",
    axis: "人工智能可推进范围",
    label: "人工智能最多可以做到哪一步？",
    values: [
      { value: "Recommend", detail: "只能提出建议，不能准备或执行业务操作。" },
      { value: "Prepare", detail: "可以生成业务操作预览，不能进入执行。" },
      { value: "Approval Required", detail: "必须取得有效审批回执后才能继续。" },
      { value: "Execute Within Policy", detail: "其他校验通过后，可以在管控策略范围内执行。" },
    ],
  },
  {
    id: "workflow",
    axis: "业务操作状态",
    label: "这次业务操作走到哪一步？",
    values: [
      { value: "Proposed", detail: "业务操作已经提出，尚未完成执行前检查。" },
      { value: "Preflight Ready", detail: "执行前检查已经准备完成。" },
      { value: "Awaiting Approval", detail: "正在等待独立的审批回执。" },
      { value: "Approved", detail: "审批记录存在，但还没有排队或执行。" },
      { value: "Queued", detail: "业务操作已经进入执行队列。" },
      { value: "Executing", detail: "外部操作正在进行。" },
      { value: "Succeeded", detail: "业务操作执行成功；业务成效仍需独立观察。" },
      { value: "Partial", detail: "部分执行完成，需要判断恢复或补偿方式。" },
      { value: "Failed", detail: "执行失败；原业务操作状态必须保留。" },
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
    label: "依据检查",
    value: state.evidence,
    status: state.evidence === "Verified" ? "pass" : "block",
    detail: {
      Verified: "依据快照满足 AP-Control v4.2。",
      Supported: "可以支撑人工判断，但当前管控策略要求“已核验”。",
      Insufficient: "关键支撑材料缺失。",
      Stale: "依据快照已过期，旧校验结果必须失效。",
    }[state.evidence],
  };
  checks.push(evidenceCheck);

  const permissionCheck = {
    id: "permission",
    label: "权限检查",
    value: state.permission,
    status: state.permission === "Allowed" ? "pass" : state.permission === "Denied" ? "denied" : "block",
    detail: {
      Allowed: "执行主体、操作、范围和管控策略版本匹配。",
      Conditional: "附加条件尚未证明已经满足。",
      Denied: "当前主体或范围没有执行权限。",
    }[state.permission],
  };
  checks.push(permissionCheck);

  let autonomyStatus = "pass";
  let autonomyDetail = "当前人工智能可推进范围允许在其他检查通过后继续。";
  if (state.autonomy === "Recommend") {
    autonomyStatus = "limit";
    autonomyDetail = "人工智能只能提出建议，不能准备或执行业务操作。";
  } else if (state.autonomy === "Prepare") {
    autonomyStatus = "limit";
    autonomyDetail = "人工智能只能准备业务操作预览，不能进入执行。";
  } else if (state.autonomy === "Approval Required" && !approvalRecorded) {
    autonomyStatus = "block";
    autonomyDetail = "尚未取得有效审批回执。";
  } else if (state.autonomy === "Approval Required") {
    autonomyDetail = "审批回执已记录；它只满足审批要求。";
  }
  checks.push({
    id: "autonomy",
    label: "人工智能可推进范围检查",
    value: state.autonomy,
    status: autonomyStatus,
    detail: autonomyDetail,
  });

  const workflowStatus =
    activeState ? "active" : terminalState ? "record" : state.workflow === "Approved" ? "pass" : "record";
  checks.push({
    id: "workflow",
    label: "业务操作状态",
    value: state.workflow,
    status: workflowStatus,
    detail: {
      Proposed: "业务操作尚未完成执行前检查。",
      "Preflight Ready": "执行前检查已准备；仍需读取其他检查结果。",
      "Awaiting Approval": "等待审批回执，不等于权限被拒绝。",
      Approved: "审批记录存在，但已批准不等于已排队或已执行。",
      Queued: "业务操作已进入执行队列。",
      Executing: "外部操作正在进行。",
      Succeeded: "执行回执记录成功；业务成效仍独立。",
      Partial: "保留部分完成状态，并判断恢复或补偿方式。",
      Failed: "保留失败记录；重试或补偿必须创建关联业务操作。",
    }[state.workflow],
  });

  const blockingChecks = checks.filter((check) => ["block", "denied", "limit"].includes(check.status));
  const hasEvidenceBlock = evidenceCheck.status === "block";
  const hasPermissionBlock = ["block", "denied"].includes(permissionCheck.status);
  const nextActions = [];
  if (state.evidence === "Insufficient") nextActions.push("补充缺失依据并生成新的快照");
  if (state.evidence === "Stale") nextActions.push("刷新依据并使旧校验结果明确失效");
  if (state.evidence === "Supported") nextActions.push("完成依据核验，或记录管控策略例外");
  if (state.permission === "Conditional") nextActions.push("解析并满足权限条件");
  if (state.permission === "Denied") nextActions.push("交给正确负责人或申请合法范围");
  if (state.autonomy === "Approval Required" && !approvalRecorded) nextActions.push("获取独立审批回执");
  if (state.autonomy === "Recommend") nextActions.push("保留建议，不创建业务操作");
  if (state.autonomy === "Prepare") nextActions.push("生成业务操作预览与执行前检查材料");
  if (state.workflow === "Proposed") nextActions.push("运行执行前检查并记录结果");

  let decision = {
    status: "blocked",
    label: "已阻断",
    title: "仍不可执行",
    summary: "至少一个执行条件没有满足。检查会阻断业务操作，但不会替你改写任何输入状态。",
  };

  if (terminalState) {
    decision = {
      status: blockingChecks.length ? "attention" : "complete",
      label: blockingChecks.length ? "新操作需要重新校验" : "终态已记录",
      title: "终态已记录，禁止静默重跑",
      summary: "当前选择不会改写原业务操作终态；如需重试或补偿，必须创建新的关联业务操作。",
    };
    nextActions.push("查看执行回执与关联业务成效");
  } else if (activeState) {
    decision = blockingChecks.length
      ? {
          status: "attention",
          label: "暂停并重新校验",
          title: "暂停并重新校验",
          summary: "业务操作已经进入执行路径，但依据、权限或人工智能可推进范围发生阻断，必须保留当前状态并触发人工处理。",
        }
      : {
          status: "active",
          label: "执行中",
          title: state.workflow === "Queued" ? "已进入执行队列" : "正在执行",
          summary: "等待执行回执；不得提前描述为成功或产生业务成效。",
        };
    nextActions.push("监控业务操作状态并等待执行回执");
  } else if (!blockingChecks.length) {
    const ready =
      state.workflow === "Approved" ||
      (state.workflow === "Preflight Ready" && state.autonomy === "Execute Within Policy");
    decision = ready
      ? {
          status: "ready",
          label: "可以排队",
          title: "可以进入执行队列",
          summary: "四项检查允许下一步，但排队和执行仍需要新的状态记录与执行回执。",
        }
      : {
          status: "review",
          label: "继续执行前检查",
          title: "继续准备，尚未进入执行",
          summary: "当前四类信息没有互相冲突，但业务操作状态尚未达到可入队状态。",
        };
    nextActions.push(ready ? "提交排队状态并绑定校验快照" : "推进到预检通过或已批准");
  } else if (state.workflow === "Approved" && (hasEvidenceBlock || hasPermissionBlock)) {
    decision.summary = "审批记录存在，但它没有补足依据，也没有解除权限条件。";
  }

  return {
    ...decision,
    checks,
    blockingCount: blockingChecks.length,
    nextActions: [...new Set(nextActions)].slice(0, 3),
    prohibited: terminalState
      ? ["不覆盖原业务操作终态", "不把业务操作成功写成业务成效", "不静默重跑原业务操作"]
      : ["不把已批准写成已执行", "不把权限改写为依据", "不在检查通过前创建执行回执"],
  };
}

function renderAxisLab() {
  const state = appState.axisLab;
  const decision = evaluateAxisGate(state);
  const statusLabels = {
    pass: "通过",
    block: "阻断",
    denied: "拒绝",
    limit: "受限",
    active: "执行中",
    record: "已记录",
  };

  elements.axisLabResult.innerHTML = `
    <section class="axis-gate-summary" data-gate-status="${escapeHtml(decision.status)}">
      <span>当前综合判断</span>
      <strong>${escapeHtml(decision.title)}</strong>
      <p>${escapeHtml(decision.summary)}</p>
      <div>
        <b>${escapeHtml(decision.label)}</b>
        <small>${decision.blockingCount} 项阻断条件</small>
      </div>
    </section>
    <div class="axis-gate-detail">
      <section class="axis-gate-check-section">
        <header><span>判断依据</span><strong>四类信息分别记录，再综合判断能否继续</strong></header>
        <div class="axis-gate-checks">
          ${decision.checks
            .map(
              (check) => `
                <article data-check-status="${escapeHtml(check.status)}">
                  <div><span>${escapeHtml(check.label)}</span><strong>${escapeHtml(uiLabel(check.value))}</strong></div>
                  <p><b>${escapeHtml(statusLabels[check.status])}</b>${escapeHtml(check.detail)}</p>
                </article>
              `,
            )
            .join("")}
        </div>
      </section>
      <section class="axis-gate-actions">
        <div><span>现在可以做什么</span>${list(decision.nextActions)}</div>
        <div><span>不能据此推断什么</span>${list(decision.prohibited)}</div>
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
                  `<option value="${escapeHtml(item.value)}" ${state[control.id] === item.value ? "selected" : ""}>${escapeHtml(uiLabel(item.value))}</option>`,
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
    <header><h3>${escapeHtml(item.name)}生命周期</h3><span>适用对象 · ${escapeHtml(item.subject)}</span></header>
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
  if (requestedId) setDensity("deep");
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
            title: "全部智能协作模式",
            description: "共享机制、Process Intelligence 组合、Collaborative Intelligence 组合与跨约定交接。",
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

const guidanceCompositionData = {
  collaborative: {
    label: "Collaborative Intelligence 工作区",
    address: "eix.template/collaborative/analysis-workspace",
    principles: ["目标持续可见", "结论绑定依据", "用户决定是否继续"],
    promise: "让用户先得到可核验的工作结果，再决定是否追问、发布、形成决策或提出业务操作。",
    fixed: ["目标与分析范围", "工作结果及依据", "限制和更新时间", "继续、结束与交接入口"],
    optional: ["图表、表格和文本块", "分析计划", "工作分支与发布", "领域筛选和后续问题"],
  },
  process: {
    label: "Process Intelligence 工作台",
    address: "eix.template/process/exception-workbench",
    principles: ["异常优先", "人与系统责任分开", "操作可恢复"],
    promise: "让系统推进正常事项，把人的注意力集中在异常、决定、授权和恢复上。",
    fixed: ["事项身份与当前状态", "异常原因和影响", "准备、批准、执行分别记录", "接管、恢复与追踪入口"],
    optional: ["领域字段和队列分组", "业务操作预览", "规则候选", "监控与补偿工具"],
  },
  handoff: {
    label: "跨工作场景交接",
    address: "eix.template/handoff/controlled-transfer",
    principles: ["来源不被覆盖", "责任明确移交", "目标对象独立建档"],
    promise: "让分析、决定和流程事项通过明确的交接信息继续，而不是在同一个页面里静默改变对象类型。",
    fixed: ["来源对象及修订版本", "目标与上下文快照", "依据和待决问题", "接收人、权限和追踪编号"],
    optional: ["裁剪后的数据附件", "截止时间与优先级", "建议的下一步", "接收、退回和缩小范围"],
  },
};

function guidanceCompositionHtml(kind) {
  if (kind === "process") {
    return `
      <div class="reference-app reference-app-process" data-composition-kind="process">
        <header class="reference-app-bar">
          <div><span>Process Intelligence</span><strong>异常处理工作台</strong></div>
          <div class="reference-app-status"><i></i>系统正常推进 · 3项需要人工处理</div>
        </header>
        <div class="reference-process-layout">
          <aside class="reference-queue" aria-label="待处理异常">
            <header><span>需要处理</span><b>3</b></header>
            <button type="button" class="active"><span>高影响</span><strong>{事项编号}</strong><small>{异常摘要} · 等待决定</small></button>
            <button type="button"><span>权限</span><strong>{事项编号}</strong><small>{操作} · 需要授权</small></button>
            <button type="button"><span>数据</span><strong>{事项编号}</strong><small>{字段} · 信息不完整</small></button>
          </aside>
          <main class="reference-case">
            <header>
              <div><span>流程事项 · {编号}</span><h3>{需要人工判断的异常}</h3><p>负责人 {角色} · 更新于 {时间}</p></div>
              <span class="reference-state warning">等待决定</span>
            </header>
            <ol class="reference-process-steps" aria-label="事项进展">
              <li class="done"><span>1</span><b>已识别</b></li>
              <li class="done"><span>2</span><b>已校验</b></li>
              <li class="current"><span>3</span><b>待决定</b></li>
              <li><span>4</span><b>准备操作</b></li>
              <li><span>5</span><b>执行与核验</b></li>
            </ol>
            <section class="reference-exception">
              <span>异常与影响</span>
              <strong>{规则条件} 与 {当前事实} 不一致</strong>
              <p>若继续，将影响 {对象范围}；系统已保留前两步结果，没有执行外部操作。</p>
            </section>
            <section class="reference-evidence-list">
              <div><span>依据</span><b>{来源记录} · 已核验</b></div>
              <div><span>管控策略</span><b>{策略版本} · 当前有效</b></div>
              <div><span>权限</span><b>允许准备 · 执行需要批准</b></div>
            </section>
          </main>
          <aside class="reference-control-panel">
            <span class="micro-label">人工控制</span>
            <h3>选择如何处理当前事项</h3>
            <label><input type="radio" name="process-decision" checked />按建议准备业务操作</label>
            <label><input type="radio" name="process-decision" />要求补充依据</label>
            <label><input type="radio" name="process-decision" />人工接管</label>
            <div class="reference-impact"><span>此时会发生什么</span><p>只创建可预览的操作草案；尚未批准，也不会执行。</p></div>
            <button type="button" class="button primary">确认决定</button>
            <button type="button" class="button secondary">暂停事项</button>
          </aside>
        </div>
      </div>
    `;
  }

  if (kind === "handoff") {
    return `
      <div class="reference-app reference-app-handoff" data-composition-kind="handoff">
        <header class="reference-app-bar">
          <div><span>工作交接</span><strong>从分析结论到受控业务操作</strong></div>
          <div class="reference-app-status"><i></i>来源修订版本已锁定</div>
        </header>
        <div class="reference-handoff-layout">
          <article class="reference-handoff-object source">
            <span>来源 · Collaborative Intelligence</span>
            <h3>{分析任务}</h3>
            <p>工作结果已核验，用户决定把建议交给流程负责人继续。</p>
            <dl>
              <div><dt>目标</dt><dd>{要回答的问题}</dd></div>
              <div><dt>工作结果</dt><dd>{已核验结论}</dd></div>
              <div><dt>修订版本</dt><dd>{分析编号 · 版本}</dd></div>
            </dl>
            <span class="reference-state verified">来源保持不变</span>
          </article>
          <article class="reference-handoff-envelope-card">
            <span>交接信息</span>
            <h3>接收方继续工作所需的最小信息</h3>
            <ul>
              <li><b>目标与范围</b><span>{上下文快照}</span></li>
              <li><b>依据与限制</b><span>{依据引用} · {已知限制}</span></li>
              <li><b>待决问题</b><span>{需要负责人决定什么}</span></li>
              <li><b>责任与权限</b><span>{接收角色} · {允许范围}</span></li>
              <li><b>追踪编号</b><span>{跨对象关联编号}</span></li>
            </ul>
            <div class="reference-handoff-actions">
              <button type="button" class="button primary">接收并创建事项</button>
              <button type="button" class="button secondary">退回补充</button>
            </div>
          </article>
          <article class="reference-handoff-object target">
            <span>目标 · Process Intelligence</span>
            <h3>{待创建的流程事项}</h3>
            <p>接收后创建独立事项；不会把分析任务直接改成“执行中”。</p>
            <dl>
              <div><dt>初始状态</dt><dd>等待接收</dd></div>
              <div><dt>负责人</dt><dd>{流程负责人}</dd></div>
              <div><dt>允许操作</dt><dd>准备 · 退回 · 缩小范围</dd></div>
            </dl>
            <span class="reference-state neutral">尚未创建</span>
          </article>
        </div>
      </div>
    `;
  }

  return `
    <div class="reference-app reference-app-collaborative" data-composition-kind="collaborative">
      <header class="reference-app-bar">
        <div><span>Collaborative Intelligence</span><strong>分析工作区</strong></div>
        <div class="reference-app-status"><i></i>工作结果已更新 · 数据截至 {时间}</div>
      </header>
      <div class="reference-collaborative-layout">
        <aside class="reference-context-panel">
          <span class="micro-label">目标与上下文</span>
          <h3>{这次分析要回答的问题}</h3>
          <dl>
            <div><dt>范围</dt><dd>{业务范围}</dd></div>
            <div><dt>期间</dt><dd>{时间范围}</dd></div>
            <div><dt>比较</dt><dd>{比较基准}</dd></div>
            <div><dt>负责人</dt><dd>{分析负责人}</dd></div>
          </dl>
          <div class="reference-context-note"><span>人工智能的理解</span><p>比较 {指标}，定位差异，并解释主要驱动因素。</p><button type="button">查看或修改</button></div>
        </aside>
        <main class="reference-analysis-surface">
          <header>
            <div><span>工作结果 · 已核验</span><h3>{核心结论陈述}</h3></div>
            <button type="button">查看支撑数据</button>
          </header>
          <section class="reference-result-grid">
            <article class="reference-chart">
              <span>{指标} 按 {维度} 比较</span>
              <div class="reference-bars" aria-label="占位条形图">
                <div><b>{对象A}</b><i style="--bar:86%"></i><em>{数值}</em></div>
                <div><b>{对象B}</b><i style="--bar:64%"></i><em>{数值}</em></div>
                <div><b>{对象C}</b><i style="--bar:43%"></i><em>{数值}</em></div>
              </div>
              <small>{单位} · {版本} · 数据截至 {时间}</small>
            </article>
            <article class="reference-narrative">
              <span>如何理解</span>
              <p><strong>{对象A}</strong> 是当前差异的主要来源，贡献约为 {比例}。</p>
              <p>依据支持“发生了什么”；若要解释“为什么”，还需补充 {缺失数据}。</p>
              <a href="#/guidance/shared/S04">查看依据与限制</a>
            </article>
          </section>
          <div class="reference-ask-bar">
            <span>继续这项分析……</span>
            <button type="button">解释主要驱动</button>
            <button type="button">比较另一个期间</button>
            <button type="button">创建工作分支</button>
          </div>
        </main>
        <aside class="reference-next-panel">
          <span class="micro-label">判断与下一步</span>
          <section><span>为什么可以相信</span><strong>3项依据已核验</strong><p>1项限制仍需注意</p></section>
          <section><span>目标是否满足</span><strong>当前问题已回答</strong><p>可以结束，也可以继续分析</p></section>
          <section><span>可选延伸</span><button type="button">整理为交付物</button><button type="button">记录决策</button><button type="button">提出业务操作</button></section>
        </aside>
      </div>
    </div>
  `;
}

function renderGuidanceComposition() {
  if (!elements.guidanceCompositionCanvas || !elements.guidanceCompositionSummary) return;
  const selected = guidanceCompositionData[appState.selectedGuidanceComposition] || guidanceCompositionData.collaborative;
  elements.guidanceCompositionTabs.querySelectorAll("[data-guidance-composition]").forEach((button) => {
    const active = button.dataset.guidanceComposition === appState.selectedGuidanceComposition;
    button.setAttribute("aria-selected", String(active));
    button.tabIndex = active ? 0 : -1;
  });
  elements.guidanceCompositionCanvas.innerHTML = mockBrowserFrameHtml(
    guidanceCompositionHtml(appState.selectedGuidanceComposition),
    {
      title: selected.label,
      address: selected.address,
      status: "通用模板 · 占位内容 · 可交互参考",
      principles: selected.principles,
      className: "guidance-composition-browser",
    },
  );
  elements.guidanceCompositionSummary.innerHTML = `
    <article><span>这套界面带来的体验</span><strong>${escapeHtml(selected.promise)}</strong></article>
    <article><span>固定区域</span>${list(selected.fixed)}</article>
    <article><span>可按业务扩展</span>${list(selected.optional)}</article>
  `;
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
          <span><b>${escapeHtml(guidanceLabel(pattern))}</b><small>${escapeHtml(contractLabel(pattern.contract))} · ${escapeHtml(uiLabel(pattern.evidenceLevel))}</small></span>
        </button>
      `,
    )
    .join("");
  const pattern = patternData.find((item) => item.id === appState.selectedPatternId);
  elements.patternDetail.innerHTML = `
    <header>
      <div>
        <span>${escapeHtml(pattern.id)} · ${escapeHtml(contractLabel(pattern.contract))}</span>
        <h3>${escapeHtml(guidanceLabel(pattern))}</h3>
        <p>${escapeHtml(pattern.purpose)}</p>
      </div>
      <span class="pattern-maturity">${escapeHtml(uiLabel(pattern.maturity))}<small>${escapeHtml(uiLabel(pattern.evidenceLevel))}</small></span>
    </header>
    ${mockBrowserFrameHtml(guidanceSpecimenHtml(pattern), {
      title: `${guidanceLabel(pattern)}交互模式`,
      address: `eix.template/pattern/${pattern.id.toLocaleLowerCase("en-US")}`,
      status: "交互模式样机 · 不连接外部操作",
      principles: ["工作对象可见", "状态字段独立", "失败后可恢复"],
      className: "guidance-pattern-browser",
    })}
    <div class="pattern-detail-grid">
      <section><span>用户担忧</span><p>${escapeHtml(pattern.fear)}</p></section>
      <section><span>工作对象 / 负责人</span><p>${escapeHtml(pattern.workObject)}<br>${escapeHtml(pattern.owner)}</p></section>
      <section><span>共享工作模型覆盖</span>${list(pattern.kernelCoverage)}</section>
      <section><span>固定区域</span>${list(pattern.fixed)}</section>
      <section>
        <span>参考状态字段</span>
        ${pattern.previewAxes
          .map(
            (axis) => `
              <div class="pattern-axis-group">
                <b>${escapeHtml(axis.label)}</b>
                ${list(axis.values.map((value) => uiLabel(value)))}
              </div>
            `,
          )
          .join("")}
        <p class="pattern-axis-note">每个字段独立存储；组合是否合法由该交互模式的校验规则判断。</p>
      </section>
      <section><span>产出 / 结束条件</span>${list(pattern.outputs)}<b>合法停止点</b>${list(pattern.terminationConditions)}</section>
      <section><span>使用的通用组件</span><div class="pattern-component-links">${pattern.coreComponents
        .map((id) => {
          const entry = catalogRegistry.find((item) => item.kind === "components" && item.id === id);
          return entry
            ? `<a href="#${escapeHtml(entry.route)}">${escapeHtml(componentLabel(id))}</a>`
            : `<span>${escapeHtml(componentLabel(id))}</span>`;
        })
        .join("")}</div></section>
      <section><span>验收条件</span>${list(pattern.tests)}</section>
      <section><span>扩展规则</span>${list(pattern.extensions)}</section>
      <section><span>可选任务扩展</span>${list(pattern.optionalExtensions)}</section>
      <section class="deep-only"><span>可选区域</span>${list(pattern.optional)}</section>
      <section class="deep-only"><span>独立状态字段</span>${list(
        pattern.semanticAxes.map((field) => independentStateFieldLabels[field] || field),
      )}</section>
      <section class="deep-only"><span>权限 / 人工智能可推进范围</span><p>${escapeHtml(pattern.permissionAndAutonomy)}</p></section>
      <section class="deep-only"><span>失败 / 降级 / 恢复</span><p>${escapeHtml(pattern.failure)} ${escapeHtml(pattern.degradation)} ${escapeHtml(pattern.recovery)}</p></section>
      <section class="deep-only"><span>响应式 / 无障碍</span><p>${escapeHtml(pattern.responsive)}</p>${list(pattern.accessibility)}</section>
      <section class="deep-only pattern-review-rules">
        <span>设计评审</span>
        <h4>应该保留与应该避免的做法</h4>
        <div class="pattern-review-grid">
          <article><strong>推荐</strong>${list(pattern.dos)}</article>
          <article><strong>避免</strong>${list(pattern.donts)}</article>
        </div>
      </section>
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
      navigateHash(`#/guidance/${routeGroup}/${selected.id}`, { preserveScroll: true });
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
      navigateHash(`#/guidance/${routeGroup}/${selected.id}`, { preserveScroll: true });
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
          <header><span>${escapeHtml(contractLabel(flow.contract))}</span><h3>${escapeHtml(flow.title)}</h3></header>
          ${renderSemanticFlow(flow, {
            legacyPrefix: "guidance-flow",
            scope: `guidance-${flow.id}`,
            variant: "compact",
          })}
          <div class="guidance-flow-stop"><span>边界 / 降级</span><p>${escapeHtml(flow.stop)}</p></div>
        </article>
      `,
    )
    .join("");
}

const specimenMeta = [
  { id: "patch", label: "意图变更", principle: "意图与状态必须可见", object: "ANL-118", invariant: "撤销会产生反向变更记录，不删除历史修订版本。" },
  { id: "evidence", label: "依据与发布校验", principle: "先有依据，再写叙事", object: "ART-052", invariant: "依据过期会使校验失效；校验通过不等于已经发布。" },
  { id: "plan", label: "计划与部分结果", principle: "失败时仍应保留方向感", object: "ANL-118", invariant: "高阶分析失败不抹掉已核验的基础结果。" },
  { id: "action", label: "受控业务操作", principle: "改变外部状态前先预览后果", object: "ACT-077", invariant: "批准不等于执行；权限可以独立否决。" },
  { id: "rule", label: "规则提案", principle: "反馈如何改进系统必须透明", object: "RPROP-204", invariant: "单次判断只产生候选规则。" },
  { id: "capability", label: "能力与范围", principle: "系统能力与当前授权彼此独立", object: "CAP-031", invariant: "能力声明与当前业务操作授权分别记录和校验。" },
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
    <div class="inspector-group"><span>工作对象</span><p>${escapeHtml(meta.object)}</p></div>
    <div class="inspector-group"><span>不可破坏的规则</span><p>${escapeHtml(meta.invariant)}</p></div>
    <div class="inspector-group"><span>可见状态字段</span>${list(states)}</div>
    <div class="inspector-group"><span>验证重点</span>${list(tests)}</div>
  `;
}

function renderPatchSpecimen() {
  const state = appState.patch;
  const objectId = state.branch ? "ANL-118-B1" : "ANL-118";
  const breakdown = state.applied ? "业务实体" : "—";
  const period = state.applied ? "2027 年第二季度" : "截至 2027 年 6 月的年累计";
  elements.specimenCanvas.innerHTML = `
    <div class="specimen-frame">
      <header><span>意图 / 变更预览 · ${escapeHtml(objectId)} r${state.revision}</span><span class="fixture-label">模拟数据</span></header>
      <div class="intent-ribbon">
        <span class="intent-chip"><span>指标</span>业务实体利润</span>
        <span class="intent-chip ${state.applied ? "changed" : ""}"><span>拆分维度</span>${escapeHtml(breakdown)}</span>
        <span class="intent-chip ${state.applied ? "changed" : ""}"><span>期间</span>${escapeHtml(period)}</span>
        <span class="intent-chip"><span>对比</span>MBBP</span>
        <span class="intent-chip"><span>币种</span>EUR</span>
      </div>
      <div class="specimen-body">
        <div class="specimen-prompt">
          <p>自然语言变更：“改成按业务实体拆分，只看第二季度。”</p>
          <button class="button secondary" type="button" data-patch-action="preview">${state.preview ? "收起变更差异" : "预览变更差异"}</button>
        </div>
        ${
          state.preview
            ? `
              <div class="diff-table">
                <div class="diff-row"><span>拆分维度</span><span class="diff-value"><b class="diff-before">—</b><i class="diff-arrow">→</i><b class="diff-after">业务实体</b></span></div>
                <div class="diff-row"><span>期间</span><span class="diff-value"><b class="diff-before">截至 2027 年 6 月的年累计</b><i class="diff-arrow">→</i><b class="diff-after">2027 年第二季度</b></span></div>
                <div class="diff-row"><span>影响</span><span>2 个结果区块重新计算 · 范围变化 · 发布校验失效</span></div>
              </div>
            `
            : ""
        }
        <div class="specimen-actions">
          <button class="button primary" type="button" data-patch-action="apply" ${!state.preview || state.applied ? "disabled" : ""}>应用变更并生成 r${state.revision + 1}</button>
          <button class="button secondary" type="button" data-patch-action="revert" ${!state.applied ? "disabled" : ""}>创建反向变更</button>
          <button class="button secondary" type="button" data-patch-action="branch" ${!state.applied || state.branch ? "disabled" : ""}>从当前修订版本创建分支</button>
        </div>
        <div class="status-message" role="status">${escapeHtml(state.message)}</div>
      </div>
    </div>
  `;
  elements.specimenInspector.innerHTML = inspectorHtml(
    specimenMeta[0],
    ["工作状态 · 草稿 r" + state.revision, "范围 · " + (state.applied ? "已变更" : "原始范围"), "权限 · 允许"],
    ["范围变化必须显示影响", "反向变更产生新修订版本", "分支不污染父版本"],
  );

  elements.specimenCanvas.querySelectorAll("[data-patch-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.patchAction;
      if (action === "preview") state.preview = !state.preview;
      if (action === "apply" && state.preview && !state.applied) {
        state.applied = true;
        state.preview = false;
        state.revision += 1;
        state.message = `变更已应用为草稿 r${state.revision}；受影响的校验结果已失效。`;
      }
      if (action === "revert" && state.applied) {
        state.applied = false;
        state.branch = false;
        state.revision += 1;
        state.message = `已创建反向变更并生成草稿 r${state.revision}；历史修订版本仍保留。`;
      }
      if (action === "branch" && state.applied && !state.branch) {
        state.branch = true;
        state.message = `已创建 ANL-118-B1，父版本保持 ANL-118 r${state.revision}。`;
      }
      renderPatchSpecimen();
    });
  });
}

function evidenceGateLabel(status) {
  return {
    "not-run": "未运行",
    passed: "已通过",
    failed: "失败",
    invalidated: "已失效",
  }[status];
}

function renderEvidenceSpecimen() {
  const state = appState.evidence;
  const gatePassed = state.gate === "passed" && !state.stale;
  const gateChecks = publicationGateFixture.checkResults.map((check) =>
    check.id === "freshness" && state.stale
      ? { ...check, result: "fail", detail: "失败 · 依据快照已过期" }
      : check,
  );
  elements.specimenCanvas.innerHTML = `
    <div class="specimen-frame">
      <header><span>依据回执 · EVD-118</span><span class="fixture-label">模拟数据</span></header>
      <div class="specimen-body">
        <div class="receipt-table">
          <div class="receipt-row"><span>来源</span><span>FIN.PROFIT.ENTITY · 语义版本 v6</span></div>
          <div class="receipt-row"><span>数据快照</span><span>2027-06 · 已关账 · UTC+8</span></div>
          <div class="receipt-row"><span>范围</span><span>6 个业务实体 · 年累计 · ACT 对比 MBBP</span></div>
          <div class="receipt-row"><span>方法</span><span>认证偏差计算 · q7f3a</span></div>
          <div class="receipt-row"><span>管控策略</span><span>${escapeHtml(publicationGateFixture.policyVersion)}</span></div>
          <div class="receipt-row"><span>权限</span><span><span class="state-badge permission">允许 · ${escapeHtml(publicationGateFixture.permissionVersion)}</span></span></div>
          <div class="receipt-row"><span>核验状态</span><span><span class="state-badge ${state.stale ? "blocking" : "validation"}">${state.stale ? "已过期" : "已核验"}</span></span></div>
          <div class="receipt-row"><span>限制</span><span>归因分析缺少第一季度基线；基础 KPI 仍有效</span></div>
        </div>

        <div class="gate-card">
          <header><strong>发布校验 · ${escapeHtml(publicationGateFixture.subjectId)} r${publicationGateFixture.revision}</strong><span class="state-badge ${state.gate === "invalidated" ? "blocking" : "workflow"}">${escapeHtml(evidenceGateLabel(state.gate))}</span></header>
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
          <button class="button secondary" type="button" data-evidence-action="toggle-stale">${state.stale ? "恢复当前依据快照" : "模拟依据过期"}</button>
          <button class="button primary" type="button" data-evidence-action="run-gate" ${state.stale ? "disabled" : ""}>运行发布校验</button>
          <button class="button primary" type="button" data-evidence-action="publish" ${!gatePassed ? "disabled" : ""}>发布交付物</button>
        </div>
        <div class="status-message ${state.stale ? "blocked" : ""}" role="status">${escapeHtml(state.message)}</div>
      </div>
    </div>
  `;
  elements.specimenInspector.innerHTML = inspectorHtml(
    specimenMeta[1],
    [
      `依据 · ${state.stale ? "已过期" : "已核验"}`,
      "权限 · 允许",
      `工作状态 · ${state.published ? "已发布" : "草稿"}`,
      `发布校验 · ${evidenceGateLabel(state.gate)}`,
    ],
    ["依据过期不等于权限被拒绝", "校验通过不等于已发布", "依据变化会使校验失效"],
  );

  elements.specimenCanvas.querySelectorAll("[data-evidence-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.evidenceAction;
      if (action === "toggle-stale") {
        state.stale = !state.stale;
        state.gate = state.stale ? "invalidated" : "not-run";
        state.message = state.stale
          ? `${publicationGateFixture.invalidationReason}；旧校验结果失效。已发布修订版本保持不可变，新的发布需要刷新依据并完成：${publicationGateFixture.revalidationRequirements.join("、")}。`
          : "依据快照已恢复为当前版本；必须重新运行发布校验。";
      }
      if (action === "run-gate" && !state.stale) {
        state.gate = "passed";
        state.message = `发布校验已针对 ${publicationGateFixture.subjectId} r${publicationGateFixture.revision}、${publicationGateFixture.evidenceSnapshot}、${publicationGateFixture.policyVersion} 和 ${publicationGateFixture.permissionVersion} 通过；尚未发布。`;
      }
      if (action === "publish" && state.gate === "passed" && !state.stale) {
        state.published = true;
        state.message = `${publicationGateFixture.subjectId} r${publicationGateFixture.revision} 已发布。后续修改必须创建新的修订版本或分支。`;
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
    { name: "基础 KPI", detail: "认证工作结果", status: planNodeState(state.step, 1) },
    { name: "业务实体排名", detail: "排名与偏差", status: planNodeState(state.step, 2) },
    { name: "变化归因", detail: "归因分析方法", status: planNodeState(state.step, 3, true) },
  ];
  elements.specimenCanvas.innerHTML = `
    <div class="specimen-frame">
      <header><span>计划与进度 · ANL-118</span><span class="fixture-label">分步模拟</span></header>
      <div class="specimen-body">
        <ol class="plan-list">
          ${nodes
            .map(
              (node, index) => `
                <li class="plan-node">
                  <span class="node-index">0${index + 1}</span>
                  <span><b>${escapeHtml(node.name)}</b><small>${escapeHtml(node.detail)}</small></span>
                  <span class="state-badge ${node.status === "Partial" ? "risk" : node.status === "Verified" ? "validation" : "workflow"}">${escapeHtml(uiLabel(node.status))}</span>
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
                <p>缺少第一季度基线，充分性检查未通过。基础 KPI 与业务实体排名仍保持“已核验”。需要补充已关账数据，或先查看排名下钻。</p>
              </div>
            `
            : ""
        }
        <div class="specimen-actions">
          <button class="button primary" type="button" data-plan-action="advance" ${state.step >= 3 ? "disabled" : ""}>推进下一步</button>
          <button class="button secondary" type="button" data-plan-action="reset" ${state.step === 0 ? "disabled" : ""}>重置模拟</button>
        </div>
        <div class="status-message" role="status">步骤 ${state.step} / 3 · 每次点击对应一个明确的模拟事件，不使用计时器伪造“已核验”状态。</div>
      </div>
    </div>
  `;
  elements.specimenInspector.innerHTML = inspectorHtml(
    specimenMeta[2],
    [
      `基础结果 · ${uiLabel(nodes[0].status)}`,
      `排名 · ${uiLabel(nodes[1].status)}`,
      `归因 · ${uiLabel(nodes[2].status)}`,
    ],
    ["基础结果先返回", "部分失败仍保留已核验结果", "降级说明回答五个固定问题"],
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
  proposed: "已提出",
  preflight: "预检通过",
  awaiting: "等待审批",
  approved: "已批准",
  queued: "已排队",
  executing: "执行中",
  succeeded: "成功",
};
const actionNextLabels = {
  proposed: "运行执行前检查",
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
      <header><span>受控业务操作 · ACT-077</span><span class="fixture-label">不执行外部操作</span></header>
      <div class="specimen-body">
        <div class="decision-card">
          <header>
            <span class="micro-label">业务操作提案</span>
            <h3>准备3条记录的修复动作</h3>
          </header>
          <dl class="decision-meta">
            <dt>依据</dt><dd><span class="state-badge validation">已核验</span> · DEC-052</dd>
            <dt>权限</dt><dd><span class="state-badge ${denied ? "blocking" : "permission"}">${denied ? "拒绝" : "允许"} · PERM-88</span></dd>
            <dt>管控策略</dt><dd>POL-17 v6 · 执行需要审批</dd>
            <dt>影响</dt><dd>3 条记录 · 可撤销 · 5 分钟窗口</dd>
            <dt>工作状态</dt><dd><span class="state-badge workflow">${escapeHtml(actionStageLabels[state.stage])}</span></dd>
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
              <button class="button secondary" type="button" data-action-demo="toggle-permission">${denied ? "切换为允许" : "模拟权限拒绝"}</button>
              <button class="button primary" type="button" data-action-demo="advance" ${nextDisabled ? "disabled" : ""}>${escapeHtml(actionNextLabels[state.stage])}</button>
              <button class="button secondary" type="button" data-action-demo="reset" ${state.stage === "proposed" && !denied ? "disabled" : ""}>重置业务操作</button>
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
      "依据 · 已核验",
      `权限 · ${denied ? "拒绝" : "允许"}`,
      "风险 · 低 / 可撤销",
      `工作状态 · ${actionStageLabels[state.stage]}`,
    ],
    ["高置信度 + 权限拒绝仍会阻断", "批准与执行分开", "业务成效使用独立关联记录"],
  );

  elements.specimenCanvas.querySelectorAll("[data-action-demo]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.actionDemo;
      if (action === "toggle-permission") {
        state.permission = denied ? "allowed" : "denied";
        state.stage = "proposed";
        state.message =
          state.permission === "denied"
            ? "即使依据已核验且风险较低，权限拒绝仍会阻断执行前检查。"
            : "权限已恢复为允许；业务操作仍只是提案，必须重新执行预检。";
      }
      if (action === "advance" && state.permission === "allowed" && state.stage !== "succeeded") {
        const currentIndex = actionStages.indexOf(state.stage);
        state.stage = actionStages[currentIndex + 1];
        state.message = {
          preflight: "执行前检查通过；尚未提交审批。",
          awaiting: "已提交审批；尚未批准。",
          approved: "审批回执已生成；尚未排队或执行。",
          queued: "业务操作已加入模拟队列；尚未改变外部状态。",
          executing: "模拟显示正在执行；下一步记录业务操作执行状态。",
          succeeded: "执行回执记录业务操作成功；业务成效仍为等待观测。本演示没有外部写入。",
        }[state.stage];
      }
      if (action === "reset") {
        state.permission = "allowed";
        state.stage = "proposed";
        state.message = "业务操作只是提案，尚未获得授权。";
      }
      renderActionSpecimen();
    });
  });
}

const ruleStages = ["candidate", "drafted", "validated", "approved", "staged", "active"];
const ruleStageLabels = {
  candidate: "候选",
  drafted: "已起草",
  validated: "已校验",
  approved: "已批准",
  staged: "已进入预发布",
  active: "已启用",
  rejected: "已拒绝",
};
const ruleNextLabels = {
  candidate: "完善规则草稿",
  drafted: "运行回放与冲突验证",
  validated: "提交职责分离审批",
  approved: "进入预发布",
  staged: "启用未来适用范围",
  active: "已启用",
};

function renderRuleSpecimen() {
  const state = appState.rule;
  const displayedStage = state.rejected ? "rejected" : state.stage;
  const activeIndex = state.rejected ? -1 : ruleStages.indexOf(state.stage);
  const canAdvance = !state.rejected && state.stage !== "active";
  const canReject = !state.rejected && !["active"].includes(state.stage);
  elements.specimenCanvas.innerHTML = `
    <div class="specimen-frame">
      <header><span>规则提案 · RPROP-204</span><span class="fixture-label">只影响未来事项</span></header>
      <div class="specimen-body">
        <div class="receipt-table">
          <div class="receipt-row"><span>当前事项</span><span>CASE-204 · 已由人工决策 DEC-057 处理</span></div>
          <div class="receipt-row"><span>当前处理依据</span><span>POL-17 v6 + EVD-204 · 不使用待审规则</span></div>
          <div class="receipt-row"><span>候选规则</span><span>RPROP-204 · 负责人：规则负责人</span></div>
          <div class="receipt-row"><span>校验</span><span>历史回放 · 反例 · 冲突扫描</span></div>
          <div class="receipt-row"><span>职责分离</span><span>提案人 ≠ 审批人 · 进入预发布前必须完成</span></div>
          <div class="receipt-row"><span>影响</span><span>${state.stage === "active" && !state.rejected ? "只影响未来范围匹配的事项" : "无 · 不影响任何事项"}</span></div>
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
          <button class="button primary" type="button" data-rule-action="advance" ${!canAdvance ? "disabled" : ""}>${escapeHtml(state.rejected ? "已拒绝" : ruleNextLabels[state.stage])}</button>
          <button class="button danger" type="button" data-rule-action="reject" ${!canReject ? "disabled" : ""}>拒绝候选规则</button>
          <button class="button secondary" type="button" data-rule-action="reset" ${state.stage === "candidate" && !state.rejected ? "disabled" : ""}>重置候选规则</button>
        </div>
        <div class="status-message ${state.rejected ? "blocked" : ""}" role="status">${escapeHtml(state.message)}</div>
      </div>
    </div>
  `;
  elements.specimenInspector.innerHTML = inspectorHtml(
    specimenMeta[4],
    [
      `规则状态 · ${ruleStageLabels[displayedStage]}`,
      "当前事项 · 未改变",
      `未来范围 · ${state.stage === "active" && !state.rejected ? "已启用" : "无影响"}`,
    ],
    ["候选规则不作为当前事项依据", "审批前不得显示为已启用", "拒绝后不保留派生效果"],
  );

  elements.specimenCanvas.querySelectorAll("[data-rule-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.ruleAction;
      if (action === "advance" && canAdvance) {
        const currentIndex = ruleStages.indexOf(state.stage);
        state.stage = ruleStages[currentIndex + 1];
        state.message = {
          drafted: "草稿已完善；仍未验证、未审批、未生效。",
          validated: "回放、反例和冲突扫描完成；仍未审批、未生效。",
          approved: "独立的职责分离审批已完成；规则仍未进入预发布或启用。",
          staged: "规则进入预发布 / 影子运行；只观察，不影响真实事项。",
          active: "规则已启用，仅影响未来符合适用范围的事项；保留监控与紧急停用能力。",
        }[state.stage];
      }
      if (action === "reject" && canReject) {
        state.rejected = true;
        state.message = "候选规则已被拒绝；没有规则被启用，也没有任何自动化范围变化。";
      }
      if (action === "reset") {
        state.stage = "candidate";
        state.rejected = false;
        state.message = "当前只创建了候选规则；不会影响任何事项。";
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
      ? "已暂停"
      : state.scope === "missing"
        ? "缺少范围"
        : state.permission === "drift"
          ? "权限已变化"
          : "完整";
  elements.specimenCanvas.innerHTML = `
    <div class="specimen-frame">
      <header><span>能力快照 · CAP-031 v4</span><span class="fixture-label">能力声明 · 不等于授权</span></header>
      <div class="specimen-body">
        <div class="receipt-table">
          <div class="receipt-row"><span>负责人 / 版本</span><span>财务自动化平台 · CAP-031 v4</span></div>
          <div class="receipt-row"><span>适用范围</span><span>${state.scope === "missing" ? "缺失 · 目标范围不可用" : "业务实体规划工作区 · 已批准数据域"}</span></div>
          <div class="receipt-row"><span>声明的操作</span><span>读取 · 准备更新 · 提交审批</span></div>
          <div class="receipt-row"><span>风险 / 恢复</span><span>中等 · 结算前可撤销 · 结算后可补偿</span></div>
          <div class="receipt-row"><span>管控策略 / 权限</span><span>${state.permission === "drift" ? "POL-17 v7 · 快照仍要求 v6" : "POL-17 v6 · PERM-88 当前有效"}</span></div>
          <div class="receipt-row"><span>回执 / 升级</span><span>执行回执 · 流程负责人</span></div>
          <div class="receipt-row"><span>能力状态</span><span><span class="state-badge ${ready ? "validation" : "blocking"}">${escapeHtml(capabilityStatus)}</span></span></div>
        </div>
        <div class="specimen-actions">
          <button class="button secondary" type="button" data-capability-action="scope">${state.scope === "missing" ? "恢复适用范围" : "模拟范围缺失"}</button>
          <button class="button secondary" type="button" data-capability-action="permission">${state.permission === "drift" ? "更新权限快照" : "模拟权限变化"}</button>
          <button class="button danger" type="button" data-capability-action="suspend">${state.status === "suspended" ? "恢复能力" : "模拟能力暂停"}</button>
          <button class="button primary" type="button" data-capability-action="preflight" ${!ready ? "disabled" : ""}>进入执行前检查</button>
        </div>
        <div class="status-message ${ready ? "" : "blocked"}" role="status">${escapeHtml(state.message)}</div>
      </div>
    </div>
  `;
  elements.specimenInspector.innerHTML = inspectorHtml(
    specimenMeta[5],
    [
      `能力 · ${capabilityStatus}`,
      `权限 · ${state.permission === "drift" ? "按条件 / 快照已过期" : "当前快照"}`,
      "人工智能可推进范围 · 准备",
      "工作状态 · 仅为提案",
    ],
    ["能力状态不能推出权限", "完整不等于已批准", "失效时隐藏执行入口，但保留提案与升级路径"],
  );

  elements.specimenCanvas.querySelectorAll("[data-capability-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.capabilityAction;
      if (action === "scope") {
        state.scope = state.scope === "missing" ? "complete" : "missing";
        state.message =
          state.scope === "missing"
            ? "适用范围缺失；保留业务操作提案，但不显示执行入口。"
            : "适用范围已恢复；仍需检查权限、管控策略与风险。";
      }
      if (action === "permission") {
        state.permission = state.permission === "drift" ? "current" : "drift";
        state.message =
          state.permission === "drift"
            ? "权限快照已变化；旧执行前检查失效，必须重新校验。"
            : "权限快照已更新；系统具备能力仍不等于当前业务操作已获授权。";
      }
      if (action === "suspend") {
        state.status = state.status === "suspended" ? "available" : "suspended";
        state.message =
          state.status === "suspended"
            ? "能力已暂停；转交流程负责人，当前业务操作不可执行。"
            : "能力已恢复可用；仍需独立的业务操作校验。";
      }
      if (action === "preflight" && ready) {
        state.message = "已进入执行前检查；将针对执行主体、目标、参数、管控策略、权限和风险重新校验，尚未批准或执行。";
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
    <article><strong>${canonicalPatternCoverage.length}</strong><span>核心交互模式</span><p>全部登记，不允许静默缺失。</p></article>
    ${maturityOrder
      .map(
        (maturity) =>
          `<article class="maturity-${stateClass(maturity)}"><strong>${counts[maturity]}</strong><span>${escapeHtml(uiLabel(maturity))}</span><p>${
            maturity === "Validated Pattern"
              ? "需要自动约定测试与真实读者 / 用户证据。"
              : maturity === "Behavioral Specimen"
                ? "主要行为、失败与恢复可以观察。"
                : maturity === "Specified"
                  ? "规格完整，但尚未获得真实验证。"
                  : "只有核心架构身份与不可破坏的规则。"
          }</p></article>`,
      )
      .join("")}
  `;
  elements.patternCoverageTable.innerHTML = canonicalPatternCoverage
    .map(
      (item) => `
        <tr>
          <th scope="row">${escapeHtml(item.name)}</th>
          <td>${escapeHtml(contractLabel(item.contract))}</td>
          <td><span class="coverage-maturity maturity-${stateClass(item.maturity)}">${escapeHtml(uiLabel(item.maturity))}</span></td>
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
      <span class="brief-only">本场景要完成什么</span>
      <span class="deep-only">追踪对象 · ${escapeHtml(meta.root)}</span>
      <strong>${escapeHtml(meta.label)}</strong>
      <p>${escapeHtml(meta.stop)}</p>
    </div>
    <div class="journey-lineage-track" data-flow-contract="lineage-summary">
      ${meta.lineage
        .map((item, index) => `<span class="${item.includes("可选") ? "optional" : item === "结束" ? "stop" : ""}">${escapeHtml(item)}${index < meta.lineage.length - 1 ? "<i>→</i>" : ""}</span>`)
        .join("")}
    </div>
  `;
  const optionalFrom = Number.isFinite(meta.optionalFrom) ? meta.optionalFrom : steps.length;
  const mainSteps = steps.slice(0, optionalFrom);
  const optionalSteps = steps.slice(optionalFrom);
  const journeyButton = (step, index, optional = false) => {
    const active = index === appState.journeyStep;
    const completed = !optional && index < Math.min(appState.journeyStep, optionalFrom);
    const titleUnits = Array.from(step.title).reduce(
      (total, character) => total + (/[\u2E80-\u9FFF\uF900-\uFAFF]/u.test(character) ? 2 : 1),
      0,
    );
    const adaptiveWidth = Math.max(
      optional ? 14 : 12,
      Math.min(optional ? 28 : 24, titleUnits + 4),
    );
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
                <span>可选分支</span>
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
        ? `<a href="#/guidance/${escapeHtml(pattern.contract)}/${escapeHtml(id)}">${escapeHtml(id)} · ${escapeHtml(guidanceLabel(pattern))}</a>`
        : `<span>${escapeHtml(id)}</span>`;
    })
    .join("");
  const componentRefs = refs.components
    .map((id) => {
      const component = catalogRegistry.find((item) => item.kind === "components" && item.id === id);
      return component
        ? `<a href="${escapeHtml(component.route)}">${escapeHtml(componentLabel(id))}</a>`
        : `<span>${escapeHtml(componentLabel(id))}</span>`;
    })
    .join("");
  const acceptanceRefs = refs.acceptance
    .map((id) => `<a href="#/acceptance?focus=${escapeHtml(id)}">${escapeHtml(id)}</a>`)
    .join("");
  elements.journeyStepPanel.innerHTML = `
    <header>
      <span class="step-number deep-only">${escapeHtml(step.id)}</span>
      <h3>${escapeHtml(step.title)}</h3>
      <span class="object-chip deep-only">${escapeHtml(step.object)}</span>
      ${appState.journeyStep >= meta.optionalFrom ? '<span class="optional-chip">可选延伸</span>' : ""}
    </header>
    <div class="journey-step-grid">
      <section><span>人的责任</span><p>${escapeHtml(step.human)}</p></section>
      <section><span>系统的责任</span><p>${escapeHtml(step.system)}</p></section>
      <section><span>依据 / 管控策略</span><p>${escapeHtml(step.evidence)}</p></section>
      <section><span>可用操作</span><p>${escapeHtml(step.controls)}</p></section>
      <section><span>降级路径</span><p>${escapeHtml(step.degradation)}</p></section>
      <section><span>稳定产出 / 记录</span><p>${escapeHtml(step.artifact)}</p></section>
    </div>
    <section class="journey-conformance deep-only">
      <span>规范引用</span>
      <div><b>交互模式</b>${patternRefs}</div>
      <div><b>通用组件</b>${componentRefs}</div>
      <div><b>设计检查</b>${acceptanceRefs}</div>
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
            <span>${escapeHtml(item.code)} · 设计检查</span>
            <b>交付前执行</b>
          </header>
          <h3>${escapeHtml(item.name)}</h3>
          <p>${escapeHtml(item.summary)}</p>
          <details>
            <summary>查看检查方法</summary>
            <dl>
              <div><dt>检查场景</dt><dd>${escapeHtml(item.given)}</dd></div>
              <div><dt>操作方式</dt><dd>${escapeHtml(item.when)}</dd></div>
              <div><dt>应当看到</dt><dd>${escapeHtml(item.then)}</dd></div>
              <div><dt>需要记录</dt><dd>${escapeHtml(item.evidence)}</dd></div>
              <div><dt>通过条件</dt><dd>${escapeHtml(item.threshold)}</dd></div>
              <div><dt>建议负责人</dt><dd>${escapeHtml(item.owner)}</dd></div>
            </dl>
          </details>
        </article>
      `,
    )
    .join("");
  elements.readerMetrics.innerHTML = readerMetrics
    .map(
      (item) => `
        <article class="reader-metric">
          <span>需要真实用户验证</span>
          <strong>${escapeHtml(item.name)}</strong>
          <p>${escapeHtml(item.question)}</p>
          <dl>
            <div><dt>建议方法</dt><dd>${escapeHtml(item.method)}</dd></div>
            <div><dt>通过条件</dt><dd>${escapeHtml(item.threshold)}</dd></div>
          </dl>
        </article>
      `,
    )
    .join("");
  elements.experienceSignals.innerHTML = experienceSignalData
    .map(
      (item) => `
        <article class="experience-signal-card">
          <h3>${escapeHtml(item.promise)}</h3>
          <div><span>过程信号</span><p>${escapeHtml(item.leading)}</p></div>
          <div><span>结果信号</span><p>${escapeHtml(item.outcome)}</p></div>
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
  document.addEventListener(
    "click",
    (event) => {
      const link = event.target.closest?.('a[href^="#/"]');
      if (!link) return;
      const targetPath = (link.getAttribute("href") || "").replace(/^#\/?/, "").split(/[/?#]/)[0];
      if (targetPath === appState.route && targetPath !== "document") rememberInPageScroll();
    },
    true,
  );
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
  if (elements.guidanceCompositionTabs) {
    bindTabButtons(elements.guidanceCompositionTabs, "[data-guidance-composition]", (button) => {
      appState.selectedGuidanceComposition = button.dataset.guidanceComposition;
      renderGuidanceComposition();
    });
  }

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
      navigateHash(
        appState.patternFilter === "all" ? "#/guidance" : `#/guidance/${appState.patternFilter}`,
        { preserveScroll: true },
      );
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

  window.addEventListener("hashchange", () => {
    const nextRoute = parseRoute();
    const switchingPrimaryRoute = nextRoute !== appState.route;
    const switchingDocument =
      nextRoute === "document" && currentDocumentRequest().documentId !== appState.activeDocument;
    const savedScroll = pendingInPageScroll;
    pendingInPageScroll = null;
    renderRoute({ focusMain: switchingPrimaryRoute || switchingDocument });
    if (savedScroll && !switchingPrimaryRoute && !switchingDocument) {
      requestAnimationFrame(() => {
        window.scrollTo(savedScroll);
        requestAnimationFrame(() => window.scrollTo(savedScroll));
      });
    }
  });
}

function initialize() {
  initializeDesignSystemTheme();
  enhanceMockBrowserFrames(document);
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
