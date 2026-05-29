# frozen_string_literal: true

class Api::QuestionDefinitionsController < Api::ApplicationController
  before_action :set_question_definition,
                only: %i[show update destroy restore where_used]

  def index
    question_definitions = policy_scope(QuestionDefinition).kept

    if params[:query].present?
      sanitized = "%#{params[:query].strip}%"
      question_definitions =
        question_definitions.where(
          "label ILIKE :q OR requirement_code ILIKE :q",
          q: sanitized
        )
    end

    if params[:review_state].present?
      question_definitions =
        question_definitions.where(review_state: params[:review_state])
    end

    question_definitions =
      question_definitions
        .order(:label)
        .page(params[:page])
        .per(params[:per_page] || 50)

    render_success question_definitions,
                   nil,
                   {
                     meta: page_meta(question_definitions),
                     blueprint: QuestionDefinitionBlueprint
                   }
  end

  def show
    authorize @question_definition

    render_success @question_definition,
                   nil,
                   { blueprint: QuestionDefinitionBlueprint }
  end

  def create
    @question_definition = QuestionDefinition.new(question_definition_params)
    @question_definition.owner ||= current_user
    authorize @question_definition

    if @question_definition.save
      render_success @question_definition,
                     "question_definition.create_success",
                     { blueprint: QuestionDefinitionBlueprint }
    else
      render_error "question_definition.create_error",
                   message_opts: {
                     error_message:
                       @question_definition.errors.full_messages.join(", ")
                   }
    end
  end

  def update
    authorize @question_definition

    if @question_definition.update(question_definition_params)
      # Shared-content edits re-materialize placements and mark referencing
      # templates drift-pending via QuestionDefinition#after_update. Published
      # TemplateVersions are untouched (snapshots) until republished.
      render_success @question_definition,
                     "question_definition.update_success",
                     { blueprint: QuestionDefinitionBlueprint }
    else
      render_error "question_definition.update_error",
                   message_opts: {
                     error_message:
                       @question_definition.errors.full_messages.join(", ")
                   }
    end
  end

  def destroy
    authorize @question_definition

    if @question_definition.discard
      render_success @question_definition,
                     "question_definition.destroy_success",
                     { blueprint: QuestionDefinitionBlueprint }
    else
      render_error "question_definition.destroy_error",
                   message_opts: {
                     error_message:
                       @question_definition.errors.full_messages.join(", ")
                   }
    end
  end

  def restore
    authorize @question_definition

    if @question_definition.undiscard
      render_success @question_definition,
                     "question_definition.restore_success",
                     { blueprint: QuestionDefinitionBlueprint }
    else
      render_error "question_definition.restore_error",
                   message_opts: {
                     error_message:
                       @question_definition.errors.full_messages.join(", ")
                   }
    end
  end

  # GET /api/question_definitions/:id/where_used
  # Governance view: this definition + every placement and its contextual delta.
  def where_used
    authorize @question_definition, :where_used?

    render json: {
             data: {
               question_definition:
                 QuestionDefinitionBlueprint.render_as_hash(
                   @question_definition
                 ),
               placements: @question_definition.where_used
             }
           }
  end

  # GET /api/question_definitions/dedup_candidates
  # Read-only steward preview of duplicate clusters (Phase 4).
  def dedup_candidates
    authorize QuestionDefinition, :dedup?

    min_cluster_size = (params[:min_cluster_size] || 2).to_i
    previews =
      QuestionBankDedupService.cluster_previews(
        min_cluster_size: min_cluster_size
      )

    render json: { data: previews, meta: { total_count: previews.size } }
  end

  # POST /api/question_definitions/apply_dedup
  # Opt-in, reversible linking of a reviewed cluster to a new canonical
  # definition.
  def apply_dedup
    authorize QuestionDefinition, :dedup?

    definition =
      QuestionBankDedupService.link_cluster!(
        requirement_ids: params[:requirement_ids],
        definition_attributes: dedup_definition_attributes,
        converge_ids: params[:converge_ids] || [],
        owner: current_user
      )

    render_success definition,
                   "question_definition.create_success",
                   { blueprint: QuestionDefinitionBlueprint }
  rescue ActiveRecord::RecordInvalid => e
    render_error "question_definition.create_error",
                 message_opts: {
                   error_message: e.record.errors.full_messages.join(", ")
                 }
  rescue ArgumentError => e
    render_error "question_definition.create_error",
                 message_opts: {
                   error_message: e.message
                 }
  end

  private

  def dedup_definition_attributes
    return nil if params[:definition_attributes].blank?

    params.require(:definition_attributes).permit(
      :label,
      :hint,
      :instructions,
      :input_type,
      :requirement_code,
      input_options: {
      }
    )
  end

  def set_question_definition
    @question_definition = QuestionDefinition.find(params[:id])
  end

  def question_definition_params
    params.require(:question_definition).permit(
      :label,
      :hint,
      :instructions,
      :input_type,
      :requirement_code,
      :review_state,
      :owner_id,
      :forked_from_id,
      input_options: {
      }
    )
  end
end
