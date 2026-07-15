# frozen_string_literal: true

class Qa::Part3StepCodeAutofillService
  def initialize(step_code:, current_user:)
    @step_code = step_code
    @current_user = current_user
  end

  def call
    Part3StepCode.transaction do
      update_step_code!
      checklist = ensure_checklist!
      clear_checklist_associations!(checklist)
      fuel_types = create_fuel_types!(checklist)
      create_occupancies!(checklist)
      update_checklist!(checklist, fuel_types)
      create_energy_outputs!(checklist, fuel_types)
      create_make_up_air_fuels!(checklist, fuel_types)
      create_document_references!(checklist)
    end

    @step_code.reload
  end

  private

  def update_step_code!
    Qa::StepCodeAutofillSupport.apply_step_code_project_attributes!(
      @step_code,
      Qa::Part3StepCodeAutofillData::STEP_CODE_ATTRIBUTES.dup
    )
  end

  def ensure_checklist!
    @step_code.pre_construction_checklist ||
      @step_code.create_pre_construction_checklist!(stage: :pre_construction)
  end

  def clear_checklist_associations!(checklist)
    checklist.occupancy_classifications.destroy_all
    checklist.reference_energy_outputs.destroy_all
    checklist.modelled_energy_outputs.destroy_all
    checklist.make_up_air_fuels.destroy_all
    checklist.document_references.destroy_all
    checklist.fuel_types.destroy_all
  end

  def create_fuel_types!(checklist)
    %i[electricity natural_gas].each_with_object({}) do |key, fuel_types|
      defaults =
        Part3StepCode::FuelType::DEFAULTS.find do |fuel_type|
          fuel_type[:key] == key
        end
      fuel_types[key] = checklist.fuel_types.create!(
        key: key,
        emissions_factor: defaults[:emissions_factor]
      )
    end
  end

  def create_occupancies!(checklist)
    checklist.occupancy_classifications.create!(
      Qa::Part3StepCodeAutofillData::STEP_CODE_OCCUPANCY
    )
    checklist.occupancy_classifications.create!(
      Qa::Part3StepCodeAutofillData::BASELINE_OCCUPANCY
    )
  end

  def update_checklist!(checklist, _fuel_types)
    heating_degree_days =
      @step_code.default_jurisdiction_heating_degree_days || 4180

    attributes =
      Qa::Part3StepCodeAutofillData.checklist_attributes_for(
        heating_degree_days: heating_degree_days
      ).merge(
        section_completion_status:
          Qa::Part3StepCodeAutofillData::SECTION_COMPLETION_STATUS
      )

    checklist.update!(attributes)
  end

  def create_energy_outputs!(checklist, fuel_types)
    Qa::Part3StepCodeAutofillData::REFERENCE_ENERGY_OUTPUTS.each do |output|
      checklist.reference_energy_outputs.create!(
        fuel_type: fuel_types.fetch(output[:fuel_key]),
        annual_energy: output[:annual_energy],
        source: :reference
      )
    end

    Qa::Part3StepCodeAutofillData::MODELLED_ENERGY_OUTPUTS.each do |output|
      attributes = {
        fuel_type: fuel_types.fetch(output[:fuel_key]),
        annual_energy: output[:annual_energy],
        source: :modelled,
        use_type: output[:use_type]
      }
      attributes[:name] = output[:name] if output[:name].present?

      checklist.modelled_energy_outputs.create!(attributes)
    end
  end

  def create_make_up_air_fuels!(checklist, fuel_types)
    checklist.make_up_air_fuels.create!(
      fuel_type: fuel_types.fetch(:electricity),
      percent_of_load: 1
    )
  end

  def create_document_references!(checklist)
    Qa::Part3StepCodeAutofillData::DOCUMENT_REFERENCES.each do |reference|
      checklist.document_references.create!(reference)
    end
  end
end
