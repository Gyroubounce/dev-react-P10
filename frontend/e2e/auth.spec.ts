
import { test, expect } from '@playwright/test';

const e2eUser = {
  email: "e2e@example.com",
  password: "TestPassword123!"
};

  test.describe('Authentification complète', () => {
  
  test('Register → Login → Logout → Login avec erreur', async ({ page }) => {

    // === PARTIE 1 : INSCRIPTION ===
    await page.goto('/auth/register');

    await page.fill('input[name="email"]', e2eUser.email);
    await page.fill('input[name="password"]', e2eUser.password);

    await page.getByRole('button', { name: "S'inscrire" }).click();

    // 🔥 Après inscription → /auth/login
    await expect(page).toHaveURL('/auth/login');

    // === PARTIE 2 : LOGIN ===
    await page.fill('input[name="email"]', e2eUser.email);
    await page.fill('input[name="password"]', e2eUser.password);
    await page.click('button[type="submit"]:has-text("Se connecter")');

    await expect(page).toHaveURL('/dashboard');

    await expect(page.locator('[aria-label="Accéder à mon profil"]')).toBeVisible();

    // === PARTIE 3 : COMPLETER LE PROFIL ===

    // Aller sur la page Mon compte
    await page.click('[aria-label="Accéder à mon profil"]');
    await expect(page).toHaveURL('/dashboard/account');

    // Modifier prénom + nom
    await page.fill('#firstName', "Test");
    await page.fill('#lastName', "User");


    // Clic sur TON vrai bouton
    await page.click('button:has-text("Modifier les informations")');

    // Attendre la mise à jour
    await page.waitForTimeout(10);

    // Retour au dashboard via TON vrai bouton
    await page.click('a[href="/dashboard"]');
    await expect(page).toHaveURL('/dashboard');

    // Vérifier que le nom apparaît dans le dashboard
    const name = "Test User";
    await expect(
    page.locator(`text=Bonjour ${name}, voici un aperçu de vos projets et tâches.`)
    ).toBeVisible();


    // === PARTIE 4 : LOGOUT ===
    // Pas encore de bouton → navigation directe
    await page.goto('/auth/login');
    await expect(page).toHaveURL('/auth/login');

    // === PARTIE 5 : LOGIN AVEC MAUVAIS MOT DE PASSE ===
    await page.fill('input[name="email"]', e2eUser.email);
    await page.fill('input[name="password"]', 'MauvaisMotDePasse123!');
    await page.click('button[type="submit"]:has-text("Se connecter")');

    // Vérifier message d'erreur
    await expect(page.locator('text=/Identifiants incorrects|Erreur/i')).toBeVisible();

    // Vérifier qu'on reste sur la page login
    await expect(page).toHaveURL('/auth/login');

  });
});
