"""Public deployment smoke test for the EIX static reference site."""

from __future__ import annotations

import os

from playwright.sync_api import expect, sync_playwright


BASE_URL = os.environ.get("EIX_BASE_URL", "http://8.160.176.104/eix").rstrip("/")
CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
ROUTES = ["brief", "architecture", "design-system", "guidance", "journeys", "acceptance"]


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


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
        page.goto(f"{BASE_URL}/#/design-system/components/drawer", wait_until="networkidle")
        page.locator('[data-specimen-control="visibility"][data-specimen-value="open"]').click()
        expect(page.frame_locator("[data-specimen-frame]").locator("[data-sp-drawer]")).to_be_visible()

        page.goto(f"{BASE_URL}/#/document?doc=charter&from=brief", wait_until="networkidle")
        expect(page.locator("#documentTitle")).to_contain_text("Enterprise Intelligence")
        expect(page.locator(".markdown-body h2").first).to_contain_text("文档套件")
        require("�" not in page.locator(".markdown-body").inner_text(), "Markdown reader contains replacement characters")
        page.close()
        browser.close()

    require(not errors, f"Public deployment emitted console/page errors: {errors}")
    print(f"Public deployment verified: {BASE_URL}/")


if __name__ == "__main__":
    run()
