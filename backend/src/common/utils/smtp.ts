import fs from "fs";
import path from "path";

import { env } from "../config/env";
import nodemailer from "nodemailer";

export async function sendMail(to: string, subject: string, html: string) {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPassword,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    await transporter.sendMail({
      from: `"Etharis" <${env.smtpUser}>`,
      to,
      subject,
      html,
      attachments: [
        {
          filename: "logo.png",
          path: path.join(__dirname, "../templates/logo.png"),
          cid: "etharislogo",
        },
        {
          filename: "lock.png",
          path: path.join(__dirname, "../templates/lock.png"),
          cid: "icon",
        },
      ],
    });

    console.log("Email sent successfully");
  } catch (error) {
    console.log("Error sending email:", error);
  }
}

export interface EmailTemplateData {
  NAME: string;
  URL: string;
}

export function renderTemplate(
  templateName: string,
  data: EmailTemplateData
): string {
  const filePath = path.join(__dirname, `../templates/${templateName}.html`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Template file not found: ${filePath}`);
  }

  let template = fs.readFileSync(filePath, "utf-8");

  // Replace placeholders {{.NAME}} and {{.URL}}
  (Object.keys(data) as (keyof EmailTemplateData)[]).forEach((key) => {
    const regex = new RegExp(`{{\\.${key}}}`, "g");
    template = template.replace(regex, data[key]);
  });

  return template;
}
