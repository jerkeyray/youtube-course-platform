/* eslint-disable @typescript-eslint/no-explicit-any */
import { google } from "googleapis";

const youtube = google.youtube("v3");

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
    // First, get the playlist info
    const playlistResponse = await youtube.playlists.list({
      key: process.env.YOUTUBE_API_KEY,
      part: ["snippet"],
      id: [playlistId],
    });

    if (!playlistResponse.data.items?.[0]) {
      throw new Error("Playlist not found");
    }

    // Fetch all videos with pagination support
    const videos: PlaylistVideo[] = [];
    let nextPageToken: string | undefined = undefined;

    do {
      // Type annotation for videosResponse
      const videosResponse: any = await youtube.playlistItems.list({
        key: process.env.YOUTUBE_API_KEY,
        part: ["snippet", "contentDetails"],
        playlistId,
        maxResults: 50,
        pageToken: nextPageToken,
      });

      if (videosResponse.data.items?.length) {
        // Extract video information from each item
        videosResponse.data.items.forEach((item: any) => {
          if (item.snippet && item.contentDetails?.videoId) {
            videos.push({
              title: item.snippet.title ?? "Untitled Video",
              youtubeId: item.contentDetails.videoId,
            });
          }
        });
      }

      nextPageToken = videosResponse.data.nextPageToken;
    } while (nextPageToken);

    if (videos.length === 0) {
      throw new Error("No videos found in playlist");
    }

    return {
      title:
        playlistResponse.data.items[0].snippet?.title ?? "Untitled Playlist",
      videos,
    };
  } catch (error) {
    // Handle error silently
    throw new Error("Failed to fetch playlist details");
  }
}

export async function getPlaylistTitle(playlistId: string): Promise<string> {
  try {
    const response = await youtube.playlists.list({
      key: process.env.YOUTUBE_API_KEY,
      part: ["snippet"],
      id: [playlistId],
    });

    if (!response.data.items?.[0]) {
      throw new Error("Playlist not found");
    }

    return response.data.items[0].snippet?.title ?? "Untitled Playlist";
  } catch (error) {
    // Handle error silently
    throw new Error("Failed to fetch playlist title");
  }
}

export async function getPlaylistVideos(playlistUrlOrId: string) {
  try {
    let playlistId = playlistUrlOrId;

    // Check if it's a URL and extract the playlist ID if it is
    if (
      playlistUrlOrId.includes("youtube.com") ||
      playlistUrlOrId.includes("youtu.be")
    ) {
      const match = playlistUrlOrId.match(/[&?]list=([^&]+)/);
      if (!match || !match[1]) {
        throw new Error("Invalid playlist URL");
      }
      playlistId = match[1];
    }

    // Collect all videos with pagination
    const allVideos: any[] = [];
    let nextPageToken: string | undefined = undefined;

    do {
      // Type annotation for response
      const response: any = await youtube.playlistItems.list({
        key: process.env.YOUTUBE_API_KEY,
        part: ["snippet", "contentDetails"],
        playlistId,
        maxResults: 50,
        pageToken: nextPageToken,
      });

      if (response.data.items?.length) {
        allVideos.push(...response.data.items);
      }

      nextPageToken = response.data.nextPageToken;
    } while (nextPageToken);

    const videos = allVideos.map((item) => ({
      id: item.contentDetails?.videoId,
      title: item.snippet?.title,
      duration: 0, // Duration requires additional API call
    }));

    return videos.filter(
      (v): v is { id: string; title: string; duration: number } =>
        Boolean(v.id && v.title)
    );
  } catch (error) {
    // Handle error silently
    throw new Error("Failed to fetch playlist videos");
  }
}

export async function getVideoDetails(videoId: string) {
  try {
    const response = await youtube.videos.list({
      key: process.env.YOUTUBE_API_KEY,
      part: ["contentDetails"],
      id: [videoId],
    });

    if (!response.data.items?.[0]) {
      throw new Error("Video not found");
    }

    const duration = response.data.items[0].contentDetails?.duration;
    if (!duration) {
      throw new Error("Duration not found");
    }

    // Convert ISO 8601 duration to MM:SS format
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) {
      throw new Error("Invalid duration format");
    }

    const hours = match[1] ? parseInt(match[1]) : 0;
    const minutes = match[2] ? parseInt(match[2]) : 0;
    const seconds = match[3] ? parseInt(match[3]) : 0;

    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    const formattedMinutes = Math.floor(totalSeconds / 60);
    const formattedSeconds = totalSeconds % 60;

    return `${formattedMinutes}:${formattedSeconds
      .toString()
      .padStart(2, "0")}`;
  } catch (error) {
    // Handle error silently
    return "0:00";
  }
}
