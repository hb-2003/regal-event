"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SelectProps = {
  label?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  variant?: "admin" | "lux";
  disabled?: boolean;
  id?: string;
  className?: string;
  hint?: string;
  labelClassName?: string;
  labelStyle?: CSSProperties;
};

export default function Select({
  label,
  required,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  variant = "admin",
  disabled = false,
  id: idProp,
  className = "",
  hint,
  labelClassName,
  labelStyle,
}: SelectProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const listboxId = `${id}-listbox`;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [panelStyle, setPanelStyle] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const selected = options.find((o) => o.value === value);
  const isEmpty = value === "";
  const displayLabel = isEmpty
    ? placeholder
    : (selected?.label ?? placeholder);
  const isPlaceholder = isEmpty || !selected?.value;

  useEffect(() => setMounted(true), []);

  const updatePanelPosition = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPanelStyle({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  const openMenu = useCallback(() => {
    if (disabled) return;
    updatePanelPosition();
    const idx = Math.max(
      0,
      options.findIndex((o) => o.value === value && !o.disabled)
    );
    setHighlight(idx >= 0 ? idx : 0);
    setOpen(true);
  }, [disabled, options, updatePanelPosition, value]);

  const closeMenu = useCallback(() => setOpen(false), []);

  const selectOption = useCallback(
    (opt: SelectOption) => {
      if (opt.disabled) return;
      onChange(opt.value);
      closeMenu();
      triggerRef.current?.focus();
    },
    [onChange, closeMenu]
  );

  useEffect(() => {
    if (!open) return;
    updatePanelPosition();
    const onScrollOrResize = () => updatePanelPosition();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open, updatePanelPosition]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      const panel = document.getElementById(listboxId);
      if (panel?.contains(t)) return;
      closeMenu();
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open, listboxId, closeMenu]);

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        openMenu();
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      closeMenu();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((i) => {
        let next = i + 1;
        while (next < options.length && options[next]?.disabled) next += 1;
        return next >= options.length ? i : next;
      });
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((i) => {
        let next = i - 1;
        while (next >= 0 && options[next]?.disabled) next -= 1;
        return next < 0 ? i : next;
      });
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const opt = options[highlight];
      if (opt) selectOption(opt);
    }
  }

  const panel = open && mounted && (
    <ul
      id={listboxId}
      role="listbox"
      className={`ui-select-panel ui-select-panel--${variant}`}
      style={{
        position: "fixed",
        top: panelStyle.top,
        left: panelStyle.left,
        width: panelStyle.width,
        zIndex: 9999,
      }}
      data-lenis-prevent
    >
      {options.map((opt, i) => {
        const isSelected = opt.value === value;
        const isHighlighted = i === highlight;
        return (
          <li key={opt.value || `opt-${i}`} role="presentation">
            <button
              type="button"
              role="option"
              aria-selected={isSelected}
              disabled={opt.disabled}
              className={[
                "ui-select-option",
                isSelected ? "is-selected" : "",
                isHighlighted ? "is-highlighted" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onMouseEnter={() => setHighlight(i)}
              onClick={() => selectOption(opt)}
            >
              <span className="ui-select-option-check" aria-hidden>
                {isSelected ? "✓" : ""}
              </span>
              <span>{opt.label}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className={`ui-select ui-select--${variant} ${className}`.trim()}>
      {label && (
        <label
          htmlFor={id}
          className={
            labelClassName ??
            (variant === "lux" ? "lux-label" : "ui-select-label")
          }
          style={labelStyle}
        >
          {label}
          {required && (
            <span
              className="ui-select-required"
              style={{ color: variant === "lux" ? "#FCCD97" : "#c1121f" }}
            >
              {" "}
              *
            </span>
          )}
        </label>
      )}
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        className={`ui-select-trigger ui-select-trigger--${variant}${isPlaceholder ? " is-placeholder" : ""}`}
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={onKeyDown}
      >
        <span className="ui-select-trigger-text">{displayLabel}</span>
        <span className={`ui-select-chevron${open ? " is-open" : ""}`} aria-hidden>
          ▾
        </span>
      </button>
      {hint && variant === "admin" && (
        <p className="ui-select-hint">{hint}</p>
      )}
      {panel && createPortal(panel, document.body)}
    </div>
  );
}
