import Navbar from "./Navbar";

interface PageShellProps {
  children: React.ReactNode;
  hideNav?: boolean;
}

const PageShell = ({ children, hideNav = false }: PageShellProps) => (
  <div className="min-h-screen flex flex-col">
    {!hideNav && <Navbar />}
    <main className={`flex-1 ${!hideNav ? "pt-16 pb-16 md:pb-0" : ""}`}>
      {children}
    </main>
  </div>
);

export default PageShell;
