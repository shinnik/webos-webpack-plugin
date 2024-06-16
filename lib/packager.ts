const { Packager: WebOSPackager } =
    require("@webosose/ares-cli/APIs") as typeof import("@webosose/ares-cli/APIs");

import type { PackageResult } from "@webosose/ares-cli/APIs";

export class Packager {
    pack(src: string, target: string): PackageResult | null {
        let result: PackageResult | null = null;
        let error;

        WebOSPackager.generatePackage(
            [src],
            target,
            { minify: false },
            () => {},
            (err: any, packingResult: PackageResult | null) => {
                result = packingResult;
                error = err;
            }
        );

        if (error) {
            throw error;
        }

        return result;
    }
}
