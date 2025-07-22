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

// clicking
buttons.forEach(button => {
    button.addEventListener("click", () => {
        const val = button.textContent;
        const lastChar = expression.slice(-1);
        inputOutput.style.color = "unset";

        switch (val) {
            case "=":
                pressedEqu();
                break;

            case "C":
                cPressed();
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
                addDecimal();
                break;

            default:
                addToExpression(val);
        }
    });
});

function evaluate() {
    const res = stackEvaluation(expression);
    return isNaN(res) ? "NaN" : res;
}

function stackEvaluation(expr) {
    const precedence = {
        '+': 1,
        '-': 1,
        '*': 2,
        '/': 2,
    };

    const isOperator = (ch) => ['+', '-', '*', '/'].includes(ch);
    const isDigit = (ch) => /\d/.test(ch);

    // infix to postfix
    function toPostfix(expression) {
        let output = [];
        let stack = [];
        let numberBuffer = [];

        const flushNumberBuffer = () => {
            if (numberBuffer.length > 0) {
                output.push(numberBuffer.join(''));
                numberBuffer = [];
            }
        };

        for (let i = 0; i < expression.length; i++) {
            const ch = expression[i];
            if (i == 0 && ch == "-") {
                numberBuffer.push(ch);
            }
            else if (isDigit(ch) || ch === '.') {
                numberBuffer.push(ch);
            } else if (ch === ' ') {
                continue;
            } else if (isOperator(ch)) {
                flushNumberBuffer();
                while (
                    stack.length &&
                    isOperator(stack[stack.length - 1]) &&
                    precedence[ch] <= precedence[stack[stack.length - 1]]
                ) {
                    output.push(stack.pop());
                }
                stack.push(ch);
            } else if (ch === '(') {
                flushNumberBuffer();
                stack.push(ch);
            } else if (ch === ')') {
                flushNumberBuffer();
                while (stack.length && stack[stack.length - 1] !== '(') {
                    output.push(stack.pop());
                }
                stack.pop();
            }
        }
        flushNumberBuffer();
        while (stack.length) {
            output.push(stack.pop());
        }

        return output;
    }

    // calculate postfix
    function evalPostfix(postfix) {
        const stack = [];

        postfix.forEach(token => {
            if (!isNaN(token)) {
                stack.push(parseFloat(token));
            } else {
                const b = stack.pop();
                const a = stack.pop();
                switch (token) {
                    case '+': stack.push(a + b); break;
                    case '-': stack.push(a - b); break;
                    case '*': stack.push(a * b); break;
                    case '/': stack.push(a / b); break;
                    // case '%': stack.push(a % b); break;
                }
            }
        });

        return stack.length === 1 ? stack[0] : NaN;
    }

    try {
        //replace special character to operators
        expr = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/%/g, '/100');

        if (/[^0-9+\-*/%.() ]/.test(expr)) return NaN;

        const postfix = toPostfix(expr);
        return evalPostfix(postfix);
    } catch {
        return NaN;
    }
}

// backspace
backspaceBtn.addEventListener("click", () => {
    backspacePressed();
});

document.addEventListener("keydown", (event) => {
    inputOutput.style.color = "unset";
    const key = event.key;

    // allowed characters
    const allowedKeys = ['0','1','2','3','4','5','6','7','8','9', 
                         '+','-','*','/','%','.','(',')'];

    // pressed from allwed
    if (allowedKeys.includes(key)) {
        if (key === ".") {
            addDecimal();
        }
        else {
            addToExpression(key);
        }
    }

    // pressed Enter or =
    else if (key === "Enter" || key === "=") {
        pressedEqu();
    }

    // pressed Backspace
    else if (key === "Backspace") {
        backspacePressed();
    }

    // pressed Escape
    else if (key === "Escape") {
        cPressed();
    }
});

function pressedEqu() {
    result = evaluate();
    if (isNaN(result)) {
        inputOutput.style.color = "red";
    }
    else {
        inputOutput.style.color = "lightGreen";
        expression = result.toString();
        result = "";
        updateDisplay();
    }
}

function backspacePressed() {
    // inputOutput.style.color = "unset";
    expression = expression.slice(0, -1);
    result = evaluate();
    updateDisplay();
}

function cPressed() {
    // inputOutput.style.color = "unset";
    expression = "";
    result = "";
    updateDisplay();
}

function addToExpression(val) {
    val = val.replace(/\*/g, '×').replace(/\//g, '÷');
    const lastChar = expression.slice(-1);
    if ((lastChar == ")" && !isNaN(val)) || (lastChar == "%" && !isNaN(val))) {
            expression += "×" + val;
    }
    else if (lastChar != "%" && isOperator(lastChar) && isOperator(val)) {
        expression = expression.slice(0, -1);
        expression += val;
    }
    else if ((expression == "" && isOperator(val)) || (isOperator(val) && lastChar == "(")) {
    }
    else {
        expression += val;
    }
    result = evaluate();
    updateDisplay();
}

function addDecimal() {
    const lastChar = expression.slice(-1);
    parts = expression.split(/[\+\-\×÷%\)]/);
    currentNumber = parts[parts.length - 1];
    if (!hasDot(currentNumber)) {
        if (lastChar == "%") {
            expression += "×0" + ".";
        }
        else if ((isNaN(lastChar) || lastChar == "") && lastChar != ")") {
            expression += "0" + ".";
        }
        else if (lastChar == ")") {
            expression += "×0" + ".";
        }
        else {
            expression += "."
        }
        result = evaluate();
        updateDisplay();
    }
}

// is an operation
function isOperator(char) {
    return ['+', '-', '×', '*', '÷', '/', '%'].includes(char);
}

function hasDot(numberGroup) {
    let count = 0;
    for (let char of numberGroup) {
        if (char === ".") count++;
        if (count > 0) return true;
    }
    return false;
}