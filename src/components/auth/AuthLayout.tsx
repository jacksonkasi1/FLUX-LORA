
interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 bg-background relative">
      {/* Logo with "Flux" title */}
      <div className="mb-8 flex flex-col items-center space-y-3">
        <div className="w-8 h-8 bg-foreground rounded-[8px] transform rotate-12" />
        <h1 className="text-[24px] font-bold text-foreground tracking-tight">FLUX</h1>
      </div>
      
      {/* Content container */}
      <div className="w-full max-w-[320px] space-y-8 pb-20">
        <div className="text-center space-y-3">
          <h2 className="text-[28px] font-medium leading-tight tracking-tight text-foreground">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[16px] text-muted-foreground leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
        
        {children}
      </div>
      
      {/* Legal text at bottom - fixed positioning for mobile */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t border-border/50">
        <div className="max-w-[320px] mx-auto">
          <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};
