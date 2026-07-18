import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Plus, X, ChevronDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ComboboxFieldProps {
  label: string;
  placeholder: string;
  value: string;
  items: string[];
  onValueChange: (value: string) => void;
  onAddItem: (item: string) => void;
  onRemoveItem: (item: string) => void;
  storageKey?: string; // Optional key for localStorage persistence
}

const ComboboxField = ({
  label,
  placeholder,
  value,
  items,
  onValueChange,
  onAddItem,
  onRemoveItem,
  storageKey,
}: ComboboxFieldProps) => {
  const [newItemInput, setNewItemInput] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load persisted value on mount
  useEffect(() => {
    if (storageKey) {
      const stored = localStorage.getItem(storageKey);
      if (stored && items.includes(stored)) {
        onValueChange(stored);
      }
    }
  }, [storageKey, items]);

  // Persist value changes
  useEffect(() => {
    if (storageKey && value) {
      localStorage.setItem(storageKey, value);
    }
  }, [storageKey, value]);

  // Calculate dropdown position
  useEffect(() => {
    if (isHovered && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isHovered]);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 150);
  };

  const handleDropdownMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  const handleDropdownMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 150);
  };

  const handleAdd = () => {
    if (newItemInput.trim() && !items.includes(newItemInput.trim())) {
      onAddItem(newItemInput.trim());
      setNewItemInput("");
    }
  };

  const handleSelect = (item: string) => {
    // Toggle selection - clicking selected item deselects it
    if (value === item) {
      onValueChange("");
      if (storageKey) {
        localStorage.removeItem(storageKey);
      }
    } else {
      onValueChange(item);
    }
    setIsHovered(false);
  };

  const handleRemove = (item: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemoveItem(item);
    if (value === item) {
      onValueChange("");
    }
  };

  const dropdown = isHovered && createPortal(
    <div
      ref={dropdownRef}
      className="fixed z-[9999] bg-card border border-border rounded-md shadow-lg"
      style={{
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        width: dropdownPosition.width,
      }}
      onMouseEnter={handleDropdownMouseEnter}
      onMouseLeave={handleDropdownMouseLeave}
    >
      {/* Add new item input */}
      <div className="p-2 border-b border-border">
        <div className="flex gap-2">
          <Input
            placeholder={`Add new ${label.toLowerCase()}...`}
            value={newItemInput}
            onChange={(e) => setNewItemInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="h-8 text-sm"
            onClick={(e) => e.stopPropagation()}
          />
          <Button onClick={handleAdd} size="icon" variant="outline" className="h-8 w-8 shrink-0">
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Options list */}
      <div className="max-h-48 overflow-y-auto">
        {items.length === 0 ? (
          <div className="px-3 py-4 text-sm text-muted-foreground text-center">
            No options yet. Add one above.
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item}
              onClick={() => handleSelect(item)}
              className={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-muted transition-colors ${
                value === item ? "bg-muted" : ""
              }`}
            >
              <span className="text-sm text-foreground">{item}</span>
              <button
                onClick={(e) => handleRemove(item, e)}
                className="text-muted-foreground hover:text-destructive ml-2"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>,
    document.body
  );

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative"
      >
        <div className="flex items-center justify-between w-full h-10 px-3 py-2 rounded-md border border-input bg-background cursor-pointer hover:bg-muted/50 transition-colors">
          <span className={`text-sm ${value ? "text-foreground" : "text-muted-foreground"}`}>
            {value || "<Select>"}
          </span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </div>
        {dropdown}
      </div>
    </div>
  );
};

export default ComboboxField;
