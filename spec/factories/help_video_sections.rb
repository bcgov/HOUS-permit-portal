FactoryBot.define do
  factory :help_video_section do
    sequence(:title) { |n| "Help video section #{n}" }
    description { "Videos that help users complete common tasks." }
    sequence(:sort_order)
  end
end
