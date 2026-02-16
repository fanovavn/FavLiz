import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || "fallback-secret-key";

export interface AdminPayload {
    id: string;
    username: string;
    isRoot: boolean;
    name: string | null;
    permissions: string[];  // ["users.read", "items.write", ...]
    roles: string[];        // ["Root Admin", "Admin"]
}

export function signJWT(payload: AdminPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyJWT(token: string): AdminPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as AdminPayload;
    } catch {
        return null;
    }
}

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

export async function comparePassword(
    password: string,
    hash: string
): Promise<boolean> {
    return bcrypt.compare(password, hash);
}
