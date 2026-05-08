FactoryBot.define do
  factory :help_video do
    association :help_video_section
    sequence(:title) { |n| "Help video #{n}" }
    description { "A short help video." }
    published_at { nil }

    trait :with_required_documents do
      after(:build) do |video|
        video.video_document ||=
          build(:help_video_video_document, help_video: video)
        video.caption_document ||=
          build(:help_video_caption_document, help_video: video)
      end
    end

    trait :published do
      with_required_documents
      published_at { Time.current }
    end
  end
end
