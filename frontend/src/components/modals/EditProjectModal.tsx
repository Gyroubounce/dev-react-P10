"use client";

import { useState } from "react";
import BaseModal from "@/components/modals/BaseModal";
import ProjectForm from "@/components/forms/ProjectForm";
import ModalProjectDelete from "@/components/modals/ModalProjectDelete";
import type { ProjectMember, User } from "@/types/index";

type Props = {
  projectId: string;
  initialName: string;
  initialDescription: string;
  initialMembers: ProjectMember[];
  ownerId: string; // 
  uniqueContributors: User[];
  totalContributors: number;
  onClose: () => void;
  onSubmit: (name: string, description: string) => Promise<void>;
  onAddContributor: (email: string) => Promise<void>;
  onRemoveContributor: (userId: string) => Promise<void>;
  onDelete: (projectId: string) => Promise<void>;
};

export default function EditProjectModal({
  projectId,
  initialName,
  initialDescription,
  initialMembers,
  ownerId,
  uniqueContributors,
  totalContributors,
  onClose,
  onSubmit,
  onAddContributor,
  onRemoveContributor,
  onDelete,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedContributors, setSelectedContributors] = useState<User[]>([]);
  const [deleteOpen, setDeleteOpen] = useState(false);

  async function handleSubmit(name: string, description: string) {
    setError(null);
    setLoading(true);
    try {
      await onSubmit(name, description);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  // ✅ Reçoit un User complet
  async function handleAddContributor(user: User) {
    try {
      await onAddContributor(user.email);
      setSelectedContributors((prev) => [...prev, user]);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    }
  }

  // ✅ Retire aussi du state local
  async function handleRemoveContributor(userId: string) {
    try {
      await onRemoveContributor(userId);
      setSelectedContributors((prev) => prev.filter((u) => u.id !== userId));
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    }
  }


  return (
    <BaseModal id="edit-project-title" title="Modifier un projet" onClose={onClose}>
      <ProjectForm
        initialName={initialName}
        initialDescription={initialDescription}
        initialMembers={initialMembers}
        uniqueContributors={uniqueContributors}
        totalContributors={totalContributors}
        submitLabel="Enregistrer"
        loading={loading}
        error={error}
        onSubmit={handleSubmit}
        onAddContributor={handleAddContributor}
        onRemoveContributor={handleRemoveContributor}
        selectedContributors={selectedContributors}
        ownerId={ownerId}
        projectId={projectId}
        onDelete={() => setDeleteOpen(true)}
      />

         {deleteOpen && (
        <ModalProjectDelete
          onClose={() => setDeleteOpen(false)}
          onConfirm={async () => {
            await onDelete(projectId);
            onClose();
          }}
        />
      )}
    </BaseModal>
  );
}