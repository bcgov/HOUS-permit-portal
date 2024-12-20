# spec/models/early_access_requirement_template_spec.rb
require "rails_helper"

RSpec.describe EarlyAccessRequirementTemplate, type: :model do
  subject { build(:early_access_requirement_template) }

  describe "Associations" do
    it { should belong_to(:assignee).class_name("User").optional }
    it { should have_many(:early_access_previews).dependent(:destroy) }
    it do
      should have_many(:previewers).through(:early_access_previews).source(
               :previewer
             )
    end
    it do
      should belong_to(:copied_from).class_name("RequirementTemplate").optional
    end
    it { should have_many(:requirement_template_sections).dependent(:destroy) }
    it do
      should have_many(:requirement_blocks).through(
               :requirement_template_sections
             )
    end
    it { should have_many(:requirements).through(:requirement_blocks) }

    it do
      should have_one(:published_template_version).class_name("TemplateVersion")
    end
  end

  describe "Validations" do
    subject { build(:early_access_requirement_template) }

    describe "#valid_template_version_status" do
      context "Valid and the published version was created automatically" do
        before { subject.save }

        it "is valid" do
          expect(subject).to be_valid
        end

        it "has exactly one published template version" do
          expect(subject.template_versions.count).to eq(1)
          expect(subject.template_versions.first.status).to eq("published")
        end

        it "includes the published version in template_versions" do
          expect(subject.template_versions).to include(
            an_object_having_attributes(status: "published")
          )
        end
      end

      context "when there is an extra published template version" do
        before do
          create(
            :template_version,
            requirement_template: subject,
            status: "published"
          )
        end

        it "is invalid" do
          subject.reload
          expect(subject).to_not be_valid
        end
      end

      context "when the template versions are destroyed" do
        it "version is regenerated and model is valid" do
          subject.template_versions.destroy_all
          expect(subject).to be_valid
          expect(subject.template_versions.count).to eq(1)
        end
      end

      context "when there are multiple template versions" do
        before do
          create(
            :template_version,
            requirement_template: subject,
            status: "published"
          )
          create(
            :template_version,
            requirement_template: subject,
            status: "deprecated"
          )
        end

        it "is invalid" do
          subject.reload
          expect(subject).not_to be_valid
          expect(subject.errors[:template_versions]).to include(
            I18n.t(
              "activerecord.errors.models.requirement_template.attributes.template_versions.published_required_for_early_access"
            )
          )
        end
      end

      context "when the single template version is not published" do
        before do
          create(
            :template_version,
            requirement_template: subject,
            status: "scheduled"
          )
        end

        it "is invalid" do
          subject.reload
          expect(subject).not_to be_valid
          expect(subject.errors[:template_versions]).to include(
            I18n.t(
              "activerecord.errors.models.requirement_template.attributes.template_versions.published_required_for_early_access"
            )
          )
        end
      end
    end

    describe "public_only_for_early_access_preview" do
      context "when public is true and type is EarlyAccessRequirementTemplate" do
        it "is valid" do
          template = build(:early_access_requirement_template, public: true)
          allow(template).to receive(:early_access?).and_return(true)
          expect(template).to be_valid
        end
      end

      context "when public is true and type is not EarlyAccessRequirementTemplate" do
        it "is invalid" do
          template = build(:early_access_requirement_template, public: true)
          allow(template).to receive(:early_access?).and_return(false)
          expect(template).not_to be_valid
          expect(template.errors[:public]).to include(
            I18n.t(
              "activerecord.errors.models.requirement_template.attributes.public.true_on_early_access_only"
            )
          )
        end
      end
    end
  end

  describe "Callbacks" do
    let(:template) { build(:early_access_requirement_template) }

    describe "before_validation :maintain_published_early_access_version" do
      it "calls TemplateVersioningService.create_or_update_published_version_for_early_access!" do
        expect(TemplateVersioningService).to receive(
          :create_or_update_published_version_for_early_access!
        ).with(template)
        template.valid?
      end

      context "when TemplateVersionPublishError is raised" do
        before do
          allow(TemplateVersioningService).to receive(
            :create_or_update_published_version_for_early_access!
          ).and_raise(TemplateVersionPublishError.new("Publish failed"))
        end

        it "adds an error to :base and rolls back the transaction" do
          expect { template.valid? }.to raise_error(ActiveRecord::Rollback)

          expect(template.errors[:base]).to include("Publish failed")
        end
      end
    end
  end

  describe "Instance Methods" do
    let(:template) { create(:early_access_requirement_template) }

    describe "#frontend_url" do
      it "returns the correct frontend URL" do
        expected_url =
          FrontendUrlHelper.frontend_url(
            "early-access/requirement-templates/#{template.id}"
          )
        expect(template.frontend_url).to eq(expected_url)
      end
    end

    describe "#visibility" do
      it "returns 'early_access'" do
        expect(template.visibility).to eq("early_access")
      end
    end
  end

  describe "Search Includes" do
    it "includes :assignee and :early_access_previews in SEARCH_INCLUDES" do
      expect(EarlyAccessRequirementTemplate::SEARCH_INCLUDES).to include(
        :assignee,
        :early_access_previews
      )
      RequirementTemplate::SEARCH_INCLUDES.each do |include_item|
        expect(EarlyAccessRequirementTemplate::SEARCH_INCLUDES).to include(
          include_item
        )
      end
    end
  end

  describe "Error Handling" do
    let(:template) { build(:early_access_requirement_template) }

    it "does not save the template and adds an error" do
      # Stub the service method to raise an error
      allow(TemplateVersioningService).to receive(
        :create_or_update_published_version_for_early_access!
      ).and_raise(TemplateVersionPublishError.new("Error publishing"))

      # Attempt to save the template
      expect(template.save).to be_falsey

      # Verify that the appropriate error is added
      expect(template.errors[:base]).to include("Error publishing")

      # Optionally, ensure the template is not persisted
      expect(template).not_to be_persisted
    end
  end
end
