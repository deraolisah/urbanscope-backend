import nodemailer from 'nodemailer';
import dotenv from "dotenv";

dotenv.config({ quiet : true });

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


transporter.verify((error) => {
  if (error) {
    console.error('Mail transporter error:', error);
  } else {
    console.log('Mail server is ready to send messages');
  }
});


const emailTemplates = {
  passwordReset: (data) => ({
    subject: 'Password Reset Code - UrbanScope',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px;"> UrbanScope </h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${data.user.username},</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            You requested a password reset for your account. Use the verification code below to reset your password:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="background: #333; color: white; padding: 20px; font-size: 32px; font-weight: bold; letter-spacing: 8px; border-radius: 8px; display: inline-block;">
              ${data.resetCode}
            </div>
          </div>
          <p style="color: #666; line-height: 1.6; margin-bottom: 10px;">
            This code will expire in 10 minutes for security reasons.
          </p>
          <p style="color: #666; line-height: 1.6;">
            If you didn't request this, please ignore this email and your password will remain unchanged.
          </p>
        </div>
        <div style="background: #333; padding: 20px; text-align: center; color: #999;">
          <p style="margin: 0; font-size: 14px;">
            &copy; ${new Date().getFullYear()} UrbanScope. All rights reserved.
          </p>
        </div>
      </div>
    `
  }),
  welcome: (data) => ({
    subject: 'Welcome to UrbanScope!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px;">Welcome to UrbanScope!</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${data.user.username},</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Thank you for registering with UrbanScope! We're excited to have you on board.
          </p>
          <p style="color: #666; line-height: 1.6;">
            Start exploring properties and find your dream home today!
          </p>
        </div>
        <div style="background: #333; padding: 20px; text-align: center; color: #999;">
          <p style="margin: 0; font-size: 14px;">
            &copy; ${new Date().getFullYear()} UrbanScope. All rights reserved.
          </p>
        </div>
      </div>
    `
  })
};

// Main sendEmail function
const sendEmail = async (to, templateName, data) => {
  try {
    const template = emailTemplates[templateName];
    
    if (!template) {
      throw new Error(`Email template '${templateName}' not found`);
    }

    const emailContent = template(data);

    const mailOptions = {
      from: `"UrbanScope" <${process.env.EMAIL_USER}>`,
      to,
      subject: emailContent.subject,
      html: emailContent.html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', to);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

// Specific email functions
export const sendPasswordResetEmail = async (user, resetCode) => {
  return await sendEmail(user.email, 'passwordReset', { resetCode, user });
};

export const sendWelcomeEmail = async (user) => {
  return await sendEmail(user.email, 'welcome', { user });
};

export default {
  sendEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  transporter
};