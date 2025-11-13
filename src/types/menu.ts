export type SubmenuItem = { label: string; href: string };

export type HeaderItem =
  | { label: string; href: string; submenu?: undefined }
  | { label: string; href?: undefined; submenu: SubmenuItem[] };
