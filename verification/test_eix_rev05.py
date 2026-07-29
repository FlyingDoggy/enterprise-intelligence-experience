"""Deterministic browser verification for EIX 2.0 Rev 0.5."""

from __future__ import annotations

import os
from pathlib import Path
import re

from playwright.sync_api import expect, sync_playwright
from test_contract_visualization import (
    test_axis_independence_and_keyboard,
    test_component_contract_matrix,
    test_contract_responsive,
    test_guidance_visualization,
    test_primitive_visualization,
)


BASE_URL = os.environ.get("EIX_BASE_URL", "http://127.0.0.1:4190").rstrip("/")
CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUTPUT_DIR = Path(__file__).parent / "rev-0.5"
SPECIMEN_OUTPUT_DIR = OUTPUT_DIR / "specimens"
ROUTES = ["brief", "architecture", "design-system", "guidance", "journeys", "acceptance"]
FIXED_WIDTH_LAYOUT_SELECTORS = [
    ".global-nav",
    ".view-toggle",
    ".section-nav a",
    ".suite-map a",
    ".kernel-tabs button",
    ".ds-status-stamp",
    ".ds-overview-link",
    ".ds-nav-group a",
    ".pattern-list button",
    '[role="tablist"] > button',
    ".lifecycle-tabs button",
    ".contract-tabs button",
    ".journey-tabs button",
    ".ds-sequence-nav a",
]
RESPONSE_STYLE_HEADING_PATTERNS = [
    re.compile(r"不是.{0,80}而是", re.DOTALL),
    re.compile(r"而不是"),
    re.compile(r"不再"),
    re.compile(r"只是"),
    re.compile(r"为什么"),
    re.compile(r"哪些决定"),
]
RETIRED_VISIBLE_TERMS = [
    "Artifact",
    "Business Outcome",
    "Work Result",
    "Goal Resolution",
    "Evidence",
    "Permission",
    "Autonomy",
    "Workflow State",
    "Human Handoff",
    "Design System",
    "UX Guidance",
    "Shared Experience Kernel",
    "Contract",
    "Pattern",
    "Specimen",
    "Foundation",
    "Primitive",
    "Component",
    "Gate",
    "Receipt",
    "Handoff",
    "Revision",
    "Version",
]


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def assert_mock_browser_radius(page, scope: str, label: str) -> None:
    frames = page.locator(f"{scope} .mock-browser-frame")
    require(frames.count() > 0, f"{label} has no mock-browser frame")
    expected = page.evaluate(
        "() => getComputedStyle(document.documentElement).getPropertyValue('--foundation-radius-overlay').trim()"
    )
    actual = frames.evaluate_all(
        "(items) => items.map((item) => getComputedStyle(item).borderTopLeftRadius)"
    )
    require(
        all(value == expected for value in actual),
        f"{label} does not use the maximum allowed radius {expected}: {actual}",
    )


def assert_no_overflow(page, label: str) -> None:
    dimensions = page.evaluate(
        """() => ({
          viewport: innerWidth,
          document: document.documentElement.scrollWidth,
          body: document.body.scrollWidth
        })"""
    )
    require(
        dimensions["document"] <= dimensions["viewport"] + 1
        and dimensions["body"] <= dimensions["viewport"] + 1,
        f"{label} horizontal overflow: {dimensions}",
    )


def assert_fixed_width_layouts(page, label: str) -> None:
    issues = page.evaluate(
        """(selectors) => {
          const visible = (element) => {
            const style = getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            return style.display !== "none"
              && style.visibility !== "hidden"
              && rect.width > 0
              && rect.height > 0;
          };
          const issues = [];
          const seen = new Set();
          for (const selector of selectors) {
            document.querySelectorAll(selector).forEach((element, index) => {
              if (seen.has(element) || !visible(element)) return;
              seen.add(element);
              const bounds = element.getBoundingClientRect();
              const style = getComputedStyle(element);
              const children = [...element.children]
                .filter(visible)
                .map((child) => ({ child, bounds: child.getBoundingClientRect() }));
              const outside = children.filter(({ bounds: child }) =>
                child.left < bounds.left - 1
                || child.right > bounds.right + 1
                || child.top < bounds.top - 1
                || child.bottom > bounds.bottom + 1
              );
              const overlaps = [];
              for (let first = 0; first < children.length; first += 1) {
                for (let second = first + 1; second < children.length; second += 1) {
                  const a = children[first].bounds;
                  const b = children[second].bounds;
                  const overlapWidth = Math.min(a.right, b.right) - Math.max(a.left, b.left);
                  const overlapHeight = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
                  if (overlapWidth > 2 && overlapHeight > 2) {
                    overlaps.push([
                      children[first].child.textContent.trim(),
                      children[second].child.textContent.trim(),
                    ]);
                  }
                }
              }
              const clippedX = element.scrollWidth > element.clientWidth + 2
                && style.overflowX !== "visible";
              const clippedY = element.scrollHeight > element.clientHeight + 2
                && style.overflowY !== "visible";
              if (outside.length || overlaps.length || clippedX || clippedY) {
                issues.push({
                  selector,
                  index,
                  text: element.textContent.trim().replace(/\\s+/g, " ").slice(0, 100),
                  outside: outside.map(({ child }) =>
                    child.textContent.trim().replace(/\\s+/g, " ").slice(0, 50)
                  ),
                  overlaps,
                  clippedX,
                  clippedY,
                });
              }
            });
          }
          return issues;
        }""",
        FIXED_WIDTH_LAYOUT_SELECTORS,
    )
    require(not issues, f"{label} fixed-width text layout regression: {issues}")


def assert_primary_prose_localized(page, route: str) -> None:
    visible_text = page.locator(f'[data-route-view="{route}"]').inner_text()
    residual = [term for term in RETIRED_VISIBLE_TERMS if term in visible_text]
    require(not residual, f"{route}仍显示已替换的英文术语：{residual}")


def test_routes_and_viewports(browser) -> None:
    for width, height in [(1440, 900), (1280, 900), (1024, 900), (390, 844)]:
        page = browser.new_page(viewport={"width": width, "height": height}, reduced_motion="reduce")
        for route in ROUTES:
            page.goto(f"{BASE_URL}/#/{route}", wait_until="networkidle")
            expect(page.locator(f'[data-route-view="{route}"]')).to_be_visible()
            deep = page.locator('[data-density-option="deep"]')
            if (
                deep.count()
                and deep.first.is_visible()
                and deep.first.get_attribute("aria-pressed") != "true"
            ):
                deep.first.click()
            assert_no_overflow(page, f"{route}@{width}")
            assert_fixed_width_layouts(page, f"{route}@{width}")
            if width == 1440:
                assert_primary_prose_localized(page, route)
            if route == "brief":
                poc_link = page.locator('[data-application-proof="chatbi-v3"]')
                expect(poc_link).to_be_visible()
                expect(poc_link).to_have_attribute("href", "/eix-pocs/#/collaborative-v3")
            if width == 390 and route in {"architecture", "guidance", "journeys"}:
                visible_flows = page.locator(
                    f'[data-route-view="{route}"] [data-semantic-flow]:visible'
                )
                for index in range(visible_flows.count()):
                    main_path = visible_flows.nth(index).locator(".semantic-flow-main").first
                    if main_path.count() == 0:
                        continue
                    direction = main_path.evaluate(
                        "(element) => getComputedStyle(element).flexDirection"
                    )
                    require(
                        direction == "column",
                        f"{route} flow {index} does not degrade to a vertical mobile path",
                    )
            if route == "design-system":
                expect(page.locator(".rail-legend")).to_be_hidden()
        page.close()

    page = browser.new_page(viewport={"width": 390, "height": 844}, reduced_motion="reduce")
    page.goto(f"{BASE_URL}/#/guidance/process/P02", wait_until="networkidle")
    page.locator("#menuButton").click()
    expect(page.locator(".mobile-route-nav")).to_be_visible()
    expect(page.locator(".mobile-route-nav a")).to_have_count(6)
    expect(page.locator('.mobile-route-nav [data-route-link="guidance"]')).to_have_attribute(
        "aria-current", "page"
    )
    page.locator('.mobile-route-nav [data-route-link="architecture"]').click()
    expect(page.locator('[data-route-view="architecture"]')).to_be_visible()
    expect(page.locator("#sidebar")).not_to_have_class(re.compile(r"\bopen\b"))
    page.goto(f"{BASE_URL}/#/guidance/process/P02", wait_until="networkidle")
    rule_flow = page.locator('[data-semantic-flow="guidance-rule-change"]')
    expect(rule_flow).to_be_visible()
    require(
        rule_flow.evaluate("(element) => getComputedStyle(element).flexDirection === 'column'"),
        "Rule Change specimen does not degrade to a vertical mobile path",
    )
    assert_no_overflow(page, "guidance/process/P02@390")
    page.close()


def test_headings_transmit_information(page) -> None:
    routes = [f"#/{route}" for route in ROUTES]

    page.goto(f"{BASE_URL}/#/design-system", wait_until="networkidle")
    routes.extend(
        page.locator('a[href*="#/design-system/"]').evaluate_all(
            "(links) => links.map((link) => new URL(link.href).hash)"
        )
    )
    page.goto(f"{BASE_URL}/#/guidance", wait_until="networkidle")
    routes.extend(
        page.locator('a[href*="#/guidance/"]').evaluate_all(
            "(links) => links.map((link) => new URL(link.href).hash)"
        )
    )

    for route in dict.fromkeys(routes):
        page.evaluate("(nextRoute) => { window.location.hash = nextRoute; }", route)
        page.wait_for_function("(nextRoute) => window.location.hash === nextRoute", arg=route)
        page.wait_for_timeout(50)
        headings = page.locator("h1:visible, h2:visible").all_inner_texts()
        for heading in headings:
            normalized = " ".join(heading.split())
            for pattern in RESPONSE_STYLE_HEADING_PATTERNS:
                require(
                    pattern.search(normalized) is None,
                    f"{route} uses a response-style heading: {normalized}",
                )

    page.evaluate("() => { window.location.hash = '#/architecture'; }")
    page.wait_for_function("() => window.location.hash === '#/architecture'")
    page.wait_for_timeout(50)
    kernel_heading = " ".join(page.locator("#architecture-kernel h2").inner_text().split())
    require(
        kernel_heading.replace(" ", "") == "共享工作模型按任务组合目标、依据、结果与控制记录。",
        f"Kernel heading does not state its information directly: {kernel_heading}",
    )
    page.reload(wait_until="domcontentloaded")


def test_site_frame_contract(page) -> None:
    page.set_viewport_size({"width": 2048, "height": 1100})
    frame_widths: dict[str, float] = {}
    title_sizes: dict[str, float] = {}
    for route in ROUTES:
        page.goto(f"{BASE_URL}/#/{route}", wait_until="networkidle")
        title_sizes[route] = float(
            page.locator(f'[data-route-view="{route}"] h1').first.evaluate(
                "(element) => parseFloat(getComputedStyle(element).fontSize)"
            )
        )
        if route == "design-system":
            frame_widths[route] = round(page.locator(".ds-reference-shell").bounding_box()["width"], 1)
            expect(page.locator(".ds-inspector-heading")).to_contain_text("页面内辅助栏")
            expect(page.locator(".ds-inspector-heading")).to_contain_text("当前条目说明")
        else:
            sidebar = page.locator(".sidebar").bounding_box()
            rail = page.locator(".context-rail").bounding_box()
            frame_widths[route] = round(rail["x"] + rail["width"] - sidebar["x"], 1)
            expect(page.locator("#railView")).to_be_visible()
            expect(page.locator("#railReading")).to_be_visible()
            expect(page.locator("#railNext")).to_be_visible()

    require(
        max(frame_widths.values()) - min(frame_widths.values()) <= 1,
        f"Primary routes do not share the Guidance frame width: {frame_widths}",
    )
    require(
        max(title_sizes.values()) - min(title_sizes.values()) <= 0.5,
        f"Primary page titles do not share one type role: {title_sizes}",
    )
    page.set_viewport_size({"width": 1440, "height": 900})


def test_kernel_projection(page) -> None:
    page.goto(f"{BASE_URL}/#/architecture", wait_until="networkidle")
    expect(page.locator(".revision-badge")).to_contain_text("修订0.5")
    require(page.locator(".kernel-trace").count() == 0, "Global step-style Kernel Trace still exists")
    expect(page.locator("[data-projection-id]")).to_have_count(5)
    expect(page.locator(".relationship-node")).to_have_count(11)
    expect(page.locator('[data-kernel-record="decision"]')).to_contain_text("不适用")
    expect(page.locator('[data-kernel-record="result"]')).to_contain_text("必需")
    expect(page.locator("#taskProjectionPanel")).to_contain_text("无需创建交付物、决策或业务操作")
    expect(page.locator("#conformancePathPanel")).to_contain_text("Collaborative Intelligence")
    expect(page.locator("#conformancePathPanel a")).to_have_count(12)
    expect(page.locator('#conformancePathPanel a[href^="#/guidance/"]')).to_have_count(3)
    expect(page.locator('#conformancePathPanel a[href^="#/design-system/"]')).to_have_count(4)
    expect(page.locator('#conformancePathPanel a[href^="#/acceptance?focus="]')).to_have_count(5)

    page.locator('[data-projection-id="controlled-action"]').click()
    expect(page.locator('[data-kernel-record="action"]')).to_contain_text("必需")
    expect(page.locator('[data-kernel-record="business-outcome"]')).to_contain_text("关联")
    expect(page.locator("#taskProjectionPanel")).to_contain_text("业务成效作为关联记录")

    expect(page.locator("#kernelDistinctions article")).to_have_count(4)
    distinctions = page.locator("#kernelDistinctions").inner_text()
    for label in ["工作结果", "交付物", "目标完成判断", "业务成效"]:
        require(label in distinctions, f"Missing Kernel distinction: {label}")

    expect(page.locator("#objectLineageMap .lineage-node")).to_have_count(7)
    page.locator('[data-lineage-id="business-outcome"]').click()
    expect(page.locator("#objectLineageInspector")).to_contain_text("独立观察记录")


def test_architecture_navigation_map(page) -> None:
    page.goto(f"{BASE_URL}/#/architecture", wait_until="networkidle")
    page.locator('[data-density-option="brief"]').click()
    expect(page.locator("#architecture-kernel")).to_be_hidden()
    expect(page.locator(".architecture-brief-action")).to_be_visible()
    expect(page.locator("#sectionNav .section-nav-group")).to_have_count(4)
    expect(page.locator('#sectionNav [data-nav-group="layers"] a')).to_have_count(5)
    expect(page.locator('#sectionNav [data-nav-group="cross-layer"] a')).to_have_count(3)
    expect(page.locator("#architectureLayers .layer-row")).to_have_count(5)
    expect(page.locator("#architectureCrossLinks button")).to_have_count(3)

    for layer in ["L1", "L2", "L3", "L4", "L5"]:
        layer_button = page.locator(f'#architectureLayers [data-architecture-layer="{layer}"]')
        target_id = layer_button.get_attribute("data-architecture-target")
        require(target_id is not None, f"{layer} has no detail target")
        expect(page.locator(f"#{target_id}")).to_have_attribute("data-architecture-layer", layer)
        expect(page.locator(f'#sectionNav [data-section-link="{target_id}"]')).to_be_visible()

    page.locator('#architectureLayers [data-architecture-layer="L4"]').click()
    expect(page.locator('[data-density-option="deep"]')).to_have_attribute("aria-pressed", "true")
    expect(page.locator("#architecture-surfaces")).to_be_visible()
    expect(page.locator('#architectureLayers [data-architecture-layer="L4"]')).to_have_attribute(
        "aria-current", "location"
    )
    expect(page.locator('#sectionNav [data-section-link="architecture-surfaces"]')).to_have_attribute(
        "aria-current", "location"
    )
    surface_y = page.locator("#architecture-surfaces").bounding_box()["y"]
    require(48 <= surface_y <= 220, f"L4 detail did not align within the readable top band: {surface_y}")

    page.locator('#sectionNav [data-section-link="architecture-semantics"]').click()
    expect(page.locator('#architectureCrossLinks [data-architecture-target="architecture-semantics"]')).to_have_attribute(
        "aria-current", "location"
    )
    require(
        page.locator('#architectureLayers [aria-current="location"]').count() == 0,
        "Cross-layer navigation incorrectly presents one architecture layer as active",
    )

    page.locator('#sectionNav [data-section-link="architecture-families"]').click()
    expect(
        page.locator('#architectureLayers [data-architecture-layer="L4"]')
    ).to_have_class(
        re.compile(r"\bis-related\b"),
    )


def test_axis_independence(page) -> None:
    page.goto(f"{BASE_URL}/#/architecture", wait_until="networkidle")
    expect(page.locator(".semantic-question-card")).to_have_count(3)
    expect(page.locator(".semantic-question-card li")).to_have_count(7)
    questions = page.locator("#architecture-semantics").inner_text()
    for expected in ["这个结论能信到什么程度", "这件事能不能做，谁来做", "工作现在走到哪一步"]:
        require(expected in questions, f"Missing plain-language decision question: {expected}")
    for retired in ["认识论", "正交", "七个轴", "语义轴"]:
        require(retired not in questions, f"Retired architecture wording is still visible: {retired}")
    expect(page.locator("#railView")).to_have_text("系统需要保存哪些工作信息？")
    expect(page.locator("#railReading")).to_be_visible()
    expect(page.locator("#railNext")).to_have_attribute("href", "#/guidance")
    expect(page.locator(".rail-legend")).to_have_count(0)

    expect(page.locator('[data-axis-lab="evidence"]')).to_have_value("Insufficient")
    expect(page.locator('[data-axis-lab="permission"]')).to_have_value("Conditional")
    expect(page.locator('[data-axis-lab="autonomy"]')).to_have_value("Approval Required")
    expect(page.locator('[data-axis-lab="workflow"]')).to_have_value("Approved")
    expect(page.locator(".axis-gate-summary > strong")).to_have_text("仍不可执行")
    expect(page.locator("#axisLabResult")).to_contain_text("审批记录存在")

    page.locator('[data-axis-lab="evidence"]').select_option("Verified")
    expect(page.locator('[data-axis-lab="permission"]')).to_have_value("Conditional")
    expect(page.locator(".axis-gate-summary > strong")).to_have_text("仍不可执行")
    page.locator('[data-axis-lab="permission"]').select_option("Allowed")
    expect(page.locator('[data-axis-lab="evidence"]')).to_have_value("Verified")
    expect(page.locator('[data-axis-lab="autonomy"]')).to_have_value("Approval Required")
    expect(page.locator('[data-axis-lab="workflow"]')).to_have_value("Approved")
    expect(page.locator(".axis-gate-summary > strong")).to_have_text("可以进入执行队列")

    page.locator('[data-axis-lab="workflow"]').select_option("Queued")
    expect(page.locator(".axis-gate-summary > strong")).to_have_text("已进入执行队列")
    page.locator('[data-axis-lab="permission"]').select_option("Denied")
    expect(page.locator('[data-axis-lab="workflow"]')).to_have_value("Queued")
    expect(page.locator(".axis-gate-summary > strong")).to_have_text("暂停并重新校验")


def test_lifecycles(page) -> None:
    page.goto(f"{BASE_URL}/#/architecture", wait_until="networkidle")
    expected = {
        "publication": (4, {"已被取代", "已撤回"}),
        "action": (6, {"成功", "部分完成", "失败", "补偿操作"}),
        "rule": (6, {"已暂停", "已退役"}),
    }
    for lifecycle_id, (step_count, branch_items) in expected.items():
        page.locator(f'[data-lifecycle-id="{lifecycle_id}"]').click()
        flow = page.locator(f'[data-semantic-flow="lifecycle-{lifecycle_id}"]')
        steps = flow.locator(".semantic-flow-main > .semantic-flow-step")
        expect(steps).to_have_count(step_count)
        heights = [
            round(steps.nth(index).bounding_box()["height"], 1)
            for index in range(steps.count())
        ]
        require(
            max(heights) - min(heights) <= 1,
            f"{lifecycle_id} steps are not equal height: {heights}",
        )
        scroll = flow.locator(".semantic-flow-scroll")
        require(
            scroll.evaluate("(element) => element.scrollWidth <= element.clientWidth + 1"),
            f"{lifecycle_id} main path overflows at the reference desktop viewport",
        )
        rendered_branch_items = set(
            flow.locator(".semantic-flow-branch-items > *").all_inner_texts()
        )
        require(
            branch_items.issubset(rendered_branch_items),
            f"{lifecycle_id} branch semantics are incomplete: {rendered_branch_items}",
        )

    page.locator('[data-lifecycle-id="action"]').click()
    action_text = page.locator("#lifecyclePanel").inner_text()
    require("成功 / 部分完成 / 失败" not in action_text, "互斥的业务操作结果仍被合并在同一节点")
    require("业务成效是独立关联记录" in action_text, "业务操作与业务成效仍未拆分")


def test_contract_flows_and_catalog(page) -> None:
    page.goto(f"{BASE_URL}/#/architecture", wait_until="networkidle")
    process_steps = page.locator(".contract-flow-step")
    expect(process_steps).to_have_count(8)
    expect(page.locator('.contract-flow-branch[data-branch-kind="recovery"]')).to_have_count(1)
    process_heights = [
        round(process_steps.nth(index).bounding_box()["height"], 1)
        for index in range(process_steps.count())
    ]
    require(len(set(process_heights)) == 1, f"Process steps are not equal height: {process_heights}")
    require(
        page.locator(".contract-flow-scroll").evaluate(
            "(element) => element.scrollWidth === element.clientWidth"
        ),
        "Process path overflows at the reference desktop viewport",
    )
    flow_box = page.locator(".contract-flow-scroll").bounding_box()
    first_box = process_steps.first.bounding_box()
    last_box = process_steps.last.bounding_box()
    left_gap = first_box["x"] - flow_box["x"]
    right_gap = flow_box["x"] + flow_box["width"] - (last_box["x"] + last_box["width"])
    require(abs(left_gap - right_gap) < 2, f"Process path is not centered: {left_gap}, {right_gap}")

    page.get_by_role("tab", name="Collaborative Intelligence").click()
    collaborative_steps = page.locator(".contract-flow-step")
    expect(collaborative_steps).to_have_count(5)
    expect(page.locator('.contract-flow-branch[data-branch-kind="terminal"]')).to_have_count(1)
    expect(page.locator('.contract-flow-branch[data-branch-kind="conditional"]')).to_have_count(1)
    collaborative_heights = [
        round(collaborative_steps.nth(index).bounding_box()["height"], 1)
        for index in range(collaborative_steps.count())
    ]
    collaborative_widths = [
        round(collaborative_steps.nth(index).bounding_box()["width"], 1)
        for index in range(collaborative_steps.count())
    ]
    require(
        len(set(collaborative_heights)) == 1,
        f"Collaborative steps are not equal height: {collaborative_heights}",
    )
    require(
        len(set(collaborative_widths)) > 1,
        f"Collaborative steps still force equal width: {collaborative_widths}",
    )
    require(
        "可选交付物 / 决策 / 业务操作" not in page.locator(".contract-flow-main").inner_text(),
        "可选延伸仍被画成必经主路径",
    )

    page.goto(
        f"{BASE_URL}/#/design-system/foundations/accessibility-localization",
        wait_until="networkidle",
    )
    require(page.locator(".ds-nav-group a small").count() == 0, "Catalog still renders visible CN aliases")
    page.locator("#dsCatalogSearch").fill("无障碍")
    expect(
        page.locator('[data-catalog-entry="foundations:accessibility-localization"]')
    ).to_be_visible()


def test_guidance_contracts(page) -> None:
    page.goto(f"{BASE_URL}/#/guidance", wait_until="networkidle")
    page.locator('[data-density-option="brief"]').click()
    expect(page.locator("[data-guidance-composition]")).to_have_count(3)
    expect(page.locator("#guidanceCompositionCanvas .mock-browser-frame")).to_have_count(1)
    assert_mock_browser_radius(page, "#guidanceCompositionCanvas", "Guidance composition")
    expect(page.locator("#guidanceCompositionCanvas .mock-browser-design-lens")).to_contain_text(
        "这张样机演示"
    )
    expect(page.locator("#guidanceCompositionCanvas")).to_contain_text("分析工作区")
    expect(page.locator("#guidanceCompositionSummary")).to_contain_text("固定区域")
    page.locator('[data-guidance-composition="process"]').click()
    expect(page.locator("#guidanceCompositionCanvas")).to_contain_text("异常处理工作台")
    expect(page.locator("#guidanceCompositionCanvas")).to_contain_text("只创建可预览的操作草案")
    page.locator('[data-guidance-composition="handoff"]').click()
    expect(page.locator("#guidanceCompositionCanvas")).to_contain_text("来源修订版本已锁定")
    expect(page.locator("#guidanceCompositionCanvas")).to_contain_text("不会把分析任务直接改成“执行中”")
    page.locator('[data-guidance-composition="collaborative"]').click()
    expect(page.locator(".guidance-contract-chooser > a")).to_have_count(3)
    expect(page.locator(".guidance-contract-chooser")).to_contain_text("人机协作约定 · Process Intelligence")
    expect(page.locator(".guidance-contract-chooser")).to_contain_text("人机协作约定 · Collaborative Intelligence")
    expect(page.locator(".guidance-contract-chooser")).to_contain_text("共同机制 · 工作交接")
    expect(page.locator("#guidance-flows")).to_be_hidden()
    expect(page.locator(".guidance-brief-action")).to_be_visible()
    page.locator(".guidance-brief-action button").click()
    expect(page.locator('[data-density-option="deep"]')).to_have_attribute("aria-pressed", "true")
    expect(page.locator("#guidance-flows")).to_be_visible()
    expect(page.locator("[data-pattern-id]")).to_have_count(17)
    expect(page.locator("#guidance-specimens .mock-browser-frame")).to_have_count(1)

    page.locator(".pattern-filter").scroll_into_view_if_needed()
    scroll_before_filter = page.evaluate("window.scrollY")
    page.locator('[data-pattern-filter="process"]').click()
    page.wait_for_function("() => window.location.hash === '#/guidance/process'")
    page.wait_for_timeout(50)
    scroll_after_filter = page.evaluate("window.scrollY")
    require(
        abs(scroll_after_filter - scroll_before_filter) <= 24,
        f"Guidance filter changed the page scroll position: {scroll_before_filter} -> {scroll_after_filter}",
    )
    page.locator('[data-pattern-id="P02"]').click()
    page.wait_for_function("() => window.location.hash.endsWith('/P02')")
    page.wait_for_timeout(50)
    scroll_after_pattern = page.evaluate("window.scrollY")
    require(
        abs(scroll_after_pattern - scroll_after_filter) <= 24,
        f"Pattern selection changed the page scroll position: {scroll_after_filter} -> {scroll_after_pattern}",
    )
    expect(page.locator("#patternDetail .mock-browser-frame")).to_have_count(1)
    expect(page.locator(".pattern-review-rules .pattern-review-grid article")).to_have_count(2)
    expect(page.locator(".pattern-review-rules")).to_contain_text("应该保留与应该避免的做法")

    page.locator('[data-pattern-filter="all"]').click()
    page.wait_for_function("() => window.location.hash === '#/guidance'")
    reference_flows = page.locator("#guidanceFlows [data-semantic-flow]")
    expect(reference_flows).to_have_count(4)
    for index in range(reference_flows.count()):
        flow = reference_flows.nth(index)
        steps = flow.locator(".semantic-flow-main > .semantic-flow-step")
        heights = [
            round(steps.nth(step_index).bounding_box()["height"], 1)
            for step_index in range(steps.count())
        ]
        require(
            max(heights) - min(heights) <= 1,
            f"Guidance flow {index} steps are not equal height: {heights}",
        )
        require(
            flow.locator(".semantic-flow-scroll").evaluate(
                "(element) => element.scrollWidth <= element.clientWidth + 1"
            ),
            f"Guidance flow {index} overflows at the reference desktop viewport",
        )
    ask_flow = page.locator('[data-semantic-flow="guidance-ask-conclude"]')
    require(
        "交付物" not in ask_flow.locator(".semantic-flow-main").inner_text(),
        "可选协作延伸仍位于必经主路径",
    )
    event_flow = page.locator('[data-semantic-flow="guidance-event-action"]')
    require(
        "业务成效" not in event_flow.locator(".semantic-flow-main").inner_text(),
        "业务成效仍被当成业务操作主路径状态",
    )
    expect(event_flow.locator('[data-branch-kind="linked"]')).to_contain_text("业务成效")

    page.locator('[data-specimen-id="action"]').click()
    progress_track = page.locator("#specimenCanvas .lifecycle-mini")
    expect(progress_track).to_have_attribute("data-flow-contract", "progress-indicator")
    require(
        progress_track.evaluate("(element) => element.scrollWidth <= element.clientWidth + 1"),
        "Controlled Action progress indicator overflows at the reference desktop viewport",
    )
    progress_heights = [
        round(progress_track.locator("span").nth(index).bounding_box()["height"], 1)
        for index in range(progress_track.locator("span").count())
    ]
    require(
        max(progress_heights) - min(progress_heights) <= 1,
        f"Controlled Action progress labels are not equal height: {progress_heights}",
    )

    page.goto(f"{BASE_URL}/#/guidance/shared/S01", wait_until="networkidle")
    expect(page.locator(".gx-s01")).to_contain_text("工作状态")
    expect(page.locator(".gx-s01")).to_contain_text("启用")
    page.locator('[data-guidance-state="Stale"]').click()
    expect(page.locator(".gx-s01")).to_contain_text("工作状态")
    expect(page.locator(".gx-s01")).to_contain_text("启用")

    page.goto(f"{BASE_URL}/#/guidance/shared/S07", wait_until="networkidle")
    states = page.locator("[data-guidance-state]").evaluate_all(
        "(items) => items.map((item) => item.dataset.guidanceState)"
    )
    require("Outcome" not in states, "S07 still exposes Outcome as Action state")
    for terminal in ["Succeeded", "Partial", "Failed"]:
        require(terminal in states, f"S07 missing {terminal}")
    expect(page.locator(".gx-s07")).to_contain_text("业务成效")

    page.goto(f"{BASE_URL}/#/guidance/shared/S08", wait_until="networkidle")
    expect(page.locator(".gx-s08")).to_contain_text("业务成效回执")
    require("人工交接" not in page.locator(".gx-s08").inner_text(), "S08仍把业务成效与人工交接混为一体")
    page.locator('[data-guidance-axis="effect"][data-guidance-state="Improved"]').click()
    expect(page.locator('[data-guidance-axis="observation-state"][data-guidance-state="Pending"]')).to_have_attribute(
        "aria-pressed", "true"
    )
    expect(page.locator(".gx-s08 .gx-separation")).to_be_visible()
    page.locator('[data-guidance-axis="observation-state"][data-guidance-state="Observed"]').click()
    expect(page.locator('[data-guidance-axis="effect"][data-guidance-state="Improved"]')).to_have_attribute(
        "aria-pressed", "true"
    )
    expect(page.locator(".gx-s08 .gx-separation")).to_have_count(0)

    page.goto(f"{BASE_URL}/#/guidance/shared/S10", wait_until="networkidle")
    page.get_by_role("button", name="校验交接包").click()
    expect(page.locator(".gx-s10 .gx-object-status")).to_contain_text("可开始")
    page.get_by_role("button", name="接收工作").click()
    expect(page.locator(".gx-s10 .gx-object-status")).to_contain_text("已接收")

    page.goto(f"{BASE_URL}/#/guidance/shared/S11", wait_until="networkidle")
    expect(page.locator(".gx-s11")).to_contain_text("工作结果")
    expect(page.locator(".gx-s11")).to_contain_text("目标完成判断")
    page.locator('[data-guidance-axis="observation-basis"][data-guidance-state="Unobserved"]').click()
    expect(page.locator('[data-guidance-axis="assessment"][data-guidance-state="Resolved"]')).to_have_attribute(
        "aria-pressed", "true"
    )
    expect(page.locator(".gx-resolution-card")).to_contain_text("不推断成功")
    page.locator('[data-guidance-axis="assessment"][data-guidance-state="Partially Resolved"]').click()
    expect(page.locator('[data-guidance-axis="observation-basis"][data-guidance-state="Unobserved"]')).to_have_attribute(
        "aria-pressed", "true"
    )
    page.get_by_role("button", name="标记为已完成").click()
    expect(page.locator(".gx-resolution-card h5")).to_have_text("已完成")
    expect(page.locator('[data-guidance-axis="observation-basis"][data-guidance-state="Unobserved"]')).to_have_attribute(
        "aria-pressed", "true"
    )

    page.goto(f"{BASE_URL}/#/guidance/collaborative/C01", wait_until="networkidle")
    expect(page.locator(".guidance-static-state")).to_be_visible()
    require(page.locator("[data-guidance-state]").count() == 0, "Static Anatomy Reference claims interactive states")

    page.goto(f"{BASE_URL}/#/guidance/process/P02", wait_until="networkidle")
    rule_flow = page.locator('[data-semantic-flow="guidance-rule-change"]')
    expect(rule_flow).to_be_visible()
    require(
        rule_flow.evaluate("(element) => element.scrollWidth <= element.clientWidth + 1"),
        "Rule Change specimen overflows at the reference desktop viewport",
    )
    rule_steps = rule_flow.locator(".gx-step")
    rule_heights = [
        round(rule_steps.nth(index).bounding_box()["height"], 1)
        for index in range(rule_steps.count())
    ]
    rule_widths = [
        round(rule_steps.nth(index).bounding_box()["width"], 1)
        for index in range(rule_steps.count())
    ]
    require(max(rule_heights) - min(rule_heights) <= 1, f"Rule steps are not equal height: {rule_heights}")
    require(len(set(rule_widths)) > 1, f"Rule steps still force equal width: {rule_widths}")


def test_journeys_and_coverage(page) -> None:
    page.goto(f"{BASE_URL}/#/journeys", wait_until="networkidle")
    expect(page.locator("[data-journey-option]")).to_have_count(3)
    expect(page.locator("#journeys-reference .mock-browser-frame")).to_have_count(1)
    expect(page.locator("#journeys-envelope .mock-browser-frame")).to_have_count(1)
    assert_mock_browser_radius(page, "#journeys-reference", "Journey reference")
    assert_mock_browser_radius(page, "#journeys-envelope", "Journey handoff")
    expect(page.locator("#journeys-reference .mock-browser-design-lens")).to_contain_text(
        "一个用户目标如何在界面中推进、结束或交接"
    )
    expect(page.locator("#journeys-reference h1")).to_contain_text("端到端场景")
    expect(page.locator(".journey-purpose-grid article")).to_have_count(3)
    expect(page.locator(".journey-lineage strong")).to_have_text("得到可信答案并结束")
    expect(page.locator("#journeyTrace button")).to_have_count(3)
    expect(page.locator(".journey-lineage-track")).to_contain_text("结束")
    expect(page.locator(".journey-lineage-track")).to_have_attribute(
        "data-flow-contract", "lineage-summary"
    )
    expect(page.locator("#handoffEnvelope")).to_have_attribute("data-journey", "quick-answer")
    expect(page.locator("#handoffEnvelope")).to_contain_text("不需要")
    require(
        "ROOT-018" not in page.locator("#handoffEnvelope").inner_text(),
        "Quick-answer Journey shows an unrelated collaborative Handoff",
    )

    page.locator('[data-journey-option="collaborative"]').click()
    expect(page.locator("#handoffEnvelope")).to_have_attribute("data-journey", "collaborative")
    expect(page.locator("#handoffEnvelope")).to_contain_text("ROOT-018")
    expect(page.locator(".journey-lineage")).to_contain_text("可选延伸")
    expect(page.locator(".journey-trace-main .journey-trace-step")).to_have_count(4)
    expect(page.locator(".journey-trace-branch-items .journey-trace-step")).to_have_count(3)
    require(
        page.locator(".journey-trace-scroll").evaluate(
            "(element) => element.scrollWidth <= element.clientWidth + 1"
        ),
        "Collaborative Journey flow overflows at the reference desktop viewport",
    )
    require(
        page.locator(".journey-trace-branch").evaluate(
            "(element) => element.scrollWidth <= element.clientWidth + 1"
        ),
        "Collaborative optional branches overflow at the reference desktop viewport",
    )
    main_steps = page.locator(".journey-trace-main .journey-trace-step")
    main_heights = [
        round(main_steps.nth(index).bounding_box()["height"], 1)
        for index in range(main_steps.count())
    ]
    main_widths = [
        round(main_steps.nth(index).bounding_box()["width"], 1)
        for index in range(main_steps.count())
    ]
    require(max(main_heights) - min(main_heights) <= 1, f"Journey steps are not equal height: {main_heights}")
    require(len(set(main_widths)) > 1, f"Journey steps still force equal width: {main_widths}")
    page.locator('[data-journey-step="4"]').click()
    expect(page.locator(".optional-chip")).to_have_text("可选延伸")

    page.locator('[data-journey-option="process"]').click()
    expect(page.locator("#handoffEnvelope")).to_have_attribute("data-journey", "process")
    expect(page.locator("#handoffEnvelope")).to_contain_text("ROOT-204")
    require(
        "ROOT-018" not in page.locator("#handoffEnvelope").inner_text(),
        "Process Journey shows an unrelated collaborative Handoff",
    )
    process_steps = page.locator(".journey-trace-main .journey-trace-step")
    expect(process_steps).to_have_count(7)
    require(
        page.locator(".journey-trace-scroll").evaluate(
            "(element) => element.scrollWidth <= element.clientWidth + 1"
        ),
        "Process Journey flow overflows at the reference desktop viewport",
    )

    page.goto(f"{BASE_URL}/#/guidance", wait_until="networkidle")
    page.locator("#guidance-coverage").scroll_into_view_if_needed()
    expect(page.locator("#patternCoverageTable tr")).to_have_count(32)
    expect(page.locator("#patternCoverageSummary")).to_contain_text("已验证交互模式")
    expect(page.locator("#patternCoverageSummary")).to_contain_text("0")


def test_acceptance_and_documents(page) -> None:
    page.goto(f"{BASE_URL}/#/acceptance", wait_until="networkidle")
    expect(page.locator("#acceptance-gates h1")).to_contain_text("八项设计检查")
    expect(page.locator(".acceptance-card")).to_have_count(8)
    expect(page.locator("#acceptance-A01")).to_contain_text("检查场景")
    expect(page.locator("#acceptance-A01")).to_contain_text("操作方式")
    expect(page.locator("#acceptance-A01")).to_contain_text("应当看到")
    expect(page.locator("#acceptance-A01")).to_contain_text("需要记录")
    expect(page.locator("#acceptance-A01")).to_contain_text("通过条件")
    expect(page.locator("#acceptance-A01")).to_contain_text("建议负责人")
    require(
        all("尚未测量" not in text for text in page.locator(".acceptance-card").all_inner_texts()),
        "Acceptance cards still present unmeasured results as public status",
    )
    expect(page.locator("#acceptance-workstream")).to_have_count(0)
    expect(page.locator("#acceptance-adoption")).to_have_count(0)
    expect(page.locator("#acceptance-locked")).to_have_count(0)
    expect(page.locator(".reader-metric")).to_have_count(5)
    for index in range(5):
        expect(page.locator(".reader-metric").nth(index)).to_contain_text("需要真实用户验证")
        expect(page.locator(".reader-metric").nth(index)).not_to_contain_text("尚未实测")

    page.goto(f"{BASE_URL}/#/acceptance?focus=A05", wait_until="networkidle")
    expect(page.locator("#acceptance-A05")).to_have_class(re.compile(r"\bis-focused\b"))
    expect(page.locator("#acceptance-A05 details")).to_have_attribute("open", "")

    for document_id in ["charter", "narrative", "design-system", "guidance", "rev05"]:
        page.goto(f"{BASE_URL}/#/document?doc={document_id}&from=brief", wait_until="networkidle")
        expect(page.locator("#documentContent")).to_have_attribute("aria-busy", "false")
        text = page.locator("#documentContent").inner_text()
        require("�" not in text and "锟" not in text, f"Markdown mojibake in {document_id}")
        expect(page.locator("#documentBack")).to_be_visible()


def test_design_system_regression(page) -> None:
    page.goto(f"{BASE_URL}/#/design-system", wait_until="networkidle")
    expect(page.locator(".ds-status-stamp")).to_contain_text("参考页面")
    expect(page.locator(".ds-status-stamp")).to_contain_text("静态实现")
    require(
        "生产实现" not in page.locator(".ds-status-stamp").inner_text(),
        "设计系统页面仍暗示已经发布生产实现",
    )
    page.goto(f"{BASE_URL}/#/design-system/components/drawer", wait_until="networkidle")
    expect(page.locator("#live-specimen .mock-browser-frame")).to_have_count(1)
    expect(page.locator("#live-specimen .mock-browser-design-lens")).to_contain_text(
        "抽屉的合法状态组合"
    )
    expect(page.locator(".ds-maturity")).to_contain_text("候选约定")
    require(
        "生产就绪" not in page.locator(".ds-maturity").inner_text(),
        "组件成熟度仍夸大验证状态",
    )
    page.locator('[data-specimen-control="visibility"][data-specimen-value="open"]').click()
    expect(page.frame_locator("[data-specimen-frame]").locator("[data-sp-drawer]")).to_be_visible()
    page.goto(f"{BASE_URL}/#/design-system/components/menu", wait_until="domcontentloaded")
    expect(page.locator("[data-specimen-frame]")).to_be_visible()
    page.locator('[data-specimen-control="variant"][data-specimen-value="selection"]').click()
    expect(page.frame_locator("[data-specimen-frame]").locator('[role="menuitemradio"]')).to_have_count(3)

    page.goto(f"{BASE_URL}/#/design-system/foundations/borders-radius", wait_until="domcontentloaded")
    expect(page.locator(".ds-border-radius-specimen")).to_be_visible()
    expect(page.locator(".ds-elevation-specimen")).to_have_count(0)
    page.locator('[data-border-mode="control"]').click()
    expect(page.locator('[data-border-panel="control"]')).to_be_visible()
    expect(page.locator('[data-border-panel="structure"]')).to_be_hidden()
    page.locator('[data-border-mode="overlay"]').click()
    expect(page.locator('[data-border-panel="overlay"]')).to_be_visible()

    page.goto(f"{BASE_URL}/#/design-system/foundations/elevation", wait_until="domcontentloaded")
    expect(page.locator(".ds-elevation-specimen")).to_be_visible()
    expect(page.locator(".ds-border-radius-specimen")).to_have_count(0)
    page.locator('[data-elevation-open="menu"]').click()
    expect(page.locator("[data-elevation-menu]")).to_be_visible()
    expect(page.locator("[data-elevation-status]")).to_contain_text("菜单层级")
    page.keyboard.press("Escape")
    expect(page.locator("[data-elevation-menu]")).to_be_hidden()
    expect(page.locator('[data-elevation-open="menu"]')).to_be_focused()
    page.locator('[data-elevation-open="modal"]').click()
    expect(page.locator("[data-elevation-modal]")).to_be_visible()
    expect(page.locator("[data-elevation-status]")).to_contain_text("模态层级")
    page.locator('[data-elevation-close="modal"]').click()
    expect(page.locator("[data-elevation-modal]")).to_be_hidden()
    expect(page.locator('[data-elevation-open="modal"]')).to_be_focused()

    page.goto(
        f"{BASE_URL}/#/design-system/foundations/accessibility-localization",
        wait_until="domcontentloaded",
    )
    page.locator("[data-a11y-start]").click()
    first_target = page.locator('[data-a11y-target][data-focus-label="筛选条件"]')
    expect(first_target).to_be_focused()
    expect(page.locator("[data-a11y-focus-status]")).to_contain_text("当前焦点：筛选条件")
    require(
        first_target.evaluate("(element) => getComputedStyle(element).outlineWidth === '3px'"),
        "Accessibility keyboard specimen does not expose a strong visible focus ring",
    )
    page.keyboard.press("Tab")
    expect(page.locator('[data-focus-label="业务范围输入框"]')).to_be_focused()
    expect(page.locator("[data-a11y-focus-status]")).to_contain_text("第2项，共3项")
    page.keyboard.press("Tab")
    expect(page.locator('[data-focus-label="查看依据"]')).to_be_focused()
    page.keyboard.press("Tab")
    require(
        page.evaluate(
            "() => !document.activeElement.closest('[data-a11y-keyboard]')"
        ),
        "Accessibility keyboard specimen traps focus after its final control",
    )
    page.locator("[data-a11y-announce]").click()
    expect(page.locator("[data-a11y-announcement]")).to_contain_text("数据已更新")


def test_foundation_specimen_mobile(browser) -> None:
    page = browser.new_page(viewport={"width": 390, "height": 844}, reduced_motion="reduce")
    errors: list[str] = []
    page.on("console", lambda message: errors.append(message.text) if message.type == "error" else None)
    page.on("pageerror", lambda error: errors.append(str(error)))

    page.goto(f"{BASE_URL}/#/design-system/foundations/borders-radius", wait_until="domcontentloaded")
    for mode in ["structure", "control", "overlay"]:
        page.locator(f'[data-border-mode="{mode}"]').click()
        expect(page.locator(f'[data-border-panel="{mode}"]')).to_be_visible()
        assert_no_overflow(page, f"borders-radius/{mode}@390")

    page.goto(f"{BASE_URL}/#/design-system/foundations/elevation", wait_until="domcontentloaded")
    for mode in ["menu", "modal"]:
        page.locator(f'[data-elevation-open="{mode}"]').click()
        expect(page.locator(f"[data-elevation-{mode}]")).to_be_visible()
        assert_no_overflow(page, f"elevation/{mode}@390")
        page.keyboard.press("Escape")
        expect(page.locator(f"[data-elevation-{mode}]")).to_be_hidden()

    page.goto(
        f"{BASE_URL}/#/design-system/foundations/accessibility-localization",
        wait_until="domcontentloaded",
    )
    page.locator("[data-a11y-start]").click()
    page.keyboard.press("Tab")
    expect(page.locator('[data-focus-label="业务范围输入框"]')).to_be_focused()
    assert_no_overflow(page, "accessibility-localization/keyboard@390")

    require(not errors, f"Foundation specimens produce mobile browser errors: {errors}")
    page.close()


def collect_detail_routes(page) -> list[str]:
    page.goto(f"{BASE_URL}/#/design-system", wait_until="networkidle")
    design_routes = page.locator('a[href*="#/design-system/"]').evaluate_all(
        "(links) => links.map((link) => new URL(link.href).hash)"
    )
    page.goto(f"{BASE_URL}/#/guidance", wait_until="networkidle")
    pattern_ids = page.locator("[data-pattern-id]").evaluate_all(
        "(items) => items.map((item) => item.dataset.patternId)"
    )
    guidance_routes = [
        f"#/guidance/{'shared' if pattern_id.startswith('S') else 'process' if pattern_id.startswith('P') else 'collaborative'}/{pattern_id}"
        for pattern_id in pattern_ids
    ]
    return list(dict.fromkeys([*design_routes, *guidance_routes]))


def test_full_detail_route_regression(browser) -> None:
    discovery = browser.new_page(viewport={"width": 1440, "height": 900})
    routes = collect_detail_routes(discovery)
    discovery.close()
    require(len(routes) == 70, f"详情页目录应包含70条路由，实际为{len(routes)}")

    for width, height in [(1440, 900), (1024, 900), (390, 844)]:
        page = browser.new_page(viewport={"width": width, "height": height}, reduced_motion="reduce")
        errors: list[str] = []
        page.on("console", lambda message: errors.append(message.text) if message.type == "error" else None)
        page.on("pageerror", lambda error: errors.append(str(error)))
        for route in routes:
            page.goto(f"{BASE_URL}/{route}", wait_until="domcontentloaded")
            assert_no_overflow(page, f"{route}@{width}")
            if route.startswith("#/design-system/"):
                expect(page.locator(".ds-detail-header")).to_be_visible()
                expect(page.locator("#live-specimen .mock-browser-frame")).to_have_count(1)
                assert_mock_browser_radius(page, "#live-specimen", route)
                require(
                    page.locator("#live-specimen .ds-live-stage").evaluate(
                        "(element) => Boolean(element.closest('[data-mock-browser-frame]'))"
                    ),
                    f"{route} renders a visual specimen outside the mock-browser frame",
                )
            if route.startswith("#/guidance/"):
                expect(page.locator(".guidance-live-specimen")).to_be_visible()
                assert_mock_browser_radius(page, "#patternDetail", route)
                require(
                    page.locator(".guidance-live-specimen").evaluate(
                        "(element) => Boolean(element.closest('[data-mock-browser-frame]'))"
                    ),
                    f"{route} renders a guidance specimen outside the mock-browser frame",
                )
        require(not errors, f"详情页在{width}px视口产生控制台错误：{errors}")
        page.close()


def run() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    SPECIMEN_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True, executable_path=CHROME_PATH)
        page = browser.new_page(viewport={"width": 1440, "height": 900}, reduced_motion="reduce")
        errors: list[str] = []
        page.on("console", lambda message: errors.append(message.text) if message.type == "error" else None)
        page.on("pageerror", lambda error: errors.append(str(error)))

        test_architecture_navigation_map(page)
        test_headings_transmit_information(page)
        test_site_frame_contract(page)
        test_kernel_projection(page)
        test_axis_independence(page)
        test_lifecycles(page)
        test_contract_flows_and_catalog(page)
        test_guidance_contracts(page)
        test_journeys_and_coverage(page)
        test_acceptance_and_documents(page)
        test_design_system_regression(page)
        test_component_contract_matrix(page, SPECIMEN_OUTPUT_DIR)
        test_primitive_visualization(page)
        test_guidance_visualization(page, SPECIMEN_OUTPUT_DIR)
        test_axis_independence_and_keyboard(page)
        require(not errors, f"Browser console/page errors: {errors}")
        page.screenshot(path=OUTPUT_DIR / "rev05-final-route.png", full_page=True)
        page.close()

        test_routes_and_viewports(browser)
        test_foundation_specimen_mobile(browser)
        test_contract_responsive(browser)
        test_full_detail_route_regression(browser)
        browser.close()

    print("EIX 2.0 Rev 0.5 verification passed.")


if __name__ == "__main__":
    run()
