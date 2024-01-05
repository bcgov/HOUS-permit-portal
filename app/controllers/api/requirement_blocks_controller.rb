# frozen_string_literal: true

class Api::RequirementBlocksController < Api::ApplicationController
  before_action :set_requirement_block, only: %i[show update destroy]

  def index
    @requirement_blocks = policy_scope(RequirementBlock)

    render_success @requirement_blocks, nil, { blueprint: RequirementBlockBlueprint }
  end

  def show
    authorize @requirement_block

    render_success @requirement_block,
                   nil,
                   { blueprint: RequirementBlockBlueprint, blueprint_opts: { view: :extended } }
  end

  def create
    @requirement_block = RequirementBlock.build(requirement_block_params)

    authorize @requirement_block

    if @requirement_block.save
      render_success @requirement_block,
                     nil,
                     { blueprint: RequirementBlockBlueprint, blueprint_opts: { view: :extended } }
    else
      render_error Constants::Error::REQUIREMENT_BLOCK_CREATE_ERROR,
                   "requirement_block.create_error",
                   message_opts: {
                     error_message: @requirement_block.errors.full_messages.join(", "),
                   }
    end
  end

  def update
    authorize @requirement_block

    if @requirement_block.update(requirement_block_params)
      render_success @requirement_block,
                     nil,
                     { blueprint: RequirementBlockBlueprint, blueprint_opts: { view: :extended } }
    else
      render_error Constants::Error::REQUIREMENT_BLOCK_UPDATE_ERROR,
                   "requirement_block.update_error",
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
      render_error Constants::Error::REQUIREMENT_BLOCK_DELETE_ERROR,
                   "requirement_block.delete_error",
                   message_opts: {
                     error_message: @requirement_block.errors.full_messages.join(", "),
                   }
    end
  end

  private

  def requirement_block_params
    params.require(:requirement_block).permit(
      :name,
      :sign_off_role,
      :reviewer_role,
      requirement_block_requirements_attributes: [
        :id,
        :requirement_id,
        :_destroy,
        requirement_attributes: [
          :requirement_code,
          :label,
          :input_type,
          :hint,
          :reusable,
          :required,
          :related_content,
          :required_for_in_person_hint,
          :required_for_multiple_owners,
          :_destroy,
          input_options: [value_options: [%i[value label]]],
        ],
      ],
    )
  end

  def set_requirement_block
    @requirement_block = RequirementBlock.find(params[:id])
  end
end
