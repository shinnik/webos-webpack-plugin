import { validate } from "schema-utils";
import { Compiler } from "webpack";
import { Options } from "./types";
import { Packager } from "./packager";
import fs from "node:fs";

type Webpack = Compiler["webpack"];
type CompilationInstance = InstanceType<Webpack["Compilation"]>;
type WebpackLogger = ReturnType<Compiler["getInfrastructureLogger"]>;

const schema: Record<string, unknown> = {
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
                type: {
                    oneOf: [
                        { const: "web" },
                        { const: "qml" },
                        { const: "native" },
                    ],
                },
                // largeIcon: "string",
                // vendor: "string",
                // version: "string",
                // resolution: "string",
                // iconColor: "string",
                // splashBackground: "string",
                // disableBackHistoryAPI: "boolean",
            },
            required: ["id", "title", "icon", "type", "main"],
            additionalProperties: false,
        },
    },
    required: ["appInfo"],
    additionalProperties: false,
};

// class A extends Abs

class WebOSWebpackPlugin {
    static name = "WebOSWebpackPlugin";

    static defaultOptions: Options = {
        outputFile: "appinfo.json",
        appInfo: {},
        preserveSrc: false,
    };

    // Any options should be passed in the constructor of your plugin,
    // (this is a public API of your plugin).
    constructor(private options: Options) {
        // Applying user-specified options over the default options
        // and making merged options further available to the plugin methods.
        // You should probably validate all the options here as well.
        this.options = {
            outputFile:
                options.outputFile ||
                WebOSWebpackPlugin.defaultOptions.outputFile,

            preserveSrc:
                typeof options.preserveSrc !== "undefined"
                    ? options.preserveSrc
                    : WebOSWebpackPlugin.defaultOptions.preserveSrc,

            appInfo: {
                ...WebOSWebpackPlugin.defaultOptions.appInfo,
                ...options.appInfo,
            },
        };

        validate(schema, this.options, {
            name: "WebOS Plugin",
        });
    }

    apply(compiler: Compiler) {
        const pluginName = WebOSWebpackPlugin.name;
        const { webpack } = compiler;
        const { Compilation } = webpack;

        // inputFileSystem?.readFileSync;

        compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
            compilation.hooks.processAssets.tap(
                {
                    name: pluginName,
                    stage: Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
                },
                (assets) => {
                    this.generateAppInfo(compilation, compiler, webpack);

                    this.packApp(
                        {
                            src: compilation.options.output.path,
                            target: compilation.options.output.path,
                        },
                        compiler
                    );

                    this.getLogger(compiler).info(
                        "webOS application packed successfully!"
                    );
                }
            );
        });
    }

    private generateAppInfo(
        compilation: CompilationInstance,
        compiler: Compiler,
        webpack: Webpack
    ) {
        this.getLogger(compiler).info("Generating appinfo.json for your app");

        const { RawSource } = webpack.sources;

        compilation.emitAsset(
            this.options.outputFile,
            new RawSource(
                Buffer.from(JSON.stringify(this.options.appInfo, null, "\t"))
            )
        );
    }

    private packApp(
        { src, target }: { src?: string; target?: string },
        compiler: Compiler
    ) {
        this.getLogger(compiler).info("Packing your webOS application");

        if (!src) {
            throw new Error("There is no source directory for packing!");
        }

        if (!target) {
            throw new Error("There is no target directory for packing!");
        }

        const packager = new Packager();
        packager.pack(src, target);
    }

    private getLogger(compiler: Compiler): WebpackLogger {
        return compiler.getInfrastructureLogger(WebOSWebpackPlugin.name);
    }
}

module.exports = { WebOSWebpackPlugin };
