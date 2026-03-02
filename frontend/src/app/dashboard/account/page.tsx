"use client";

import { useAuth } from "@/hooks/useAuth";

export default function AccountPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div>
      <h1>Mon compte</h1>
      <p>Email : {user.email}</p>
      <p>Nom : {user.name}</p>
    </div>
  );
}
