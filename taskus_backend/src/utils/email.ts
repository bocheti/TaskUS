import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const from = process.env.EMAIL_FROM!;

export const sendAcceptanceEmail = async (to: string, username: string, organisationName: string) => {
    await resend.emails.send({
        from,
        to,
        subject: `You have been accepted into ${organisationName}`,
        html: `
        <h1>Welcome, ${username}!</h1>
        <p>Your request to join <strong>${organisationName}</strong> has been accepted.</p>
        <p>You can now log in to Taskus with the credentials you used to request access.</p>
        <p>We're excited to have you on board!</p>

        <p>Best regards,<br/>The Taskus Team</p>
        `
    });
};

export const sendRejectionEmail = async (to: string, username: string, organisationName: string) => {
    try {
        await resend.emails.send({
        from,
        to,
        subject: `Your request to join ${organisationName}`,
        html: `
        <h1>Hi ${username},</h1>
        <p>Unfortunately your request to join <strong>${organisationName}</strong> has been rejected.</p>
        `
    });
    } catch (error) {
        return;
    }
};

export const sendPasswordResetEmail = async (to: string, resetLink: string) => {
    await resend.emails.send({
        from,
        to,
        subject: 'Password reset request',
        html: `
        <h1>Password Reset</h1>
        <p>You requested a password reset. Click the link below:</p>
        <a href="${resetLink}">Reset your password</a>
        <p>This link expires in 1 hour.</p>
        <p>If you did not request this, ignore this email.</p>
        `
    });
};