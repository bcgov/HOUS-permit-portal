FactoryBot.define do
  factory :permit_project_collaboration do
    association :permit_project

    collaborator do
      jurisdiction = permit_project.jurisdiction
      user = create(:user, :review_manager, jurisdiction: jurisdiction)

      jurisdiction.collaborators.find_or_create_by!(user: user)
    end
  end
end
