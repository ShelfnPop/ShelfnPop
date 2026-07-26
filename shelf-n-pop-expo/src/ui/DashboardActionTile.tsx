import React from "react";
import { Image, Pressable, StyleProp, TextStyle, View, ViewStyle, type ImageSourcePropType } from "react-native";

import { Text } from "./Primitives";

type DashboardActionTileProps = {
  icon: ImageSourcePropType;
  label: string;
  description: string;
  onPress: () => void;
  styles: Record<string, any>;
  tileStyle: StyleProp<ViewStyle>;
  labelStyle: StyleProp<TextStyle>;
  descriptionStyle?: StyleProp<TextStyle>;
  iconSize?: number;
};

export function DashboardActionTile({
  icon,
  label,
  description,
  onPress,
  styles,
  tileStyle,
  labelStyle,
  descriptionStyle,
  iconSize = 40,
}: DashboardActionTileProps) {
  return (
    <Pressable onPress={onPress} style={tileStyle}>
      <View style={styles.dashboardIconLabelRow}>
        <Image
          source={icon}
          style={[
            styles.dashboardActionIcon,
            { width: iconSize, height: iconSize, borderRadius: Math.max(8, iconSize * 0.22) },
          ]}
        />
        <Text style={[styles.dashboardIconLabelText, labelStyle]} adjustsFontSizeToFit numberOfLines={2}>
          {label}
        </Text>
      </View>
      <Text style={[styles.dashboardActionSub, descriptionStyle]}>{description}</Text>
    </Pressable>
  );
}
