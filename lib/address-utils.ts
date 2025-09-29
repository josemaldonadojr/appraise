const ABBR: Record<string, string> = {
    Avenue: "Ave",
    Boulevard: "Blvd",
    Circle: "Cir",
    Court: "Ct",
    Drive: "Dr",
    Lane: "Ln",
    Place: "Pl",
    Road: "Rd",
    Street: "St",
    Way: "Way",
};

const WORDS_TO_ABBR = new RegExp(
    `\\b(${Object.keys(ABBR).join("|")})\\b`,
    "gi"
);

function titleKey(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export function abbreviateStreet(address: string): string {
    if (!address) return "";
    const street = address.split(",")[0]?.trim() ?? "";
    return street.replace(WORDS_TO_ABBR, (word: string) => ABBR[titleKey(word)] || word);
}