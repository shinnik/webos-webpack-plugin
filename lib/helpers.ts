export function assert(value: unknown, onError: () => void): asserts value {
    if (value) return;
    onError();
}
