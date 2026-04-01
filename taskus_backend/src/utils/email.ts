import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const from = process.env.EMAIL_FROM!;

const baseTemplate = (content: string) => `
  <div style="background-color:#f6f9fc;padding:40px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.05);">
      
      <!-- Header -->
      <tr>
        <td style="padding:24px 32px;background:#111827;color:#ffffff;font-size:20px;font-weight:600;">
          Taskus
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding:32px;">
          ${content}
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="padding:24px 32px;font-size:12px;color:#6b7280;background:#f9fafb;">
          <p style="margin:0;"> ${new Date().getFullYear()} Taskus.</p>
        </td>
      </tr>

    </table>
  </div>
`;

export const sendAcceptanceEmail = async (
  to: string,
  firstName: string,
  organisationName: string
) => {
  await resend.emails.send({
    from,
    to,
    subject: `You're in! Welcome to ${organisationName}`,
    html: baseTemplate(`
      <h1 style="margin:0 0 16px;font-size:24px;color:#111827;">Welcome, ${firstName}! 🎉</h1>
      
      <p style="margin:0 0 16px;color:#374151;font-size:16px;">
        Great news — your request to join <strong>${organisationName}</strong> has been approved.
      </p>

      <p style="margin:0 0 24px;color:#374151;font-size:16px;">
        You can now access your workspace and start collaborating with your team.
      </p>

      <a href="#" style="display:inline-block;padding:12px 20px;background:#111827;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:500;">
        Go to Dashboard
      </a>

      <p style="margin:32px 0 0;color:#6b7280;font-size:14px;">
        We're excited to have you on board.
      </p>
    `)
  });
};

export const sendRejectionEmail = async (
  to: string,
  firstName: string,
  organisationName: string
) => {
  try {
    await resend.emails.send({
      from,
      to,
      subject: `Update on your request to join ${organisationName}`,
      html: baseTemplate(`
        <h1 style="margin:0 0 16px;font-size:22px;color:#111827;">
          Hi ${firstName},
        </h1>

        <p style="margin:0 0 16px;color:#374151;font-size:16px;">
          Thank you for your interest in joining <strong>${organisationName}</strong>.
        </p>

        <p style="margin:0 0 16px;color:#374151;font-size:16px;">
          After review, your request was not approved at this time.
        </p>

        <p style="margin:0 0 24px;color:#374151;font-size:16px;">
          If you believe this decision was made in error, we recommend contacting the organisation administrator for further clarification.
        </p>

        <p style="margin:0;color:#6b7280;font-size:14px;">
          We appreciate your understanding.
        </p>
      `)
    });
  } catch (error) {
    return;
  }
};

// 🔐 Password Reset Email
export const sendPasswordResetEmail = async (
  to: string,
  resetLink: string
) => {
  await resend.emails.send({
    from,
    to,
    subject: 'Reset your password',
    html: baseTemplate(`
      <h1 style="margin:0 0 16px;font-size:24px;color:#111827;">
        Reset your password
      </h1>

      <p style="margin:0 0 16px;color:#374151;font-size:16px;">
        We received a request to reset your password.
      </p>

      <p style="margin:0 0 24px;color:#374151;font-size:16px;">
        Click the button below to set a new password. This link will expire in 1 hour.
      </p>

      <a href="${resetLink}" style="display:inline-block;padding:12px 20px;background:#111827;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:500;">
        Reset Password
      </a>

      <p style="margin:24px 0 0;color:#6b7280;font-size:14px;">
        If you didn’t request this, you can safely ignore this email.
      </p>
    `)
  });
};