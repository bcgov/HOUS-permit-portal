require "rails_helper"

RSpec.describe EarlyAccessPreview, type: :model do
  let(:early_access_preview) { create(:early_access_preview) }

  describe "Associations" do
    it { should belong_to(:early_access_requirement_template) }
    it { should belong_to(:previewer).class_name("User") }
  end

  describe "Discardable Functionality" do
    let(:preview) { create(:early_access_preview) }

    it "can be discarded" do
      expect(preview).not_to be_discarded
      preview.discard
      expect(preview).to be_discarded
      expect(preview.discarded_at).to be_present
    end

    it "can be undiscarded" do
      preview.discard
      expect(preview).to be_discarded
      preview.undiscard
      expect(preview).not_to be_discarded
      expect(preview.discarded_at).to be_nil
    end
  end

  describe "Validations" do
    context "without setting expires_at manually" do
      it "is valid when all required fields are present" do
        expect(early_access_preview).to be_valid
      end
    end

    context "when early_access_requirement_template_id is missing" do
      it "is invalid" do
        early_access_preview.early_access_requirement_template = nil
        expect(early_access_preview).not_to be_valid
        expect(
          early_access_preview.errors[:early_access_requirement_template]
        ).to include("must exist")
      end
    end

    context "when previewer_id is missing" do
      it "is invalid" do
        early_access_preview.previewer = nil
        expect(early_access_preview).not_to be_valid
        expect(early_access_preview.errors[:previewer]).to include("must exist")
      end
    end

    context "when expires_at is deleted" do
      it "is restored" do
        # Bypass the before_validation callback by using `new` without triggering callbacks
        early_access_preview.expires_at = nil
        expect(early_access_preview).to be_valid
        expect(early_access_preview.expires_at).to_not be_nil
      end
    end
  end

  describe "Callbacks" do
    describe "before_validation :set_expires_at on create" do
      let(:current_time) { Time.current }

      before { allow(Time).to receive(:current).and_return(current_time) }

      context "when EARLY_ACCESS_EXPIRATION_DAYS is set" do
        before do
          stub_const(
            "ENV",
            ENV.to_hash.merge("EARLY_ACCESS_EXPIRATION_DAYS" => "90")
          )
        end

        context "and created_at is present" do
          it "sets expires_at to created_time + 90 days" do
            Timecop.freeze(current_time) do
              created_time = current_time - 1.day
              early_access_preview.created_at = created_time
              early_access_preview.expires_at = nil
              early_access_preview.valid?
              expect(early_access_preview.expires_at).to be_within(1.second).of(
                created_time + 90.days
              )
            end
          end
        end

        context "and created_at is nil" do
          it "sets expires_at to current_time + 90 days" do
            Timecop.freeze(current_time) do
              early_access_preview.created_at = nil
              early_access_preview.expires_at = nil

              early_access_preview.valid?
              expect(early_access_preview.expires_at).to be_within(1.second).of(
                current_time + 90.days
              )
            end
          end
        end
      end

      context "when EARLY_ACCESS_EXPIRATION_DAYS is not set" do
        before do
          stub_const("ENV", ENV.to_hash.except("EARLY_ACCESS_EXPIRATION_DAYS"))
        end

        context "and created_at is present" do
          it "defaults expires_at to created_at + 60 days" do
            Timecop.freeze(current_time) do
              created_time = current_time - 2.days
              early_access_preview.created_at = created_time
              early_access_preview.expires_at = nil

              early_access_preview.valid?
              expect(early_access_preview.expires_at).to be_within(1.second).of(
                created_time + 60.days
              )
            end
          end
        end

        context "and created_at is nil" do
          it "defaults expires_at to current_time + 60 days" do
            Timecop.freeze(current_time) do
              early_access_preview.created_at = nil
              early_access_preview.expires_at = nil

              early_access_preview.valid?
              expect(early_access_preview.expires_at).to be_within(1.second).of(
                current_time + 60.days
              )
            end
          end
        end
      end

      context "when expires_at is already set" do
        it "does not override the existing expires_at" do
          Timecop.freeze(current_time) do
            existing_expires_at = current_time + 10.days
            early_access_preview.expires_at = existing_expires_at

            early_access_preview.valid?
            expect(early_access_preview.expires_at).to be_within(1.second).of(
              existing_expires_at
            )
          end
        end
      end
    end
  end

  describe "Delegations" do
    it do
      should delegate_method(:frontend_url).to(
               :early_access_requirement_template
             )
    end
  end

  describe "#extend_access" do
    let(:initial_expires_at) { 1.week.from_now }
    let(:new_expires_at) { 60.days.from_now }
    let(:current_time) { Time.current }

    before do
      early_access_preview.expires_at = initial_expires_at
      early_access_preview.save!
      allow(early_access_preview).to receive(:set_expires_at).and_call_original
    end

    it "sets expires_at to nil and then recalculates it based on the default duration" do
      Timecop.freeze(current_time) do
        allow(ENV).to receive(:[]).with(
          "EARLY_ACCESS_EXPIRATION_DAYS"
        ).and_return(nil)

        expect { early_access_preview.extend_access }.to change {
          early_access_preview.expires_at
        }.to(be_within(1.second).of(current_time + 60.days))
      end
    end

    context "when EARLY_ACCESS_EXPIRATION_DAYS is set" do
      before do
        stub_const(
          "ENV",
          ENV.to_hash.merge("EARLY_ACCESS_EXPIRATION_DAYS" => "30")
        )
      end

      it "updates expires_at based on the new expiration_days" do
        Timecop.freeze(current_time) do
          early_access_preview.created_at = current_time - 1.day
          early_access_preview.expires_at = initial_expires_at

          early_access_preview.extend_access
          expect(early_access_preview.expires_at).to be_within(1.second).of(
            current_time + 30.days
          )
        end
      end
    end
  end

  describe "Factory" do
    it "has a valid factory" do
      expect(early_access_preview).to be_valid
    end

    context "with :discarded trait" do
      let(:discarded_preview) { build(:early_access_preview, :discarded) }

      it "is discarded" do
        expect(discarded_preview).to be_discarded
        expect(discarded_preview.discarded_at).to be_present
      end
    end
  end
end
