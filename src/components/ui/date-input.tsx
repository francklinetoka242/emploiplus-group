import { useEffect, useRef } from "react";
import flatpickr from "flatpickr";
import type { Options } from "flatpickr/dist/types/options";
import type { Instance } from "flatpickr/dist/types/instance";
import "flatpickr/dist/flatpickr.min.css";
import { cn } from "@/lib/utils";

interface DateInputProps {
  value?: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
  className?: string;
  minDate?: string;
  maxDate?: string;
  dateFormat?: "Y-m-d" | "Y-m" | "Y-m-d\\TH:i";
}

export function DateInput({
  value,
  onChange,
  placeholder = "YYYY-MM-DD",
  disabled = false,
  required = false,
  id,
  name,
  className,
  minDate,
  maxDate,
  dateFormat = "Y-m-d",
}: DateInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const instanceRef = useRef<Instance | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!inputRef.current) return;
    const options: Options = {
      dateFormat,
      enableTime: dateFormat === "Y-m-d\\TH:i",
      time_24hr: true,
      allowInput: true,
      monthSelectorType: "static",
      minDate: minDate || undefined,
      maxDate: maxDate || undefined,
      onChange: (selectedDates, dateText) => {
        onChangeRef.current(selectedDates.length > 0 ? dateText : "");
      },
    };
    instanceRef.current = flatpickr(inputRef.current, options);
    return () => {
      instanceRef.current?.destroy();
      instanceRef.current = null;
    };
  }, [dateFormat, maxDate, minDate]);

  useEffect(() => {
    const instance = instanceRef.current;
    if (!instance) return;
    const nextValue = value || "";
    if (instance.input.value !== nextValue) {
      instance.setDate(nextValue, false, dateFormat);
    }
  }, [dateFormat, value]);

  useEffect(() => {
    instanceRef.current?.set({ minDate: minDate || undefined, maxDate: maxDate || undefined });
  }, [maxDate, minDate]);

  return (
    <input
      ref={inputRef}
      type="text"
      id={id}
      name={name}
      value={value || ""}
      onChange={(event) => onChangeRef.current(event.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      autoComplete="off"
      className={cn(
        "h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs outline-none transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    />
  );
}
