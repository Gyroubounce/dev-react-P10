"use client";

import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { getInitials } from "@/lib/utils/initials";
import Button from "@/components/ui/Button";
import IAIcon from "@/components/ui/icons/IAIcon";
import type { Project, User } from "@/types";

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

  // 🔹 Propriétaire
  const owner = project.owner;

  // 🔹 Contributeurs EXACTEMENT comme MemberSearch
  const contributors: User[] = project.members.map((m) => m.user);

  // 🔥🔥🔥 AUDIT COMPLET DES DONNÉES 🔥🔥🔥
// 🔥🔥🔥 AUDIT COMPLET DU PROJET 🔥🔥🔥
console.group("🔍 AUDIT PROJECT HEADER");

// Projet
console.log("📌 Projet :", project.name, "(", project.id, ")");

// Owner
console.log("👤 Owner :", {
  id: owner.id,
  name: owner.name,
  email: owner.email,
});

// Contributeurs du projet
console.log("👥 Members du projet :", contributors.map((u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
})));

console.log("📊 Nombre de membres :", contributors.length);

// Tâches
console.log("📝 Nombre total de tâches :", project.tasks.length);

// Liste des tâches
console.log(
  "📄 Liste des tâches :",
  project.tasks.map((t) => ({
    id: t.id,
    title: t.title,
  }))
);

// Audit par tâche
project.tasks.forEach((task) => {
  console.group(`   ➤ Tâche : ${task.title} (${task.id})`);

  // Assignees
  const assignees = task.assignees.map((a) => ({
    id: a.user.id,
    name: a.user.name,
    email: a.user.email,
  }));

  console.log("   👤 Assignees :", assignees);
  console.log("   🔢 Nombre d’assignees :", assignees.length);

  // Vérification : owner ∈ assignees ?
  const ownerInAssignees = assignees.some((a) => a.id === owner.id);
  console.log(
    ownerInAssignees
      ? "   ✔ Owner est assigné à cette tâche"
      : "   ❌ Owner n'est PAS assigné à cette tâche"
  );

  // Vérification : assignees ∈ project.members ?
  const memberIds = contributors.map((u) => u.id);
  const invalidAssignees = assignees.filter(
    (a) => !memberIds.includes(a.id)
  );

  if (invalidAssignees.length > 0) {
    console.warn("   ⚠️ Assignees NON membres du projet :", invalidAssignees);
  } else {
    console.log("   ✔ Tous les assignees sont membres du projet");
  }

  console.groupEnd();
});


// 🔥🔥🔥 FIN AUDIT 🔥🔥🔥




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
              {contributors.length} personnes
            </span>
          </h2>

          <ul className="flex flex-row flex-wrap gap-3" aria-label="Liste des contributeurs">

            {contributors.map((user) => (
              <li key={user.id} className="flex items-center gap-2">

                {/* Avatar */}
                <div
                  className={`w-6.75 h-6.75 rounded-full flex items-center justify-center shrink-0 ${
                    user.id === owner.id ? "bg-brand-light" : "bg-bg-grey-border"
                  }`}
                >
                  <span
                    className={`text-[10px] ${
                      user.id === owner.id
                        ? "text-text-primary"
                        : "text-text-secondary"
                    }`}
                  >
                    {getInitials(user.name)}
                  </span>
                </div>

                {/* Label */}
                <span
                  className={`text-sm px-2 py-0.5 rounded-full ${
                    user.id === owner.id
                      ? "bg-brand-light text-brand-dark"
                      : "bg-bg-grey-border text-text-secondary"
                  }`}
                >
                  {user.id === owner.id ? "Propriétaire" : user.name}
                </span>

              </li>
            ))}

          </ul>
        </div>
      </section>
    </div>
  );
}
