require "rails_helper"

RSpec.describe PermitProjectSeederService do
  describe ".call" do
    it "delegates to instance seed" do
      service = instance_double(described_class, seed: true)
      allow(described_class).to receive(:new).and_return(service)

      described_class.call

      expect(service).to have_received(:seed)
    end
  end

  describe "#seed" do
    before do
      allow(Rails.logger).to receive(:info)
      allow(Rails.logger).to receive(:warn)
      allow(Rails.logger).to receive(:error)
      allow(PermitProject).to receive(:reindex)
      allow(ActiveRecord::Base).to receive(:transaction).and_yield
    end

    it "skips applications that already have a permit_project_id" do
      allow(PermitApplication).to receive(:pluck).with(:id).and_return([1])
      pa =
        instance_double("PermitApplication", id: 1, permit_project_id: "pp-1")
      allow(PermitApplication).to receive(:find).with(1).and_return(pa)

      described_class.new.seed

      expect(PermitProject).to have_received(:reindex)
    end

    it "skips when old jurisdiction_id is blank" do
      allow(PermitApplication).to receive(:pluck).with(:id).and_return([1])
      pa =
        instance_double(
          "PermitApplication",
          id: 1,
          permit_project_id: nil,
          read_attribute_before_type_cast: nil
        )
      allow(pa).to receive(:read_attribute_before_type_cast).with(
        :jurisdiction_id
      ).and_return(nil)
      allow(pa).to receive(:read_attribute_before_type_cast).with(
        :nickname
      ).and_return(nil)
      allow(pa).to receive(:read_attribute_before_type_cast).with(
        :full_address
      ).and_return("Addr, City")
      allow(pa).to receive(:read_attribute_before_type_cast).with(
        :pid
      ).and_return(nil)
      allow(pa).to receive(:read_attribute_before_type_cast).with(
        :pin
      ).and_return(nil)

      allow(PermitApplication).to receive(:find).with(1).and_return(pa)

      described_class.new.seed

      expect(Rails.logger).to have_received(:warn).with(
        /Skipping PermitProject creation/
      )
    end

    it "creates permit project and associates it to permit application" do
      allow(PermitApplication).to receive(:pluck).with(:id).and_return([1])

      submitter = instance_double("User", id: "u1")
      pa =
        instance_double(
          "PermitApplication",
          id: 1,
          permit_project_id: nil,
          submitter: submitter
        )
      allow(pa).to receive(:read_attribute_before_type_cast).with(
        :jurisdiction_id
      ).and_return("j1")
      allow(pa).to receive(:read_attribute_before_type_cast).with(
        :nickname
      ).and_return("Nick")
      allow(pa).to receive(:read_attribute_before_type_cast).with(
        :full_address
      ).and_return("123 St, City")
      allow(pa).to receive(:read_attribute_before_type_cast).with(
        :pid
      ).and_return("pid")
      allow(pa).to receive(:read_attribute_before_type_cast).with(
        :pin
      ).and_return("pin")
      allow(pa).to receive(:permit_project=)
      allow(pa).to receive(:valid?).and_return(true)
      allow(pa).to receive(:save).and_return(true)
      allow(pa).to receive(:errors).and_return(double(full_messages: []))

      allow(PermitApplication).to receive(:find).with(1).and_return(pa)

      project =
        instance_double(
          "PermitProject",
          id: "pp1",
          valid?: true,
          save: true,
          errors: double(full_messages: [])
        )
      allow(PermitProject).to receive(:new).and_return(project)

      described_class.new.seed

      expect(PermitProject).to have_received(:new).with(
        hash_including(jurisdiction_id: "j1", full_address: "123 St, City")
      )
      expect(pa).to have_received(:permit_project=).with(project)
      expect(pa).to have_received(:save)
    end

    it "rolls back when project fails to save" do
      allow(PermitApplication).to receive(:pluck).with(:id).and_return([1])
      submitter = instance_double("User", id: "u1")
      pa =
        instance_double(
          "PermitApplication",
          id: 1,
          permit_project_id: nil,
          submitter: submitter
        )
      allow(pa).to receive(:read_attribute_before_type_cast).with(
        :jurisdiction_id
      ).and_return("j1")
      allow(pa).to receive(:read_attribute_before_type_cast).with(
        :nickname
      ).and_return(nil)
      allow(pa).to receive(:read_attribute_before_type_cast).with(
        :full_address
      ).and_return("123 St, City")
      allow(pa).to receive(:read_attribute_before_type_cast).with(
        :pid
      ).and_return(nil)
      allow(pa).to receive(:read_attribute_before_type_cast).with(
        :pin
      ).and_return(nil)
      allow(pa).to receive(:errors).and_return(double(full_messages: ["bad"]))
      allow(PermitApplication).to receive(:find).and_return(pa)

      project =
        instance_double(
          "PermitProject",
          id: nil,
          valid?: false,
          save: false,
          errors: double(full_messages: ["bad"])
        )
      allow(PermitProject).to receive(:new).and_return(project)

      described_class.new.seed

      expect(Rails.logger).to have_received(:error).with(
        /Failed to save new PermitProject/
      ).at_least(:once)
    end
  end
end
