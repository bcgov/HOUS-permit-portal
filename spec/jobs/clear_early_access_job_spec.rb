# spec/jobs/clear_early_access_job.rb

require "rails_helper"
require "sidekiq/testing"
require "sidekiq/cron"

RSpec.describe ClearEarlyAccessJob, type: :job do
  describe "#perform" do
    let!(:permit_application) { create(:permit_application) }
    let!(:part_3_to_delete) do
      create(:part_3_step_code, permit_application: nil, created_at: 2.days.ago)
    end
    let!(:part_3_with_application) do
      create(
        :part_3_step_code,
        permit_application: permit_application,
        created_at: 2.days.ago
      )
    end
    let!(:part_3_with_user) do
      #TODO - SHOULD HAVE USER PARAM TO DISTINGUISH STANDALONE USER CREATED STEP CODES
      create(
        :part_3_step_code,
        permit_application: permit_application,
        created_at: 2.days.ago
      )
    end
    let!(:part_3_in_process) do
      create(
        :part_3_step_code,
        permit_application: nil,
        created_at: 1.hours.ago
      )
    end
    let!(:part_9_to_delete) do
      create(:part_9_step_code, permit_application: nil, created_at: 2.days.ago)
    end
    it "deletes only the part 3 in progress, and not the others" do
      expect { ClearEarlyAccessJob.new.perform }.to change {
        Part3StepCode.count
      }.by(-1)
      expect(Part3StepCode.all).to include(
        part_3_with_application,
        part_3_with_user,
        part_3_in_process
      )
    end

    it "properly deletes a part 9 step code" do
      expect { ClearEarlyAccessJob.new.perform }.to change {
        Part9StepCode.count
      }.by(-1)
    end
  end
end
