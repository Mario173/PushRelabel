export const inputValidation = (text) => {
    text = text.replace(/\s+/g, '');
    // check if the number and position of { and } brackets and number of commas is valid and are chars of the correct type
    let count = 0, allBrackets = 0, commas = 0;

    for(let char of text) {
        count += (char === '{');
        count -= (char === '}');
        commas += (char === ',');
        allBrackets += (char === '{' || char === '}');

        if( count < 0 || count > 3 || ( !['{', '}', ',', '.', '-'].includes(char) && !isNum(char) ) ) {
            return false;
        }
    }

    let n = (allBrackets - 2) / 2;

    if( count !== 0 || n ** 2 - 1 !== commas ) {
        return false;
    }

    // check if position of commas is correct
    let currPos = text.indexOf(',');
    while( currPos !== -1 ) {
        if( !isCommaAtTheCorrectPlace(text.charAt(currPos - 1), text.charAt(currPos + 1)) ) {
            return false;
        }
        currPos = text.indexOf(',', currPos + 1);
    }

    return text !== '';
};

const isCommaAtTheCorrectPlace = (charBefore, charAfter) => ( isNum(charBefore) && isNum(charAfter) ) || ( isNum(charBefore) && charAfter === '-' ) || ( charBefore === '}' && charAfter === '{' );

const isNum = (char) => char >= '0' && char <= '9';