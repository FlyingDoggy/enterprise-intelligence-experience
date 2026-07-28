const kernelData = [
  {
    code: "K01",
    name: "Goal",
    question: "我们真正希望实现什么业务结果？",
    definition: "用户或组织希望实现的结果。Goal使用业务语言表达，不能等同于一次Prompt或一个技术任务。",
    visible: ["Success Definition", "Owner与Audience", "Scope与Constraints", "当前状态"],
    governance: "Goal可以调整，但重大变化必须形成Revision，并说明对Plan、Evidence和Action的影响。",
  },
  {
    code: "K02",
    name: "Context",
    question: "AI正在使用哪些信息、规则和历史？",
    definition: "与当前工作相关且获得授权的业务语义、流程状态、数据、文档、知识、规则和历史。",
    visible: ["Source与Freshness", "Permission Scope", "Active / Persistent边界", "Remove与Correct"],
    governance: "区分Session Context、Personal Memory、Team Memory和Enterprise Context；持久化必须有明确Owner。",
  },
  {
    code: "K03",
    name: "Plan",
    question: "为了实现Goal，系统准备按什么路径工作？",
    definition: "可检查的工作路径，包含节点、依赖、状态、风险、缺失输入和停止条件。",
    visible: ["Plan Nodes", "Ready / Conditional / Blocked", "Dependencies", "Next Step"],
    governance: "AI可以推荐Plan；高风险节点、工具执行和超出原Scope的扩展需要用户确认。",
  },
  {
    code: "K04",
    name: "Evidence",
    question: "事实、建议和决定建立在什么依据上？",
    definition: "能够回到数据、文档、规则、事件或执行记录的可验证依据，而不是装饰性引用。",
    visible: ["Source与Lineage", "Calculation / Method", "Scope", "Confidence与Limitation"],
    governance: "发布Claim或Decision前校验Evidence完整性；无Evidence的内容必须降级为Hypothesis。",
  },
  {
    code: "K05",
    name: "Decision",
    question: "选择了什么、为什么、由谁确认？",
    definition: "由Evidence和业务判断形成的明确选择，包含Option、Rationale、Owner和Approval。",
    visible: ["Selected Option", "Alternatives", "Rationale", "Owner与Decision Time"],
    governance: "Decision必须保留使用的Evidence和适用Scope；修改Decision生成新Revision，不重写历史。",
  },
  {
    code: "K06",
    name: "Action",
    question: "什么将改变外部状态，影响是什么？",
    definition: "调用工具、Agent或业务系统而改变外部状态的受控操作。",
    visible: ["Target Object", "Impact Scope", "Permission", "Preview与Reversibility"],
    governance: "严格区分Read、Prepare和Write；高影响或不可逆Action必须降低自主级别并再次确认。",
  },
  {
    code: "K07",
    name: "Outcome",
    question: "实际发生了什么，是否符合预期？",
    definition: "分析或Action产生的真实结果，包括成功、失败、部分成功、异常和未决状态。",
    visible: ["Result State", "Execution Receipt", "Difference from Expected", "Next State"],
    governance: "Outcome来自系统记录而非LLM重新叙述；Partial Result必须保留已确认部分。",
  },
  {
    code: "K08",
    name: "Feedback",
    question: "这次工作应如何修正当前任务或改进系统？",
    definition: "来自用户、业务结果、系统执行和评估机制的信号。",
    visible: ["Signal Type", "Scope", "Destination", "Proposed Change与Owner"],
    governance: "区分单次修正和长期学习；Ontology、Rule与Enterprise Memory更新必须经过治理。",
  },
];

const contractData = {
  process: {
    mode: "SYSTEM-LED · STATE-DRIVEN · EXCEPTION-FIRST",
    name: "Process Intelligence",
    statement: "系统在明确规则、权限和控制范围内推进结构化工作；人在关键决定、异常和边界场景中保持有效控制。",
    object: "Case",
    flow: ["Event", "Interpret", "Validate", "Decide", "Approve", "Execute", "Verify", "Recover"],
    system: ["维护对象、状态与依赖", "执行规则与确定性校验", "调用受控工具和API", "记录结果、异常与反馈"],
    human: ["确认高风险或低置信度决定", "处理政策与业务例外", "接管无法恢复的Case", "批准规则或Ontology改进"],
    surfaces: ["Work Queue与Case Workspace", "Decision Checkpoint", "Exception & Recovery", "Audit Timeline"],
    dont: ["用长对话代替Case状态", "要求用户持续监督正常路径", "低置信度时静默推进", "失败时不提供恢复路径"],
  },
  collaborative: {
    mode: "HUMAN-LED · GOAL-DRIVEN · ARTIFACT-FIRST",
    name: "Collaborative Intelligence",
    statement: "人定义目标、约束和最终判断；AI帮助理解上下文、规划工作、生成可验证产出，并在授权范围内执行行动。",
    object: "Mission",
    flow: ["Frame", "Context", "Plan", "Explore", "Validate", "Decide", "Act", "Reuse"],
    system: ["理解Goal并识别关键歧义", "推荐路径、工具和Artifact", "检索、分析、生成与组织", "绑定Evidence并暴露Limit"],
    human: ["确认真实目的和边界", "提供业务判断与新Context", "判断Evidence是否足够", "确认决定和高影响Action"],
    surfaces: ["Mission Workspace", "Analysis / Research / Decision Canvas", "Evidence & Context Inspector", "Artifact History & Branch"],
    dont: ["把所有工作压缩成聊天线程", "隐藏系统对Goal的理解", "用漂亮Narrative替代Evidence", "追问时覆盖已验证Artifact"],
  },
};

const familyData = [
  {
    code: "C01",
    short: "Knowledge",
    name: "Knowledge & Research Intelligence",
    question: "我们知道什么、依据是什么、不同来源如何冲突？",
    tasks: ["企业知识问答", "跨文档研究与综合", "政策与标准解释", "事实核实与来源比较"],
    artifacts: ["Answer with Sources", "Research Board", "Evidence Map", "Synthesized Brief"],
    surfaces: ["Knowledge Search", "Research Board", "Source Reader", "Evidence Inspector"],
    boundary: "完成条件不是“生成一段答案”，而是形成可核实、可继续调查、可复用的知识Artifact。",
  },
  {
    code: "C02",
    short: "Analytical",
    name: "Analytical Intelligence",
    question: "发生了什么、为什么、接下来可能怎样？",
    tasks: ["快速问数与核对", "探索、对比与监控", "诊断与调查", "预测、模拟与决策支持"],
    artifacts: ["Verified Answer", "Analysis Document", "Diagnostic Story", "Scenario Canvas"],
    surfaces: ["Analysis Workspace", "Evidence Story", "Signal Feed", "Supporting Data"],
    boundary: "AI自助分析属于本Family；数据不足时必须停止高阶Claim，同时保留已验证基础Result。",
  },
  {
    code: "C03",
    short: "Decision",
    name: "Decision Intelligence",
    question: "面对多个选项，应如何形成可解释的选择？",
    tasks: ["定义Decision Frame", "比较Option与Trade-off", "管理Assumption与Risk", "记录决定与审批"],
    artifacts: ["Decision Canvas", "Option Matrix", "Assumption Register", "Decision Record"],
    surfaces: ["Decision Workspace", "Scenario Comparison", "Approval Brief", "Action Handoff"],
    boundary: "AI组织证据与选项，但不替代具有业务责任的Decision Owner。",
  },
  {
    code: "C04",
    short: "Creation",
    name: "Creation & Communication Intelligence",
    question: "如何形成符合业务语境、可协作和可发布的产出？",
    tasks: ["起草与改写", "Review与Redline", "汇报和说明材料", "Audience-specific Narrative"],
    artifacts: ["Document", "Deck", "Message", "Structured Output"],
    surfaces: ["Creation Workspace", "Review Mode", "Version Compare", "Audience Preview"],
    boundary: "内容必须保留Source、Decision和Analysis的语义，不允许Narrative重新发明事实。",
  },
  {
    code: "C05",
    short: "Planning",
    name: "Planning & Action Intelligence",
    question: "如何把Goal变成计划，并在授权范围内安全推进？",
    tasks: ["Goal Decomposition", "Owner与Dependency", "Agent / Tool Assignment", "Action Tracking与Handoff"],
    artifacts: ["Execution Plan", "Planning Board", "Action Queue", "Outcome Brief"],
    surfaces: ["Planning Board", "Action Preview", "Agent Activity", "Outcome Timeline"],
    boundary: "当执行路径稳定、重复且可建模后，应逐步转换为Process Intelligence。",
  },
];

const principleData = [
  {
    id: "01",
    category: "foundation",
    title: "Work Object before Chat",
    text: "先定义用户正在处理的业务对象，而不是先放置输入框。",
    test: "用户能否不阅读聊天记录就理解Goal、Owner、State和Output？",
  },
  {
    id: "02",
    category: "foundation",
    title: "One Context, Explicitly Scoped",
    text: "Context跨分析、决定与行动保持连续，同时明确哪些信息正在被使用。",
    test: "用户能否查看、移除或纠正Context，并区分临时Context与Memory？",
  },
  {
    id: "03",
    category: "foundation",
    title: "Intent and State Must Be Visible",
    text: "把AI对Goal的理解和当前工作状态变成稳定界面。",
    test: "用户是否无需询问AI，就能看见当前State和下一步？",
  },
  {
    id: "04",
    category: "control",
    title: "Autonomy Must Be Progressive",
    text: "自主权随风险、可逆性、置信度和授权逐级提升。",
    test: "用户是否知道当前自主级别，高影响Action是否自动降低级别？",
  },
  {
    id: "05",
    category: "trust",
    title: "Evidence before Eloquence",
    text: "重要结论、建议和决定必须先有Evidence，再组织Narrative。",
    test: "用户能否从Claim回到Source，Fact与Hypothesis是否清晰区分？",
  },
  {
    id: "06",
    category: "control",
    title: "Human Intervention Is Designed",
    text: "人工介入是Agentic Work的正常路径，而不是系统失败。",
    test: "接管者是否获得完整Context，并能继续使用已完成的系统工作？",
  },
  {
    id: "07",
    category: "control",
    title: "Preview Consequence before Action",
    text: "改变外部状态前展示对象、范围、影响、权限和可逆性。",
    test: "用户能否明确区分读取、准备、建议和真实写入？",
  },
  {
    id: "08",
    category: "control",
    title: "Reversible by Default",
    text: "可撤销、可回滚、可补偿或可恢复是Action设计的一部分。",
    test: "出错后是否存在Recovery Path，不可逆操作是否获得额外确认？",
  },
  {
    id: "09",
    category: "continuity",
    title: "Preserve Verified State",
    text: "探索、失败和新分支不能破坏已验证结果或Published内容。",
    test: "高阶能力失败时基础Evidence是否保留，追问是否形成Branch？",
  },
  {
    id: "10",
    category: "continuity",
    title: "Stable Artifacts over Transcripts",
    text: "企业成果形成可保存、复用、协作和审计的Artifact。",
    test: "结果是否能脱离对话独立阅读，并具有Owner、Revision和Evidence？",
  },
  {
    id: "11",
    category: "foundation",
    title: "Role-adaptive Density, Shared Truth",
    text: "不同角色获得不同信息密度，但不能拥有不同事实版本。",
    test: "简化视图是否仍保留关键Limitation、Risk和同一Source of Truth？",
  },
  {
    id: "12",
    category: "continuity",
    title: "Failure Must Preserve Orientation",
    text: "失败状态说明哪里失败、为什么、什么仍有效、接下来能做什么。",
    test: "是否避免无方向的错误信息，并正确表达Partial Success？",
  },
  {
    id: "13",
    category: "trust",
    title: "Visual Language Carries Semantics",
    text: "颜色、排版、图形和动效表达真实业务语义，不装饰AI感。",
    test: "用户是否能区分Fact、Risk、Action、Exception和Restriction？",
  },
  {
    id: "14",
    category: "trust",
    title: "Feedback Improves Transparently",
    text: "用户知道什么被记录、什么会改变，以及由谁确认。",
    test: "Feedback是否区分单次修正和长期学习，更新是否经过Owner治理？",
  },
];

const acceptanceData = [
  {
    id: "A01",
    name: "Orientation",
    text: "用户识别Goal、Work Object、State和Owner，无需翻阅History理解当前状态。",
    metric: "State comprehension · Context continuity",
  },
  {
    id: "A02",
    name: "Comprehension",
    text: "用户正确理解AI的Intent、Plan、主要限制与语义类型。",
    metric: "Intent understanding · Semantic accuracy",
  },
  {
    id: "A03",
    name: "Control",
    text: "用户知道AI正在执行什么，并能在适当位置Preview、Pause、Undo或Takeover。",
    metric: "Intervention success · Unauthorized action prevention",
  },
  {
    id: "A04",
    name: "Trust Calibration",
    text: "Confidence与实际质量匹配，低质量Evidence不会被包装成Verified。",
    metric: "Over-trust / under-trust · Evidence comprehension",
  },
  {
    id: "A05",
    name: "Task Outcome",
    text: "用户完成业务目标，产出可保存、共享、复用和审计的Artifact。",
    metric: "Task completion · Time to goal · Artifact reuse",
  },
  {
    id: "A06",
    name: "Recovery",
    text: "Failure、Partial和Exception具有明确恢复动作，人工接管保留已完成工作。",
    metric: "Recovery success · Rework · Human touch time",
  },
  {
    id: "A07",
    name: "Continuity",
    text: "用户能够从History、Branch或Handoff继续，同一事实不产生多个版本。",
    metric: "Context re-entry · Handoff completion · Version integrity",
  },
  {
    id: "A08",
    name: "Accessibility",
    text: "键盘、辅助技术、Reduced Motion和等价文本覆盖完整任务路径。",
    metric: "Keyboard completion · Assistive technology completion",
  },
];

const whitepaperData = [
  {
    code: "PART I",
    name: "Strategy",
    chapters: ["Why Experience Architecture", "Human–AI Work Model", "Two Contracts, One Experience", "Business Value"],
  },
  {
    code: "PART II",
    name: "Shared Experience Kernel",
    chapters: ["Work Objects", "Goal & Intent", "Context & Memory", "Evidence", "Decision & Action", "Feedback"],
  },
  {
    code: "PART III",
    name: "Process Intelligence",
    chapters: ["Process Contract", "Case & State", "Human Oversight", "Exception & Recovery", "Pattern Library"],
  },
  {
    code: "PART IV",
    name: "Collaborative Intelligence",
    chapters: ["Collaborative Contract", "Knowledge", "Analysis", "Decision", "Creation", "Planning & Action"],
  },
  {
    code: "PART V",
    name: "Cross-contract Experience",
    chapters: ["Insight to Action", "Exception to Investigation", "Handoff", "Branch & Revision", "Memory"],
  },
  {
    code: "PART VI",
    name: "Visual & Interaction System",
    chapters: ["Semantic Visual Language", "Role Density", "Motion", "Failure States", "Accessibility"],
  },
  {
    code: "PART VII",
    name: "Delivery & Evaluation",
    chapters: ["UX Workstream", "Reference Prototypes", "Evaluation", "Acceptance", "PoC Maturity"],
  },
];

const element = {
  topSpine: document.querySelector("#topSpine"),
  kernelTabs: document.querySelector("#kernelTabs"),
  kernelCode: document.querySelector("#kernelCode"),
  kernelName: document.querySelector("#kernelName"),
  kernelQuestion: document.querySelector("#kernelQuestion"),
  kernelDefinition: document.querySelector("#kernelDefinition"),
  kernelVisible: document.querySelector("#kernelVisible"),
  kernelGovernance: document.querySelector("#kernelGovernance"),
  contractPanel: document.querySelector("#contractPanel"),
  contractMode: document.querySelector("#contractMode"),
  contractName: document.querySelector("#contractName"),
  contractStatement: document.querySelector("#contractStatement"),
  contractObject: document.querySelector("#contractObject"),
  contractFlow: document.querySelector("#contractFlow"),
  contractSystem: document.querySelector("#contractSystem"),
  contractHuman: document.querySelector("#contractHuman"),
  contractSurfaces: document.querySelector("#contractSurfaces"),
  contractDont: document.querySelector("#contractDont"),
  familyTabs: document.querySelector("#familyTabs"),
  familyCode: document.querySelector("#familyCode"),
  familyName: document.querySelector("#familyName"),
  familyQuestion: document.querySelector("#familyQuestion"),
  familyTasks: document.querySelector("#familyTasks"),
  familyArtifacts: document.querySelector("#familyArtifacts"),
  familySurfaces: document.querySelector("#familySurfaces"),
  familyBoundary: document.querySelector("#familyBoundary"),
  analysisSpectrum: document.querySelector("#analysisSpectrum"),
  principleFilters: document.querySelector("#principleFilters"),
  principleGrid: document.querySelector("#principleGrid"),
  acceptanceGrid: document.querySelector("#acceptanceGrid"),
  whitepaperParts: document.querySelector("#whitepaperParts"),
  menuButton: document.querySelector("#menuButton"),
  sidebar: document.querySelector("#sidebar"),
  sidebarBackdrop: document.querySelector("#sidebarBackdrop"),
};

let activeKernel = 0;
let activeContract = "process";
let activeFamily = 0;

function setText(target, text) {
  if (target) target.textContent = text;
}

function renderList(target, values) {
  if (!target) return;
  target.replaceChildren(
    ...values.map((value) => {
      const item = document.createElement("li");
      item.textContent = value;
      return item;
    }),
  );
}

function handleTabKeys(event, current, total, select) {
  let next = current;
  if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (current + 1) % total;
  else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (current - 1 + total) % total;
  else if (event.key === "Home") next = 0;
  else if (event.key === "End") next = total - 1;
  else return;
  event.preventDefault();
  select(next, true);
}

function makeKernelButton(item, index, location) {
  const button = document.createElement("button");
  const code = document.createElement("span");
  const name = document.createElement("strong");
  button.type = "button";
  button.dataset.kernelIndex = String(index);
  button.dataset.location = location;
  button.setAttribute("aria-label", `${item.code} ${item.name}`);
  if (location === "tabs") {
    button.id = `kernel-tab-${index}`;
    button.setAttribute("role", "tab");
    button.setAttribute("aria-controls", "kernelPanel");
    button.addEventListener("keydown", (event) =>
      handleTabKeys(event, index, kernelData.length, selectKernel),
    );
  }
  code.textContent = item.code.replace("K", "");
  name.textContent = item.name;
  button.append(code, name);
  button.addEventListener("click", () => {
    selectKernel(index, location === "tabs");
    if (location === "spine") document.querySelector("#kernel")?.scrollIntoView({ behavior: "smooth" });
  });
  return button;
}

function renderKernelNavigation() {
  element.kernelTabs?.replaceChildren(
    ...kernelData.map((item, index) => makeKernelButton(item, index, "tabs")),
  );
  element.topSpine?.replaceChildren(
    ...kernelData.map((item, index) => makeKernelButton(item, index, "spine")),
  );
  selectKernel(activeKernel, false);
}

function selectKernel(index, focus = false) {
  activeKernel = index;
  const item = kernelData[index];
  document.querySelectorAll("[data-kernel-index]").forEach((button) => {
    const selected = Number(button.dataset.kernelIndex) === index;
    button.classList.toggle("active", selected);
    if (button.getAttribute("role") === "tab") {
      button.setAttribute("aria-selected", String(selected));
      button.tabIndex = selected ? 0 : -1;
      if (selected && focus) button.focus();
    }
  });
  setText(element.kernelCode, item.code);
  setText(element.kernelName, item.name);
  setText(element.kernelQuestion, item.question);
  setText(element.kernelDefinition, item.definition);
  renderList(element.kernelVisible, item.visible);
  setText(element.kernelGovernance, item.governance);
}

function selectContract(key, focus = false) {
  activeContract = key;
  const data = contractData[key];
  const buttons = [...document.querySelectorAll("[data-contract]")];
  buttons.forEach((button) => {
    const selected = button.dataset.contract === key;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-selected", String(selected));
    button.tabIndex = selected ? 0 : -1;
    if (selected && focus) button.focus();
  });
  element.contractPanel?.classList.toggle("process-mode", key === "process");
  element.contractPanel?.classList.toggle("collaborative-mode", key === "collaborative");
  setText(element.contractMode, data.mode);
  setText(element.contractName, data.name);
  setText(element.contractStatement, data.statement);
  setText(element.contractObject, data.object);
  element.contractFlow?.replaceChildren(
    ...data.flow.map((value) => {
      const step = document.createElement("span");
      step.textContent = value;
      return step;
    }),
  );
  renderList(element.contractSystem, data.system);
  renderList(element.contractHuman, data.human);
  renderList(element.contractSurfaces, data.surfaces);
  renderList(element.contractDont, data.dont);
}

function bindContractTabs() {
  const buttons = [...document.querySelectorAll("[data-contract]")];
  buttons.forEach((button, index) => {
    button.addEventListener("click", () => selectContract(button.dataset.contract));
    button.addEventListener("keydown", (event) =>
      handleTabKeys(event, index, buttons.length, (next) =>
        selectContract(buttons[next].dataset.contract, true),
      ),
    );
  });
  selectContract(activeContract);
}

function renderFamilyTabs() {
  const buttons = familyData.map((family, index) => {
    const button = document.createElement("button");
    const code = document.createElement("span");
    const label = document.createElement("strong");
    button.type = "button";
    button.id = `family-tab-${index}`;
    button.setAttribute("role", "tab");
    button.setAttribute("aria-controls", "familyName");
    button.setAttribute("aria-label", `${family.code} ${family.name}`);
    code.textContent = family.code.replace("C", "");
    label.textContent = family.short;
    button.append(code, label);
    button.addEventListener("click", () => selectFamily(index));
    button.addEventListener("keydown", (event) =>
      handleTabKeys(event, index, familyData.length, selectFamily),
    );
    return button;
  });
  element.familyTabs?.replaceChildren(...buttons);
  selectFamily(activeFamily, false);
}

function selectFamily(index, focus = false) {
  activeFamily = index;
  const family = familyData[index];
  const buttons = [...element.familyTabs.querySelectorAll('[role="tab"]')];
  buttons.forEach((button, buttonIndex) => {
    const selected = buttonIndex === index;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-selected", String(selected));
    button.tabIndex = selected ? 0 : -1;
    if (selected && focus) button.focus();
  });
  setText(element.familyCode, family.code);
  setText(element.familyName, family.name);
  setText(element.familyQuestion, family.question);
  renderList(element.familyTasks, family.tasks);
  renderList(element.familyArtifacts, family.artifacts);
  renderList(element.familySurfaces, family.surfaces);
  setText(element.familyBoundary, family.boundary);
}

function renderAnalysisSpectrum() {
  const values = ["Rapid Answer", "Explore", "Compare", "Monitor", "Diagnose", "Investigate", "Forecast", "Simulate", "Decide"];
  element.analysisSpectrum?.replaceChildren(
    ...values.map((value) => {
      const item = document.createElement("span");
      item.textContent = value;
      return item;
    }),
  );
}

function renderPrinciples() {
  const filters = [
    ["all", "All"],
    ["foundation", "Foundation"],
    ["control", "Control"],
    ["trust", "Trust"],
    ["continuity", "Continuity"],
  ];
  element.principleFilters?.replaceChildren(
    ...filters.map(([key, label], index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.principleFilter = key;
      button.textContent = label;
      button.classList.toggle("active", index === 0);
      button.setAttribute("aria-pressed", String(index === 0));
      button.addEventListener("click", () => filterPrinciples(key));
      return button;
    }),
  );

  element.principleGrid?.replaceChildren(
    ...principleData.map((principle) => {
      const card = document.createElement("article");
      const code = document.createElement("span");
      const title = document.createElement("h3");
      const text = document.createElement("p");
      const footer = document.createElement("footer");
      const testLabel = document.createElement("strong");
      const test = document.createElement("p");
      card.className = "principle-card";
      card.dataset.category = principle.category;
      code.textContent = `PRINCIPLE ${principle.id}`;
      title.textContent = principle.title;
      text.textContent = principle.text;
      testLabel.textContent = "DESIGN TEST";
      test.textContent = principle.test;
      footer.append(testLabel, test);
      card.append(code, title, text, footer);
      return card;
    }),
  );
}

function filterPrinciples(key) {
  document.querySelectorAll("[data-principle-filter]").forEach((button) => {
    const selected = button.dataset.principleFilter === key;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  document.querySelectorAll(".principle-card").forEach((card) => {
    card.classList.toggle("hidden", key !== "all" && card.dataset.category !== key);
  });
}

function renderAcceptance() {
  element.acceptanceGrid?.replaceChildren(
    ...acceptanceData.map((item) => {
      const card = document.createElement("article");
      const header = document.createElement("header");
      const code = document.createElement("span");
      const name = document.createElement("strong");
      const text = document.createElement("p");
      const footer = document.createElement("footer");
      card.className = "acceptance-card";
      code.textContent = item.id;
      name.textContent = item.name;
      text.textContent = item.text;
      footer.textContent = item.metric;
      header.append(code, name);
      card.append(header, text, footer);
      return card;
    }),
  );
}

function renderWhitepaper() {
  element.whitepaperParts?.replaceChildren(
    ...whitepaperData.map((part) => {
      const card = document.createElement("article");
      const code = document.createElement("span");
      const title = document.createElement("h3");
      const list = document.createElement("ol");
      card.className = "whitepaper-part";
      code.textContent = part.code;
      title.textContent = part.name;
      list.replaceChildren(
        ...part.chapters.map((chapter) => {
          const item = document.createElement("li");
          item.textContent = chapter;
          return item;
        }),
      );
      card.append(code, title, list);
      return card;
    }),
  );
}

function setSidebar(open) {
  if (!element.sidebar || !element.sidebarBackdrop || !element.menuButton) return;
  element.sidebar.classList.toggle("open", open);
  element.sidebarBackdrop.hidden = !open;
  element.menuButton.setAttribute("aria-expanded", String(open));
  element.menuButton.setAttribute("aria-label", open ? "关闭文档目录" : "打开文档目录");
}

function bindSidebar() {
  element.menuButton?.addEventListener("click", () =>
    setSidebar(!element.sidebar.classList.contains("open")),
  );
  element.sidebarBackdrop?.addEventListener("click", () => setSidebar(false));
  document.querySelectorAll("#tableOfContents a").forEach((link) => {
    link.addEventListener("click", () => setSidebar(false));
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && element.sidebar?.classList.contains("open")) {
      setSidebar(false);
      element.menuButton?.focus();
    }
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 940) setSidebar(false);
  });
}

function bindScrollSpy() {
  const links = [...document.querySelectorAll("#tableOfContents a")];
  const sections = [...document.querySelectorAll("[data-section]")];
  let scheduled = false;
  const update = () => {
    scheduled = false;
    const activationLine = 170;
    let activeSection = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= activationLine) activeSection = section;
      else break;
    }
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
      activeSection = sections.at(-1);
    }
    const activeHref = `#${activeSection.id}`;
    links.forEach((link) => {
      const selected = link.getAttribute("href") === activeHref;
      link.classList.toggle("active", selected);
      if (selected) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  };
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(update);
  };
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  update();
}

renderKernelNavigation();
bindContractTabs();
renderFamilyTabs();
renderAnalysisSpectrum();
renderPrinciples();
renderAcceptance();
renderWhitepaper();
bindSidebar();
bindScrollSpy();
