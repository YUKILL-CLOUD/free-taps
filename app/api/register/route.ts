import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";

const ADMIN_EMAIL = "bartolopaul11@gmail.com";

export async function POST(req: Request) {
  try {
    const { email, password, firstName, lastName } = await req.json();

    if (!email || !password || !firstName || !lastName) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return new NextResponse("User already exists", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Determine role based on email
    const role = email.toLowerCase() === ADMIN_EMAIL ? "admin" : "user";

    const verifyPin = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit PIN
    const verifyPinExpiry = new Date(Date.now() + 600000); // 10 minutes

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: email.toLowerCase() === ADMIN_EMAIL ? "admin" : "user",
        verifyPin,
        verifyPinExpiry,
      },
    });

    await sendVerificationEmail(email, verifyPin);

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("Registration error:", error);
    return new NextResponse("Error creating user", { status: 500 });
  }
}