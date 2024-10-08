# Overview

Welcome to the codebase for BC's Housing Permit Portal

## Getting Started

The codebase uses Rails on the back-end, and React/MST stack on the front-end.

Ensure you have the following:

- Ruby 3.2.2
- Postgres 13+
- Redis
- Node 20.10+

### Local Running Steps

- Install Dependencies: `bundle install` and `npm install`
- Ensure you have a `.env` file with required variables (reference `.env.example`)
- Set up Database credentials following [the official Rails guide](https://guides.rubyonrails.org/v2.3/getting_started.html#configuring-a-database). One of the ways is to have an environment variable called `DATABASE_URL`
- (_Only first time_) Create a database: `rails db:create`
- (_Only first time or if there are changes_) Run migrations: `rails db:migrate`
- (_Only first time or if there are changes_) Generate seed data: `rails db:seed`
- Start the server: `rails s`
- Start the front-end dev server for hot-reloading: `npm run dev`

### Workers (Sidekiq)

The app uses the [Sidekiq](https://github.com/sidekiq/sidekiq) library for background job processing. To run this locally:

- Ensure you have `Redis` installed locally
- Set ENV var `REDIS_URL=localhost:6379/0`
- Run `bundle exec sidekiq` (add a `-q queue_name`) to start that particular queue, you can see which queues are currently in the app in `config/initializers/sidekiq.rb` under `config.queues`

* Note that the Openshift deployed versions make use of HA-Redis via Sentinels so the environment variables required for that are different

### Websockets (Anycable)

The app uses [Anycable](https://anycable.io/) to serve websockets in a scalable way. To run the websocket server locally:

- Ensure to `bundle install`
- [Download the `anycable-go` websocket server on OSX: `brew install anycable-go`](https://docs.anycable.io/anycable-go/getting_started)
- Add an ENV var `ANYCABLE_REDIS_URL=redis://localhost:6379/2`. It is recommended to set this value to a different Redis db than Sidekiq.

After installation run both the `anycable-go` websocket server as well as the RPC server

- RPC Server: `bundle exec anycable`
- Anycable-Go Sockets: `anycable-go --port=8080`

### Notorius - Digital Seal Validation

- For local development, ensure you have the right test endpoint. The dev / test / production environments are set up with a licensed version running in its own container.

### Local - File storage setup

- For the local environment, if you want to test the full file upload process, you would want to run a local version of minio to simulate the object storage environment.
- Install minio:

```
brew install minio

minio server --address 127.0.0.1:9001 ~/Documents/whatever-your-folder-for-storage-is
```

- Log into minio with the admin/password provided and set up the environment.
- Set up a bucket (in our example we call it `hous-local`)
  <img width="1466" alt="minio-create-bucket" src="https://github.com/bcgov/HOUS-permit-portal/assets/607956/81c315a5-1bc9-46c7-ac32-202269691276">
- Set up a user (in our example, we call it `hous-formio-user`)
  <img width="1458" alt="minio-create-user" src="https://github.com/bcgov/HOUS-permit-portal/assets/607956/0bc1864e-f461-4ad7-bfe0-4a76babb311e">
- Set up a policy (in our example, we call it `formioupload`)
  <img width="1462" alt="minio-create-policy" src="https://github.com/bcgov/HOUS-permit-portal/assets/607956/01890f09-633e-4dff-8e00-24d9fbb4494c">

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "ListBucket",
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::hous-local"
            ]
        },
        {
            "Sid": "UploadFile",
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:ListMultipartUploadParts",
                "s3:PutObject",
                "s3:AbortMultipartUpload",
                "s3:DeleteObject"
            ],
            "Resource": [
                "arn:aws:s3:::hous-local/*"
            ]
        },
        {
            "Sid": "crossdomainAccess",
            "Effect": "Allow",
            "Action": [
                "s3:GetObject"
            ],
            "Resource": [
                "arn:aws:s3:::hous-local/crossdomain.xml"
            ]
        }
    ]
}
```

- note that "s3:PutObjectAcl" is ignored at the moment since we are at the root bucket, but we may need it later

- Assign the policy to the user
  <img width="1464" alt="minio-assign-policy" src="https://github.com/bcgov/HOUS-permit-portal/assets/607956/86f6b0c3-8c7f-43f7-afd7-fe2c4dce6dc4">
- You will need to add the following to your .env files:

```
BCGOV_OBJECT_STORAGE_ENDPOINT=http://127.0.0.1:9001(or_whatever_you want)
BCGOV_OBJECT_STORAGE_BUCKET=your-local-bucket-name
BCGOV_OBJECT_STORAGE_ACCESS_KEY_ID=your-local-user-access-key
BCGOV_OBJECT_STORAGE_SECRET_ACCESS_KEY=your-local-user-secret-access
BCGOV_OBJECT_STORAGE_REGION=us-east-1
```

Our folder structure for our bucket is designed as follows:

- :bucket_name/permit-applications/:id/\*

The overall process of a file upload is as follow:

- The front-end form allows you to upload files
- Upon selecting files, it calls the backend to get a presigned url for upload
- The files are directly uploaded into the /cache/ folder
- Upon saving the file, it persists gainst the application as a 'supporting_document'

## DevOps

See the `/devops` folder for Dockerfiles and Helm-Charts

## Testing

All unit tests should be run like the following:

```
bundle exec rspec
```

Some other notes

- For digital seal tests, the we have not uploaded documents with the real document to the repo, but captured the request responses

## ERD generation

- To generate up to date erd diagrams, make sure you have graphiviz installed locally

```
bundle exec erd
```
