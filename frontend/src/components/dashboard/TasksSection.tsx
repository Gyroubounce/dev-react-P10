"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useModal } from "@/hooks/useModal";
import TaskCardList from "@/components/dashboard/TaskCardList";
import KanbanColumn from "@/components/dashboard/KanbanColumn";
import CreateTaskModal from "@/components/modals/CreateTaskModal";
import type { TaskWithProject, Project, ProjectMember } from "@/types/index";
import { useTaskFilters } from "@/hooks/useTaskFilters";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const COLUMNS: { id: TaskWithProject["status"]; label: string }[] = [
  { id: "TODO", label: "À faire" },
  { id: "IN_PROGRESS", label: "En cours" },
  { id: "DONE", label: "Terminées" },
];

type Props = {
  tasks: TaskWithProject[];
  projects: Project[];
  loading: boolean;
  error: string | null;
  view: "list" | "kanban";
  onUpdateTaskStatus: (
    taskId: string,
    projectId: string,
    status: TaskWithProject["status"]
  ) => void;
  updateTask: (
    taskId: string,
    data: Partial<{
      title: string;
      description: string;
      dueDate: string;
      status: TaskWithProject["status"];
      priority: TaskWithProject["priority"];
      assigneeIds: string[];
    }>
  ) => Promise<void>;
};

export default function TasksSection({
  tasks,
  projects,
  loading,
  error,
  view,
  onUpdateTaskStatus,
  updateTask,
}: Props) {

  const [editingTask, setEditingTask] = useState<TaskWithProject | null>(null);
  const { isOpen, openModal, closeModal } = useModal();

  const {
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    filterPriority,
    setFilterPriority,
    filteredTasks,
  } = useTaskFilters(tasks);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const task = tasks.find((t) => t.id === active.id);
    if (!task) return;

    const overTask = tasks.find((t) => t.id === over.id);
    const newStatus = overTask
      ? overTask.status
      : (over.id as TaskWithProject["status"]);

    if (task.status !== newStatus) {
      onUpdateTaskStatus(task.id, task.projectId, newStatus);
    }
  }

  function handleEdit(task: TaskWithProject) {
    setEditingTask(task);
    openModal("editTask");
  }

  // Récupérer le projet de la tâche en cours d'édition
  const editingTaskProject = projects.find((p) => p.id === editingTask?.projectId);
  const editingTaskMembers: ProjectMember[] = editingTaskProject?.members ?? [];
  const editingTaskOwnerId = editingTaskProject?.owner?.id;

  return (
    <section aria-labelledby="tasks-title">
      <div className="bg-bg-content rounded-[8px] shadow-card px-6 py-5 flex flex-col gap-6">

        {/* En-tête */}
        <div className="flex items-center justify-between flex-wrap gap-3 my-3">
          <div className="flex flex-col gap-0.5">
            <h2 id="tasks-title" className="text-[18px] font-semibold text-text-primary">
              Mes tâches assignées
            </h2>
            <p className="text-[16px] text-text-secondary">Par ordre de priorité</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="text-sm border border-system-neutral rounded-[8px] px-3 py-2 bg-bg-content text-text-primary transition"
              aria-label="Filtrer par statut"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="TODO">À faire</option>
              <option value="IN_PROGRESS">En cours</option>
              <option value="DONE">Terminées</option>
              <option value="CANCELLED">Annulées</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as typeof filterPriority)}
              className="text-sm border border-system-neutral rounded-[8px] px-3 py-2 bg-bg-content text-text-primary transition"
              aria-label="Filtrer par priorité"
            >
              <option value="ALL">Toutes les priorités</option>
              <option value="URGENT">Urgente</option>
              <option value="HIGH">Haute</option>
              <option value="MEDIUM">Moyenne</option>
              <option value="LOW">Basse</option>
            </select>

            <div className="relative">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher une tâche"
                className="pl-4 pr-4 py-2 text-sm border border-system-neutral rounded-[8px] bg-bg-content text-text-primary w-56 transition"
                aria-label="Rechercher une tâche"
              />
              <MagnifyingGlassIcon
                className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-secondary pointer-events-none"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

        {/* États */}
        {loading && (
          <p role="status" aria-live="polite" className="text-sm text-text-secondary py-4">
            Chargement des tâches...
          </p>
        )}

        {!loading && error && (
          <p role="alert" aria-live="assertive" className="text-sm text-system-error py-4">
            {error}
          </p>
        )}

        {!loading && !error && filteredTasks.length === 0 && (
          <p className="text-sm text-text-secondary py-4">
            Aucune tâche assignée pour le moment.
          </p>
        )}

        {/* Vue Liste */}
        {!loading && !error && view === "list" && filteredTasks.length > 0 && (
          <div className="flex flex-col gap-3" role="list" aria-label="Liste des tâches">
            {filteredTasks.map((task) => {
              const taskProject = projects.find((p) => p.id === task.projectId);
              const taskOwnerId = taskProject?.owner?.id;

              return (
                <div key={task.id} role="listitem">
                  <TaskCardList
                    task={task}
                    ownerId={taskOwnerId}
                    onEdit={handleEdit}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Vue Kanban */}
        {!loading && !error && view === "kanban" && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 items-start mt-4 pb-4" role="region" aria-label="Vue Kanban">
              {COLUMNS.map((col) => (
                <KanbanColumn
                  key={col.id}
                  id={col.id}
                  title={col.label}
                  tasks={filteredTasks.filter((t) => t.status === col.id)}
                  projects={projects}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          </DndContext>
        )}

      </div>

      {/* Modale modifier tâche */}
      {isOpen("editTask") && editingTask && (
        <CreateTaskModal
          members={editingTaskMembers}
          initialTask={editingTask}
          ownerId={editingTaskOwnerId}
          onClose={() => {
            closeModal();
            setEditingTask(null);
          }}
          onSubmit={async (title, description, dueDate, assigneeIds, status, priority) => {
            await updateTask(editingTask.id, {
              title,
              description,
              dueDate,
              assigneeIds,
              status,
              priority,
            });

            closeModal();
            setEditingTask(null);
          }}
        />
      )}

    </section>
  );
}
