import nodemailer from "nodemailer";
import { env } from "../config/env";

const createTransporter = () =>
	nodemailer.createTransport({
		service: "Gmail",
		auth: {
			user: env.NODEMAILER_EMAIL,
			pass: env.NODEMAILER_PASSWORD,
		},
	});

export const sendOtpMail = async (
	email: string,
	otp: string,
): Promise<boolean> => {
	try {
        const transporter = createTransporter();
        const adminEmail = env.NODEMAILER_EMAIL as string;
        const mailOptions = {
			from: `"RentNRide" <${adminEmail}>`,
			to: email,
			subject: "Your OTP Verification Code",
			html: `
				<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
					<div style="background: #2563eb; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
						<h1 style="color: #fff; margin: 0; font-size: 28px; letter-spacing: -0.5px;">rentNride<span style="color: rgba(255,255,255,0.6);">.</span></h1>
					</div>
					<div style="padding: 40px; background: #fff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; text-align: center;">
						<h2 style="color: #111827; margin-top: 0; font-size: 22px;">Verify your email</h2>
						<p style="color: #6b7280; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">To complete your verification, please use the following One-Time Password (OTP). This code is valid for 5 minutes.</p>
						
						<div style="background: #f3f4f6; border-radius: 12px; padding: 20px; display: inline-block; margin: 0 auto; min-width: 180px;">
							<span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: bold; color: #2563eb; letter-spacing: 8px;">${otp}</span>
						</div>
						
						<p style="color: #9ca3af; font-size: 14px; margin-top: 30px;">If you didn't request this code, please ignore this email or contact support if you have concerns.</p>
						<div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f3f4f6;">
							<p style="color: #6b7280; font-size: 13px; margin: 0;">&copy; ${new Date().getFullYear()} RentNRide Platform. All rights reserved.</p>
						</div>
					</div>
				</div>
			`,
		};

        const info = await transporter.sendMail(mailOptions);

        return true;
    } catch (error) {
		console.error("Failed to send email:", error);
		return false;
	}
};

export const sendContactMail = async (data: {
	firstName: string;
	lastName: string;
	email: string;
	subject: string;
	message: string;
}): Promise<boolean> => {
	try {
		const transporter = createTransporter();
		const adminEmail = env.NODEMAILER_EMAIL as string;
		const fullName = `${data.firstName} ${data.lastName}`;

		await transporter.sendMail({
			from: `"RentNRide" <${adminEmail}>`,
			to: adminEmail,
			subject: `[Contact Form] ${data.subject}`,
			html: `
				<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
					<h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">New Contact Form Submission</h2>
					<table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
						<tr><td style="padding: 8px; font-weight: bold; color: #374151; width: 30%;">Name</td><td style="padding: 8px; color: #6b7280;">${fullName}</td></tr>
						<tr style="background: #f9fafb;"><td style="padding: 8px; font-weight: bold; color: #374151;">Email</td><td style="padding: 8px; color: #6b7280;">${data.email}</td></tr>
						<tr><td style="padding: 8px; font-weight: bold; color: #374151;">Subject</td><td style="padding: 8px; color: #6b7280;">${data.subject}</td></tr>
						<tr style="background: #f9fafb;"><td style="padding: 8px; font-weight: bold; color: #374151; vertical-align: top;">Message</td><td style="padding: 8px; color: #6b7280; white-space: pre-wrap;">${data.message}</td></tr>
					</table>
				</div>
			`,
		});

		await transporter.sendMail({
			from: `"RentNRide Support" <${adminEmail}>`,
			to: data.email,
			subject: `We received your message – RentNRide`,
			html: `
				<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #374151;">
					<div style="background: #2563eb; padding: 24px 32px; border-radius: 8px 8px 0 0;">
						<h1 style="color: #fff; margin: 0; font-size: 24px;">rentNride.</h1>
					</div>
					<div style="padding: 32px; background: #fff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
						<h2 style="color: #111827; margin-top: 0;">Hi ${fullName},</h2>
						<p style="line-height: 1.6;">Thank you for reaching out! We have received your message and our team will get back to you within <strong>24–48 hours</strong>.</p>
						<div style="background: #f9fafb; border-left: 4px solid #2563eb; padding: 16px; border-radius: 4px; margin: 24px 0;">
							<p style="margin: 0; font-weight: 600; color: #374151;">Your message:</p>
							<p style="margin: 8px 0 0; color: #6b7280; white-space: pre-wrap;">${data.message}</p>
						</div>
						<p style="line-height: 1.6; color: #6b7280;">In the meantime, feel free to explore our platform or browse available vehicles.</p>
						<p style="margin-top: 32px; color: #9ca3af; font-size: 13px;">— The RentNRide Team</p>
					</div>
				</div>
			`,
		});

		return true;
	} catch (error) {
		console.error("Failed to send contact email:", error);
		return false;
	}
};
