FactoryBot.define do
  factory :requirement_template_section do
    name { "MyString" }
    code { "MyString" }
    requirement_template { nil }
    position { 1 }
  end
end
