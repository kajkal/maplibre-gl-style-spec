import {parseCssColor} from './parse_css_color';
import * as colorSpacesModule from './color_spaces';

describe('parseCssColor', () => {

    test('should parse color keyword', () => {
        expect(parseCssColor('white')).toEqual([1, 1, 1, 1]);
        expect(parseCssColor('black')).toEqual([0, 0, 0, 1]);
        expect(parseCssColor('RED')).toEqual([1, 0, 0, 1]);
        expect(parseCssColor('aquamarine')).toEqual([127 / 255, 1, 212 / 255, 1]);
        expect(parseCssColor('steelblue')).toEqual([14 / 51, 26 / 51, 12 / 17, 1]);
    });

    test('should parse "transparent" keyword as transparent black', () => {
        expect(parseCssColor('transparent')).toEqual([0, 0, 0, 0]);
    });

    test('should parse hex color notation', () => {
        expect(parseCssColor('#fff')).toEqual([1, 1, 1, 1]);
        expect(parseCssColor('#fff')).toEqual(parseCssColor('#ffffff'));
        expect(parseCssColor('#000')).toEqual([0, 0, 0, 1]);
        expect(parseCssColor('#000')).toEqual(parseCssColor('#000000'));
        expect(parseCssColor('#f00C')).toEqual([1, 0, 0, 0.8]);
        expect(parseCssColor('#f00C')).toEqual(parseCssColor('#ff0000cc'));
        expect(parseCssColor('#ff00ff')).toEqual([1, 0, 1, 1]);
        expect(parseCssColor('#4682B466')).toEqual([70 / 255, 130 / 255, 180 / 255, 0.4]);
    });

    test('should parse rgb function syntax', () => {
        expect(parseCssColor('rgb(0,0,51)')).toEqual([0, 0, 0.2, 1]);
        expect(parseCssColor('rgb(0,0,51)')).toEqual(parseCssColor('rgb(0,0,51.0)'));
        expect(parseCssColor('rgb(0,0,51)')).toEqual(parseCssColor('rgb(0%,0%,20%)'));
        expect(parseCssColor('rgb(0,0,51)')).toEqual(parseCssColor('rgb(0 0 51)'));
        expect(parseCssColor('rgb(0,0,51)')).toEqual(parseCssColor('rgb(0% 0% 20%)'));
        expect(parseCssColor('rgb(0,0,51)')).toEqual(parseCssColor('rgb(0 0 51.0 / 1)'));
        expect(parseCssColor('rgb(0,0,51)')).toEqual(parseCssColor('rgba(-1,0,51.0,100%)'));
        expect(parseCssColor('rgba(0,0,51,0.2)')).toEqual([0, 0, 0.2, 0.2]);
        expect(parseCssColor('rgba(0,0,51,0.2)')).toEqual(parseCssColor('rgb(0 0 51 / 0.2)'));
        expect(parseCssColor('rgba(0,0,51,0.2)')).toEqual(parseCssColor('rgb(0 0 51 / .2)'));
        expect(parseCssColor('rgba(0,0,51,0.2)')).toEqual(parseCssColor('rgb(0 0 51 / 20%)'));
        expect(parseCssColor('rgba(0,0,51,0.2)')).toEqual(parseCssColor('rgb(0% 0% 20% / 20%)'));
        expect(parseCssColor('rgba(0,0,51,0.2)')).toEqual(parseCssColor('rgba(0,0,51,0.2)'));
        expect(parseCssColor('rgba(0,0,51,0.2)')).toEqual(parseCssColor('rgba(0,0,51,20%)'));
        expect(parseCssColor('rgba(0,0,51,0.2)')).toEqual(parseCssColor('rgba(0%,0%,20%,20%)'));
        expect(parseCssColor('rgb(0% 0% 50%)')).toEqual([0, 0, 0.5, 1]);
        expect(parseCssColor('rgb(26,207,26,0.5)')).toEqual([26 / 255, 207 / 255, 26 / 255, 0.5]);
        expect(parseCssColor('rgba(26,207,26,.73)')).toEqual([26 / 255, 207 / 255, 26 / 255, 0.73]);
        expect(parseCssColor('rgba(0,0,128,.2)')).toEqual([0, 0, 128 / 255, 0.2]);
        expect(parseCssColor('rgba(0,0,127.5,.2)')).toEqual([0, 0, 0.5, 0.2]);
        expect(parseCssColor('rgb(100,200,300)')).toEqual(parseCssColor('rgb(100,200,255)'));
        expect(parseCssColor('rgb(100%,200%,300%)')).toEqual(parseCssColor('rgb(255,255,255)'));
    });

    test('should parse hsl function syntax', () => {
        jest.spyOn(colorSpacesModule, 'hslToRgb').mockImplementation((hslColor) => hslColor);

        parseCssColor('hsl(300,100%,25.1%)');
        expect(colorSpacesModule.hslToRgb).toHaveBeenLastCalledWith([300, 100, 25.1, 1]);
        expect(parseCssColor('hsl(300,100%,25.1%)')).toEqual(parseCssColor('hsla(300,100%,25.1%,1)'));
        expect(parseCssColor('hsl(300,100%,25.1%)')).toEqual(parseCssColor('hsla(300,100%,25.1%,100%)'));
        expect(parseCssColor('hsl(300,100%,25.1%)')).toEqual(parseCssColor('hsl(300 100% 25.1%)'));
        expect(parseCssColor('hsl(300,100%,25.1%)')).toEqual(parseCssColor('hsl(300 100% 25.1%/1.0)'));
        expect(parseCssColor('hsl(300,100%,25.1%)')).toEqual(parseCssColor('hsl(300.0 100% 25.1% / 100%)'));
        expect(parseCssColor('hsl(300,100%,25.1%)')).toEqual(parseCssColor('hsl(300deg 100% 25.1% / 100%)'));

        parseCssColor('hsl(300,100%,25.1%,0.2)');
        expect(colorSpacesModule.hslToRgb).toHaveBeenLastCalledWith([300, 100, 25.1, 0.2]);
        expect(parseCssColor('hsl(300,100%,25.1%,0.2)')).toEqual(parseCssColor('hsla(300,100%,25.1%,0.2)'));
        expect(parseCssColor('hsl(300,100%,25.1%,0.2)')).toEqual(parseCssColor('hsla(300,100%,25.1%,20%)'));
        expect(parseCssColor('hsl(300,100%,25.1%,0.2)')).toEqual(parseCssColor('hsl(300 100% 25.1% / 0.2)'));
        expect(parseCssColor('hsl(300,100%,25.1%,0.2)')).toEqual(parseCssColor('hsl(300 100% 25.1% / 20%)'));

        parseCssColor('hsl(300,100%,25.1%,0.9)');
        expect(colorSpacesModule.hslToRgb).toHaveBeenLastCalledWith([300, 100, 25.1, 0.9]);

        parseCssColor('hsl(300,100%,25.1%,.0)');
        expect(colorSpacesModule.hslToRgb).toHaveBeenLastCalledWith([300, 100, 25.1, 0]);
    });

    test('should return undefined when provided with invalid CSS color string', () => {
        expect(parseCssColor('not a color name')).toBeUndefined();

        expect(parseCssColor('fff')).toBeUndefined();
        expect(parseCssColor('#xyz')).toBeUndefined();
        expect(parseCssColor('#ff')).toBeUndefined();
        expect(parseCssColor('#fffff')).toBeUndefined();
        expect(parseCssColor('#4682B46')).toBeUndefined();
        expect(parseCssColor('#4682B4667')).toBeUndefined();

        expect(parseCssColor('rgb(0,50%,255)')).toBeUndefined();
        expect(parseCssColor('rgb(0 50% 255)')).toBeUndefined();
        expect(parseCssColor('rgba(0,50%,255,1)')).toBeUndefined();
        expect(parseCssColor('rgb(0 50% 255 / 1)')).toBeUndefined();
        expect(parseCssColor('rgb()')).toBeUndefined();
        expect(parseCssColor('rgb(0%)')).toBeUndefined();
        expect(parseCssColor('rgb(0% 0%)')).toBeUndefined();
        expect(parseCssColor('rgb(0%,0%,0%,0%,0%)')).toBeUndefined();

        expect(parseCssColor('hsl()')).toBeUndefined();
        expect(parseCssColor('hsl(0)')).toBeUndefined();
        expect(parseCssColor('hsl(0 0%)')).toBeUndefined();
        expect(parseCssColor('hsl(0,0%,0%,1,0%)')).toBeUndefined();
        expect(parseCssColor('hsl(0,0,0)')).toBeUndefined();
    });

});
