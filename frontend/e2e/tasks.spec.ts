import { test, expect } from "@playwright/test";

const e2eUser = {
  email: "e2e@example.com",
  password: "TestPassword123!"
};

test.describe("Tasks — CRUD complet", () => {

  test.beforeEach(async ({ page }) => {
    // 1. Connexion
    await page.goto("/auth/login");
    await page.fill('input[name="email"]', e2eUser.email);
    await page.fill('input[name="password"]', e2eUser.password);
    await page.getByRole("button", { name: "Se connecter", exact: true }).click();

    await expect(page).toHaveURL("/dashboard");

    // 🔥 2. Nettoyage des projets existants via API
    const res = await page.request.get("http://localhost:8000/projects");
    const { data: projects } = await res.json();

    for (const project of projects) {
        await page.request.delete(`http://localhost:8000/projects/${project.id}`);
    }

    // 3. Aller sur Projets
    await page.getByRole("link", { name: "Projets" }).click();
    await expect(page).toHaveURL("/dashboard/projects");

    // 4. Créer un projet de test
    await page.getByRole("button", { name: "Créer un nouveau projet" }).click();
    await page.fill("#project-name", "Projet Test Tâches");
    await page.fill("#project-description", "Pour tester les tâches");

    await page
        .getByRole("dialog", { name: "Créer un projet" })
        .getByRole("button", { name: "+ Créer le projet" })
        .click();

    // Attendre la redirection vers /dashboard/projects
    await expect(page).toHaveURL("/dashboard/projects");



    // Récupérer l'ID du projet créé en inspectant le lien le plus récent
    const firstProjectLink = page.locator('a[aria-label^="Voir le projet Projet Test Tâches"]').first();
    const projectUrl = await firstProjectLink.getAttribute("href");
    const projectId = projectUrl?.split("/").pop();

    // Ouvrir le projet via son ID
    await page.goto(`/dashboard/projects/${projectId}`);


  });

  // -------------------------------------------------------------
  // CRÉATION
  // -------------------------------------------------------------
  test("Créer une tâche", async ({ page }) => {
    await expect(page.getByText("Aucune tâche pour le moment.")).toBeVisible();

   // Ouvrir la modale
    await page.getByRole("button", { name: "Créer une nouvelle tâche" }).click();

    // Remplir les champs
    await page.fill("#task-title", "Ma première tâche");
    await page.fill("#task-description", "Description de la tâche");

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const formatted = tomorrow.toISOString().split("T")[0];

    await page.fill("#task-due-date", formatted);


    // --- ASSIGNATION (nouvelle version ARIA) ---
    await page.getByRole("combobox", { name: "Assigné à" }).click();
    await page.getByRole("listbox").getByRole("option").first().click();

    // --- STATUT ---
    await page.getByRole("group", { name: "Statut de la tâche" })
    .getByRole("button", { name: "À faire" })
    .click();

    // Vérifier que le statut est bien activé
    const todoBtn = page.getByRole("button", { name: "À faire" });

    await todoBtn.click();

    await expect(todoBtn).toHaveClass(/bg-system-info/);


    // Soumettre
    await page.getByRole("button", { name: "+ Ajouter une tâche" }).click();

    // Vérifier
    await expect(page.getByText("Ma première tâche")).toBeVisible();

    });

  // -------------------------------------------------------------
  // MODIFICATION
  // -------------------------------------------------------------
  test("Modifier une tâche", async ({ page }) => {
    // Créer une tâche
    await page.getByRole("button", { name: "Créer une tâche" }).click();
    await page.fill("#task-title", "Tâche à modifier");
    await page.fill("#task-description", "Description initiale");

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.fill("#task-due-date", tomorrow.toISOString().split("T")[0]);

    await page.getByRole("button", { name: "À faire" }).click();
    await page.getByRole("button", { name: "Créer une tâche" }).click();

    const taskCard = page.locator('article:has-text("Tâche à modifier")');
    await expect(taskCard).toBeVisible();

    // Modifier
    await taskCard.getByRole("button", { name: /Modifier/i }).click();
    await expect(page.getByRole("dialog", { name: "Modifier une tâche" })).toBeVisible();

    await page.fill("#task-title", "Tâche modifiée");
    await page.fill("#task-description", "Nouvelle description");

    await page.getByRole("button", { name: "En cours" }).click();

    await page.getByRole("button", { name: "Enregistrer" }).click();

    await expect(page.getByText("Tâche modifiée")).toBeVisible();
    await expect(page.getByText("En cours")).toBeVisible();
  });

  // -------------------------------------------------------------
  // CHANGEMENT DE STATUT
  // -------------------------------------------------------------
  test("Changer le statut d'une tâche", async ({ page }) => {
    await page.getByRole("button", { name: "Créer une tâche" }).click();
    await page.fill("#task-title", "Tâche à compléter");
    await page.fill("#task-description", "Description");

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.fill("#task-due-date", tomorrow.toISOString().split("T")[0]);

    await page.getByRole("button", { name: "À faire" }).click();
    await page.getByRole("button", { name: "Créer une tâche" }).click();

    const taskCard = page.locator('article:has-text("Tâche à compléter")');
    await expect(taskCard.getByText("À faire")).toBeVisible();

    await taskCard.getByRole("button", { name: /Modifier/i }).click();
    await page.getByRole("button", { name: "Terminée" }).click();
    await page.getByRole("button", { name: "Enregistrer" }).click();

    await expect(taskCard.getByText("Terminée")).toBeVisible();
    await expect(page.getByText("1/1 tâche terminée")).toBeVisible();
  });

  // -------------------------------------------------------------
  // ASSIGNATION
  // -------------------------------------------------------------
  test("Assigner une tâche à un utilisateur", async ({ page }) => {
    await page.getByRole("button", { name: "Créer une tâche" }).click();
    await page.fill("#task-title", "Tâche assignée");
    await page.fill("#task-description", "Description");

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.fill("#task-due-date", tomorrow.toISOString().split("T")[0]);

    await page.getByRole("button", { name: "À faire" }).click();

    await page.getByRole("button", { name: "Choisir un ou plusieurs collaborateurs" }).click();

    await page.locator('div[role="group"] button').first().click();

    await page.getByRole("button", { name: "Créer une tâche" }).click();

    await expect(page.getByText("Tâche assignée")).toBeVisible();
  });

  // -------------------------------------------------------------
  // SUPPRESSION
  // -------------------------------------------------------------
  test("Supprimer une tâche", async ({ page }) => {
    await page.getByRole("button", { name: "Créer une tâche" }).click();
    await page.fill("#task-title", "Tâche à supprimer");
    await page.fill("#task-description", "Description");

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.fill("#task-due-date", tomorrow.toISOString().split("T")[0]);

    await page.getByRole("button", { name: "À faire" }).click();
    await page.getByRole("button", { name: "Créer une tâche" }).click();

    const taskCard = page.locator('article:has-text("Tâche à supprimer")');
    await expect(taskCard).toBeVisible();

    await taskCard.getByRole("button", { name: /Supprimer/i }).click();

    const confirmDialog = page.getByRole("dialog", { name: "Supprimer la tâche" });
    await expect(confirmDialog).toBeVisible();

    await confirmDialog.getByRole("button", { name: "Confirmer" }).click();

    await expect(page.getByText("Tâche à supprimer")).toHaveCount(0);
    await expect(page.getByText("Aucune tâche pour le moment.")).toBeVisible();
  });
});
