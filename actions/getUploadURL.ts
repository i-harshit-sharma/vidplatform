// app/actions/get-upload-url.ts
"use server";
import { withAuth } from "@/libs/auth";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const getUploadURL = withAuth(async (user, fileName: string)=>{
    console.log("Generating upload URL for user:", user.username, "and file:", fileName);
    const S3 = new S3Client({
        region: "auto",
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID!,
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
        },
    })

    const uploadFileName = `raw-uploads/${user.username}/${fileName}-${Date.now()}.mp4`;

    const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: uploadFileName,
        ContentType: "video/mp4",
    });

    

    const signedUrl = await getSignedUrl(S3, command, { expiresIn: 600 });
    return {signedUrl, uploadFileName};
});

export default getUploadURL;