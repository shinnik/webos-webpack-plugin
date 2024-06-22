const { Packager: WebOSPackager } =
    require("@webosose/ares-cli/APIs") as typeof import("@webosose/ares-cli/APIs");

import type { PackageResult } from "@webosose/ares-cli/APIs";

export class Packager {
    pack(
        src: string,
        target: string,
        onDone: (err: Error | null, packageResult?: PackageResult) => void
    ): void {
        WebOSPackager.generatePackage(
            [src],
            target,
            { minify: false },
            (...args: any[]) => {
                console.log("1");
                console.log(...args);
            },
            (err, result) => {
                const error = Array.isArray(err) ? err[0] : err;
                onDone(error, result);
            }
        );
    }
}
