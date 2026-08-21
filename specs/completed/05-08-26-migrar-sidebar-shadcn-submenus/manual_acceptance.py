import os

from playwright.sync_api import sync_playwright


BASE_URL = os.environ.get("BASE_URL", "http://127.0.0.1:3000")
ROUTES = [
    "/pacientes",
    "/presets",
    "/refeicoes-prontas",
    "/receitas",
    "/alimentos",
    "/design-system",
]


def rail_width(page):
    return round(page.locator('[data-sidebar="sidebar"]').bounding_box()["width"])


def open_route(page, route):
    page.goto(f"{BASE_URL}{route}", wait_until="commit")
    page.locator('[data-sidebar="provider"]').wait_for()
    page.wait_for_load_state("load")
    page.wait_for_timeout(250)


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 800})
    page.set_default_navigation_timeout(90000)

    open_route(page, "/pacientes")
    assert page.viewport_size["width"] >= 1024
    assert [link.get_attribute("href") for link in page.locator('nav[aria-label="Navegação principal"] a').all()] == ROUTES
    assert rail_width(page) == 224
    assert page.locator("main.flex-1.min-w-0.overflow-y-auto.h-screen").count() == 1

    page.get_by_role("button", name="Recolher Menu").click()
    page.wait_for_timeout(150)
    assert rail_width(page) == 64
    collapsed_links = page.locator('nav[aria-label="Navegação principal"] a')
    assert collapsed_links.count() == 6
    assert all(link.get_attribute("aria-label") for link in collapsed_links.all())
    assert page.get_by_role("button", name="Expandir Menu").count() == 1

    page.get_by_role("button", name="Expandir Menu").click()
    page.wait_for_timeout(150)
    assert rail_width(page) == 224

    open_route(page, "/presets")
    assert page.url.endswith("/presets")
    assert page.locator('a[aria-current="page"][href="/presets"]').count() == 1
    page.keyboard.press("Control+b")
    page.keyboard.press("Meta+b")
    page.wait_for_timeout(150)
    assert rail_width(page) == 224

    browser.close()

print("manual desktop acceptance passed: viewport=1280x800, routes=6, widths=224/64, collapsed labels=6, shortcut inactive, shell main scroll owner present")
