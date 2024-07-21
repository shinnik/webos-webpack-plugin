import { schema } from "./schema";
import { Infer } from "./utility-types";

export type AppInfo = Infer<typeof schema>["appInfo"];

type WebOSAsset = string;

export type AppInfoAssets = {
    icon: WebOSAsset;
} & OptionalAppInfoAssets;

export type OptionalAppInfoAssets = {
    largeIcon?: WebOSAsset;
    splashBackground?: WebOSAsset;
};
export type Options = {
    appInfo: AppInfo;
    outputFile?: string;
    preserveSrc?: boolean;
};
