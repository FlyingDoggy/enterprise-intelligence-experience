import { guidanceLabel, uiLabel } from "./locales/zh-CN.js";
const patternState = new Map();

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function stateClass(state) {
  return String(state).toLocaleLowerCase("en-US").replaceAll(/[^a-z0-9]+/g, "-");
}

function field(label, value, tone = "") {
  return `<div class="gx-field ${tone}"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
}

function badge(axis, value, tone = "") {
  return `<span class="gx-axis ${tone}"><i aria-hidden="true"></i><b>${escapeHtml(axis)}</b>${escapeHtml(value)}</span>`;
}

function step(label, state, detail = "") {
  return `<li class="gx-step is-${stateClass(state)}"><i aria-hidden="true"></i><div><strong>${escapeHtml(label)}</strong><span>${escapeHtml(uiLabel(state))}${detail ? ` · ${escapeHtml(detail)}` : ""}</span></div></li>`;
}

function placeholder(name) {
  return `<span class="gx-placeholder">{${escapeHtml(name)}}</span>`;
}

function guidanceFrame(pattern, state, content, recovery) {
  const contractLabel = {
    shared: "共享交互约定",
    process: "Process Intelligence",
    collaborative: "Collaborative Intelligence",
  }[pattern.contract];
  return `
    <article class="gx-frame gx-${escapeHtml(pattern.id.toLocaleLowerCase("en-US"))} is-${stateClass(state)}">
      <header class="gx-object-header">
        <div>
          <span>${escapeHtml(contractLabel)} · ${escapeHtml(pattern.id)}</span>
          <h4>${escapeHtml(guidanceLabel(pattern))}</h4>
          <p>${escapeHtml(pattern.workObject)} · 负责人 ${placeholder("负责人")}</p>
        </div>
        <div class="gx-object-status">
          ${badge(pattern.previewAxis?.label || "参考状态", uiLabel(state), "workflow")}
          <small>模拟 · 不执行外部操作</small>
        </div>
      </header>
      ${content}
      <footer class="gx-recovery">
        <span>失败 / 降级 / 恢复</span>
        <p>${recovery}</p>
      </footer>
    </article>
  `;
}

function s01(pattern, state) {
  const status =
    state === "Restricted"
      ? badge("权限", "拒绝", "permission")
      : state === "Stale"
        ? badge("新鲜度", "已过期", "warning")
        : badge("权限", "允许", "success");
  return guidanceFrame(
    pattern,
    state,
    `
      <section class="gx-goal-context">
        <div class="gx-goal">
          <span>目标</span>
          <h5>${placeholder("用结果语言描述的业务目标")}</h5>
          <p>${placeholder("工作价值与完成条件")}</p>
        </div>
        <div class="gx-context-grid">
          ${field("对象编号", "{TYPE-000 · r0}")}
          ${field("范围", "{业务领域 · 期间 · 受众}")}
          ${field("上下文快照", "{CTX-000 · 捕获时间}")}
          ${field("新鲜度", state === "Stale" ? "已过期 · 需要刷新" : "{截至时间点仍有效}", state === "Stale" ? "warning" : "")}
        </div>
        <div class="gx-axis-row">
          ${badge("工作状态", "启用", "workflow")}
          ${status}
          ${badge("自主等级", "建议", "autonomy")}
        </div>
      </section>
    `,
    state === "Restricted"
      ? "保留目标与对象方向；隐藏受限内容；显示管控策略版本、申请访问入口与负责人。"
      : state === "Stale"
        ? "保留最后可用快照并明确过期；刷新不得静默改变修订版本。"
        : "上下文缺失时标记为需要确认，只问会改变目标或范围的关键问题。",
  );
}

function s02(pattern, state) {
  const applied = ["Applied", "Reverted", "Branched"].includes(state);
  return guidanceFrame(
    pattern,
    state,
    `
      <section class="gx-intent-diff">
        <div class="gx-source">${field("来源", "{自然语言 / 表单 / 拖拽 / 系统}")}${field("目标", "{对象编号 · 修订版本}")}</div>
        <div class="gx-diff-grid" role="table" aria-label="意图变更预览">
          <div role="row"><span role="columnheader">字段</span><span role="columnheader">变更前</span><span role="columnheader">变更后</span></div>
          <div role="row"><b role="cell">{维度}</b><del role="cell">{原值}</del><ins role="cell">{建议值}</ins></div>
          <div role="row"><b role="cell">{期间}</b><del role="cell">{原范围}</del><ins role="cell">{新范围}</ins></div>
        </div>
        <div class="gx-impact">
          ${badge("校验", state === "Proposed" ? "待处理" : "兼容", state === "Proposed" ? "warning" : "success")}
          <p><b>影响</b> · ${placeholder("重新计算区块 · 相关校验失效 · 重新检查权限")}</p>
        </div>
        <aside class="gx-clarification-budget">
          <header><span>澄清预算</span><strong>只问会改变目标、范围或风险的一个问题。</strong></header>
          <div>
            ${field("高可信 · 低风险", "直接应用并支持撤销 · 0 个问题")}
            ${field("中等可信", "最多 2 个具体解释 · 选择 1 个")}
            ${field("低可信", "1 个关键问题 · 不进行开放式追问")}
            ${field("范围 / 方法变化", "预览差异 · 应用前重新校验", "warning")}
          </div>
        </aside>
        <div class="gx-actions">
          <button type="button" ${applied ? "disabled" : ""}>应用变更</button>
          <button type="button" ${state !== "Applied" ? "disabled" : ""}>创建撤销记录</button>
          <button type="button">改为创建分支</button>
        </div>
      </section>
    `,
    "非法组合保留原值并给出最多两个合法替代；已发布对象只能创建分支，不得原位覆盖。",
  );
}

function s03(pattern, state) {
  const failed = ["Partial", "Blocked", "Failed"].includes(state);
  return guidanceFrame(
    pattern,
    state,
    `
      <section class="gx-plan">
        <ol>
          ${step("01 · 校验输入", "Verified", "负责人 · 系统")}
          ${step("02 · 返回基础结果", "Verified", "稳定交付物已保留")}
          ${step("03 · 运行高阶方法", state, state === "Partial" ? "缺少可选输入" : "{依赖状态}")}
          ${step("04 · 准备叙事", failed ? "Conditional" : "Ready", "{依赖步骤 03}")}
        </ol>
        <aside class="gx-orientation ${failed ? "warning" : ""}">
          <span>${failed ? "部分完成说明" : "当前进度"}</span>
          <strong>${failed ? "2 个已核验产出仍然可用。" : placeholder("当前节点与负责人")}</strong>
          <p>${failed ? "高阶产出不可用；未删除任何已核验结果。" : placeholder("依赖 · 预期下一事件 · 停止条件")}</p>
        </aside>
        <div class="gx-wait-contract">
          <span>长时间运行任务</span>
          <ul>
            <li><b>&lt;1s</b><span>直接返回，不播放过场</span></li>
            <li><b>1–5s</b><span>当前步骤名称，不伪造业务完成度</span></li>
            <li><b>5–30s</b><span>节点进度、基础结果先行、可取消</span></li>
            <li><b>&gt;30s</b><span>转后台任务、可离开、完成后通知</span></li>
          </ul>
        </div>
        <div class="gx-actions"><button type="button">安全停止</button><button type="button">重试失败节点</button><button type="button">人工接管</button></div>
      </section>
    `,
    "显示发生了什么、保留了什么、缺少什么、下一步是什么、谁负责；禁止用计时器伪造业务进度。",
  );
}

function s04(pattern, state) {
  const stale = state === "Stale";
  const insufficient = state === "Insufficient";
  return guidanceFrame(
    pattern,
    state,
    `
      <section class="gx-evidence">
        <div class="gx-evidence-claim">
          <span>有依据支持的结论</span>
          <blockquote>${placeholder("引用共享工作结果对象的结论文字")}</blockquote>
          <div class="gx-axis-row">
            ${badge("结论", "计算", "claim")}
            ${badge("依据", uiLabel(state), stale || insufficient ? "warning" : "evidence")}
          </div>
        </div>
        <dl>
          <div><dt>来源</dt><dd>{数据集 / 文档 / 系统记录}</dd></div>
          <div><dt>语义版本</dt><dd>{指标定义 · v0}</dd></div>
          <div><dt>快照</dt><dd>{时间 · 查询哈希 · 修订版本}</dd></div>
          <div><dt>范围</dt><dd>{筛选条件 · 期间 · 粒度 · 单位}</dd></div>
          <div><dt>方法</dt><dd>{确定性计算 / 带引用的提取}</dd></div>
          <div><dt>限制</dt><dd>${insufficient ? "缺少所需基准。" : "{已知边界与排除的依据}"}</dd></div>
        </dl>
        ${stale ? '<aside class="gx-inline-alert">校验后依据发生变化，相关校验已失效。</aside>' : ""}
        <div class="gx-actions"><button type="button">打开来源信息</button><button type="button">查看支撑数据</button></div>
      </section>
    `,
    "不可访问时保留结论位置，但降级为未核验或依据不足；显示缺失来源、负责人和重新验证要求。",
  );
}

function s05(pattern, state) {
  const confirmed = state === "Confirmed";
  return guidanceFrame(
    pattern,
    state,
    `
      <section class="gx-decision">
        <header><span>决策问题</span><h5>${placeholder("需要作出的决策，不是人工智能建议")}</h5></header>
        <div class="gx-decision-options">
          <article class="${confirmed ? "selected" : ""}"><span>方案 A</span><strong>{所选 / 建议方案}</strong><p>{取舍与依据}</p></article>
          <article><span>方案 B</span><strong>{备选方案}</strong><p>{取舍与依据}</p></article>
        </div>
        <div class="gx-decision-record">
          ${field("决策负责人", confirmed ? "{已指定的决策负责人}" : "{确认前必须填写}", confirmed ? "" : "warning")}
          ${field("理由", "{为什么选择该方案，适用边界是什么}")}
          ${field("依据", "{回执编号与快照}")}
          ${field("审批", confirmed ? "已确认 · 时间" : uiLabel(state))}
        </div>
        <div class="gx-actions"><button type="button" ${confirmed ? "disabled" : ""}>确认决策</button><button type="button">请求依据</button></div>
      </section>
    `,
    "负责人或依据缺失时保持待处理或等待依据；建议标签不得替换决策记录。",
  );
}

function s06(pattern, state) {
  const passed = state === "Passed";
  const blocked = ["Failed", "Invalidated"].includes(state);
  return guidanceFrame(
    pattern,
    state,
    `
      <section class="gx-gate">
        <div class="gx-gate-subject">${field("目标", "{交付物编号 · 修订版本}")}${field("依据快照", "{EVS-000}")}${field("管控策略 / 权限", "{版本 · 主体 · 范围}")}</div>
        <ul class="gx-checks">
          ${step("依据覆盖", blocked ? "Failed" : passed ? "Passed" : "Pending")}
          ${step("叙事 / 工作结果一致性", passed ? "Passed" : "Pending")}
          ${step("新鲜度", state === "Invalidated" ? "Invalidated" : passed ? "Passed" : "Pending")}
          ${step("权限与受众", passed ? "Passed" : "Pending")}
        </ul>
        <div class="gx-gate-result ${blocked ? "blocking" : ""}">
          ${badge("发布校验", uiLabel(state), passed ? "success" : blocked ? "warning" : "workflow")}
          <p>${passed ? "检查已通过。交付物仍未发布，直到用户单独执行发布操作。" : blocked ? "发布已阻断，现有草稿仍然可用。" : "针对当前不可变快照运行检查。"}</p>
        </div>
        <div class="gx-actions"><button type="button">${state === "Not Run" ? "运行校验" : "重新校验"}</button><button type="button" ${passed ? "" : "disabled"}>发布修订版本</button></div>
      </section>
    `,
    "依据、管控策略或权限版本变化会使旧校验失效；重新校验必须绑定新快照，校验通过不等于已发布。",
  );
}

function s07(pattern, state) {
  const approved = ["Approved", "Queued", "Executing", "Succeeded", "Partial", "Failed"].includes(state);
  const executable = state === "Approved";
  const terminal = ["Succeeded", "Partial", "Failed"].includes(state);
  return guidanceFrame(
    pattern,
    state,
    `
      <section class="gx-action">
        <div class="gx-action-preview">
          ${field("业务操作 / 目标", "{有明确名称的外部变化 · 目标编号}")}
          ${field("执行主体", "{人员 / 服务身份}")}
          ${field("参数", "{准确且有边界的载荷}")}
          ${field("影响 / 风险", "{受影响记录 · 可撤销性}", "warning")}
        </div>
        <div class="gx-axis-row">
          ${badge("权限", "按条件", "permission")}
          ${badge("自主等级", "需要审批", "autonomy")}
          ${badge("风险", "可撤销", "warning")}
        </div>
        <ol class="gx-action-lanes">
          ${step("准备", ["Proposed", "Preflight Ready"].includes(state) ? state : "Complete")}
          ${step("审批", state === "Awaiting Approval" ? state : approved ? "Approved" : "Pending")}
          ${step("执行", state === "Executing" ? "Executing" : state === "Queued" ? "Queued" : terminal ? state : "Not started")}
          ${step("业务成效", terminal ? "Pending observation" : "Not applicable yet", "独立关联记录")}
        </ol>
        <div class="gx-actions">
          <button type="button" ${state !== "Awaiting Approval" ? "disabled" : ""}>批准</button>
          <button type="button" ${executable ? "" : "disabled"}>执行已批准操作</button>
          <button type="button">安全取消</button>
        </div>
        <p class="gx-separation">审批记录授权；执行改变外部状态；业务操作状态记录执行情况；业务成效单独观测。</p>
      </section>
    `,
    "权限拒绝时不得排队；执行前原子重验权限、管控策略与目标；失败时保留原业务操作。需要补偿时，创建引用原业务操作的新操作。",
  );
}

function s08(pattern, state, states = {}) {
  const effect = states.effect || "Not Assessed";
  const observed = state === "Observed";
  const invalidEffect = !observed && effect !== "Not Assessed";
  return guidanceFrame(
    pattern,
    state,
    `
      <section class="gx-outcome">
        <div class="gx-outcome-compare">
          <article><span>预期业务条件</span><strong>${placeholder("可衡量的预期后置条件与观测窗口")}</strong></article>
          <article><span>权威记录系统中的观测</span><strong>${observed ? placeholder("已观测值 / 条件") : "尚未观测 · 已安排复核"}</strong></article>
        </div>
        <div class="gx-axis-row">
          ${badge("观测", uiLabel(state), observed ? "evidence" : "warning")}
          ${badge("效果", uiLabel(effect), effect === "Improved" ? "success" : "warning")}
          ${badge("依据", observed ? "系统记录" : "待处理", "evidence")}
        </div>
        ${invalidEffect ? '<p class="gx-separation">效果仍是独立字段，但在存在观测记录前不能作出判断。</p>' : ""}
        <div class="gx-handoff-link">
          <span>业务成效回执</span>
          ${field("关联业务操作 / 事项", "{ACT-000 / CASE-000 · 不可变修订版本}")}
          ${field("权威记录系统", "{来源系统 · 查询 / 事件编号}")}
          ${field("观测窗口", "{开始 · 到期 · 实际观测时间}")}
          ${field("下次复核", observed ? "{监测 / 关闭 / 调查}" : "{负责人 · 到期时间}")}
        </div>
        <div class="gx-actions"><button type="button">打开系统记录</button><button type="button">打开关联业务操作</button></div>
      </section>
    `,
    "业务操作显示成功也不得自动显示业务改善。无可观察的权威记录系统时保持无法判断，并说明缺少什么和何时复核。",
  );
}

function s09(pattern, state) {
  const blocked = ["Scope Missing", "Permission Drift", "Stale", "Suspended"].includes(state);
  const permission = state === "Permission Drift" || state === "Suspended" ? "Denied" : "Conditional";
  return guidanceFrame(
    pattern,
    state,
    `
      <section class="gx-capability">
        <header>
          <div>
            <span>能力快照</span>
            <h5>${placeholder("执行服务 / 智能体身份")}</h5>
            <small>能力声明 · 不是授权</small>
          </div>
          ${field("负责人 / 版本", "{已指定负责人} · v{n}")}
        </header>
        <div class="gx-axis-row">
          ${badge("权限", uiLabel(permission), permission === "Denied" ? "warning" : "permission")}
          ${badge("自主等级", "按业务操作声明", "autonomy")}
          ${badge("风险", "按目标评估", "warning")}
          ${badge("校验", uiLabel(state), blocked ? "warning" : "success")}
        </div>
        <div class="gx-capability-grid">
          <article>
            <span>范围</span>
            <strong>${state === "Scope Missing" ? "缺失 · 业务操作校验已阻断" : "{有边界的领域 · 对象 · 操作}"}</strong>
            <p>{不得静默扩大或裁剪}</p>
          </article>
          <article>
            <span>回执与升级路径</span>
            <strong>{规则 / 快照 / 执行主体 / 审批人 / 后置条件}</strong>
            <p>{失败负责人 · 响应目标 · 追踪编号}</p>
          </article>
        </div>
        <div class="gx-capability-actions" role="table" aria-label="已声明的业务操作能力">
          <div role="row"><span role="columnheader">业务操作</span><span role="columnheader">自主等级</span><span role="columnheader">可撤销性</span><span role="columnheader">界面义务</span></div>
          <div role="row"><b role="cell">{读取 / 检查}</b><span role="cell">在管控策略范围内执行</span><span role="cell">不改变外部状态</span><span role="cell">显示范围与来源</span></div>
          <div role="row"><b role="cell">{准备变更}</b><span role="cell">准备</span><span role="cell">可撤销</span><span role="cell">预览与回执结构</span></div>
          <div role="row"><b role="cell">{高影响业务操作}</b><span role="cell">需要审批</span><span role="cell">可补偿 / 不可逆</span><span role="cell">预检与明确授权</span></div>
        </div>
        <div class="gx-gate-result ${blocked ? "blocking" : ""}">
          ${blocked ? "能力快照不能支持当前业务操作；不显示执行控件。" : "快照完整；业务操作仍需单独检查目标、管控策略、权限与风险。"}
        </div>
      </section>
    `,
    "能力快照不是授权本身。缺少范围、版本过期、权限漂移或服务暂停时，保留提案并交给明确负责人。",
  );
}

function s10(pattern, state) {
  const ready = ["Ready", "Accepted"].includes(state);
  const accepted = state === "Accepted";
  const blocked = ["Returned", "Expired"].includes(state);
  return guidanceFrame(
    pattern,
    state,
    `
      <section class="gx-handoff">
        <div class="gx-handoff-link">
          <span>工作转移 · 关联对象</span>
          <h5>${placeholder("向接收负责人请求的具体决策或工作")}</h5>
          ${field("来源", "{来源对象 · 不可变修订版本}")}
          ${field("去向", "{目标对象类型 · 建议负责人}")}
          ${field("根对象与追踪编号", "{ROOT-000 · TRACE-000}")}
          ${field("权限 / 截止时间", "{允许的决策 · 到期时间}", blocked ? "warning" : "")}
        </div>
        <div class="gx-recovery-columns">
          <section><span>已完成工作</span>${step("{已核验结果}", "Retained")}${step("{依据快照}", "Retained")}</section>
          <section><span>待处理工作</span>${step("{请求的决策}", accepted ? "Accepted" : state)}${step("{缺失输入}", blocked ? "Required" : "Known")}</section>
        </div>
        <div class="gx-axis-row">
          ${badge("权限", state === "Expired" ? "需要重新校验" : "按条件", "permission")}
          ${badge("交接", uiLabel(state), ready ? "success" : blocked ? "warning" : "workflow")}
        </div>
        <div class="gx-actions">
          <button type="button" data-guidance-next-state="Ready" ${state !== "Prepared" ? "disabled" : ""}>校验交接包</button>
          <button type="button" data-guidance-next-state="Accepted" ${state !== "Ready" ? "disabled" : ""}>接收工作</button>
          <button type="button" data-guidance-next-state="Returned" ${accepted ? "disabled" : ""}>说明原因并退回</button>
        </div>
      </section>
    `,
    "缺少追踪编号、请求的决策或授权范围时不得进入可接收状态。退回时必须说明缺失字段；接收前来源负责人不变，接收后仍保留来源修订版本。",
  );
}

function s11(pattern, state, states = {}) {
  const observationBasis = states["observation-basis"] || "Criteria Evaluated";
  const resolved = state === "Resolved";
  const unobserved = observationBasis === "Unobserved";
  return guidanceFrame(
    pattern,
    state,
    `
      <section class="gx-result-resolution">
        <article class="gx-result-card">
          <header><span>工作结果 · RSLT-000 · r1</span>${badge("结论", "事实 / 计算", "claim")}</header>
          <h5>${placeholder("直接答案、计算值或生成的分析结果")}</h5>
          <p>${placeholder("范围 · 期间 · 新鲜度 · 限制")}</p>
          <div class="gx-axis-row">${badge("依据", "已核验", "evidence")}${badge("工作结果", "已交付", "success")}</div>
          <div class="gx-actions"><button type="button">打开依据</button><button type="button">复制工作结果引用</button></div>
        </article>
        <article class="gx-resolution-card ${unobserved ? "warning" : ""}">
          <span>目标完成判断 · GRES-000</span>
          <h5>${escapeHtml(uiLabel(state))}</h5>
          <div class="gx-axis-row">${badge("完成判断", uiLabel(state), resolved ? "success" : "warning")}${badge("观测基础", uiLabel(observationBasis), unobserved ? "warning" : "evidence")}</div>
          ${field("目标完成条件", "{用户要求本次任务确认的事项}")}
          ${field("观测基础", unobserved ? "用户离开 / 未确认 · 不推断成功" : uiLabel(observationBasis))}
          ${field("判断修订版本", "{目标修订版本 · 工作结果修订版本 · 时间}")}
          <p>${unobserved ? "工作结果已交付；目标是否完成仍未观测。" : resolved ? "本任务可以在此合法结束，无需创建交付物、决策或业务操作。" : "保持工作结果稳定，并提供有边界的下一步。"}</p>
          ${resolved && unobserved ? '<p class="gx-separation">各字段保持独立；声明任务已完成前，需要人工检查该组合。</p>' : ""}
        </article>
        <div class="gx-actions gx-result-options">
          <button type="button" data-guidance-next-state="Resolved" data-guidance-next-axis="assessment">标记为已完成</button>
          <button type="button">继续分析</button>
          <button type="button">整理为交付物</button>
        </div>
      </section>
    `,
    "工作结果交付不自动等于目标完成；用户离开时记录未观测。需要继续时可创建计划、交付物、决策或业务操作，不回写原工作结果。",
  );
}

function p01(pattern, state) {
  return guidanceFrame(
    pattern,
    state,
    `
      <section class="gx-console">
        <div class="gx-console-summary">
          ${field("队列全集", "{全部事项 · 分母可见}")}
          ${field("正常", "{数量 / 比例}", "success")}
          ${field("需要关注", "{未知 + 异常}", state === "Attention" ? "warning" : "")}
          ${field("服务时限风险", "{数量 · 最长等待时间}", state === "Degraded" ? "warning" : "")}
        </div>
        <div class="gx-console-layout">
          <div class="gx-case-list" role="list">
            <button type="button" role="listitem"><span>未知</span><strong>{事项编号}</strong><small>{为何分类为未知}</small></button>
            <button type="button" role="listitem"><span>失败</span><strong>{事项编号}</strong><small>{失败 · 负责人 · 恢复欠账}</small></button>
            <button type="button" role="listitem"><span>审批</span><strong>{事项编号}</strong><small>{请求的决策 · 截止时间}</small></button>
          </div>
          <aside class="gx-case-inspector">
            <span>当前异常</span>
            ${field("当前状态", uiLabel(state))}
            ${field("最后已核验步骤", "{步骤 / 时间}")}
            ${field("负责人", "{事项负责人}")}
            ${field("恢复方式", "{重试 / 补偿 / 接管}")}
            <div class="gx-actions"><button type="button">接管</button><button type="button">暂停事项</button></div>
          </aside>
        </div>
      </section>
    `,
    "系统降级时先暴露未知情况与分母；暂停时保留队列状态；接管时携带最后验证节点与完整审计记录。",
  );
}

function p02(pattern, state) {
  const active = state === "Active";
  const approved = ["Approved", "Staged", "Active"].includes(state);
  return guidanceFrame(
    pattern,
    state,
    `
      <section class="gx-rule">
        <div class="gx-rule-source">${field("来源决策", "{决策编号 · 依据快照}")}${field("负责人 / 范围", "{已指定负责人 · 未来事项范围}")}</div>
        <ol class="gx-rule-lifecycle" data-semantic-flow="guidance-rule-change" aria-label="规则变更主路径">
          ${step("候选提案", "Complete", "源自一次人工决策")}
          ${step("回放测试", ["Validated", "Approved", "Staged", "Active"].includes(state) ? "Passed" : "Pending")}
          ${step("冲突与职责分离检查", approved ? "Passed" : "Pending")}
          ${step("审批", approved ? "Approved" : "Not approved")}
          ${step("预发布", ["Staged", "Active"].includes(state) ? "Complete" : "Not started")}
          ${step("启用", active ? "Active" : "Not active")}
        </ol>
        <div class="gx-rule-impact">
          ${badge("规则状态", uiLabel(state), active ? "success" : "workflow")}
          <p>${active ? "只影响未来符合条件的事项；监测与回滚仍然可见。" : "仅为模拟；当前与历史事项保持不变。"}</p>
        </div>
        <div class="gx-actions"><button type="button" ${state !== "Validated" ? "disabled" : ""}>批准提案</button><button type="button" ${state !== "Staged" ? "disabled" : ""}>启用预发布规则</button><button type="button">暂停 / 回滚</button></div>
      </section>
    `,
    "拒绝或暂停后不得留下启用视觉或派生KPI；回滚产生新事件，并保留原规则修订版本与受影响事项范围。",
  );
}

function p03(pattern, state) {
  return guidanceFrame(
    pattern,
    state,
    `
      <section class="gx-recovery-workspace">
        <aside class="gx-failure-banner">
          <span>原始失败 · 不可变</span>
          <strong>${placeholder("失败的业务操作 / 步骤及业务影响")}</strong>
          <p>{发现时间 · 业务操作编号 · 受影响范围}</p>
        </aside>
        <div class="gx-recovery-columns">
          <section><span>已完成工作</span>${step("{已核验步骤 A}", "Retained")}${step("{已成功业务操作 B}", "Retained")}</section>
          <section><span>待处理工作</span>${step("{失败步骤 C}", state)}${step("{依赖步骤 D}", "Blocked")}</section>
        </div>
        <div class="gx-recovery-options">
          <button type="button"><b>重试</b><span>{前置条件与效果}</span></button>
          <button type="button"><b>补偿</b><span>{撤销原业务操作编号}</span></button>
          <button type="button"><b>人工接管</b><span>{负责人 · 上下文快照}</span></button>
        </div>
        ${field("审计轨迹", "{失败 → 控制 → 恢复事件 → 后置条件}")}
      </section>
    `,
    "恢复永不删除失败或已验证工作；补偿是独立业务操作；接管保留已完成与待处理边界。",
  );
}

function c01(pattern, state) {
  return guidanceFrame(
    pattern,
    state,
    `
      <section class="gx-mission">
        <div class="gx-mission-goal"><span>协作任务目标</span><h5>${placeholder("以结果为导向的协作任务目标")}</h5><p>{范围 · 负责人 · 修订版本 · 分支}</p></div>
        <div class="gx-mission-layout">
          <aside>
            <span>计划</span>
            ${step("明确问题", "Verified")}
            ${step("产出稳定交付物", state)}
            ${step("评审 / 发布", "Conditional")}
          </aside>
          <main>
            <span>交付物画布</span>
            <article><strong>{稳定交付物区块}</strong><p>{工作结果 / 草稿 / 决策材料}</p></article>
            <article><strong>{工作区块}</strong><p>{人工智能贡献及其来源与状态}</p></article>
          </main>
          <aside>
            <span>上下文与依据</span>
            ${field("上下文", "{快照编号}")}
            ${field("依据", "{回执编号}")}
            ${field("修订版本", state === "Branched" ? "{r4 → 分支 b1}" : "{r4}")}
          </aside>
        </div>
        <div class="gx-actions"><button type="button">在协作任务内追问</button><button type="button">创建分支</button><button type="button">准备发布</button></div>
      </section>
    `,
    "追问与人工智能工作失败不得覆盖已发布交付物；上下文丢失时停在明确任务阶段，并恢复快照或请求确认。",
  );
}

function c02(pattern, state) {
  const partial = state === "Partial";
  return guidanceFrame(
    pattern,
    state,
    `
      <section class="gx-analysis-doc">
        <div class="gx-intent-ribbon"><span>分析意图</span>${placeholder("指标")}${placeholder("拆分维度")}${placeholder("期间")}${placeholder("对比方式")}${placeholder("分析方法")}</div>
        <div class="gx-analysis-layout">
          <main>
            <article class="gx-result-block verified">
              <header><span>结果区块 · 已核验</span>${badge("结论", "事实", "claim")}</header>
              <div class="gx-chart-placeholder">确定性可视化<br><small>{由工作结果对象生成的图表规格}</small></div>
              <p>${placeholder("数据叙事引用同一个工作结果对象")}</p>
              <a href="#/guidance/shared/S04">依据回执 →</a>
            </article>
            <article class="gx-result-block ${partial ? "partial" : ""}">
              <header><span>高阶区块 · ${partial ? "部分完成" : "按条件"}</span>${badge("依据", partial ? "依据不足" : "待处理", "warning")}</header>
              <p>${partial ? "高阶方法已停止：{缺少必需输入}。上方已核验基础结果继续保留。" : placeholder("方法要求与计划产出")}</p>
            </article>
          </main>
          <aside>
            <span>支撑数据 / 限制</span>
            ${field("范围", "{期间 · 筛选条件 · 单位}")}
            ${field("新鲜度", "{时间}")}
            ${field("限制", "{不能得出什么结论}")}
            ${field("发布校验", state === "Validated" ? "已通过 · 尚未发布" : "{状态}")}
          </aside>
        </div>
      </section>
    `,
    "相关性不得写成因果关系；数据不足时降级为描述性分析；部分失败时保留所有已核验工作结果与依据。",
  );
}

function c03(pattern, state) {
  return guidanceFrame(
    pattern,
    state,
    `
      <section class="gx-brief">
        <main>
          <header><span>受众简报 · 同一交付物修订版本</span><h5>${placeholder("面向决策的标题")}</h5><p>{范围 · 新鲜度 · 负责人}</p></header>
          <ol class="gx-story-flow" data-flow-contract="story-outline">
            <li><b>发生了什么</b><span>{已核验结论与关键数字}</span></li>
            <li><b>集中在哪里</b><span>{按排名或分组显示的集中位置}</span></li>
            <li><b>为什么 / 有何限制</b><span>{有依据的驱动因素或明确的依据不足}</span></li>
            <li><b>意味着什么</b><span>{与决策的关系，不虚构业务操作}</span></li>
          </ol>
          <div class="gx-axis-row">${badge("发布", uiLabel(state), state === "Published" ? "success" : "workflow")}${badge("依据", "已核验快照", "evidence")}</div>
        </main>
        <aside>
          <span>修订历史</span>
          ${step("r2", "Superseded", "{时间}")}
          ${step("r3", state === "Published" ? "Published" : "Validated", "{时间}")}
          ${state === "Branched" ? step("r3-b1", "Branched", "问题标记") : ""}
          <button type="button">为什么？</button>
          <button type="button">创建问题标记</button>
          <button type="button">打开依据</button>
        </aside>
      </section>
    `,
    "受众简报只改变信息密度，不复制事实；问题标记创建携带焦点与修订版本信息的分支，不修改已发布修订版本。",
  );
}

const renderers = {
  S01: s01,
  S02: s02,
  S03: s03,
  S04: s04,
  S05: s05,
  S06: s06,
  S07: s07,
  S08: s08,
  S09: s09,
  S10: s10,
  S11: s11,
  P01: p01,
  P02: p02,
  P03: p03,
  C01: c01,
  C02: c02,
  C03: c03,
};

function patternAxes(pattern) {
  return pattern.previewAxes?.length ? pattern.previewAxes : [pattern.previewAxis];
}

function axisStateKey(pattern, axis) {
  return `${pattern.id}:${axis.id}`;
}

function currentStates(pattern) {
  return Object.fromEntries(
    patternAxes(pattern).map((axis) => {
      const key = axisStateKey(pattern, axis);
      const saved = patternState.get(key);
      const state = axis.values.includes(saved) ? saved : axis.values[0];
      patternState.set(key, state);
      return [axis.id, state];
    }),
  );
}

function specimenFrame(pattern, states) {
  const primaryAxis = patternAxes(pattern)[0];
  return renderers[pattern.id](pattern, states[primaryAxis.id], states);
}

export function guidanceSpecimenHtml(pattern) {
  const states = currentStates(pattern);
  const axes = patternAxes(pattern);
  const state = states[axes[0].id];
  const specimenLabel =
    pattern.evidenceLevel === "Contract Simulation"
      ? "约定模拟"
      : pattern.evidenceLevel === "Interactive State Specimen"
        ? "交互状态示例"
        : "静态结构参考";
  return `
    <section class="guidance-live-specimen ${pattern.evidenceLevel === "Static Anatomy Reference" ? "is-static-reference" : ""}" aria-label="${escapeHtml(`${guidanceLabel(pattern)}参考示例`)}">
      <header class="guidance-specimen-heading">
        <div><span>${escapeHtml(specimenLabel)} · ${escapeHtml(pattern.id)}</span><h4>固定区域、独立状态与恢复路径</h4></div>
        <p>${escapeHtml(uiLabel(pattern.maturity))} · 真实业务内容使用 <code>{占位内容}</code></p>
      </header>
      ${
        pattern.evidenceLevel === "Static Anatomy Reference"
          ? `<div class="guidance-static-state"><span>参考快照</span><strong>${axes.map((axis) => `${escapeHtml(axis.label)} · ${escapeHtml(uiLabel(states[axis.id]))}`).join(" / ")}</strong><p>其他状态已在规格中定义；本页尚未声称其行为可交互验证。</p></div>`
          : `<div class="guidance-state-axes">
              ${axes
                .map(
                  (axis) => `
                    <section class="guidance-state-axis">
                      <span>${escapeHtml(axis.label)}</span>
                      <div class="guidance-state-controls" role="group" aria-label="${escapeHtml(`${guidanceLabel(pattern)}${axis.label}选项`)}">
                        ${axis.values
                          .map(
                            (item) =>
                              `<button type="button" data-guidance-axis="${escapeHtml(axis.id)}" data-guidance-state="${escapeHtml(item)}" aria-pressed="${String(item === states[axis.id])}">${escapeHtml(uiLabel(item))}</button>`,
                          )
                          .join("")}
                      </div>
                    </section>
                  `,
                )
                .join("")}
            </div>`
      }
      <div class="guidance-specimen-host" aria-live="polite">${specimenFrame(pattern, states)}</div>
    </section>
  `;
}

export function bindGuidanceSpecimen(container, pattern) {
  const host = container.querySelector(".guidance-specimen-host");
  const buttons = [...container.querySelectorAll("[data-guidance-state]")];
  const axes = patternAxes(pattern);
  const renderStates = () => {
    const states = currentStates(pattern);
    buttons.forEach((item) =>
      item.setAttribute("aria-pressed", String(states[item.dataset.guidanceAxis] === item.dataset.guidanceState)),
    );
    if (host) {
      host.innerHTML = specimenFrame(pattern, states);
      bindHostActions();
    }
  };
  const bindHostActions = () => {
    host?.querySelectorAll("[data-guidance-next-state]").forEach((button) => {
      button.addEventListener("click", () => {
        const nextState = button.dataset.guidanceNextState;
        const axis = axes.find((item) => item.id === (button.dataset.guidanceNextAxis || axes[0].id));
        if (!axis?.values.includes(nextState)) return;
        patternState.set(axisStateKey(pattern, axis), nextState);
        renderStates();
      });
    });
  };
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const state = button.dataset.guidanceState;
      const axis = axes.find((item) => item.id === button.dataset.guidanceAxis);
      if (!axis?.values.includes(state)) return;
      patternState.set(axisStateKey(pattern, axis), state);
      renderStates();
    });
  });
  bindHostActions();
}

export const guidanceSpecimenCoverage = {
  patterns: Object.keys(renderers).length,
  ids: Object.keys(renderers),
  registered: Object.keys(renderers).length === 17,
};
