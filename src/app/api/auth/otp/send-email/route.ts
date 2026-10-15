import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { sendOtpEmail } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check rate limit: if an OTP was sent in the last 30 seconds for this email
    const recentOtp = await prisma.otpVerification.findFirst({
      where: {
        identifier: cleanEmail,
        type: 'EMAIL',
        createdAt: {
          gte: new Date(Date.now() - 30 * 1000), // within last 30s
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (recentOtp) {
      return NextResponse.json(
        { error: 'Please wait 30 seconds before requesting a new OTP.' },
        { status: 429 }
      );
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Mark previous unverified OTPs as verified/invalidated so only newest is valid
    await prisma.otpVerification.updateMany({
      where: {
        identifier: cleanEmail,
        type: 'EMAIL',
        verified: false,
      },
      data: {
        verified: true,
      },
    });

    // Save new OTP record
    await prisma.otpVerification.create({
      data: {
        identifier: cleanEmail,
        otpHash,
        type: 'EMAIL',
        expiresAt,
        attempts: 0,
        verified: false,
      },
    });

    // Send email via Nodemailer Gmail SMTP
    const sendResult = await sendOtpEmail(cleanEmail, otp);

    if (!sendResult.success) {
      return NextResponse.json(
        { error: 'Could not send OTP, try again' },
        { status: 500 }
      );
    }

    // Mask email for privacy (e.g. r***@example.com)
    const [userPart, domainPart] = cleanEmail.split('@');
    const maskedUser = userPart.length > 2
      ? `${userPart[0]}***${userPart[userPart.length - 1]}`
      : `${userPart[0]}***`;
    const maskedEmail = `${maskedUser}@${domainPart}`;

    return NextResponse.json({
      success: true,
      message: `A 6-digit OTP has been sent to ${maskedEmail}.`,
      maskedEmail,
    });
  } catch (err: any) {
    console.error('Error in send-email OTP route:', err);
    return NextResponse.json(
      { error: 'Could not send OTP, try again' },
      { status: 500 }
    );
  }
}
