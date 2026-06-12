import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card rounded-xl border border-border shadow-sm p-10 text-center space-y-4 max-w-md">
        <p className="text-3xl font-semibold text-foreground">Page not found</p>
        <p className="text-base text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
        <Link
          href="/"
          className="inline-block bg-accent text-accent-foreground shadow-sm rounded-lg font-medium text-base hover:bg-accent/90 px-5 py-2.5"
        >
          Back to Phazr
        </Link>
      </div>
    </div>
  );
}
