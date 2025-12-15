import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const run = async () => {
  await transporter.verify();
  console.log("✅ SMTP verified");

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: "Test Mail",
    text: "Email system working"
  });

  console.log("✅ Email sent");
};

run().catch(console.error);
