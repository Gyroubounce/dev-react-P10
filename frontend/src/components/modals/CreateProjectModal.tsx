"use client";

import { useState } from "react";
import BaseModal from "@/components/modals/BaseModal";
import ProjectForm from "@/components/forms/ProjectForm";
import type { User } from "@/types/index";

type Props = {
  onClose: () => void;
  onSubmit: (name: string, description: string, contributors: User[]) => Promise<void>;
};

export default function CreateProjectModal({ onClose, onSubmit }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedContributors, setSelectedContributors] = useState<User[]>([]);

  async function handleSubmit(name: string, description: string) {
    setError(null);
    setLoading(true);
    try {
      await onSubmit(name, description, selectedContributors);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <BaseModal id="create-project-title" title="Créer un projet" onClose={onClose}>
      <ProjectForm
        submitLabel="Créer"
        loading={loading}
        error={error}
        onSubmit={handleSubmit}

        // 🔹 Pas de membres initiaux lors de la création
        initialMembers={[]}

        // 🔹 Aucun contributeur au début
        projectContributors={selectedContributors}

        // 🔹 Total = contributeurs sélectionnés + owner (owner sera ajouté après création)
        totalContributors={selectedContributors.length}

        // 🔹 Gestion des contributeurs
        selectedContributors={selectedContributors}
        onAddContributor={(user) =>
          setSelectedContributors((prev) => [...prev, user])
        }
        onRemoveContributor={(userId) =>
          setSelectedContributors((prev) => prev.filter((u) => u.id !== userId))
        }

        // 🔹 Pas de suppression de projet ici
        onDelete={() => {}}
      />
    </BaseModal>
  );
}
