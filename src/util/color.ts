import {ColorSpace, HSL, Lab_D65 as LabD65, LCH as LCHD50, parse, range, sRGB, to, toGamut} from 'colorjs.io/fn';

// https://github.com/LeaVerou/color.js/blob/dd129cd70827da1f1c77986f29ad2de0dedc61e5/src/spaces/lch.js
const LCHD65 = new ColorSpace({
    id: 'lch-d65',
    name: 'LCH D65',
    coords: {
        l: {refRange: [0, 100], name: 'Lightness'},
        c: {refRange: [0, 150], name: 'Chroma'},
        h: {refRange: [0, 360], type: 'angle', name: 'Hue'},
    },
    base: LabD65,
    fromBase([L, a, b]) {
        const ε = 0.02;
        const hue = (Math.abs(a) < ε && Math.abs(b) < ε) ? NaN : Math.atan2(b, a) * 180 / Math.PI;
        return [L, Math.sqrt(a ** 2 + b ** 2), ((hue % 360) + 360) % 360];
    },
    toBase([Lightness, Chroma, Hue]) {
        if (Chroma < 0) {
            Chroma = 0;
        }
        if (isNaN(Hue)) {
            Hue = 0;
        }
        return [
            Lightness, // L is still L
            Chroma * Math.cos(Hue * Math.PI / 180), // a
            Chroma * Math.sin(Hue * Math.PI / 180),  // b
        ];
    },
    formats: {},
});

ColorSpace.register(sRGB); // for parsing: keyword + hex + rgb(a)
ColorSpace.register(HSL); // for parsing: hsl(a)
ColorSpace.register(LCHD50); // for toGamut
ColorSpace.register(LCHD65); // for interpolation in LCH/HCL space
ColorSpace.register(LabD65); // for interpolation in LAB space

const interpolationColorSpace = {
    rgb: sRGB as any,
    hcl: LCHD65 as any, // lch/hcl d65
    lab: LabD65 as any, // lab d65
} as const;

export type InterpolationColorSpace = keyof typeof interpolationColorSpace;
type ColorInterpolationFn = (t: number) => Color;

export type RGBColor = [r: number, g: number, b: number, alpha: number];

/**
 * Color representation used by WebGL.
 * Defined in sRGB color space and pre-blended with alpha.
 * @private
 */
class Color {

    readonly r: number;
    readonly g: number;
    readonly b: number;
    readonly a: number;

    private interpolationCache: Partial<Record<InterpolationColorSpace, WeakMap<Color, ColorInterpolationFn>>>;

    /**
     * @param r Red component premultiplied by `alpha` 0..1
     * @param g Green component premultiplied by `alpha` 0..1
     * @param b Blue component premultiplied by `alpha` 0..1
     * @param [alpha=1] Alpha component 0..1
     * @param [premultiplied=true] Whether the `r`, `g` and `b` values have already
     * been multiplied by alpha. If `true` nothing happens if `false` then they will
     * be multiplied automatically.
     */
    constructor(r: number, g: number, b: number, alpha = 1, premultiplied = true) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = alpha;

        if (!premultiplied) {
            this.r *= alpha;
            this.g *= alpha;
            this.b *= alpha;

            if (!alpha) {
                // alpha = 0 erases completely rgb channels. This behavior is not desirable
                // if this particular color is later used in color interpolation.
                // Because of that, a reference to original color is saved.
                this.overwriteGetter('rgb', [r, g, b, alpha]);
            }
        }
    }

    static black: Color;
    static white: Color;
    static transparent: Color;
    static red: Color;

    /**
     * Parses CSS color strings and converts colors to sRGB color space if needed.
     * Officially supported color formats:
     * - keyword, e.g. 'aquamarine' or 'steelblue'
     * - hex (with 3, 4, 6 or 8 digits), e.g. '#f0f' or '#e9bebea9'
     * - rgb and rgba, e.g. 'rgb(0,240,120)' or 'rgba(0%,94%,47%,0.1)' or 'rgb(0 240 120 / .3)'
     * - hsl and hsla, e.g. 'hsl(0,0%,83%)' or 'hsla(0,0%,83%,.5)' or 'hsl(0 0% 83% / 20%)'
     *
     * @param input CSS color string to parse.
     * @returns A `Color` instance, or `undefined` if the input is not a valid color string.
     */
    static parse(input: Color | string | undefined | null): Color | undefined {
        // in zoom-and-property function input could be an instance of Color class
        if (input instanceof Color) {
            return input;
        }

        if (typeof input !== 'string') {
            return;
        }

        try {
            const parsedColor = to(parse(input.toLowerCase()), sRGB, {inGamut: true});
            const {coords: [r, g, b], alpha} = parsedColor;
            return new Color(Number(r), Number(g), Number(b), Number(alpha), false);
        } catch {
            return undefined;
        }
    }

    /**
     * Used in color interpolation and by 'to-rgba' expression.
     *
     * @returns Gien color, with reversed alpha blending, in sRGB color space.
     */
    get rgb(): RGBColor {
        const {r, g, b, a} = this;
        const f = a || Infinity; // reverse alpha blending factor
        return this.overwriteGetter('rgb', [r / f, g / f, b / f, a]);
    }

    private get sRGB(): any {
        const [r, g, b, a] = this.rgb;
        return this.overwriteGetter('sRGB', {space: sRGB, coords: [r, g, b], alpha: a});
    }

    getInterpolationFn(to: Color, colorSpaceKey: InterpolationColorSpace): ColorInterpolationFn {
        if (!this.interpolationCache?.[ colorSpaceKey ]) {
            this.interpolationCache = {...this.interpolationCache, [ colorSpaceKey ]: new WeakMap()};
        }
        const cacheForGivenColorSpace = this.interpolationCache[ colorSpaceKey ];
        let interpolationFn = cacheForGivenColorSpace.get(to);
        if (!interpolationFn) {
            const interpolationSpace = interpolationColorSpace[ colorSpaceKey ];
            const rangeFn = range(this.sRGB, to.sRGB, {space: interpolationSpace, outputSpace: sRGB});
            interpolationFn = (t: number): Color => {
                const {coords: [r, g, b], alpha} = toGamut(rangeFn(t) as any);
                return new Color(r * alpha, g * alpha, b * alpha, +alpha);
            };
            cacheForGivenColorSpace.set(to, interpolationFn);
        }
        return interpolationFn;
    }

    /**
     * Lazy getter pattern. When getter is called for the first time lazy value
     * is calculated and then overwrites getter function in given object instance.
     *
     * @example:
     * const redColor = Color.parse('red');
     * let x = redColor.hcl; // this will invoke `get hcl()`, which will calculate
     * // the value of red in HCL space and invoke this `overwriteGetter` function
     * // which in turn will set a field with a key 'hcl' in the `redColor` object.
     * // In other words it will override `get hcl()` from its `Color` prototype
     * // with its own property: hcl = [calculated red value in hcl].
     * let y = redColor.hcl; // next call will no longer invoke getter but simply
     * // return the previously calculated value
     * x === y; // true - `x` is exactly the same object as `y`
     *
     * @param getterKey Getter key
     * @param lazyValue Lazily calculated value to be memoized by current instance
     * @private
     */
    private overwriteGetter<T>(getterKey: string, lazyValue: T): T {
        Object.defineProperty(this, getterKey, {value: lazyValue});
        return lazyValue;
    }

    /**
     * Used by 'to-string' expression.
     *
     * @returns Serialized color in format `rgba(r,g,b,a)`
     * where r,g,b are numbers within 0..255 and alpha is number within 1..0
     *
     * @example
     * var purple = new Color.parse('purple');
     * purple.toString; // = "rgba(128,0,128,1)"
     * var translucentGreen = new Color.parse('rgba(26, 207, 26, .73)');
     * translucentGreen.toString(); // = "rgba(26,207,26,0.73)"
     */
    toString(): string {
        const [r, g, b, a] = this.rgb;
        return `rgba(${[r, g, b].map(n => Math.round(n * 255)).join(',')},${a})`;
    }

}

Color.black = new Color(0, 0, 0, 1);
Color.white = new Color(1, 1, 1, 1);
Color.transparent = new Color(0, 0, 0, 0);
Color.red = new Color(1, 0, 0, 1);

export default Color;
