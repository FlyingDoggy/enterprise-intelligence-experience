"""Deterministic browser and contract verification for EIX 2.0 Rev 0.3."""

from __future__ import annotations

import json
from pathlib import Path

from playwright.sync_api import Page, expect, sync_playwright
from test_contract_visualization import (
    test_axis_independence_and_keyboard,
    test_component_contract_matrix,
    test_contract_responsive,
    test_guidance_visualization,
    test_primitive_visualization,
)


BASE_URL = "http://127.0.0.1:4190"
CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PROJECT_ROOT = Path(__file__).parent.parent
OUTPUT_DIR = Path(__file__).parent / "rev-0.3"
SPECIMEN_OUTPUT_DIR = OUTPUT_DIR / "specimens"


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def assert_no_horizontal_overflow(page: Page, label: str) -> None:
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


def assert_route(page: Page, path: str, base_route: str, expected_title: str) -> None:
    page.goto(f"{BASE_URL}/#/{path}", wait_until="networkidle")
    page.wait_for_timeout(220)
    expect(page.locator(f'[data-route-view="{base_route}"]')).to_be_visible()
    expect(page.locator(f'[data-route-link="{base_route}"]')).to_have_attribute("aria-current", "page")
    require(expected_title in page.title(), f"Unexpected title for {path}: {page.title()}")
    assert_no_horizontal_overflow(page, path)


def test_token_contract() -> None:
    source = json.loads((PROJECT_ROOT / "design-system/tokens.json").read_text(encoding="utf-8"))
    generated = (PROJECT_ROOT / "design-system/tokens.generated.css").read_text(encoding="utf-8")
    required = {"path", "tier", "cssVariable", "defaultValue", "themeOverrides", "description"}
    allowed_tiers = {"foundation", "semantic", "component", "eix-extension"}
    paths: set[str] = set()
    variables: set[str] = set()
    require(source["defaultTheme"] == "eix", "EIX must be the default reference theme")
    require(source["supportedThemes"] == ["neutral", "eix"], "Theme contract changed unexpectedly")
    require("dark" in source["futureModes"], "Future mode slot is missing")
    for token in source["tokens"]:
        require(required <= token.keys(), f"Token is incomplete: {token}")
        require(token["tier"] in allowed_tiers, f"Invalid token tier: {token['tier']}")
        require(token["path"] not in paths, f"Duplicate token path: {token['path']}")
        require(token["cssVariable"] not in variables, f"Duplicate CSS variable: {token['cssVariable']}")
        require(
            f"{token['cssVariable']}: {token['defaultValue']};" in generated,
            f"Generated CSS is stale for {token['path']}",
        )
        paths.add(token["path"])
        variables.add(token["cssVariable"])
    require(len(source["tokens"]) >= 45, "Token inventory is unexpectedly incomplete")


def test_primary_routes(page: Page) -> None:
    routes = [
        ("brief", "brief", "Experience Narrative"),
        ("architecture", "architecture", "Canonical Architecture"),
        ("design-system", "design-system", "EIX Core Design System"),
        ("guidance", "guidance", "Intelligence UX Guidance"),
        ("journeys", "journeys", "Reference Journeys"),
        ("acceptance", "acceptance", "Experience Acceptance"),
    ]
    for path, base, title in routes:
        assert_route(page, path, base, title)
        if base == "architecture":
            expect(page.locator(".kernel-trace")).to_be_visible()
            active_trace_height = page.evaluate(
                "() => getComputedStyle(document.documentElement).getPropertyValue('--active-trace-height').trim()"
            )
            require(
                active_trace_height == "46px",
                f"Architecture trace height is incorrect: {active_trace_height}",
            )
        else:
            expect(page.locator(".kernel-trace")).to_be_hidden()
            active_trace_height = page.evaluate(
                "() => getComputedStyle(document.documentElement).getPropertyValue('--active-trace-height').trim()"
            )
            require(active_trace_height == "0px", f"Trace space leaked into {base}: {active_trace_height}")

    page.goto(f"{BASE_URL}/#/patterns", wait_until="networkidle")
    page.wait_for_timeout(120)
    expect(page).to_have_url(f"{BASE_URL}/#/guidance")
    expect(page.locator('[data-route-view="guidance"]')).to_be_visible()

    page.goto(f"{BASE_URL}/#/not-a-route", wait_until="networkidle")
    expect(page).to_have_url(f"{BASE_URL}/#/brief")


def test_reference_typography(page: Page) -> None:
    routes = ["brief", "architecture", "design-system", "guidance", "journeys", "acceptance"]
    for route in routes:
        page.goto(f"{BASE_URL}/#/{route}", wait_until="networkidle")
        page.wait_for_timeout(240)
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
              const leaves = [...document.body.querySelectorAll("*")]
                .filter((element) => visible(element)
                  && element.children.length === 0
                  && element.textContent.trim().length > 0);
              const belowTwelve = leaves
                .filter((element) => Number.parseFloat(getComputedStyle(element).fontSize) < 11.95)
                .slice(0, 12)
                .map((element) => ({
                  tag: element.tagName,
                  className: element.className,
                  text: element.textContent.trim().slice(0, 48),
                  size: getComputedStyle(element).fontSize
                }));
              const compactControls = [...document.querySelectorAll("button, a[href], input, select, textarea")]
                .filter((element) => visible(element)
                  && Number.parseFloat(getComputedStyle(element).fontSize) < 12.95)
                .slice(0, 12)
                .map((element) => ({
                  tag: element.tagName,
                  className: element.className,
                  text: (element.textContent || element.value || element.getAttribute("aria-label") || "").trim().slice(0, 48),
                  size: getComputedStyle(element).fontSize
                }));
              return {
                body: getComputedStyle(document.body).fontSize,
                belowTwelve,
                compactControls
              };
            }"""
        )
        require(result["body"] == "16px", f"{route} body typography drifted: {result['body']}")
        require(not result["belowTwelve"], f"{route} exposes text below 12px: {result['belowTwelve']}")
        require(not result["compactControls"], f"{route} exposes controls below 13px: {result['compactControls']}")


def test_design_system_overview_and_theme(page: Page) -> None:
    assert_route(page, "design-system", "design-system", "EIX Core Design System")
    expect(page.locator(".ds-reference-shell")).to_be_visible()
    expect(page.locator(".kernel-trace")).to_be_hidden()
    expect(page.locator("#sidebar")).to_be_hidden()
    expect(page.locator(".ds-inspector-heading")).to_contain_text("当前规范信息")
    require(page.locator("[data-catalog-entry]").count() == 49, "Design System catalog coverage changed")
    expect(page.locator(".ds-layer-trace")).to_contain_text("Intelligence Pattern")
    expect(page.locator(".ds-status-stamp")).to_contain_text("Static · No package API")

    search = page.locator("#dsCatalogSearch")
    search.fill("Button")
    expect(page.locator('[data-catalog-entry="components:button"]')).to_be_visible()
    require(
        page.locator("[data-catalog-entry]:not([hidden])").count() >= 2,
        "Catalog search should find Button and Icon Button",
    )
    search.fill("")
    require(page.locator("[data-catalog-entry]:not([hidden])").count() == 49, "Catalog search did not reset")

    page.locator('[data-ds-theme="neutral"]').click()
    expect(page.locator("body")).to_have_attribute("data-theme", "neutral")
    neutral_primary = page.evaluate(
        "() => getComputedStyle(document.body).getPropertyValue('--semantic-action-primary').trim()"
    )
    require(neutral_primary.upper() == "#176AA6", f"Unexpected neutral token: {neutral_primary}")
    page.reload(wait_until="networkidle")
    expect(page.locator("body")).to_have_attribute("data-theme", "neutral")
    page.locator('[data-ds-theme="eix"]').click()
    expect(page.locator("body")).to_have_attribute("data-theme", "eix")


def test_catalog_continuous_browsing(page: Page) -> None:
    assert_route(
        page,
        "design-system/components/application-shell",
        "design-system",
        "EIX Core Design System",
    )
    catalog = page.locator(".ds-catalog")
    catalog.evaluate("(element) => { element.scrollTop = element.scrollHeight; }")
    page.wait_for_timeout(40)
    expect(page.locator('[data-catalog-entry="components:application-shell"]')).to_be_visible()
    initial_scroll = catalog.evaluate("(element) => element.scrollTop")
    require(initial_scroll > 400, "Deep catalog route should reveal its active entry")

    page.locator('[data-catalog-entry="components:header"]').click()
    expect(page).to_have_url(f"{BASE_URL}/#/design-system/components/header")
    page.wait_for_timeout(80)
    preserved_scroll = catalog.evaluate("(element) => element.scrollTop")
    require(
        abs(preserved_scroll - initial_scroll) < 4,
        f"Catalog position was reset: {initial_scroll} -> {preserved_scroll}",
    )

    search = page.locator("#dsCatalogSearch")
    search.fill("Button")
    page.locator('[data-catalog-entry="components:button"]').click()
    expect(page).to_have_url(f"{BASE_URL}/#/design-system/components/button")
    expect(search).to_have_value("Button")

    next_link = page.locator('.ds-sequence-nav a[rel="next"]')
    expect(next_link).to_be_visible()
    next_title = next_link.locator("b").inner_text()
    next_link.click()
    expect(page.locator("h1:visible")).to_have_text(next_title)


def test_design_system_component_behaviors(page: Page) -> None:
    assert_route(page, "design-system/components/button", "design-system", "EIX Core Design System")
    expect(page.locator("h1:visible")).to_have_text("Button")
    expect(page.locator(".ds-code-block")).to_contain_text("CONTRACT EXAMPLE")
    expect(page.locator(".ds-code-block")).to_contain_text("<button")
    require("@eix/ui" not in page.locator(".ds-code-block").inner_text(), "Reference markup claims an unpublished API")

    page.locator('[data-specimen-control="variant"][data-specimen-value="danger"]').click()
    expect(page.locator(".sp-specimen")).to_have_attribute("data-preview-variant", "danger")
    page.locator('[data-specimen-control="state"][data-specimen-value="disabled"]').click()
    expect(page.locator(".sp-button-value")).to_be_disabled()
    expect(page.locator("[data-specimen-markup]")).to_contain_text("disabled")
    page.reload(wait_until="networkidle")
    expect(page.locator('[data-specimen-control="variant"][data-specimen-value="primary"]')).to_have_attribute(
        "aria-pressed", "true"
    )
    expect(page.locator('[data-specimen-control="state"][data-specimen-value="default"]')).to_have_attribute(
        "aria-pressed", "true"
    )
    expect(page.locator(".sp-button-value")).to_be_enabled()

    assert_route(page, "design-system/components/link", "design-system", "EIX Core Design System")
    page.locator('[data-specimen-control="state"][data-specimen-value="visited"]').click()
    expect(page.locator(".sp-specimen")).to_have_attribute("data-preview-state", "visited")
    expect(page.locator(".sp-link-value")).to_contain_text("Evidence")

    assert_route(page, "design-system/components/tooltip", "design-system", "EIX Core Design System")
    tooltip = page.locator(".sp-tooltip-value [role=tooltip]")
    expect(tooltip).to_be_hidden()
    page.locator("[data-sp-tooltip-trigger]").focus()
    expect(tooltip).to_be_visible()
    page.locator("[data-specimen-reset]").focus()
    expect(tooltip).to_be_hidden()

    assert_route(page, "design-system/components/icon-button", "design-system", "EIX Core Design System")
    icon_tooltip = page.locator(".sp-icon-button-context [role=tooltip]")
    expect(icon_tooltip).to_be_hidden()
    page.locator("[data-sp-icon-button]").focus()
    expect(icon_tooltip).to_be_visible()
    page.locator("[data-specimen-reset]").focus()
    expect(icon_tooltip).to_be_hidden()

    assert_route(page, "design-system/components/disclosure", "design-system", "EIX Core Design System")
    trigger = page.locator("[data-sp-disclosure]")
    trigger.click()
    expect(trigger).to_have_attribute("aria-expanded", "true")
    expect(trigger.locator("xpath=following-sibling::div")).to_be_visible()

    assert_route(page, "design-system/components/menu", "design-system", "EIX Core Design System")
    menu_trigger = page.locator("[data-sp-menu-trigger]")
    menu_trigger.click()
    expect(page.locator("[data-sp-menu-item]").first).to_be_focused()
    page.keyboard.press("ArrowDown")
    expect(page.locator("[data-sp-menu-item]").nth(1)).to_be_focused()
    page.keyboard.press("Escape")
    expect(page.locator("[data-sp-menu]")).to_be_hidden()
    expect(menu_trigger).to_be_focused()

    assert_route(page, "design-system/components/dialog", "design-system", "EIX Core Design System")
    page.locator("[data-sp-dialog-trigger]").click()
    expect(page.locator("[data-sp-dialog]")).to_be_visible()
    expect(page.locator("[data-sp-dialog-close]")).to_be_focused()
    page.locator("[data-sp-dialog-close]").click()
    expect(page.locator("[data-sp-dialog]")).to_have_count(0)
    expect(page.locator("[data-sp-dialog-trigger]")).to_be_focused()
    page.locator('[data-specimen-control="state"][data-specimen-value="busy"]').click()
    expect(page.locator("[data-sp-dialog-close]")).to_be_focused()
    page.keyboard.press("Escape")
    expect(page.locator("[data-sp-dialog]")).to_have_count(0)

    assert_route(page, "design-system/components/drawer", "design-system", "EIX Core Design System")
    for placement in ["right", "left", "bottom"]:
        page.locator(
            f'[data-specimen-control="variant"][data-specimen-value="{placement}"]'
        ).click()
        page.locator('[data-specimen-control="state"][data-specimen-value="open"]').click()
        drawer = page.locator("[data-sp-drawer]")
        expect(drawer).to_be_visible()
        expect(page.locator("[data-sp-drawer-close]")).to_be_focused()
        require(
            drawer.evaluate("element => getComputedStyle(element).backgroundColor")
            not in {"transparent", "rgba(0, 0, 0, 0)"},
            f"{placement} Drawer panel is transparent",
        )
        page.keyboard.press("Escape")
        expect(drawer).to_have_count(0)
        expect(page.locator("[data-sp-drawer-trigger]")).to_be_focused()
    page.locator('[data-specimen-control="state"][data-specimen-value="open"]').click()
    page.locator("[data-sp-drawer-layer]").click(position={"x": 5, "y": 5})
    expect(page.locator("[data-sp-drawer]")).to_have_count(0)

    assert_route(page, "design-system/components/tabs", "design-system", "EIX Core Design System")
    page.locator(".sp-tabs-value [role=tab]", has_text="Evidence").click()
    expect(page.locator(".sp-tabs-value [role=tabpanel]")).to_contain_text("Evidence")
    expect(page.locator("[data-specimen-markup]")).to_contain_text("Evidence")
    page.locator(".sp-tabs-value [role=tab]", has_text="Evidence").focus()
    page.keyboard.press("ArrowRight")
    expect(page.locator(".sp-tabs-value [role=tab]", has_text="History")).to_be_focused()

    assert_route(page, "design-system/components/segmented-control", "design-system", "EIX Core Design System")
    page.locator('[data-sp-segment="2"]').click()
    expect(page.locator('[data-sp-segment="2"]')).to_have_attribute("aria-pressed", "true")
    expect(page.locator("[data-specimen-markup]")).to_contain_text('aria-pressed="true">Compare')

    assert_route(page, "design-system/components/select", "design-system", "EIX Core Design System")
    page.locator("[data-sp-native-select]").select_option("2")
    expect(page.locator("[data-specimen-markup]")).to_contain_text("Working team")
    page.locator('[data-specimen-control="variant"][data-specimen-value="enhanced"]').click()
    page.locator("[data-sp-select-trigger]").click()
    expect(page.locator("[data-sp-select-listbox]")).to_be_visible()
    expect(page.locator('[data-sp-select-option="2"]')).to_be_focused()
    page.locator('[data-sp-select-option="1"]').click()
    expect(page.locator("[data-sp-select-trigger]")).to_contain_text("Process owner")
    expect(page.locator("[data-specimen-markup]")).to_contain_text("Process owner")
    page.locator("[data-sp-select-trigger]").click()
    expect(page.locator('[data-sp-select-option="1"]')).to_be_focused()
    page.keyboard.press("Escape")
    expect(page.locator("[data-sp-select-listbox]")).to_be_hidden()

    assert_route(page, "design-system/components/checkbox", "design-system", "EIX Core Design System")
    page.locator("[data-sp-checkbox]").check()
    expect(page.locator(".sp-specimen")).to_have_attribute("data-preview-state", "checked")
    expect(page.locator("[data-specimen-markup]")).to_contain_text(" checked")

    assert_route(page, "design-system/components/switch", "design-system", "EIX Core Design System")
    page.locator(".sp-switch-value").click()
    expect(page.locator(".sp-specimen")).to_have_attribute("data-preview-state", "on")
    expect(page.locator("[data-specimen-markup]")).to_contain_text(" checked")

    assert_route(page, "design-system/components/table", "design-system", "EIX Core Design System")
    page.locator("[data-sp-sort]").click()
    expect(page.locator(".sp-specimen")).to_have_attribute("data-preview-state", "sorted")
    expect(page.locator('[aria-sort="descending"]')).to_be_visible()
    expect(page.locator("tbody tr").first.locator("th")).to_have_text("Sample A")
    page.locator('[data-sp-table-row="2"]').focus()
    page.keyboard.press("Enter")
    expect(page.locator('[data-sp-table-row="2"]')).to_have_attribute("aria-selected", "true")
    expect(page.locator('[data-sp-table-row="2"]')).to_be_focused()

    assert_route(page, "design-system/components/callout", "design-system", "EIX Core Design System")
    page.locator('[data-specimen-control="state"][data-specimen-value="dismissible"]').click()
    page.locator("[data-sp-callout-dismiss]").click()
    expect(page.locator("[data-specimen-state-output]")).to_contain_text("dismissed")
    expect(page.locator("[data-specimen-markup]")).to_contain_text("removed")
    page.locator("[data-specimen-reset]").click()
    expect(page.locator("[data-sp-callout]")).to_be_visible()

    assert_route(page, "design-system/components/sidebar", "design-system", "EIX Core Design System")
    page.locator('[data-specimen-control="state"][data-specimen-value="mobile open"]').click()
    expect(page.locator("[data-sp-sidebar-panel]")).to_have_attribute("aria-modal", "true")
    expect(page.locator("[data-sp-sidebar-close]")).to_be_focused()
    page.keyboard.press("Escape")
    expect(page.locator("[data-sp-sidebar-panel]")).to_have_count(0)
    expect(page.locator("[data-sp-sidebar-mobile-trigger]")).to_be_focused()


def specimen_fingerprint(page: Page) -> str:
    return page.locator(".sp-specimen").evaluate(
        """(root) => {
          const clone = root.cloneNode(true);
          clone.removeAttribute("data-preview-state");
          clone.removeAttribute("data-preview-variant");
          clone.querySelector(".sp-state-receipt")?.remove();
          clone.className = clone.className
            .split(/\\s+/)
            .filter((name) => !name.startsWith("is-") && !name.startsWith("variant-"))
            .join(" ");
          const nodes = [root, ...root.querySelectorAll("*")]
            .filter((node) => !node.closest(".sp-state-receipt"))
            .slice(0, 120);
          const visual = nodes.map((node) => {
            const style = getComputedStyle(node);
            return [
              node.tagName,
              style.display,
              style.visibility,
              style.color,
              style.backgroundColor,
              style.borderTopColor,
              style.borderLeftWidth,
              style.opacity,
              style.fontSize,
              style.fontWeight,
              style.textDecorationLine,
              style.outlineStyle,
              style.width,
              style.height,
              style.animationName,
              style.filter,
              style.top,
              style.right,
              style.bottom,
              style.left,
              style.resize
            ];
          });
          return JSON.stringify({ dom: clone.outerHTML, visual });
        }"""
    )


def specimen_contract_issues(page: Page) -> list[str]:
    return page.locator(".sp-specimen").evaluate(
        """(root) => {
          const issues = [];
          const visible = (element) => {
            const style = getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            return !element.hidden
              && style.display !== "none"
              && style.visibility !== "hidden"
              && rect.width > 0
              && rect.height > 0;
          };
          const ids = [...root.querySelectorAll("[id]")].map((element) => element.id);
          for (const id of new Set(ids)) {
            if (ids.filter((candidate) => candidate === id).length > 1) issues.push(`duplicate id #${id}`);
          }
          for (const element of root.querySelectorAll("[aria-controls], [aria-describedby], [aria-labelledby]")) {
            for (const attribute of ["aria-controls", "aria-describedby", "aria-labelledby"]) {
              const value = element.getAttribute(attribute);
              if (!value) continue;
              for (const id of value.split(/\\s+/)) {
                if (!root.querySelector(`#${CSS.escape(id)}`)) issues.push(`${attribute} references missing #${id}`);
              }
            }
          }
          for (const button of root.querySelectorAll("button:not([type])")) {
            if (visible(button)) issues.push("visible button is missing type");
          }
          for (const control of root.querySelectorAll("input, select, textarea")) {
            const named = control.labels?.length
              || control.getAttribute("aria-label")
              || control.getAttribute("aria-labelledby");
            if (visible(control) && !named) issues.push(`${control.tagName.toLowerCase()} has no accessible label`);
          }
          for (const hidden of root.querySelectorAll('[aria-hidden="true"]')) {
            const focusable = [...hidden.querySelectorAll("button, a[href], input, select, textarea, [tabindex]")]
              .some(visible);
            if (focusable) issues.push("aria-hidden region contains focusable content");
          }
          for (const panel of root.querySelectorAll('[role="dialog"]')) {
            if (!visible(panel)) continue;
            const style = getComputedStyle(panel);
            if (panel.getAttribute("aria-modal") !== "true") issues.push("open dialog is missing aria-modal");
            if (style.backgroundColor === "transparent" || style.backgroundColor === "rgba(0, 0, 0, 0)") {
              issues.push("open dialog panel is transparent");
            }
            if (!panel.contains(document.activeElement)) issues.push("open dialog does not contain focus");
          }
          for (const menu of root.querySelectorAll('[role="menu"]')) {
            if (!visible(menu)) continue;
            const items = [...menu.querySelectorAll('[role^="menuitem"]')].filter(visible);
            if (!items.some((item) => item.tabIndex >= 0)) issues.push("open menu has no tabbable item");
          }
          if (root.scrollWidth > root.clientWidth + 1) {
            issues.push(`specimen horizontal overflow ${root.scrollWidth}>${root.clientWidth}`);
          }
          for (const control of root.querySelectorAll("button, a[href]")) {
            if (!visible(control) || control.disabled) continue;
            const rect = control.getBoundingClientRect();
            if (rect.width < 43.5 || rect.height < 43.5) {
              issues.push(`interactive target below 44px: ${Math.round(rect.width)}×${Math.round(rect.height)}`);
            }
            if (Number.parseFloat(getComputedStyle(control).fontSize) < 12.95) {
              issues.push(`interactive label below 13px: ${getComputedStyle(control).fontSize}`);
            }
          }
          return [...new Set(issues)];
        }"""
    )


def test_all_specimen_variants_and_states(page: Page) -> None:
    assert_route(page, "design-system", "design-system", "EIX Core Design System")
    component_routes = page.locator('[data-catalog-entry^="components:"]').evaluate_all(
        "(items) => items.map((item) => item.getAttribute('href'))"
    )
    require(len(component_routes) == 30, f"Expected 30 component specimen routes, received {len(component_routes)}")

    total_variants = 0
    total_states = 0
    for href in component_routes:
        page.goto(f"{BASE_URL}/{href}", wait_until="networkidle")
        page.wait_for_timeout(35)
        component_id = href.rsplit("/", 1)[-1]
        expect(page.locator(".ds-maturity")).to_contain_text("CANDIDATE CONTRACT")
        expect(page.locator(".sp-specimen")).to_have_attribute("data-specimen-component", component_id)

        variant_buttons = page.locator('[data-specimen-control="variant"]')
        state_buttons = page.locator('[data-specimen-control="state"]')
        require(variant_buttons.count() >= 1, f"{component_id} has no Variant controls")
        require(state_buttons.count() >= 1, f"{component_id} has no State controls")
        total_variants += variant_buttons.count()
        total_states += state_buttons.count()

        variant_preview_state = page.locator("[data-specimen-workbench]").get_attribute("data-variant-preview-state")
        if variant_preview_state:
            page.locator(
                f'[data-specimen-control="state"][data-specimen-value="{variant_preview_state}"]'
            ).click()

        variant_fingerprints: dict[str, list[str]] = {}
        for index in range(variant_buttons.count()):
            button = variant_buttons.nth(index)
            value = button.get_attribute("data-specimen-value")
            button.click()
            expect(page.locator(".sp-specimen")).to_have_attribute("data-preview-variant", value)
            require(page.locator("[data-specimen-markup]").inner_text().strip(), f"{component_id}/{value} markup empty")
            require(
                not specimen_contract_issues(page),
                f"{component_id}/{value} violates the specimen contract: {specimen_contract_issues(page)}",
            )
            fingerprint = specimen_fingerprint(page)
            variant_fingerprints.setdefault(fingerprint, []).append(value)
        require(
            len(variant_fingerprints) == variant_buttons.count(),
            f"{component_id} contains a no-op or duplicate Variant preview: {[values for values in variant_fingerprints.values() if len(values) > 1]}",
        )

        page.locator("[data-specimen-reset]").click()
        state_fingerprints: dict[str, list[str]] = {}
        for index in range(state_buttons.count()):
            button = state_buttons.nth(index)
            value = button.get_attribute("data-specimen-value")
            button.click()
            expect(page.locator(".sp-specimen")).to_have_attribute("data-preview-state", value)
            expect(page.locator("[data-specimen-state-output]")).to_be_visible()
            require(page.locator("[data-specimen-markup]").inner_text().strip(), f"{component_id}/{value} markup empty")
            page.wait_for_timeout(20)
            require(
                not specimen_contract_issues(page),
                f"{component_id}/{value} violates the specimen contract: {specimen_contract_issues(page)}",
            )
            fingerprint = specimen_fingerprint(page)
            state_fingerprints.setdefault(fingerprint, []).append(value)
        require(
            len(state_fingerprints) == state_buttons.count(),
            f"{component_id} contains a no-op or duplicate State preview: {[values for values in state_fingerprints.values() if len(values) > 1]}",
        )

        page.locator('[data-specimen-control="viewport"][data-specimen-value="390"]').click()
        expect(page.locator("[data-specimen-viewport]")).to_have_attribute("data-specimen-viewport", "390")
        page.locator("[data-specimen-reset]").click()
        expect(page.locator("[data-specimen-viewport]")).to_have_attribute("data-specimen-viewport", "auto")
        page.locator(".ds-specimen-workbench").screenshot(path=SPECIMEN_OUTPUT_DIR / f"{component_id}.png")

    require(total_variants == 84, f"Expected 84 live Variants, received {total_variants}")
    require(total_states == 102, f"Expected 102 live States, received {total_states}")


def test_catalog_route_coverage(page: Page) -> None:
    assert_route(page, "design-system", "design-system", "EIX Core Design System")
    routes = page.locator("[data-catalog-entry]").evaluate_all(
        "(items) => items.map((item) => item.getAttribute('href'))"
    )
    require(len(routes) == len(set(routes)) == 49, "Catalog routes must be unique")
    for href in routes:
        page.goto(f"{BASE_URL}/{href}", wait_until="networkidle")
        expect(page.locator('[data-route-view="design-system"]')).to_be_visible()
        expect(page.locator(".ds-detail-header h1")).to_be_visible()
        require(page.locator(".ds-load-error").count() == 0, f"Catalog route failed: {href}")
        require(page.locator(".ds-detail-header h1").count() == 1, f"Catalog route has no document heading: {href}")


def test_specimen_responsive_matrix(browser) -> None:
    for width, height in [(768, 900), (390, 844)]:
        page = browser.new_page(viewport={"width": width, "height": height}, reduced_motion="reduce")
        page.goto(f"{BASE_URL}/#/design-system", wait_until="networkidle")
        component_routes = page.locator('[data-catalog-entry^="components:"]').evaluate_all(
            "(items) => items.map((item) => item.getAttribute('href'))"
        )
        for href in component_routes:
            component_id = href.rsplit("/", 1)[-1]
            page.goto(f"{BASE_URL}/{href}", wait_until="networkidle")
            variants = page.locator('[data-specimen-control="variant"]').evaluate_all(
                "(items) => items.map((item) => item.dataset.specimenValue)"
            )
            states = page.locator('[data-specimen-control="state"]').evaluate_all(
                "(items) => items.map((item) => item.dataset.specimenValue)"
            )
            for variant in variants:
                page.locator(
                    f'[data-specimen-control="variant"][data-specimen-value="{variant}"]'
                ).evaluate("element => element.click()")
                for state in states:
                    page.locator(
                        f'[data-specimen-control="state"][data-specimen-value="{state}"]'
                    ).evaluate("element => element.click()")
                    page.wait_for_timeout(5)
                    dimensions = page.evaluate(
                        """() => {
                          const root = document.querySelector(".sp-specimen");
                          return {
                            viewport: innerWidth,
                            document: document.documentElement.scrollWidth,
                            specimenClient: root?.clientWidth || 0,
                            specimenScroll: root?.scrollWidth || 0
                          };
                        }"""
                    )
                    require(
                        dimensions["document"] <= dimensions["viewport"] + 1,
                        f"{component_id}/{variant}/{state}@{width} causes document overflow: {dimensions}",
                    )
                    require(
                        dimensions["specimenScroll"] <= dimensions["specimenClient"] + 1,
                        f"{component_id}/{variant}/{state}@{width} causes specimen overflow: {dimensions}",
                    )
        page.close()


def test_primary_route_responsive_matrix(browser) -> None:
    routes = [
        "brief",
        "architecture",
        "design-system",
        "guidance",
        "journeys",
        "acceptance",
    ]
    for width, height in [
        (2048, 1005),
        (1440, 900),
        (1280, 900),
        (1024, 900),
        (390, 844),
    ]:
        page = browser.new_page(
            viewport={"width": width, "height": height},
            reduced_motion="reduce",
        )
        errors: list[str] = []
        page.on("console", lambda message: errors.append(message.text) if message.type == "error" else None)
        page.on("pageerror", lambda error: errors.append(str(error)))
        for route in routes:
            page.goto(f"{BASE_URL}/#/{route}", wait_until="networkidle")
            page.wait_for_timeout(90)
            expect(page.locator(f'[data-route-view="{route}"]')).to_be_visible()
            layout = page.evaluate(
                """(route) => {
                  const measure = (element) => {
                    const rect = element.getBoundingClientRect();
                    return {
                      client: element.clientWidth,
                      scroll: element.scrollWidth,
                      left: rect.left,
                      right: rect.right
                    };
                  };
                  const main = document.querySelector(".main-content");
                  const view = document.querySelector(`[data-route-view="${route}"]`);
                  const trace = document.querySelector(".kernel-trace");
                  const traceRect = trace.getBoundingClientRect();
                  return {
                    viewport: innerWidth,
                    document: document.documentElement.scrollWidth,
                    body: document.body.scrollWidth,
                    main: measure(main),
                    view: measure(view),
                    traceVisible: getComputedStyle(trace).display !== "none"
                      && traceRect.height > 0,
                    traceHeight: getComputedStyle(document.documentElement)
                      .getPropertyValue("--active-trace-height").trim()
                  };
                }""",
                route,
            )
            require(
                layout["document"] <= layout["viewport"] + 1
                and layout["body"] <= layout["viewport"] + 1,
                f"{route}@{width} document overflow: {layout}",
            )
            for region in ("main", "view"):
                require(
                    layout[region]["scroll"] <= layout[region]["client"] + 1,
                    f"{route}@{width} {region} overflow: {layout[region]}",
                )
            if route == "architecture":
                require(layout["traceVisible"], f"Architecture Kernel Trace missing at {width}")
                require(
                    layout["traceHeight"] != "0px",
                    f"Architecture did not reserve Kernel Trace height at {width}",
                )
            else:
                require(
                    not layout["traceVisible"],
                    f"Kernel Trace leaked into {route}@{width}",
                )
                require(
                    layout["traceHeight"] == "0px",
                    f"{route}@{width} reserved hidden Kernel Trace space",
                )
        require(not errors, f"Primary route errors at {width}: {errors}")
        page.close()


def test_guidance_routing_and_contract(page: Page) -> None:
    assert_route(page, "guidance/process/P02", "guidance", "Intelligence UX Guidance")
    expect(page.locator("#guidanceRouteMeta")).to_contain_text("Process Intelligence")
    expect(page.locator('[data-pattern-filter="process"]')).to_have_attribute("aria-pressed", "true")
    expect(page.locator('[data-pattern-id="P02"]')).to_have_attribute("aria-selected", "true")
    expect(page.locator("#patternDetail")).to_contain_text("Rule Proposal & Change Approval")
    expect(page.locator("#patternDetail")).to_contain_text("审批前不得Active")
    expect(page.locator("#patternDetail .pattern-component-links a").first).to_be_visible()

    page.reload(wait_until="networkidle")
    expect(page.locator('[data-pattern-id="P02"]')).to_have_attribute("aria-selected", "true")

    page.locator('[data-pattern-filter="handoff"]').click()
    expect(page).to_have_url(f"{BASE_URL}/#/guidance/handoff")
    expect(page.locator("#guidanceRouteMeta")).to_contain_text("Cross-contract Handoff")
    require(page.locator("#patternList [data-pattern-id]").count() == 5, "Handoff collection is incomplete")

    page.locator('[data-pattern-id="S08"]').click()
    expect(page).to_have_url(f"{BASE_URL}/#/guidance/handoff/S08")
    expect(page.locator("#patternDetail")).to_contain_text("Outcome Receipt & Human Handoff")


def click_specimen(page: Page, specimen_id: str) -> None:
    page.locator(f'[data-specimen-id="{specimen_id}"]').click()
    expect(page.locator(f'[data-specimen-id="{specimen_id}"]')).to_have_attribute("aria-selected", "true")


def test_governance_specimens(page: Page) -> None:
    assert_route(page, "guidance", "guidance", "Intelligence UX Guidance")
    click_specimen(page, "evidence")
    page.locator('[data-evidence-action="toggle-stale"]').click()
    expect(page.locator(".gate-card")).to_contain_text("Invalidated")
    expect(page.locator('[data-evidence-action="publish"]')).to_be_disabled()
    page.locator('[data-evidence-action="toggle-stale"]').click()
    page.locator('[data-evidence-action="run-gate"]').click()
    require(
        "Workflow · Draft" in page.locator("#specimenInspector").inner_text(),
        "Passed Publication Gate incorrectly implied Published",
    )

    click_specimen(page, "action")
    page.locator('[data-action-demo="toggle-permission"]').click()
    expect(page.locator('[data-action-demo="advance"]')).to_be_disabled()
    page.locator('[data-action-demo="toggle-permission"]').click()
    for _ in range(3):
        page.locator('[data-action-demo="advance"]').click()
    expect(page.locator(".decision-meta")).to_contain_text("Approved")
    expect(page.locator(".status-message")).to_contain_text("尚未Queued或Executed")

    click_specimen(page, "rule")
    for _ in range(2):
        page.locator('[data-rule-action="advance"]').click()
    page.locator('[data-rule-action="reject"]').click()
    expect(page.locator(".status-message")).to_contain_text("没有Rule Active")
    expect(page.locator("#specimenInspector")).to_contain_text("Future Scope · No impact")


def test_markdown_reader(page: Page) -> None:
    for document_id, phrase in [
        ("charter", "EIX Core Design System"),
        ("design-system", "Token Architecture"),
        ("guidance", "Process Intelligence Guidance"),
        ("patterns", "迁移说明"),
    ]:
        page.goto(
            f"{BASE_URL}/#/document?doc={document_id}&from=design-system",
            wait_until="networkidle",
        )
        expect(page.locator("#documentContent")).to_have_attribute("aria-busy", "false")
        rendered = page.locator("#documentContent").inner_text()
        rendered_with_title = f"{page.locator('#documentTitle').inner_text()}\n{rendered}"
        require(phrase in rendered_with_title, f"Rendered Markdown is missing {phrase}: {document_id}")
        require("�" not in rendered and "锟" not in rendered, f"Markdown mojibake: {document_id}")
        require(page.locator("#documentToc a").count() >= 1, f"TOC missing: {document_id}")

    page.locator("#documentBack").click()
    expect(page).to_have_url(f"{BASE_URL}/#/design-system")


def test_viewports_and_capture(browser) -> None:
    captures = [
        (2048, 1005, "guidance", "guidance-library-2048.png"),
        (1440, 900, "design-system", "design-system-1440.png"),
        (1280, 900, "design-system/components/table", "component-table-1280.png"),
        (1024, 900, "guidance/process/P01", "guidance-process-1024.png"),
        (390, 844, "design-system/components/button", "component-button-390.png"),
        (390, 844, "guidance/collaborative/C03", "guidance-brief-390.png"),
    ]
    for width, height, route, filename in captures:
        page = browser.new_page(viewport={"width": width, "height": height})
        page.goto(f"{BASE_URL}/#/{route}", wait_until="networkidle")
        page.wait_for_timeout(240)
        assert_no_horizontal_overflow(page, f"{route}@{width}")
        page.screenshot(path=OUTPUT_DIR / filename, full_page=True)
        if width == 390:
            expect(page.locator("#menuButton")).to_be_visible()
            page.locator("#menuButton").click()
            expect(page.locator("#sidebar")).to_have_class("sidebar open")
            page.keyboard.press("Escape")
            expect(page.locator("#sidebar")).not_to_have_class("sidebar open")
            if route.startswith("design-system"):
                catalog_button = page.locator('[data-ds-mobile-panel="catalog"]')
                expect(catalog_button).to_be_visible()
                catalog_button.click()
                expect(catalog_button).to_have_attribute("aria-expanded", "true")
                expect(page.locator("#dsCatalogSearch")).to_be_focused()
                page.keyboard.press("Escape")
                expect(catalog_button).to_have_attribute("aria-expanded", "false")
                info_button = page.locator('[data-ds-mobile-panel="inspector"]')
                info_button.click()
                expect(info_button).to_have_attribute("aria-expanded", "true")
                page.keyboard.press("Escape")
        page.close()


def run() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    SPECIMEN_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    test_token_contract()
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True, executable_path=CHROME_PATH)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        errors: list[str] = []
        page.on("console", lambda message: errors.append(message.text) if message.type == "error" else None)
        page.on("pageerror", lambda error: errors.append(str(error)))

        test_primary_routes(page)
        test_reference_typography(page)
        test_design_system_overview_and_theme(page)
        test_catalog_continuous_browsing(page)
        test_component_contract_matrix(page, SPECIMEN_OUTPUT_DIR)
        test_primitive_visualization(page)
        test_guidance_visualization(page, SPECIMEN_OUTPUT_DIR)
        test_axis_independence_and_keyboard(page)
        test_catalog_route_coverage(page)
        test_guidance_routing_and_contract(page)
        test_governance_specimens(page)
        test_markdown_reader(page)
        require(not errors, f"Browser console/page errors: {errors}")

        page.close()
        test_contract_responsive(browser)
        test_primary_route_responsive_matrix(browser)
        test_viewports_and_capture(browser)
        browser.close()

    print("EIX 2.0 Rev 0.3 verification passed.")


if __name__ == "__main__":
    run()
