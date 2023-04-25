import Color, {InterpolationColorSpace} from './color';
import Padding from './padding';

/**
 * Checks whether the specified color space is one of the supported interpolation color spaces.
 *
 * @param colorSpace Color space key to verify.
 * @returns `true` if the specified color space is one of the supported
 * interpolation color spaces, `false` otherwise
 */
export function isSupportedInterpolationColorSpace(colorSpace: string): colorSpace is InterpolationColorSpace {
    return colorSpace === 'rgb' || colorSpace === 'hcl' || colorSpace === 'lab';
}

/**
 * @param interpolationType Interpolation type
 * @returns interpolation fn
 * @deprecated use `interpolate[type]` instead
 */
export const interpolateFactory = (interpolationType: 'number'|'color'|'array'|'padding') => {
    switch (interpolationType) {
        case 'number': return number;
        case 'color': return color;
        case 'array': return array;
        case 'padding': return padding;
    }
};

function number(from: number, to: number, t: number): number {
    return from + t * (to - from);
}

function color(from: Color, to: Color, t: number, spaceKey: InterpolationColorSpace = 'rgb'): Color {
    return from.getInterpolationFn(to, spaceKey)(t);
}

function array<T extends number[]>(from: T, to: T, t: number): T {
    return from.map((d, i) => {
        return number(d, to[i], t);
    }) as T;
}

function padding(from: Padding, to: Padding, t: number): Padding {
    return new Padding(array(from.values, to.values, t));
}

const interpolate = {
    number,
    color,
    array,
    padding,
};

export default interpolate;
