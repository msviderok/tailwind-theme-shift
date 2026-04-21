import { Tabs as TabsPrimitive } from "@msviderok/base-ui-solid/tabs";
import { cva, type VariantProps } from "class-variance-authority";
import { mergeProps, splitProps } from "solid-js";

import { cn } from "@/lib/utils";

function Tabs(props: TabsPrimitive.Root.Props) {
  const mergedProps = mergeProps({ orientation: "horizontal" }, props);
  const [local, rest] = splitProps(mergedProps, ["class", "orientation"]);
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={local.orientation}
      class={cn("group/tabs flex gap-2 data-horizontal:flex-col", local.class)}
      {...rest}
    />
  );
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center rounded-full p-1 text-muted-foreground group-data-horizontal/tabs:h-9 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col group-data-vertical/tabs:rounded-2xl data-[variant=line]:rounded-none",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function TabsList(props: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  const mergedProps = mergeProps({ variant: "default" as const }, props);
  const [local, rest] = splitProps(mergedProps, ["class", "variant"]);
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={local.variant}
      class={cn(tabsListVariants({ variant: local.variant }), local.class)}
      {...rest}
    />
  );
}

function TabsTrigger(props: TabsPrimitive.Tab.Props) {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      class={cn(
        "relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-2 rounded-full border border-transparent! px-3 py-1 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start group-data-vertical/tabs:rounded-2xl group-data-vertical/tabs:px-3 group-data-vertical/tabs:py-1.5 hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 aria-disabled:pointer-events-none aria-disabled:opacity-50 dark:text-muted-foreground dark:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent",
        "data-active:bg-background data-active:text-foreground dark:data-active:border-input dark:data-active:bg-input/30 dark:data-active:text-foreground",
        "after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-[-5px] group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
        local.class
      )}
      {...rest}
    />
  );
}

function TabsContent(props: TabsPrimitive.Panel.Props) {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      class={cn("flex-1 text-sm outline-none", local.class)}
      {...rest}
    />
  );
}

export { Tabs, TabsContent, TabsList, tabsListVariants, TabsTrigger };
