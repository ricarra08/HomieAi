"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchAddresses, type AutocompleteAddress } from "@/lib/geocode";
import { useDebouncedValue } from "@/lib/hooks/use-debounce";

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  id?: string;
  stateCode?: string;
  onBlur?: () => void;
}

export function AddressAutocomplete({
  value,
  onChange,
  placeholder,
  required,
  className,
  id,
  stateCode,
  onBlur,
}: AddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<AutocompleteAddress[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const isSelectingRef = useRef(false);
  const listboxId = id ? `${id}-listbox` : "address-listbox";

  const debouncedQuery = useDebouncedValue(inputValue, 400);

  // Sync external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Fetch suggestions when debounced query changes
  useEffect(() => {
    if (debouncedQuery.length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    // Abort any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setIsOpen(true);
    searchAddresses(debouncedQuery, { stateCode, signal: controller.signal })
      .then((results) => {
        if (!controller.signal.aborted) {
          setSuggestions(results);
          setIsOpen(results.length > 0);
          setHighlightedIndex(-1);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [debouncedQuery, stateCode]);

  // Update dropdown position
  const updatePosition = useCallback(() => {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  // Recalculate position when dropdown opens
  useEffect(() => {
    if (!isOpen) return;
    updatePosition();

    function handleScroll() {
      setIsOpen(false);
    }

    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [isOpen, updatePosition]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  function selectSuggestion(address: AutocompleteAddress) {
    const formatted = address.formattedAddress;
    setInputValue(formatted);
    onChange(formatted);
    setSuggestions([]);
    setIsOpen(false);
    setHighlightedIndex(-1);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setInputValue(val);
    onChange(val);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
        if (highlightedIndex >= 0) {
          e.preventDefault();
          selectSuggestion(suggestions[highlightedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  }

  function handleBlur() {
    if (isSelectingRef.current) {
      isSelectingRef.current = false;
      return;
    }
    setTimeout(() => {
      if (!isSelectingRef.current) {
        setIsOpen(false);
        onBlur?.();
      }
    }, 150);
  }

  const showDropdown = isOpen && (suggestions.length > 0 || isLoading);

  const dropdown = showDropdown ? (
    <ul
      id={listboxId}
      role="listbox"
      className="bg-card rounded-lg border border-border shadow-sm py-1 overflow-hidden"
      style={{
        position: "fixed",
        top: dropdownPos.top,
        left: dropdownPos.left,
        width: dropdownPos.width,
        zIndex: 100,
      }}
    >
      {isLoading && suggestions.length === 0 ? (
        <li className="px-3 py-2 text-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Searching addresses...
        </li>
      ) : (
        suggestions.map((addr, i) => (
          <li
            key={`${addr.formattedAddress}-${i}`}
            id={`${listboxId}-option-${i}`}
            role="option"
            aria-selected={i === highlightedIndex}
            className={`px-3 py-2 text-base cursor-pointer transition-colors ${
              i === highlightedIndex
                ? "bg-muted text-foreground"
                : "text-foreground hover:bg-muted"
            }`}
            onMouseDown={(e) => {
              e.preventDefault();
              isSelectingRef.current = true;
              selectSuggestion(addr);
              inputRef.current?.focus();
            }}
          >
            {addr.formattedAddress}
          </li>
        ))
      )}
    </ul>
  ) : null;

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        id={id}
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={isOpen ? listboxId : undefined}
        aria-activedescendant={
          highlightedIndex >= 0 ? `${listboxId}-option-${highlightedIndex}` : undefined
        }
        aria-autocomplete="list"
        autoComplete="off"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={updatePosition}
        placeholder={placeholder}
        required={required}
        className={className}
      />
      {typeof window !== "undefined" && dropdown
        ? createPortal(dropdown, document.body)
        : null}
    </div>
  );
}
