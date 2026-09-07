import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DashboardClient from "./dashboard-client";
import DashboardWaitlist from "./DashboardWaitlist";

export default async function DashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user) {
        redirect("/");
    }
    const adminId = process.env.ADMIN_USER_ID;
    const isAdmin = !!adminId && session.user.id === adminId;
    if (!session.user.enabled) {
        return <DashboardWaitlist user={session.user} />;
    }
    return <DashboardClient user={session.user} isAdmin={isAdmin} />;
}
