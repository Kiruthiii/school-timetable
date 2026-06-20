import { forwardRef } from "react";

const Card = forwardRef(({ 
  children, 
  className = "", 
  variant = "default",
  padding = "md",
  ...props 
}, ref) => {
  const variants = {
    default: "bg-surface border border-border shadow-sm",
    elevated: "bg-surface shadow-lg border-none",
    outlined: "bg-surface border-2 border-border",
    ghost: "bg-transparent border-none shadow-none",
  };
  
  const paddings = {
    none: "",
    sm: "p-3 sm:p-4",
    md: "p-4 sm:p-6",
    lg: "p-4 sm:p-8",
  };
  
  return (
    <div
      ref={ref}
      className={`rounded-2xl ${variants[variant]} ${paddings[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";

export const CardHeader = forwardRef(({ children, className = "", ...props }, ref) => (
  <div ref={ref} className={`mb-4 ${className}`} {...props}>
    {children}
  </div>
));

CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef(({ children, className = "", ...props }, ref) => (
  <h3 ref={ref} className={`text-lg font-semibold text-text-primary ${className}`} {...props}>
    {children}
  </h3>
));

CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef(({ children, className = "", ...props }, ref) => (
  <p ref={ref} className={`text-text-secondary text-sm mt-1 ${className}`} {...props}>
    {children}
  </p>
));

CardDescription.displayName = "CardDescription";

export const CardContent = forwardRef(({ children, className = "", ...props }, ref) => (
  <div ref={ref} className={className} {...props}>
    {children}
  </div>
));

CardContent.displayName = "CardContent";

export const CardFooter = forwardRef(({ children, className = "", ...props }, ref) => (
  <div ref={ref} className={`mt-4 pt-4 border-t border-border flex items-center gap-3 ${className}`} {...props}>
    {children}
  </div>
));

CardFooter.displayName = "CardFooter";

export default Card;