import { PortalHost } from "@rn-primitives/portal";
import { Stack } from "expo-router";
import { ThemeProvider } from "expo-router/react-navigation";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { NAV_THEME } from "@/lib/theme";
import "../global.css";

export default function RootLayout() {
  const colorScheme = useColorScheme() === "dark" ? "dark" : "light";

  return (
    <ThemeProvider value={NAV_THEME[colorScheme]}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      {/* contentStyle background matches the theme so toggling doesn't flash a
          mismatched (white) navigator background between renders. */}
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: NAV_THEME[colorScheme].colors.background },
        }}
      />
      <PortalHost />
    </ThemeProvider>
  );
}
