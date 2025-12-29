import nodemailer from "nodemailer";

/* =====================================================
   SHARED TRANSPORT CREATOR (SAFE & SIMPLE)
===================================================== */
export const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/* =====================================================
   PASSWORD RESET EMAIL (UNCHANGED LOGIC)
===================================================== */
export const sendResetEmail = async (to, link) => {
  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: `"Car Service App" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Reset your password",
      html: `
        <h3>Password Reset</h3>
        <p><a href="${link}">Click here to reset password</a></p>
        <p>Expires in 1 hour</p>
      `,
    });

    console.log("✅ Reset email sent to", to);
  } catch (err) {
    console.error("❌ Reset email error:", err);
    throw err;
  }
};
