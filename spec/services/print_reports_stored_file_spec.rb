require "rails_helper"
require "shrine/storage/memory"

RSpec.describe PrintReports::StoredFile do
  let(:storage) { Shrine::Storage::Memory.new }
  let(:uploader) do
    Class.new(Shrine).tap { |klass| klass.storages = { store: storage } }
  end
  let(:temporary_paths) { [] }

  before do
    # S3 opens a stream, not a local File. Use the same IO type without network access.
    allow(storage).to receive(:open) do |id, **_options|
      Down::ChunkedIO.new(chunks: [storage.store.fetch(id)].each)
    end
  end

  after do
    expect(temporary_paths).to all(satisfy { |path| !File.exist?(path) })
  end

  def uploaded_file(bytes, extension)
    file =
      uploader.new(:store).upload(
        StringIO.new(bytes),
        metadata: {
          "filename" => "report.#{extension}"
        }
      )
    allow(file).to receive(:download).and_wrap_original do |original, &block|
      original.call do |tempfile|
        temporary_paths << tempfile.path
        block.call(tempfile)
      end
    end
    file
  end

  %w[pdf zip].each do |kind|
    context "#{kind} validation" do
      let(:bytes) do
        if kind == "pdf"
          File.binread(
            Rails.root.join("spec/support/Test Document Seal - unsigned.pdf")
          )
        else
          Zip::OutputStream
            .write_buffer do |zip|
              zip.put_next_entry("answer.txt")
              zip.write("Synthetic saved answer")
            end
            .string
        end
      end
      let(:file) { uploaded_file(bytes, kind) }
      let(:method) { "valid_#{kind}?" }

      it "validates S3-style streams and removes the temporary download" do
        expect(described_class.public_send(method, file)).to be true
        expect(temporary_paths.length).to eq(1)
      end

      it "rejects corrupt content and removes the temporary download" do
        expect(
          described_class.public_send(method, uploaded_file("broken", kind))
        ).to be false
        expect(temporary_paths.length).to eq(1)
      end

      it "returns false for a missing object" do
        file.delete
        expect(described_class.public_send(method, file)).to be false
      end

      it "propagates storage failures" do
        allow(storage).to receive(:open).and_raise(
          IOError,
          "Storage unavailable"
        )
        expect { described_class.public_send(method, file) }.to raise_error(
          IOError,
          "Storage unavailable"
        )
      end
    end
  end
end
