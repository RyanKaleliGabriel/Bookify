import nodemailer, { Transporter } from "nodemailer";
import { AttendantDocument } from "../models/Attendant";
import pug from "pug";
import { htmlToText } from "html-to-text";

interface Email {
  to: string;
  firstName: string;
  from: string;
  url: string;
}

class Email {
  constructor(user: any, url: string) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = `Bookify Corp. <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template: any, subject: string) {
    // 1)Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async sendPasswordReset() {
    await this.send(
      "passwordReset",
      "Your password reset token(valid for the next 10 minutes)"
    );
  }

  async sendWelcome() {
    await this.send("welcome", "Welcome to the bookify family");
  }
}

export default Email;
