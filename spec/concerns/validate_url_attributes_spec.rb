require "rails_helper"

RSpec.describe ValidateUrlAttributes, type: :model do
  # Create a dummy model to test the concern
  class DummyModel < ApplicationRecord
    include ValidateUrlAttributes

    url_validatable :url, :another_url
  end

  # Define a migration to create the table for DummyModel
  class CreateDummyModels < ActiveRecord::Migration[6.0]
    def change
      create_table :dummy_models do |t|
        t.string :url
        t.string :another_url
        t.timestamps
      end
    end
  end

  # Run the migration before running the tests
  before(:all) do
    CreateDummyModels.new.change
    ActiveRecord::Migration.maintain_test_schema!
  end

  # Rollback migration after running the tests
  after(:all) do
    if ActiveRecord::Base.connection.table_exists?(:dummy_models)
      ActiveRecord::Migration.drop_table(:dummy_models)
      ActiveRecord::Migration.maintain_test_schema!
    end
  end

  describe "URL validation" do
    let(:dummy_model) { DummyModel.new }

    context "when single URL attribute is valid" do
      it "is valid" do
        dummy_model.url = "https://www.example.com"
        expect(dummy_model).to be_valid
      end
    end

    context "when single URL attribute is invalid" do
      it "is invalid" do
        dummy_model.url = "not_a_url"
        expect(dummy_model).not_to be_valid
        expect(dummy_model.errors[:url]).to include("must be a valid URL")
      end
    end

    context "when single URL attribute is blank" do
      it "is valid" do
        dummy_model.url = ""
        expect(dummy_model).to be_valid
      end
    end

    context "when single URL attribute is nil" do
      it "is valid" do
        dummy_model.url = nil
        expect(dummy_model).to be_valid
      end
    end

    context "when single URL attribute has valid characters but invalid scheme" do
      it "is invalid" do
        dummy_model.url = "ftp://www.example.com"
        expect(dummy_model).not_to be_valid
        expect(dummy_model.errors[:url]).to include("must be a valid URL")
      end
    end

    context "when multiple URL attributes are valid" do
      it "is valid" do
        dummy_model.url = "https://www.example.com"
        dummy_model.another_url = "http://www.example.org"
        expect(dummy_model).to be_valid
      end
    end

    context "when multiple URL attributes contain an invalid URL" do
      it "is invalid" do
        dummy_model.url = "https://www.example.com"
        dummy_model.another_url = "not_a_url"
        expect(dummy_model).not_to be_valid
        expect(dummy_model.errors[:another_url]).to include(
          "must be a valid URL"
        )
      end
    end
  end
end
