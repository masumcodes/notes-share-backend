import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.email.com",
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: "mdmasummiah76151@gmail.com",
    pass: "xwih eayy yqbi fstn",
  },
});

const sendEmail = async () => {
  try {
    const info = await transporter.sendMail({
      from: '"NoteShare 👻" <mdmasummiah76151@gmail.com>', // sender address
      to: "bar@example.com, baz@example.com", // list of receivers
      subject: "Hello ✔", // Subject line
      text: "Hello world?", // plain text body
      html: "<b>Hello world?</b>", // html body
    });
    console.log(info);
  } catch (error) {
    console.error("Error sending email:", error.message);
  }
};

sendEmail();
