require "rails_helper"

RSpec.describe PdfRenderer do
  class DummyRenderer
    include PdfRenderer
  end

  let(:renderer) { DummyRenderer.new }

  it "camelizes hashes and arrays" do
    expect(renderer.camelize_response({ "a_b" => [{ "c_d" => 1 }] })).to eq(
      { "aB" => [{ "cD" => 1 }] }
    )
  end

  it "writes JSON to tmp and ensures directory exists" do
    Dir.mktmpdir do |dir|
      file = renderer.write_json_to_tmp(dir, "x.json", { a: 1 })
      expect(File.exist?(file)).to be true
      expect(JSON.parse(File.read(file))).to eq({ "a" => 1 })
    end
  end

  it "runs node renderer and returns exit status" do
    exit_status = instance_double(Process::Status, success?: true)
    allow(Open3).to receive(
      :popen3
    ) do |_a, _b, _c, _json_filename, chdir:, &block|
      stdout = StringIO.new("ok\n")
      stderr = StringIO.new("")
      wait_thr = instance_double("WaitThread", value: exit_status)
      block.call(nil, stdout, stderr, wait_thr)
      exit_status
    end

    Dir.mktmpdir do |dir|
      json_file = renderer.write_json_to_tmp(dir, "y.json", { a: 1 })
      expect(renderer.run_node_pdf_renderer(json_file)).to eq(exit_status)
    end
  end
end
