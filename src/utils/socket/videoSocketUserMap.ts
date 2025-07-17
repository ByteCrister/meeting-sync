import axios from "axios";

export { };

declare global {
  // eslint-disable-next-line no-var
  var _videoUserSocketMap: Map<string, string> | undefined;
}

type VideoSocketMap = Map<string, string>;

const getVideoSocketMap = async (): Promise<VideoSocketMap> => {
  if (!global._videoUserSocketMap) {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_SOCKET_IO_SERVER || process.env.SOCKET_SERVER_URL}/api/video-socket-map`,
      {
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_SOCKET_API_SECRET_KEY || process.env.SOCKET_API_SECRET_KEY,
        },
      }
    );

    const entries: [string, string][] = response.data.data;
    global._videoUserSocketMap = new Map(entries);
  }

  return global._videoUserSocketMap;
};

export const registerVideoUserSocket = async (userId: string, socketId: string) => {
  const map = await getVideoSocketMap();
  map.set(userId, socketId);
};

export const removeVideoUserSocket = async (socketId: string): Promise<void> => {
  const map = await getVideoSocketMap();
  for (const [userId, sId] of map.entries()) {
    if (sId === socketId) {
      map.delete(userId);
      break;
    }
  }
};

export const getVideoUserSocketId = async (userId: string): Promise<string | undefined> => {
  const map = await getVideoSocketMap();
  return map.get(userId);
};

export const getVideoUserIdBySocketId = async (socketId: string): Promise<string | null> => {
  const map = await getVideoSocketMap();
  for (const [userId, sId] of map.entries()) {
    if (sId === socketId) return userId;
  }
  return null;
};

// Optional force-refresh
export const refreshVideoSocketMap = async (): Promise<VideoSocketMap> => {
  global._videoUserSocketMap = undefined;
  return await getVideoSocketMap();
};