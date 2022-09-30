resource "aws_s3_bucket_policy" "bucket_policy" {
  bucket = aws_s3_bucket.deploy_bucket.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource = [
          "${aws_s3_bucket.deploy_bucket.arn}",
          "${aws_s3_bucket.deploy_bucket.arn}/*"
        ]
      }
    ]
  })
}

resource "aws_s3_bucket" "deploy_bucket" {
  bucket = var.dashboard_s3_bucket
}

resource "aws_s3_bucket_acl" "this" {
  bucket = aws_s3_bucket.deploy_bucket.id
  acl    = "public-read"
}

resource "aws_s3_bucket_website_configuration" "site" {
  bucket = aws_s3_bucket.deploy_bucket.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "error.html"
  }
}

output "s3_bucket_name" {
    value = aws_s3_bucket.deploy_bucket.id
}