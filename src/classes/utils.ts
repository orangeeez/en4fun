export class Utils  {
    static RemoveDots(value: string): string {
        return value.split('.').join("");
    }
    static GetFileName(fullPath: string, dirPath: string): string {
        return fullPath.split(dirPath)[1];
    }
}