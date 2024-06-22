import { validate } from "schema-utils";
import { Compiler } from "webpack";
import { Options } from "./types";
import { Packager } from "./packager";
import fs from "node:fs";
import { assert } from "./helpers";
import { PackageResult } from "@webosose/ares-cli/APIs";

type Webpack = Compiler["webpack"];
type InputFileSystem = Compiler["inputFileSystem"];
type Compilation = InstanceType<Webpack["Compilation"]>;
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
    private _compiler: Compiler | null = null;
    private _compilation: Compilation | null = null;

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

        compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
            this.compiler = compiler;
            this.compilation = compilation;

            compilation.hooks.processAssets.tapAsync(
                {
                    name: pluginName,
                    stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
                },
                (assets, done) => {
                    this.generateAppInfoSync();

                    this.copyIcon("");

                    this.packApp(
                        {
                            src: this.compilation.options.output.path,
                            target: this.compilation.options.output.path,
                        },
                        ([err, result]) => {
                            if (err) {
                                console.log(err, "ERR IN ON DONE");
                                this.reportWebpackError(err.message);
                                return done();
                            }

                            this.logger.info(
                                "webOS application packed successfully!"
                            );

                            done();
                        }
                    );
                }
            );
        });
    }

    private generateAppInfoSync() {
        this.logger.info("Generating appinfo.json for your app");

        this.compilation.emitAsset(
            this.options.outputFile,
            new this.compiler.webpack.sources.RawSource(
                Buffer.from(JSON.stringify(this.options.appInfo, null, "\t"))
            )
        );
    }

    private packApp(
        { src, target }: { src?: string; target?: string },
        onDone: (args: [err: Error | null, result?: PackageResult]) => void
    ) {
        this.logger.info("Packing your webOS application");

        if (!src) {
            return onDone([
                new Error("There is no source directory for packing!"),
            ]);
        }

        if (!target) {
            return onDone([
                new Error("There is no target directory for packing!"),
            ]);
        }

        const packager = new Packager();
        packager.pack(src, target, onDone);
    }

    private copyIcon(source: string) {
        this.copyAndPasteToDist(this.options.appInfo.icon);
    }

    private copyAndPasteToDist(pathToFile: string) {
        const fileBuffer =
            this.compilation.inputFileSystem.readFileSync?.(pathToFile);

        assert(fileBuffer, () =>
            this.reportWebpackError(`Failed to read from ${pathToFile}`)
        );

        assert(this.compilation.options.output.path, () =>
            this.reportWebpackError("Please, specify dist folder for your app")
        );

        this.compilation.emitAsset(
            this.compilation.options.output.path,
            new this.compiler.webpack.sources.RawSource(fileBuffer)
        );
    }

    private get logger(): WebpackLogger {
        return this.compiler.getInfrastructureLogger(WebOSWebpackPlugin.name);
    }

    private get compiler(): Compiler {
        assert(this._compiler, () =>
            this.reportWebpackError("There is no compiler initialized")
        );
        return this._compiler;
    }

    private get compilation(): Compilation {
        assert(this._compilation, () =>
            this.reportWebpackError("There is no compilation initialized")
        );
        return this._compilation;
    }

    private set compiler(value: Compiler) {
        this._compiler = value;
    }

    private set compilation(value: Compilation) {
        this._compilation = value;
    }

    private reportWebpackError(msg: string) {
        const messageToLog = `WebOSWebpackPlugin Error: ${msg}`;
        console.trace();
        this.logger.error(messageToLog);
        this.compilation.errors.push(
            new this.compiler.webpack.WebpackError(messageToLog)
        );
    }
}

module.exports = { WebOSWebpackPlugin };
