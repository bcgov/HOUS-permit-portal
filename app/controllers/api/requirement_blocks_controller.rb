# frozen_string_literal: true

class Api::RequirementBlocksController < Api::ApplicationController
  include Api::Concerns::Search::RequirementBlocks

  before_action :set_requirement_block, only: %i[show update destroy]
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
                       current_page: @search.current_page,
                     },
                     blueprint: RequirementBlockBlueprint,
                   }
  end

  def show
    authorize @requirement_block

    render_success @requirement_block, nil, { blueprint: RequirementBlockBlueprint }
  end

  def create
    @requirement_block = RequirementBlock.build(requirement_block_params)

    authorize @requirement_block

    if @requirement_block.save
      render_success @requirement_block, nil, { blueprint: RequirementBlockBlueprint }
    else
      render_error "requirement_block.create_error",
                   message_opts: {
                     error_message: @requirement_block.errors.full_messages.join(", "),
                   }
    end
  end

  def update
    authorize @requirement_block

    if @requirement_block.update(requirement_block_params)
      render_success @requirement_block, nil, { blueprint: RequirementBlockBlueprint }
    else
      render_error "requirement_block.update_error",
                   message_opts: {
                     error_message: @requirement_block.errors.full_messages.join(", "),
                   }
    end
  end

  def destroy
    authorize @requirement_block

    if @requirement_block.destroy
      render json: {}, status: :ok
    else
      render_error "requirement_block.delete_error",
                   message_opts: {
                     error_message: @requirement_block.errors.full_messages.join(", "),
                   }
    end
  end

  private

  def requirement_block_params
    params.require(:requirement_block).permit(
      :name,
      :description,
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
        :_destroy,
        input_options: [:number_unit, :can_add_multiple_contacts, value_options: [%i[value label]]],
      ],
    )
  end

  def set_requirement_block
    @requirement_block = RequirementBlock.find(params[:id])
  end
end
