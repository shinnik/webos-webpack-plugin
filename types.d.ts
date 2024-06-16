declare module "@webosose/ares-cli/APIs" {
    export type PackageResult = { ipk: string; msg: string };
    export class Packager {
        ipkFileName: string;

        static generatePackage(
            inDirs: string[],
            destination: string,
            options: { minify: boolean },
            middleCb: (infoStr: string) => void,
            next: (error: Error | null, result: PackageResult) => void
        ): void;
    }
}
