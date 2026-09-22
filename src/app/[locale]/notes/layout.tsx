import { getT } from "@/lib/i18n/get-messages";

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getT(locale, "seo");
  return { title: t("notesTitle"), description: t("notesDescription") };
}

export default function NotesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
