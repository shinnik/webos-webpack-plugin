/// <reference path="../types.d.ts" />
import type { PackageResult } from "@webosose/ares-cli/APIs";
export declare class Packager {
    pack(src: string, target: string, onDone: (args: [err: Error | null, packageResult?: PackageResult]) => void): void;
}
