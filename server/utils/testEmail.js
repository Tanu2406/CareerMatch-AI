import nodemailer from 'nodemailer';

(async function run() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT) : 587;
  const secure = process.env.EMAIL_SECURE === 'true';
  const to = process.env.TEST_EMAIL || user;

  if (!user || !pass) {
    console.error('EMAIL_USER or EMAIL_PASS not set. Set env vars and retry.');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  });

  try {
    console.log('Verifying transporter...');
    await transporter.verify();
    console.log('Transporter OK. Sending test email to', to);

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || user,
      to,
      subject: 'CareerMatch AI - Test Email',
      text: 'This is a test email from CareerMatch AI. If you receive this, SMTP is working.'
    });

    console.log('Test email sent:', info.messageId || info.response || info);
    process.exit(0);
  } catch (err) {
    console.error('Error sending test email:', err);
    process.exit(2);
  }
})();
