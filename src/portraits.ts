import type { ImageSourcePropType } from "react-native";

// Static requires let Metro bundle these offline on web, iOS and Android.
const portraits: Record<string, ImageSourcePropType> = {
  pasha: require("../assets/portraits/pasha.jpg"),
  alina: require("../assets/portraits/alina.jpg"),
  denis: require("../assets/portraits/denis.jpg"),
  marina: require("../assets/portraits/marina.jpg"),
};

export function getPortrait(id: string): ImageSourcePropType | undefined {
  return Object.prototype.hasOwnProperty.call(portraits, id)
    ? portraits[id]
    : undefined;
}
