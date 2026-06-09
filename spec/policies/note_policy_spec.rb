require "rails_helper"

RSpec.describe NotePolicy, type: :policy do
  let(:sandbox) { nil }
  let(:jurisdiction) { create(:sub_district, project_meetings_enabled: true) }
  let(:owner) { create(:user, :submitter) }
  let(:reviewer) { create(:user, :reviewer, jurisdiction: jurisdiction) }
  let(:permit_project) do
    create(:permit_project, owner: owner, jurisdiction: jurisdiction)
  end
  let(:meeting) do
    create(:project_meeting, :open, permit_project: permit_project)
  end
  let(:note) { create(:note, noteable: meeting, user: reviewer) }

  before { SiteConfiguration.instance.update!(project_meetings_enabled: true) }

  describe "Scope" do
    def resolved_scope_for(user)
      described_class::Scope.new(
        UserContext.new(user, sandbox),
        Note.all
      ).resolve
    end

    it "includes notes for project owners" do
      note
      create(:note)

      expect(resolved_scope_for(owner)).to contain_exactly(note)
    end

    it "includes all meeting notes in the active sandbox for jurisdiction review staff regardless of status" do
      draft_note =
        create(
          :note,
          noteable: create(:project_meeting, permit_project: permit_project)
        )
      closed_note =
        create(
          :note,
          noteable:
            create(:project_meeting, :closed, permit_project: permit_project)
        )

      expect(resolved_scope_for(reviewer)).to include(
        note,
        draft_note,
        closed_note
      )
    end

    it "excludes notes outside the review staff jurisdiction" do
      other_jurisdiction = create(:sub_district, project_meetings_enabled: true)
      other_project = create(:permit_project, jurisdiction: other_jurisdiction)
      other_note =
        create(
          :note,
          noteable:
            create(:project_meeting, :open, permit_project: other_project)
        )

      expect(resolved_scope_for(reviewer)).not_to include(other_note)
    end

    context "with an active sandbox" do
      let(:sandbox) { create(:sandbox, jurisdiction: jurisdiction) }

      it "only includes notes from that sandbox for jurisdiction review staff" do
        sandbox_project =
          create(
            :permit_project,
            owner: owner,
            jurisdiction: jurisdiction,
            sandbox: sandbox
          )
        sandbox_note =
          create(
            :note,
            noteable:
              create(:project_meeting, :closed, permit_project: sandbox_project)
          )
        live_note = note

        expect(resolved_scope_for(reviewer)).to include(sandbox_note)
        expect(resolved_scope_for(reviewer)).not_to include(live_note)
      end
    end
  end
end
