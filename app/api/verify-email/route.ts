import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, pin } = await req.json();

    const user = await prisma.user.findFirst({
      where: {
        email,
        verifyPin: pin,
        verifyPinExpiry: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return new NextResponse("Invalid or expired verification code", { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verifyPin: null,
        verifyPinExpiry: null
      }
    });

    return NextResponse.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Email verification error:", error);
    return new NextResponse("Error verifying email", { status: 500 });
  }
} 