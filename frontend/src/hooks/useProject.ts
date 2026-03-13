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

import type { Project, Task } from "@/types/index";

export type ProjectDetail = Project & {
  tasks: Task[];
};

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

    setProject({
      ...projectData.project,
      tasks: taskData?.tasks ?? [],
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
  // UPDATE TASK STATUS ONLY
  // ---------------------------------------------------------
  async function updateTaskStatus(taskId: string, status: Task["status"]): Promise<void> {
    const { error: err } = await apiUpdateTask(projectId, taskId, { status });
    if (err) throw new Error(err);
    await fetchProject();
  }

  // ---------------------------------------------------------
  // UPDATE FULL TASK (title, desc, date, assignees, status, priority)
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
    await fetchProject();
  }

  // ---------------------------------------------------------
  // DELETE TASK
  // ---------------------------------------------------------
  async function deleteTask(taskId: string): Promise<void> {
    const { error: err } = await apiDeleteTask(projectId, taskId);
    if (err) throw new Error(err);
    await fetchProject();
  }

  // ---------------------------------------------------------
  // EXPORT HOOK API
  // ---------------------------------------------------------
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
    updateTask,     // 🟩 AJOUTÉ
    deleteTask,
  };
}
