# frozen_string_literal: true

class Api::RequirementBlocksController < Api::ApplicationController
  include Api::Concerns::Search::RequirementBlocks

  before_action :set_requirement_block, only: %i[show update destroy restore]
  skip_after_action :verify_policy_scoped, only: [:index]

  def index
    perform_search
    authorized_results = apply_search_authorization(@search.results)
    render_success authorized_results,
                   nil,
                   {
                     meta: {
                       total_pages: @search.total_pages,
                       total_count: @search.total_count,
                       current_page: @search.current_page
                     },
                     blueprint: RequirementBlockBlueprint
                   }
  end

  def show
    authorize @requirement_block

    render_success @requirement_block,
                   nil,
                   { blueprint: RequirementBlockBlueprint }
  end

  def create
    @requirement_block = RequirementBlock.build(requirement_block_params)
    authorize @requirement_block

    if @requirement_block.save
      RequirementBlock.search_index.refresh
      render_success @requirement_block,
                     "requirement_block.create_success",
                     { blueprint: RequirementBlockBlueprint }
    else
      render_error "requirement_block.create_error",
                   message_opts: {
                     error_message:
                       @requirement_block.errors.full_messages.join(", ")
                   }
    end
  end

  def update
    authorize @requirement_block

    if @requirement_block.update(requirement_block_params)
      render_success @requirement_block,
                     nil,
                     { blueprint: RequirementBlockBlueprint }
    else
      render_error "requirement_block.update_error",
                   message_opts: {
                     error_message:
                       @requirement_block.errors.full_messages.join(", ")
                   }
    end
  end

  def destroy
    authorize @requirement_block

    if @requirement_block.discard
      render_success @requirement_block,
                     "requirement_block.destroy_success",
                     { blueprint: RequirementBlockBlueprint }
    else
      render_error "requirement_block.destroy_error",
                   message_opts: {
                     error_message:
                       @requirement_block.errors.full_messages.join(", ")
                   }
    end
  end

  def restore
    authorize @requirement_block

    if @requirement_block.undiscard
      render_success @requirement_block,
                     "requirement_block.restore_success",
                     { blueprint: RequirementBlockBlueprint }
    else
      render_error "requirement_block.restore_error",
                   message_opts: {
                     error_message:
                       @requirement_block.errors.full_messages.join(", ")
                   }
    end
  end

  def auto_compliance_module_configurations
    available_module_configurations =
      AutomatedComplianceConfigurationService.available_module_configurations
    authorize available_module_configurations,
              policy_class: RequirementBlockPolicy
    render json: { data: available_module_configurations }
  end

  private

  def requirement_block_params
    params.require(:requirement_block).permit(
      :name,
      :first_nations,
      :description,
      :visibility,
      :display_name,
      :display_description,
      :sign_off_role,
      :reviewer_role,
      association_list: [],
      requirements_attributes: [
        :id,
        :requirement_code,
        :label,
        :input_type,
        :hint,
        :required,
        :related_content,
        :required_for_in_person_hint,
        :required_for_multiple_owners,
        :elective,
        :position,
        :_destroy,
        input_options: [
          :number_unit,
          :can_add_multiple_contacts,
          :energy_step_code,
          value_options: [%i[value label]],
          conditional: %i[eq show when hide],
          computed_compliance: [:value, :module, options_map: {}]
        ]
      ]
    )
  end

  def set_requirement_block
    @requirement_block = RequirementBlock.find(params[:id])
  end
end
