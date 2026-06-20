import { forwardRef } from "react";

const PageHeader = forwardRef(({ 
  title, 
  description, 
  action, 
  breadcrumbs,
  className = "",
  ...props 
}, ref) => {
  return (
    <div ref={ref} className={`mb-8 ${className}`} {...props}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 text-sm text-text-muted mb-4" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb.label} className="flex items-center gap-2">
              {index > 0 && <span className="text-text-muted">/</span>}
              {crumb.href ? (
                <a href={crumb.href} className="hover:text-text-primary transition-colors">
                  {crumb.label}
                </a>
              ) : (
                <span className="text-text-primary font-medium">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold text-text-primary truncate">
            {title}
          </h1>
          {description && (
            <p className="text-text-secondary mt-1">
              {description}
            </p>
          )}
        </div>
        
        {action && (
          <div className="flex-shrink-0 mt-2 sm:mt-0 w-full sm:w-auto flex flex-col sm:block [&>button]:w-full sm:[&>button]:w-auto">
            {action}
          </div>
        )}
      </div>
    </div>
  );
});

PageHeader.displayName = "PageHeader";

export default PageHeader;