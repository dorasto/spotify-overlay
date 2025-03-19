export interface Track {
    album: {
        album_type: string;
        artists: Array<{
            external_urls: {
                spotify: string;
            };
            href: string;
            id: string;
            name: string;
            type: string;
            uri: string;
        }>;
        available_markets: Array<string>;
        external_urls: {
            spotify: string;
        };
        href: string;
        id: string;
        images: Array<{
            height: number;
            url: string;
            width: number;
        }>;
        name: string;
        release_date: string;
        release_date_precision: string;
        total_tracks: number;
        type: string;
        uri: string;
    };
    artists: Array<{
        external_urls: {
            spotify: string;
        };
        href: string;
        id: string;
        name: string;
        type: string;
        uri: string;
    }>;
    available_markets: Array<string>;
    disc_number: number;
    duration_ms: string;
    raw_duration_ms: number;
    explicit: boolean;
    external_ids: {
        isrc: string;
    };
    external_urls: {
        spotify: string;
    };
    href: string;
    id: string;
    is_local: boolean;
    name: string;
    popularity: number;
    preview_url: any;
    track_number: number;
    type: string;
    uri: string;
}

export interface NowPlaying {
    is_playing: boolean;
    item: Track;
    progress_ms: string;
    raw_progress_ms: number;
}

export interface Queue {
    currently_playing: Track;
    queue: QueueItems;
}
export interface QueueItems {
    album: {
        album_type: string;
        artists: Array<{
            external_urls: {
                spotify: string;
            };
            href: string;
            id: string;
            name: string;
            type: string;
            uri: string;
        }>;
        available_markets: Array<string>;
        external_urls: {
            spotify: string;
        };
        href: string;
        id: string;
        images: Array<{
            height: number;
            url: string;
            width: number;
        }>;
        name: string;
        release_date: string;
        release_date_precision: string;
        total_tracks: number;
        type: string;
        uri: string;
    };
    artists: Array<{
        external_urls: {
            spotify: string;
        };
        href: string;
        id: string;
        name: string;
        type: string;
        uri: string;
    }>;
    available_markets: Array<string>;
    disc_number: number;
    duration_ms: number;
    explicit: boolean;
    external_ids: {
        isrc: string;
    };
    external_urls: {
        spotify: string;
    };
    href: string;
    id: string;
    is_local: boolean;
    name: string;
    popularity: number;
    preview_url: any;
    track_number: number;
    type: string;
    uri: string;
}
