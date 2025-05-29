import { NoteEditor } from "@/components/note-editor";

export default function ChapterPage({
  params,
}: {
  params: { courseId: string; chapterId: string };
}) {
  // TODO: Fetch video data using params.chapterId
  const video = { id: "", videoId: "" }; // Temporary placeholder

  return (
    <>
      {/* Video Player */}
      <div className="aspect-video relative">
        <iframe
          src={`https://www.youtube.com/embed/${video.videoId}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full rounded-lg"
        />
      </div>

      {/* Notes Section */}
      <NoteEditor videoId={video.id} courseId={params.courseId} />

      {/* Video Title and Description */}
    </>
  );
}
