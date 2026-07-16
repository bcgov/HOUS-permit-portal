# frozen_string_literal: true

class Api::RequirementQuestionsController < Api::ApplicationController
  include Api::Concerns::Search::RequirementQuestions

  before_action :set_requirement_question, only: %i[show update destroy restore]
  skip_after_action :verify_policy_scoped, only: [:index]

  def index
    perform_search

    render_success @search.results,
                   nil,
                   {
                     meta: page_meta(@search),
                     blueprint: RequirementQuestionBlueprint,
                     blueprint_opts: {
                       view: :extended
                     }
                   }
  end

  def show
    authorize @requirement_question

    render_success @requirement_question,
                   nil,
                   {
                     blueprint: RequirementQuestionBlueprint,
                     blueprint_opts: {
                       view: :extended
                     }
                   }
  end

  def create
    @requirement_question =
      RequirementQuestion.build(requirement_question_params.merge(shared: true))
    authorize @requirement_question

    if @requirement_question.save
      RequirementQuestion.search_index.refresh
      render_success @requirement_question,
                     "requirement_question.create_success",
                     {
                       blueprint: RequirementQuestionBlueprint,
                       blueprint_opts: {
                         view: :extended
                       }
                     }
    else
      render_error "requirement_question.create_error",
                   message_opts: {
                     error_message:
                       @requirement_question.errors.full_messages.join(", ")
                   }
    end
  end

  def update
    authorize @requirement_question
    if @requirement_question.update(requirement_question_params)
      render_success @requirement_question,
                     nil,
                     {
                       blueprint: RequirementQuestionBlueprint,
                       blueprint_opts: {
                         view: :extended
                       }
                     }
    else
      render_error "requirement_question.update_error",
                   message_opts: {
                     error_message:
                       @requirement_question.errors.full_messages.join(", ")
                   }
    end
  end

  def destroy
    authorize @requirement_question

    if @requirement_question.discard
      render_success @requirement_question,
                     "requirement_question.destroy_success",
                     {
                       blueprint: RequirementQuestionBlueprint,
                       blueprint_opts: {
                         view: :extended
                       }
                     }
    else
      render_error "requirement_question.destroy_error",
                   message_opts: {
                     error_message:
                       @requirement_question.errors.full_messages.join(", ")
                   }
    end
  end

  def restore
    authorize @requirement_question

    if @requirement_question.undiscard
      render_success @requirement_question,
                     "requirement_question.restore_success",
                     {
                       blueprint: RequirementQuestionBlueprint,
                       blueprint_opts: {
                         view: :extended
                       }
                     }
    else
      render_error "requirement_question.restore_error",
                   message_opts: {
                     error_message:
                       @requirement_question.errors.full_messages.join(", ")
                   }
    end
  end

  private

  def requirement_question_params
    params.require(:requirement_question).permit(
      :id,
      :name,
      :description,
      :label,
      :input_type,
      :hint,
      :instructions,
      association_list: [],
      input_options: [
        :number_unit,
        :can_add_multiple_contacts,
        :energy_step_code,
        :multiple,
        { headers: %i[first_column a quantity ab] },
        { rows: %i[name a] },
        value_options: [%i[value label]],
        computed_compliance: [:value, :module, options_map: {}],
        data_validation: %i[operation value error_message]
      ]
    )
  end

  def set_requirement_question
    @requirement_question = RequirementQuestion.find(params[:id])
  end
end
