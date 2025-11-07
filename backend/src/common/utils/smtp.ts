import { Resend } from "resend";
import fs from "fs";
import path from "path";
import { env } from "../config";
import { AppError } from "../error";

const resend = new Resend(env.smtpPassword);

export async function sendMail(to: string, subject: string, html: string) {
  try {
    const result = await resend.emails.send({
      from: `Etharis <${env.smtpUser}>`,
      to,
      subject,
      html,
    });

    if (result.error) throw new AppError(result.error.message);

    return result;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new AppError("Failed to send email", 500);
  }
}

export interface EmailTemplateData {
  NAME: string;
  URL: string;
  DEAL_ID?: string;
}

export function renderTemplate(
  templateName: string,
  data: EmailTemplateData
): string {
  const filePath = path.join(__dirname, `../templates/${templateName}.html`);
  if (!fs.existsSync(filePath)) {
    throw new AppError(`Template file not found: ${filePath}`);
  }

  let template = fs.readFileSync(filePath, "utf-8");

  // Replace placeholders {{.NAME}} and {{.URL}}
  (Object.keys(data) as (keyof EmailTemplateData)[]).forEach((key) => {
    const regex = new RegExp(`{{\\.${key}}}`, "g");
    template = template.replace(regex, data[key] ?? "");
  });

  return template;
}
