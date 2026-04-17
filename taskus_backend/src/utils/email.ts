import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const from = process.env.EMAIL_FROM!;

const baseTemplate = (content: string) => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="x-apple-disable-message-reformatting">
    <!--[if mso]>
    <noscript>
      <xml>
        <o:OfficeDocumentSettings>
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml>
    </noscript>
    <![endif]-->
  </head>
  <body style="margin:0;padding:0;background-color:#f6f9fc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <div style="background-color:#f6f9fc;padding:20px 10px;">
      <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.05);">
        
        <!-- Header -->
        <tr>
          <td style="padding:24px 32px;background:#111827;color:#ffffff;font-size:20px;font-weight:600;">
            Taskus
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px 24px;">
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
      
      <!-- Spacer for mobile -->
      <div style="height:20px;"></div>
    </div>
  </body>
  </html>
`;

const createDualLoginButtons = () => `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" style="width:100%;max-width:400px;">
          <tr>
            <td style="padding:0 4px;">
              <a href="https://www.taskus.app" style="display:block;padding:14px 20px;background:#61dafb;color:#000000;text-decoration:none;border-radius:8px;font-weight:600;text-align:center;font-size:15px;transition:opacity 0.2s;">
                Go to Login (R)
              </a>
            </td>
            <td style="padding:0 4px;">
              <a href="https://angular.taskus.app" style="display:block;padding:14px 20px;background:#c93033;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;text-align:center;font-size:15px;transition:opacity 0.2s;">
                Go to Login (A)
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
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
      <h1 style="margin:0 0 16px;font-size:24px;color:#111827;line-height:1.3;">
        Welcome, ${firstName}! 🎉
      </h1>
      
      <p style="margin:0 0 16px;color:#374151;font-size:16px;line-height:1.6;">
        Great news — your request to join <strong>${organisationName}</strong> has been approved.
      </p>

      <p style="margin:0 0 16px;color:#374151;font-size:16px;line-height:1.6;">
        You can now log in to your workspace and start collaborating with your team. Choose your preferred version below:
      </p>

      ${createDualLoginButtons()}

      <p style="margin:24px 0 0;color:#6b7280;font-size:14px;line-height:1.5;">
        We're excited to have you on board!
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
        <h1 style="margin:0 0 16px;font-size:22px;color:#111827;line-height:1.3;">
          Hi ${firstName},
        </h1>

        <p style="margin:0 0 16px;color:#374151;font-size:16px;line-height:1.6;">
          Thank you for your interest in joining <strong>${organisationName}</strong>.
        </p>

        <p style="margin:0 0 16px;color:#374151;font-size:16px;line-height:1.6;">
          After review, your request was not approved at this time.
        </p>

        <p style="margin:0 0 24px;color:#374151;font-size:16px;line-height:1.6;">
          If you believe this decision was made in error, we recommend contacting the organisation administrator for further clarification.
        </p>

        <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.5;">
          We appreciate your understanding.
        </p>
      `)
    });
  } catch (error) {
    return;
  }
};

export const sendPasswordResetEmail = async (
  to: string,
  resetLink: string
) => {
  await resend.emails.send({
    from,
    to,
    subject: 'Reset your password',
    html: baseTemplate(`
      <h1 style="margin:0 0 16px;font-size:24px;color:#111827;line-height:1.3;">
        Reset your password
      </h1>

      <p style="margin:0 0 16px;color:#374151;font-size:16px;line-height:1.6;">
        We received a request to reset your password.
      </p>

      <p style="margin:0 0 24px;color:#374151;font-size:16px;line-height:1.6;">
        Click the button below to set a new password. This link will expire in 1 hour.
      </p>

      <a href="${resetLink}" style="display:inline-block;padding:12px 20px;background:#111827;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:500;">
        Reset Password
      </a>

      <p style="margin:24px 0 0;color:#6b7280;font-size:14px;line-height:1.5;">
        If you didn't request this, you can safely ignore this email.
      </p>
    `)
  });
};