export const SLUG_MAX_LENGTH = 64;

// Room for a "-<n>" suffix so a deduplicated slug never exceeds the max length.
const BASE_MAX_LENGTH = SLUG_MAX_LENGTH - 8;

const FALLBACK_SLUG = "project";

// "My Website Redesign!" -> "my-website-redesign", "Café Ünïcode" -> "cafe-unicode".
// Names with no Latin letters or digits (e.g. "!!!" or "日本") fall back to "project".
export function slugify(name: string): string {
    const slug = name
        .normalize("NFKD")
        .replace(/[̀-ͯ]/g, "") // strip accents left over by NFKD
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, BASE_MAX_LENGTH)
        .replace(/-+$/g, ""); // slicing can leave a trailing hyphen

    return slug || FALLBACK_SLUG;
}

// Given a base slug and the owner's slugs that already start with it, return
// the base itself if free, otherwise "<base>-<n>" with the next unused n.
export function nextAvailableSlug(base: string, taken: string[]): string {
    const takenSet = new Set(taken);
    if (!takenSet.has(base)) return base;

    let highest = 1;
    const suffixPattern = new RegExp(`^${base}-(\\d+)$`);
    for (const slug of takenSet) {
        const match = suffixPattern.exec(slug);
        if (match) highest = Math.max(highest, Number(match[1]));
    }
    return `${base}-${highest + 1}`;
}
