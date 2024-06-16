import { Packager as WebOSPackager } from "@webosose/ares-cli/APIs";

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
            (err, packingResult) => {
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
