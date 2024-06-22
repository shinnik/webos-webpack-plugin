declare module "@webosose/ares-cli/APIs" {
    export type PackageResult = { ipk: string; msg: string };

    function next(err: Error): void;
    function next(err: null, result: PackageResult): void;
    export type NextFunc =
        | ((err: Error) => void)
        | ((err: null, result: PackageResult) => void);
    export class Packager {
        ipkFileName: string;

        static generatePackage(
            inDirs: string[],
            destination: string,
            options: { minify: boolean },
            middleCb: (infoStr: string) => void,
            next: NextFunc
        ): void;
    }
}
