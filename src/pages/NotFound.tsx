import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/ui/page-header";

export default function NotFound() {
  const location = useLocation();

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.error("404:", location.pathname);
    }
  }, [location.pathname]);

  return (
    <Layout>
      <PageHeader
        title="404"
        description="Oops! Página no encontreada"
        action={
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="text-primary underline hover:text-primary/90"
            >
              Volver al inicio
            </a>
          </div>
        }
      />
    </Layout>
  );
}
