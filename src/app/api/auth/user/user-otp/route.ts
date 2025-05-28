import { emailAuthentication } from "@/config/NodeEmailer";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
    try {
        const emailRaw = req.nextUrl.searchParams.get('email');
        const email = emailRaw ? JSON.parse(decodeURIComponent(emailRaw)) : null;
        const devicesInfoRaw = req.nextUrl.searchParams.get('devicesInfo');
        const devicesInfo = devicesInfoRaw ? JSON.parse(decodeURIComponent(devicesInfoRaw)) : null;

        if (!email) {
            return NextResponse.json({ message: "Email is required" }, { status: 400 });
        }

        // Generate a 6-digit OTP
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

        const subject = 'OTP for user Authentication';

        await emailAuthentication(email, subject, getHTML(newOtp, devicesInfo));

        return NextResponse.json({ success: true, data: newOtp }, { status: 200 });
    } catch (error: unknown) {
        if (error instanceof Error) {
            return NextResponse.json({ message: error.message, success: false }, { status: 500 });
        }
    }
}


const getHTML = (newOtp: string, devicesInfo: { os: string; browser: string; userAgent: string }) => {
    return `
<div style="max-width: 600px; margin: auto; padding: 20px; font-family: Arial, sans-serif; color: #333; background: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 8px;">
  <h2 style="text-align: center; color: #2c3e50;">🔐 Verify Your Identity</h2>
  <p style="font-size: 16px; line-height: 1.5;">Hey there,</p>
  <p style="font-size: 16px; line-height: 1.5;">
    We received a request to authenticate your account. Use the 6-digit code below to continue.
  </p>
  <div style="text-align: center; margin: 30px 0;">
    <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #2c3e50; background: #eaf6ff; padding: 10px 20px; border-radius: 10px;">
      ${newOtp}
    </span>
  </div>
  ${devicesInfo ? `
  <p style="font-size: 14px; color: #777;">Login attempted using:</p>
  <ul style="font-size: 14px; color: #555; padding-left: 20px;">
    <li><strong>Operating System:</strong> ${devicesInfo.os}</li>
    <li><strong>Browser:</strong> ${devicesInfo.browser}</li>
  </ul>
  ` : ''}
  <p style="font-size: 14px; color: #999; margin-top: 40px;">
    If you didn’t request this, please ignore this email or secure your account.
  </p>
  <p style="font-size: 14px; color: #999; text-align: center; margin-top: 20px;">
    &mdash; MeetingSync   &mdash;
  </p>
</div>`;

}