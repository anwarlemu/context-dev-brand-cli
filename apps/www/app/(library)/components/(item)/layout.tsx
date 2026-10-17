export default function ItemLayout({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-(--ds-layout-column-wide) px-4 pb-16 sm:px-8 lg:px-12">{children}</div>;
}
