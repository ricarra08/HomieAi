"use client";

import { useState, useEffect, useRef, useCallback, useId } from "react";
import { createPortal } from "react-dom";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { AutocompleteAddress } from "@/lib/geocode";
import { useDebouncedValue } from "@/lib/hooks/use-debounce";

async function fetchAddresses(
  query: string,
  options: { stateCode?: string; signal: AbortSignal }
): Promise<AutocompleteAddress[]> {
  const params = new URLSearchParams({ q: query });
  if (options.stateCode) params.set("state", options.stateCode);
  const res = await fetch(`/api/geocode?${params}`, { signal: options.signal });
  if (!res.ok) return [];
  return res.json();
}

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
  const [results, setResults] = useState<AutocompleteAddress[]>([]);
  const [fetchedKey, setFetchedKey] = useState("");
  const [selectedValue, setSelectedValue] = useState<string>(value);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  const inputRef = useRef<HTMLInputElement>(null);
  const isSelectingRef = useRef(false);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const instanceId = useId();
  const listboxId = id ? `${id}-listbox` : `address-${instanceId}-listbox`;

  const debouncedQuery = useDebouncedValue(value, 400);

  // Identity that pairs a fetched response with its query+stateCode, so
  // changing stateCode invalidates stale results from a different state.
  const currentKey = `${stateCode ?? ""}:${debouncedQuery}`;

  const userIsEditing = value !== selectedValue;
  const validQuery = debouncedQuery.length >= 3;
  const isFetchPending = debouncedQuery !== selectedValue && currentKey !== fetchedKey;
  const suggestions =
    userIsEditing && validQuery && currentKey === fetchedKey ? results : [];
  const isLoading = userIsEditing && validQuery && isFetchPending;

  const [trackedQuery, setTrackedQuery] = useState(debouncedQuery);
  if (debouncedQuery !== trackedQuery) {
    setTrackedQuery(debouncedQuery);
    setHighlightedIndex(-1);
  }

  useEffect(() => {
    if (debouncedQuery === selectedValue || debouncedQuery.length < 3) {
      return;
    }
    const controller = new AbortController();
    fetchAddresses(debouncedQuery, { stateCode, signal: controller.signal })
      .then((r) => {
        if (!controller.signal.aborted) {
          setResults(r);
          setFetchedKey(`${stateCode ?? ""}:${debouncedQuery}`);
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, [debouncedQuery, stateCode, selectedValue]);

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

  // While the dropdown is open: position it, and close on scroll or
  // mousedown outside the input.
  useEffect(() => {
    if (!isOpen) return;
    updatePosition();

    function close() {
      setIsOpen(false);
    }
    function handleClickOutside(e: MouseEvent) {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    window.addEventListener("scroll", close, true);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("scroll", close, true);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, updatePosition]);

  useEffect(() => {
    const timeoutRef = blurTimeoutRef;
    return () => {
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    };
  }, []);

  function selectSuggestion(address: AutocompleteAddress) {
    isSelectingRef.current = false;
    setSelectedValue(address.formattedAddress);
    onChange(address.formattedAddress);
    setIsOpen(false);
    setHighlightedIndex(-1);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSelectedValue("");
    setIsOpen(true);
    onChange(e.target.value);
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
    if (blurTimeoutRef.current !== null) {
      clearTimeout(blurTimeoutRef.current);
    }
    blurTimeoutRef.current = setTimeout(() => {
      blurTimeoutRef.current = null;
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
      {isLoading && (
        <li
          role="presentation"
          aria-live="polite"
          aria-busy="true"
          className={`px-3 py-2 text-sm text-muted-foreground flex items-center gap-2 ${
            suggestions.length > 0 ? "border-b border-border" : ""
          }`}
        >
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Searching addresses...
        </li>
      )}
      {suggestions.map((addr, i) => (
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
      ))}
    </ul>
  ) : null;

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        id={id}
        type="text"
        role="combobox"
        aria-expanded={showDropdown}
        aria-haspopup="listbox"
        aria-controls={showDropdown ? listboxId : undefined}
        aria-activedescendant={
          highlightedIndex >= 0 ? `${listboxId}-option-${highlightedIndex}` : undefined
        }
        aria-autocomplete="list"
        autoComplete="off"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={() => {
          if (blurTimeoutRef.current !== null) {
            clearTimeout(blurTimeoutRef.current);
            blurTimeoutRef.current = null;
          }
          updatePosition();
          setIsOpen(true);
        }}
        placeholder={placeholder}
        required={required}
        className={className}
      />
      {dropdown && createPortal(dropdown, document.body)}
    </div>
  );
}
