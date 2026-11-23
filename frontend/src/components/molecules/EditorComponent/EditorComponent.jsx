import { Editor } from "@monaco-editor/react";
import React, { useEffect, useRef, useState } from "react";
import useActiveFileTabStore from "../../../store/activeFileTabStore";
import { useEditorSocketStore } from "../../../store/editorSocketStore";
import { extensionToFileType } from "../../../utils/extensionToFileType";
import useAllCurrentlyActiveFileTabStore from "../../../store/allCurrentlyActiveFileTabStore";
import ActiveFileButton from "../../atoms/ActiveFileButton/ActiveFileButton";

export default function EditorComponent() {
  const [editorState, setEditorState] = useState({});
  const { allCurrentlyActiveFileTab } = useAllCurrentlyActiveFileTabStore();
  const { activeFileTab, setActiveFileTab, clearActiveFileTab } = useActiveFileTabStore();


  const { editorSocket } = useEditorSocketStore();
  const timerRef = useRef(null);

  useEffect(() => {
    async function downloadTheme() {
      const response = await fetch("/dracula.json");
      const data = await response.json();
      setEditorState({ ...setEditorState, theme: data });
    }
    downloadTheme();
  }, []);

  function handleEditorTheme(editor, monaco) {
    monaco.editor.defineTheme("dracula", editorState.theme);
    monaco.editor.setTheme("dracula");
  }

  function handleChange(value) {
    //implement debouncing
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      const editorContent = value;
      if (activeFileTab?.path) {
        editorSocket.emit("writeFile", {
          pathToFileOrFolder: activeFileTab.path,
          data: editorContent,
        });
      }
    }, 2000);
  }

  function handleTabClose(closedTarget) {
    const closedPath =
      typeof closedTarget === "string" ? closedTarget : closedTarget?.path;

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

      {editorState.theme && (
        <Editor
          height={"70vh"}
          width={"100%"}
          language={extensionToFileType(activeFileTab?.extension) || "plaintext"}
          value={activeFileTab?.value ? activeFileTab.value : "//Somecomment"}
          options={{
            fontSize: 18,
            fontFamily: "monospace",
          }}
          onChange={handleChange}
          onMount={handleEditorTheme}
        />
      )
      }
    </>
  );
}
