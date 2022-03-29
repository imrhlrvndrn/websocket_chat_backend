const { CustomError } = require('./CustomError.service');
const { v2: cloudinary } = require('cloudinary');

const Cloudinary = {
    configureCloudinary: () => {
        cloudinary.config({
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
            cloud_name: process.env.CLOUDINARY_API_CLOUD_NAME,
        });
    },

    uploadFileToCloudinary: async (req, next) => {
        if (!req.file) return next(CustomError.badRequest(`Please select a valid file`));

        let uploadedFile;
        try {
            uploadedFile = await cloudinary.uploader.upload(req.file.path, {
                folder: `${process.env.CLOUDINARY_API_FOLDER}`,
                resource_type: 'auto',
            });

            return uploadedFile;
        } catch (error) {
            console.error(error);
            return next(error);
        }
    },
};

module.exports = Cloudinary;
