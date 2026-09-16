import json
import re

from playwright.sync_api import sync_playwright


PROFILE_FILES = """
(() => {
  const store = { content: '' };
  const handle = (name) => ({
    name,
    async getFile() { return { text: async () => store.content }; },
    async requestPermission() { return 'granted'; },
    async createWritable() {
      return {
        async write(content) { store.content = content; },
        async close() {},
      };
    },
  });
  window.showOpenFilePicker = async () => [handle('layout-debug.nutridiet')];
  window.showSaveFilePicker = async () => handle('layout-debug.nutridiet');
})();
"""


def measure(page):
    return page.evaluate(
        """
        () => {
          const main = document.querySelector('main#main-content');
          const pageRoot = main?.firstElementChild;
          const rect = (element) => element ? {
            left: element.getBoundingClientRect().left,
            right: element.getBoundingClientRect().right,
            width: element.getBoundingClientRect().width,
          } : null;
          return {
            viewport: window.innerWidth,
            mainClientWidth: main?.clientWidth,
            mainOffsetWidth: main?.offsetWidth,
            mainScrollWidth: main?.scrollWidth,
            pageRoot: rect(pageRoot),
            pageRootScrollWidth: pageRoot?.scrollWidth,
          };
        }
        """
    )


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    page.set_default_timeout(120_000)
    page.set_default_navigation_timeout(120_000)
    page.add_init_script(PROFILE_FILES)
    page.goto("http://127.0.0.1:3201/home")
    page.wait_for_load_state("networkidle")

    page.get_by_role("button", name="Criar perfil").click()
    page.get_by_label("Nome", exact=True).fill("QA layout")
    page.get_by_label("Telefone", exact=True).fill("11999990000")
    page.get_by_role("button", name="Salvar profile").click()
    page.wait_for_timeout(2_000)
    print(json.dumps({"afterProfileUrl": page.url, "afterProfileText": page.locator("body").inner_text()[:500]}, ensure_ascii=False))
    page.wait_for_url(re.compile(r"/pacientes(?:$|/)"), timeout=10_000)

    page.get_by_role("button", name=re.compile("Cadastrar Primeiro Paciente|Novo paciente")).first.click()
    dialog = page.get_by_role("dialog", name="Cadastrar Novo Paciente")
    dialog.get_by_label("Nome Completo").fill("Paciente layout")
    dialog.get_by_label("WhatsApp").fill("11999990000")
    dialog.get_by_role("textbox", name="Data de nascimento").fill("01/01/1990")
    dialog.get_by_role("combobox", name="Gênero").click()
    page.get_by_role("option", name="Masculino", exact=True).click()
    dialog.get_by_role("button", name="Salvar Paciente").click()
    page.get_by_role("link", name="Ver perfil de Paciente layout").wait_for()
    patient_path = page.get_by_role("link", name="Ver perfil de Paciente layout").get_attribute("href")

    page.goto(f"http://127.0.0.1:3201{patient_path}/avaliacao/nova")
    page.wait_for_load_state("networkidle")
    page.get_by_role("heading", name="Nova Avaliação Antropométrica").wait_for()
    before = measure(page)
    page.get_by_role("tab", name="simplificada", exact=True).click()
    page.get_by_label("Altura", exact=True).wait_for()
    after = measure(page)
    print(json.dumps({"before": before, "after": after}, ensure_ascii=False))
    browser.close()
