export interface Track {
    album: {
        images: { url: string }[];
        name: string;
    };
    artists: { name: string }[];
    name: string;
    duration_ms: string;
    raw_duration_ms: number;
    id: string;
}

export interface NowPlaying {
    is_playing: boolean;
    item: Track;
    progress_ms: string;
    raw_progress_ms: number;
}
