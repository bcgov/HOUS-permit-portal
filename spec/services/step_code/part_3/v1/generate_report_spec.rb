RSpec.describe StepCode::Part3::V1::GenerateReport do
  let(:reference_energy_outputs) { [] }

  let(:electricity) { build(:fuel_type, :electricity) }
  let(:natural_gas) { build(:fuel_type, :natural_gas) }
  let(:fuel_types) { [electricity, natural_gas] }

  let(:make_up_air_fuels) do
    [build(:make_up_air_fuel, fuel_type: electricity, percent_of_load: 1)]
  end

  let(:checklist) do
    create(
      :part_3_checklist,
      occupancy_classifications: occupancies,
      fuel_types: fuel_types,
      reference_energy_outputs: reference_energy_outputs,
      modelled_energy_outputs: modelled_energy_outputs,
      make_up_air_fuels: make_up_air_fuels,
      **checklist_params
    )
  end

  subject(:compliance_checker) do
    StepCode::Part3::V1::GenerateReport.new(checklist: checklist)
  end

  context "when the building is single use" do
    let(:occupancies) { [build(:step_code_occupancy, :other_residential)] }

    let(:checklist_params) do
      {
        heating_degree_days: 4180,
        climate_zone: :zone_6,
        total_annual_thermal_energy_demand: 30_000,
        total_annual_cooling_energy_demand: 1500,
        step_code_annual_thermal_energy_demand: 30_000,
        pressurized_doors_count: 20,
        pressurization_airflow_per_door: 5.0,
        pressurized_corridors_area: 120,
        generated_electricity: 0
      }
    end

    before :each do
      subject.call
    end

    context "and requirements are met" do
      let (:modelled_energy_outputs) do
        [
          build(
            :energy_output,
            :modelled,
            fuel_type: electricity,
            annual_energy: 15_000 # interior lighting
          ),
          build(
            :energy_output,
            :modelled,
            fuel_type: electricity,
            annual_energy: 1000 # exterior lighting
          ),
          build(
            :energy_output,
            :modelled,
            fuel_type: electricity,
            annual_energy: 20_000 # heating
          ),
          build(
            :energy_output,
            :modelled,
            fuel_type: electricity,
            annual_energy: 3000 # cooling
          ),
          build(
            :energy_output,
            :modelled,
            fuel_type: electricity,
            annual_energy: 2000 # pumps
          ),
          build(
            :energy_output,
            :modelled,
            fuel_type: electricity,
            annual_energy: 5000 # fans
          ),
          build(
            :energy_output,
            :modelled,
            fuel_type: electricity,
            annual_energy: 30_000 # hot water
          ),
          build(
            :energy_output,
            :modelled,
            fuel_type: electricity,
            annual_energy: 25_000 # plug loads
          )
        ]
      end

      it_behaves_like PART_3_PASSING_COMPLIANCE_RESULTS do
        let(:expected_occupancies) do
          [
            {
              occupancy: "residential",
              energy_requirement: 3,
              zero_carbon_requirement: 4,
              performance_requirement: nil
            }
          ]
        end

        let(:expected_compliance_results) do
          {
            teui: true,
            tedi: {
              whole_building: true,
              step_code_portion: true
            },
            ghgi: true,
            performance_requirement_achieved: nil,
            total_energy: nil,
            energy_step_achieved: 4,
            zero_carbon_step_achieved: 4
          }
        end

        let(:expected_requirements_metrics) do
          {
            baseline_portions: {
              ghgi: nil,
              modelled_floor_area: 0.0,
              tedi: nil,
              teui: nil,
              total_energy: 0.0
            },
            step_code_portions: {
              occupancies_requirements: [
                {
                  occupancy: "residential",
                  modelled_floor_area: 0.1e4,
                  teui: BigDecimal("120.0"),
                  tedi: BigDecimal("35.0"),
                  ghgi: BigDecimal("1.8")
                }
              ],
              area_weighted_totals: {
                teui: BigDecimal("120.0"),
                tedi: BigDecimal("35.0"),
                ghgi: BigDecimal("1.8"),
                modelled_floor_area: BigDecimal("1000")
              }
            },
            whole_building: {
              teui: BigDecimal("120.0"),
              tedi: BigDecimal("35.0"),
              ghgi: BigDecimal("1.8"),
              total_energy: nil
            }
          }
        end

        let(:expected_modelled_metrics) do
          {
            teui: BigDecimal("101.0"),
            tedi: {
              whole_building: BigDecimal("30"),
              step_code_portion: BigDecimal("30")
            },
            ghgi: BigDecimal("1.111"),
            total_energy: nil
          }
        end

        let(:expected_corridor_pressurization_adjustment_metrics) do
          {
            teui: BigDecimal("8.46032000000000209"),
            tedi: {
              whole_building: BigDecimal("8.46032000000000209"),
              step_code_portion: BigDecimal("8.46032000000000209")
            },
            ghgi: BigDecimal("0.09306352000000002299"),
            total_energy: nil
          }
        end

        let(:expected_suite_sub_metering_adjustment_metrics) do
          { teui: 0, tedi: nil, ghgi: nil, total_energy: nil }
        end

        let(:expected_adjusted_performance_metrics) do
          {
            teui: BigDecimal("92.53967999999999791"),
            tedi: {
              whole_building: BigDecimal("21.53967999999999791"),
              step_code_portion: BigDecimal("21.53967999999999791")
            },
            ghgi: BigDecimal("1.01793647999999997701"),
            total_energy: nil
          }
        end
      end
    end
  end

  context "when the building is mixed use" do
    let(:occupancies) do
      [
        build(:step_code_occupancy, :other_residential),
        build(:step_code_occupancy, :low_industrial)
      ]
    end

    let(:checklist_params) do
      {
        heating_degree_days: 4180,
        climate_zone: :zone_6,
        ref_annual_thermal_energy_demand: 50_000,
        total_annual_thermal_energy_demand: 80_000,
        total_annual_cooling_energy_demand: 15_000,
        step_code_annual_thermal_energy_demand: 30_000,
        pressurized_doors_count: 20,
        pressurization_airflow_per_door: 5.0,
        pressurized_corridors_area: 120,
        generated_electricity: 0
      }
    end

    before :each do
      subject.call
    end

    context "and requirements are met" do
      let(:reference_energy_outputs) do
        [
          build(
            :energy_output,
            :reference,
            fuel_type: electricity,
            annual_energy: 60_000
          ),
          build(
            :energy_output,
            :reference,
            fuel_type: natural_gas,
            annual_energy: 20_000
          )
        ]
      end

      let (:modelled_energy_outputs) do
        [
          build(
            :energy_output,
            :modelled,
            fuel_type: electricity,
            annual_energy: 30_000 # interior lighting
          ),
          build(
            :energy_output,
            :modelled,
            fuel_type: electricity,
            annual_energy: 1000 # exterior lighting
          ),
          build(
            :energy_output,
            :modelled,
            fuel_type: electricity,
            annual_energy: 30_000 # heating
          ),
          build(
            :energy_output,
            :modelled,
            fuel_type: electricity,
            annual_energy: 6000 # cooling
          ),
          build(
            :energy_output,
            :modelled,
            fuel_type: electricity,
            annual_energy: 3000 # pumps
          ),
          build(
            :energy_output,
            :modelled,
            fuel_type: electricity,
            annual_energy: 15_000 # fans
          ),
          build(
            :energy_output,
            :modelled,
            fuel_type: electricity,
            annual_energy: 35_000 # hot water
          ),
          build(
            :energy_output,
            :modelled,
            fuel_type: electricity,
            annual_energy: 40_000 # plug loads
          ),
          build(
            :energy_output,
            :modelled,
            fuel_type: natural_gas,
            annual_energy: 20_000 # heating
          )
        ]
      end

      it_behaves_like PART_3_PASSING_COMPLIANCE_RESULTS do
        let(:expected_occupancies) do
          [
            {
              occupancy: "residential",
              energy_requirement: 3,
              zero_carbon_requirement: 4,
              performance_requirement: nil
            },
            {
              occupancy: "low_hazard_industrial",
              energy_requirement: nil,
              zero_carbon_requirement: nil,
              performance_requirement: "necb"
            }
          ]
        end

        let(:expected_compliance_results) do
          {
            teui: true,
            tedi: {
              whole_building: true,
              step_code_portion: true
            },
            ghgi: true,
            performance_requirement_achieved: nil,
            total_energy: nil,
            energy_step_achieved: 4,
            zero_carbon_step_achieved: 4
          }
        end

        let(:expected_requirements_metrics) do
          {
            baseline_portions: {
              teui: BigDecimal("80"),
              tedi: BigDecimal("50"),
              ghgi: BigDecimal("4.26"),
              total_energy: BigDecimal("80000"),
              modelled_floor_area: BigDecimal("1000")
            },
            step_code_portions: {
              occupancies_requirements: [
                {
                  occupancy: "residential",
                  modelled_floor_area: BigDecimal("1000"),
                  teui: BigDecimal("120"),
                  tedi: BigDecimal("35"),
                  ghgi: BigDecimal("1.8")
                }
              ],
              area_weighted_totals: {
                teui: BigDecimal("120"),
                tedi: BigDecimal("35"),
                ghgi: BigDecimal("1.8"),
                modelled_floor_area: BigDecimal("1000")
              }
            },
            whole_building: {
              teui: BigDecimal("100"),
              tedi: BigDecimal("42.5"),
              ghgi: BigDecimal("3.03"),
              total_energy: nil
            }
          }
        end

        let(:expected_modelled_metrics) do
          {
            teui: BigDecimal("90"),
            tedi: {
              whole_building: BigDecimal("40"),
              step_code_portion: BigDecimal("30")
            },
            ghgi: BigDecimal("2.68"),
            total_energy: nil
          }
        end

        let(:expected_corridor_pressurization_adjustment_metrics) do
          {
            teui: BigDecimal("4.230160000000001045"),
            tedi: {
              whole_building: BigDecimal("4.230160000000001045"),
              step_code_portion: BigDecimal("8.46032000000000209")
            },
            ghgi: BigDecimal("0.046531760000000011495"),
            total_energy: nil
          }
        end

        let(:expected_suite_sub_metering_adjustment_metrics) do
          { teui: 0, tedi: nil, ghgi: nil, total_energy: nil }
        end

        let(:expected_adjusted_performance_metrics) do
          {
            teui: BigDecimal("85.769839999999998955"),
            tedi: {
              whole_building: BigDecimal("35.769839999999998955"),
              step_code_portion: BigDecimal("21.53967999999999791")
            },
            ghgi: BigDecimal("2.633468239999999988505"),
            total_energy: nil
          }
        end
      end
    end
  end
end
