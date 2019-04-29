// (C) 2007-2019 GoodData Corporation
import get = require("lodash/get");

const ONE_THOUSAND = 1000; // 50
const DEFAULT_RIGHT_PADDING = 2;
const DEFAULT_FRACTION_DIGITS = 16;
// [1000, 1000.000, 1000.000.000, ...]
const NUMBERS: number[] = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30].map((unit: number) => Math.pow(10, unit));

export interface IFloat {
    integer: string;
    decimal: string;
}

export function normalizeValue(axisLabel: any): number {
    const tickValue: number = axisLabel.value;

    const tickPositions: number[] = get(axisLabel, "axis.tickPositions", []);
    if (tickPositions.length < 2) {
        return tickValue;
    }

    const tickInterval = getTickInterval(tickPositions);

    if (Math.abs(tickInterval) >= ONE_THOUSAND) {
        return handleThousandRange(tickValue, tickInterval);
    }

    return handleShallowRange(tickValue, tickInterval, tickPositions);
}

function handleThousandRange(tickValue: number, tickInterval: number): number {
    const zeroUnit = (Math.abs(tickValue) < ONE_THOUSAND) ? 1 : getNumberUnit(tickInterval);
    // number is rounded base on its interval unit
    return Math.round(tickValue / zeroUnit) * zeroUnit;
}

function handleShallowRange(tickValue: number, tickInterval: number, tickPositions: number[]): number {
    const tickStr = convertNumberToString(tickValue);
    if (tickStr.indexOf(".") < 1) {
        return tickValue;
    }

    const floatObjects: IFloat[] = tickPositions.map(getFloatObject);
    const decimals: string[] = floatObjects
        .map((obj: IFloat) => obj.decimal)
        .filter((decimal: string) => decimal);
    const possibleDecimalLength = getLength(decimals) + DEFAULT_RIGHT_PADDING;

    const normalizedTickStr = tickStr.substring(0, (tickStr.indexOf(".") + possibleDecimalLength));


    return parseFloat(normalizedTickStr);
    // return roundDecimal(parseFloat(normalizedTickStr));
}

// TODO: find way to round decimal
// function roundDecimal(num: number): number {
//     const { decimal } = getFloatObject(num);
//
//     const unitLength = decimal.length - 1; // only round last digit
//     if (unitLength < 3) {
//         return num;
//     }
//
//     const unit = parseInt(`1${Array(unitLength).fill("0").join("")}`, 10);
//
//     // tslint:disable-next-line
//     console.log('from: ', num, 'to: ', Math.round(num * unit) / unit);
//     return Math.round(num * unit) / unit;
// }

function getTickInterval(tickPositions: number[]) {
    return tickPositions[1] - tickPositions[0];
}

// 1.234 -> 1000, 12.345 -> 1000, 123.456 -> 1000, 1.234.567 -> 1000000, ...
function getNumberUnit(num: number): number {
    const value = Math.abs(num);
    for (let i = 0; i < NUMBERS.length; i++) {
        if (value / NUMBERS[i] < 1) {
            return NUMBERS[i - 1];
        }
    }
    return NUMBERS[0]; // this fallback case might never happen
}

/**
 * Number: 1234567
 * Exponential number: 1.234567e+6 or 1.234567E+6
 * @param num
 */
function isExponentialNumber(num: number): boolean {
    return num.toString().split(/[eE]/).length > 1;
}

/**
 * Convert number to string
 * 0.1      -> '0.1'
 * 1e-5     -> '0.00001' (not '1e-5')
 * 1e+5     -> '100000'  (not '1e+5')
 * @param num
 */
function convertNumberToString(num: number): string {
    return isExponentialNumber(num) ? num.toFixed(DEFAULT_FRACTION_DIGITS) : num.toString();
}

function getFloatObject(float: number): IFloat {
    const [ integer, decimal ] = convertNumberToString(float).split(".");
    return {
        integer,
        decimal,
    };
}

function isAllNumbersAreSame(column: string[]): boolean {
    for (let rowIndex = 0; rowIndex < column.length - 1; rowIndex++) {
        if (column[rowIndex] !== column[rowIndex + 1]) {
            return false;
        }
    }
    return true;
}

function getLength(decimals: string[]): number {
    let length = 1;
    for (let columnIndex = 0; columnIndex < DEFAULT_FRACTION_DIGITS; columnIndex++) {
        const column: string[] = decimals.map((decimal: string) => decimal[columnIndex]);
        if (isAllNumbersAreSame(column)) {
            length += 1;
        }
    }
    return length;
}

/*
var unit = 1000 * 10;
[100.00116, 100.00133, 100.00150, 100.00166, 100.00183].map(num => {
  var round = Math.round(num * unit) / unit;
  console.log(round);
});
console.log('-------------');
var unit1 = 1000;
[-0.3000, 0.0499, 0.3999, 0.7499, 1.0999, 1.4499, 1.7999].map(num => {
  var round = Math.round(num * unit1) / unit1;
  console.log(round);
});

> 100.0012
> 100.0013
> 100.0015
> 100.0017
> 100.0018
> "-------------"
> -0.3
>  0.05
>  0.4
>  0.75
>  1.1
>  1.45
>  1.8
*/

// TODO: handle this case
/*
    0: 0
    9: 0.0000000008177558
    1: 0.10221948267045454
    2: 0.20443896534090908
    3: 0.3066584480113636
    4: 0.40887793068181816
    5: 0.5110974133522727
    6: 0.6133168960227272
    7: 0.7155363786931818
    8: 0.8177558613636363
    9: 0.0000000008177558
   10: 0.0006360008177558
*/


/*
0.000000000001
0.000000000002
0.000000000003
0.0000000000035
0.000000000004
0.000000000005

* */
