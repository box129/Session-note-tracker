export function updateArray<T>(array: T[], newItem: T): T[] {
    return [...array, newItem];
}