// Create a fake black video track using canvas
function createFakeVideoTrack(): MediaStreamTrack {
    const canvas = Object.assign(document.createElement('canvas'), { width: 640, height: 480 });
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Type assertion for captureStream method
    const stream = (canvas as HTMLCanvasElement & { captureStream(frameRate?: number): MediaStream }).captureStream(10); // 10fps
    const [videoTrack] = stream.getVideoTracks();
    return videoTrack;
}


// Create a fake silent audio track using AudioContext
function createFakeAudioTrack(): MediaStreamTrack {
    const audioContext = new AudioContext();

    // Create destination node explicitly
    const destination = audioContext.createMediaStreamDestination();

    // Create oscillator
    const oscillator = audioContext.createOscillator();

    // Connect oscillator to destination
    oscillator.connect(destination);

    // Start oscillator (silent freq)
    oscillator.frequency.setValueAtTime(0, audioContext.currentTime);
    oscillator.start();

    // Get audio track from destination's stream
    const [audioTrack] = destination.stream.getAudioTracks();

    return audioTrack;
}


// Combine into a fake MediaStream
export function createFakeMediaStream(): MediaStream {
    const videoTrack = createFakeVideoTrack();
    const audioTrack = createFakeAudioTrack();
    return new MediaStream([videoTrack, audioTrack]);
}
