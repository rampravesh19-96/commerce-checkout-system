import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { signAuthToken } from "../lib/jwt";

const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters long"),
  email: z.email("Enter a valid email address").transform((email) => email.toLowerCase()),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

const loginSchema = z.object({
  email: z.email("Enter a valid email address").transform((email) => email.toLowerCase()),
  password: z.string().min(1, "Password is required"),
});

function buildAuthResponse(user: { id: number; name: string; email: string }) {
  return {
    user,
    token: signAuthToken({
      userId: user.id,
      email: user.email,
    }),
  };
}

export async function signup(req: Request, res: Response) {
  try {
    const parsedData = signupSchema.safeParse(req.body);

    if (!parsedData.success) {
      return res.status(400).json({
        message: parsedData.error.issues[0]?.message || "Invalid signup data",
      });
    }

    const { name, email, password } = parsedData.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return res.status(201).json(buildAuthResponse(user));
  } catch (error) {
    console.error("Failed to sign up user", error);
    return res.status(500).json({ message: "Failed to sign up user" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const parsedData = loginSchema.safeParse(req.body);

    if (!parsedData.success) {
      return res.status(400).json({
        message: parsedData.error.issues[0]?.message || "Invalid login data",
      });
    }

    const { email, password } = parsedData.data;

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    return res.json(
      buildAuthResponse({
        id: user.id,
        name: user.name,
        email: user.email,
      }),
    );
  } catch (error) {
    console.error("Failed to log in user", error);
    return res.status(500).json({ message: "Failed to log in user" });
  }
}
