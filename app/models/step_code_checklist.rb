class StepCodeChecklist < ApplicationRecord
  belongs_to :step_code, optional: Rails.env.test?

  delegate :data_entries, :building_permit_number, :jurisdiction_name, :full_address, :pid, to: :step_code

  enum stage: %i[pre_construction mid_construction as_built]
  enum compliance_path: %i[step_code_ers step_code_necb passive_house step_code]
  enum epc_calculation_airtightness: %i[two_point_five three_point_two]
  enum epc_calculation_testing_target_type: %i[ach nlr nla]
  enum building_type: %i[
         laneway
         single_detached
         double_detached
         row
         multi_plex
         single_detached_with_suite
         low_rise_murb
         stacked_duplex
         triplex
         retail
         other
       ]

  def self.select_options
    {
      compliance_paths: compliance_paths.keys,
      airtightness_values: epc_calculation_airtightnesses.keys,
      epc_testing_target_types: epc_calculation_testing_target_types.keys,
      building_types: building_types.keys,
    }
  end

  def energy_step_compliance
    @energy_step_compliance ||= StepCode::Compliance::ProposeStep::Energy.new(checklist: self).call
  end

  def zero_carbon_step_compliance
    @zero_carbon_step_compliance ||= StepCode::Compliance::ProposeStep::ZeroCarbon.new(checklist: self).call
  end
end
