// utils/socketUserMap.ts (Next.js client-side or server-side)
import axios from "axios";

export { };

declare global {
  // eslint-disable-next-line no-var
  var _userSocketMap: Map<string, string> | undefined;
}

type SocketMap = Map<string, string>;

const getSocketMap = async (): Promise<SocketMap> => {
  if (!global._userSocketMap) {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_SOCKET_IO_SERVER || process.env.SOCKET_SERVER_URL}/api/socket-map`,
      {
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_SOCKET_API_SECRET_KEY || process.env.SOCKET_API_SECRET_KEY,
        },
      }
    );

    // Assuming `response.data.data` is [ [userId, socketId], ... ]
    const raw = response.data.data;
    const entries: [string, string][] = Array.isArray(raw)
      ? raw                                  // already the right shape
      : Object.entries(raw as Record<string, string>); // convert object → array

    global._userSocketMap = new Map(entries);

  }
  return global._userSocketMap;
};

export const registerUserSocket = async (userId: string, socketId: string) => {
  const map = await getSocketMap();
  map.set(userId, socketId);
};

export const removeUserSocket = async (socketId: string): Promise<void> => {
  const map = await getSocketMap();
  for (const [userId, sId] of map.entries()) {
    if (sId === socketId) {
      map.delete(userId);
      break;
    }
  }
};

export const getUserSocketId = async (userId: string): Promise<string | undefined> => {
  const map = await getSocketMap();
  return map.get(userId);
};

export const getUserIdBySocketId = async (socketId: string): Promise<string | null> => {
  const map = await getSocketMap();
  for (const [userId, sId] of map.entries()) {
    if (sId === socketId) return userId;
  }
  return null;
};