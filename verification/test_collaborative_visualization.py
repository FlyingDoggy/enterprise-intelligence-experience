import os
from pathlib import Path

from playwright.sync_api import expect, sync_playwright


BASE_URL = os.environ.get("EIX_BASE_URL", "http://127.0.0.1:4190").rstrip("/")
GALLERY_URL = (
    f"{BASE_URL}/design-system/collaborative-visualization/samples/index.html"
)
OUTPUT_DIR = Path(__file__).resolve().parent / "collaborative-visualization"
OUTPUT_DIR.mkdir(exist_ok=True)
SAMPLE_IDS = [
    "ranking",
    "variance",
    "dumbbell",
    "trend",
    "anomaly",
    "forecast",
    "waterfall",
    "composition",
    "distribution",
    "heatmap",
    "scatter",
    "sankey",
]


def assert_no_page_overflow(page):
    metrics = page.evaluate(
        """() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth
        })"""
    )
    assert (
        metrics["scrollWidth"] <= metrics["clientWidth"] + 1
    ), f"page overflow: {metrics}"


def assert_svg_text_integrity(svg, label):
    result = svg.evaluate(
        """(root) => {
          const bounds = root.getBoundingClientRect();
          const texts = [...root.querySelectorAll("text")].map((node) => {
            const rect = node.getBoundingClientRect();
            return {
              text: node.textContent.trim(),
              left: rect.left,
              right: rect.right,
              top: rect.top,
              bottom: rect.bottom
            };
          });
          const outside = texts.filter((item) =>
            item.left < bounds.left - 1
            || item.right > bounds.right + 1
            || item.top < bounds.top - 1
            || item.bottom > bounds.bottom + 1
          );
          const overlaps = [];
          for (let first = 0; first < texts.length; first += 1) {
            for (let second = first + 1; second < texts.length; second += 1) {
              const a = texts[first];
              const b = texts[second];
              const horizontal = Math.min(a.right, b.right) - Math.max(a.left, b.left);
              const vertical = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
              if (horizontal > 1 && vertical > 1) overlaps.push([a.text, b.text]);
            }
          }
          return { outside, overlaps };
        }"""
    )
    assert not result["outside"], f"{label} text exceeds SVG bounds: {result['outside']}"
    assert not result["overlaps"], f"{label} text overlaps: {result['overlaps']}"


def verify_gallery(browser, width, height):
    page = browser.new_page(viewport={"width": width, "height": height})
    console_errors = []
    page_errors = []
    page.on(
        "console",
        lambda message: console_errors.append(message.text)
        if message.type == "error"
        else None,
    )
    page.on("pageerror", lambda error: page_errors.append(str(error)))

    page.goto(GALLERY_URL)
    page.wait_for_load_state("networkidle")

    expect(
        page.get_by_role("heading", name="Collaborative Intelligence 图表规范")
    ).to_be_visible()
    expect(page.get_by_role("region", name="图表规范工作台")).to_be_visible()
    expect(page.locator(".gallery-nav__item")).to_have_count(12)
    expect(page.locator(".gallery-atlas__card")).to_have_count(22)
    expect(page.locator(".gallery-selection-table tbody tr")).to_have_count(6)
    expect(page.locator(".gallery-series-ramp span")).to_have_count(5)
    expect(page.locator(".gallery-sequential-ramp span")).to_have_count(7)
    expect(page.locator(".gallery-diverging-ramp span")).to_have_count(7)
    expect(page.locator("[data-chart-block='chart-ranking-template']")).to_be_visible()
    expect(page.locator("[data-chart-block] svg")).to_be_visible()
    expect(page.locator("#routeRepresentation")).to_have_text("重点横向条形图")
    expect(page.locator("#routeChecks")).to_contain_text("对象口径一致")
    expect(page.locator("#routeChecks")).not_to_contain_text("comparable-scope")

    h1_size = page.locator("h1").evaluate(
        "(node) => parseFloat(getComputedStyle(node).fontSize)"
    )
    assert h1_size <= 48, f"page title is too large at {width}: {h1_size}px"

    radius = page.locator(".eix-viz-browser").evaluate(
        "(node) => getComputedStyle(node).borderRadius"
    )
    assert radius == "7px", f"browser frame must use maximum allowed radius: {radius}"

    if width >= 1280:
        first_screen = page.evaluate(
            """() => {
              const browser = document.querySelector(".eix-viz-browser").getBoundingClientRect();
              const chart = document.querySelector(".eix-chart-block").getBoundingClientRect();
              return { browserTop: browser.top, chartTop: chart.top, viewport: innerHeight };
            }"""
        )
        assert first_screen["browserTop"] <= 250, f"workbench starts too low: {first_screen}"
        assert (
            first_screen["chartTop"] < first_screen["viewport"]
        ), f"core chart sample is absent from first screen: {first_screen}"

    page.locator(".eix-viz-browser").scroll_into_view_if_needed()
    before = page.evaluate("window.scrollY")
    nav_scroll_before = page.locator(".gallery-nav").evaluate("(node) => node.scrollLeft")
    page.locator("[data-sample='variance']").click()
    after = page.evaluate("window.scrollY")
    nav_scroll_after = page.locator(".gallery-nav").evaluate("(node) => node.scrollLeft")
    assert abs(after - before) <= 2, f"sample switch moved the page: {before} -> {after}"
    assert (
        nav_scroll_after >= nav_scroll_before
    ), f"sample navigation unexpectedly reset: {nav_scroll_before} -> {nav_scroll_after}"

    expect(page.locator("[data-chart-block='chart-variance-template']")).to_be_visible()
    expect(page.locator("#routeRepresentation")).to_have_text("零基准差异条")

    block = page.locator("[data-chart-block]")
    expect(block).to_have_attribute("data-chart-representation", "variance-bar")
    visual_metrics = block.evaluate(
        """(node) => {
          const svg = node.querySelector("svg");
          const scale = svg.getBoundingClientRect().width / svg.viewBox.baseVal.width;
          const label = svg.querySelector(".eix-chart-label");
          const value = svg.querySelector(".eix-chart-value");
          const style = getComputedStyle(node);
          const workspace = node.closest(".gallery-workspace");
          return {
            titleSize: parseFloat(getComputedStyle(node.querySelector(".eix-chart-block__title")).fontSize),
            chartWidth: svg.getBoundingClientRect().width,
            chartHeight: svg.getBoundingClientRect().height,
            labelScreenSize: parseFloat(getComputedStyle(label).fontSize) * scale,
            valueScreenSize: parseFloat(getComputedStyle(value).fontSize) * scale,
            headerPadding: parseFloat(getComputedStyle(node.querySelector(".eix-chart-block__header")).paddingLeft),
            viewPadding: parseFloat(getComputedStyle(node.querySelector(".eix-chart-block__view")).paddingLeft),
            workspaceGap: parseFloat(getComputedStyle(workspace).rowGap),
            workspacePadding: parseFloat(getComputedStyle(workspace).paddingLeft),
            blockFontSize: parseFloat(style.fontSize)
          };
        }"""
    )
    assert 20 <= visual_metrics["titleSize"] <= 28, visual_metrics
    assert visual_metrics["chartWidth"] <= 866, visual_metrics
    assert visual_metrics["chartHeight"] <= 350, visual_metrics
    assert 12.5 <= visual_metrics["labelScreenSize"] <= 17.5, visual_metrics
    assert 14.5 <= visual_metrics["valueScreenSize"] <= 20, visual_metrics
    assert visual_metrics["headerPadding"] > 0, visual_metrics
    assert visual_metrics["viewPadding"] > 0, visual_metrics
    assert visual_metrics["workspaceGap"] > 0, visual_metrics
    assert visual_metrics["workspacePadding"] > 0, visual_metrics

    block.get_by_role("button", name="数据表").click()
    expect(block.locator(".eix-chart-table")).to_be_visible()
    block.get_by_role("button", name="解释", exact=True).first.click()
    expect(block.locator(".eix-chart-block__explanation")).to_be_visible()
    block.get_by_role("button", name="图形").click()
    expect(block.locator("svg")).to_be_visible()

    first_mark = block.locator("[data-mark-key]").first
    first_mark.focus()
    page.keyboard.press("Enter")
    expect(first_mark).to_have_attribute("aria-selected", "true")

    if width >= 768:
        block.get_by_role("button", name="比较").click()
        expect(block.locator("[data-chart-live]")).to_contain_text("未执行外部操作")

    block.locator("summary").click()
    expect(block.locator(".eix-chart-block__evidence code").first).to_be_visible()

    page.get_by_role("tab", name="CSS Token").click()
    expect(page.locator("#deliveryPanel code")).to_contain_text("--eix-viz-value")
    expect(page.locator("#deliverySource")).to_have_text("打开 CSS Token")
    page.get_by_role("tab", name="使用规范").click()
    expect(page.locator("#deliveryPanel")).to_contain_text("零线是差异判断的固定参照")

    page.locator("#modeButton").click()
    expect(page.locator("html")).to_have_attribute("data-mode", "dark")

    for sample_id in SAMPLE_IDS:
        page.locator(f"[data-sample='{sample_id}']").click()
        expect(page.locator("[data-chart-block]")).to_be_visible()
        expect(page.locator("[data-chart-block] svg")).to_be_visible()
        assert_svg_text_integrity(
            page.locator("[data-chart-block] svg"),
            f"{sample_id} at {width}px",
        )
    page.locator("#modeButton").click()
    expect(page.locator("html")).to_have_attribute("data-mode", "light")

    page.locator("#atlasFilters").scroll_into_view_if_needed()
    atlas_scroll_before = page.evaluate("window.scrollY")
    page.locator("[data-atlas-family='process']").click()
    expect(page.locator(".gallery-atlas__card")).to_have_count(4)
    atlas_scroll_after = page.evaluate("window.scrollY")
    assert (
        abs(atlas_scroll_after - atlas_scroll_before) <= 2
    ), f"atlas filter moved the page: {atlas_scroll_before} -> {atlas_scroll_after}"
    page.locator("[data-atlas-family='all']").click()
    expect(page.locator(".gallery-atlas__card")).to_have_count(22)
    atlas_layout = page.locator(".gallery-atlas__card").first.evaluate(
        """(node) => {
          const decision = node.querySelector(".gallery-atlas__decision");
          const preview = node.querySelector(".gallery-atlas__preview");
          const svg = preview.querySelector("svg");
          const encoding = node.querySelector(".gallery-atlas__encoding");
          return {
            decisionBeforePreview: Boolean(decision.compareDocumentPosition(preview) & Node.DOCUMENT_POSITION_FOLLOWING),
            previewBeforeEncoding: Boolean(preview.compareDocumentPosition(encoding) & Node.DOCUMENT_POSITION_FOLLOWING),
            previewPadding: parseFloat(getComputedStyle(preview).paddingLeft),
            previewWidth: svg.getBoundingClientRect().width
          };
        }"""
    )
    assert atlas_layout["decisionBeforePreview"], atlas_layout
    assert atlas_layout["previewBeforeEncoding"], atlas_layout
    assert atlas_layout["previewPadding"] > 0, atlas_layout
    if width >= 768:
        assert atlas_layout["previewWidth"] <= 482, atlas_layout

    color_metrics = page.locator(".gallery-color-grid article").first.evaluate(
        """(node) => {
          const swatch = node.querySelector(".gallery-series-ramp span");
          return {
            padding: parseFloat(getComputedStyle(node).paddingLeft),
            bodySize: parseFloat(getComputedStyle(node.querySelector("p")).fontSize),
            swatchHeight: swatch.getBoundingClientRect().height
          };
        }"""
    )
    assert color_metrics["padding"] > 0, color_metrics
    assert color_metrics["bodySize"] >= 15, color_metrics
    assert 44 <= color_metrics["swatchHeight"] <= 52, color_metrics
    atlas_integrity = page.locator(".gallery-atlas__preview svg").evaluate_all(
        """(svgs) => svgs.flatMap((svg) => {
          const bounds = svg.getBoundingClientRect();
          return [...svg.querySelectorAll("text")]
            .map((node) => {
              const rect = node.getBoundingClientRect();
              return {
                chart: svg.closest("[data-atlas-id]").dataset.atlasId,
                text: node.textContent.trim(),
                outside: rect.left < bounds.left - 1
                  || rect.right > bounds.right + 1
                  || rect.top < bounds.top - 1
                  || rect.bottom > bounds.bottom + 1
              };
            })
            .filter((item) => item.outside);
        })"""
    )
    assert not atlas_integrity, f"atlas text exceeds SVG bounds at {width}: {atlas_integrity}"

    if width < 768:
        plot_metrics = page.locator(".eix-chart-block__plot").evaluate(
            """(node) => {
              const svg = node.querySelector("svg");
              const container = node.getBoundingClientRect();
              const chart = svg.getBoundingClientRect();
              return {
                scrollWidth: node.scrollWidth,
                clientWidth: node.clientWidth,
                chartStartsInside: chart.left >= container.left - 1
              };
            }"""
        )
        assert (
            plot_metrics["scrollWidth"] > plot_metrics["clientWidth"]
        ), f"mobile chart should scroll internally: {plot_metrics}"
        assert plot_metrics[
            "chartStartsInside"
        ], f"mobile chart is clipped on its leading edge: {plot_metrics}"
        atlas_metrics = page.locator(".gallery-atlas__preview").first.evaluate(
            """(node) => {
              const svg = node.querySelector("svg");
              const container = node.getBoundingClientRect();
              const chart = svg.getBoundingClientRect();
              return {
                scrollWidth: node.scrollWidth,
                clientWidth: node.clientWidth,
                chartStartsInside: chart.left >= container.left - 1
              };
            }"""
        )
        assert atlas_metrics[
            "chartStartsInside"
        ], f"mobile atlas preview is clipped on its leading edge: {atlas_metrics}"

    assert_no_page_overflow(page)
    assert not console_errors, f"console errors at {width}: {console_errors}"
    assert not page_errors, f"page errors at {width}: {page_errors}"

    if width in {1440, 1280, 1024, 390}:
        page.screenshot(
            path=str(OUTPUT_DIR / f"gallery-{width}.png"),
            full_page=width >= 1024,
        )
    page.close()


def verify_design_system_entry(browser):
    page = browser.new_page(viewport={"width": 1440, "height": 1000})
    errors = []
    page.on(
        "console",
        lambda message: errors.append(message.text) if message.type == "error" else None,
    )
    page.goto(f"{BASE_URL}/#/design-system/foundations/data-display")
    page.wait_for_load_state("networkidle")

    expect(page.get_by_role("heading", name="数据表达").first).to_be_visible()
    expect(page.get_by_role("link", name="打开完整数据表达参考")).to_be_visible()
    expect(page.get_by_role("link", name="设计侧JSON")).to_be_visible()
    expect(page.get_by_role("link", name="开发侧CSS令牌")).to_be_visible()
    expect(page.get_by_role("link", name="ChartSpec Schema")).to_be_visible()
    expect(page.locator(".ds-data-viz")).to_be_visible()
    assert_no_page_overflow(page)
    assert not errors, f"design system entry console errors: {errors}"
    page.screenshot(path=str(OUTPUT_DIR / "design-system-entry-1440.png"), full_page=True)
    page.close()


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    verify_design_system_entry(browser)
    for viewport in [
        (1920, 1080),
        (1440, 1000),
        (1280, 720),
        (1200, 900),
        (1199, 900),
        (1024, 900),
        (768, 900),
        (767, 900),
        (390, 844),
    ]:
        verify_gallery(browser, *viewport)
    browser.close()

print("Collaborative Intelligence visualization browser verification passed.")
