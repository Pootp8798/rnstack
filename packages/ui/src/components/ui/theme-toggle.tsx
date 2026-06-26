import { Icon } from "@repo/ui/components/ui/icon";
import { Button } from "@repo/ui/components/ui/button";
import { MoonStar, Sun } from "lucide-react-native";
import { Appearance, useColorScheme } from "react-native";

/**
 * Toggles between light and dark mode using React Native's `Appearance` API,
 * which is what NativeWind v5's `dark:` variant reacts to. Drop it anywhere;
 * it reflects and flips the current color scheme.
 */
function ThemeToggle() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Button
      variant="outline"
      size="icon"
      onPress={() => Appearance.setColorScheme(isDark ? "light" : "dark")}
      accessibilityLabel="Toggle color scheme"
    >
      <Icon as={isDark ? Sun : MoonStar} className="text-foreground" />
    </Button>
  );
}

export { ThemeToggle };
