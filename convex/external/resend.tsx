"use node"

import { components } from "../_generated/api";
import { Resend } from "@convex-dev/resend";
import { internalAction } from "../_generated/server";
import { render, pretty } from "@react-email/render";
import { v } from "convex/values";

import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Link,
    Preview,
    Section,
    Text,
    Tailwind,
} from '@react-email/components';

export const resend: Resend = new Resend(components.resend, {
    apiKey: process.env.RESEND_API_KEY,
    testMode: false
});

const AppraisalReadyEmail = (props: any) => {
    const {
        userName = "John",
        propertyAddress = "123 Main Street, Anytown, ST 12345",
        estimatedValue = "$425,000 - $475,000",
        confidenceLevel = "Medium",
        appraisalId = "APR-2024-001234",
        viewReportUrl = "https://appraisement.co/results/APR-2024-001234",
        supportEmail = "support@appraisement.co",
        timestamp = "March 15, 2024 at 2:30 PM CST"
    } = props;

    return (
        <Html lang="en" dir="ltr">
            <Tailwind>
                <Head />
                <Preview>Your property appraisal draft is ready for review - {propertyAddress}</Preview>
                <Body className="bg-slate-50 font-sans py-[48px] leading-relaxed">
                    <Container className="bg-white rounded-[24px] shadow-lg max-w-[640px] mx-auto p-[48px] border border-slate-100">
                        {/* Header */}
                        <Section className="mb-[40px]">
                            <Heading className="font-serif font-light text-[32px] text-slate-900 m-0 mb-[16px] tracking-tight leading-[1.2]">
                                Your Property Appraisal is Ready
                            </Heading>
                            <Text className="text-[18px] text-slate-600 m-0 font-light leading-[1.6]">
                                Hi {userName}, we've completed the automated analysis for your property and your draft report is ready to review.
                            </Text>
                        </Section>

                        {/* Draft Status Alert */}
                        <Section className="bg-amber-50/50 border border-amber-100 rounded-[16px] p-[24px] mb-[40px]">
                            <Text className="text-[16px] font-medium text-amber-900 m-0 mb-[8px] tracking-wide">
                                DRAFT REPORT
                            </Text>
                            <Text className="text-[15px] text-amber-800/80 m-0 leading-[1.5] font-light">
                                This automated valuation is provided as an initial estimate for guidance purposes.
                            </Text>
                        </Section>

                        {/* Property Summary */}
                        <Section className="mb-[40px]">
                            <Heading className="font-serif font-light text-[24px] text-slate-900 m-0 mb-[24px] tracking-tight">
                                Property Summary
                            </Heading>
                            <div className="space-y-[16px]">
                                <Text className="text-[15px] text-slate-700 m-0 leading-[1.6]">
                                    <span className="font-medium text-slate-900">Address:</span>
                                    <br />
                                    <span className="text-slate-600">{propertyAddress}</span>
                                </Text>
                                <Text className="text-[15px] text-slate-700 m-0 leading-[1.6]">
                                    <span className="font-medium text-slate-900">Estimated Value:</span>
                                    <br />
                                    <span className="font-serif text-[18px] text-slate-900 font-medium">{estimatedValue}</span>
                                </Text>
                                <Text className="text-[15px] text-slate-700 m-0 leading-[1.6]">
                                    <span className="font-medium text-slate-900">Confidence Level:</span>
                                    <br />
                                    <span className="text-slate-600">{confidenceLevel}</span>
                                </Text>
                                <Text className="text-[15px] text-slate-700 m-0 leading-[1.6]">
                                    <span className="font-medium text-slate-900">Generated:</span>
                                    <br />
                                    <span className="text-slate-600">{timestamp}</span>
                                </Text>
                                <Text className="text-[15px] text-slate-700 m-0 leading-[1.6]">
                                    <span className="font-medium text-slate-900">Report ID:</span>
                                    <br />
                                    <span className="text-slate-500 font-mono text-[14px]">{appraisalId}</span>
                                </Text>
                            </div>
                        </Section>

                        {/* CTA Button */}
                        <Section className="text-center mb-[48px]">
                            <Button
                                href={viewReportUrl}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-[40px] py-[18px] rounded-full text-[16px] font-medium no-underline box-border inline-block shadow-sm transition-all duration-200"
                            >
                                View Draft Report
                            </Button>
                        </Section>

                        {/* Security Note */}
                        <Section className="bg-slate-50/50 border border-slate-100 rounded-[16px] p-[24px] mb-[32px]">
                            <Text className="text-[15px] font-medium text-slate-800 m-0 mb-[8px] tracking-wide">
                                SECURE ACCESS
                            </Text>
                            <Text className="text-[14px] text-slate-600 m-0 leading-[1.5] font-light">
                                This link is unique to you and expires in 30 days. Do not share this link with others.
                            </Text>
                        </Section>

                        {/* Plain URL Fallback */}
                        <Section className="mb-[32px]">
                            <Text className="text-[14px] text-slate-600 m-0 mb-[12px] font-light">
                                If the button doesn't work, copy and paste this link:
                            </Text>
                            <Text className="text-[12px] text-blue-600 break-all m-0 font-mono bg-slate-50 p-[12px] rounded-[8px] border border-slate-100">
                                {viewReportUrl}
                            </Text>
                        </Section>

                        <Hr className="border-slate-200 my-[40px] border-t-[1px]" />

                        {/* Disclaimer */}
                        <Section className="mb-[40px]">
                            <Heading className="font-serif font-light text-[20px] text-slate-900 m-0 mb-[16px] tracking-tight">
                                Important Disclaimer
                            </Heading>
                            <Text className="text-[14px] text-slate-600 m-0 leading-[1.6] font-light">
                                This automated valuation is a draft estimate based on available market data and should be used for guidance purposes only.
                                The estimated value may not reflect current market conditions or unique property characteristics.
                                Please verify all information and consult with a licensed appraiser before making any financial decisions or relying on this estimate.
                            </Text>
                        </Section>

                        {/* Footer */}
                        <Section className="pt-[24px] border-t border-slate-100">
                            <Text className="text-[13px] text-slate-500 m-0 mb-[12px] font-light leading-[1.5]">
                                You're receiving this email because you requested a property appraisal for the address listed above.
                            </Text>
                            <Text className="text-[13px] text-slate-500 m-0 font-light">
                                Questions? Contact our support team at{' '}
                                <Link href={`mailto:${supportEmail}`} className="text-blue-600 no-underline font-medium">
                                    {supportEmail}
                                </Link>
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};


export const sendTestEmail = internalAction({
    args: {
        userName: v.string(),
        propertyAddress: v.string(),
        estimatedValue: v.string(),
        appraisalId: v.string(),
        viewReportUrl: v.string(),
    },
    handler: async (ctx, args) => {
        const timestamp = new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            timeZoneName: 'short'
        });

        const html = await pretty(
            await render(
                <AppraisalReadyEmail 
                    userName={args.userName}
                    propertyAddress={args.propertyAddress}
                    estimatedValue={args.estimatedValue}
                    appraisalId={args.appraisalId}
                    viewReportUrl={args.viewReportUrl}
                    timestamp={timestamp}
                />
            )
        );


        await resend.sendEmail(ctx, {
            from: "results@notify.appraisement.co",
            to: "josemaldonadobusiness@gmail.com",
            subject: "Your appraisal report is ready to view",
            html: html,
        });
    },
});