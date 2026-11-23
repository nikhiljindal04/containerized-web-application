import {
  createProjectService,
  getProjectTreeService,
} from "../services/projectService.js";

export const createProjectController = async (req, res) => {
  try {
    const projectId = await createProjectService();

    return res.status(200).json({
      success: true,
      message: "Project created successfully",
      data: projectId,
    });
  } catch (error) {
    console.error("Error creating project:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create project",
    });
  }
};

export const getProjectTreeController = async (req, res) => {
  const { projectId } = req.params;
  const tree = await getProjectTreeService(projectId);

  return res
    .status(200)
    .json({
      data: tree, 
      success: true,
      message: "Project tree retrieved successfully",
    });
};
