export class Helpers {
    public getLuminance(hex: string): number {
        const rgb = hex.match(/\w\w/g)?.map((x) => {
            const val = parseInt(x, 16) / 255;
            return val <= 0.03928
                ? val / 12.92
                : Math.pow((val + 0.055) / 1.055, 2.4);
        }) || [0, 0, 0];
        return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
    }

    public calculateContrastRatio(l1: number, l2: number) {
        const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
        const pass = ratio > 4.5;
        return { ratio, pass };
    }

    public hexToRgba(hex: string, alpha: number) {
        const r = parseInt(hex.slice(1, 3), 16) || 0;
        const g = parseInt(hex.slice(3, 5), 16) || 0;
        const b = parseInt(hex.slice(5, 7), 16) || 0;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    public randomCohesiveHex(baseHue?: number): string {
        const h =
            baseHue !== undefined
                ? (baseHue + (Math.random() * 60 - 30) + 360) % 360
                : Math.floor(Math.random() * 360);

        const s = Math.floor(Math.random() * 40 + 40);

        const l = Math.floor(Math.random() * 20 + 50);

        return this.hslToHex(h, s, l);
    }

    public hslToHex(h: number, s: number, l: number): string {
        l /= 100;
        const a = (s * Math.min(l, 1 - l)) / 100;
        const f = (n: number) => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color)
                .toString(16)
                .padStart(2, "0");
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    }
}
