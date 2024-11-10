import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAIL = "bartolopaul11@gmail.com";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, firstName, lastName } = body;

    if (!email || !password || !firstName || !lastName) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return new NextResponse("User already exists", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Determine role based on email
    const role = email.toLowerCase() === ADMIN_EMAIL ? "admin" : "user";

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("Registration error:", error);
    return new NextResponse("Error creating user", { status: 500 });
  }
}