const { Packager: WebOSPackager } =
    require("@webosose/ares-cli/APIs") as typeof import("@webosose/ares-cli/APIs");

import type { PackageResult } from "@webosose/ares-cli/APIs";

export class Packager {
    pack(src: string, target: string): Promise<PackageResult | undefined> {
        return new Promise((res, rej) => {
            WebOSPackager.generatePackage(
                [src],
                target,
                { minify: false },
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
