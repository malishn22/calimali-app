import * as Exercises from "./exercises";
import * as Profile from "./profile";
import * as Sessions from "./sessions";

export const Api = {
  ...Exercises,
  ...Sessions,
  ...Profile,
};

export * from "./exercises";
export * from "./profile";
export * from "./sessions";
export * from "./types";
