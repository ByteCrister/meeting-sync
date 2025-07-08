//src\utils\media\mediaStreamManager.ts

let baseStream: MediaStream | null = null;

export async function getClonedMediaStream(): Promise<MediaStream> {
    // Check for permission first
    const permissions = await navigator.permissions.query({ name: 'camera' as PermissionName })
        .catch(() => null); // Some browsers might throw

    if (permissions?.state === 'denied') {
        throw new Error('camera-permission-denied');
    }

    const micPermission = await navigator.permissions.query({ name: 'microphone' as PermissionName })
        .catch(() => null);

    if (micPermission?.state === 'denied') {
        throw new Error('microphone-permission-denied');
    }

    // Fallback to getUserMedia
    try {
        if (!baseStream) {
            baseStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
        }
        return baseStream.clone(); // clone before returning
    } catch (err) {
        console.error("getClonedMediaStream failed:", err);
        throw err;
    }
}

export function stopBaseStream() {
    baseStream?.getTracks().forEach(track => track.stop());
    baseStream = null;
};