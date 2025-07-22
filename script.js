const inputOutput = document.getElementById("input-output");
const output = document.getElementById("output");
const buttons = document.querySelectorAll("#calculator-buttons button");
const backspaceBtn = document.getElementById("backspace-button");

let expression = "";
let result = "";

// screen refreshing
function updateDisplay() {
    inputOutput.textContent = expression || "0";
    output.textContent = !isNaN(result) ? result : "" 
}

// is an operation
function isOperator(char) {
    return ['+', '-', '×', '*', '÷', '/', '%'].includes(char);
}

// evaluating
function safeEval(expr) {
    try {
        // check for validating
        if (/[^0-9+\-*/%.() ]/.test(expr)) return NaN;

        // calculating:
        const res = Function(`"use strict"; return (${expr})`)();
        return Number.isFinite(res) ? res : NaN;
    } catch {
        return NaN;
    }
}

// clicking
buttons.forEach(button => {
    button.addEventListener("click", () => {
        const val = button.textContent;
        const lastChar = expression.slice(-1);
        inputOutput.style.color = "unset";

        switch (val) {
            case "=":
                result = evaluate();
                if (isNaN(result)) {
                    inputOutput.style.color = "red";
                    break;
                }
                inputOutput.style.color = "lightGreen";
                expression = result.toString();
                result = "";
                updateDisplay();
                break;

            case "C":
                expression = "";
                result = "";
                updateDisplay();
                break;

            // case "+/-":
            //     if (!isNaN(lastChar) || lastChar == '.') {
            //         if (expression.slice(-3, -1) == "(-") {
            //             expression = expression.slice(0, -3);
            //             expression += lastChar;
            //         }
            //         else {
            //             expression = expression.slice(0, -1);
            //             expression += "(-" + lastChar;
            //         }
            //     }
            //     else if (expression.slice(-2) == "(-") {
            //         expression = expression.slice(0, -2);
            //     }
            //     else if (expression.slice(-1) == ")")    {
            //         expression += "×(-";
            //     }
            //     else {
            //         expression += "(-";
            //     }
            //     result = evaluate();
            //     updateDisplay();
            //     break;

            case "( )":
                const open = (expression.match(/\(/g) || []).length;
                const close = (expression.match(/\)/g) || []).length;
                if (open > close && (!isNaN(lastChar) || lastChar == ")" || lastChar == ".")) {
                    expression += ")";
                }
                else if ((!isNaN(lastChar) || lastChar == ")" || lastChar == ".") && expression.length > 0) {
                    expression += "×(";
                }
                else if (lastChar == "%") {
                    if (open > close) {
                        expression += ")"
                    }
                    else {
                        expression += "×(";
                    }
                }
                else {
                    expression += "("
                }
                result = evaluate();
                updateDisplay();
                break;

            case ".":
                parts = expression.split(/[\+\-\×÷%\)]/);
                currentNumber = parts[parts.length - 1];
                if (!hasDot(currentNumber)) {
                    if (lastChar == "%") {
                        expression += "×0" + val;
                    }
                    else if ((isNaN(lastChar) || lastChar == "") && lastChar != ")") {
                        expression += "0" + val;
                    }
                    else if (lastChar == ")") {
                        expression += "×0" + val;
                    }
                    else {
                        expression += val
                        result = evaluate();
                    }
                    updateDisplay();
                }
                break;

            default:
                if (lastChar == "%" && !isNaN(val)) {
                    expression += "×" + val;
                }
                // else if ((!isNaN(lastChar) || isOperator(lastChar)) & !isNaN(val)) {
                //     expression += val
                // }
                else if (lastChar == ")" && !isNaN(val)) {
                        expression += "×" + val;
                }
                else if (isOperator(lastChar) && isOperator(val)) {
                    expression = expression.slice(0, -1);
                    expression += val;
                }
                else if (expression == "" && isOperator(val)) {
                    break
                }
                else {
                    expression += val;
                }
                result = evaluate();
                updateDisplay();
        }
    });
});

function evaluate() {
    const res = safeEval(expression.replace(/×/g, '*').replace(/÷/g, '/').replace('%', '/100'));
    return isNaN(res) ? "NaN" : res;
}

// backspace
backspaceBtn.addEventListener("click", () => {
    inputOutput.style.color = "unset";
    expression = expression.slice(0, -1);
    result = evaluate();
    updateDisplay();
});

function hasDot(numberGroup) {
    let count = 0;
    for (let char of numberGroup) {
        if (char === ".") count++;
        if (count > 0) return true;
    }
    return false;
}

