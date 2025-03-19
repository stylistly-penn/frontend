import { get, get_ml, patch, post_ml } from "@/app/util";

// Add interface for the task result
interface TaskResult {
  state: string;
  result?: {
    Season: string;
  };
}

// Add interface for the auth response
interface AuthResponse {
  authenticated: boolean;
  user: {
    username: string;
    email: string;
    season: {
      name: string;
      colors: Array<{
        code: string;
        color_id: number;
      }>;
    };
  };
}

// Add this type declaration for the global window object
declare global {
  interface Window {
    _pollingInterval: number | null;
  }
}

// In a separate file: taskPoller.ts
export const startTaskPolling = async () => {
  // Safety check for server-side rendering
  if (typeof window === "undefined") return;

  const taskId = localStorage.getItem("task_id");
  if (!taskId) return;

  // Check if already polling (could store this in localStorage too)
  if (window._pollingInterval) return;

  const pollTaskResult = async () => {
    try {
      const resultResponse = await get_ml<TaskResult>(`/result/${taskId}`);

      console.log("Polling result:", resultResponse);
      console.log(resultResponse.state);

      if (resultResponse && resultResponse.state === "SUCCESS") {
        console.log("Task completed successfully:", resultResponse);

        const season =
          resultResponse.result!.Season.charAt(0).toUpperCase() +
          resultResponse.result!.Season.slice(1).toLowerCase();
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
        const authResponse = await get<AuthResponse>("auth/check");
        if (authResponse.authenticated && authResponse.user.season) {
          // Update localStorage with new season and color data
          localStorage.setItem("season", authResponse.user.season.name);
          localStorage.setItem(
            "colorPalette",
            JSON.stringify(
              authResponse.user.season.colors.map(
                (c: { code: string }) => c.code
              )
            )
          );
          localStorage.setItem(
            "colorIds",
            JSON.stringify(
              authResponse.user.season.colors.map(
                (c: { color_id: number }) => c.color_id
              )
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
