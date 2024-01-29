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

### Local - File storage setup

- For the local environment, if you want to test the full file upload process, you would want to run a local version of minio to simulate the object storage environment.
- Install minio:

```
brew install minio

minio server --address 127.0.0.1:9001 ~/Documents/whatever-your-folder-for-storage-is
```

- Log into minio with the admin/password provided and set up the environment.
- Set up a bucket (in our example we call it `hous-local`)
- Set up a user (in our example, we call it `hous-formio-user`)
- Set up a policy (in our example, we call it `formioupload`)

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "UploadFile",
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject"
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

- Assign the policy to the user
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

## Deployment (DevOps)

TBD

## Testing

All unit tests should be run like the following:

```
bundle exec rspec
```

Some other notes

- For digital seal tests, the we have not uploaded documents with the real document to the repo, but captured the request responses
