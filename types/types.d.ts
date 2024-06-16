export type AppInfo = {
    id: string;
    title: string;
    main: string;
    icon: string;
    type: "web" | "qml" | "native";
};
export type Options = {
    outputFile: string;
    appInfo: AppInfo | Record<string, never>;
    preserveSrc: boolean;
};
