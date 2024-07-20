declare module "@webosose/ares-cli/APIs" {
    export type PackageResult = { ipk: string; msg: string };

    export type PackageOptions = { minify?: boolean };

    export class Packager {
        static generatePackage(
            inDirs: string[],
            destination: string,
            options: { minify: boolean; pkgversion?: string },
            middleCb: (infoStr: string) => void,
            next: (
                err: [Error] | null,
                result?: PackageResult | undefined
            ) => void
        ): void;
    }
}
