export const schema = {
    type: "object",
    properties: {
        outputFile: { type: "string" },
        preserveSrc: { type: "boolean" },
        appInfo: {
            type: "object",
            properties: {
                id: { type: "string" },
                title: { type: "string" },
                main: { type: "string" },
                icon: { type: "string" },
                largeIcon: { type: "string" },
                type: {
                    oneOf: [
                        { const: "web" },
                        { const: "qml" },
                        { const: "native" },
                    ],
                },
                vendor: { type: "string" },
                version: { type: "string" },
                appDescription: { type: "string" },
                resolution: { type: "string" },
                bgColor: { type: "string" },
                iconColor: { type: "string" },
                bgImage: { type: "string" },
                closeOnRotation: { type: "boolean" },
                disableBackHistoryAPI: { type: "boolean" },
                enablePigScreenSaver: { type: "boolean" },
                handlesRelaunch: { type: "boolean" },
                splashBackground: { type: "string" },
                splashColor: { type: "string" },
                splashFitModeOnPortrait: {
                    oneOf: [{ const: "width" }, { const: "none" }],
                },
                requiredMemory: { type: "number" },
                supportPortraitMode: { type: "boolean" },
                supportTouchMode: {
                    oneOf: [
                        { const: "none" },
                        { const: "full" },
                        { const: "virtual" },
                    ],
                },
                transparent: { type: "boolean" },
                virtualTouch: {
                    type: "object",
                    properties: {
                        verticalThreshold: { type: "number" },
                        horizontalThreshold: { type: "number" },
                        positionEventOnPress: { type: "boolean" },
                        shortTouchThreshold: { type: "number" },
                    },
                },
                accessibility: {
                    type: "object",
                    properties: {
                        supportsAudioGuidance: { type: "boolean" },
                    },
                },
                screenSaverProperties: {
                    type: "object",
                    properties: {
                        preferredType: { type: "number" },
                    },
                },
                useGalleryMode: { type: "boolean" },
            },
            required: ["id", "title", "icon", "type", "main"],
            additionalProperties: false,
        },
    },
    required: ["appInfo"],
    additionalProperties: false,
} as const;
