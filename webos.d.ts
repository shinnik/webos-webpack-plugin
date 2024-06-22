declare module "@webosose/ares-cli/APIs" {
    export type PackageResult = { ipk: string; msg: string };

    export class Packager {
        ipkFileName: string;

        static generatePackage(
            inDirs: string[],
            destination: string,
            options: { minify: boolean },
            middleCb: (infoStr: string) => void,
            next: (
                err: [Error] | null,
                result?: PackageResult | undefined
            ) => void
        ): void;
    }
}
