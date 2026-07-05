"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search as SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function SearchTrigger() {
  const router = useRouter();
  const [value, setValue] = useState("");

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Search"
            className="size-11 lg:size-9"
          />
        }
      >
        <SearchIcon className="size-5" />
      </SheetTrigger>

      <SheetContent side="top" className="border-none pt-safe">
        <SheetTitle className="sr-only">Search products</SheetTitle>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const q = value.trim();
            router.push(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
          }}
          className="mx-auto flex w-full max-w-2xl items-center gap-3 px-4 py-6"
        >
          <SearchIcon className="size-5 shrink-0 text-muted-foreground" />
          <Input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Search products…"
            className="h-11 flex-1 text-base"
          />
          <SheetClose
            render={
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="kicker"
              />
            }
          >
            Search
          </SheetClose>
        </form>
      </SheetContent>
    </Sheet>
  );
}
