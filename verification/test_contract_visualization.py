"""Contract-first visual verification for EIX Core and Intelligence UX Guidance."""

from __future__ import annotations

import os
from pathlib import Path

from playwright.sync_api import Browser, FrameLocator, Page, expect


BASE_URL = os.environ.get("EIX_BASE_URL", "http://127.0.0.1:4190").rstrip("/")


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def frame(page: Page) -> FrameLocator:
    return page.frame_locator("[data-specimen-frame]")


def open_component(page: Page, component_id: str) -> FrameLocator:
    page.goto(
        f"{BASE_URL}/#/design-system/components/{component_id}",
        wait_until="domcontentloaded",
    )
    page.wait_for_timeout(90)
    expect(page.locator("[data-specimen-frame]")).to_be_visible()
    specimen = frame(page)
    expect(specimen.locator(f'[data-specimen-component="{component_id}"]')).to_be_visible()
    return specimen


def specimen_contract_issues(specimen: FrameLocator) -> list[str]:
    return specimen.locator(".sp-specimen").evaluate(
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
            if (ids.filter((candidate) => candidate === id).length > 1) {
              issues.push(`duplicate id #${id}`);
            }
          }
          for (const element of root.querySelectorAll("[aria-controls], [aria-describedby], [aria-labelledby]")) {
            for (const attribute of ["aria-controls", "aria-describedby", "aria-labelledby"]) {
              const value = element.getAttribute(attribute);
              if (!value) continue;
              for (const id of value.split(/\\s+/)) {
                if (!root.querySelector(`#${CSS.escape(id)}`)) {
                  issues.push(`${attribute} references missing #${id}`);
                }
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
            if (visible(control) && !named) {
              issues.push(`${control.tagName.toLowerCase()} has no accessible label`);
            }
          }
          for (const hidden of root.querySelectorAll('[aria-hidden="true"]')) {
            const focusable = [...hidden.querySelectorAll("button, a[href], input, select, textarea, [tabindex]")]
              .some(visible);
            if (focusable) issues.push("aria-hidden region contains focusable content");
          }
          for (const panel of root.querySelectorAll('[role="dialog"]')) {
            if (!visible(panel)) continue;
            const style = getComputedStyle(panel);
            if (panel.getAttribute("aria-modal") !== "true") {
              issues.push("open dialog is missing aria-modal");
            }
            if (style.backgroundColor === "transparent" || style.backgroundColor === "rgba(0, 0, 0, 0)") {
              issues.push("open dialog panel is transparent");
            }
            if (!panel.contains(document.activeElement)) {
              issues.push("open dialog does not contain focus");
            }
          }
          for (const menu of root.querySelectorAll('[role="menu"]')) {
            if (!visible(menu)) continue;
            const items = [...menu.querySelectorAll('[role^="menuitem"]')].filter(visible);
            if (!items.some((item) => item.tabIndex >= 0 && !item.disabled)) {
              issues.push("open menu has no enabled tabbable item");
            }
          }
          if (root.scrollWidth > root.clientWidth + 1) {
            issues.push(`specimen horizontal overflow ${root.scrollWidth}>${root.clientWidth}`);
          }
          for (const control of root.querySelectorAll("button, a[href]")) {
            if (!visible(control)) continue;
            const style = getComputedStyle(control);
            const rect = control.getBoundingClientRect();
            if (Number.parseFloat(style.fontSize) < 12.95) {
              issues.push(`interactive label below 13px: ${style.fontSize}`);
            }
            if (!control.disabled && (rect.width < 43.5 || rect.height < 43.5)) {
              issues.push(`interactive target below 44px: ${Math.round(rect.width)}×${Math.round(rect.height)}`);
            }
          }
          return [...new Set(issues)];
        }"""
    )


def semantic_parity_issues(page: Page, specimen: FrameLocator) -> list[str]:
    live = specimen.locator(".sp-specimen").evaluate(
        """(root) => ({
          hasButton: Boolean(root.querySelector("button")),
          hasLink: Boolean(root.querySelector("a[href]")),
          hasInput: Boolean(root.querySelector("input, select, textarea")),
          hasTable: Boolean(root.querySelector("table")),
          hasDialog: Boolean(root.querySelector('[role="dialog"]:not([hidden])')),
          busy: Boolean(root.querySelector('[aria-busy="true"]')),
          invalid: Boolean(root.querySelector('[aria-invalid="true"]')),
          disabled: Boolean(root.querySelector("button:disabled, input:disabled, select:disabled, textarea:disabled")),
          selectedText: [...root.querySelectorAll('button[aria-selected="true"], button[aria-pressed="true"], [role="option"][aria-selected="true"], [role="menuitemradio"][aria-checked="true"]')]
            .map((item) => (item.querySelector("strong")?.textContent || item.textContent).trim())
            .filter(Boolean).slice(0, 3)
        })"""
    )
    markup = page.locator("[data-specimen-markup]").inner_text()
    signature = page.evaluate(
        """(markup) => {
          const doc = new DOMParser().parseFromString(markup, "text/html");
          return {
            hasButton: Boolean(doc.querySelector("button")),
            hasLink: Boolean(doc.querySelector("a[href]")),
            hasInput: Boolean(doc.querySelector("input, select, textarea")),
            hasTable: Boolean(doc.querySelector("table")),
            hasDialog: Boolean(doc.querySelector('[role="dialog"]')),
            busy: Boolean(doc.querySelector('[aria-busy="true"]')),
            invalid: Boolean(doc.querySelector('[aria-invalid="true"]')),
            disabled: Boolean(doc.querySelector("button:disabled, input:disabled, select:disabled, textarea:disabled")),
            text: doc.body.textContent || ""
          };
        }""",
        markup,
    )
    issues: list[str] = []
    for key in ["hasButton", "hasLink", "hasInput", "hasTable", "hasDialog", "busy", "invalid", "disabled"]:
        if live[key] and not signature[key]:
            issues.append(f"Reference Markup lost live semantic: {key}")
    for selected in live["selectedText"]:
        if selected and selected not in signature["text"]:
            issues.append(f'Reference Markup lost selected value: "{selected}"')
    return issues


def activate_option(page: Page, field: str, value: str) -> bool:
    """Activate a control option, finding a one-step legal prerequisite if needed."""
    reset = page.locator("[data-specimen-reset]")
    reset.click()
    target_selector = (
        f'[data-specimen-control="{field}"][data-specimen-value="{value}"]'
    )
    target = page.locator(target_selector)
    if target.is_enabled():
        target.click()
        return True

    candidates = page.locator(
        f'[data-specimen-control]:not([data-specimen-control="{field}"]):not([data-specimen-control="viewport"])'
    )
    for index in range(candidates.count()):
        reset.click()
        candidate = candidates.nth(index)
        if not candidate.is_enabled() or candidate.get_attribute("aria-pressed") == "true":
            continue
        candidate.click()
        if target.is_enabled():
            target.click()
            return True
    return False


def test_component_contract_matrix(page: Page, output_dir: Path) -> None:
    page.goto(f"{BASE_URL}/#/design-system", wait_until="domcontentloaded")
    component_ids = page.locator('[data-catalog-entry^="components:"]').evaluate_all(
        "(items) => items.map((item) => item.dataset.catalogEntry.split(':')[1])"
    )
    require(len(component_ids) == 34, f"Expected 34 components, received {len(component_ids)}")

    for component_id in component_ids:
        specimen = open_component(page, component_id)
        expect(page.locator(".ds-maturity")).to_contain_text("候选约定")
        controls = page.locator(
            '[data-specimen-control]:not([data-specimen-control="viewport"])'
        )
        require(controls.count() >= 1, f"{component_id} exposes no contract controls")
        options = controls.evaluate_all(
            """(items) => items.map((item) => ({
              field: item.dataset.specimenControl,
              value: item.dataset.specimenValue,
              label: item.textContent.trim()
            }))"""
        )
        seen = set()
        for option in options:
            key = (option["field"], option["value"])
            if key in seen:
                continue
            seen.add(key)
            reached = activate_option(page, option["field"], option["value"])
            require(reached, f"{component_id} cannot reach {option['field']}={option['value']}")
            page.wait_for_timeout(25)
            current = page.locator(
                f'[data-specimen-current="{option["field"]}"]'
            )
            expect(current).to_have_text(option["label"])
            markup = page.locator("[data-specimen-markup]").inner_text().strip()
            require(markup, f"{component_id}/{key} has empty Reference Markup")
            issues = specimen_contract_issues(specimen)
            require(not issues, f"{component_id}/{key} contract issues: {issues}")
            parity = semantic_parity_issues(page, specimen)
            require(not parity, f"{component_id}/{key} markup parity issues: {parity}")

        page.locator('[data-specimen-control="viewport"][data-specimen-value="390"]').click()
        page.wait_for_timeout(260)
        inner_width = specimen.locator("body").evaluate("() => window.innerWidth")
        require(
            388 <= inner_width <= 394,
            f"{component_id} responsive sandbox is not a real 390 viewport: {inner_width}",
        )
        page.locator("[data-specimen-reset]").click()
        page.locator(".ds-specimen-workbench").screenshot(
            path=output_dir / f"contract-{component_id}.png"
        )


def primitive_fingerprint(page: Page) -> str:
    return page.locator("[data-primitive-stage]").evaluate(
        """(root) => {
          const nodes = [root, ...root.querySelectorAll("*")].slice(0, 80);
          return JSON.stringify({
            html: root.innerHTML,
            visual: nodes.map((node) => {
              const style = getComputedStyle(node);
              return [
                node.tagName,
                style.display,
                style.gridTemplateColumns,
                style.justifyContent,
                style.gap,
                style.overflowX,
                style.overflowY,
                style.backgroundColor,
                style.color
              ];
            })
          });
        }"""
    )


def test_primitive_visualization(page: Page) -> None:
    page.goto(f"{BASE_URL}/#/design-system", wait_until="domcontentloaded")
    routes = page.locator('[data-catalog-entry^="primitives:"]').evaluate_all(
        "(items) => items.map((item) => item.getAttribute('href'))"
    )
    require(len(routes) == 9, f"Expected 9 Primitives, received {len(routes)}")
    for route in routes:
        page.goto(f"{BASE_URL}/{route}", wait_until="domcontentloaded")
        primitive_id = route.rsplit("/", 1)[-1]
        buttons = page.locator("[data-primitive-variant]")
        require(buttons.count() >= 2, f"{primitive_id} has no variant controls")
        fingerprints: dict[str, str] = {}
        for index in range(buttons.count()):
            button = buttons.nth(index)
            value = button.get_attribute("data-primitive-variant")
            visible_value = button.inner_text().strip()
            button.click()
            expect(page.locator("[data-primitive-current]")).to_have_text(visible_value)
            fingerprints[value] = primitive_fingerprint(page)
        require(
            len(set(fingerprints.values())) == len(fingerprints),
            f"{primitive_id} contains visually duplicated variants",
        )

    page.goto(f"{BASE_URL}/#/design-system/primitives/visually-hidden", wait_until="domcontentloaded")
    page.locator('[data-primitive-variant="live announcement"]').click()
    page.locator("[data-hidden-announce]").click()
    expect(page.locator("[data-hidden-visible]")).to_contain_text("检查完成")

    page.goto(f"{BASE_URL}/#/design-system/primitives/overlay-portal", wait_until="domcontentloaded")
    page.locator('[data-primitive-variant="modal"]').click()
    page.locator("[data-overlay-demo]").click()
    expect(page.locator('[data-overlay-panel][role="dialog"]')).to_be_visible()
    expect(page.locator("[data-overlay-close]")).to_be_focused()
    page.locator("[data-overlay-close]").click()
    expect(page.locator("[data-overlay-panel]")).to_be_hidden()


def test_guidance_visualization(page: Page, output_dir: Path) -> None:
    routes = {
        **{f"S{index:02d}": "shared" for index in range(1, 12)},
        **{f"P{index:02d}": "process" for index in range(1, 4)},
        **{f"C{index:02d}": "collaborative" for index in range(1, 4)},
    }
    require(len(routes) == 17, "Guidance coverage fixture is incomplete")
    fingerprints: dict[str, str] = {}
    for pattern_id, contract in routes.items():
        page.goto(
            f"{BASE_URL}/#/guidance/{contract}/{pattern_id}",
            wait_until="domcontentloaded",
        )
        expect(page.locator(".guidance-live-specimen")).to_be_visible()
        frame_root = page.locator(f".gx-{pattern_id.lower()}")
        expect(frame_root).to_be_visible()
        expect(frame_root).to_contain_text("模拟 · 不执行外部操作")
        expect(frame_root.locator(".gx-object-header")).to_contain_text(pattern_id)
        expect(frame_root.locator(".gx-recovery")).to_be_visible()
        state_buttons = page.locator("[data-guidance-state]")
        static_reference = page.locator(".guidance-static-state")
        require(
            state_buttons.count() >= 4 or static_reference.count() == 1,
            f"{pattern_id} exposes neither an explicit preview axis nor a truthful static reference",
        )
        if state_buttons.count() >= 4:
            axis_ids = list(
                dict.fromkeys(
                    state_buttons.nth(index).get_attribute("data-guidance-axis")
                    for index in range(state_buttons.count())
                )
            )
            for axis_id in axis_ids:
                axis_buttons = page.locator(
                    f'[data-guidance-state][data-guidance-axis="{axis_id}"]'
                )
                axis_outputs = []
                for index in range(axis_buttons.count()):
                    button = axis_buttons.nth(index)
                    state = button.get_attribute("data-guidance-state")
                    visible_state = button.inner_text().strip()
                    button.click()
                    expect(frame_root).to_contain_text(visible_state)
                    axis_outputs.append(frame_root.inner_text())
                require(
                    len(set(axis_outputs)) == len(axis_outputs),
                    f"{pattern_id} axis {axis_id} contains duplicated state visualization",
                )
        fingerprints[pattern_id] = frame_root.get_attribute("class") + frame_root.inner_text()
        frame_root.screenshot(path=output_dir / f"guidance-{pattern_id}.png")
    require(len(fingerprints) == 17, "Not every Guidance Pattern owns a reference")


def test_axis_independence_and_keyboard(page: Page) -> None:
    specimen = open_component(page, "switch")
    page.locator('[data-specimen-control="value"][data-specimen-value="off"]').click()
    page.locator('[data-specimen-control="interaction"][data-specimen-value="focus"]').click()
    expect(specimen.locator("[data-sp-switch]")).not_to_be_checked()
    expect(specimen.locator("[data-sp-switch]")).to_be_focused()

    specimen = open_component(page, "disclosure")
    page.locator('[data-specimen-control="expansion"][data-specimen-value="expanded"]').click()
    page.locator('[data-specimen-control="interaction"][data-specimen-value="focus"]').click()
    expect(specimen.locator("[data-sp-disclosure]")).to_have_attribute("aria-expanded", "true")
    expect(specimen.locator("[data-sp-disclosure]")).to_be_focused()

    specimen = open_component(page, "segmented-control")
    page.locator('[data-specimen-control="selection"][data-specimen-value="2"]').click()
    expect(specimen.locator(".sp-segment-result")).to_contain_text("对比")

    specimen = open_component(page, "menu")
    specimen.locator("[data-sp-menu-trigger]").focus()
    specimen.locator("[data-sp-menu-trigger]").press("ArrowDown")
    expect(specimen.locator("[data-sp-menu-item]").first).to_be_focused()
    specimen.locator("[data-sp-menu-item]").first.press("ArrowDown")
    expect(specimen.locator("[data-sp-menu-item]").nth(1)).to_be_focused()
    specimen.locator("[data-sp-menu-item]").nth(1).press("Escape")
    expect(specimen.locator("[data-sp-menu]")).to_be_hidden()
    expect(specimen.locator("[data-sp-menu-trigger]")).to_be_focused()

    specimen = open_component(page, "table")
    page.locator('[data-specimen-control="sortDirection"][data-specimen-value="descending"]').click()
    specimen.locator('[data-sp-table-row="样例 B"]').click()
    expect(specimen.locator("[aria-sort]")).to_have_attribute("aria-sort", "descending")
    expect(specimen.locator('[data-sp-table-row="样例 B"]')).to_have_attribute("aria-selected", "true")

    open_component(page, "card")
    page.locator('[data-specimen-control="variant"][data-specimen-value="plain"]').click()
    expect(page.locator('[data-specimen-control="state"][data-specimen-value="selected"]')).to_be_disabled()

    open_component(page, "callout")
    page.locator('[data-specimen-control="variant"][data-specimen-value="blocking"]').click()
    expect(page.locator('[data-specimen-control="state"][data-specimen-value="dismissible"]')).to_be_disabled()

    open_component(page, "select")
    expect(page.locator('[data-specimen-control="interaction"][data-specimen-value="open"]')).to_be_disabled()
    page.locator('[data-specimen-control="variant"][data-specimen-value="enhanced"]').click()
    expect(page.locator('[data-specimen-control="interaction"][data-specimen-value="open"]')).to_be_enabled()

    open_component(page, "checkbox")
    expect(page.locator('[data-specimen-control="value"][data-specimen-value="indeterminate"]')).to_be_disabled()
    page.locator('[data-specimen-control="variant"][data-specimen-value="parent group"]').click()
    expect(page.locator('[data-specimen-control="value"][data-specimen-value="indeterminate"]')).to_be_enabled()


def test_contract_responsive(browser: Browser) -> None:
    core_routes = [
        "design-system/components/application-shell",
        "design-system/components/table",
        "design-system/primitives/grid",
    ]
    for width, height in [(1024, 900), (390, 844)]:
        page = browser.new_page(
            viewport={"width": width, "height": height},
            reduced_motion="reduce",
        )
        for route in core_routes:
            page.goto(f"{BASE_URL}/#/{route}", wait_until="domcontentloaded")
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
                f"{route}@{width} document overflow: {dimensions}",
            )
        page.close()

    guidance_routes = [
        *[f"guidance/shared/S{index:02d}" for index in range(1, 12)],
        *[f"guidance/process/P{index:02d}" for index in range(1, 4)],
        *[f"guidance/collaborative/C{index:02d}" for index in range(1, 4)],
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
        for route in guidance_routes:
            page.goto(f"{BASE_URL}/#/{route}", wait_until="domcontentloaded")
            layout = page.evaluate(
                """() => {
                  const selectors = [
                    ".main-content",
                    ".pattern-hero",
                    ".pattern-library-layout",
                    ".pattern-detail",
                    ".guidance-live-specimen",
                    ".guidance-specimen-host",
                    ".gx-frame"
                  ];
                  const regions = Object.fromEntries(selectors.map((selector) => {
                    const element = document.querySelector(selector);
                    if (!element) return [selector, null];
                    const rect = element.getBoundingClientRect();
                    return [selector, {
                      left: rect.left,
                      right: rect.right,
                      client: element.clientWidth,
                      scroll: element.scrollWidth
                    }];
                  }));
                  const containment = [
                    [".pattern-library-layout", ".pattern-detail"],
                    [".pattern-detail", ".guidance-live-specimen"],
                    [".guidance-live-specimen", ".guidance-specimen-host"],
                    [".guidance-specimen-host", ".gx-frame"]
                  ].map(([parentSelector, childSelector]) => {
                    const parent = document.querySelector(parentSelector)?.getBoundingClientRect();
                    const child = document.querySelector(childSelector)?.getBoundingClientRect();
                    return {
                      parentSelector,
                      childSelector,
                      contained: Boolean(parent && child
                        && child.left >= parent.left - 1
                        && child.right <= parent.right + 1)
                    };
                  });
                  const heading = document.querySelector(".pattern-hero h1");
                  return {
                    viewport: innerWidth,
                    document: document.documentElement.scrollWidth,
                    body: document.body.scrollWidth,
                    headingSize: heading ? Number.parseFloat(getComputedStyle(heading).fontSize) : 0,
                    regions,
                    containment
                  };
                }"""
            )
            require(
                layout["document"] <= layout["viewport"] + 1
                and layout["body"] <= layout["viewport"] + 1,
                f"{route}@{width} document overflow: {layout}",
            )
            for selector, region in layout["regions"].items():
                require(region is not None, f"{route}@{width} missing {selector}")
                require(
                    region["scroll"] <= region["client"] + 1,
                    f"{route}@{width} internal overflow in {selector}: {region}",
                )
            require(
                all(item["contained"] for item in layout["containment"]),
                f"{route}@{width} crosses its layout contract: {layout['containment']}",
            )
            require(
                layout["headingSize"] <= 68.1,
                f"{route}@{width} restores the oversized Guidance heading: {layout['headingSize']}",
            )
        page.close()
