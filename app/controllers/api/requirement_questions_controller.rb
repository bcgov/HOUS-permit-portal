# frozen_string_literal: true

class Api::RequirementQuestionsController < Api::ApplicationController
  before_action :set_requirement_question, only: %i[show update destroy restore]
  skip_after_action :verify_policy_scoped, only: [:index]

  def index
    authorize RequirementQuestion

    questions =
      policy_scope(RequirementQuestion).includes(:requirements).where(
        shared: shared_filter
      )
    questions = questions.where(discarded_at: nil) unless show_archived?
    questions = questions.where("label ILIKE ?", "%#{query}%") if query.present?
    questions = questions.order(updated_at: :desc)

    paginated_questions =
      if params[:page].present?
        questions.page(params[:page]).per(per_page)
      else
        questions
      end

    render_success paginated_questions,
                   nil,
                   {
                     meta:
                       (
                         if params[:page].present?
                           page_meta(paginated_questions)
                         else
                           {}
                         end
                       ),
                     blueprint: RequirementQuestionBlueprint
                   }
  end

  def show
    authorize @requirement_question

    render_success @requirement_question,
                   nil,
                   { blueprint: RequirementQuestionBlueprint }
  end

  def create
    @requirement_question =
      RequirementQuestion.new(requirement_question_params.merge(shared: true))
    authorize @requirement_question

    if @requirement_question.save
      render_success @requirement_question,
                     "requirement_question.create_success",
                     { blueprint: RequirementQuestionBlueprint }
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
                     { blueprint: RequirementQuestionBlueprint }
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
                     { blueprint: RequirementQuestionBlueprint }
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
                     { blueprint: RequirementQuestionBlueprint }
    else
      render_error "requirement_question.restore_error",
                   message_opts: {
                     error_message:
                       @requirement_question.errors.full_messages.join(", ")
                   }
    end
  end

  private

  def set_requirement_question
    @requirement_question = RequirementQuestion.find(params[:id])
  end

  def requirement_question_params
    params.require(:requirement_question).permit(
      :requirement_code,
      :label,
      :input_type,
      :hint,
      :instructions,
      :shared,
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

  def query
    params[:query].presence
  end

  def show_archived?
    ActiveModel::Type::Boolean.new.cast(params[:show_archived] || false)
  end

  def shared_filter
    if params.key?(:shared)
      ActiveModel::Type::Boolean.new.cast(params[:shared])
    else
      true
    end
  end

  def per_page
    params[:per_page] || Kaminari.config.default_per_page
  end
end
