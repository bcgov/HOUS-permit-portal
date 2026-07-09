FactoryBot.define do
  factory :help_video_document do
    association :help_video
    file_data do
      {
        "id" => SecureRandom.uuid,
        "storage" => "cache",
        "metadata" => {
          "size" => 321,
          "filename" => "video.mp4",
          "mime_type" => "video/mp4"
        }
      }
    end
    scan_status { "clean" }

    factory :help_video_video_document, class: "HelpVideoVideoDocument" do
      file_data do
        {
          "id" => SecureRandom.uuid,
          "storage" => "cache",
          "metadata" => {
            "size" => 30.megabytes,
            "filename" => "video.mp4",
            "mime_type" => "video/mp4"
          }
        }
      end
    end

    factory :help_video_caption_document, class: "HelpVideoCaptionDocument" do
      file_data do
        {
          "id" => SecureRandom.uuid,
          "storage" => "cache",
          "metadata" => {
            "size" => 1.kilobyte,
            "filename" => "captions.vtt",
            "mime_type" => "text/vtt"
          }
        }
      end
    end

    factory :help_video_transcript_document,
            class: "HelpVideoTranscriptDocument" do
      file_data do
        {
          "id" => SecureRandom.uuid,
          "storage" => "cache",
          "metadata" => {
            "size" => 1.kilobyte,
            "filename" => "transcript.txt",
            "mime_type" => "text/plain"
          }
        }
      end
    end
  end
end
