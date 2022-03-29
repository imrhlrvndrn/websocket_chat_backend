const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const nodemailer = require('nodemailer');

const SIB_SMTP_LOGIN = process.env.SIB_SMTP_LOGIN,
    SIB_SMTP_PASSWORD = process.env.SIB_SMTP_PASSWORD,
    SIB_SMTP_PORT = process.env.SIB_SMTP_PORT,
    SIB_SMTP_SERVER = process.env.SIB_SMTP_SERVER;

const Email = {
    createTransporter: () => {
        return nodemailer.createTransport({
            host: SIB_SMTP_SERVER,
            port: SIB_SMTP_PORT,
            secure: false,
            auth: {
                user: SIB_SMTP_LOGIN,
                pass: SIB_SMTP_PASSWORD,
            },
        });
    },

    chooseTemplate: (templateName, options) => {
        const templatePath = path.join(__dirname, '../templates', `${templateName}.hbs`);
        const html = fs.readFileSync(templatePath, 'utf8');
        return handlebars.compile(html)({ ...options });
    },

    sendEmail: async ({
        template = '',
        variables = {},
        to = '',
        subject = '',
        from = { name: 'Cohrt', address: 'no-reply@cohrt.club' },
    }) => {
        const htmlToSend = this.chooseTemplate(template, variables);

        const transporter = this.createTransporter();

        const mailOptions = {
            to,
            from,
            subject,
        };

        await transporter.sendMail({ ...mailOptions, html: htmlToSend });
    },
};

module.exports = Email;
