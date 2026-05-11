# frozen_string_literal: true

class HelpVideoSeeder
  SECTIONS = [
    {
      title: "Building Permit Hub basics",
      description: "Learn what Building Permit Hub is and how to get around.",
      videos: [
        {
          title: "Why we made Building Permit Hub",
          description:
            "Learn why Building Permit Hub was created and how it helps streamline permitting across British Columbia."
        },
        {
          title: "How to log in for the first time",
          description:
            "Follow the steps to sign in for the first time and access your Building Permit Hub account."
        },
        {
          title: "How to navigate Building Permit Hub",
          description:
            "Get an overview of the navigation menu, projects, and key tools available in Building Permit Hub."
        }
      ]
    },
    {
      title: "Start a project",
      description:
        "Prepare a new project and create your first permit application.",
      videos: [
        {
          title: "Welcome page and jurisdiction-specific About pages",
          description:
            "Learn where to find local jurisdiction information before starting an application."
        },
        {
          title: "How to create a project",
          description:
            "Step through creating a new project and entering the basic project details."
        }
      ]
    },
    {
      title: "Review and manage permit applications",
      description:
        "Track application progress and respond to reviewer feedback.",
      videos: [
        {
          title: "Starting a new permit application",
          description:
            "Step-by-step guide to creating a new building permit application."
        },
        {
          title: "Understanding reviewer comments",
          description:
            "Learn how to read and interpret feedback from permit reviewers."
        }
      ]
    },
    {
      title: "Set up your jurisdiction",
      description: "Configure jurisdiction settings and submission workflows.",
      videos: [
        {
          title: "Configure submission contacts",
          description:
            "Set up the contacts that receive and manage submitted applications."
        },
        {
          title: "Manage requirement templates",
          description:
            "Learn how requirement templates control the information applicants provide."
        }
      ]
    }
  ].freeze

  def self.call
    new.call
  end

  def call
    SECTIONS.each_with_index do |section_attributes, section_index|
      section =
        HelpVideoSection.find_or_initialize_by(
          title: section_attributes[:title]
        )
      section.description = section_attributes[:description]
      section.save!
      section.insert_at(section_index)

      section_attributes[
        :videos
      ].each_with_index do |video_attributes, video_index|
        seed_video(section, video_attributes, video_index)
      end
    end

    SECTIONS.size
  end

  private

  def seed_video(section, video_attributes, video_index)
    video = HelpVideo.find_or_initialize_by(title: video_attributes[:title])
    video.assign_attributes(
      help_video_section: section,
      description_html: description_html_for(video_attributes)
    )
    video.save!
    video.insert_at(video_index)

    seed_documents(video)
    video.update!(published_at: Time.current)
  end

  def seed_documents(video)
    file_key = video.title.parameterize
    seed_document(
      video: video,
      klass: HelpVideoVideoDocument,
      filename: "#{file_key}.mp4",
      mime_type: "video/mp4",
      size: 35.megabytes
    )
    seed_document(
      video: video,
      klass: HelpVideoCaptionDocument,
      filename: "#{file_key}.vtt",
      mime_type: "text/vtt"
    )
    seed_document(
      video: video,
      klass: HelpVideoTranscriptDocument,
      filename: "#{file_key}-transcript.txt",
      mime_type: "text/plain"
    )
  end

  def description_html_for(video_attributes)
    <<~HTML.squish
      <p>#{video_attributes[:description]}</p>
      <h3><b>Topics covered</b></h3>
      <ul><li>Add topics covered in this video.</li></ul>
    HTML
  end

  def seed_document(video:, klass:, filename:, mime_type:, size: 1.kilobyte)
    document = klass.find_or_initialize_by(help_video: video)
    document.assign_attributes(
      file_data:
        file_data(filename: filename, mime_type: mime_type, size: size),
      scan_status: "clean"
    )
    document.save!
  end

  def file_data(filename:, mime_type:, size:)
    {
      "id" => "seed/help-videos/#{filename}",
      "storage" => "store",
      "metadata" => {
        "size" => size,
        "filename" => filename,
        "mime_type" => mime_type
      }
    }
  end
end
