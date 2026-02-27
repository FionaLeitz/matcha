import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    
});

export const mailOptions = (to, subject, html) => ({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html
});

export const sendEmail = async (to, subject, html) => {
  try {
      const info = await transporter.sendMail(mailOptions(to, subject, html));
  } catch (error) {
      throw error;
  }
};