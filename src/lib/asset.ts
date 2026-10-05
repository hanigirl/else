/** Path to a file in public/, with the site's base path (/learnuiux) in front. */
export const asset = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
