require "rails_helper"

RSpec.describe Api::TemplateCategoriesController, type: :controller do
  let(:super_admin) { create(:user, :super_admin) }

  describe "GET #index" do
    it "returns ordered categories with templates and uncategorized templates" do
      sign_in super_admin
      later_category = create(:template_category)
      earlier_category = create(:template_category)
      later_category.insert_at(1)
      earlier_category.insert_at(0)
      categorized_template =
        create(
          :requirement_template,
          template_category: earlier_category,
          sort_order: 0
        )
      uncategorized_template = create(:requirement_template)

      get :index, format: :json

      expect(response).to have_http_status(:ok)
      expect(json_response["data"].pluck("id")).to eq(
        [earlier_category.id, later_category.id]
      )
      expect(
        json_response.dig("data", 0, "requirement_templates").pluck("id")
      ).to eq([categorized_template.id])
      expect(
        json_response.dig("meta", "uncategorized_requirement_templates").pluck(
          "id"
        )
      ).to eq([uncategorized_template.id])
    end

    it "prevents non-super admins from listing categories" do
      sign_in create(:user)

      get :index, format: :json

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "POST #create" do
    it "allows super admins to create categories" do
      sign_in super_admin

      post :create,
           params: {
             template_category: {
               label: "Trades"
             }
           },
           format: :json

      expect(response).to have_http_status(:ok)
      expect(TemplateCategory.find_by(label: "Trades")).to be_present
    end
  end

  describe "PATCH #update" do
    it "allows super admins to rename categories" do
      sign_in super_admin
      category = create(:template_category, label: "Trades")

      patch :update,
            params: {
              id: category.id,
              template_category: {
                label: "Trade permits"
              }
            },
            format: :json

      expect(response).to have_http_status(:ok)
      expect(category.reload.label).to eq("Trade permits")
    end
  end

  describe "POST #reorder" do
    it "allows super admins to reorder categories" do
      sign_in super_admin
      first = create(:template_category, sort_order: 0)
      second = create(:template_category, sort_order: 1)

      post :reorder,
           params: {
             ordered_ids: [second.id, first.id]
           },
           format: :json

      expect(response).to have_http_status(:ok)
      expect(first.reload.sort_order).to eq(1)
      expect(second.reload.sort_order).to eq(0)
    end
  end

  describe "POST #reorder_templates" do
    it "moves and reorders templates within a category" do
      sign_in super_admin
      source_category = create(:template_category)
      target_category = create(:template_category)
      moving_template =
        create(:requirement_template, template_category: source_category)
      existing_template =
        create(:requirement_template, template_category: target_category)

      post :reorder_templates,
           params: {
             id: target_category.id,
             ordered_ids: [existing_template.id, moving_template.id]
           },
           format: :json

      expect(response).to have_http_status(:ok)
      expect(existing_template.reload.template_category).to eq(target_category)
      expect(existing_template.sort_order).to eq(0)
      expect(moving_template.reload.template_category).to eq(target_category)
      expect(moving_template.sort_order).to eq(1)
    end

    it "can move templates to the uncategorized bucket" do
      sign_in super_admin
      category = create(:template_category)
      template = create(:requirement_template, template_category: category)

      post :reorder_templates,
           params: {
             id: "uncategorized",
             ordered_ids: [template.id]
           },
           format: :json

      expect(response).to have_http_status(:ok)
      expect(template.reload.template_category).to be_nil
      expect(template.sort_order).to eq(0)
    end
  end

  describe "DELETE #destroy" do
    it "removes the category and leaves its templates uncategorized" do
      sign_in super_admin
      category = create(:template_category)
      template = create(:requirement_template, template_category: category)

      delete :destroy, params: { id: category.id }, format: :json

      expect(response).to have_http_status(:ok)
      expect(TemplateCategory.exists?(category.id)).to be(false)
      expect(template.reload.template_category).to be_nil
    end
  end
end
