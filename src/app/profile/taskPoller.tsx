import { get, get_ml, patch, post_ml } from "@/app/util";

// In a separate file: taskPoller.ts
export const startTaskPolling = async () => {
  const taskId = localStorage.getItem("task_id");
  if (!taskId) return;

  // Check if already polling (could store this in localStorage too)
  if (window._pollingInterval) return;

  const pollTaskResult = async () => {
    try {
      const resultResponse = await get_ml(`/result/${taskId}`);

      console.log("Polling result:", resultResponse);
      console.log(resultResponse.state);

      if (resultResponse && resultResponse.state === "SUCCESS") {
        console.log("Task completed successfully:", resultResponse);
        const seasonMap = {
          spring: 2,
          summer: 3,
          autumn: 1,
          winter: 4,
        };

        const seasonId: number = seasonMap[resultResponse.result.Season];
        const response = await get(`seasons/${seasonId}/`);

        localStorage.setItem("season", response.name);
        const colorCodes = response.colors.map((color) => color.code);
        const colorIds = response.colors.map((color) => color.color_id);
        localStorage.setItem("colorPalette", JSON.stringify(colorCodes));
        localStorage.setItem("colorIds", JSON.stringify(colorIds));

        await patch(`seasons/user_update/`, {
          jsonBody: { season: response.name },
        });

        console.log("Patched update");

        // Clear task_id and stop polling
        localStorage.removeItem("task_id");
        if (window._pollingInterval) {
          clearInterval(window._pollingInterval);
          window._pollingInterval = null;
        }

        // Dispatch a custom event that components can listen for
        window.dispatchEvent(
          new CustomEvent("seasonUpdated", {
            detail: { season: response.name },
          })
        );
      } else if (resultResponse && resultResponse.state === "FAILED") {
        localStorage.removeItem("task_id");
        if (window._pollingInterval) {
          clearInterval(window._pollingInterval);
          window._pollingInterval = null;
        }
      }
    } catch (error) {
      console.error("Error polling task result:", error);
    }
  };

  // Store the interval ID in a global variable
  window._pollingInterval = setInterval(pollTaskResult, 5000) as any;

  // Initial poll
  pollTaskResult();
};

// Stop polling function
export const stopTaskPolling = () => {
  if (window._pollingInterval) {
    clearInterval(window._pollingInterval);
    window._pollingInterval = null;
  }
};
