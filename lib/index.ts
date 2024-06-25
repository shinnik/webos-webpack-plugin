import { validate } from "schema-utils";
import { Compiler } from "webpack";
import {
    AppInfo,
    AppInfoAssets,
    OptionalAppInfoAssets,
    Options,
} from "./types";
import { Packager } from "./packager";
import { assert } from "./helpers";

import path = require("node:path");
import fs = require("node:fs");

type Webpack = Compiler["webpack"];
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
                largeIcon: { type: "string" },
                vendor: { type: "string" },
                version: { type: "string" },
                resolution: { type: "string" },
                iconColor: { type: "string" },
                splashBackground: { type: "string" },
                disableBackHistoryAPI: { type: "boolean" },
            },
            required: ["id", "title", "icon", "type", "main"],
            additionalProperties: false,
        },
    },
    required: ["appInfo"],
    additionalProperties: false,
};

class WebOSWebpackPlugin {
    private _compiler: Compiler | null = null;
    private _compilation: Compilation | null = null;
    private _assets: AppInfoAssets | null = null;
    private _optionalAssets: OptionalAppInfoAssets | null = null;

    static name = "WebOSWebpackPlugin";

    static defaultOptions: Omit<Options, "appInfo"> = {
        outputFile: "appinfo.json",
        preserveSrc: false,
    };

    constructor(private options: Options) {
        this.options = {
            outputFile:
                options.outputFile ||
                WebOSWebpackPlugin.defaultOptions.outputFile,

            preserveSrc:
                options.preserveSrc ||
                WebOSWebpackPlugin.defaultOptions.preserveSrc,

            appInfo: options.appInfo,
        };

        this.assets = {
            icon: options.appInfo.icon,
        };

        this.optionalAssets = {
            splashBackground: options.appInfo.splashBackground,
            largeIcon: options.appInfo.largeIcon,
        };

        validate(schema, this.options, {
            name: "WebOS Plugin",
        });
    }

    apply(compiler: Compiler) {
        const pluginName = WebOSWebpackPlugin.name;
        const { webpack } = compiler;
        const { Compilation } = webpack;

        this.compiler = compiler;
        this.compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
            this.compilation = compilation;
            this.compilation.hooks.processAssets.tapAsync(
                {
                    name: pluginName,
                    stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
                },
                (assets, done) => {
                    this.generateAppInfoSync();
                    this.copyAssets();

                    done();
                }
            );
        });

        this.compiler.hooks.afterEmit.tapAsync(pluginName, async (_, done) => {
            await this.packApp();

            if (!this.options.preserveSrc) {
                this.removeAssetsFromDist();
            }

            done();
        });
    }

    private removeAssetsFromDist() {
        this.compilation.getAssets().forEach((asset) => {
            const fullPathToAsset = this.dist + "/" + asset.name;
            fs.unlink(fullPathToAsset, (err) => {
                if (!err) {
                    return;
                }

                this.reportWebpackError(err.message);
            });
        });
    }

    private generateAppInfoSync() {
        this.logger.info("Generating appinfo.json");

        this.compilation.emitAsset(
            this.options.outputFile,
            new this.compiler.webpack.sources.RawSource(
                Buffer.from(
                    JSON.stringify(this.prepareAppInfoToEmit(), null, "\t")
                )
            )
        );
    }

    private prepareAppInfoToEmit(): AppInfo {
        return {
            ...this.options.appInfo,
            ...this.getAppInfoForAssets(),
        };
    }

    private getAppInfoForAssets(): AppInfoAssets {
        const filenamesForRequiredAssets: AppInfoAssets = {
            icon: this.getFilenameFromPath(this.options.appInfo.icon),
        };

        return {
            ...filenamesForRequiredAssets,
            ...this.filenamesForOptionalAssets(),
        };
    }

    private filenamesForOptionalAssets(): OptionalAppInfoAssets {
        const keys = Object.keys(
            this.optionalAssets
        ) as (keyof OptionalAppInfoAssets)[];

        return keys.reduce<OptionalAppInfoAssets>((acc, nextKey) => {
            const value = this.options.appInfo[nextKey];
            if (!value) {
                return acc;
            }

            acc[nextKey] = this.getFilenameFromPath(value);
            return acc;
        }, {});
    }

    private getFilenameFromPath(pathToFile: string) {
        return path.basename(pathToFile);
    }

    private async packApp() {
        this.logger.info("Packing webOS application");

        try {
            const packager = new Packager();
            await packager.pack(this.dist, this.dist);
            this.logger.info("webOS application packed successfully!");
        } catch (error) {
            this.reportWebpackError((error as Error).message);
        }
    }

    private copyAssets() {
        this.copyRequiredAssets();
        this.copyOptionalAssets();
    }

    private copyRequiredAssets() {
        this.copyAndPasteToDist(this.assets.icon);
    }

    private copyOptionalAssets() {
        this.optionalAssetsKeys().forEach((key) => {
            const asset = this.optionalAssets[key];
            if (asset) {
                this.copyAndPasteToDist(asset);
            }
        });
    }

    private copyAndPasteToDist(pathToFile: string) {
        try {
            const file = this.copy(pathToFile);

            this.compilation.emitAsset(
                this.getFilenameFromPath(pathToFile),
                new this.compiler.webpack.sources.RawSource(file)
            );
        } catch (err) {
            this.reportWebpackError((err as Error).message);
        }
    }

    private copy(pathToFile: string): Buffer {
        const fileBuffer = fs.readFileSync(pathToFile);
        if (!fileBuffer) {
            throw new Error(`Failed to read from ${path}`);
        }

        return fileBuffer;
    }

    private optionalAssetsKeys() {
        return Object.keys(
            this.optionalAssets
        ) as (keyof OptionalAppInfoAssets)[];
    }

    private get optionalAssets(): OptionalAppInfoAssets {
        assert(
            this._optionalAssets,
            () =>
                new Error(
                    "Investigate: optional assets can be empty, but must not be nullish"
                )
        );
        return this._optionalAssets;
    }

    private set optionalAssets(value: OptionalAppInfoAssets) {
        this._optionalAssets = value;
    }

    private get assets(): AppInfoAssets {
        assert(
            this._assets,
            () =>
                new Error(
                    "Investigate: there is no assets somehow, but they are required"
                )
        );
        return this._assets;
    }

    private set assets(value: AppInfoAssets) {
        this._assets = value;
    }

    private get dist(): string {
        const distPath = this.compilation.options.output.path;
        assert(distPath, () => new Error("Investigate: no dist"));

        return distPath;
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
        const messageToLog = `WebOSWebpackPlugin: ${msg}`;
        this.logger.error(messageToLog);
        this.compilation.errors.push(
            new this.compiler.webpack.WebpackError(messageToLog)
        );
    }
}

module.exports = { WebOSWebpackPlugin };
