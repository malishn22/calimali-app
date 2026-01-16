import Constants from "expo-constants";
import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";

const DB_NAME = "calimali.db";

export const exportDatabase = async () => {
  if (Platform.OS === "web") {
    alert("Database export is not supported on web.");
    return;
  }

  try {
    const dbPath = `${FileSystem.documentDirectory}SQLite/${DB_NAME}`; // Standard Expo SQLite path

    // Verify file exists
    const fileInfo = await FileSystem.getInfoAsync(dbPath);
    if (!fileInfo.exists) {
      console.error("Database file not found at:", dbPath);
      alert("Database file not found.");
      return;
    }

    // Get host URI
    // For Expo Go, debuggerHost contains the IP of the machine running the packager
    const debuggerHost =
      Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;
    const hostIp = debuggerHost?.split(":")[0];

    if (!hostIp) {
      console.error("Could not determine host IP");
      alert(
        "Could not determine host IP. Make sure you are running in Expo Go."
      );
      return;
    }

    const serverUrl = `http://${hostIp}:3000/upload-db`;

    console.log(`Uploading database from ${dbPath} to ${serverUrl}`);

    const uploadResult = await FileSystem.uploadAsync(serverUrl, dbPath, {
      fieldName: "database",
      httpMethod: "POST",
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    });

    if (uploadResult.status === 200) {
      console.log("Database exported successfully");
      alert("Database exported successfully!");
    } else {
      console.error("Upload failed with status", uploadResult.status);
      alert(`Upload failed: ${uploadResult.body}`);
    }
  } catch (error) {
    console.error("Error exporting database:", error);
    alert(
      `Error exporting database: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};
