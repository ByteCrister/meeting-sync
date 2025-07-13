let baseStream: MediaStream | null = null;

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
        return stream.clone();
    } catch (err) {
        const error = err as DOMException;

        console.log("Error getting full media access:", error);

        // Determine fallback based on error name (e.g., NotAllowedError, NotFoundError)
        let fallbackConstraints: MediaStreamConstraints;

        if (error.name === "NotAllowedError" || error.name === "SecurityError") {
            // Permission denied, probably both blocked
            return new MediaStream();
        } else if (error.name === "NotFoundError") {
            // One of the devices is missing
            fallbackConstraints = { audio: true }; // fallback to only audio
        } else {
            // Fallback to only video by default
            fallbackConstraints = { video: true };
        }

        try {
            const fallbackStream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
            baseStream = fallbackStream;
            return fallbackStream.clone();
        } catch (fallbackErr) {
            console.log("Fallback media also failed:", fallbackErr);
            return new MediaStream(); // Return empty stream
        }
    }
}

export function stopBaseStream() {
    baseStream?.getTracks().forEach((track) => track.stop());
    baseStream = null;
}