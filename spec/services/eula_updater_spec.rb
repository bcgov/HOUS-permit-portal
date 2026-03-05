require "rails_helper"

RSpec.describe EulaUpdater do
  describe ".run" do
    let(:content_path) { Rails.root.join("eulas") }

    before do
      allow(EndUserLicenseAgreement).to receive_message_chain(
        :variants,
        :keys
      ).and_return(%w[submitter reviewer])
      allow(Rails.root).to receive(:join).with("eulas").and_return(content_path)
    end

    it "creates/updates EULAs from variant files (override existing)" do
      file_path = content_path.join("submitter.html")
      allow(File).to receive(:exist?).and_call_original
      allow(File).to receive(:exist?).with(file_path).and_return(true)
      allow(File).to receive(:exist?).with(
        content_path.join("reviewer.html")
      ).and_return(false)

      allow(File).to receive(:read).with(file_path).and_return("abc\u0000def")

      eula = instance_double("EndUserLicenseAgreement", save: true)
      allow(eula).to receive(:content=)
      allow(EndUserLicenseAgreement).to receive(
        :find_or_initialize_by
      ).and_return(eula)

      described_class.run(should_override_existing: true)

      expect(EndUserLicenseAgreement).to have_received(
        :find_or_initialize_by
      ).with(active: true, variant: "submitter")
      expect(eula).to have_received(:content=).with("abcdef")
      expect(eula).to have_received(:save)
    end

    it "builds new EULA when should_override_existing is false" do
      file_path = content_path.join("submitter.html")
      allow(File).to receive(:exist?).with(file_path).and_return(true)
      allow(File).to receive(:exist?).with(
        content_path.join("reviewer.html")
      ).and_return(false)
      allow(File).to receive(:read).with(file_path).and_return("abc")

      eula =
        instance_double(
          "EndUserLicenseAgreement",
          save: false,
          errors: double("Errors", full_messages: ["bad"])
        )
      allow(eula).to receive(:content=)
      allow(EndUserLicenseAgreement).to receive(:build).and_return(eula)

      described_class.run(should_override_existing: false)

      expect(EndUserLicenseAgreement).to have_received(:build).with(
        active: true,
        variant: "submitter"
      )
      expect(eula).to have_received(:save)
    end
  end
end
