const AWS = require('aws-sdk');
const formidable = require('formidable');
const fs = require('fs');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        const form = new formidable.IncomingForm();
        form.parse(req, (err, fields, files) => {
            if (err) {
                res.status(500).json({ message: 'Form parse error' });
                return;
            }

            const file = files.file;
            const fileStream = fs.createReadStream(file.path);

            const params = {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: file.name,
                Body: fileStream,
                ContentType: file.type
            };

            s3.upload(params, (err, data) => {
                if (err) {
                    res.status(500).json({ message: 'Upload error', error: err });
                    return;
                }

                res.status(200).json({ url: data.Location });
            });
        });
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
};
