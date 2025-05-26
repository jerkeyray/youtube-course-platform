import { google } from "googleapis";

const youtube = google.youtube("v3");

interface YouTubeAPIError {
  error?: {
    message?: string;
  };
}

interface PlaylistItem {
  snippet: {
    title: string;
  };
  contentDetails: {
    videoId: string;
  };
}

interface PlaylistMetaItem {
  snippet: {
    title: string;
  };
}

type PlaylistMetaResponse = {
  items?: PlaylistMetaItem[];
};

interface PlaylistVideo {
  title: string;
  youtubeId: string;
}

interface PlaylistDetails {
  title: string;
  videos: PlaylistVideo[];
}

export function extractPlaylistId(url: string): string | null {
  const regex = /[?&]list=([a-zA-Z0-9_-]+)/;
  const match = regex.exec(url);
  return match?.[1] ?? null;
}

export async function fetchPlaylistDetails(
  playlistId: string
): Promise<PlaylistDetails> {
  try {
    const [playlistResponse, videosResponse] = await Promise.all([
      youtube.playlists.list({
        key: process.env.YOUTUBE_API_KEY,
        part: ["snippet"],
        id: [playlistId],
      }),
      youtube.playlistItems.list({
        key: process.env.YOUTUBE_API_KEY,
        part: ["snippet", "contentDetails"],
        playlistId,
        maxResults: 50,
      }),
    ]);

    if (!playlistResponse.data.items?.[0]) {
      throw new Error("Playlist not found");
    }

    if (!videosResponse.data.items?.length) {
      throw new Error("No videos found in playlist");
    }

    return {
      title:
        playlistResponse.data.items[0].snippet?.title ?? "Untitled Playlist",
      videos: videosResponse.data.items.map((item) => ({
        title: item.snippet?.title ?? "Untitled Video",
        youtubeId: item.contentDetails?.videoId ?? "",
      })),
    };
  } catch (error) {
    console.error("Error fetching playlist details:", error);
    throw new Error("Failed to fetch playlist details");
  }
}

export async function getPlaylistVideos(playlistUrl: string) {
  try {
    const playlistId = playlistUrl.match(/[&?]list=([^&]+)/)?.[1];
    if (!playlistId) {
      throw new Error("Invalid playlist URL");
    }

    const response = await youtube.playlistItems.list({
      key: process.env.YOUTUBE_API_KEY,
      part: ["snippet", "contentDetails"],
      playlistId,
      maxResults: 50,
    });

    const videos = response.data.items?.map((item) => ({
      id: item.contentDetails?.videoId,
      title: item.snippet?.title,
      duration: 0, // Duration requires additional API call
    }));

    return (
      videos?.filter(
        (v): v is { id: string; title: string; duration: number } =>
          Boolean(v.id && v.title)
      ) ?? []
    );
  } catch (error) {
    console.error("Error fetching playlist videos:", error);
    throw new Error("Failed to fetch playlist videos");
  }
}
