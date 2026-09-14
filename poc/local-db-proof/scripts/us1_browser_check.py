import json

from playwright.sync_api import sync_playwright


def main() -> None:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 900})
        page = context.new_page()
        page.goto("http://127.0.0.1:4173")
        page.wait_for_load_state("networkidle")

        page.locator("#initialize-db").click()
        page.wait_for_function(
            "document.querySelector('#status') && document.querySelector('#status').dataset.status === 'pass'",
            timeout=60_000,
        )
        initial_status = page.locator("#status").inner_text()
        report = json.loads(page.locator("#report").inner_text())

        page.locator("#reopen-db").click()
        page.wait_for_function(
            "document.querySelector('#status') && document.querySelector('#status').innerText.includes('Reabertura confirmada')",
            timeout=60_000,
        )
        reopened_status = page.locator("#status").inner_text()

        print(json.dumps({
            "initialStatus": initial_status,
            "reopenedStatus": reopened_status,
            "reportEntries": report["entries"],
        }, ensure_ascii=False))
        browser.close()


if __name__ == "__main__":
    main()
