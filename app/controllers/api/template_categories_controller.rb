class Api::TemplateCategoriesController < Api::ApplicationController
  before_action :set_template_category,
                only: %i[update destroy reorder_templates]

  def index
    authorize TemplateCategory
    render_categories
  end

  def create
    category = TemplateCategory.new(template_category_params)
    authorize category

    if category.save
      render_categories("template_category.create_success")
    else
      render_validation_error(category)
    end
  end

  def update
    authorize @template_category

    if @template_category.update(template_category_params)
      render_categories("template_category.update_success")
    else
      render_validation_error(@template_category)
    end
  end

  def destroy
    authorize @template_category

    if @template_category.destroy
      render_categories("template_category.destroy_success")
    else
      render_validation_error(@template_category)
    end
  end

  def reorder
    authorize TemplateCategory, :update?

    ordered_ids = params[:ordered_ids] || []
    categories = TemplateCategory.where(id: ordered_ids)

    if categories.size != ordered_ids.size
      return render_error "misc.not_found_error", { status: :not_found }
    end

    TemplateCategory.transaction do
      ordered_ids.each_with_index do |id, index|
        categories.find { |category| category.id == id }.insert_at(index)
      end
    end

    render_categories("template_category.reorder_success")
  end

  def reorder_templates
    authorize(@template_category || TemplateCategory, :reorder_templates?)

    ordered_ids = params[:ordered_ids] || []
    templates = RequirementTemplate.where(id: ordered_ids)

    if templates.size != ordered_ids.size
      return render_error "misc.not_found_error", { status: :not_found }
    end

    RequirementTemplate.transaction do
      ordered_ids.each_with_index do |id, index|
        templates
          .find { |template| template.id == id }
          .update_columns(
            template_category_id: @template_category&.id,
            sort_order: index,
            updated_at: Time.current
          )
      end
    end

    render_categories("template_category.reorder_templates_success")
  end

  private

  def set_template_category
    return @template_category = nil if params[:id] == "uncategorized"

    @template_category = TemplateCategory.find(params[:id])
  rescue ActiveRecord::RecordNotFound => e
    render_error "misc.not_found_error", { status: :not_found }, e
  end

  def render_categories(message_key = nil)
    categories =
      policy_scope(TemplateCategory).ordered.includes(:requirement_templates)
    uncategorized_templates =
      policy_scope(RequirementTemplate)
        .kept
        .where(template_category_id: nil)
        .order(:sort_order, :created_at)

    render_success(
      categories,
      message_key,
      {
        blueprint: TemplateCategoryBlueprint,
        blueprint_opts: {
          view: :extended,
          current_user: current_user
        },
        meta: {
          uncategorized_requirement_templates:
            RequirementTemplateBlueprint.render_as_hash(
              uncategorized_templates,
              current_user: current_user
            )
        }
      }
    )
  end

  def template_category_params
    params.require(:template_category).permit(:label)
  end

  def render_validation_error(record)
    render_error(
      "misc.validation_error",
      {
        message_opts: {
          error_message: record.errors.full_messages.join(", ")
        }
      }
    )
  end
end
