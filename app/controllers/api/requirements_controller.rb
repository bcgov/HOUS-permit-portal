# frozen_string_literal: true

class Api::RequirementsController < Api::ApplicationController
  before_action :set_requirement,
                only: %i[
                  link_question_definition
                  detach_question_definition
                  fork_question_definition
                ]

  # POST /api/requirements/:id/link_question_definition
  def link_question_definition
    authorize @requirement

    definition = QuestionDefinition.find(params[:question_definition_id])

    @requirement.link_to_question_definition!(definition, local_overrides_param)

    render_block_success("requirement.link_success")
  rescue ActiveRecord::RecordInvalid => e
    render_error "requirement.link_error",
                 message_opts: {
                   error_message: e.record.errors.full_messages.join(", ")
                 }
  end

  # POST /api/requirements/:id/detach_question_definition
  def detach_question_definition
    authorize @requirement

    @requirement.detach_from_question_definition!

    render_block_success("requirement.detach_success")
  rescue ActiveRecord::RecordInvalid => e
    render_error "requirement.detach_error",
                 message_opts: {
                   error_message: e.record.errors.full_messages.join(", ")
                 }
  end

  # POST /api/requirements/:id/fork_question_definition
  def fork_question_definition
    authorize @requirement

    @requirement.fork_question_definition!(owner: current_user)

    render_block_success("requirement.fork_success")
  rescue ActiveRecord::RecordInvalid => e
    render_error "requirement.fork_error",
                 message_opts: {
                   error_message: e.record.errors.full_messages.join(", ")
                 }
  end

  private

  def set_requirement
    @requirement = Requirement.find(params[:id])
  end

  # The frontend works in terms of requirement blocks, so we return the updated
  # parent block (authoring view) for a clean applySnapshot on the client.
  def render_block_success(message_key)
    render_success @requirement.requirement_block.reload,
                   message_key,
                   {
                     blueprint: RequirementBlockBlueprint,
                     blueprint_opts: {
                       view: :authoring
                     }
                   }
  end

  def local_overrides_param
    overrides = params[:local_overrides]
    return {} if overrides.blank?

    overrides.respond_to?(:to_unsafe_h) ? overrides.to_unsafe_h : overrides
  end
end
