require "rails_helper"
require "socket"

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
    allow(shrine_file).to receive(:open).and_yield(StringIO.new("data"))
  end

  subject(:service) { described_class.new(shrine_file) }

  def with_clamav
    server = TCPServer.new("127.0.0.1", 0)
    stub_const("CLAMAV_CONFIG", { host: "127.0.0.1", port: server.addr[1] })
    yield server
  ensure
    server&.close
  end

  def read_instream(client)
    buf = +""
    buf << client.readpartial(4096) until buf.include?("\x00\x00\x00\x00")
    buf
  end

  describe "#scan!" do
    it "raises NotEnabledError when clamav is disabled" do
      stub_const("CLAMAV_ENABLED", false)
      expect { service.scan! }.to raise_error(VirusScanService::NotEnabledError)
    end

    it "returns true for clean file" do
      with_clamav do |server|
        Thread.new do
          client = server.accept
          read_instream(client)
          client.write("stream: OK\n")
          client.close
        end

        expect(service.scan!).to eq(true)
      end
      expect(Rails.logger).to have_received(:info).with(/File clean/)
    end

    it "raises InfectedFileError for infected file with virus name and file id" do
      with_clamav do |server|
        Thread.new do
          client = server.accept
          read_instream(client)
          client.write("stream: BadVirus FOUND\n")
          client.close
        end

        expect { service.scan! }.to raise_error(
          VirusScanService::InfectedFileError
        ) { |e|
          expect(e.virus_name).to eq("BadVirus")
          expect(e.file_id).to eq("file.pdf")
        }
      end
      expect(Rails.logger).to have_received(:warn).with(/Virus detected/)
    end

    it "raises ScanError when ClamAV closes the connection" do
      with_clamav do |server|
        Thread.new do
          client = server.accept
          client.close
        end

        expect { service.scan! }.to raise_error(VirusScanService::ScanError)
      end
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
