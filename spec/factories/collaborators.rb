FactoryBot.define do
  factory :collaborator do
    transient { jurisdiction { create(:sub_district) } }

    user { create(:user, :reviewer, jurisdiction: jurisdiction) }

    # Membership callbacks already insert the roster row.
    initialize_with { jurisdiction.collaborators.find_by!(user_id: user.id) }
  end
end
