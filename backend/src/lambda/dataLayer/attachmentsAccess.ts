import * as AWS from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk'
//
// const XAWS = AWSXRay.captureAWS(AWS);

const bucketName = process.env.IMAGES_S3_BUCKET;
const urlExpiration = process.env.SIGNED_URL_EXPIRATION;

export class AttachmentsAccess {

    constructor(private readonly s3 = new AWS.S3({signatureVersion: 'v4'})) {
    }

    async deleteAttachment(attachmentId: string): Promise<void> {
        await this.s3.deleteObject({
            Bucket: bucketName,
            Key: attachmentId
        }).promise();
    }

    getUploadUrl(attachmentId: string): string {
        return this.s3.getSignedUrl('putObject', {
            Bucket: bucketName,
            Key: attachmentId,
            Expires: parseInt(urlExpiration)
        })
    }

}
