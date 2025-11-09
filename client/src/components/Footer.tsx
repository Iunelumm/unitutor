import { Link } from "wouter";
import { APP_TITLE } from "@/const";

export default function Footer() {
  return (
    <footer className="border-t bg-white w-full">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground text-center md:text-left">
            <p>© 2025 {APP_TITLE} Project. All rights reserved.</p>
            <p className="mt-1">Not affiliated with UCSB.</p>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
              Legal Disclaimer
            </Link>
            <Link href="/support" className="text-muted-foreground hover:text-primary transition-colors">
              Support
            </Link>
          </div>
        </div>
        <div className="mt-4 text-xs text-center text-muted-foreground">
          For educational use only — {APP_TITLE} assumes no responsibility for off-platform interactions.
        </div>
      </div>
    </footer>
  );
}

