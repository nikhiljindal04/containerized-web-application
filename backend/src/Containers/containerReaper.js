import Docker from 'dockerode';
const docker = new Docker();

// Maps projectId to the number of active connections (editor + terminal)
const activeConnections = new Map();

// Maps projectId to the timestamp when it became idle (0 connections)
const idleTimestamps = new Map();

const IDLE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

export const registerConnection = (projectId) => {
    if (!projectId) return;
    
    const count = activeConnections.get(projectId) || 0;
    activeConnections.set(projectId, count + 1);
    
    // If it was previously idle, remove it from idle list
    if (idleTimestamps.has(projectId)) {
        console.log(`[Reaper] Connection restored for ${projectId}, removing from idle list.`);
        idleTimestamps.delete(projectId);
    }
};

export const unregisterConnection = (projectId) => {
    if (!projectId) return;

    let count = activeConnections.get(projectId) || 0;
    if (count > 0) {
        count--;
        activeConnections.set(projectId, count);
    }

    if (count === 0 && !idleTimestamps.has(projectId)) {
        console.log(`[Reaper] Project ${projectId} is now idle. Marking for potential stop.`);
        idleTimestamps.set(projectId, Date.now());
    }
};

// Start the background job
export const startReaperJob = () => {
    console.log("[Reaper] Starting background container idle reaper job.");
    // Check every 1 minute
    setInterval(async () => {
        const now = Date.now();
        for (const [projectId, timestamp] of idleTimestamps.entries()) {
            if (now - timestamp >= IDLE_TIMEOUT_MS) {
                console.log(`[Reaper] Project ${projectId} has been idle for 10 minutes. Stopping container.`);
                try {
                    const containers = await docker.listContainers({
                        all: true,
                        filters: { name: [projectId] }
                    });
                    
                    if (containers.length > 0) {
                        const containerInfo = containers[0];
                        if (containerInfo.State === 'running') {
                            const container = docker.getContainer(containerInfo.Id);
                            await container.stop();
                            console.log(`[Reaper] Successfully stopped container for ${projectId}`);
                        } else {
                            console.log(`[Reaper] Container for ${projectId} is already in state: ${containerInfo.State}`);
                        }
                    } else {
                         console.log(`[Reaper] Container for ${projectId} not found.`);
                    }
                } catch (error) {
                    console.error(`[Reaper] Error stopping container for ${projectId}:`, error);
                } finally {
                    // Remove from idle list regardless of success to avoid infinite retry loops if something is stuck
                    idleTimestamps.delete(projectId);
                    activeConnections.delete(projectId);
                }
            }
        }
    }, 60 * 1000); // 1 minute interval
};
