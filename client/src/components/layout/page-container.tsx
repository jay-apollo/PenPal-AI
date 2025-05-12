import React from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { useIsMobile } from "@/hooks/use-mobile";

interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
}

export function PageContainer({ children, title }: PageContainerProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const isMobile = useIsMobile();

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        isMobileOpen={isMobileMenuOpen} 
        onMobileClose={handleMobileMenuClose} 
        className="hidden md:block" 
      />
      
      {/* Added md:ml-64 to offset the main content by the width of the sidebar */}
      <div className="flex flex-col flex-1 overflow-hidden w-full md:ml-64">
        <Header 
          title={title || ""} 
          onMobileMenuClick={handleMobileMenuToggle} 
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}