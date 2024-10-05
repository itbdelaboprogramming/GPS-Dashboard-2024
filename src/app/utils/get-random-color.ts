export function getRandomColorHex(num: any): string {
    function hash(str: string): number {
        let hash = 5381;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) + hash) + str.charCodeAt(i);
        }
        return hash >>> 0; // Return a 32-bit unsigned integer
    }

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    // Generate a hash value from the input number
    let hashValue = hash(num.toString());

    // Convert hash value to a consistent string
    let result = '';
    for (let i = 0; i < 10; i++) {  
        result += chars[hashValue % chars.length];
        hashValue = Math.floor(hashValue / chars.length); // Reduce the hash value
    }

    // Convert result string to a numeric hash
    const numericHash = hash(result);

    // Extract RGB components from the numeric hash
    const r = (numericHash >> 0) & 0xFF;     // Red component
    const g = (numericHash >> 8) & 0xFF;     // Green component
    const b = (numericHash >> 16) & 0xFF;    // Blue component

    // Mix the color with white to get a pastel color
    const mixWithWhite = (colorComponent: number) => Math.floor((colorComponent + 255) / 2);
    
    const pastelR = mixWithWhite(r);
    const pastelG = mixWithWhite(g);
    const pastelB = mixWithWhite(b);

    // Convert RGB components to hex format
    const toHex = (colorComponent: number) => colorComponent.toString(16).padStart(2, '0');
    
    return `#${toHex(pastelR)}${toHex(pastelG)}${toHex(pastelB)}`;
}
