const setCSSCustomProperties = (foreground, background) => {
    document.documentElement.style.setProperty('--output-foreground', foreground);
    document.documentElement.style.setProperty('--output-background', background);
}

const showError = (elm) => {
    const supportsAnimation = elm.animate;
    if (supportsAnimation) {
        elm.style.display = 'block';
        elm.animate([
            { opacity: 0 },
            { opacity: 1 },
        ], {
                duration: 150,
                fill: 'forwards',
                easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
            });
    } else {
        elm.style.display = 'block';
        elm.opacity = '1';
    }
}

const hideError = (elm) => {
    const supportsAnimation = elm.animate;
    if (supportsAnimation) {
        const animation = elm.animate([
            { opacity: 1 },
            { opacity: 0 },
        ], {
                duration: 150,
                fill: 'forwards',
                easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
            });

        animation.onfinish = function () {
            elm.style.display = 'none';
        }
    } else {
        elm.style.display = 'none';
        elm.opacity = '0';
    }
}

const roundTo = (n, digits = 0) => {
    const multiplicator = Math.pow(10, digits);
    const tempN = parseFloat((n * multiplicator).toFixed(11));
    const output = Math.round(tempN) / multiplicator;

    return output;
}

const setRatio = (foreground, background) => {
    const ratio = roundTo(tinycolor.readability(foreground, background), 2);

    outputElm.innerText = ratio;
}

const setPassFail = (foreground, background) => {
    const aaReadableLarge = tinycolor.isReadable(foreground, background, { level: "AA", size: "large" });
    const aaReadableSmall = tinycolor.isReadable(foreground, background, { level: "AA", size: "small" });
    const aaaReadableLarge = tinycolor.isReadable(foreground, background, { level: "AAA", size: "large" });
    const aaaReadableSmall = tinycolor.isReadable(foreground, background, { level: "AAA", size: "small" });

    if (aaReadableLarge) {
        aaLargePass.style.display = 'block';
        aaLargeFail.style.display = 'none';
    } else {
        aaLargePass.style.display = 'none';
        aaLargeFail.style.display = 'block';
    }

    if (aaReadableSmall) {
        aaSmallPass.style.display = 'block';
        aaSmallFail.style.display = 'none';
    } else {
        aaSmallPass.style.display = 'none';
        aaSmallFail.style.display = 'block';
    }

    if (aaaReadableLarge) {
        aaaLargePass.style.display = 'block';
        aaaLargeFail.style.display = 'none';
    } else {
        aaaLargePass.style.display = 'none';
        aaaLargeFail.style.display = 'block';
    }

    if (aaaReadableSmall) {
        aaaSmallPass.style.display = 'block';
        aaaSmallFail.style.display = 'none';
    } else {
        aaaSmallPass.style.display = 'none';
        aaaSmallFail.style.display = 'block';
    }
}

const calculate = (e) => {
    const type = e ? e.type : 'keyup';

    const foreground =
        type === 'keyup' ?
            tinycolor(foregroundElm.value) :
            tinycolor(foregroundColorInput.value);
    const background =
        type === 'keyup' ?
            tinycolor(backgroundElm.value) :
            tinycolor(backgroundColorInput.value);

    if (foreground.isValid() && background.isValid()) {
        if (type === 'keyup') {
            foregroundColorInput.value = foreground.toHexString();
            backgroundColorInput.value = background.toHexString();
        }

        if (type === 'change') {
            foregroundElm.value = foreground.toHexString();
            backgroundElm.value = background.toHexString();
        }

        setCSSCustomProperties(foreground, background);

        if (foregroundErrShown) {
            hideError(foregroundErr);
            foregroundErrShown = false;
        }
        if (backgroundErrShown) {
            hideError(backgroundErr);
            backgroundErrShown = false;
        }

        setRatio(foreground, background);
        setPassFail(foreground, background);
    } else {
        if (!foreground.isValid() && !foregroundErrShown) {
            showError(foregroundErr);
            foregroundErrShown = true;
        }

        if (!background.isValid() && !backgroundErrShown) {
            showError(backgroundErr);
            backgroundErrShown = true;
        }
    }
}

const swapColors = () => {
    const foreground = foregroundElm.value;
    const background = backgroundElm.value;

    foregroundElm.value = background;
    backgroundElm.value = foreground;

    calculate();
}

const placeholderPolyfill = function (e) {
    const element = e.target || e;
    element.classList[element.value ? 'remove' : 'add']('placeholder-shown');
}

const foregroundElm = document.querySelector('[js-foreground]');
const foregroundColorInput = document.querySelector('[js-foreground-color-input]');
const foregroundErr = document.querySelector('[js-foreground-err]');

const backgroundElm = document.querySelector('[js-background]');
const backgroundColorInput = document.querySelector('[js-background-color-input]');
const backgroundErr = document.querySelector('[js-background-err]');

const swapElm = document.querySelector('[js-swap]');
const outputElm = document.querySelector('[js-output]');

const aaLargePass = document.querySelector('[js-aa-large="pass"]');
const aaLargeFail = document.querySelector('[js-aa-large="fail"]');
const aaSmallPass = document.querySelector('[js-aa-small="pass"]');
const aaSmallFail = document.querySelector('[js-aa-small="fail"]');
const aaaLargePass = document.querySelector('[js-aaa-large="pass"]');
const aaaLargeFail = document.querySelector('[js-aaa-large="fail"]');
const aaaSmallPass = document.querySelector('[js-aaa-small="pass"]');
const aaaSmallFail = document.querySelector('[js-aaa-small="fail"]');

let foregroundErrShown = false;
let backgroundErrShown = false;

calculate();

foregroundElm.addEventListener('keyup', calculate, false);
foregroundColorInput.addEventListener('change', calculate, false);
backgroundElm.addEventListener('keyup', calculate, false);
backgroundColorInput.addEventListener('change', calculate, false);
swapElm.addEventListener('click', swapColors, false);
swapElm.addEventListener('keyup', e => {
    if (e.which === 27) { // Escape key...hide focus
        e.preventDefault;
        e.currentTarget.blur();
    }
}, false);

Array.from(document.querySelectorAll('[placeholder]')).forEach(el => {
    placeholderPolyfill(el);
    el.addEventListener('change', placeholderPolyfill);
    el.addEventListener('keyup', placeholderPolyfill);
});