from pathlib import Path
import time
import os

from playwright.sync_api import TimeoutError as PlaywrightTimeoutError
from playwright.sync_api import sync_playwright


ROOT = Path(__file__).parent
EVIDENCE = ROOT / "evidence"
BASE_URL = os.environ.get("SIDEBAR_VALIDATION_BASE_URL", "http://127.0.0.1:3234").rstrip("/")


def wait_for_app(page):
    try:
        page.wait_for_load_state("networkidle", timeout=120_000)
    except PlaywrightTimeoutError:
        pass
    page.locator('[data-sidebar="sidebar"]').wait_for()


def rail_width(page):
    return round(page.locator('[data-sidebar="sidebar"]').bounding_box()["width"])


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1024, "height": 768})
    EVIDENCE.mkdir(exist_ok=True)
    time.sleep(5)

    page.goto(f"{BASE_URL}/pacientes", wait_until="domcontentloaded", timeout=120_000)
    wait_for_app(page)

    rail = page.locator('[data-sidebar="sidebar"]')
    skip_link = page.locator('a[href="#main-content"]')
    assert skip_link.inner_text() == "Pular para o conteúdo principal"
    page.keyboard.press("Tab")
    assert skip_link.evaluate("element => element === document.activeElement")
    page.keyboard.press("Enter")
    assert page.locator("#main-content").evaluate("element => element === document.activeElement")

    assert rail_width(page) == 224
    assert rail.evaluate("element => getComputedStyle(element).borderRightWidth") == "1px"

    nav_links = page.locator('nav[aria-label*="principal"] a')
    assert nav_links.count() == 6
    assert [nav_links.nth(index).get_attribute("href") for index in range(6)] == [
        "/pacientes",
        "/presets",
        "/refeicoes-prontas",
        "/receitas",
        "/alimentos",
        "/design-system",
    ]
    assert page.locator("#main-content").get_attribute("tabindex") == "-1"
    assert skip_link.count() == 1
    assert page.locator('nav[aria-label*="principal"] a').first.get_attribute("class").find("focus-visible:ring-2") >= 0
    page.screenshot(path=str(EVIDENCE / "sidebar-expanded.png"), full_page=True)

    collapse = page.get_by_role("button", name="Recolher Menu")
    collapse.focus()
    page.keyboard.press("Enter")
    page.wait_for_timeout(400)
    assert rail_width(page) == 64
    assert page.get_by_role("link", name="NutriDiet", exact=False).count() == 1
    assert page.get_by_role("link", name="Pacientes").count() == 1
    page.get_by_role("link", name="Pacientes").hover()
    page.get_by_role("tooltip", name="Pacientes").wait_for(timeout=5_000)
    page.screenshot(path=str(EVIDENCE / "sidebar-collapsed.png"), full_page=True)

    page.emulate_media(reduced_motion="reduce")
    expand = page.get_by_role("button", name="Expandir Menu")
    expand.focus()
    page.keyboard.press("Enter")
    page.wait_for_timeout(100)
    assert "motion-reduce:transition-none" in rail.get_attribute("class")
    assert "motion-reduce:duration-0" in rail.get_attribute("class")
    assert rail.evaluate("element => getComputedStyle(element).transitionDuration") == "0s"

    page.goto(f"{BASE_URL}/pacientes/123/dieta/1", wait_until="domcontentloaded", timeout=120_000)
    wait_for_app(page)
    assert page.locator('nav[aria-label*="principal"] a[href="/pacientes"]').get_attribute("aria-current") == "page"

    save = page.get_by_role("button", name="Salvar Arquivo Local")
    open_file = page.get_by_role("button", name="Abrir Arquivo .diet")
    assert save.is_disabled()
    assert open_file.is_disabled()
    assert page.locator("#sidebar-save-unavailable").inner_text() == "A ação Salvar ainda não está disponível nesta tela."
    assert page.locator("#sidebar-open-unavailable").inner_text() == "A ação Abrir ainda não está disponível nesta tela."
    assert page.get_by_role("button", name="Abrir menu de conta de Dr. Lucas").count() == 0

    response = page.goto(f"{BASE_URL}/rota-inexistente", wait_until="domcontentloaded", timeout=120_000)
    wait_for_app(page)
    assert response is not None and response.status == 404
    assert page.locator('nav[aria-label*="principal"] a[aria-current="page"]').count() == 0

    print("manual sidebar validation: PASS")
    print(f"expanded_width=224 collapsed_width=64 links=6 nested_current=page unknown_current=0")
    browser.close()
