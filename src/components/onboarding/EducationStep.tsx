import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const MAJORS = [
  "Computer Science",
  "Mathematics",
  "Biology",
  "Psychology",
  "Business",
  "Engineering",
  "Political Science",
  "Economics",
  "Communications",
  "N/A",
  "Other",
];

const SCHOOLS = [
  "Howard University",
  "Georgetown University",
  "George Washington University",
  "University of Maryland",
  "N/A",
  "Other",
];

const OCCUPATIONS = [
  "Software Engineer",
  "Data Analyst",
  "Product Manager",
  "Researcher",
  "Designer",
  "Cybersecurity Analyst",
  "Not sure yet",
  "Other",
];

interface ComboboxFieldProps {
  label: string;
  value: string;
  isCustom: boolean;
  options: string[];
  placeholder: string;
  onChange: (value: string, isCustom: boolean) => void;
}

function ComboboxField({ label, value, isCustom, options, placeholder, onChange }: ComboboxFieldProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const handleSelect = (selectedValue: string) => {
    if (selectedValue === "Other") {
      onChange("", true);
    } else {
      onChange(selectedValue, false);
    }
    setOpen(false);
    setSearch("");
  };

  const handleUseCustom = () => {
    onChange(search, true);
    setOpen(false);
    setSearch("");
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {isCustom ? (
        <div className="flex gap-2">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value, true)}
            placeholder={`Enter your ${label.toLowerCase()}`}
            className="h-12 bg-secondary/50 border-border/50"
          />
          <Button
            type="button"
            variant="outline"
            className="h-12"
            onClick={() => onChange("", false)}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full h-12 justify-between bg-secondary/50 border-border/50 hover:bg-secondary"
            >
              <span className={cn(!value && "text-muted-foreground")}>
                {value || placeholder}
              </span>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-card border-border" align="start">
            <Command className="bg-transparent">
              <CommandInput 
                placeholder={`Search ${label.toLowerCase()}...`}
                value={search}
                onValueChange={setSearch}
              />
              <CommandList>
                <CommandEmpty className="p-2">
                  {search && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={handleUseCustom}
                    >
                      Use "{search}"
                    </Button>
                  )}
                  {!search && <span className="text-sm text-muted-foreground p-2">No results found</span>}
                </CommandEmpty>
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option}
                      value={option}
                      onSelect={() => handleSelect(option)}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === option ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {option}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

interface EducationStepProps {
  major: string;
  majorIsCustom: boolean;
  school: string;
  schoolIsCustom: boolean;
  occupation: string;
  occupationIsCustom: boolean;
  onChange: (field: string, value: string, isCustom: boolean) => void;
}

export function EducationStep({
  major,
  majorIsCustom,
  school,
  schoolIsCustom,
  occupation,
  occupationIsCustom,
  onChange,
}: EducationStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-display font-semibold text-foreground">
          Tell us about yourself
        </h2>
        <p className="text-muted-foreground">
          This helps us personalize your learning journey
        </p>
      </div>

      <div className="space-y-4">
        <ComboboxField
          label="Current Major"
          value={major}
          isCustom={majorIsCustom}
          options={MAJORS}
          placeholder="Select your major..."
          onChange={(value, isCustom) => onChange('major', value, isCustom)}
        />

        <ComboboxField
          label="School"
          value={school}
          isCustom={schoolIsCustom}
          options={SCHOOLS}
          placeholder="Select your school..."
          onChange={(value, isCustom) => onChange('school', value, isCustom)}
        />

        <ComboboxField
          label="Desired Occupation"
          value={occupation}
          isCustom={occupationIsCustom}
          options={OCCUPATIONS}
          placeholder="Select your career goal..."
          onChange={(value, isCustom) => onChange('occupation', value, isCustom)}
        />
      </div>
    </div>
  );
}
