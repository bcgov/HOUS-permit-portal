require "rails_helper"

RSpec.describe OverheatingCodePdfService do
  let(:overheating_code) { create(:overheating_code, :complete) }
  let(:service) { described_class.new(overheating_code) }

  describe "#generate" do
    it "returns a non-empty binary string" do
      pdf_data = service.generate

      expect(pdf_data).to be_a(String)
      expect(pdf_data.length).to be > 0
    end

    it "returns valid PDF data starting with PDF header" do
      pdf_data = service.generate

      expect(pdf_data[0..3]).to eq("%PDF")
    end

    it "fills text fields from the overheating code record" do
      overheating_code.update!(
        issued_to: "Unique Issued To Value",
        project_number: "PROJ-XYZ-999"
      )

      pdf_data = service.generate

      expect(pdf_data).to include("Unique Issued To Value")
      expect(pdf_data).to include("PROJ-XYZ-999")
    end

    it "fills component array fields" do
      overheating_code.update!(
        components_facing_outside: ["Ext Wall R-22", "Roof Assembly R-50"]
      )

      pdf_data = service.generate

      expect(pdf_data).to include("Ext Wall R-22")
      expect(pdf_data).to include("Roof Assembly R-50")
    end

    it "fills document notes" do
      overheating_code.update!(document_notes: ["Energy report v3.1"])

      pdf_data = service.generate

      expect(pdf_data).to include("Energy report v3.1")
    end

    it "fills performer information" do
      overheating_code.update!(
        performer_name: "John Q. Engineer",
        performer_email: "john@example.com"
      )

      pdf_data = service.generate

      expect(pdf_data).to include("John Q. Engineer")
      expect(pdf_data).to include("john@example.com")
    end
  end

  describe "#filename" do
    it "uses the project number when present" do
      overheating_code.update!(project_number: "PRJ-42")

      expect(service.filename).to eq("BC-SZCG-Report-PRJ-42.pdf")
    end

    it "falls back to ID prefix when project number is blank" do
      overheating_code.update!(project_number: nil)

      expected = "BC-SZCG-Report-#{overheating_code.id.first(8)}.pdf"
      expect(service.filename).to eq(expected)
    end
  end

  describe "unit conversion" do
    context "when units are metric" do
      before do
        overheating_code.update!(
          cooling_zone_units: "metric",
          minimum_cooling_capacity: 1.0
        )
      end

      it "converts kW to btuh" do
        btuh = service.send(:minimum_cooling_capacity_btuh)

        expect(btuh).to eq((1.0 * 3412.142).round(0))
      end
    end

    context "when units are imperial" do
      before do
        overheating_code.update!(
          cooling_zone_units: "imperial",
          minimum_cooling_capacity: 12000.0
        )
      end

      it "returns the raw value without conversion" do
        btuh = service.send(:minimum_cooling_capacity_btuh)

        expect(btuh).to eq(12000.0)
      end
    end

    context "when minimum_cooling_capacity is nil" do
      before { overheating_code.update!(minimum_cooling_capacity: nil) }

      it "returns nil" do
        expect(service.send(:minimum_cooling_capacity_btuh)).to be_nil
      end
    end
  end

  describe "#city_province" do
    it "returns jurisdiction name with British Columbia when jurisdiction is present" do
      jurisdiction = overheating_code.jurisdiction
      expected = "#{jurisdiction.qualified_name}, British Columbia"

      expect(service.send(:city_province)).to eq(expected)
    end

    it "falls back to British Columbia when no jurisdiction" do
      overheating_code.update!(jurisdiction: nil)

      expect(service.send(:city_province)).to eq("British Columbia")
    end
  end

  describe "#hrv_erv_label" do
    it "returns Yes when hrv_erv is true" do
      overheating_code.update!(hrv_erv: true)

      expect(service.send(:hrv_erv_label)).to eq("Yes")
    end

    it "returns No when hrv_erv is false" do
      overheating_code.update!(hrv_erv: false)

      expect(service.send(:hrv_erv_label)).to eq("No")
    end
  end

  describe "radio button handling" do
    it "does not raise errors during generation for metric units" do
      overheating_code.update!(cooling_zone_units: "metric")

      expect { service.generate }.not_to raise_error
    end

    it "does not raise errors during generation for imperial units" do
      overheating_code.update!(cooling_zone_units: "imperial")

      expect { service.generate }.not_to raise_error
    end
  end
end
