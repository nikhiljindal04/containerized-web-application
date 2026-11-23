import { create } from "zustand";

/**
 * Store to manage all currently opened file tabs in the editor.
 * Tab structure: { path: string, value: string, extension: string }
 */
const useAllCurrentlyActiveFileTabStore = create((set) => ({
  allCurrentlyActiveFileTab: [],

  // Add a file tab or update if it already exists (prevents duplicate tabs)
  setAllCurrentlyActiveFileTab: (path, value, extension) => {
    set((state) => {
      const alreadyExists = state.allCurrentlyActiveFileTab.some(
        (tab) => tab.path === path
      );

      if (alreadyExists) {
        return {
          allCurrentlyActiveFileTab: state.allCurrentlyActiveFileTab.map((tab) =>
            tab.path === path ? { ...tab, value, extension } : tab
          ),
        };
      }

      return {
        allCurrentlyActiveFileTab: [
          ...state.allCurrentlyActiveFileTab,
          { path, value, extension },
        ],
      };
    });
  },

  // Remove a file tab by path, tab object, or filename
  removeActiveFileTab: (target) => {
    set((state) => {
      const targetPath = typeof target === "string" ? target : target?.path;
      return {
        allCurrentlyActiveFileTab: state.allCurrentlyActiveFileTab.filter((tab) => {
          if (!targetPath) return tab !== target;

          const tabFileName = tab.path?.split("/").pop()?.split("\\").pop();
          const isMatch =
            tab.path === targetPath || (tabFileName && tabFileName === targetPath);

          return !isMatch;
        }),
      };
    });
  },


  // Clear all tabs
  clearAllTabs: () => {
    set({ allCurrentlyActiveFileTab: [] });
  },
}));

export default useAllCurrentlyActiveFileTabStore;

