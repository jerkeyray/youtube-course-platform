export default function ChapterPage({
  params,
}: {
  params: { courseId: string; chapterId: string };
}) {
  // TODO: Fetch video data using params.chapterId
  const video = { id: "", videoId: "" }; // Temporary placeholder

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="bg-black min-h-screen">
        <div className="container pt-8 pb-8 px-4 lg:px-6">
          {/* Video Player */}
          <div className="aspect-video relative mb-6">
            <iframe
              key={video.videoId}
              src={`https://www.youtube-nocookie.com/embed/${video.videoId}?rel=0&showinfo=0&modestbranding=1&enablejsapi=1&iv_load_policy=3&fs=1&cc_load_policy=0`}
              title="Video Player"
              className="w-full h-full rounded-lg border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
            />
          </div>

          {/* Video Title and Description */}
        </div>
      </div>
    </div>
  );
}
