
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop component that resets the scroll position of the application
 * on every route change. This is essential for single-page applications
 * where the browser doesn't naturally reset scroll position on navigation.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Reset global window scroll
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth"
    });
    
    // In this specific application, the content is contained within a 
    // scrollable <main> element. We must specifically target it to
    // ensure the dashboard views start from the top.
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth"
      });
    }
  }, [pathname]);

  // Expose a custom event for manual scroll-to-top triggers if needed
  useEffect(() => {
    const forceScroll = () => {
      const mainContent = document.querySelector('main');
      if (mainContent) {
        mainContent.scrollTo({
          top: 0,
          left: 0,
          behavior: "smooth"
        });
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    window.addEventListener("forceScrollTop", forceScroll);
    return () => window.removeEventListener("forceScrollTop", forceScroll);
  }, []);

  return null;
}
