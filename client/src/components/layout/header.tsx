import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface HeaderProps {
  title: string;
  description?: string;
  showAddButton?: boolean;
  onAddClick?: () => void;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
  addButtonText?: string;
}

export default function Header({
  title,
  description,
  showAddButton = false,
  onAddClick,
  showSearch = false,
  onSearch,
  addButtonText = "資器材追加"
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  return (
    <header className="bg-card shadow-sm border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          {showSearch && (
            <div className="relative">
              <Input
                type="text"
                placeholder="資器材を検索..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 w-64"
              />
              <i className="fas fa-search absolute left-3 top-3 text-muted-foreground"></i>
            </div>
          )}
          
          {/* Add Button */}
          {showAddButton && (
            <Button
              onClick={onAddClick}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <i className="fas fa-plus mr-2"></i>
              {addButtonText}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
