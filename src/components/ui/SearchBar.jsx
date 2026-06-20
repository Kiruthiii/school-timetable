import { forwardRef } from "react";
import { Search, X } from "lucide-react";

const SearchBar = forwardRef(({ 
  value, 
  onChange, 
  placeholder = "Search...",
  onClear,
  ...props 
}, ref) => {
  return (
    <div className="relative w-full sm:max-w-md">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted size-5 pointer-events-none" aria-hidden="true" />
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-11 pr-11 py-3 bg-surface border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
        {...props}
      />
      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors p-1"
          aria-label="Clear search"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
});

SearchBar.displayName = "SearchBar";

export default SearchBar;