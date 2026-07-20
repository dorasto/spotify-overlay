import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AdminClient from "./admin-client";

export const runtime = "nodejs";

export default async function AdminPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect("/");
    }

    const adminId = process.env.ADMIN_USER_ID;
    if (!adminId || session.user.id !== adminId) {
        redirect("/dashboard");
    }

    return <AdminClient user={session.user} />;
}
