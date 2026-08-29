import json
import time

from playwright.sync_api import expect, sync_playwright


BASE_URL = "http://127.0.0.1:3234"
PATIENT_ID = "manual-variation-patient"
DIET_ID = "manual-variation-diet"


def build_seed():
    item = {
        "id": "manual-item-1",
        "foodId": "food-oatmeal",
        "name": "Aveia",
        "quantityGrams": 50,
        "protein": 7,
        "carbs": 33,
        "fats": 4,
        "kcal": 196,
    }
    meal = {
        "id": "manual-meal-breakfast",
        "name": "Café da manhã",
        "time": "08:00",
        "items": [item],
    }
    patient = {
        "id": PATIENT_ID,
        "code": "P-9999",
        "name": "Paciente Manual",
        "initials": "PM",
        "gender": "Outro",
        "age": 30,
        "heightCm": 170,
        "weightKg": 70,
        "objective": "Manutenção",
        "targetKcal": 2000,
        "targetProtein": 140,
        "targetCarbs": 220,
        "targetFats": 60,
        "lastConsultation": "29/08/2026",
        "nextEvent": None,
        "lastActivity": None,
    }
    diet = {
        "id": DIET_ID,
        "patientId": PATIENT_ID,
        "name": "Dieta manual de variações",
        "createdAt": "29/08/2026",
        "updatedAt": "29/08/2026",
        "mode": "simple",
        "simpleTargetKcal": 2000,
        "simpleTargetProtein": 140,
        "simpleTargetCarbs": 220,
        "simpleTargetFats": 60,
        "simpleMeals": [meal],
        "carbCyclingVariations": [],
    }
    return patient, diet


def main():
    patient, diet = build_seed()
    seed_script = f"""
        localStorage.clear();
        localStorage.setItem('nutridiet_patients', {json.dumps(json.dumps([patient]))});
        localStorage.setItem('nutridiet_diets_{PATIENT_ID}', {json.dumps(json.dumps([diet]))});
    """

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 900})
        page.add_init_script(seed_script)
        page.goto(f"{BASE_URL}/pacientes/{PATIENT_ID}/dieta/{DIET_ID}", wait_until="networkidle")

        title = page.get_by_role("textbox", name="Nome da refeição")
        expect(title).to_have_value("Café da manhã")
        variation_tablist = page.get_by_role("tablist", name="Variações da refeição")
        expect(variation_tablist).to_have_count(0)

        add_button = page.get_by_role("button", name="Adicionar variação")
        add_button.click()
        expect(variation_tablist).to_have_count(1)
        expect(page.get_by_role("tab", name="Variação 2")).to_have_attribute("aria-selected", "true")

        for expected_count in (3, 4, 5):
            add_button.click()
            expect(variation_tablist.get_by_role("tab")).to_have_count(expected_count)
            expect(page.get_by_role("tab", name=f"Variação {expected_count}")).to_have_attribute("aria-selected", "true")

        expect(add_button).to_be_disabled()
        expect(page.get_by_text("Limite de 5 variações atingido")).to_have_count(1)

        quantity = page.get_by_role("spinbutton", name="Quantidade em gramas para Aveia")
        quantity.fill("100")
        quantity.press("Tab")
        expect(quantity).to_have_value("100")
        page.get_by_role("tab", name="Variação 1").click()
        expect(quantity).to_have_value("50")

        timings = []
        for expected_label in ("Variação 1", "Variação 3", "Variação 5"):
            started = time.perf_counter()
            page.get_by_role("tab", name=expected_label).click()
            expect(page.get_by_role("tab", name=expected_label)).to_have_attribute("aria-selected", "true")
            timings.append((time.perf_counter() - started) * 1000)

        page.get_by_role("button", name="Excluir Variação 5").click()
        expect(variation_tablist.get_by_role("tab")).to_have_count(4)
        expect(page.get_by_role("tab", name="Variação 4")).to_have_attribute("aria-selected", "true")

        for remaining in (3, 2, 1):
            page.get_by_role("button", name=f"Excluir Variação {remaining + 1}").click()
            if remaining > 1:
                expect(variation_tablist.get_by_role("tab")).to_have_count(remaining)
            else:
                expect(variation_tablist).to_have_count(0)
        expect(variation_tablist).to_have_count(0)

        add_button.click()
        title.fill("Café reforçado")
        title.press("Tab")
        time_input = page.get_by_role("textbox", name="Horário da refeição")
        time_input.fill("09:30")
        time_input.press("Tab")
        page.get_by_role("tab", name="Variação 1").click()
        expect(title).to_have_value("Café reforçado")
        expect(time_input).to_have_value("09:30")

        page.get_by_role("button", name="Duplicar").click()
        expect(page.get_by_role("textbox", name="Nome da refeição")).to_have_count(2)
        expect(variation_tablist).to_have_count(2)

        first_tab = page.get_by_role("tab", name="Variação 1").first
        last_tab = page.get_by_role("tab", name="Variação 2").first
        first_tab.focus()
        page.keyboard.press("End")
        expect(last_tab).to_be_focused()
        page.keyboard.press("Enter")
        expect(first_tab).to_have_attribute("aria-selected", "false")
        expect(last_tab).to_have_attribute("aria-selected", "true")

        print(json.dumps({
            "single_option_unchanged": True,
            "created_and_opened": True,
            "active_option_editing_isolated": True,
            "limit_blocked": True,
            "delete_renumbered_and_collapsed": True,
            "shared_identity": True,
            "group_duplication": True,
            "keyboard_activation": True,
            "tab_switch_ms": [round(value, 2) for value in timings],
            "tab_switch_under_500ms": all(value < 500 for value in timings),
        }, ensure_ascii=False))
        browser.close()


if __name__ == "__main__":
    main()
