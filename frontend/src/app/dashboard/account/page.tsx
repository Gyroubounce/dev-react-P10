"use client";

import { useAuth } from "@/hooks/useAuth";
import AccountForm from "@/components/forms/AccountForm";

export default function AccountPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <p role="status" aria-live="polite" className="text-text-secondary text-sm">
        Chargement du profil...
      </p>
    );
  }

  return (
    <main
      className="min-h-screen bg-bg-dashboard py-12 px-4"
      aria-labelledby="account-title"
    >
      <div className="max-w-303.75 mx-auto bg-bg-content rounded-[8px] shadow-card p-10">

        <h1
          id="account-title"
          className="font-manrope text-2xl font-semibold text-text-primary mb-2"
        >
          Mon compte
        </h1>

        <div aria-label="Informations actuelles du compte" className="mb-8">
          <p className="text-sm text-text-secondary">{user.name}</p>
        </div>

        <AccountForm />

      </div>
    </main>
  );
}