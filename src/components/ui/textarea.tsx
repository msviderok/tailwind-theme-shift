import { cn } from "@/lib/utils";
import { splitProps, type ComponentProps } from "solid-js";

function Textarea(props: ComponentProps<"textarea">) {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <textarea
      data-slot="textarea"
      class={cn(
        "flex field-sizing-content min-h-16 w-full resize-none rounded-2xl border border-transparent bg-input/50 px-3 py-3 text-base transition-[color,box-shadow,background-color] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        local.class
      )}
      {...rest}
    />
  );
}

export { Textarea };
