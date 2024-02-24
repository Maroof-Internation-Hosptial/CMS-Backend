import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

transporter.verify((err, succ) => {
  if (err) {
    console.log(err);
  } else if (succ) {
    console.log("\x1b[34m", "🖂  Mail service connected");
  }
});

const sendVerificationEmail = async (email, data) => {
  console.log(`sending email to ${email}`);
  const mailOptions = {
    from: "muawin@gmail.com",
    to: email,
    subject: `${data.length === 8 ? "MAROOF CMS" : "Verification Code"}`,
    html: `<h5>${
      data.length === 8
        ? "Your Account has Successfully Created. Use the below mentioned Password to login"
        : "Code"
    }:</h5> ${data}`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Email sending failed:", error);
  }
};

export default sendVerificationEmail;
