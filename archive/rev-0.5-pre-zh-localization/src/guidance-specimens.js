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
  return `<li class="gx-step is-${stateClass(state)}"><i aria-hidden="true"></i><div><strong>${escapeHtml(label)}</strong><span>${escapeHtml(state)}${detail ? ` · ${escapeHtml(detail)}` : ""}</span></div></li>`;
}

function placeholder(name) {
  return `<span class="gx-placeholder">{${escapeHtml(name)}}</span>`;
}

function guidanceFrame(pattern, state, content, recovery) {
  return `
    <article class="gx-frame gx-${escapeHtml(pattern.id.toLocaleLowerCase("en-US"))} is-${stateClass(state)}">
      <header class="gx-object-header">
        <div>
          <span>${escapeHtml(pattern.contract.toUpperCase())} CONTRACT · ${escapeHtml(pattern.id)}</span>
          <h4>${escapeHtml(pattern.name)}</h4>
          <p>${escapeHtml(pattern.workObject)} · Owner ${placeholder("Owner")}</p>
        </div>
        <div class="gx-object-status">
          ${badge(pattern.previewAxis?.label || "Reference State", state, "workflow")}
          <small>SIMULATION · NO EXTERNAL ACTION</small>
        </div>
      </header>
      ${content}
      <footer class="gx-recovery">
        <span>FAILURE / DEGRADATION / RECOVERY</span>
        <p>${recovery}</p>
      </footer>
    </article>
  `;
}

function s01(pattern, state) {
  const status =
    state === "Restricted"
      ? badge("Permission", "Denied", "permission")
      : state === "Stale"
        ? badge("Freshness", "Stale", "warning")
        : badge("Permission", "Allowed", "success");
  return guidanceFrame(
    pattern,
    state,
    `
      <section class="gx-goal-context">
        <div class="gx-goal">
          <span>GOAL</span>
          <h5>${placeholder("Business goal stated in outcome language")}</h5>
          <p>${placeholder("Why this work matters and what success means")}</p>
        </div>
        <div class="gx-context-grid">
          ${field("Object ID", "{TYPE-000 · r0}")}
          ${field("Scope", "{Business domain · period · audience}")}
          ${field("Context Snapshot", "{CTX-000 · captured timestamp}")}
          ${field("Freshness", state === "Stale" ? "Expired · refresh required" : "{Current as of timestamp}", state === "Stale" ? "warning" : "")}
        </div>
        <div class="gx-axis-row">
          ${badge("Workflow State", "Active", "workflow")}
          ${status}
          ${badge("Autonomy", "Recommend", "autonomy")}
        </div>
      </section>
    `,
    state === "Restricted"
      ? "保留Goal与对象方向；隐藏受限内容；显示Policy版本、Request Access与Owner。"
      : state === "Stale"
        ? "保留最后可用Snapshot并明确过期；Refresh不得静默改变Revision。"
        : "Context缺失时标记Needs Confirmation，只问会改变目标或范围的关键问题。",
  );
}

function s02(pattern, state) {
  const applied = ["Applied", "Reverted", "Branched"].includes(state);
  return guidanceFrame(
    pattern,
    state,
    `
      <section class="gx-intent-diff">
        <div class="gx-source">${field("Source", "{Natural language / form / drag / system}")}${field("Target", "{Object ID · revision}")}</div>
        <div class="gx-diff-grid" role="table" aria-label="Intent change preview">
          <div role="row"><span role="columnheader">Field</span><span role="columnheader">Before</span><span role="columnheader">After</span></div>
          <div role="row"><b role="cell">{Dimension}</b><del role="cell">{Previous value}</del><ins role="cell">{Proposed value}</ins></div>
          <div role="row"><b role="cell">{Period}</b><del role="cell">{Previous scope}</del><ins role="cell">{New scope}</ins></div>
        </div>
        <div class="gx-impact">
          ${badge("Validation", state === "Proposed" ? "Pending" : "Compatible", state === "Proposed" ? "warning" : "success")}
          <p><b>Impact</b> · ${placeholder("Blocks recalculated · Gates invalidated · permissions rechecked")}</p>
        </div>
        <aside class="gx-clarification-budget">
          <header><span>CLARIFICATION BUDGET</span><strong>只问会改变目标、范围或风险的一个问题。</strong></header>
          <div>
            ${field("High confidence · low risk", "Apply with Undo · 0 questions")}
            ${field("Medium confidence", "Up to 2 concrete interpretations · 1 choice")}
            ${field("Low confidence", "1 decisive question · no open-ended chain")}
            ${field("Scope / Method changed", "Preview Diff · revalidate before apply", "warning")}
          </div>
        </aside>
        <div class="gx-actions">
          <button type="button" ${applied ? "disabled" : ""}>Apply Patch</button>
          <button type="button" ${state !== "Applied" ? "disabled" : ""}>Create Revert Patch</button>
          <button type="button">Branch instead</button>
        </div>
      </section>
    `,
    "非法组合保留Before值并给出最多两个合法替代；Published对象只能Branch，不得原位覆盖。",
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
          ${step("01 · Validate inputs", "Verified", "owner · system")}
          ${step("02 · Return base result", "Verified", "stable artifact retained")}
          ${step("03 · Run advanced method", state, state === "Partial" ? "missing optional input" : "{dependency status}")}
          ${step("04 · Prepare narrative", failed ? "Conditional" : "Ready", "{depends on step 03}")}
        </ol>
        <aside class="gx-orientation ${failed ? "warning" : ""}">
          <span>${failed ? "PARTIAL ORIENTATION" : "CURRENT PROGRESS"}</span>
          <strong>${failed ? "2 verified outputs remain available." : placeholder("Current node and owner")}</strong>
          <p>${failed ? "Advanced output is unavailable; no verified result was removed." : placeholder("Dependency · expected next event · stop condition")}</p>
        </aside>
        <div class="gx-wait-contract">
          <span>LONG-RUNNING WORK</span>
          <ul>
            <li><b>&lt;1s</b><span>直接返回，不播放过场</span></li>
            <li><b>1–5s</b><span>当前步骤名称，不伪造业务完成度</span></li>
            <li><b>5–30s</b><span>节点进度、基础结果先行、可取消</span></li>
            <li><b>&gt;30s</b><span>转后台任务、可离开、完成后通知</span></li>
          </ul>
        </div>
        <div class="gx-actions"><button type="button">Stop safely</button><button type="button">Retry failed node</button><button type="button">Human takeover</button></div>
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
          <span>SUPPORTED CLAIM</span>
          <blockquote>${placeholder("Claim text quoting the shared Result object")}</blockquote>
          <div class="gx-axis-row">
            ${badge("Claim", "Calculation", "claim")}
            ${badge("Evidence", state, stale || insufficient ? "warning" : "evidence")}
          </div>
        </div>
        <dl>
          <div><dt>Source</dt><dd>{Dataset / document / system record}</dd></div>
          <div><dt>Semantic version</dt><dd>{Metric definition · v0}</dd></div>
          <div><dt>Snapshot</dt><dd>{Timestamp · query hash · revision}</dd></div>
          <div><dt>Scope</dt><dd>{Filters · period · grain · unit}</dd></div>
          <div><dt>Method</dt><dd>{Deterministic calculation / cited extraction}</dd></div>
          <div><dt>Limitation</dt><dd>${insufficient ? "Required baseline is missing." : "{Known boundary and excluded evidence}"}</dd></div>
        </dl>
        ${stale ? '<aside class="gx-inline-alert">Evidence changed after validation. Dependent gates are invalidated.</aside>' : ""}
        <div class="gx-actions"><button type="button">Open provenance</button><button type="button">View supporting data</button></div>
      </section>
    `,
    "不可访问时保留Claim位置但降级为Unverified/Insufficient；显示缺失来源、Owner和重新验证要求。",
  );
}

function s05(pattern, state) {
  const confirmed = state === "Confirmed";
  return guidanceFrame(
    pattern,
    state,
    `
      <section class="gx-decision">
        <header><span>DECISION QUESTION</span><h5>${placeholder("Decision to be made, not an AI recommendation")}</h5></header>
        <div class="gx-decision-options">
          <article class="${confirmed ? "selected" : ""}"><span>OPTION A</span><strong>{Selected / proposed option}</strong><p>{Trade-off and evidence}</p></article>
          <article><span>OPTION B</span><strong>{Alternative option}</strong><p>{Trade-off and evidence}</p></article>
        </div>
        <div class="gx-decision-record">
          ${field("Accountable owner", confirmed ? "{Named decision owner}" : "{Required before confirmation}", confirmed ? "" : "warning")}
          ${field("Rationale", "{Why this option, within what boundary}")}
          ${field("Evidence", "{Receipt IDs and snapshot}")}
          ${field("Approval", confirmed ? "Confirmed · timestamp" : state)}
        </div>
        <div class="gx-actions"><button type="button" ${confirmed ? "disabled" : ""}>Confirm decision</button><button type="button">Request evidence</button></div>
      </section>
    `,
    "Owner或Evidence缺失时保持Open/Evidence Pending；Recommendation标签不得替换Decision Record。",
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
        <div class="gx-gate-subject">${field("Subject", "{Artifact ID · revision}")}${field("Evidence snapshot", "{EVS-000}")}${field("Policy / permission", "{version · subject · scope}")}</div>
        <ul class="gx-checks">
          ${step("Evidence coverage", blocked ? "Failed" : passed ? "Passed" : "Pending")}
          ${step("Narrative / Result consistency", passed ? "Passed" : "Pending")}
          ${step("Freshness", state === "Invalidated" ? "Invalidated" : passed ? "Passed" : "Pending")}
          ${step("Permission and audience", passed ? "Passed" : "Pending")}
        </ul>
        <div class="gx-gate-result ${blocked ? "blocking" : ""}">
          ${badge("Publication Gate", state, passed ? "success" : blocked ? "warning" : "workflow")}
          <p>${passed ? "Checks passed. Artifact remains unpublished until the separate Publish action." : blocked ? "Publish is blocked. Existing Draft remains available." : "Run checks against the current immutable snapshot."}</p>
        </div>
        <div class="gx-actions"><button type="button">${state === "Not Run" ? "Run gate" : "Re-run gate"}</button><button type="button" ${passed ? "" : "disabled"}>Publish revision</button></div>
      </section>
    `,
    "Evidence、Policy或Permission版本变化使旧Gate失效；重新校验必须绑定新的Snapshot，Passed不等于Published。",
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
          ${field("Action / target", "{Named external change · target ID}")}
          ${field("Actor", "{Human / service identity}")}
          ${field("Parameters", "{Exact bounded payload}")}
          ${field("Impact / risk", "{Affected records · reversibility}", "warning")}
        </div>
        <div class="gx-axis-row">
          ${badge("Permission", "Conditional", "permission")}
          ${badge("Autonomy", "Approval Required", "autonomy")}
          ${badge("Risk", "Reversible", "warning")}
        </div>
        <ol class="gx-action-lanes">
          ${step("Prepare", ["Proposed", "Preflight Ready"].includes(state) ? state : "Complete")}
          ${step("Approve", state === "Awaiting Approval" ? state : approved ? "Approved" : "Pending")}
          ${step("Execute", state === "Executing" ? "Executing" : state === "Queued" ? "Queued" : terminal ? state : "Not started")}
          ${step("Business outcome", terminal ? "Pending observation" : "Not applicable yet", "separate linked record")}
        </ol>
        <div class="gx-actions">
          <button type="button" ${state !== "Awaiting Approval" ? "disabled" : ""}>Approve</button>
          <button type="button" ${executable ? "" : "disabled"}>Execute approved action</button>
          <button type="button">Cancel safely</button>
        </div>
        <p class="gx-separation">Approval records authority. Execution changes external state. Action state records execution; Business Outcome is observed separately.</p>
      </section>
    `,
    "Denied不得Queued；执行前原子重验Permission、Policy与Target；失败保留原Action。需要补偿时创建引用原Action的新Action。",
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
          <article><span>EXPECTED BUSINESS CONDITION</span><strong>${placeholder("Expected measurable postcondition and observation window")}</strong></article>
          <article><span>OBSERVED IN SYSTEM OF RECORD</span><strong>${observed ? placeholder("Observed value / condition") : "Not observed yet · review scheduled"}</strong></article>
        </div>
        <div class="gx-axis-row">
          ${badge("Observation", state, observed ? "evidence" : "warning")}
          ${badge("Effect", effect, effect === "Improved" ? "success" : "warning")}
          ${badge("Evidence", observed ? "System record" : "Pending", "evidence")}
        </div>
        ${invalidEffect ? '<p class="gx-separation">Effect remains an independent field, but it cannot be asserted until an observation exists.</p>' : ""}
        <div class="gx-handoff-link">
          <span>OUTCOME RECEIPT</span>
          ${field("Linked action / case", "{ACT-000 / CASE-000 · immutable revision}")}
          ${field("System of record", "{Source system · query / event ID}")}
          ${field("Observation window", "{Start · due · actual observed at}")}
          ${field("Next review", observed ? "{Monitor / close / investigate}" : "{Owner · due timestamp}")}
        </div>
        <div class="gx-actions"><button type="button">Open system record</button><button type="button">Open linked action</button></div>
      </section>
    `,
    "Action显示Succeeded也不得自动显示业务改善。无可观察的System of Record时保持Inconclusive，并说明缺少什么和何时复核。",
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
            <span>CAPABILITY SNAPSHOT</span>
            <h5>${placeholder("Execution service / agent identity")}</h5>
            <small>DECLARATION · NOT AUTHORIZATION</small>
          </div>
          ${field("Owner / version", "{Named owner} · v{n}")}
        </header>
        <div class="gx-axis-row">
          ${badge("Permission", permission, permission === "Denied" ? "warning" : "permission")}
          ${badge("Autonomy", "Declared per action", "autonomy")}
          ${badge("Risk", "Evaluated per target", "warning")}
          ${badge("Validation", state, blocked ? "warning" : "success")}
        </div>
        <div class="gx-capability-grid">
          <article>
            <span>SCOPE</span>
            <strong>${state === "Scope Missing" ? "Missing · Action Gate blocked" : "{Bounded domain · objects · operations}"}</strong>
            <p>{No silent expansion or clipping}</p>
          </article>
          <article>
            <span>RECEIPT & ESCALATION</span>
            <strong>{Rule / snapshot / actor / approver / postcondition}</strong>
            <p>{Failure owner · response target · Trace ID}</p>
          </article>
        </div>
        <div class="gx-capability-actions" role="table" aria-label="Declared action capabilities">
          <div role="row"><span role="columnheader">Action</span><span role="columnheader">Autonomy</span><span role="columnheader">Reversibility</span><span role="columnheader">UI obligation</span></div>
          <div role="row"><b role="cell">{Read / inspect}</b><span role="cell">Execute Within Policy</span><span role="cell">No external change</span><span role="cell">Show scope + source</span></div>
          <div role="row"><b role="cell">{Prepare change}</b><span role="cell">Prepare</span><span role="cell">Reversible</span><span role="cell">Preview + receipt schema</span></div>
          <div role="row"><b role="cell">{High-impact action}</b><span role="cell">Approval Required</span><span role="cell">Compensatable / irreversible</span><span role="cell">Preflight + explicit authorization</span></div>
        </div>
        <div class="gx-gate-result ${blocked ? "blocking" : ""}">
          ${blocked ? "Capability Snapshot不能支持当前Action；不渲染Execute控制。" : "Snapshot完整；Action仍需独立检查Target、Policy、Permission与Risk。"}
        </div>
      </section>
    `,
    "Capability Snapshot不是授权本身。缺Scope、Version过期、Permission漂移或服务Suspended时，保留Proposal并路由到明确Owner。",
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
          <span>WORK TRANSFER · LINKED OBJECTS</span>
          <h5>${placeholder("Specific decision or work requested from the receiving owner")}</h5>
          ${field("From", "{Source object · immutable revision}")}
          ${field("To", "{Target object type · proposed owner}")}
          ${field("Root & Trace", "{ROOT-000 · TRACE-000}")}
          ${field("Authority / deadline", "{Allowed decision · due timestamp}", blocked ? "warning" : "")}
        </div>
        <div class="gx-recovery-columns">
          <section><span>WORK COMPLETED</span>${step("{Verified result}", "Retained")}${step("{Evidence snapshot}", "Retained")}</section>
          <section><span>WORK PENDING</span>${step("{Requested decision}", accepted ? "Accepted" : state)}${step("{Missing input}", blocked ? "Required" : "Known")}</section>
        </div>
        <div class="gx-axis-row">
          ${badge("Permission", state === "Expired" ? "Revalidate" : "Conditional", "permission")}
          ${badge("Handoff", state, ready ? "success" : blocked ? "warning" : "workflow")}
        </div>
        <div class="gx-actions">
          <button type="button" data-guidance-next-state="Ready" ${state !== "Prepared" ? "disabled" : ""}>Validate envelope</button>
          <button type="button" data-guidance-next-state="Accepted" ${state !== "Ready" ? "disabled" : ""}>Accept ownership</button>
          <button type="button" data-guidance-next-state="Returned" ${accepted ? "disabled" : ""}>Return with reason</button>
        </div>
      </section>
    `,
    "缺Trace、Requested Decision或授权范围时不得Ready。Return必须说明缺失字段；Accept前来源Owner不变，Accept后仍保留来源Revision。",
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
          <header><span>WORK RESULT · RSLT-000 · r1</span>${badge("Claim", "Fact / Calculation", "claim")}</header>
          <h5>${placeholder("Direct answer, calculated value or generated analysis result")}</h5>
          <p>${placeholder("Scope · period · freshness · limitation")}</p>
          <div class="gx-axis-row">${badge("Evidence", "Verified", "evidence")}${badge("Result", "Delivered", "success")}</div>
          <div class="gx-actions"><button type="button">Open evidence</button><button type="button">Copy result reference</button></div>
        </article>
        <article class="gx-resolution-card ${unobserved ? "warning" : ""}">
          <span>GOAL RESOLUTION ASSESSMENT · GRES-000</span>
          <h5>${escapeHtml(state)}</h5>
          <div class="gx-axis-row">${badge("Assessment", state, resolved ? "success" : "warning")}${badge("Observation", observationBasis, unobserved ? "warning" : "evidence")}</div>
          ${field("Goal criteria", "{What the user asked this task to establish}")}
          ${field("Observation basis", unobserved ? "User left / no confirmation · do not infer success" : observationBasis)}
          ${field("Assessment revision", "{Goal revision · Result revision · timestamp}")}
          <p>${unobserved ? "Result was delivered; Goal completion remains unobserved." : resolved ? "This task may legally end here. No Artifact, Decision or Action is required." : "Keep the Result stable and offer a bounded next step."}</p>
          ${resolved && unobserved ? '<p class="gx-separation">The fields remain independent; this combination requires review before the task can be declared resolved.</p>' : ""}
        </article>
        <div class="gx-actions gx-result-options">
          <button type="button" data-guidance-next-state="Resolved" data-guidance-next-axis="assessment">Mark assessment resolved</button>
          <button type="button">Continue analysis</button>
          <button type="button">Package as Artifact</button>
        </div>
      </section>
    `,
    "Result交付不自动等于Goal完成；用户离开记录Unobserved。需要继续时创建可选Plan、Artifact、Decision或Action，不回写原Result。",
  );
}

function p01(pattern, state) {
  return guidanceFrame(
    pattern,
    state,
    `
      <section class="gx-console">
        <div class="gx-console-summary">
          ${field("Queue universe", "{All cases · denominator visible}")}
          ${field("Healthy", "{Count / rate}", "success")}
          ${field("Attention", "{Unknown + exceptions}", state === "Attention" ? "warning" : "")}
          ${field("SLA at risk", "{Count · oldest age}", state === "Degraded" ? "warning" : "")}
        </div>
        <div class="gx-console-layout">
          <div class="gx-case-list" role="list">
            <button type="button" role="listitem"><span>Unknown</span><strong>{Case ID}</strong><small>{Why classified as unknown}</small></button>
            <button type="button" role="listitem"><span>Failed</span><strong>{Case ID}</strong><small>{Failure · owner · recovery debt}</small></button>
            <button type="button" role="listitem"><span>Approval</span><strong>{Case ID}</strong><small>{Decision requested · deadline}</small></button>
          </div>
          <aside class="gx-case-inspector">
            <span>SELECTED EXCEPTION</span>
            ${field("Current state", state)}
            ${field("Last verified step", "{Step / timestamp}")}
            ${field("Owner", "{Case owner}")}
            ${field("Recovery", "{Retry / compensate / takeover}")}
            <div class="gx-actions"><button type="button">Take over</button><button type="button">Pause case</button></div>
          </aside>
        </div>
      </section>
    `,
    "系统降级时先暴露Unknown与分母；Pause保留队列状态；Takeover携带最后验证节点与完整Audit。",
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
        <div class="gx-rule-source">${field("Source decision", "{Decision ID · evidence snapshot}")}${field("Owner / scope", "{Named owner · future case scope}")}</div>
        <ol class="gx-rule-lifecycle" data-semantic-flow="guidance-rule-change" aria-label="Rule Change主路径">
          ${step("Candidate", "Complete", "derived from one human decision")}
          ${step("Replay test", ["Validated", "Approved", "Staged", "Active"].includes(state) ? "Passed" : "Pending")}
          ${step("Conflict + SoD", approved ? "Passed" : "Pending")}
          ${step("Approval", approved ? "Approved" : "Not approved")}
          ${step("Staging", ["Staged", "Active"].includes(state) ? "Complete" : "Not started")}
          ${step("Activation", active ? "Active" : "Not active")}
        </ol>
        <div class="gx-rule-impact">
          ${badge("Rule state", state, active ? "success" : "workflow")}
          <p>${active ? "Affects future eligible cases only; monitoring and rollback remain visible." : "Simulation only. Current and historical cases remain unchanged."}</p>
        </div>
        <div class="gx-actions"><button type="button" ${state !== "Validated" ? "disabled" : ""}>Approve proposal</button><button type="button" ${state !== "Staged" ? "disabled" : ""}>Activate staged rule</button><button type="button">Suspend / rollback</button></div>
      </section>
    `,
    "Reject/Suspend不得留下Active视觉或派生KPI；Rollback产生新事件并保留原Rule Revision与受影响Case范围。",
  );
}

function p03(pattern, state) {
  return guidanceFrame(
    pattern,
    state,
    `
      <section class="gx-recovery-workspace">
        <aside class="gx-failure-banner">
          <span>ORIGINAL FAILURE · IMMUTABLE</span>
          <strong>${placeholder("Failed action / step and business impact")}</strong>
          <p>{Detected timestamp · Action ID · affected scope}</p>
        </aside>
        <div class="gx-recovery-columns">
          <section><span>WORK COMPLETED</span>${step("{Verified step A}", "Retained")}${step("{Succeeded action B}", "Retained")}</section>
          <section><span>WORK PENDING</span>${step("{Failed step C}", state)}${step("{Dependent step D}", "Blocked")}</section>
        </div>
        <div class="gx-recovery-options">
          <button type="button"><b>Retry</b><span>{Precondition and effect}</span></button>
          <button type="button"><b>Compensate</b><span>{Reverse original Action ID}</span></button>
          <button type="button"><b>Human takeover</b><span>{Owner · context snapshot}</span></button>
        </div>
        ${field("Audit trail", "{Failure → containment → recovery event → postcondition}")}
      </section>
    `,
    "Recovery永不删除Failure或已验证工作；Compensation是独立Action；Takeover保留Completed/Pending边界。",
  );
}

function c01(pattern, state) {
  return guidanceFrame(
    pattern,
    state,
    `
      <section class="gx-mission">
        <div class="gx-mission-goal"><span>MISSION GOAL</span><h5>${placeholder("Outcome-oriented mission goal")}</h5><p>{Scope · owner · revision · branch}</p></div>
        <div class="gx-mission-layout">
          <aside>
            <span>PLAN</span>
            ${step("Frame the question", "Verified")}
            ${step("Produce stable artifact", state)}
            ${step("Review / publish", "Conditional")}
          </aside>
          <main>
            <span>ARTIFACT CANVAS</span>
            <article><strong>{Stable artifact block}</strong><p>{Result / draft / decision material}</p></article>
            <article><strong>{Working block}</strong><p>{AI contribution with source and state}</p></article>
          </main>
          <aside>
            <span>CONTEXT & EVIDENCE</span>
            ${field("Context", "{Snapshot ID}")}
            ${field("Evidence", "{Receipt IDs}")}
            ${field("Revision", state === "Branched" ? "{r4 → branch b1}" : "{r4}")}
          </aside>
        </div>
        <div class="gx-actions"><button type="button">Ask within mission</button><button type="button">Create branch</button><button type="button">Prepare publication</button></div>
      </section>
    `,
    "追问与AI工作失败不得覆盖Published Artifact；Context丢失时停在Framing并恢复Snapshot或请求确认。",
  );
}

function c02(pattern, state) {
  const partial = state === "Partial";
  return guidanceFrame(
    pattern,
    state,
    `
      <section class="gx-analysis-doc">
        <div class="gx-intent-ribbon"><span>INTENT</span>${placeholder("Metric")}${placeholder("Breakdown")}${placeholder("Period")}${placeholder("Compare")}${placeholder("Method")}</div>
        <div class="gx-analysis-layout">
          <main>
            <article class="gx-result-block verified">
              <header><span>RESULT BLOCK · VERIFIED</span>${badge("Claim", "Fact", "claim")}</header>
              <div class="gx-chart-placeholder">DETERMINISTIC VISUAL<br><small>{ChartSpec from Result object}</small></div>
              <p>${placeholder("Narrative references the exact Result object")}</p>
              <a href="#/guidance/shared/S04">Evidence receipt →</a>
            </article>
            <article class="gx-result-block ${partial ? "partial" : ""}">
              <header><span>ADVANCED BLOCK · ${partial ? "PARTIAL" : "CONDITIONAL"}</span>${badge("Evidence", partial ? "Insufficient" : "Pending", "warning")}</header>
              <p>${partial ? "Advanced method stopped: {missing required input}. Verified base result remains above." : placeholder("Method requirement and planned output")}</p>
            </article>
          </main>
          <aside>
            <span>SUPPORTING DATA / LIMITATIONS</span>
            ${field("Scope", "{period · filters · unit}")}
            ${field("Freshness", "{timestamp}")}
            ${field("Limitation", "{what cannot be concluded}")}
            ${field("Gate", state === "Validated" ? "Passed · not yet Published" : "{status}")}
          </aside>
        </div>
      </section>
    `,
    "相关性不得写成因果；数据不足时降级为描述性分析；Partial保留所有Verified Result与Evidence。",
  );
}

function c03(pattern, state) {
  return guidanceFrame(
    pattern,
    state,
    `
      <section class="gx-brief">
        <main>
          <header><span>AUDIENCE BRIEF · SAME ARTIFACT REVISION</span><h5>${placeholder("Decision-oriented headline")}</h5><p>{Scope · freshness · owner}</p></header>
          <ol class="gx-story-flow" data-flow-contract="story-outline">
            <li><b>What changed</b><span>{Verified claim and key number}</span></li>
            <li><b>Where</b><span>{Ranked or segmented concentration}</span></li>
            <li><b>Why / limitation</b><span>{Evidence-backed driver or explicit insufficiency}</span></li>
            <li><b>Implication</b><span>{Decision relevance, not fabricated action}</span></li>
          </ol>
          <div class="gx-axis-row">${badge("Publication", state, state === "Published" ? "success" : "workflow")}${badge("Evidence", "Verified snapshot", "evidence")}</div>
        </main>
        <aside>
          <span>REVISION HISTORY</span>
          ${step("r2", "Superseded", "{timestamp}")}
          ${step("r3", state === "Published" ? "Published" : "Validated", "{timestamp}")}
          ${state === "Branched" ? step("r3-b1", "Branched", "Question Pin") : ""}
          <button type="button">Why?</button>
          <button type="button">Create Question Pin</button>
          <button type="button">Open Evidence</button>
        </aside>
      </section>
    `,
    "Brief只改变信息密度，不复制事实；Question Pin创建携带focus与revision的Branch，不修改Published Revision。",
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
      ? "CONTRACT SIMULATION"
      : pattern.evidenceLevel === "Interactive State Specimen"
        ? "INTERACTIVE STATE SPECIMEN"
        : "STATIC ANATOMY REFERENCE";
  return `
    <section class="guidance-live-specimen ${pattern.evidenceLevel === "Static Anatomy Reference" ? "is-static-reference" : ""}" aria-label="${escapeHtml(`${pattern.name} reference specimen`)}">
      <header class="guidance-specimen-heading">
        <div><span>${escapeHtml(specimenLabel)} · ${escapeHtml(pattern.id)}</span><h4>固定区域、独立状态与恢复路径</h4></div>
        <p>${escapeHtml(pattern.maturity)} · 真实业务内容使用 <code>{placeholder}</code></p>
      </header>
      ${
        pattern.evidenceLevel === "Static Anatomy Reference"
          ? `<div class="guidance-static-state"><span>REFERENCE SNAPSHOT</span><strong>${axes.map((axis) => `${escapeHtml(axis.label)} · ${escapeHtml(states[axis.id])}`).join(" / ")}</strong><p>其他状态已在规格中定义；本页尚未声称其行为可交互验证。</p></div>`
          : `<div class="guidance-state-axes">
              ${axes
                .map(
                  (axis) => `
                    <section class="guidance-state-axis">
                      <span>${escapeHtml(axis.label)}</span>
                      <div class="guidance-state-controls" role="group" aria-label="${escapeHtml(`${pattern.name} ${axis.label} options`)}">
                        ${axis.values
                          .map(
                            (item) =>
                              `<button type="button" data-guidance-axis="${escapeHtml(axis.id)}" data-guidance-state="${escapeHtml(item)}" aria-pressed="${String(item === states[axis.id])}">${escapeHtml(item)}</button>`,
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
