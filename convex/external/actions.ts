import { v } from "convex/values";
import { internalAction } from "../_generated/server";

function parseCSV(csvContent: string): Array<Record<string, string>> {
    const lines = csvContent.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows: Array<Record<string, string>> = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const row: Record<string, string> = {};

        headers.forEach((header, index) => {
            row[header] = values[index] || '';
        });

        rows.push(row);
    }

    return rows;
}

export const lookupSingleAccount = internalAction({
    args: {
        address: v.string(),
    },
    returns: v.object({
        address: v.string(),
        accountNumber: v.union(v.string(), v.null()),
    }),
    handler: async (_, args) => {
        try {
            const url = new URL("https://lookups.sccmo.org/assessor/export");
            url.searchParams.set("reset_session", "true");
            url.searchParams.set("SitusName", args.address);
            url.searchParams.set("searchPropertyType[0]", "0");
            url.searchParams.set("results_per_page", "3");

            const response = await fetch(url.toString(), {
                method: 'GET',
            });

            if (!response.ok) {
                console.error(`Failed to fetch data for ${args.address}: ${response.status}`);
                return {
                    address: args.address,
                    accountNumber: null,
                };
            }

            const csvContent = await response.text();
            const rows = parseCSV(csvContent);
            const accountId = rows.length > 0 ? getAccountIdFromRow(rows[0]) : "";
            console.log(`Account ID for ${args.address}: ${accountId}`);
            return {
                address: args.address,
                accountNumber: accountId,
            };

        } catch (error) {
            console.error(`Error processing ${args.address}:`, error);
            return {
                address: args.address,
                accountNumber: null,
            };
        }
    },
});

/**
 * Extract account ID from a CSV row (converted from Python get_account_id_from_row)
 */
function getAccountIdFromRow(row: Record<string, string>): string {
    const accountFields = ["Account", "ACCOUNT", "Account Number", "AccountNumber", "Acct", "Account ID"];

    for (const key of accountFields) {
        if (key in row && row[key]?.trim()) {
            return row[key].trim();
        }
    }

    for (const [key, val] of Object.entries(row)) {
        if (typeof val === 'string' && val.includes('/assessor/details/')) {
            const match = val.match(/\/assessor\/details\/([A-Za-z0-9]+)/);
            if (match) {
                return match[1];
            }
        }
    }

    return "";
}