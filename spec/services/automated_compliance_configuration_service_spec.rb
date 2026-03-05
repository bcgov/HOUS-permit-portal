require "rails_helper"

RSpec.describe AutomatedComplianceConfigurationService, type: :service do
  let(:requirement) do
    instance_double(
      "Requirement",
      computed_compliance: computed_compliance,
      input_type: input_type,
      value_options: value_options
    )
  end
  let(:input_type) { "text" }
  let(:value_options) { [] }
  let(:computed_compliance) { {} }
  let(:service) { described_class.new(requirement) }

  describe "#merge_default_settings!" do
    let(:computed_compliance) { { "module" => "DigitalSealValidator" } }
    let(:input_type) { "file" }

    it "merges default settings for configured modules" do
      service.merge_default_settings!

      expect(computed_compliance["trigger"]).to eq("on_save")
      expect(computed_compliance["value_on"]).to eq("compliance_data")
    end
  end

  describe "#validate_configuration" do
    context "when module is invalid" do
      let(:computed_compliance) { { "module" => "Nope" } }

      it "returns an error message" do
        expect(service.validate_configuration[:error]).to be_present
      end
    end

    context "when input type is not compatible with module" do
      let(:computed_compliance) do
        {
          "module" => "DigitalSealValidator",
          "trigger" => "on_save",
          "value_on" => "compliance_data"
        }
      end
      let(:input_type) { "text" }

      it "returns an input type error" do
        expect(service.validate_configuration[:error]).to be_present
      end
    end

    context "with a valid value extraction configuration" do
      let(:computed_compliance) do
        { "module" => "PermitApplication", "value" => "full_address" }
      end
      let(:input_type) { "text" }

      it "returns no error" do
        expect(service.validate_configuration[:error]).to be_nil
      end
    end

    context "with invalid options map for external options mapper" do
      let(:computed_compliance) do
        { "module" => "HistoricSite", "options_map" => { "Z" => "yes" } }
      end
      let(:input_type) { "select" }
      let(:value_options) { [{ "value" => "yes" }, { "value" => "no" }] }

      it "returns an options mapping error" do
        expect(service.validate_configuration[:error]).to be_present
      end
    end
  end

  describe ".available_module_names" do
    it "returns configured module names" do
      expect(described_class.available_module_names).to include(
        :PermitApplication,
        :DigitalSealValidator
      )
    end
  end
end
