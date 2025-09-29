import { components } from "../_generated/api";
import { Resend } from "@convex-dev/resend";
import { internalMutation } from "../_generated/server";

export const resend: Resend = new Resend(components.resend, {
    apiKey: process.env.RESEND_API_KEY
});

export const sendTestEmail = internalMutation({
    handler: async (ctx) => {
        await resend.sendEmail(ctx, {
            from: "results@notify.appraisement.co",
            to: "delivered@resend.dev",
            subject: "Hi there",
            html: "This is a test email",
        });
    },
});