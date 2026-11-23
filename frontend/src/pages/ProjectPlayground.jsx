import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import EditorComponent from "../components/molecules/EditorComponent/EditorComponent";
import TreeStructure from "../components/organisms/TreeStructure/TreeStructure";
import { useEditorSocketStore } from "../store/editorSocketStore";
import { io } from "socket.io-client";
import useTreeStructureStore from "../store/treeStructureStore";
import BrowserTerminal from "../components/molecules/BrowserTerminal/BrowserTerminal";
import { Browser } from "../components/organisms/Browser/Browser";
import useFetchPortLogicStore from "../store/fetchportLogicStore";
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import { Divider } from "antd";
import { useAuthStore } from "../store/authStore";

export default function ProjectPlayground() {
  const { projectId: projectIdFromURL } = useParams();
  const { setEditorSocket } = useEditorSocketStore();
  const {projectId, setProjectId} = useTreeStructureStore();
  const {setIsEditorSocketReady} = useFetchPortLogicStore();

  useEffect(() => {
    setProjectId(projectIdFromURL);
    const token = useAuthStore.getState().token;
    const socketConn = io(`${import.meta.env.VITE_BACKEND_URL}/editor`, {
      auth: { token },
      query: { projectId: projectId, token },
    });
    
    socketConn.on("connect", () => {
      setIsEditorSocketReady(true);
    });
    setEditorSocket(socketConn);

    return () => {
      socketConn.disconnect();
      setIsEditorSocketReady(false);
    }
  }, [projectIdFromURL, projectId, setEditorSocket, setProjectId, setIsEditorSocketReady]);

  
  

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      {/* 3rd Allotment: splits TreeStructure and the 2nd allotment */}
      <Allotment>
        <Allotment.Pane
          preferredSize={250}
          minSize={200}
          maxSize={450}
          visible={Boolean(projectId)}
        >
          <div
            style={{
              backgroundColor: "#333254",
              paddingRight: "10px",
              paddingTop: "0.3vh",
              height: "100%",
              overflow: "auto",
            }}
          >
            {projectId && <TreeStructure />}
          </div>
        </Allotment.Pane>

        {/* 2nd Allotment: splits 1st allotment and Browser */}
        <Allotment.Pane>
          <Allotment>
            {/* 1st Allotment: splits EditorComponent and BrowserTerminal vertically */}
            <Allotment.Pane preferredSize="60%">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                  height: "100%",
                  backgroundColor: "#282a35",
                }}
              >
                <Allotment vertical={true}>
                  <Allotment.Pane preferredSize="70%">
                    <div>
                      <EditorComponent />
                    </div>
                  </Allotment.Pane>

                  <Allotment.Pane preferredSize="30%">
                    <div
                      style={{
                        borderTop: "1px solid #3a3a3a",
                        height: "100%",
                      }}
                    >
                      <BrowserTerminal />
                    </div>
                  </Allotment.Pane>
                </Allotment>
              </div>
            </Allotment.Pane>

            <Allotment.Pane preferredSize="40%" visible={Boolean(projectId)}>
              <div>
                <Browser />
              </div>
            </Allotment.Pane>
          </Allotment>
        </Allotment.Pane>
      </Allotment>
    </div>
  );
}
