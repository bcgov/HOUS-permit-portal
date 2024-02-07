require "rails_helper"

RSpec.describe AutomatedCompliance::AlrValidator do
  # let!(:requirement_template) {create(:requirement_template)}

  # context "a PID on ALR land" do
  #   let!(:permit_application) {create(:permit_application, requirement_template: requirement_template, pid: "006580548")}

  #   it "updates an application question for ALR reserve and sets it to yes" do
  #     VCR.use_cassette("automated_compliance/alr_validator/pid_on_alr") do
  #       AutomatedCompliance::AlrValidator.call(permit_application)
  #       expect(permit_application.submission_data["data"]["alrquestion"]).to eq(true)
  #     end
  #   end
  # end

  # context "a PID not on ALR land" do
  #   let!(:permit_application) {create(:permit_application, requirement_template: requirement_template, pid: "031562868", full_address: "757 W Hastings St, Vancouver, BC V6C 1A1")}

  #   it "updates an application question for ALR reserve and sets it to yes" do
  #     VCR.use_cassette("automated_compliance/alr_validator/pid_not_on_alr") do
  #       AutomatedCompliance::AlrValidator.call(permit_application)
  #       expect(permit_application.submission_data["data"]["alrquestion"]).to eq(false)
  #     end
  #   end
  # end

  # context "a PID on 5% overlap with ALR land" do
  #   it "pending - get example from LTSA"
  # end
end
