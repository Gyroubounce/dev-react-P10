import { test, expect } from "@playwright/test";

test.describe("Projects — CRUD complet (UI réelle)", () => {

  test.beforeEach(async ({ page }) => {
  // 1. Connexion utilisateur
  await page.goto("/auth/login");

  await page.fill('input[name="email"]', "e2e@example.com");
  await page.fill('input[name="password"]', "TestPassword123!");

  await page.click('button[type="submit"]');

  // 2. Redirection réelle après login
   await expect(page).toHaveURL("/dashboard");

  // Navigation explicite vers la liste des projets
  await page.click('a:has-text("Projets")');
  await expect(page).toHaveURL("/dashboard/projects");
});


  test("Créer, afficher, modifier et supprimer un projet", async ({ page }) => {

    // --- 1) CRÉATION ---
    // Ouvre le modal de création
    await page.click('[aria-label="Créer un nouveau projet"]');

    // Remplit le formulaire
    await page.fill("#project-name", "Projet E2E");
    await page.fill("#project-description", "Description du projet E2E");

    // Soumet le formulaire
    await page.click('button[type="submit"]:has-text("Créer")');

    // IMPORTANT : pas de redirection → on reste sur /dashboard/projects
    await expect(page).toHaveURL("/dashboard/projects");

    // Vérifie que la ProjectCard apparaît
    const card = page.locator('[aria-label="Voir le projet Projet E2E"]');
    await expect(card).toBeVisible();

    // Vérifie les infos affichées dans la carte
    await expect(card.getByText("0/0 tâches terminées")).toBeVisible();
    await expect(card.getByText("Équipe (1)")).toBeVisible(); // owner seul

    // --- 2) NAVIGATION VERS LA PAGE PROJET ---
    await card.click();

    // Récupère l'ID du projet créé
    const projectId = page.url().split("/").pop();

    // Vérifie qu'on est bien sur la page du projet
    await expect(page).toHaveURL(/\/dashboard\/projects\/.+/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Projet E2E");

    // Vérifie la description
    await expect(page.getByText("Description du projet E2E")).toBeVisible();

    // --- 3) MODIFICATION ---
    // Ouvre le modal d'édition
    await page.click('button:has-text("Modifier")');

    // Modifie les champs
    await page.fill("#project-name", "Projet E2E Modifié");
    await page.fill("#project-description", "Nouvelle description");

    // Enregistre
    await page.click('button[type="submit"]:has-text("Enregistrer")');

    // Vérifie les changements
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Projet E2E Modifié");
    await expect(page.getByText("Nouvelle description")).toBeVisible();

    // --- 4) SUPPRESSION ---

    // 1. Ouvrir le modal d'édition
    await page.click('button:has-text("modifier"), button:has-text("Modifier")');

    // 2. Cliquer sur le bouton "Supprimer le projet" dans le formulaire
    await page.click('button:has-text("Supprimer le projet")');

   // 3. Attendre l’apparition du modal de confirmation
    const confirmModal = page.getByRole("dialog", { name: "Supprimer le projet" });
    await expect(confirmModal).toBeVisible();

    // 4. Cliquer sur le bouton "Confirmer"
    await confirmModal.getByRole("button", { name: "Confirmer" }).click();


    // 5. Vérifier la redirection
    await expect(page).toHaveURL("/dashboard/projects");

    // 6. Vérifier que la carte n'existe plus
    await expect(page.locator(`[href="/dashboard/projects/${projectId}"]`)).toHaveCount(0);

  });
});
