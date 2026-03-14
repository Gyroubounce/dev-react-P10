"use client";

import { useState } from "react";
import ContributorSearch from "@/components/ui/ContributorSearch";
import { getInitials } from "@/lib/utils/initials";
import type { User, ProjectMember } from "@/types/index";

type Props = {
  initialName?: string;
  initialDescription?: string;
  initialMembers?: ProjectMember[];

  projectContributors: User[];   // 🔹 contributeurs du projet (hors owner)
  totalContributors: number;     // 🔹 owner + contributeurs

  submitLabel: string;
  loading: boolean;
  error: string | null;
  onSubmit: (name: string, description: string) => Promise<void>;

  projectId?: string;
  onDelete: () => void;

  onAddContributor?: (user: User) => void;
  onRemoveContributor?: (userId: string) => void;
  selectedContributors?: User[];
  ownerId?: string;
};

export default function ProjectForm({
  initialName = "",
  initialDescription = "",
  initialMembers = [],
  projectContributors,
  totalContributors,
  submitLabel,
  loading,
  error,
  onSubmit,
  onDelete,
  projectId,
  onAddContributor,
  onRemoveContributor,
  selectedContributors = [],
  ownerId,
}: Props) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit(name, description);
  }

  // 🔹 Exclure les membres déjà dans le projet
  const excludeUserIds = initialMembers.map((m) => m.user.id);

  // 🔹 Propriétaire
  const ownerMember = initialMembers.find((m) => m.user.id === ownerId);
  const ownerName = ownerMember?.user.name ?? "";
  const ownerInitials = getInitials(ownerName);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div className="w-113 mx-auto overflow-y-auto flex flex-col gap-4 pr-1">

        {/* Titre */}
        <div className="flex flex-col gap-1">
          <label htmlFor="project-name" className="text-sm text-police-black">
            Titre <span aria-hidden="true">*</span>
          </label>
          <input
            id="project-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-13.25 px-4 py-2.5 text-sm text-police-black bg-bg-content transition"
            placeholder="Nom du projet"
            required
            autoFocus
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1">
          <label htmlFor="project-description" className="text-sm text-text-primary">
            Description
          </label>
          <textarea
            id="project-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="px-4 py-2.5 h-13.25 text-sm text-police-black bg-bg-content transition resize-none"
            placeholder="Description du projet"
          />
        </div>

        {/* Contributeurs actuels */}
        {onRemoveContributor && (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-text-primary">
              Contributeurs actuels ({totalContributors})
            </span>

            <div className="flex flex-wrap items-center gap-2">

              {/* Propriétaire */}
              {ownerMember && (
                <div className="flex items-center gap-1 px-2.5 rounded-full">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center bg-brand-light">
                    <span className="text-[10px] font-semibold text-btn-black">
                      {ownerInitials}
                    </span>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-light text-text-primary">
                    {ownerName}
                  </span>
                </div>
              )}

              {/* Contributeurs du projet */}
              {projectContributors.map((user) => (
                <div key={user.id} className="flex items-center gap-1 px-2.5 rounded-full">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center bg-bg-grey-border">
                    <span className="text-[10px] font-semibold text-text-secondary">
                      {getInitials(user.name)}
                    </span>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-bg-grey-border text-text-secondary">
                    {user.name}
                  </span>

                  <button
                    type="button"
                    onClick={() => onRemoveContributor(user.id)}
                    className="text-text-secondary mb-1 hover:text-brand-dark transition"
                    aria-label={`Retirer ${user.name}`}
                  >
                    ×
                  </button>
                </div>
              ))}

            </div>
          </div>
        )}

        {/* Recherche contributeurs */}
        {onAddContributor && onRemoveContributor && (
          <ContributorSearch
            selectedUsers={selectedContributors}
            excludeUserIds={excludeUserIds}
            onAdd={onAddContributor}
            onRemove={onRemoveContributor}
            label="Ajouter un contributeur"
            ownerId={ownerId}
            buttonLabel={
              totalContributors > 0
                ? `${totalContributors} collaborateur${totalContributors > 1 ? "s" : ""}`
                : "Choisir un ou plusieurs collaborateurs"
            }
          />
        )}

        {/* Erreur */}
        {error && (
          <p role="alert" aria-live="assertive" className="text-sm text-system-error">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-row justify-between mt-4">

          {/* Enregistrer */}
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-46.25 h-12.5 py-2.5 bg-system-neutral text-text-neutral text-base rounded-[10px] hover:border border-brand-dark hover:text-brand-dark hover:bg-bg-content transition"
          >
            {loading ? "En cours..." : submitLabel}
          </button>

          {/* Supprimer */}
          {onDelete && projectId && (
            <button
              type="button"
              className="text-text-error hover:text-red-700 text-sm"
              onClick={onDelete}
            >
              Supprimer le projet
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
