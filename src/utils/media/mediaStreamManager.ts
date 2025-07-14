import { createFakeMediaStream } from "./MediaStreamTrackGenerator";

let baseStream: MediaStream | null = null;
let isFakeStream = false;

export async function getClonedMediaStream(): Promise<MediaStream> {
    if (baseStream) {
        console.log("Reusing existing base stream");
        return baseStream.clone();
    }

    try {
        const constraints: MediaStreamConstraints = {
            video: true,
            audio: true,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        baseStream = stream;
        isFakeStream = false;
        return stream.clone();
    } catch (err) {
        console.log("Error getting full media access:", err);

        // Return fake media stream to avoid device in use error
        baseStream = createFakeMediaStream();
        isFakeStream = true;
        return baseStream.clone();
    }
}

export function stopBaseStream() {
    if (isFakeStream) {
        baseStream?.getTracks().forEach(track => track.stop());
    } else {
        baseStream?.getTracks().forEach(track => track.stop());
    }
    baseStream = null;
    isFakeStream = false;
}
