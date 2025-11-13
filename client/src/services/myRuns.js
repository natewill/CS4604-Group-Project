/**
 * Fetches user's runs (scheduled or past) from the backend
 * @param {string} filter - Either "scheduled" or "past"
 * @returns {Promise<Array>} Promise that resolves to an array of run objects
 */
export const fetchMyRuns = async (filter) => {
  const response = await fetch(`/api/my-runs?filter=${filter}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch runs");
  }

  return response.json();
};

/**
 * Leaves a run (removes user from run participation)
 * @param {number} runId - The ID of the run to leave
 * @returns {Promise<void>}
 */
export const leaveRun = async (runId) => {
  const response = await fetch(`/api/runs/${runId}/leave`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to leave run");
  }
};

/**
 * Deletes a run (leaders only - removes run and all participations)
 * @param {number} runId - The ID of the run to delete
 * @returns {Promise<void>}
 */
export const deleteRun = async (runId) => {
  const response = await fetch(`/api/runs/${runId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to delete run");
  }
};

