let baseStream: MediaStream | null = null;

export async function getClonedMediaStream(): Promise<MediaStream> {
    try {
        const constraints: MediaStreamConstraints = {
            video: true,
            audio: true,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        baseStream = stream;
        return stream.clone();
    } catch (err: unknown) {
        const error = err as Error;
        console.log("Partial media access or denied:", error);

        // Try to get at least one of video/audio
        try {
            const fallbackConstraints: MediaStreamConstraints = error.message.includes("audio")
                ? { video: true }
                : { audio: true };

            const partialStream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
            baseStream = partialStream;
            return partialStream.clone();
        } catch {
            // No access to any media
            console.log("No media access granted at all");
            return new MediaStream(); // Return empty stream
        }
    }
}

export function stopBaseStream() {
    baseStream?.getTracks().forEach((track) => track.stop());
    baseStream = null;
}