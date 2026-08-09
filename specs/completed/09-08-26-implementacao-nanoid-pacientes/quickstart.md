# Quickstart & Validation Guide: NanoID Patients

## Validation Scenarios

### Scenario 1: Patient Creation with NanoID and Record Code
1. Open the application (`npm run dev`).
2. Navigate to `/pacientes`.
3. Click **"+ Novo paciente"**.
4. Fill in patient details (Name: "Carlos Eduardo") and submit.
5. Verify the patient is created with a NanoID (e.g. `k8Xm2P9q`) and redirected to `/pacientes/k8Xm2P9q`.
6. Confirm the header displays **Carlos Eduardo** and badge **Prontuário P-0001** (or next sequential number).

### Scenario 2: Legacy ID Redirection
1. Enter URL with legacy ID format: `http://localhost:3000/pacientes/pat-17182938123-x9f2`.
2. Confirm the page loads the correct patient profile and the URL bar seamlessly updates to `http://localhost:3000/pacientes/[nanoid]`.

### Scenario 3: Automated Unit & Integration Tests
Run Vitest test suite:
```bash
npm run test
```
Confirm all tests pass clean.
