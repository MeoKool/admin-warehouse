import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  // Exclude onChange
  value: DateRange | undefined;
  onChange: (date: DateRange | undefined) => void;
  placeholder?: string;
  align?: "center" | "start" | "end";
  locale?: any;
  disabled?: boolean;
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Chọn khoảng thời gian",
  align = "center",
  locale,
  className,
  disabled = false,
}: DateRangePickerProps) {
  const safeValue = React.useMemo(() => {
    if (!value) return undefined;
    return {
      from: value.from instanceof Date ? value.from : undefined,
      to: value.to instanceof Date ? value.to : undefined,
    };
  }, [value]);

  const handleSelect = (range: DateRange | undefined) => {
    if (disabled) return;
    if (range?.from && range?.to && range.from > range.to) {
      onChange({ from: range.to, to: range.from });
    } else {
      onChange(range);
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !safeValue && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {safeValue?.from ? (
              safeValue.to ? (
                <>
                  {format(safeValue.from, "dd/MM/yyyy", { locale })} -{" "}
                  {format(safeValue.to, "dd/MM/yyyy", { locale })}
                </>
              ) : (
                format(safeValue.from, "dd/MM/yyyy", { locale })
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align}>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={safeValue?.from}
            selected={safeValue}
            onSelect={handleSelect}
            numberOfMonths={2}
            locale={locale}
            disabled={disabled}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
