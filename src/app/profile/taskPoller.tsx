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

        const season =
          resultResponse.result.Season.charAt(0).toUpperCase() +
          resultResponse.result.Season.slice(1).toLowerCase();
        console.log("Detected season:", season);

        // Clear task_id and stop polling
        localStorage.removeItem("task_id");
        if (window._pollingInterval) {
          clearInterval(window._pollingInterval);
          window._pollingInterval = null;
        }

        // Update season in backend
        await patch(`seasons/user_update/`, {
          jsonBody: { season },
        });

        // Get updated auth data including new season and colors
        const authResponse = await get("auth/check");
        if (authResponse.authenticated && authResponse.user.season) {
          // Update localStorage with new season and color data
          localStorage.setItem("season", authResponse.user.season.name);
          localStorage.setItem(
            "colorPalette",
            JSON.stringify(authResponse.user.season.colors.map((c) => c.code))
          );
          localStorage.setItem(
            "colorIds",
            JSON.stringify(
              authResponse.user.season.colors.map((c) => c.color_id)
            )
          );
        }

        // Dispatch event with season update
        window.dispatchEvent(
          new CustomEvent("seasonUpdated", {
            detail: { season },
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
