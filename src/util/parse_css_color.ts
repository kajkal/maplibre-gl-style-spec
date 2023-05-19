import {hslToRgb, RGBColor} from './color_spaces';

export function parseCssColor(colorToParse: string): RGBColor | undefined {
    colorToParse = colorToParse.trim().toLowerCase();

    if (colorToParse === 'transparent') {
        return [0, 0, 0, 0];
    }

    const matchingNamedColor = namedColors.get(colorToParse);
    if (matchingNamedColor) {
        return [...matchingNamedColor, 1];
    }

    let match;

    const hex3Regexp = /^#[0-9a-f]{3,4}$/; // hex4 optional
    match = colorToParse.match(hex3Regexp);
    if (match) {
        const [r, g, b, a = 'f'] = colorToParse.slice(1);
        return [r, g, b, a].map(parseHex) as RGBColor;
    }

    const hex6Regexp = /^#[0-9a-f]{6}(?:[0-9a-f]{2})?$/; // hex8 optional
    match = colorToParse.match(hex6Regexp);
    if (match) {
        const r = colorToParse.slice(1, 3);
        const g = colorToParse.slice(3, 5);
        const b = colorToParse.slice(5, 7);
        const a = colorToParse.slice(7, 9) || 'ff';
        return [r, g, b, a].map(parseHex) as RGBColor;
    }

    const rgbRegexp = /^rgba?\((-?(?:\d+\.)?\d+)[\s,]+(-?(?:\d+\.)?\d+)[\s,]+(-?(?:\d+\.)?\d+)(?:\s*[,/]\s*((?:\d*\.)?\d+%?))?\s*\)$/;
    match = colorToParse.match(rgbRegexp);
    if (match) {
        return [
            clamp(parseFloat(match[1]) / 255, 0, 1),
            clamp(parseFloat(match[2]) / 255, 0, 1),
            clamp(parseFloat(match[3]) / 255, 0, 1),
            clamp(parseAlpha(match[4]), 0, 1),
        ];
    }

    const rgbPercentageRegexp = /^rgba?\((-?(?:\d*\.)?\d+)%[\s,]+(-?(?:\d*\.)?\d+)%[\s,]+(-?(?:\d*\.)?\d+)%(?:\s*[,/]\s*((?:\d*\.)?\d+%?))?\s*\)$/;
    match = colorToParse.match(rgbPercentageRegexp);
    if (match) {
        return [
            clamp(parseFloat(match[1]) / 100, 0, 1),
            clamp(parseFloat(match[2]) / 100, 0, 1),
            clamp(parseFloat(match[3]) / 100, 0, 1),
            clamp(parseAlpha(match[4]), 0, 1),
        ];
    }

    // hue <angle> - only 'deg' are supported; 'grad', 'rad', 'turn' are not supported
    const hslRegexp = /^hsla?\((-?(?:\d*\.)?\d+)(?:deg)?[\s,]+(-?(?:\d*\.)?\d+)%[\s,]+(-?(?:\d*\.)?\d+)%(?:\s*[,/]\s*((?:\d*\.)?\d+%?))?\s*\)$/;
    match = colorToParse.match(hslRegexp);
    if (match) {
        return hslToRgb([
            parseFloat(match[1]),
            clamp(parseFloat(match[2]), 0, 100),
            clamp(parseFloat(match[3]), 0, 100),
            clamp(parseAlpha(match[4]), 0, 1),
        ]);
    }
}

function parseHex(hex: string): number {
    return parseInt(hex.padEnd(2, hex), 16) / 255;
}

function parseAlpha(alpha: string | undefined = '1'): number {
    const a = parseFloat(alpha);
    return alpha.endsWith('%') ? (a / 100) : a;
}

function clamp(n: number, min: number, max: number): number {
    return Math.min(Math.max(min, n), max);
}

const namedColors = new Map<string, [number, number, number]>([
    ['aliceblue', [16 / 17, 248 / 255, 1]],
    ['antiquewhite', [50 / 51, 47 / 51, 43 / 51]],
    ['aqua', [0, 1, 1]],
    ['aquamarine', [127 / 255, 1, 212 / 255]],
    ['azure', [16 / 17, 1, 1]],
    ['beige', [49 / 51, 49 / 51, 44 / 51]],
    ['bisque', [1, 76 / 85, 196 / 255]],
    ['black', [0, 0, 0]],
    ['blanchedalmond', [1, 47 / 51, 41 / 51]],
    ['blue', [0, 0, 1]],
    ['blueviolet', [46 / 85, 43 / 255, 226 / 255]],
    ['brown', [11 / 17, 14 / 85, 14 / 85]],
    ['burlywood', [74 / 85, 184 / 255, 9 / 17]],
    ['cadetblue', [19 / 51, 158 / 255, 32 / 51]],
    ['chartreuse', [127 / 255, 1, 0]],
    ['chocolate', [14 / 17, 7 / 17, 2 / 17]],
    ['coral', [1, 127 / 255, 16 / 51]],
    ['cornflowerblue', [20 / 51, 149 / 255, 79 / 85]],
    ['cornsilk', [1, 248 / 255, 44 / 51]],
    ['crimson', [44 / 51, 4 / 51, 4 / 17]],
    ['cyan', [0, 1, 1]],
    ['darkblue', [0, 0, 139 / 255]],
    ['darkcyan', [0, 139 / 255, 139 / 255]],
    ['darkgoldenrod', [184 / 255, 134 / 255, 11 / 255]],
    ['darkgray', [169 / 255, 169 / 255, 169 / 255]],
    ['darkgreen', [0, 20 / 51, 0]],
    ['darkgrey', [169 / 255, 169 / 255, 169 / 255]],
    ['darkkhaki', [63 / 85, 61 / 85, 107 / 255]],
    ['darkmagenta', [139 / 255, 0, 139 / 255]],
    ['darkolivegreen', [1 / 3, 107 / 255, 47 / 255]],
    ['darkorange', [1, 28 / 51, 0]],
    ['darkorchid', [0.6, 10 / 51, 0.8]],
    ['darkred', [139 / 255, 0, 0]],
    ['darksalmon', [233 / 255, 10 / 17, 122 / 255]],
    ['darkseagreen', [143 / 255, 188 / 255, 143 / 255]],
    ['darkslateblue', [24 / 85, 61 / 255, 139 / 255]],
    ['darkslategray', [47 / 255, 79 / 255, 79 / 255]],
    ['darkslategrey', [47 / 255, 79 / 255, 79 / 255]],
    ['darkturquoise', [0, 206 / 255, 209 / 255]],
    ['darkviolet', [148 / 255, 0, 211 / 255]],
    ['deeppink', [1, 4 / 51, 49 / 85]],
    ['deepskyblue', [0, 191 / 255, 1]],
    ['dimgray', [7 / 17, 7 / 17, 7 / 17]],
    ['dimgrey', [7 / 17, 7 / 17, 7 / 17]],
    ['dodgerblue', [2 / 17, 48 / 85, 1]],
    ['firebrick', [178 / 255, 2 / 15, 2 / 15]],
    ['floralwhite', [1, 50 / 51, 16 / 17]],
    ['forestgreen', [2 / 15, 139 / 255, 2 / 15]],
    ['fuchsia', [1, 0, 1]],
    ['gainsboro', [44 / 51, 44 / 51, 44 / 51]],
    ['ghostwhite', [248 / 255, 248 / 255, 1]],
    ['gold', [1, 43 / 51, 0]],
    ['goldenrod', [218 / 255, 11 / 17, 32 / 255]],
    ['gray', [128 / 255, 128 / 255, 128 / 255]],
    ['green', [0, 128 / 255, 0]],
    ['greenyellow', [173 / 255, 1, 47 / 255]],
    ['grey', [128 / 255, 128 / 255, 128 / 255]],
    ['honeydew', [16 / 17, 1, 16 / 17]],
    ['hotpink', [1, 7 / 17, 12 / 17]],
    ['indianred', [41 / 51, 92 / 255, 92 / 255]],
    ['indigo', [5 / 17, 0, 26 / 51]],
    ['ivory', [1, 1, 16 / 17]],
    ['khaki', [16 / 17, 46 / 51, 28 / 51]],
    ['lavender', [46 / 51, 46 / 51, 50 / 51]],
    ['lavenderblush', [1, 16 / 17, 49 / 51]],
    ['lawngreen', [124 / 255, 84 / 85, 0]],
    ['lemonchiffon', [1, 50 / 51, 41 / 51]],
    ['lightblue', [173 / 255, 72 / 85, 46 / 51]],
    ['lightcoral', [16 / 17, 128 / 255, 128 / 255]],
    ['lightcyan', [224 / 255, 1, 1]],
    ['lightgoldenrodyellow', [50 / 51, 50 / 51, 14 / 17]],
    ['lightgray', [211 / 255, 211 / 255, 211 / 255]],
    ['lightgreen', [48 / 85, 14 / 15, 48 / 85]],
    ['lightgrey', [211 / 255, 211 / 255, 211 / 255]],
    ['lightpink', [1, 182 / 255, 193 / 255]],
    ['lightsalmon', [1, 32 / 51, 122 / 255]],
    ['lightseagreen', [32 / 255, 178 / 255, 2 / 3]],
    ['lightskyblue', [9 / 17, 206 / 255, 50 / 51]],
    ['lightslategray', [7 / 15, 8 / 15, 0.6]],
    ['lightslategrey', [7 / 15, 8 / 15, 0.6]],
    ['lightsteelblue', [176 / 255, 196 / 255, 74 / 85]],
    ['lightyellow', [1, 1, 224 / 255]],
    ['lime', [0, 1, 0]],
    ['limegreen', [10 / 51, 41 / 51, 10 / 51]],
    ['linen', [50 / 51, 16 / 17, 46 / 51]],
    ['magenta', [1, 0, 1]],
    ['maroon', [128 / 255, 0, 0]],
    ['mediumaquamarine', [0.4, 41 / 51, 2 / 3]],
    ['mediumblue', [0, 0, 41 / 51]],
    ['mediumorchid', [62 / 85, 1 / 3, 211 / 255]],
    ['mediumpurple', [49 / 85, 112 / 255, 73 / 85]],
    ['mediumseagreen', [4 / 17, 179 / 255, 113 / 255]],
    ['mediumslateblue', [41 / 85, 104 / 255, 14 / 15]],
    ['mediumspringgreen', [0, 50 / 51, 154 / 255]],
    ['mediumturquoise', [24 / 85, 209 / 255, 0.8]],
    ['mediumvioletred', [199 / 255, 7 / 85, 133 / 255]],
    ['midnightblue', [5 / 51, 5 / 51, 112 / 255]],
    ['mintcream', [49 / 51, 1, 50 / 51]],
    ['mistyrose', [1, 76 / 85, 15 / 17]],
    ['moccasin', [1, 76 / 85, 181 / 255]],
    ['navajowhite', [1, 74 / 85, 173 / 255]],
    ['navy', [0, 0, 128 / 255]],
    ['oldlace', [253 / 255, 49 / 51, 46 / 51]],
    ['olive', [128 / 255, 128 / 255, 0]],
    ['olivedrab', [107 / 255, 142 / 255, 7 / 51]],
    ['orange', [1, 11 / 17, 0]],
    ['orangered', [1, 23 / 85, 0]],
    ['orchid', [218 / 255, 112 / 255, 214 / 255]],
    ['palegoldenrod', [14 / 15, 232 / 255, 2 / 3]],
    ['palegreen', [152 / 255, 251 / 255, 152 / 255]],
    ['paleturquoise', [35 / 51, 14 / 15, 14 / 15]],
    ['palevioletred', [73 / 85, 112 / 255, 49 / 85]],
    ['papayawhip', [1, 239 / 255, 71 / 85]],
    ['peachpuff', [1, 218 / 255, 37 / 51]],
    ['peru', [41 / 51, 133 / 255, 21 / 85]],
    ['pink', [1, 64 / 85, 203 / 255]],
    ['plum', [13 / 15, 32 / 51, 13 / 15]],
    ['powderblue', [176 / 255, 224 / 255, 46 / 51]],
    ['purple', [128 / 255, 0, 128 / 255]],
    ['rebeccapurple', [0.4, 0.2, 0.6]],
    ['red', [1, 0, 0]],
    ['rosybrown', [188 / 255, 143 / 255, 143 / 255]],
    ['royalblue', [13 / 51, 7 / 17, 15 / 17]],
    ['saddlebrown', [139 / 255, 23 / 85, 19 / 255]],
    ['salmon', [50 / 51, 128 / 255, 38 / 85]],
    ['sandybrown', [244 / 255, 164 / 255, 32 / 85]],
    ['seagreen', [46 / 255, 139 / 255, 29 / 85]],
    ['seashell', [1, 49 / 51, 14 / 15]],
    ['sienna', [32 / 51, 82 / 255, 3 / 17]],
    ['silver', [64 / 85, 64 / 85, 64 / 85]],
    ['skyblue', [9 / 17, 206 / 255, 47 / 51]],
    ['slateblue', [106 / 255, 6 / 17, 41 / 51]],
    ['slategray', [112 / 255, 128 / 255, 48 / 85]],
    ['slategrey', [112 / 255, 128 / 255, 48 / 85]],
    ['snow', [1, 50 / 51, 50 / 51]],
    ['springgreen', [0, 1, 127 / 255]],
    ['steelblue', [14 / 51, 26 / 51, 12 / 17]],
    ['tan', [14 / 17, 12 / 17, 28 / 51]],
    ['teal', [0, 128 / 255, 128 / 255]],
    ['thistle', [72 / 85, 191 / 255, 72 / 85]],
    ['tomato', [1, 33 / 85, 71 / 255]],
    ['turquoise', [64 / 255, 224 / 255, 208 / 255]],
    ['violet', [14 / 15, 26 / 51, 14 / 15]],
    ['wheat', [49 / 51, 74 / 85, 179 / 255]],
    ['white', [1, 1, 1]],
    ['whitesmoke', [49 / 51, 49 / 51, 49 / 51]],
    ['yellow', [1, 1, 0]],
    ['yellowgreen', [154 / 255, 41 / 51, 10 / 51]],
]);
