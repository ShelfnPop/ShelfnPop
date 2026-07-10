import React from "react";
import { Text as NativeText, TextInput as NativeTextInput } from "react-native";

export function Text(props: React.ComponentProps<typeof NativeText>) {
    return <NativeText allowFontScaling={false} maxFontSizeMultiplier={1} {...props} />;
}

export function TextInput(props: React.ComponentProps<typeof NativeTextInput>) {
    return <NativeTextInput allowFontScaling={false} maxFontSizeMultiplier={1} {...props} />;
}
