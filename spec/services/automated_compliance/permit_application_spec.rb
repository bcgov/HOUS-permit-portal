require "rails_helper"

RSpec.describe AutomatedCompliance::PermitApplication, type: :service do
  let(:service) { described_class.new }

  describe "#call" do
    it "returns early when full_address is blank" do
      permit_application =
        instance_double("PermitApplication", full_address: nil)

      expect(permit_application).not_to receive(:with_lock)
      service.call(permit_application)
    end

    it "updates whitelisted computed fields and saves once" do
      compliance_data = { "fieldA" => "old", "fieldB" => "old" }
      requirements = {
        "fieldA" => {
          "key" => "some_field",
          "computedCompliance" => {
            "value" => "full_address"
          }
        },
        "fieldB" => {
          "key" => "parcel_additional_pid_info",
          "computedCompliance" => {
            "value" => "pid"
          },
          "components" => [
            {
              "components" => [
                { "columns" => [{ "components" => [{ "key" => "pid_key" }] }] }
              ]
            }
          ]
        },
        "ignored" => {
          "key" => "ignored",
          "computedCompliance" => {
            "value" => "non_whitelisted_field"
          }
        }
      }

      permit_application = instance_double("PermitApplication")
      allow(permit_application).to receive(:full_address).and_return(
        "123 Main St"
      )
      allow(permit_application).to receive(:pid).and_return("111222333")
      allow(permit_application).to receive(:compliance_data).and_return(
        compliance_data
      )
      allow(permit_application).to receive(
        :automated_compliance_requirements_for_module
      ).with("PermitApplication").and_return(requirements)
      allow(permit_application).to receive(:with_lock).and_yield
      allow(permit_application).to receive(:save!)

      service.call(permit_application)

      expect(compliance_data["fieldA"]).to eq("123 Main St")
      expect(compliance_data["fieldB"]).to eq([{ "pid_key" => "111222333" }])
      expect(permit_application).to have_received(:save!).once
    end

    it "does not save when values have not changed" do
      compliance_data = { "fieldA" => "123 Main St" }
      requirements = {
        "fieldA" => {
          "key" => "some_field",
          "computedCompliance" => {
            "value" => "full_address"
          }
        }
      }

      permit_application = instance_double("PermitApplication")
      allow(permit_application).to receive(:full_address).and_return(
        "123 Main St"
      )
      allow(permit_application).to receive(:compliance_data).and_return(
        compliance_data
      )
      allow(permit_application).to receive(
        :automated_compliance_requirements_for_module
      ).with("PermitApplication").and_return(requirements)
      allow(permit_application).to receive(:with_lock).and_yield
      allow(permit_application).to receive(:save!)

      service.call(permit_application)

      expect(permit_application).not_to have_received(:save!)
    end
  end
end
