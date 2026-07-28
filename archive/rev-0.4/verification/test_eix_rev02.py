"""Deterministic browser verification for the EIX 2.0 Rev 0.2 static site."""

from pathlib import Path

from playwright.sync_api import expect, sync_playwright


BASE_URL = "http://127.0.0.1:4190"
CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUTPUT_DIR = Path(__file__).parent / "rev-0.2"


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def visible_text(page, selector: str) -> str:
    return page.locator(selector).inner_text()


def assert_no_horizontal_overflow(page, label: str) -> None:
    dimensions = page.evaluate(
        """() => ({
          viewport: window.innerWidth,
          document: document.documentElement.scrollWidth,
          body: document.body.scrollWidth
        })"""
    )
    require(
        dimensions["document"] <= dimensions["viewport"] + 1
        and dimensions["body"] <= dimensions["viewport"] + 1,
        f"{label} has horizontal overflow: {dimensions}",
    )


def assert_route(page, route: str, expected_title: str) -> None:
    page.goto(f"{BASE_URL}/#/{route}", wait_until="networkidle")
    view = page.locator(f'[data-route-view="{route}"]')
    expect(view).to_be_visible()
    expect(page.locator(f'[data-route-link="{route}"]')).to_have_attribute("aria-current", "page")
    require(expected_title in page.title(), f"Unexpected title for {route}: {page.title()}")


def click_specimen(page, specimen_id: str) -> None:
    page.locator(f'[data-specimen-id="{specimen_id}"]').click()
    expect(page.locator(f'[data-specimen-id="{specimen_id}"]')).to_have_attribute("aria-selected", "true")


def test_routes_and_density(page) -> None:
    expected = {
        "brief": "Experience Narrative",
        "architecture": "Canonical Architecture",
        "patterns": "Pattern Specimen Library",
        "journeys": "Reference Journeys",
        "acceptance": "Experience Acceptance",
    }
    for route, title in expected.items():
        assert_route(page, route, title)

    page.goto(f"{BASE_URL}/#/not-a-route", wait_until="networkidle")
    expect(page).to_have_url(f"{BASE_URL}/#/brief")
    expect(page.locator('[data-route-view="brief"]')).to_be_visible()

    page.locator('[data-density-option="deep"]').click()
    expect(page.locator("body")).to_have_attribute("data-density", "deep")
    page.reload(wait_until="networkidle")
    expect(page.locator("body")).to_have_attribute("data-density", "deep")
    page.locator('[data-density-option="brief"]').click()

    page.locator('[data-route-link="architecture"]').click()
    expect(page).to_have_url(f"{BASE_URL}/#/architecture")
    page.reload(wait_until="networkidle")
    expect(page.locator('[data-route-view="architecture"]')).to_be_visible()


def test_intent_patch(page) -> None:
    assert_route(page, "patterns", "Pattern Specimen Library")
    click_specimen(page, "patch")
    page.locator('[data-patch-action="preview"]').click()
    expect(page.locator(".diff-table")).to_be_visible()
    require("Scope变化" in visible_text(page, ".diff-table"), "Patch impact is not explicit")

    page.locator('[data-patch-action="apply"]').click()
    expect(page.locator(".status-message")).to_contain_text("Gate已失效")
    require("r5" in visible_text(page, ".specimen-frame > header"), "Apply did not create revision r5")

    page.locator('[data-patch-action="branch"]').click()
    expect(page.locator(".status-message")).to_contain_text("Parent保持")
    require("ANL-118-B1" in visible_text(page, ".specimen-frame > header"), "Branch ID is missing")

    page.locator('[data-patch-action="revert"]').click()
    expect(page.locator(".status-message")).to_contain_text("历史Revision仍保留")
    require("r6" in visible_text(page, ".specimen-frame > header"), "Revert did not create revision r6")


def test_evidence_and_publication_gate(page) -> None:
    page.reload(wait_until="networkidle")
    click_specimen(page, "evidence")

    page.locator('[data-evidence-action="toggle-stale"]').click()
    expect(page.locator(".gate-card")).to_contain_text("Invalidated")
    expect(page.locator('[data-evidence-action="run-gate"]')).to_be_disabled()
    expect(page.locator('[data-evidence-action="publish"]')).to_be_disabled()

    page.locator('[data-evidence-action="toggle-stale"]').click()
    expect(page.locator(".status-message")).to_contain_text("必须重新运行Gate")
    page.locator('[data-evidence-action="run-gate"]').click()
    expect(page.locator(".status-message")).to_contain_text("尚未发布")
    require(
        "Workflow · Draft" in visible_text(page, "#specimenInspector"),
        "Passed Gate incorrectly implied Published",
    )
    page.locator('[data-evidence-action="publish"]').click()
    expect(page.locator(".status-message")).to_contain_text("已发布")
    require(
        "Workflow · Published" in visible_text(page, "#specimenInspector"),
        "Published lifecycle state is missing",
    )


def test_plan_partial_preserves_work(page) -> None:
    page.reload(wait_until="networkidle")
    click_specimen(page, "plan")
    for _ in range(3):
        page.locator('[data-plan-action="advance"]').click()

    expect(page.locator(".degradation")).to_be_visible()
    expect(page.locator(".degradation")).to_contain_text("基础KPI与Entity排名仍然Verified")
    inspector = visible_text(page, "#specimenInspector")
    require("Base Result · Verified" in inspector, "Verified base result was not preserved")
    require("Attribution · Partial" in inspector, "Higher-order analysis did not degrade to Partial")


def test_action_lifecycle_and_permission(page) -> None:
    page.reload(wait_until="networkidle")
    click_specimen(page, "action")

    page.locator('[data-action-demo="toggle-permission"]').click()
    expect(page.locator('[data-action-demo="advance"]')).to_be_disabled()
    expect(page.locator(".status-message")).to_contain_text("Permission Denied仍阻断")

    page.locator('[data-action-demo="toggle-permission"]').click()
    for _ in range(3):
        page.locator('[data-action-demo="advance"]').click()

    expect(page.locator(".decision-meta")).to_contain_text("Approved")
    expect(page.locator('[data-action-demo="advance"]')).to_have_text("加入执行队列")
    expect(page.locator(".status-message")).to_contain_text("尚未Queued或Executed")

    for _ in range(3):
        page.locator('[data-action-demo="advance"]').click()
    expect(page.locator(".status-message")).to_contain_text("Outcome Receipt")
    expect(page.locator(".decision-meta")).to_contain_text("Succeeded")


def test_rule_change_lifecycle(page) -> None:
    page.reload(wait_until="networkidle")
    click_specimen(page, "rule")

    for _ in range(2):
        page.locator('[data-rule-action="advance"]').click()
    expect(page.locator(".status-message")).to_contain_text("仍未审批、未生效")
    page.locator('[data-rule-action="reject"]').click()
    expect(page.locator(".status-message")).to_contain_text("没有Rule Active")
    require(
        "Future Scope · No impact" in visible_text(page, "#specimenInspector"),
        "Rejected Candidate retained an active effect",
    )

    page.locator('[data-rule-action="reset"]').click()
    for _ in range(5):
        page.locator('[data-rule-action="advance"]').click()
    expect(page.locator(".status-message")).to_contain_text("仅影响未来")
    expect(page.locator(".receipt-table")).to_contain_text("Future matching Cases only")


def test_journeys_and_typed_handoff(page) -> None:
    assert_route(page, "journeys", "Reference Journeys")
    expect(page.locator("#journeyPosition")).to_have_text("1 / 7")
    first_object = visible_text(page, ".object-chip")
    page.locator("#journeyNext").click()
    expect(page.locator("#journeyPosition")).to_have_text("2 / 7")
    require(visible_text(page, ".object-chip") != first_object, "Journey did not advance Work Object")

    page.locator('[data-journey-option="process"]').click()
    expect(page.locator("#journeyPosition")).to_have_text("1 / 7")
    require(
        "CASE-" in visible_text(page, ".object-chip"),
        "Process Journey does not begin with a typed Case object",
    )
    envelope = visible_text(page, "#handoffEnvelope")
    for required in ("Goal", "Context", "Evidence", "Policy", "Trace"):
        require(required in envelope, f"Handoff envelope missing {required}")


def test_markdown_document_reader(page) -> None:
    assert_route(page, "brief", "Experience Narrative")
    page.locator('.suite-map [data-document-id="charter"]').click()
    expect(page).to_have_url(f"{BASE_URL}/#/document?doc=charter&from=brief")
    expect(page.locator("#documentContent")).to_have_attribute("aria-busy", "false")
    expect(page.locator("#documentTitle")).to_contain_text("Enterprise Intelligence Experience Principles 2.0")
    expect(page.locator("#documentContent h2").first).to_be_visible()
    expect(page.locator(".markdown-table-scroll").first).to_be_visible()
    require(page.locator("#documentToc a").count() >= 10, "Rendered document TOC is incomplete")

    rendered_text = visible_text(page, "#documentContent")
    require("文档套件与阅读路径" in rendered_text, "Chinese Markdown content did not render")
    require("�" not in rendered_text and "锟" not in rendered_text, "Rendered Markdown contains mojibake")
    require("# Enterprise Intelligence" not in rendered_text, "Raw Markdown syntax is visible")

    page.locator('#documentContent [data-document-id="narrative"]').first.click()
    expect(page).to_have_url(f"{BASE_URL}/#/document?doc=narrative&from=brief")
    expect(page.locator("#documentContent")).to_have_attribute("aria-busy", "false")
    expect(page.locator("#documentTitle")).to_contain_text("Experience Narrative")
    require("为什么Chat不够" in visible_text(page, "#documentContent"), "Internal Markdown link did not load the Narrative")

    page.locator("#documentBack").click()
    expect(page).to_have_url(f"{BASE_URL}/#/brief")
    expect(page.locator('[data-route-view="brief"]')).to_be_visible()

    assert_route(page, "architecture", "Canonical Architecture")
    page.locator('.suite-map [data-document-id="patterns"]').click()
    expect(page).to_have_url(f"{BASE_URL}/#/document?doc=patterns&from=architecture")
    expect(page.locator("#documentContent")).to_have_attribute("aria-busy", "false")
    expect(page.locator("#documentBackLabel")).to_have_text("返回 Canonical Architecture")
    page.locator("#documentBack").click()
    expect(page).to_have_url(f"{BASE_URL}/#/architecture")


def test_keyboard_tabs_and_pattern_list(page) -> None:
    assert_route(page, "architecture", "Canonical Architecture")
    selected = page.locator("#kernelTabs [role=tab][aria-selected=true]")
    selected.focus()
    selected.press("ArrowRight")
    require(
        page.locator("#kernelTabs [role=tab][aria-selected=true]").count() == 1,
        "Kernel tab keyboard navigation lost selection",
    )

    assert_route(page, "patterns", "Pattern Specimen Library")
    option = page.locator('#patternList [role="option"]').first
    option.focus()
    option.press("ArrowDown")
    require(
        page.locator('#patternList [role="option"][aria-selected="true"]').count() == 1,
        "Pattern list keyboard navigation lost selection",
    )
    require(
        page.evaluate("() => document.activeElement?.getAttribute('data-pattern-id')") is not None,
        "Pattern list keyboard navigation lost focus",
    )


def test_viewports_and_capture(browser) -> list[dict]:
    captures = [
        (1440, 900, "brief", "brief-1440.png"),
        (1280, 900, "architecture", "architecture-1280.png"),
        (1024, 900, "patterns", "patterns-1024.png"),
        (390, 844, "brief", "brief-390.png"),
        (390, 844, "journeys", "journeys-390.png"),
    ]
    results = []
    for width, height, route, filename in captures:
        context = browser.new_context(viewport={"width": width, "height": height})
        page = context.new_page()
        page.goto(f"{BASE_URL}/#/{route}", wait_until="networkidle")
        assert_no_horizontal_overflow(page, f"{route}@{width}")
        require(
            page.locator(f'[data-route-view="{route}"]').is_visible(),
            f"{route}@{width} is not visible",
        )
        page.screenshot(path=str(OUTPUT_DIR / filename), full_page=True)
        results.append({"route": route, "width": width, "height": height, "file": filename})
        context.close()

    document_captures = [
        (1440, 900, "charter", "brief", "document-charter-1440.png"),
        (390, 844, "charter", "brief", "document-charter-390.png"),
    ]
    for width, height, document_id, return_route, filename in document_captures:
        context = browser.new_context(viewport={"width": width, "height": height})
        page = context.new_page()
        page.goto(
            f"{BASE_URL}/#/document?doc={document_id}&from={return_route}",
            wait_until="networkidle",
        )
        expect(page.locator("#documentContent")).to_have_attribute("aria-busy", "false")
        assert_no_horizontal_overflow(page, f"document-{document_id}@{width}")
        require(page.locator(".document-back").is_visible(), f"Back control is missing at {width}")
        require("�" not in visible_text(page, "#documentContent"), f"Document mojibake at {width}")
        page.screenshot(path=str(OUTPUT_DIR / filename), full_page=True)
        results.append(
            {
                "route": f"document:{document_id}",
                "width": width,
                "height": height,
                "file": filename,
            }
        )
        context.close()
    return results


def test_touch_targets_and_semantic_labels(page) -> None:
    assert_route(page, "patterns", "Pattern Specimen Library")
    too_small = page.evaluate(
        """() => [...document.querySelectorAll('button, a[href]')]
          .filter((node) => {
            const style = getComputedStyle(node);
            const rect = node.getBoundingClientRect();
            return style.display !== 'none'
              && style.visibility !== 'hidden'
              && rect.width > 0
              && rect.height > 0
              && (rect.width < 44 || rect.height < 44);
          })
          .map((node) => ({
            tag: node.tagName,
            text: (node.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 60),
            width: Math.round(node.getBoundingClientRect().width),
            height: Math.round(node.getBoundingClientRect().height)
          }))"""
    )
    require(not too_small, f"Interactive targets below 44px: {too_small[:12]}")

    unlabeled_badges = page.evaluate(
        """() => [...document.querySelectorAll('.state-badge')]
          .filter((node) => !(node.textContent || '').trim())
          .length"""
    )
    require(unlabeled_badges == 0, "Semantic states rely on color without a text label")


def contrast_ratio(foreground: str, background: str) -> float:
    def luminance(hex_color: str) -> float:
        channels = [
            int(hex_color.lstrip("#")[index : index + 2], 16) / 255
            for index in (0, 2, 4)
        ]
        linear = [
            channel / 12.92
            if channel <= 0.04045
            else ((channel + 0.055) / 1.055) ** 2.4
            for channel in channels
        ]
        return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]

    foreground_luminance = luminance(foreground)
    background_luminance = luminance(background)
    lighter = max(foreground_luminance, background_luminance)
    darker = min(foreground_luminance, background_luminance)
    return (lighter + 0.05) / (darker + 0.05)


def test_semantic_token_contrast(page) -> None:
    assert_route(page, "brief", "Experience Narrative")
    variables = page.evaluate(
        """() => {
          const style = getComputedStyle(document.documentElement);
          const names = [
            '--foundation-ink',
            '--foundation-muted',
            '--foundation-faint',
            '--interaction-change',
            '--claim-color',
            '--validation-color',
            '--risk-color',
            '--permission-color',
            '--workflow-color',
            '--blocking-color',
            '--success-color'
          ];
          return Object.fromEntries(names.map((name) => [name, style.getPropertyValue(name).trim()]));
        }"""
    )
    for name, color in variables.items():
        ratio = contrast_ratio(color, "#ffffff")
        require(ratio >= 4.5, f"{name} contrast on paper is {ratio:.2f}, below WCAG AA")
    require(
        contrast_ratio("#ffffff", "#041a3a") >= 4.5,
        "White on foundation navy is below WCAG AA",
    )


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    console_errors = []
    page_errors = []

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(
            headless=True,
            executable_path=CHROME_PATH,
            args=["--disable-background-networking"],
        )
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()
        page.on(
            "console",
            lambda message: console_errors.append(message.text)
            if message.type == "error"
            else None,
        )
        page.on("pageerror", lambda error: page_errors.append(str(error)))

        tests = [
            ("routes+density", test_routes_and_density),
            ("intent-patch", test_intent_patch),
            ("evidence+publication", test_evidence_and_publication_gate),
            ("plan-partial", test_plan_partial_preserves_work),
            ("action-lifecycle", test_action_lifecycle_and_permission),
            ("rule-lifecycle", test_rule_change_lifecycle),
            ("journeys+handoff", test_journeys_and_typed_handoff),
            ("markdown-reader", test_markdown_document_reader),
            ("keyboard", test_keyboard_tabs_and_pattern_list),
            ("touch+labels", test_touch_targets_and_semantic_labels),
            ("semantic-contrast", test_semantic_token_contrast),
        ]
        for label, test in tests:
            test(page)
            print(f"PASS {label}")

        captures = test_viewports_and_capture(browser)
        print(f"PASS viewports {captures}")

        require(not console_errors, f"Console errors: {console_errors}")
        require(not page_errors, f"Page errors: {page_errors}")
        print("PASS console-errors=0")

        context.close()
        browser.close()


if __name__ == "__main__":
    main()
