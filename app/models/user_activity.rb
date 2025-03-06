class UserActivity < ApplicationRecord
    include Elasticsearch::Model
    include Elasticsearch::Model::Callbacks
  
    validates :user_id, :feature_name, :jurisdiction, :action, :timestamp, presence: true
  end
  
  UserActivity.__elasticsearch__.create_index!
  