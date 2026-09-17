import React, { memo } from "react";
import { Platform } from "react-native";
import Svg, { G, Path, type SvgProps } from "react-native-svg";

export type ProtocolIconProps = Omit<SvgProps, "width" | "height" | "color"> & {
  size?: number;
  color?: string;
  active?: boolean;
};

type Glyph = {
  outline: string;
  solid?: string;
  selected?: string;
  compact?: { outline: string; solid?: string };
};

const decorativeProps = Platform.OS === "web"
  ? ({ "aria-hidden": true, focusable: false } as const)
  : ({
      accessible: false,
      accessibilityElementsHidden: true,
      importantForAccessibility: "no-hide-descendants",
    } as const);

/**
 * OFFICE_PROTOCOL / glyph system
 * 24-unit grid, square terminals, 45° cuts, and a shared optical stroke.
 * Icons are decorative: the surrounding control owns its accessible label.
 */
function createIcon(name: string, glyph: Glyph) {
  const Icon = memo(function ProtocolIcon({
    size = 24,
    color = "#EEF4EE",
    strokeWidth = 1.75,
    active = false,
    style,
    ...props
  }: ProtocolIconProps) {
    const drawing = size < 18 && glyph.compact ? glyph.compact : glyph;
    return (
      <Svg
        {...props}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        color={color}
        {...decorativeProps}
        style={[
          { position: "relative", flexShrink: 0 },
          style,
          { pointerEvents: "none" },
        ]}
      >
        <G
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="square"
          strokeLinejoin="miter"
        >
          <Path d={drawing.outline} />
        </G>
        {drawing.solid && <Path d={drawing.solid} fill={color} />}
        {active && glyph.selected && (
          <Path d={glyph.selected} fill={color} />
        )}
      </Svg>
    );
  });
  Icon.displayName = name;
  return Icon;
}

// Primary navigation: the filled details also identify the selected module.
export const Grid3X3 = createIcon("BingoMatrix", {
  outline:
    "M6 2H2V6 M18 2H22V6 M22 18V22H18 M6 22H2V18 " +
    "M5 5H8V8H5Z M10.5 5H13.5V8H10.5Z M16 5H19V8H16Z " +
    "M5 10.5H8V13.5H5Z M10.5 10.5H13.5V13.5H10.5Z M16 10.5H19V13.5H16Z " +
    "M5 16H8V19H5Z M10.5 16H13.5V19H10.5Z M16 16H19V19H16Z",
  selected: "M4.4 4.4H8.6V8.6H4.4Z M9.9 9.9H14.1V14.1H9.9Z M15.4 15.4H19.6V19.6H15.4Z",
  compact: {
    outline: "M6 2H2V6 M18 2H22V6 M22 18V22H18 M6 22H2V18",
    solid:
      "M5 5H8V8H5Z M10.5 5H13.5V8H10.5Z M16 5H19V8H16Z " +
      "M5 10.5H8V13.5H5Z M10.5 10.5H13.5V13.5H10.5Z M16 10.5H19V13.5H16Z " +
      "M5 16H8V19H5Z M10.5 16H13.5V19H10.5Z M16 16H19V19H16Z",
  },
});

export const Users = createIcon("ManagerDossier", {
  outline:
    "M3 5H17L20 8V21H3Z M7 2H20L23 5V17 " +
    "M7 9L8 8H10L11 9V12L10 13H8L7 12Z " +
    "M5.5 18V16.5L7 15H11L12.5 16.5V18 M15 11H17 M15 14H17 M15 17H17",
  selected:
    "M7 9L8 8H10L11 9V12L10 13H8L7 12Z M5.5 18V16.5L7 15H11L12.5 16.5V18Z",
});

export const Settings2 = createIcon("SystemConsole", {
  outline:
    "M5 2H2V22H5 M19 2H22V22H19 " +
    "M7 5V7 M7 11V19 M5 7H9V11H5Z " +
    "M12 5V14 M12 18V19 M10 14H14V18H10Z " +
    "M17 5V9 M17 13V19 M15 9H19V13H15Z",
  selected: "M5 7H9V11H5Z M10 14H14V18H10Z M15 9H19V13H15Z",
});

// Targeting emblem used in the header, reports, and protocol status panels.
export const Crosshair = createIcon("ProtocolTarget", {
  outline:
    "M7 3H5L3 5V7 M17 3H19L21 5V7 M21 17V19L19 21H17 M7 21H5L3 19V17 " +
    "M12 2V6 M12 18V22 M2 12H6 M18 12H22 M9 9H15V15H9Z",
  solid: "M11 11H13V13H11Z",
});

export const ArrowLeft = createIcon("BackCommand", {
  outline: "M10 5L3 12L10 19 M4 12H20 M20 8V16",
});
export const ArrowUpRight = createIcon("OpenCommand", {
  outline: "M8 4H20V16 M19 5L5 19 M4 13V20H11",
});
export const ChevronDown = createIcon("ExpandCommand", {
  outline: "M5 9L12 16L19 9 M9 5H15",
});
export const ChevronRight = createIcon("NextCommand", {
  outline: "M8 5L15 12L8 19 M19 9V15",
});
export const Check = createIcon("ConfirmCommand", {
  outline: "M4 12L9 17L20 6",
});
export const X = createIcon("CloseCommand", {
  outline: "M5 5L19 19 M19 5L5 19",
});
export const Plus = createIcon("AddCommand", {
  outline: "M12 5V19 M5 12H19 M3 7V3H7 M17 21H21V17",
});
export const RefreshCw = createIcon("RerouteCommand", {
  outline:
    "M4 9V6L7 3H16L20 7 M20 3V8H15 " +
    "M20 15V18L17 21H8L4 17 M4 21V16H9",
});
export const Radio = createIcon("SignalNode", {
  outline:
    "M5 3L2 6V18L5 21 M19 3L22 6V18L19 21 " +
    "M8 7L6 9V15L8 17 M16 7L18 9V15L16 17",
  solid: "M10 10H14V14H10Z",
  compact: {
    outline: "M6 4L3 7V17L6 20 M18 4L21 7V17L18 20",
    solid: "M9 9H15V15H9Z",
  },
});
export const Zap = createIcon("CringeCharge", {
  outline: "M13 2L4 13H11L9 22L20 9H13Z",
});
export const FileText = createIcon("ProtocolReport", {
  outline:
    "M4 3H15L20 8V21H4Z M14 3V9H20 M8 13H16 M8 17H13",
  solid: "M7 6H10V9H7Z",
});
export const LockKeyhole = createIcon("LocalVault", {
  outline:
    "M7 10V5L9 3H15L17 5V10 M5 10H19L21 12V21H3V12Z M12 15V18",
  solid: "M10.5 13H13.5V16H10.5Z",
});
export const Shield = createIcon("AdminClearance", {
  outline:
    "M12 2L21 6V14L17 19L12 22L7 19L3 14V6Z M8 11L11 14L16 9",
  solid: "M10 4H14V6H10Z",
});
export const SlidersHorizontal = createIcon("TuneCommand", {
  outline:
    "M3 6H7 M11 6H21 M7 4H11V8H7Z " +
    "M3 12H14 M18 12H21 M14 10H18V14H14Z " +
    "M3 18H6 M10 18H21 M6 16H10V20H6Z",
});
export const TriangleAlert = createIcon("AnomalyAlert", {
  outline: "M10 3H14L22 18V21H2V18Z M12 8V13",
  solid: "M11 16H13V18H11Z",
});
