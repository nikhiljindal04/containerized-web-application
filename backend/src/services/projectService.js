import { v4 as uuidv4 } from "uuid";
import fs from "fs/promises";
import { execPromisified } from "../utils/execUtility.js";
import path from "path";
import directoryTree from "directory-tree";
import { REACT_PROJECT_COMMAND } from "../config/serverConfig.js";

export const createProjectService = async () => {
  const projectId = uuidv4();
  const projectDir = path.resolve(`./projects/${projectId}`);

  // Ensure ./projects/${projectId} directory exists recursively
  await fs.mkdir(projectDir, { recursive: true });

  const command =
    REACT_PROJECT_COMMAND ||
    "npx --yes create-vite@latest sandbox --template react";

  await execPromisified(command, { cwd: projectDir });
  return projectId;
};

export const getProjectTreeService = async (projectId) => {
    const projectPath = path.resolve(`./projects/${projectId}`);
    const tree = await directoryTree(projectPath);
    //console.log(tree);
    return tree;
}