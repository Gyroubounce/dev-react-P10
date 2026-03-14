"use client";

import { useState } from "react";
import { apiRequest } from "@/hooks/useApi";
import type { Task } from "@/types/index";

type CreateTaskPayload = {
  title: string;
  description: string;
  dueDate: string | null;
  assigneeIds: string[];
  status: Task["status"];
  priority: Task["priority"];
};

export function useTask() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---------------------------------------------------------
  // CREATE TASK
  // ---------------------------------------------------------
  async function createTask(projectId: string, data: CreateTaskPayload) {
    setLoading(true);
    setError(null);

    const { error: err } = await apiRequest(`/projects/${projectId}/tasks`, {
      method: "POST",
      body: data,
    });

    if (err) {
      setError(err);
      setLoading(false);
      return null;
    }

    setLoading(false);
    return true;
  }

  // ---------------------------------------------------------
  // UPDATE TASK
  // ---------------------------------------------------------
  async function updateTask(
    projectId: string,
    taskId: string,
    data: Partial<Task> & { assigneeIds?: string[] }
  ) {
    setLoading(true);
    setError(null);

    const { error: err } = await apiRequest(
      `/projects/${projectId}/tasks/${taskId}`,
      {
        method: "PUT",
        body: data,
      }
    );

    if (err) {
      setError(err);
      setLoading(false);
      return null;
    }

    setLoading(false);
    return true;
  }

  // ---------------------------------------------------------
  // DELETE TASK
  // ---------------------------------------------------------
  async function deleteTask(projectId: string, taskId: string) {
    setLoading(true);
    setError(null);

    const { error: err } = await apiRequest(
      `/projects/${projectId}/tasks/${taskId}`,
      {
        method: "DELETE",
      }
    );

    if (err) {
      setError(err);
      setLoading(false);
      return null;
    }

    setLoading(false);
    return true;
  }

  return {
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
  };
}
