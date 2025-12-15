import nodemailer from "nodemailer";

export const sendResetEmail = async (to, link) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.verify();
    console.log("✅ SMTP Ready");

    await transporter.sendMail({
      from: `"Car Service App" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Reset your password",
      html: `
        <h3>Password Reset</h3>
        <p><a href="${link}">Click here to reset password</a></p>
        <p>Expires in 1 hour</p>
      `
    });

    console.log("✅ Reset email sent to", to);

  } catch (err) {
    console.error("❌ Email error:", err);
    throw err;
  }
};
