type WebOSAsset = string;

export type AppInfo = {
    id: string;
    title: string;
    type: "web" | "qml" | "native";
    /** output.filename will be used as default */
    main: string;
    vendor?: string;
    version?: string;
    resolution?: string;
    iconColor?: string;
    disableBackHistoryAPI?: boolean;
} & AppInfoAssets;

export type AppInfoAssets = {
    icon: WebOSAsset;
} & OptionalAppInfoAssets;

export type OptionalAppInfoAssets = {
    largeIcon?: WebOSAsset;
    splashBackground?: WebOSAsset;
};
export type Options = {
    outputFile: string;
    appInfo: AppInfo;
    preserveSrc: boolean;
};
