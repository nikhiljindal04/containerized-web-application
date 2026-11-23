# Updation Steps: ActiveFileButton & allCurrentlyActiveFileTabStore

This document details all the changes made to the tab management system in the frontend, explaining **what** was modified, **why** each change was necessary, and **how** each component functions now.

---

## 1. Summary of Changes

1. **`allCurrentlyActiveFileTabStore.js`**:
   - Fixed a runtime `ReferenceError` where `allCurrentlyActiveFileTab` was referenced outside Zustand's updater function scope.
   - Added `removeActiveFileTab(target)` to remove an opened file from the active tabs list by path, tab object, or filename.
   - Added `removeFileTab(target)` as a convenience alias.
   - Added duplicate prevention in `setAllCurrentlyActiveFileTab` so opening the same file multiple times does not create duplicate tabs.
   - Added `clearAllTabs()` helper.

2. **`ActiveFileButton.jsx`**:
   - Replaced hardcoded static `"file.js"` with dynamic filename resolution (supports `fileName`, `file` object, or `path` string).
   - Added an interactive close button with the `VscClose` icon from `react-icons/vsc`.
   - Hooked up the close button to `removeActiveFileTab` from `allCurrentlyActiveFileTabStore`.
   - Added `e.stopPropagation()` on the close button to prevent activating/focusing a tab when closing it.
   - Added full keyboard accessibility (`role="tab"`, `tabIndex={0}`, Enter/Space key triggers).

3. **`ActiveFileButton.css`**:
   - Converted the button layout to flexbox (`display: inline-flex`, `align-items: center`, `justify-content: space-between`).
   - Added file name truncation (`text-overflow: ellipsis`) for long file names.
   - Added hover effects on both the tab and the close button for a polished code-editor feel.

---

## 2. Detailed File Modifications

### 2.1. Store: `src/store/allCurrentlyActiveFileTabStore.js`

#### Problem in Previous Code:
```javascript
// BEFORE
const useAllCurrentlyActiveFileTabStore = create((set) => {
  return {
    allCurrentlyActiveFileTab: [],
    setAllCurrentlyActiveFileTab: (path, value, extension) => {
      set({
        // BUG: `allCurrentlyActiveFileTab` is not defined in this scope!
        allCurrentlyActiveFileTab: [...allCurrentlyActiveFileTab, { path, value, extension }]
      });
    }
  };
});
```
- Calling `setAllCurrentlyActiveFileTab` threw a `ReferenceError: allCurrentlyActiveFileTab is not defined`.
- There was no function to remove/close an active file tab.
- There was no check against duplicate tabs for the same file.

#### Updated Implementation:
```javascript
// AFTER
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

  // Alias for removeActiveFileTab
  removeFileTab: (target) => {
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
```

#### How it works:
- `set((state) => ...)`: Safely accesses the current state via Zustand's updater callback.
- `removeActiveFileTab(target)`: Flexible parameter handling:
  - If given a full file path (e.g., `"/src/App.jsx"`), it filters out the tab matching that path.
  - If given an object (e.g., `{ path: "/src/App.jsx" }`), it reads `target.path`.
  - If given just a filename (e.g., `"App.jsx"`), it matches against the base filename of each tab.

---

### 2.2. Component: `src/components/atoms/ActiveFileButton/ActiveFileButton.jsx`

#### Problem in Previous Code:
```jsx
// BEFORE
export default function ActiveFileButton({ isActive , setActive}) {
    function handleClick() {
        console.log("clicked")
        setActive()
    }
    
  return (
    <button className="editor-button" style={{
        color: isActive ?"white": "#959eba",
        backgroundColor: isActive ? "#303242" : "#4a4859",
        borderTop: isActive ? "3px solid #07691e" : "none",
    }}
    onClick={handleClick}>
      file.js
    </button>
  );
}
```
- Hardcoded `"file.js"` text.
- No close button.
- No interaction with `allCurrentlyActiveFileTabStore`.

#### Updated Implementation:
```jsx
// AFTER
import React from "react";
import { VscClose } from "react-icons/vsc";
import useAllCurrentlyActiveFileTabStore from "../../../store/allCurrentlyActiveFileTabStore";
import "./ActiveFileButton.css";

export default function ActiveFileButton({
  file,
  fileName,
  path,
  isActive,
  setActive,
  onClose,
}) {
  const { removeActiveFileTab } = useAllCurrentlyActiveFileTabStore();

  // Extract display file name from props (fileName, file object, path string, or fallback)
  const displayFileName =
    fileName ||
    (typeof file === "string"
      ? file.split("/").pop()?.split("\\").pop()
      : null) ||
    file?.name ||
    (file?.path ? file.path.split("/").pop()?.split("\\").pop() : null) ||
    (path ? path.split("/").pop()?.split("\\").pop() : null) ||
    "file.js";

  // Determine target identifier for store removal
  const fileTarget =
    (typeof file === "object" ? file?.path : null) ||
    path ||
    file ||
    fileName ||
    displayFileName;

  function handleClick() {
    console.log("clicked");
    if (setActive) {
      setActive();
    }
  }

  function handleClose(e) {
    e.stopPropagation(); // Prevent tab activation when clicking close button
    removeActiveFileTab(fileTarget);
    if (onClose) {
      onClose(fileTarget);
    }
  }

  return (
    <div
      role="tab"
      aria-selected={isActive}
      tabIndex={0}
      className={`editor-button ${isActive ? "active" : ""}`}
      style={{
        color: isActive ? "white" : "#959eba",
        backgroundColor: isActive ? "#303242" : "#4a4859",
        borderTop: isActive ? "3px solid #07691e" : "3px solid transparent",
      }}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleClick();
        }
      }}
    >
      <span className="editor-tab-filename" title={displayFileName}>
        {displayFileName}
      </span>

      <span
        role="button"
        tabIndex={0}
        className="editor-tab-close-btn"
        aria-label={`Close ${displayFileName}`}
        title="Close tab"
        onClick={handleClose}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.stopPropagation();
            handleClose(e);
          }
        }}
      >
        <VscClose size={15} />
      </span>
    </div>
  );
}
```

#### Key Highlights:
1. **Dynamic Name Resolution**: You can pass `file` (object or string), `fileName`, or `path`. It extracts the clean filename for display.
2. **Close Action**: Clicking the close button calls `handleClose(e)`:
   - `e.stopPropagation()` ensures the click does not bubble to the tab body, preventing `setActive()` from firing when closing.
   - `removeActiveFileTab(fileTarget)` immediately removes the tab from `useAllCurrentlyActiveFileTabStore`.
   - Calls optional `onClose` callback if provided by the parent component.
3. **Semantic HTML & Accessibility**: Outer element uses `role="tab"` and inner close button uses `role="button"` with `aria-label`, avoiding illegal nested `<button>` tags while preserving full accessibility and keyboard controls.

---

### 2.3. Styles: `src/components/atoms/ActiveFileButton/ActiveFileButton.css`

#### Updated Implementation:
```css
.editor-button {
  outline: none;
  background-color: #303242;
  font-size: 13px;
  height: 32px;
  border-left: none;
  border-bottom: none;
  border-right: 1px solid #282a36;
  border-top: 3px solid transparent;
  color: #fff;
  min-width: 110px;
  padding: 0 10px 0 12px;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  box-sizing: border-box;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.editor-button:hover {
  background-color: #3c3e53 !important;
}

.editor-button.active {
  background-color: #303242;
  color: #ffffff;
}

.editor-tab-filename {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
  font-family: inherit;
  font-size: 13px;
  line-height: 1;
}

.editor-tab-close-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  color: inherit;
  opacity: 0.7;
  cursor: pointer;
  transition: opacity 0.15s ease, background-color 0.15s ease, color 0.15s ease;
  flex-shrink: 0;
}

.editor-tab-close-btn:hover {
  opacity: 1;
  background-color: rgba(255, 255, 255, 0.18);
  color: #ffffff;
}
```

---

## 3. Integration in EditorComponent & Socket Flow

The tab bar is now integrated directly into [EditorComponent.jsx](file:///c:/Users/nikhi/OneDrive/Desktop/ProjectIdx/frontend/src/components/molecules/EditorComponent/EditorComponent.jsx):

```jsx
import React, { useEffect, useRef, useState } from "react";
import { Editor } from "@monaco-editor/react";
import useActiveFileTabStore from "../../../store/activeFileTabStore";
import useAllCurrentlyActiveFileTabStore from "../../../store/allCurrentlyActiveFileTabStore";
import ActiveFileButton from "../../atoms/ActiveFileButton/ActiveFileButton";

export default function EditorComponent() {
  const { allCurrentlyActiveFileTab } = useAllCurrentlyActiveFileTabStore();
  const { activeFileTab, setActiveFileTab, clearActiveFileTab } = useActiveFileTabStore();

  function handleTabClose(closedTarget) {
    const closedPath =
      typeof closedTarget === "string" ? closedTarget : closedTarget?.path;

    // If the closed tab was currently active, switch active tab to another tab or clear
    if (
      activeFileTab?.path === closedPath ||
      (closedPath && activeFileTab?.path?.endsWith(closedPath))
    ) {
      const remainingTabs = allCurrentlyActiveFileTab.filter(
        (tab) =>
          tab.path !== closedPath &&
          tab.path?.split("/").pop()?.split("\\").pop() !== closedPath
      );

      if (remainingTabs.length > 0) {
        const nextTab = remainingTabs[remainingTabs.length - 1];
        setActiveFileTab(nextTab.path, nextTab.value, nextTab.extension);
      } else {
        clearActiveFileTab();
      }
    }
  }

  return (
    <>
      <div
        className="tabs-container"
        style={{
          display: "flex",
          overflowX: "auto",
          backgroundColor: "#1e1e24",
          borderBottom: "1px solid #282a36",
          minHeight: "32px",
        }}
      >
        {allCurrentlyActiveFileTab.map((file) => (
          <ActiveFileButton
            key={file.path}
            file={file}
            isActive={activeFileTab?.path === file.path}
            setActive={() =>
              setActiveFileTab(file.path, file.value, file.extension)
            }
            onClose={handleTabClose}
          />
        ))}
      </div>
      ...
    </>
  );
}
```

### In `editorSocketStore.js`:
When `readFileSuccess` occurs, the file is added to both stores:
```javascript
socket?.on("readFileSuccess", (data) => {
  const fileExtension = data.path.split(".").pop();
  activeFileTabSetter(data.path, data.data, fileExtension);
  allActiveFilesSetter(data.path, data.data, fileExtension);
});
```

---

## 4. End-to-End User Flow Diagram

```
User Double-Clicks File in Tree (TreeNode.jsx)
  │
  ▼
editorSocket.emit("readFile", { pathToFileOrFolder })
  │
  ▼
Backend responds with "readFileSuccess"
  │
  ▼
editorSocketStore:
  ├──► activeFileTabSetter(...)       // Updates current editor document
  └──► allActiveFilesSetter(...)      // Appends tab to allCurrentlyActiveFileTabStore
        │
        ▼
EditorComponent:
  Renders list of <ActiveFileButton />
        │
        ├──► User clicks Tab Body ──► setActiveFileTab(...) [Switches tab view]
        └──► User clicks Close 'X'──► 1. e.stopPropagation()
                                      2. removeActiveFileTab(...)
                                      3. If active tab closed, switch to adjacent tab or clearActiveFileTab()
```

