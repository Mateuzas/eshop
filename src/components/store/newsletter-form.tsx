"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterForm() {
  const [email, setEmail] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        // TODO: wire up to a real subscriber list (e.g. via Resend) — this
        // is placeholder-only for now.
        toast.success("You're on the list.");
        setEmail("");
      }}
      className="flex w-full max-w-sm gap-2"
    >
      <Input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email address"
        aria-label="Email address"
        className="h-11"
      />
      <Button type="submit" size="cta" className="shrink-0 px-4">
        Join
      </Button>
    </form>
  );
}
