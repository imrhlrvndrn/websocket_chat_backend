const multer = require('multer');

const storage = multer.diskStorage({});

const uploadFileWithMulter = multer({ storage });

module.exports = { uploadFileWithMulter };
