const { Packager: WebOSPackager } =
    require("@webosose/ares-cli/APIs") as typeof import("@webosose/ares-cli/APIs");

import type { PackageResult } from "@webosose/ares-cli/APIs";

export class Packager {
    pack(
        src: string,
        target: string,
        onDone: (
            args: [err: Error | null, packageResult?: PackageResult]
        ) => void
    ): void {
        WebOSPackager.generatePackage(
            [src],
            target,
            { minify: false },
            (...args: any[]) => {
                console.log("1");
                console.log(...args);
            },
            (args) => {
                console.log("2", args);
                onDone(args);
            }
        );
    }
}
