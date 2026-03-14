"use client";

import { useState, useCallback } from "react";
import {
  fetchProject as apiFetchProject,
  fetchProjectTasks,
  updateProject as apiUpdateProject,
  addContributor as apiAddContributor,
  removeContributor as apiRemoveContributor,
} from "@/lib/api/projects";

import {
  createTask as apiCreateTask,
  updateTask as apiUpdateTask,
  deleteTask as apiDeleteTask,
} from "@/lib/api/tasks";

import type { Project, Task, ProjectMember } from "@/types/index";

export type ProjectDetail = Project & {
  tasks: Task[];
};

// ---------------------------------------------------------
// 🔥 1) OWNER TOUJOURS DANS LES MEMBERS
// ---------------------------------------------------------
function ensureOwnerInMembers(project: Project): ProjectMember[] {
  const owner = project.owner;
  const members = project.members ?? [];

  const hasOwner = members.some((m) => m.user.id === owner.id);
  if (hasOwner) return members;

  const ownerMember: ProjectMember = {
    id: `owner-${owner.id}`,
    user: owner,
    role: members[0]?.role ?? "CONTRIBUTOR", // rôle fallback
    joinedAt: project.createdAt ?? new Date().toISOString(),
  };

  return [ownerMember, ...members];
}

// ---------------------------------------------------------
// 🔥 2) ASSIGNEES TOUJOURS VALIDES
// ---------------------------------------------------------
function sanitizeTaskAssignees(tasks: Task[], members: ProjectMember[]): Task[] {
  const memberIds = members.map((m) => m.user.id);

  return tasks.map((task) => ({
    ...task,
    assignees: task.assignees.filter((a) => memberIds.includes(a.user.id)),
  }));
}

export function useProject(projectId: string) {
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---------------------------------------------------------
  // FETCH PROJECT + TASKS
  // ---------------------------------------------------------
  const fetchProject = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data: projectData, error: projectErr } = await apiFetchProject(projectId);

    if (projectErr || !projectData) {
      setError(projectErr ?? "Projet introuvable");
      setLoading(false);
      return;
    }

    const { data: taskData } = await fetchProjectTasks(projectId);

    // 1) Owner toujours dans les membres
    const safeMembers = ensureOwnerInMembers(projectData.project);

    // 2) Assignees toujours valides
    const safeTasks = sanitizeTaskAssignees(taskData?.tasks ?? [], safeMembers);

    setProject({
      ...projectData.project,
      members: safeMembers,
      tasks: safeTasks,
    });

    setLoading(false);
  }, [projectId]);

  // ---------------------------------------------------------
  // UPDATE PROJECT
  // ---------------------------------------------------------
  async function updateProject(name: string, description: string): Promise<void> {
    const { error: err } = await apiUpdateProject(projectId, name, description);
    if (err) throw new Error(err);
    await fetchProject();
  }

  // ---------------------------------------------------------
  // CONTRIBUTORS
  // ---------------------------------------------------------
  async function addContributor(email: string): Promise<void> {
    const { error: err } = await apiAddContributor(projectId, email);
    if (err) throw new Error(err);
    await fetchProject();
  }

  async function removeContributor(userId: string): Promise<void> {
    const { error: err } = await apiRemoveContributor(projectId, userId);
    if (err) throw new Error(err);
    await fetchProject();
  }

  // ---------------------------------------------------------
  // CREATE TASK
  // ---------------------------------------------------------
  async function createTask(
    title: string,
    description: string,
    dueDate: string,
    assigneeIds: string[],
    status: Task["status"],
    priority: Task["priority"]
  ): Promise<void> {

    const isoDate =
      dueDate && dueDate.trim() !== ""
        ? new Date(dueDate).toISOString()
        : "";

    const { error: err } = await apiCreateTask(
      projectId,
      title,
      description,
      isoDate,
      assigneeIds,
      status,
      priority
    );

    if (err) throw new Error(err);

    await fetchProject();
  }

  // ---------------------------------------------------------
  // UPDATE TASK STATUS
  // ---------------------------------------------------------
  async function updateTaskStatus(taskId: string, status: Task["status"]): Promise<void> {
    const { error: err } = await apiUpdateTask(projectId, taskId, { status });
    if (err) throw new Error(err);

    setProject((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.id === taskId ? { ...t, status } : t
        ),
      };
    });
  }

  // ---------------------------------------------------------
  // UPDATE FULL TASK
  // ---------------------------------------------------------
  async function updateTask(
    taskId: string,
    data: Partial<
      Pick<Task, "title" | "description" | "dueDate" | "status" | "priority"> & {
        assigneeIds?: string[];
      }
    >
  ): Promise<void> {

    const { error: err } = await apiUpdateTask(projectId, taskId, data);
    if (err) throw new Error(err);

    setProject((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.id === taskId ? { ...t, ...data } : t
        ),
      };
    });
  }

  // ---------------------------------------------------------
  // DELETE TASK
  // ---------------------------------------------------------
  async function deleteTask(taskId: string): Promise<void> {
    const { error: err } = await apiDeleteTask(projectId, taskId);
    if (err) throw new Error(err);

    setProject((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        tasks: prev.tasks.filter((t) => t.id !== taskId),
      };
    });
  }

  return {
    project,
    loading,
    error,
    fetchProject,
    updateProject,
    addContributor,
    removeContributor,
    createTask,
    updateTaskStatus,
    updateTask,
    deleteTask,
  };
}
