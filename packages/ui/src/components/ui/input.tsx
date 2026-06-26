import { cn } from "@repo/ui/lib/utils";
import { Platform, TextInput, View } from "react-native";

function Input({
  className,
  ...props
}: React.ComponentProps<typeof TextInput> & React.RefAttributes<TextInput>) {
  // Web: a single TextInput matches shadcn exactly (fixed height + padding).
  if (Platform.OS === "web") {
    return (
      <TextInput
        className={cn(
          "dark:bg-input/30 border-input bg-background text-foreground flex h-10 w-full min-w-0 flex-row items-center rounded-md border px-3 py-1 text-base leading-5 shadow-sm shadow-black/5 sm:h-9",
          props.editable === false &&
            "disabled:pointer-events-none disabled:cursor-not-allowed opacity-50",
          "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground outline-none transition-[color,box-shadow] md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className
        )}
        {...props}
      />
    );
  }

  // Native: a fixed-height TextInput shrinks when empty and a min-height is not
  // respected, so the box height lives on a wrapping View (a layout box that
  // doesn't depend on text content). The TextInput fills it.
  return (
    <View
      className={cn(
        "dark:bg-input/30 border-input bg-background h-10 w-full min-w-0 flex-row items-center overflow-hidden rounded-md border px-3 shadow-sm shadow-black/5",
        props.editable === false && "opacity-50",
        className
      )}
    >
      <TextInput
        className="text-foreground placeholder:text-muted-foreground/50 flex-1 p-0 text-base leading-5"
        // includeFontPadding lives on TextStyle, not TextInputProps — set via
        // style. Disables Android's extra font padding so text isn't clipped.
        // No fixed height here: the input sizes to its line box and the parent
        // View (h-10, items-center) centers it.
        style={{ includeFontPadding: false, textAlignVertical: "center" }}
        {...props}
      />
    </View>
  );
}

export { Input };
