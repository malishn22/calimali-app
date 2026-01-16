import React from "react";
import { Text, View } from "react-native";

import { ExternalLink } from "./ExternalLink";
import { MonoText } from "./StyledText";

export default function EditScreenInfo({ path }: { path: string }) {
  return (
    <View>
      <View className="items-center mx-12">
        <Text className="text-lg text-center leading-6 text-white/80">
          Open up the code for this screen:
        </Text>

        <View className="my-2 rounded py-1 px-1 bg-white/5">
          <MonoText className="text-white">{path}</MonoText>
        </View>

        <Text className="text-lg text-center leading-6 text-white/80">
          Change any of the text, save the file, and your app will automatically
          update.
        </Text>
      </View>

      <View className="mt-4 mx-5 items-center">
        <ExternalLink
          className="py-4"
          href="https://docs.expo.io/get-started/create-a-new-app/#opening-the-app-on-your-phonetablet"
        >
          <Text className="text-center text-blue-500">
            Tap here if your app doesn't automatically update after making
            changes
          </Text>
        </ExternalLink>
      </View>
    </View>
  );
}
