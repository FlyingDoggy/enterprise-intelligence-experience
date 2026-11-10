"""Public deployment smoke test for the EIX static reference site."""

from __future__ import annotations

import os

from playwright.sync_api import expect, sync_playwright


BASE_URL = os.environ.get("EIX_BASE_URL", "http://127.0.0.1:4190").rstrip("/")
CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
ROUTES = ["brief", "architecture", "design-system", "guidance", "journeys", "acceptance"]


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def assert_mock_browser_radius(page, scope: str, label: str) -> None:
    expected = page.evaluate(
        "() => getComputedStyle(document.documentElement).getPropertyValue('--foundation-radius-overlay').trim()"
    )
    actual = page.locator(f"{scope} .mock-browser-frame").evaluate_all(
        "(items) => items.map((item) => getComputedStyle(item).borderTopLeftRadius)"
    )
    require(actual and all(value == expected for value in actual), f"{label} radius mismatch: {actual}")


def route_health(page, route: str) -> None:
    page.goto(f"{BASE_URL}/#/{route}", wait_until="networkidle")
    page.wait_for_timeout(260)
    expect(page.locator(f'[data-route-view="{route}"]')).to_be_visible()
    result = page.evaluate(
        """() => {
          const visible = (element) => {
            const style = getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            return style.display !== "none"
              && style.visibility !== "hidden"
              && Number.parseFloat(style.opacity) > 0
              && rect.width > 0
              && rect.height > 0;
          };
          const leafText = [...document.body.querySelectorAll("*")]
            .filter((element) => visible(element)
              && element.children.length === 0
              && element.textContent.trim().length > 0);
          const controls = [...document.querySelectorAll("button, a[href], input, select, textarea")]
            .filter(visible);
          return {
            viewport: innerWidth,
            document: document.documentElement.scrollWidth,
            body: document.body.scrollWidth,
            smallText: leafText.filter((element) =>
              Number.parseFloat(getComputedStyle(element).fontSize) < 11.95).length,
            smallControls: controls.filter((element) =>
              Number.parseFloat(getComputedStyle(element).fontSize) < 12.95).length
          };
        }"""
    )
    require(
        result["document"] <= result["viewport"] + 1 and result["body"] <= result["viewport"] + 1,
        f"{route} overflows at {result['viewport']}px: {result}",
    )
    require(result["smallText"] == 0, f"{route} exposes text below 12px: {result}")
    require(result["smallControls"] == 0, f"{route} exposes controls below 13px: {result}")


def run() -> None:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True, executable_path=CHROME_PATH)
        errors: list[str] = []
        for width, height in [(1440, 900), (390, 844)]:
            page = browser.new_page(viewport={"width": width, "height": height}, reduced_motion="reduce")
            page.on("console", lambda message: errors.append(message.text) if message.type == "error" else None)
            page.on("pageerror", lambda error: errors.append(str(error)))
            for route in ROUTES:
                route_health(page, route)
            page.close()

        page = browser.new_page(viewport={"width": 1280, "height": 900}, reduced_motion="reduce")
        page.goto(f"{BASE_URL}/#/design-system/foundations/color", wait_until="networkidle")
        expect(page.locator(".revision-badge")).to_contain_text("修订0.5")
        page.locator('[data-ds-mode="dark"]').click()
        expect(page.locator("body")).to_have_attribute("data-mode", "dark")

        page.goto(f"{BASE_URL}/#/design-system/components/drawer", wait_until="networkidle")
        expect(page.locator("#live-specimen .mock-browser-frame")).to_have_count(1)
        assert_mock_browser_radius(page, "#live-specimen", "Deployed component specimen")
        page.locator('[data-specimen-control="visibility"][data-specimen-value="open"]').click()
        expect(page.frame_locator("[data-specimen-frame]").locator("[data-sp-drawer]")).to_be_visible()

        page.goto(f"{BASE_URL}/#/guidance/shared/S09", wait_until="networkidle")
        expect(page.locator(".gx-capability")).to_contain_text("能力声明 · 不是授权")
        expect(page.locator("#guidanceFlows .guidance-flow-card")).to_have_count(4)
        for index in range(page.locator("#guidanceFlows [data-semantic-flow]").count()):
            flow = page.locator("#guidanceFlows [data-semantic-flow]").nth(index)
            require(
                flow.locator(".semantic-flow-scroll").evaluate(
                    "(element) => element.scrollWidth <= element.clientWidth + 1"
                ),
                f"Deployed Guidance flow {index} overflows its desktop canvas",
            )

        page.goto(f"{BASE_URL}/#/architecture", wait_until="networkidle")
        require(page.locator(".kernel-trace").count() == 0, "Deprecated global Kernel Trace is still deployed")
        page.locator('[data-density-option="deep"]').click()
        kernel_tab_layout = page.locator(".kernel-tabs button").evaluate_all(
            """(buttons) => buttons.map((button) => {
              const buttonBounds = button.getBoundingClientRect();
              const children = [...button.children].map((child) => child.getBoundingClientRect());
              return {
                contained: children.every((bounds) =>
                  bounds.left >= buttonBounds.left - 1
                  && bounds.right <= buttonBounds.right + 1
                  && bounds.top >= buttonBounds.top - 1
                  && bounds.bottom <= buttonBounds.bottom + 1
                ),
                unclipped: button.scrollWidth <= button.clientWidth + 1
                  && button.scrollHeight <= button.clientHeight + 1,
              };
            })"""
        )
        require(
            all(item["contained"] and item["unclipped"] for item in kernel_tab_layout),
            f"Deployed Kernel record labels overlap or escape their tabs: {kernel_tab_layout}",
        )
        expect(page.locator("#sectionNav .section-nav-group")).to_have_count(4)
        expect(page.locator('#sectionNav [data-nav-group="layers"] a')).to_have_count(5)
        expect(page.locator('#sectionNav [data-nav-group="cross-layer"] a')).to_have_count(3)
        expect(page.locator("#architectureLayers .layer-row")).to_have_count(5)
        expect(page.locator("#architectureCrossLinks button")).to_have_count(3)
        page.locator('#architectureLayers [data-architecture-layer="L4"]').click()
        expect(page.locator('#sectionNav [data-section-link="architecture-surfaces"]')).to_have_attribute(
            "aria-current", "location"
        )
        page.locator('#sectionNav [data-section-link="architecture-semantics"]').click()
        expect(
            page.locator('#architectureCrossLinks [data-architecture-target="architecture-semantics"]')
        ).to_have_attribute("aria-current", "location")
        expect(page.locator("[data-projection-id]")).to_have_count(5)
        expect(page.locator('[data-kernel-record="decision"]')).to_contain_text("不适用")
        expect(page.locator(".semantic-question-card")).to_have_count(3)
        expect(page.locator(".semantic-question-card li")).to_have_count(7)
        architecture_copy = page.locator("#architecture-semantics").inner_text()
        for retired in ["认识论", "正交", "七个轴", "语义轴"]:
            require(retired not in architecture_copy, f"Retired architecture wording is deployed: {retired}")
        expect(page.locator(".contract-flow-step")).to_have_count(8)
        expect(page.locator('.contract-flow-branch[data-branch-kind="recovery"]')).to_have_count(1)
        require(
            page.locator(".contract-flow-scroll").evaluate(
                "(element) => element.scrollWidth === element.clientWidth"
            ),
            "Deployed Process contract path is not centered within its desktop canvas",
        )
        page.get_by_role("tab", name="Collaborative Intelligence").click()
        expect(page.locator(".contract-flow-step")).to_have_count(5)
        expect(page.locator('.contract-flow-branch[data-branch-kind="terminal"]')).to_have_count(1)
        expect(page.locator('.contract-flow-branch[data-branch-kind="conditional"]')).to_have_count(1)
        expect(page.locator(".axis-gate-summary > strong")).to_have_text("仍不可执行")
        page.locator('[data-axis-lab="evidence"]').select_option("Verified")
        expect(page.locator('[data-axis-lab="permission"]')).to_have_value("Conditional")
        page.locator('[data-axis-lab="permission"]').select_option("Allowed")
        expect(page.locator(".axis-gate-summary > strong")).to_have_text("可以进入执行队列")
        page.locator('[data-lifecycle-id="action"]').click()
        expect(page.locator('[data-semantic-flow="lifecycle-action"] .semantic-flow-step')).to_have_count(6)
        expect(
            page.locator('[data-semantic-flow="lifecycle-action"] [data-branch-kind="terminal"]')
        ).to_contain_text("成功")
        require(
            "成功 / 部分完成 / 失败" not in page.locator("#lifecyclePanel").inner_text(),
            "Deployed Action results remain collapsed into one node",
        )

        page.goto(
            f"{BASE_URL}/#/design-system/foundations/accessibility-localization",
            wait_until="networkidle",
        )
        require(page.locator(".ds-nav-group a small").count() == 0, "Visible bilingual catalog aliases remain")
        page.locator("#dsCatalogSearch").fill("无障碍")
        expect(
            page.locator('[data-catalog-entry="foundations:accessibility-localization"]')
        ).to_be_visible()

        page.goto(f"{BASE_URL}/#/design-system", wait_until="networkidle")
        stamp_layout = page.locator(".ds-status-stamp").evaluate(
            """(stamp) => {
              const label = stamp.querySelector("strong");
              const stampBounds = stamp.getBoundingClientRect();
              const labelBounds = label.getBoundingClientRect();
              return {
                left: labelBounds.left >= stampBounds.left - 1,
                right: labelBounds.right <= stampBounds.right + 1,
                top: labelBounds.top >= stampBounds.top - 1,
                bottom: labelBounds.bottom <= stampBounds.bottom + 1,
              };
            }"""
        )
        require(
            all(stamp_layout.values()),
            f"Deployed Design System status label escapes its stamp: {stamp_layout}",
        )

        page.goto(f"{BASE_URL}/#/guidance/shared/S11", wait_until="networkidle")
        expect(page.locator(".gx-s11")).to_contain_text("工作结果")
        expect(page.locator(".gx-s11")).to_contain_text("目标完成判断")
        expect(page.locator("#patternCoverageTable tr")).to_have_count(32)

        page.goto(f"{BASE_URL}/#/guidance", wait_until="networkidle")
        page.locator('[data-density-option="brief"]').click()
        expect(page.locator("[data-guidance-composition]")).to_have_count(3)
        expect(page.locator("#guidanceCompositionCanvas .mock-browser-frame")).to_have_count(1)
        assert_mock_browser_radius(page, "#guidanceCompositionCanvas", "Deployed Guidance composition")
        expect(page.locator("#guidanceCompositionCanvas")).to_contain_text("分析工作区")
        page.locator('[data-guidance-composition="process"]').click()
        expect(page.locator("#guidanceCompositionCanvas")).to_contain_text("异常处理工作台")
        page.locator('[data-guidance-composition="handoff"]').click()
        expect(page.locator("#guidanceCompositionCanvas")).to_contain_text("来源修订版本已锁定")
        expect(page.locator("#railView")).to_have_text("两类企业人工智能界面应该怎样工作？")
        page.locator('[data-density-option="deep"]').click()
        page.locator(".pattern-filter").scroll_into_view_if_needed()
        scroll_before = page.evaluate("window.scrollY")
        page.locator('[data-pattern-filter="process"]').click()
        page.wait_for_function("() => window.location.hash === '#/guidance/process'")
        page.wait_for_timeout(60)
        scroll_after = page.evaluate("window.scrollY")
        require(
            abs(scroll_after - scroll_before) <= 24,
            f"Deployed Guidance filter resets page scroll: {scroll_before} -> {scroll_after}",
        )
        page.locator('[data-pattern-id="P02"]').click()
        page.wait_for_function("() => window.location.hash.endsWith('/P02')")
        expect(page.locator("#patternDetail .mock-browser-frame")).to_have_count(1)
        expect(page.locator(".pattern-review-grid article")).to_have_count(2)

        page.goto(f"{BASE_URL}/#/journeys", wait_until="networkidle")
        expect(page.locator("[data-journey-option]")).to_have_count(3)
        expect(page.locator("#journeys-reference .mock-browser-frame")).to_have_count(1)
        expect(page.locator("#journeys-envelope .mock-browser-frame")).to_have_count(1)
        assert_mock_browser_radius(page, "#journeys-reference", "Deployed Journey")
        expect(page.locator(".journey-purpose-grid article")).to_have_count(3)
        expect(page.locator(".journey-lineage strong")).to_have_text("得到可信答案并结束")
        page.locator('[data-journey-option="collaborative"]').click()
        expect(page.locator(".journey-trace-main .journey-trace-step")).to_have_count(4)
        expect(page.locator(".journey-trace-branch-items .journey-trace-step")).to_have_count(3)
        require(
            page.locator(".journey-trace-scroll").evaluate(
                "(element) => element.scrollWidth <= element.clientWidth + 1"
            ),
            "Deployed Collaborative Journey main path overflows",
        )

        page.goto(f"{BASE_URL}/#/document?doc=charter&from=brief", wait_until="networkidle")
        expect(page.locator("#documentTitle")).to_contain_text("企业智能体验原则")
        expect(page.locator(".markdown-body h2").first).to_contain_text("文档套件")
        require("�" not in page.locator(".markdown-body").inner_text(), "Markdown reader contains replacement characters")

        page.goto(f"{BASE_URL}/#/document?doc=consolidation&from=brief", wait_until="networkidle")
        expect(page.locator("#documentTitle")).to_contain_text("方案合并决策记录")
        expect(page.locator("#documentContent")).to_contain_text("两套设计收敛")
        page.close()
        browser.close()

    require(not errors, f"Public deployment emitted console/page errors: {errors}")
    print(f"Public deployment verified: {BASE_URL}/")


if __name__ == "__main__":
    run()
