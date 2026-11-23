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

