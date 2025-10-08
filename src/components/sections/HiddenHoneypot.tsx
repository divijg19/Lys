"use client";
import { useId } from "react";

export function HiddenHoneypot() {
  const hpId = useId();
  return (
    <div className="-left-[9999px] absolute top-auto h-0 w-0 overflow-hidden">
      <label htmlFor={hpId}>Do not fill this field</label>
      <input
        id={hpId}
        name="_hp"
        type="text"
        tabIndex={-1}
        autoComplete="off"
      />
    </div>
  );
}
