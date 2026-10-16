export type Lang = "it" | "en";

export const LANGS: Lang[] = ["it", "en"];
export const DEFAULT_LANG: Lang = "it";

/** A string available in both languages. */
export type Localized<T = string> = Record<Lang, T>;

export const isLang = (value: string): value is Lang => (LANGS as string[]).includes(value);
