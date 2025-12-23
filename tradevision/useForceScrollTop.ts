
import { useCallback } from "react";

/**
 * A hook that returns a function to force the view to scroll to the top.
 * It targets both the global window and the application's primary scrollable <main> container.
 */
export function useForceScrollTop() {
  return useCallback(() => {
    // Scroll the global window
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    // Specifically target the main content container which handles scrolling in this layout
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  }, []);
}
