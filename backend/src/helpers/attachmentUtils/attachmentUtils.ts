import * as AWS from 'aws-sdk'

export class TodoStorage {
  constructor(
    private readonly s3Client: AWS.S3,
    private readonly s3BucketName: string,
    private readonly urlExpiration: Number
  ) {
  }

  async getAttachmentUrl(attachmentId: string): Promise<string> {
    return `https://${this.s3BucketName}.s3.amazonaws.com/${attachmentId}`
  }

  async getUploadUrl(attachmentId: any): Promise<string> {
    return this.s3Client.getSignedUrl('putObject', {
      Bucket: this.s3BucketName,
      Key: attachmentId,
      Expires: this.urlExpiration
    })
  }
}
