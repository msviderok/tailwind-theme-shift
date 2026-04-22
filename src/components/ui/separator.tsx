import { Separator as SeparatorPrimitive } from "@msviderok/base-ui-solid/separator";
import { mergeProps, splitProps } from "solid-js";

import { cn } from "@/lib/utils";

function Separator(props: SeparatorPrimitive.Props) {
  const mergedProps = mergeProps({ orientation: "horizontal" }, props);
  const [local, rest] = splitProps(mergedProps, ["class", "orientation"]);
  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={local.orientation}
      class={cn(
        "shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch",
        local.class,
      )}
      {...rest}
    />
  );
}

export { Separator };
