"use client";

import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { getInitials } from "@/lib/utils/initials";
import Button from "@/components/ui/Button";
import IAIcon from "@/components/ui/icons/IAIcon";
import type { Project, Task, User } from "@/types";

type ProjectHeaderProps = {
  project: Project;
  isOwner: boolean;

  onBack: () => void;
  onEditProject: () => void;
  onCreateTask: () => void;
  onCreateAITask: () => void;
};

export default function ProjectHeader({
  project,
  isOwner,
  onBack,
  onEditProject,
  onCreateTask,
  onCreateAITask,
}: ProjectHeaderProps) {
  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-14 h-14 flex items-center justify-center border border-system-neutral rounded-md bg-bg-content hover:border-brand-dark transition"
            aria-label="Retour aux projets"
          >
            <ArrowLeftIcon className="h-4 w-4 text-btn-black hover:text-brand-dark" />
          </button>

          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-3">
              <h1 className="font-semibold text-[24px] text-text-primary">
                {project.name}
              </h1>

              {isOwner && (
                <button
                  type="button"
                  onClick={onEditProject}
                  className="text-sm text-brand-dark underline hover:text-btn-black transition"
                >
                  modifier
                </button>
              )}
            </div>

            {project.description && (
              <p className="text-[18px] text-text-secondary">
                {project.description}
              </p>
            )}
          </div>
        </div>

        {/* Boutons Créer une tâche + IA */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="creer-tache"
            onClick={onCreateTask}
            ariaLabel="Créer une nouvelle tâche"
          >
            Créer une tâche
          </Button>

          <button
            type="button"
            onClick={onCreateAITask}
            className="flex items-center justify-center gap-1 w-23.5 h-12.5 bg-brand-dark text-text-white text-sm rounded-[10px] hover:bg-bg-content hover:text-brand-dark border border-brand-dark transition"
            aria-label="Générer des tâches avec l'IA"
          >
            <IAIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
            IA
          </button>
        </div>
      </div>

      {/* Contributeurs */}
      <section
        className="bg-bg-grey-light rounded-[10px] px-8 py-3"
        aria-labelledby="contributors-title"
      >
        <div className="flex items-center justify-between gap-4">
          <h2
            id="contributors-title"
            className="font-semibold text-text-primary text-lg"
          >
            Contributeurs{" "}
            <span className="text-base text-text-secondary ml-1">
              {(() => {
                const uniqueTaskContributors = new Set<string>();

                project.tasks?.forEach((task: Task) => {
                  task.assignees?.forEach((assignee) => {
                    if (assignee.user.id !== project.owner.id) {
                      uniqueTaskContributors.add(assignee.user.id);
                    }
                  });
                });

                return uniqueTaskContributors.size + 1;
              })()}{" "}
              personnes
            </span>
          </h2>

          <ul className="flex flex-row flex-wrap gap-3" aria-label="Liste des contributeurs">

            {/* Propriétaire */}
            <li className="flex items-center gap-2">
              <div className="w-6.75 h-6.75 rounded-full bg-brand-light flex items-center justify-center shrink-0">
                <span className="text-[10px] text-text-btn-black">
                  {getInitials(project.owner.name)}
                </span>
              </div>
              <span className="text-sm text-brand-dark bg-brand-light px-2 py-0.5 rounded-full">
                Propriétaire
              </span>
            </li>

            {/* Contributeurs uniques */}
            {(() => {
              const uniqueContributors: User[] = Array.from(
                new Map<string, User>(
                  project.tasks?.flatMap((task: Task) =>
                    task.assignees
                      ?.filter((a) => a.user.id !== project.owner.id)
                      .map((a) => [a.user.id, a.user]) || []
                  ) || []
                ).values()
              );

              return uniqueContributors.map((user: User) => (
                <li key={user.id} className="flex items-center gap-2">
                  <div className="w-6.75 h-6.75 rounded-full bg-bg-grey-border flex items-center justify-center shrink-0">
                    <span className="text-[10px] text-text-secondary">
                      {getInitials(user.name)}
                    </span>
                  </div>
                  <span className="text-sm text-text-secondary bg-bg-grey-border px-2 py-0.5 rounded-full">
                    {user.name}
                  </span>
                </li>
              ));
            })()}
          </ul>
        </div>
      </section>
    </div>
  );
}
