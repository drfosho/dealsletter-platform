import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dealsletter V2 — AI-Powered Real Estate Analysis",
  description:
    "Analyze any real estate deal with every leading AI model.",
};

export default function V2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style>{`
        .v2-root {
          overflow-x: hidden;
          max-width: 100vw;
        }
        *, *::before, *::after {
          box-sizing: border-box;
        }
        @media (max-width: 768px) {
          body {
            overflow-x: hidden;
          }
        }
      `}</style>
      <div className="v2-root">
        {children}
      </div>
    </>
  );
}
