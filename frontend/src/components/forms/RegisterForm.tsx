// src/components/forms/LoginForm.tsx
"use client";

export default function RegisterForm() {
  return (
    <form className="flex flex-col gap-4"
    aria-label="Formulaire d'inscription">

      {/* Email */}
      <div className="flex flex-col gap-1">
        <label 
        htmlFor="email"
        className="text-sm  text-text-secondary">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          aria-required="true"
          autoComplete="email"
          className="w-full h-12.5 px-3 py-2 border border-system-neutral rounded-md bg-white text-text-primary focus:ring-2 focus:ring-brand-dark"
          placeholder="exemple@mail.com"
        />
      </div>

      {/* Mot de passe */}
      <div className="flex flex-col gap-1">
        <label 
        htmlFor="password"
        className="text-sm  text-text-secondary">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          aria-required="true"
          autoComplete="current-password"
          className="w-full h-13.25 px-3 py-2 border border-system-neutral rounded-md bg-white text-text-primary focus:ring-2 focus:ring-brand-dark"
          placeholder="••••••••"
        />
      </div>

      {/* Bouton */}
      <button
        type="submit"
        className="
        w-62.25 h-12.5 mt-2 py-2 rounded-md text-sm
        bg-btn-black text-text-white
        border border-transparent
        transition-all
        hover:text-brand-dark hover:bg-bg-content hover:border-brand-dark
        focus:ring-2 focus:ring-brand-dark
      "
      >
        Se connecter
      </button>
    </form>
  );
}