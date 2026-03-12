require "rails_helper"

RSpec.describe VirusScanService do
  let(:shrine_file) do
    double("Shrine::UploadedFile", id: "file.pdf", open: nil)
  end

  before do
    stub_const("CLAMAV_ENABLED", true)
    stub_const("CLAMAV_CONFIG", { host: "127.0.0.1", port: 3310 })
    allow(Rails.logger).to receive(:info)
    allow(Rails.logger).to receive(:warn)
    allow(Rails.logger).to receive(:error)

    # If clamav-client is not loaded in this test environment, define minimal constants.
    unless defined?(ClamAV::SuccessResponse)
      module ::ClamAV
        module Commands
          class InstreamCommand
            def initialize(_io)
            end
          end
        end
        class SuccessResponse
        end
        class VirusResponse
          def initialize(name = "Eicar-Test-Signature")
            @name = name
          end
          def virus_name = @name
        end
        class ErrorResponse
          def initialize(error_str = "bad")
            @error_str = error_str
          end
          def error_str = @error_str
        end
      end
    end
  end

  subject(:service) { described_class.new(shrine_file) }

  describe "#scan!" do
    it "raises NotEnabledError when clamav is disabled" do
      stub_const("CLAMAV_ENABLED", false)
      expect { service.scan! }.to raise_error(VirusScanService::NotEnabledError)
    end

    it "returns true for clean file" do
      allow(shrine_file).to receive(:open).and_yield(StringIO.new("data"))
      client = instance_double("ClamAVClient")
      ok_resp = ClamAV::SuccessResponse.allocate
      allow(client).to receive(:execute).and_return(ok_resp)
      allow(service).to receive(:build_clamav_client).and_return(client)

      expect(service.scan!).to eq(true)
      expect(Rails.logger).to have_received(:info).with(/File clean/)
    end

    it "raises InfectedFileError for infected file with virus name and file id" do
      allow(shrine_file).to receive(:open).and_yield(StringIO.new("data"))
      client = instance_double("ClamAVClient")
      virus_resp = ClamAV::VirusResponse.allocate
      allow(virus_resp).to receive(:virus_name).and_return("BadVirus")
      allow(client).to receive(:execute).and_return(virus_resp)
      allow(service).to receive(:build_clamav_client).and_return(client)

      expect { service.scan! }.to raise_error(
        VirusScanService::InfectedFileError
      ) { |e|
        expect(e.virus_name).to eq("BadVirus")
        expect(e.file_id).to eq("file.pdf")
      }
      expect(Rails.logger).to have_received(:warn).with(/Virus detected/)
    end
  end

  describe "#safe?" do
    it "returns false for infected files" do
      allow(service).to receive(:scan!).and_raise(
        VirusScanService::InfectedFileError.new("x")
      )
      expect(service.safe?).to eq(false)
    end

    it "returns false and logs for ScanError" do
      allow(service).to receive(:scan!).and_raise(
        VirusScanService::ScanError.new("nope")
      )
      expect(service.safe?).to eq(false)
      expect(Rails.logger).to have_received(:error).with(/Scan error: nope/)
    end
  end

  describe "private response parsing" do
    it "parses string OK/FOUND/ERROR responses" do
      expect(service.send(:parse_string_response, "stream: OK")).to eq(
        { infected: false, virus_name: nil }
      )
      expect(service.send(:parse_string_response, "stream: Eicar FOUND")).to eq(
        { infected: true, virus_name: "Eicar" }
      )
      expect {
        service.send(:parse_string_response, "stream: Bad ERROR")
      }.to raise_error(VirusScanService::ScanError)
    end
  end
end
