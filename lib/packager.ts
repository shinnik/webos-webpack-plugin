const { Packager: WebOSPackager } =
    require("@webosose/ares-cli/APIs") as typeof import("@webosose/ares-cli/APIs");

import type { PackageResult, PackageOptions } from "@webosose/ares-cli/APIs";
import { Defaults } from "./types/utility-types";

export class Packager {
    static defaultOptions: Defaults<PackageOptions> = {
        minify: false,
    };

    pack(
        src: string,
        target: string,
        options?: PackageOptions
    ): Promise<PackageResult | undefined> {
        return new Promise((res, rej) => {
            WebOSPackager.generatePackage(
                [src],
                target,
                {
                    ...Packager.defaultOptions,
                    ...options,
                },
                () => {},
                (err, result) => {
                    const error = Array.isArray(err) ? err[0] : err;
                    if (error !== null) {
                        rej(error);
                    } else {
                        res(result);
                    }
                }
            );
        });
    }
}
