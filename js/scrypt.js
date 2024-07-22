const NOT = "¬";
const AND = "∧";
const OR = "∨";
const XOR = "⊕";
const IMPLICATION = "→";
const REVERSE_IMPLICATION = "←";
const EQ = "≡";
const SCHAEFFERSSTROKE = "↑";
const PIERCEARROW = "↓";
const Constants = ["0", "1"];
const Operators = [NOT, AND, OR, XOR, IMPLICATION, REVERSE_IMPLICATION, EQ, SCHAEFFERSSTROKE, PIERCEARROW];
function CurrLexeme(lexemes) {
    return lexemes.length > 0 ? lexemes[0] : "";
}
function NextLexeme(lexemes) {
    lexemes.shift();
    return CurrLexeme(lexemes);
}
function CheckLexeme(lexemes, value) {
    var curr = CurrLexeme(lexemes);
    if (curr != value) {
        if (curr == "")
            throw "Неожиданный конец выражения. Ожидалось '" + value + "'";
        throw "Ожидалось '" + value + "' вместо " + CurrLexeme(lexemes);
    }
}
function IsVariable(value) {
    return value.match(/^[a-zA-Zа-яА-Я]\d*$/) != null || value.match(/^[a-zA-Zа-яА-Я]<sub>\d*<\/sub>$/) != null;
}
function IsConstant(value) {
    return Constants.indexOf(value) > -1;
}
function IsOperator(value) {
    return value != NOT && Operators.indexOf(value) > -1;
}
function Preprocessing(lexemes) {
    for (var i = 0; i < lexemes.length; i++) {
        if (lexemes[i] == '•' || lexemes[i] == '∧' || lexemes[i] == "&" || lexemes[i] == "*" || lexemes[i] == "∩")
            lexemes[i] = AND;
        if (lexemes[i] == '¬' || lexemes[i] == "!" || lexemes[i] == "⌐" || lexemes[i] == "﹁")
            lexemes[i] = NOT;
        if (lexemes[i] == "∨" || lexemes[i] == "+" || lexemes[i] == "∪")
            lexemes[i] = OR;
        if (lexemes[i] == "^" || lexemes[i] == "⊕")
            lexemes[i] = XOR;
        if (lexemes[i] == "<-" || lexemes[i] == "←" || lexemes[i] == "<=") {
            lexemes[i] = REVERSE_IMPLICATION;
        }
        if (lexemes[i] == "->" || lexemes[i] == "→" || lexemes[i] == "=>") {
            lexemes[i] = IMPLICATION;
        }
        if (lexemes[i] == "~" || lexemes[i] == "=" || lexemes[i] == "≡" || lexemes[i] == "⇔" || lexemes[i] == "<=>" || lexemes[i] == "↔") {
            lexemes[i] = EQ;
        }
        if (lexemes[i] == "|" || lexemes[i] == "↑" || lexemes[i] == "∣") {
            lexemes[i] = SCHAEFFERSSTROKE;
        }
        if (lexemes[i] == "↓") {
            lexemes[i] = PIERCEARROW;
        }
        if (lexemes[i].match(/^[a-zA-Zа-яА-Я]\d+$/)) {
            lexemes[i] = lexemes[i][0] + "<sub>" + lexemes[i].substr(1) + "</sub>";
        }
    }
    for (var i = 0; i < lexemes.length - 1; i++) {
        if (IsVariable(lexemes[i]) && (IsVariable(lexemes[i + 1]) || lexemes[i + 1] == NOT || lexemes[i + 1] == "("))
            lexemes.splice(i + 1, 0, AND);
        if (lexemes[i] == ")" && (IsVariable(lexemes[i + 1]) || lexemes[i + 1] == "(" || lexemes[i + 1] == NOT))
            lexemes.splice(i + 1, 0, AND);
    }
}
function FindIncorrect(text, lexemes) {
    if (lexemes == null)
        lexemes = [];
    var expr = lexemes.join("");
    var index = 0;
    while (index < expr.length && text[index] == expr[index])
        index++;
    return text[index];
}
function Parse(text) {
    var lexemes = text.match(/\(|\)|[a-zA-Zа-яА-Я]\d*|∨|∪|\+|•|∧|\*|∩|&|!|¬|⌐|﹁|⊕|\^|->|→|=>|<-|←|<=|~|=|≡|⇔|↔|<=>|↓|↑|∣|\||1|0/gi);
    text = text.replace(/ /g, "");
    if (text == "")
        throw "Введённое выражение пустое";
    if (lexemes == null || lexemes.join("") != text)
        throw "в выражении присутствуют недопустимые символы, например: '" + FindIncorrect(text, lexemes) + "'";
    Preprocessing(lexemes);
    var func = lexemes.join("");
    var vars = [];
    var rpn = [];
    Addition(vars, rpn, lexemes);
    if (lexemes.length > 0)
        throw "выражение некорректно";
    vars.sort();
    return {
        vars: vars, rpn: rpn, func: func
    };
}
function Addition(vars, rpn, lexemes) {
    Addition2(vars, rpn, lexemes);
    var op = CurrLexeme(lexemes);
    while (op == EQ) {
        NextLexeme(lexemes);
        Addition2(vars, rpn, lexemes);
        rpn.push(op);
        op = CurrLexeme(lexemes);
    }
}
function Addition2(vars, rpn, lexemes) {
    Addition3(vars, rpn, lexemes);
    var op = CurrLexeme(lexemes);
    while (op == IMPLICATION || op == REVERSE_IMPLICATION) {
        NextLexeme(lexemes);
        Addition3(vars, rpn, lexemes);
        rpn.push(op);
        op = CurrLexeme(lexemes);
    }
}
function Addition3(vars, rpn, lexemes) {
    Addition4(vars, rpn, lexemes);
    var op = CurrLexeme(lexemes);
    while (op == PIERCEARROW) {
        NextLexeme(lexemes);
        Addition4(vars, rpn, lexemes);
        rpn.push(op);
        op = CurrLexeme(lexemes);
    }
}
function Addition4(vars, rpn, lexemes) {
    Addition5(vars, rpn, lexemes);
    var op = CurrLexeme(lexemes);
    while (op == SCHAEFFERSSTROKE) {
        NextLexeme(lexemes);
        Addition5(vars, rpn, lexemes);
        rpn.push(op);
        op = CurrLexeme(lexemes);
    }
}
function Addition5(vars, rpn, lexemes) {
    Addition6(vars, rpn, lexemes);
    var op = CurrLexeme(lexemes);
    while (op == SCHAEFFERSSTROKE || op == PIERCEARROW) {
        NextLexeme(lexemes);
        Addition6(vars, rpn, lexemes);
        rpn.push(op);
        op = CurrLexeme(lexemes);
    }
}
function Addition6(vars, rpn, lexemes) {
    Multiplying(vars, rpn, lexemes);
    var op = CurrLexeme(lexemes);
    while (op == OR || op == XOR) {
        NextLexeme(lexemes);
        Multiplying(vars, rpn, lexemes);
        rpn.push(op);
        op = CurrLexeme(lexemes);
    }
}
function Multiplying(vars, rpn, lexemes) {
    Entity(vars, rpn, lexemes);
    while (CurrLexeme(lexemes) == AND) {
        var operation = CurrLexeme(lexemes);
        NextLexeme(lexemes);
        Entity(vars, rpn, lexemes);
        rpn.push(operation);
    }
}
function Entity(vars, rpn, lexemes) {
    var lexeme = CurrLexeme(lexemes);
    if (lexeme == "(") {
        NextLexeme(lexemes);
        Addition(vars, rpn, lexemes);
        CheckLexeme(lexemes, ")");
        NextLexeme(lexemes);
    } else if (IsConstant(lexeme)) {
        rpn.push(CurrLexeme(lexemes));
        NextLexeme(lexemes);
    } else if (IsVariable(lexeme)) {
        if (vars.indexOf(lexeme) == -1)
            vars.push(lexeme);
        rpn.push(lexeme);
        NextLexeme(lexemes);
    } else if (lexeme == NOT) {
        NextLexeme(lexemes);
        Entity(vars, rpn, lexemes);
        rpn.push(NOT);
    } else {
        throw "некорректный символ в выражении: '" + lexeme + "'";
    }
}
function Calculate(vars, var_values, rpn) {
    var stack = [];
    for (var i = 0; i < rpn.length; i++) {
        if (IsConstant(rpn[i])) {
            stack.unshift(rpn[i]);
        } else if (IsVariable(rpn[i])) {
            stack.unshift(var_values[vars.indexOf(rpn[i])]);
        } else if (IsOperator(rpn[i])) {
            var arg2 = +stack.shift();
            var arg1 = +stack.shift();
            if (rpn[i] == AND) {
                stack.unshift(arg1 & arg2);
            } else if (rpn[i] == OR) {
                stack.unshift(arg1 | arg2);
            } else if (rpn[i] == XOR) {
                stack.unshift(arg1 ^ arg2);
            } else if (rpn[i] == IMPLICATION) {
                stack.unshift(!arg1 | arg2);
            } else if (rpn[i] == REVERSE_IMPLICATION) {
                stack.unshift(!arg2 | arg1);
            } else if (rpn[i] == EQ) {
                stack.unshift(1 - arg1 ^ arg2);
            } else if (rpn[i] == PIERCEARROW) {
                stack.unshift(1 - (arg1 | arg2));
            } else if (rpn[i] == SCHAEFFERSSTROKE) {
                stack.unshift(1 - (arg1 & arg2));
            }
        } else if (rpn[i] == NOT) {
            var arg = stack.shift();
            stack.unshift(1 - arg);
        }
    }
    return stack.shift();
}
function GetTree(rpn) {
    var stack = [];
    for (var i = 0; i < rpn.length; i++) {
        var node = {
            v: rpn[i], left: null, right: null
        };
        if (IsConstant(rpn[i]) || IsVariable(rpn[i])) {} else if (IsOperator(rpn[i])) {
            node.right = stack.shift();
            node.left = stack.shift();
        } else if (rpn[i] == NOT) {
            node.left = stack.shift();
        }
        stack.unshift(node);
    }
    return stack.shift();
}
function GetSub(tree) {
    if (tree == null)
        return [];
    if (tree.left == null && tree.right == null)
        return [tree.v];
    var left = GetSub(tree.left);
    var right = GetSub(tree.right);
    var sub = [];
    for (var i = 0; i < left.length; i++)
        sub.push(left[i]);
    for (var i = 0; i < right.length; i++)
        sub.push(right[i]);
    sub.push(tree.v);
    return sub;
}
function HaveSub(expr, sub) {
    if (sub.indexOf(AND) == -1 && sub.indexOf(OR) == -1 && sub.indexOf(XOR) == -1 && sub.indexOf(NOT) == -1 && sub.indexOf(IMPLICATION) == -1 && sub.indexOf(REVERSE_IMPLICATION) == -1 && sub.indexOf(EQ) == -1 && sub.indexOf(SCHAEFFERSSTROKE) == -1 && sub.indexOf(PIERCEARROW) == -1)
        return true;
    for (var i = 0; i < expr.length; i++) {
        if (expr[i].length == sub.length) {
            var j = 0;
            while (j < expr[i].length && expr[i][j] == sub[j])
                j++;
            if (j == expr[i].length)
                return true;
        }
    }
    return false;
}
function GetSubExpr(tree, subexpr) {
    if (tree == null)
        return;
    var left = GetSub(tree.left);
    GetSubExpr(tree.left, subexpr);
    if (left.length > 0 && !HaveSub(subexpr, left))
        subexpr.push(left);
    var right = GetSub(tree.right);
    GetSubExpr(tree.right, subexpr);
    if (right.length > 0 && !HaveSub(subexpr, right))
        subexpr.push(right);
}
function RPNtoString(rpn) {
    var stack = [];
    var stackP = [];
    for (var i = 0; i < rpn.length; i++) {
        if (IsConstant(rpn[i]) || IsVariable(rpn[i])) {
            stack.unshift(rpn[i]);
            stackP.unshift(0);
        } else if (IsOperator(rpn[i])) {
            var arg2 = stack.shift();
            var arg1 = stack.shift();
            var p2 = stackP.shift();
            var p1 = stackP.shift();
            var p;
            if (rpn[i] == AND) {
                p = 2;
            } else {
                p = 1;
            }
            if (p1 > 0 && (p1 < p)) {
                arg1 = "(" + arg1 + ")";
            }
            if (p2 > 0 && (p2 <= p)) {
                arg2 = "(" + arg2 + ")";
            }
            stack.unshift(arg1 + rpn[i] + arg2);
            stackP.unshift(p);
        } else if (rpn[i] == NOT) {
            var arg = stack.shift();
            var p = stackP.shift();
            stack.unshift(MakeNot(arg));
            stackP.unshift(0);
        }
    }
    return stack.shift();
}

function MakeNot(v) {
    if (v[0] == "(")
        v = " " + v;
    return "<span class='not'>" + NOT + v + "</span>";
}

function getKD(variable, s, v) {
    return s == v ? variable : MakeNot(variable)
}

function makeBr(value) {
    if (value.match(/^[a-zA-Zа-яА-Я]<sub>\d*<\/sub>$/).length > 1)
        return "(" + value + ")";

    return value;
}

function getInfo(parsed) {
    var result = {
        vars: parsed.vars.slice(), var_values: [], vector: [], vector_d: {}, func: parsed.func, rpn: parsed.rpn, is_constant: false, constant: -1, n: parsed.vars.length, total: 1 << parsed.vars.length, polinom_values: [], sdnf: [], sdnf_sets: [], sknf: [], sknf_sets: []
    };

    for (var i = 0; i < result.total; i++) {
        var var_values = [];
        var polinom_value = [];

        for (var j = 0; j < result.n; j++) {
            var bit = (i >> j) & 1;
            var_values.unshift(bit);

            if (bit == 1)
                polinom_value.unshift(result.vars[result.n - 1 - j]);
        }

        if (polinom_value.length == 0)
            polinom_value = ["1"];

        var f = Calculate(parsed.vars, var_values, parsed.rpn);

        result.var_values.push(var_values);
        result.vector.push(f);
        result.polinom_values.push(polinom_value);
        result.vector_d[var_values.join("")] = f;

        var s = [];

        for (var j = 0; j < result.n; j++)
            s.push(getKD(result.vars[j], var_values[j], f));

        if (f == 1) {
            result.sdnf.push(s.join(""));
            result.sdnf_sets.push(var_values.join(",&nbsp;"));
        } else {
            result.sknf.push(s.join(OR));
            result.sknf_sets.push(var_values.join(",&nbsp;"));
        }
    }

    result.is_constant = result.vector.indexOf(1) == -1 || result.vector.indexOf(0) == -1;

    if (result.is_constant) {
        result.constant = result.vector.indexOf(1) == -1 ? 0 : 1;

        if (result.constant == 0) {
            result.sdnf = ["не существует"];
        } else {
            result.sknf = ["не существует"];
        }
    }

    console.log("getInfo from function");
    console.log(result);

    return result;
}

function getInfoFromVec(vector) {
    var result = {
        vars: [], var_values: [], vector: [], vector_d: {}, func: "", rpn: [], is_constant: false, constant: -1, n: Math.log2(vector.length), total: vector.length, polinom_values: [], sdnf: [], sdnf_sets: [], sknf: [], sknf_sets: []
    };

    for (var i = 0; i < result.n; i++)
        result.vars.push("x<sub>" + (i + 1) + "</sub>");

    result.func = "F(" + result.vars.join(", ") + ")";

    for (var i = 0; i < result.total; i++) {
        var var_values = [];
        var polinom_value = [];

        for (var j = 0; j < result.n; j++) {
            var bit = (i >> j) & 1;
            var_values.unshift(bit);

            if (bit == 1)
                polinom_value.unshift(result.vars[result.n - 1 - j]);
        }

        if (polinom_value.length == 0)
            polinom_value = ["1"];

        var f = +vector[i];

        result.var_values.push(var_values);
        result.vector.push(f);
        result.polinom_values.push(polinom_value);
        result.vector_d[var_values.join("")] = f;

        var s = [];

        for (var j = 0; j < result.n; j++)
            s.push(getKD(result.vars[j], var_values[j], f));

        if (f == 1) {
            result.sdnf.push(s.join(""));
            result.sdnf_sets.push(var_values.join(",&nbsp;"));
        } else {
            result.sknf.push(s.join(OR));
            result.sknf_sets.push(var_values.join(",&nbsp;"));
        }
    }

    result.is_constant = result.vector.indexOf(1) == -1 || result.vector.indexOf(0) == -1;

    if (result.is_constant) {
        result.constant = result.vector.indexOf(1) == -1 ? 0 : 1;

        if (result.constant == 0) {
            result.sdnf = ["не существует"];
        } else {
            result.sknf = ["не существует"];
        }
    }

    console.log("getInfo from vector");
    console.log(result);

    return result;
}

function getPolinom(info) {
    var vector = info.vector.slice();
    var solve = [];

    var w = 1;
    var k = 0;

    while (w < info.total) {
        solve[k] = [];
        solve[k + 1] = [];

        var old = vector.slice();
        var index = 0;

        while (index < info.total) {
            for (var i = 0; i < w; i++) {
                vector[index] = old[index];
                solve[k][index] = {
                    v: "→", c: "green"
                };
                solve[k + 1][index] = {
                    v: vector[index], c: "green"
                };
                index++;
            }

            for (var i = 0; i < w; i++) {
                vector[index] = old[index] ^ old[index - w];
                solve[k][index] = {
                    v: "<span class='xor'>" + XOR + " " + old[index - w] + "</span>", c: "red"
                };
                solve[k + 1][index] = {
                    v: vector[index], c: "red"
                };
                index++;
            }
        }

        w *= 2;
        k += 2;
    }

    solve[k] = [];
    var polinom = [];

    for (var i = 0; i < info.total; i++) {
        var v = "";

        if (vector[i] == 1) {
            v = info.polinom_values[i].join("");
            polinom.push(v);
        }

        solve[k][i] = v;
    }

    var table = "<table class='table'>";

    table += "<tr>";
    for (var i = 0; i < info.n; i++)
        table += "<td>" + info.vars[i] + "</td>";

    table += "<td>" + info.func + "</td>";
    table += "</tr>";

    for (var i = 0; i < info.total; i++) {
        table += "<tr>";

        for (var j = 0; j < info.n; j++)
            table += "<td>" + info.var_values[i][j] + "</td>";

        table += "<td class='" + solve[0][i].c + "'>" + info.vector[i] + "</td>";

        for (var j = 0; j < 2 * info.n; j++)
            table += "<td class='" + solve[j + 1][i].c + "'>" + solve[j][i].v + "</td>";

        table += "<td>" + solve[2 * info.n][i] + "</td>";

        table += "</tr>";
    }

    table += "</table>";

    return {
        polinom: polinom.join("<span class='xor'>" + XOR + "</span>"), solve: "<div class='scroll-block'>" + table + "</div>"
    };
}

function GetPolinomTriangle(info) {
    var triangle = [];

    for (var i = 0; i < info.total + 2; i++)
        triangle[i] = [];

    for (var j = 0; j < info.total; j++) {
        triangle[0][j] = info.var_values[j].join("");
        triangle[1][j] = info.polinom_values[j].join("");
    }

    for (var i = 0; i < info.total; i++)
        triangle[i + 2][0] = info.vector[i];

    for (var j = 1; j < info.total; j++)
        for (var i = 0; i < info.total - j; i++)
            triangle[i + 2][j] = triangle[i + 2][j - 1] ^ triangle[i + 3][j - 1];

    var table = "<div class='scroll-block'><table class='table'><tr>";

    for (var j = 0; j < info.total; j++)
        table += "<td>" + triangle[0][j] + "</td>";

    table += "</tr><tr>";

    for (var j = 0; j < info.total; j++) {
        if (triangle[2][j] == 1) {
            table += "<td class='red'>" + triangle[1][j] + "</td>";
        } else {
            table += "<td>" + triangle[1][j] + "</td>";
        }
    }

    for (var i = 2; i < triangle.length; i++) {
        table += "<tr><td class='green'>" + triangle[i][0] + "</td>";

        for (var j = 1; j < triangle[i].length; j++)
            table += "<td>" + triangle[i][j] + "</td>";

        table += "</tr>";
    }

    table += "</table></div><br>";

    table += "<p>1. Строится треугольная таблица, в которой первый столбец совпадает со столбцом значений функции в таблице истинности.<br>";
    table += "2. Ячейка в каждом последующем столбце получается путём сложения по модулю 2 двух ячеек предыдущего столбца — стоящей в той же строке и строкой ниже.<br>";
    table += "3. Столбцы вспомогательной таблицы нумеруются двоичными кодами в том же порядке, что и строки таблицы истинности.<br>";
    table += "4. Каждому двоичному коду ставится в соответствие один из членов полинома Жегалкина в зависимости от позиций кода, в которых стоят единицы.<br>";
    table += "5. Если в верхней строке какого-либо столбца стоит единица, то соответствующий член присутствует в полиноме Жегалкина.</p>";

    return table;
}

function GetCoefficients(f, total, func) {
    var res = [];
    var indexes = []
    var index = 0;
    var k = (f.match(/1/g) || []).length;

    while (index < total && func[index].ones <= k) {
        var a = f;
        var b = func[index].coefficient.join("");

        var i = 0;

        while (i < a.length) {
            if ((+a[i] | +b[i]) != +a[i])
                break;
            i++;
        }

        if (i == a.length) {
            res.push(func[index].coefficient);
            indexes.push(index);
        }

        index++;
    }

    return {
        coefficients: res, indexes: indexes
    };
}

function GetPolinomCoefficients(info) {
    var func = [];

    for (var i = 0; i < info.total; i++) {
        func[i] = [];
        func[i].coefficient = info.var_values[i].slice();
        func[i].vars = info.polinom_values[i].join("");
        func[i].f = info.vector[i];
        func[i].ones = (func[i].coefficient.join("").match(/1/g) || []).length;
    }

    func.sort(function(a, b) {
        if (a.vars.length != b.vars.length)
            return a.vars.length - b.vars.length;

        for (var i = 0; i < a.vars.length; i++)
            if (a.vars[i] != b.vars[i])
                return a.vars[i] - b.vars[i];

        return 0;
    });

    var solve = "Запишем данную функцию в виде полинома Жегалкина с неопределёнными коэффициентами:";
    solve += "<div class='scroll-block'>f(" + info.vars.join(",") + ") = ";
    solve += "a<sub>" + func[0].coefficient.join("") + "</sub>";

    for (var i = 1; i < info.total; i++)
        solve += " " + XOR + " a<sub>" + func[i].coefficient.join("") + "</sub>" + func[i].vars;

    solve += "</div><br>";

    var coefficients = [];

    solve += "<div class='scroll-block'>f(" + func[0].coefficient.join(",") + ") = a<sub>" + func[0].coefficient.join("") + "</sub> = " + func[0].f + " ⇒ a<sub>" + func[0].coefficient.join("") + "</sub> = " + func[0].f + "</div>";
    coefficients[0] = func[0].f;
    var polinom = [];

    if (coefficients[0] == 1)
        polinom.push(func[0].vars);

    for (var i = 1; i < info.total; i++) {
        solve += "<div class='scroll-block'>f(" + func[i].coefficient.join(",") + ") = a<sub>" + func[0].coefficient.join("") + "</sub>";

        var res = GetCoefficients(func[i].coefficient.join(""), info.total, func);
        var coef = res.coefficients;
        var indexes = res.indexes;

        for (var j = 1; j < coef.length; j++)
            solve += " " + XOR + " a<sub>" + coef[j].join("") + "</sub>";

        solve += " = " + coefficients[0];
        var v = coefficients[0];

        for (var j = 1; j < coef.length; j++) {
            if (coefficients[indexes[j]] != null) {
                solve += " " + XOR + " " + coefficients[indexes[j]];
                v ^= coefficients[indexes[j]];
            } else {
                solve += " " + XOR + " a<sub>" + coef[j].join("") + "</sub>";
            }
        }

        coefficients[i] = v ^ func[i].f;

        if (coefficients[i] == 1)
            polinom.push(func[i].vars);

        solve += " = " + func[i].f + " ⇒ a<sub>" + coef[coef.length - 1].join("") + "</sub> = " + coefficients[i];
        solve += "</div>";
    }

    solve += "<br>Окончательно получаем: " + polinom.join(" " + XOR + " ");

    return solve;
}

function getPolinomTerms(info) {
    if (info.is_constant && info.constant == 0)
        return ["0"];

    var vector = info.vector.slice();
    var w = 1;

    while (w < info.total) {
        var old = vector.slice();
        var index = 0;

        while (index < info.total) {
            for (var i = 0; i < w; i++) {
                vector[index] = old[index];
                index++;
            }

            for (var i = 0; i < w; i++) {
                vector[index] = old[index] ^ old[index - w];
                index++;
            }
        }

        w *= 2;
    }

    var polinom = [];

    for (var i = 0; i < info.total; i++)
        if (vector[i] == 1)
            polinom.push(info.polinom_values[i].join(""));

    return polinom;
}

function getSDNF(info) {
    var solve = "";

    if (info.is_constant == 1 && info.constant == 0) {
        solve += "Функция является константой 0. Поэтому её СДНФ отсутствует.";
    } else {
        solve += "Найдём наборы, на которых функция принимает истинное значение: {&nbsp;" + info.sdnf_sets.join("&nbsp;} {&nbsp;") + "&nbsp;}";
        solve += "<br>В соответствие найденным наборам поставим элементарные конъюнкции по всем переменным, причём если переменная в наборе принимает значение 0, то она будет записана с отрицанием:<br>";

        var K = [];

        for (var i = 0; i < info.sdnf_sets.length; i++) {
            K.push("K<sub>" + (i + 1) + "</sub>");
            solve += "K<sub>" + (i + 1) + "</sub>: {&nbsp;" + info.sdnf_sets[i] + "&nbsp;} — " + info.sdnf[i] + "<br>";
        }

        solve += "Объединим конъюнкции с помощью операции ИЛИ и получим совершенную дизъюнктивную нормальную форму:<br>";
        solve += "<div class='scroll-block'>" + K.join(" " + OR + " ") + " = " + info.sdnf.join(" " + OR + " ") + "</div>";
    }

    return {
        sdnf: info.sdnf.join(" " + OR + " "), solve: solve
    }
}

function getSKNF(info) {
    var solve = "";

    if (info.is_constant == 1 && info.constant == 1) {
        solve += "Функция является константой 1. Поэтому её СКНФ отсутствует.";
    } else {
        solve += "Найдём наборы, на которых функция принимает ложное значение: {&nbsp;" + info.sknf_sets.join("&nbsp;} {&nbsp;") + "&nbsp;}";
        solve += "<br>В соответствие найденным наборам поставим элементарные дизъюнкции по всем переменным, причём если переменная в наборе принимает значение 1, то она будет записана с отрицанием:<br>";

        var D = [];

        for (var i = 0; i < info.sknf_sets.length; i++) {
            D.push("D<sub>" + (i + 1) + "</sub>");
            solve += "D<sub>" + (i + 1) + "</sub>: {&nbsp;" + info.sknf_sets[i] + "&nbsp;} — " + info.sknf[i] + "<br>";
        }

        solve += "Объединим дизъюнкции с помощью операции И и получим совершенную конъюнктивную нормальную форму: ";
        solve += "<div class='scroll-block'>" + D.join(" " + AND + " ") + " = " + "(" + info.sknf.join(") " + AND + " (") + ")" + "</div>";
    }

    if (info.sknf.length < 2) {
        return {
            sknf: info.sknf.join(""), solve: solve
        }
    }

    return {
        sknf: "(" + info.sknf.join(") " + AND + " (") + ")", solve: solve
    }
}

function GetBigTable(info) {
    var subexpr = [];
    var tree = GetTree(info.rpn);
    GetSubExpr(tree, subexpr);

    var table = "<table class='table'>"

    table += "<tr>";
    for (var i = 0; i < info.n; i++)
        table += "<td>" + info.vars[i] + "</td>";

    for (var i = 0; i < subexpr.length; i++)
        table += "<td class='gray'>" + RPNtoString(subexpr[i]) + "</td>";

    table += "<td class='green'>" + RPNtoString(info.rpn) + "</td></tr>";

    for (var i = 0; i < info.total; i++) {
        table += "<tr>";

        for (var j = 0; j < info.n; j++)
            table += "<td>" + info.var_values[i][j] + "</td>";

        for (var j = 0; j < subexpr.length; j++)
            table += "<td class='gray'>" + Calculate(info.vars, info.var_values[i], subexpr[j]) + "</td>";

        table += "<td class='green'>" + Calculate(info.vars, info.var_values[i], info.rpn) + "</td>";
        table += "</tr>";
    }

    table += "</table>";

    return table;
}

function GetTable(info) {
    var table = "<table class='table'>"

    table += "<tr>";
    for (var i = 0; i < info.n; i++)
        table += "<td>" + info.vars[i] + "</td>";

    table += "<td class='green'>F</td>";
    table += "</tr>";

    for (var i = 0; i < info.total; i++) {
        table += "<tr>";

        for (var j = 0; j < info.n; j++)
            table += "<td>" + info.var_values[i][j] + "</td>";

        table += "<td class='green'>" + info.vector[i] + "</td>";
        table += "</tr>";
    }

    table += "</table>";

    return table;
}

// [a] <= [b]
function CheckSet(a, b) {
    for (var i = 0; i < a.length; i++)
        if (a[i] > b[i])
            return false;

    return true;
}

function GetClassification(info, polinom) {
    var T0 = info.vector[0] == 0;
    var T1 = info.vector[info.total - 1] == 1;
    var L = true;
    var M = true;
    var S = true;

    var solve = "";

    solve += "<h4>T<sub>0</sub></h4><p>Функция принадлежит классу T<sub>0</sub>, если на нулевом наборе она принимает значение 0.<br>На нулевом наборе значение функции равно " + info.vector[0] + ", поэтому функция ";

    if (T0) {
        solve += "<b>принадлежит</b> классу T<sub>0</sub>.</p>"
    } else {
        solve += "<b>не принадлежит</b> классу T<sub>0</sub>.</p>"
    }

    solve += "<h4>T<sub>1</sub></h4><p>Функция принадлежит классу T<sub>1</sub>, если на единичном наборе она принимает значение 1.<br>На единичном наборе значение функции равно " + info.vector[info.vector.length - 1] + ", поэтому функция ";

    if (T1) {
        solve += "<b>принадлежит</b> классу T<sub>1</sub>.</p>"
    } else {
        solve += "<b>не принадлежит</b> классу T<sub>1</sub>.</p>"
    }

    solve += "<h4>L</h4><p>Функция принадлежит классу линейных функций (L), если её полином Жегалкина не содержит произведений.<br>Полином Жегалкина функции: " + polinom.join("<span class='xor'>" + XOR + "</span>") + ". ";

    for (var i = 0; i < polinom.length && L; i++) {
        if (!IsVariable(polinom[i]) && polinom[i] != "1" && polinom[i] != "0")
            L = false;
    }

    if (L) {
        solve += "Полином не содержит произведений, поэтому функция <b>принадлежит</b> классу L.</p>"
    } else {
        solve += "Полином содержит произведения, поэтому функция <b>не принадлежит</b> классу L.</p>"
    }

    solve += "<h4>M</h4><p>Функция принадлежит классу монотонных функций (M), если для любой пары наборов α и β таких, что α ≤ β, выполняется условие f(α) ≤ f(β).<br>";
    var k = 1;
    var v = 1;

    while (k < info.total && M) {
        solve += "<b>Сравниваем соседние наборы по " + v + "-й переменной:</b><br>"
        for (var i = 0; i < info.total && M; i += 2 * k) {
            var a = info.vector.slice(i, i + k);
            var b = info.vector.slice(i + k, i + 2 * k);

            solve += "Сравним значения {" + a.join(",") + "} и {" + b.join(",") + "}: условие монотонности ";

            if (!CheckSet(a, b)) {
                M = false;
                solve += "нарушено.<br>";
            } else {
                solve += "выполнено.<br>";
            }
        }

        k *= 2;
        v++;
    }

    if (M) {
        solve += "Таким образом функция <b>принадлежит</b> классу M.</p>";
    } else {
        solve += "Таким образом функция <b>не принадлежит</b> классу M.</p>";
    }

    solve += "<h4>S</h4><p>Функция принадлежит классу самодвойственных функций (S), если на противоположных наборах она принимает противоположные значения. Проверяем:<br>";

    for (var i = 0, j = info.total - 1; i <= j && S; i++, j--) {
        solve += "Проверим значения на наборах {" + info.var_values[i].join(", ") + "} и {" + info.var_values[j].join(", ") + "}: " + info.vector[i] + " и " + info.vector[j];

        if (info.vector[i] == info.vector[j]) {
            S = false;
        } else {
            solve += " противоположны<br>";
        }
    }

    if (!S) {
        solve += " совпадают.<br> Поэтому функция <b>не принадлежит</b> классу S</p>";
    } else {
        solve += "Таким образом функция <b>принадлежит</b> классу S</p>";
    }

    var classification = "<table class='table'><tr><td>T<sub>0</sub></td><td>T<sub>1</sub></td><td>L</td><td>M</td><td>S</td></tr><tr>";

    classification += "<td>" + (T0 ? "+" : "-") + "</td>";
    classification += "<td>" + (T1 ? "+" : "-") + "</td>";
    classification += "<td>" + (L ? "+" : "-") + "</td>";
    classification += "<td>" + (M ? "+" : "-") + "</td>";
    classification += "<td>" + (S ? "+" : "-") + "</td>";

    classification += "</tr></table>";

    return {
        classification: classification, solve: solve, T0: T0, T1: T1, L: L, M: M, S: S
    };
}

function GetGrayCode(n, l) {
    var code = [];

    for (var i = 0; i < l; i++)
        code.push(0);

    if (n < 1)
        return code;

    var tmp = n ^ (n >> 1);

    while (tmp) {
        code[l - 1] = tmp & 1;
        l--;
        tmp >>= 1;
    }

    return code;
}

function GetKarnoMap(info, need) {
    var n1 = Math.floor(info.n / 2);
    var n2 = Math.floor((info.n + 1) / 2);

    var total1 = 1 << n1;
    var total2 = 1 << n2;

    var codes = [];
    var karno = [];

    var map = "<table class='table'>";
    var v = "<sub>";
    var table = [];

    for (var i = 0; i < n1; i++)
        v += info.vars[i];

    v += "</sub> \\ <sup>";

    for (var i = n1; i < info.n; i++)
        v += info.vars[i];

    v += "</sup>";

    map += "<tr><td>" + v + "</td>";

    table[0] = [];
    table[0].push(v);

    for (var i = 0; i < total2; i++) {
        var code = GetGrayCode(i, n2);
        codes.push(code);

        map += "<td class='green'>" + code.join("") + "</td>";
        table[0].push(code.join(""));
    }

    map += "</tr>";

    var K = [];

    for (var i = 0; i < total1; i++) {
        karno[i] = [];
        K[i] = [];

        var code = GetGrayCode(i, n1);
        map += "<tr><td class='red'>" + code.join("") + "</td>";

        table[i + 1] = [];
        table[i + 1].push(code.join(""));

        for (var j = 0; j < total2; j++) {
            var set = code.concat(codes[j]);

            var f = info.vector_d[set.join("")];

            K[i][j] = [];

            for (var k = 0; k < info.n; k++)
                K[i][j].push(getKD(info.vars[k], set[k], need));

            map += "<td>" + f + "</td>";

            table[i + 1].push(f);
            karno[i].push(f);
        }

        map += "</tr>";
    }

    map += "</table>";

    return {
        html: map, kard: karno, table: table, K: K
    };
}

function ShowAreaOnKard(table, area) {
    var html = "<table class='table'><tr>";

    for (var j = 0; j < table[0].length; j++)
        html += "<td>" + table[0][j] + "</td>";

    html += "</tr>";

    for (var i = 1; i < table.length; i++) {
        html += "<tr><td>" + table[i][0] + "</td>";

        for (var j = 1; j < table[i].length; j++) {
            var x = i - 1;
            var y = j - 1;
            var index = 0;

            while (index < area.length && !(area[index].x == x && area[index].y == y))
                index++;

            if (index == area.length) {
                html += "<td class='light-gray'>" + table[i][j] + "</td>";
            } else {
                html += "<td class='green'>" + table[i][j] + "</td>";
            }
        }

        html += "</td>";
    }

    html += "</table>";

    return html;
}

function CheckAllVars(check, vars) {
    for (var i = 0; i < check.length; i++)
        if (vars.indexOf(check[i]) == -1)
            return false;

    return true;
}

function CheckAreas(area1, area2, area) {
    for (var i = 0; i < area.c.length; i++) {
        var x = area.c[i].x;
        var y = area.c[i].y;

        var i1 = 0;

        while (i1 < area1.c.length && !((area1.c[i1].x == x) && (area1.c[i1].y === y)))
            i1++;

        i2 = 0;

        while (i2 < area2.c.length && !((area2.c[i2].x == x) && (area2.c[i2].y === y)))
            i2++;

        if (i1 == area1.c.length && i2 == area2.c.length)
            return false;
    }

    return true;
}

function CheckMinFormula(areas, need) {
    let cs = new Set()

    for (let area of areas)
        for (let c of area.c)
            cs.add(`${c.x}_${c.y}`)

    return cs.size == need
}

function MinimifyFunction2(need, info, table, karnos) {
    var res = JSON.parse(JSON.stringify(karnos[info.n - 1]));

    var areas = [];

    for (var i = 0; i < res.length; i++) {
        var area = res[i].area;

        var j = 0;

        while (j < area.length && info.vector_d[area[j]] == need)
            j++;

        if (j == area.length) {
            areas.push(res[i]);

            for (j = i + 1; j < res.length; j++) {
                if (CheckAllVars(need == 1 ? res[i].vars : res[i].vars2, need == 1 ? res[j].vars : res[j].vars2)) {
                    res.splice(j, 1);
                    j = i + 1;
                }
            }
        }
    }

    let targetNeed = 0

    for (let d of info.vector)
        if (d == need)
            targetNeed++

    let mainAreas = []
    let otherAreas = []

    for (let area of areas)
        if (CheckMinFormula(areas.filter((v)=>v != area), targetNeed))
            otherAreas.push(area)
        else
            mainAreas.push(area)

    console.log("MAIN:", mainAreas.length)
    console.log("OTHER:", otherAreas.length)

    let minAreas = areas

    for (let index = 0; index < 1 << otherAreas.length; index++) {
        let testAreas = mainAreas.map((v)=>v)

        for (let i = 0; i < otherAreas.length; i++)
            if ((index >> i) & 1)
                testAreas.push(otherAreas[i])

        if (CheckMinFormula(testAreas, targetNeed) && testAreas.length < minAreas.length)
            minAreas = testAreas
    }

    areas = minAreas

    var min = [];
    var solve = "";

    for (var i = 0; i < areas.length; i++) {
        for (var j = 0; j < areas[i].vars.length; j++) {
            var name1 = areas[i].vars[j];
            var name2 = areas[i].vars2[j];

            if (name1[0] == NOT) {
                var index = +(name1.substr(2)) - 1;
                areas[i].vars[j] = MakeNot(info.vars[index]);
            } else {
                var index = +(name1.substr(1)) - 1;
                areas[i].vars[j] = info.vars[index];
            }

            if (name2[0] == NOT) {
                var index = +(name2.substr(2)) - 1;
                areas[i].vars2[j] = MakeNot(info.vars[index]);
            } else {
                var index = +(name2.substr(1)) - 1;
                areas[i].vars2[j] = info.vars[index];
            }
        }

        solve += "<h4>Область " + (i + 1) + ":</h4>";
        solve += "<div class='scroll-block'>" + ShowAreaOnKard(table, areas[i].c) + "</div><br>";

        var node = [];

        if (need == 1) {
            solve += "K<sub>" + (i + 1) + "</sub>: ";
            node = areas[i].vars2.join("");
        } else {
            solve += "D<sub>" + (i + 1) + "</sub>: ";
            node = ((areas[i].vars.length > 1 && areas.length > 1) ? "(" + areas[i].vars.join(OR) + ")" : areas[i].vars.join(OR));
        }

        min.push(node);
        solve += node + "<br>";
    }

    console.log("min: ");

    if (need == 1) {
        console.log(min.join(" " + OR + " "));
    } else {
        console.log("(" + min.join(") " + AND + " (") + ")");
    }

    var html = "";

    if (need == 1) {
        html += min.join(OR);
    } else {
        html += min.join(AND);
    }

    return {
        html: html, solve: solve
    };
}

function FindFictives(info) {
    var k = info.total / 2;
    var v = 0;
    var solve = "";
    var fictives = [];

    while (k >= 1) {
        solve += "<b>Сравниваем наборы по переменной " + info.vars[v] + ":</b><br>";
        var fictive = true;

        for (var i = 0; i < info.total && fictive; i += 2 * k) {
            var a = info.vector.slice(i, i + k).join("");
            var b = info.vector.slice(i + k, i + 2 * k).join("");

            solve += "Сравним значения " + a + " и " + b + ": ";

            if (a == b) {
                solve += "совпадают.<br>";
            } else {
                solve += "не совпадают. " + info.vars[v] + " - существенная переменная.<br>";
                fictive = false;
            }
        }

        if (fictive) {
            solve += info.vars[v] + " - фиктивная переменная<br>";
            fictives.push(info.vars[v]);
        }

        k /= 2;
        v++;
    }

    var html = "";

    if (fictives.length == 0) {
        html = "Фиктивные переменные отсутствуют.";
    } else {
        html = fictives.join(",");
    }

    if (info.is_constant) {
        return {
            html: html, solve: "Функция является константой (не зависит от переменных), поэтому все переменные являются фиктивными."
        };
    } else {
        return {
            html: html, solve: solve
        };
    }
}

function scrollTo(selector) {
    window.scroll({
        top: $(selector).offset().top - $(".menu2").outerHeight(), behavior: 'smooth'
    });
}

$(document).ready(function() {

    $(".key").click(function() {
        $("#function").focus();

        var text = $("#function").val();
        var index = $("#function").prop('selectionStart');
        var t = $(this).text();

        if (t == "Backspace") {
            if (index > 0) {
                $("#function").val(text.substr(0, index - 1) + text.substr(index));
                $("#function").prop('selectionEnd', index - 1);
                $("#function").prop('selectionStart', index - 1);
            }
        } else {
            $("#function").val(text.substr(0, index) + t + text.substr(index));
            $("#function").prop('selectionEnd', index + t.length);
            $("#function").prop('selectionStart', index + t.length);
        }
    });

    $("#keyboard-key").click(function() {
        k = $(".keyboard-key")
        k.hasClass("open") ? k.removeClass("open") : k.addClass("open")
        $("#keys").slideToggle('normal');
    });

    $(".calc-btn").click(function() {
        $(".loader").show();

        if ($("#function").val() == "")
            return alert("пустой ввод")

        var text = $("#function").val().replace(/\s/g, "");
        var vec = text.match(/^[01]+$/gi);
        var lexemes = text.match(/\(|\)|[a-zA-Zа-яА-Я]\d*|∨|\||\+|•|∧|\*|&|!|¬|⌐|⊕|\^|->|→|~|=|≡|⇔|↓|↑|1|0/gi);
        var options = "";

        try {
            var info, table, html = "<hr>";

            if (vec == null) {
                var t0 = performance.now();
                var parsed = Parse(text);
                info = getInfo(parsed);
                table = GetBigTable(info);

                html += "<div class='scroll-block'><b>Введённая функция:</b> " + RPNtoString(parsed.rpn) + "</div>"

                var t1 = performance.now();
                console.log("Table: " + (t1 - t0) + " ms");
            } else if ((vec[0].length & (vec[0].length - 1)) != 0) {
                throw "Вектор должен состоять из 2<sup>n</sup> значений.";
            } else {
                info = getInfoFromVec(vec[0]);
                table = GetTable(info);

                html += "<div class='scroll-block'><b>Введённый вектор:</b> " + vec[0] + "</div>"
            }

            var solve = "";

            var needSolve = $("#solve").is(":checked");

            if ($("#table").is(":checked")) {
                options += "table ";

                if (vec == null)
                    html += "<div class='scroll-block'><b>Вектор функция:</b> " + info.vector.join("") + "</div>";

                html += "<h4>Таблица истинности:</h4><div class='scroll-block'>" + table + "</div>";
            }

            if ($("#sdnf").is(":checked")) {
                options += "sdnf ";

                var t0 = performance.now();
                var sdnf = getSDNF(info);

                html += "<h4>Совершенная дизъюнктивная нормальная форма (СДНФ)</h4><div class='scroll-block'>" + sdnf.sdnf + "</div>";

                solve += "<h4>Построение совершенной дизъюнктивной нормальной формы:</h4>";
                solve += sdnf.solve;

                var t1 = performance.now();
                console.log("SDNF: " + (t1 - t0) + " ms");
            }

            if ($("#sknf").is(":checked")) {
                options += "sknf ";

                var t0 = performance.now();
                var sknf = getSKNF(info);

                html += "<h4>Совершенная конъюнктивная нормальная форма (СKНФ)</h4><div class='scroll-block'>" + sknf.sknf + "</div>";

                solve += "<hr><h4>Построение совершенной конъюнктивной нормальной формы:</h4>";
                solve += sknf.solve;

                var t1 = performance.now();
                console.log("SKNF: " + (t1 - t0) + " ms");
            }

            if ($("#polinom").is(":checked")) {
                var t0 = performance.now();

                var polinom = getPolinom(info);

                options += "polinom ";
                html += "<h4>Полином Жегалкина</h4><div class='scroll-block'>" + polinom.polinom + "</div>";

                if (needSolve) {
                    if (info.is_constant && info.constant == 0) {
                        solve += "<hr><h4>Построение полинома Жегалкина</h4>";
                        solve += "Функция является константой 0. Поэтому полином Жегалкина равен нулю.";
                    } else {
                        solve += "<hr><h4>Построение полинома Жегалкина методом Паскаля:</h4>";
                        solve += polinom.solve;

                        solve += "<hr><h4>Построение полинома Жегалкина методом треугольника:</h4>";
                        solve += GetPolinomTriangle(info);

                        solve += "<hr><h4>Построение полинома Жегалкина методом неопределённых коэффициентов:</h4>";
                        solve += GetPolinomCoefficients(info);
                    }
                }

                var t1 = performance.now();
                console.log("Polinom: " + (t1 - t0) + " ms");
            }

            if ($("#classification").is(":checked")) {
                var t0 = performance.now();

                options += "classification ";

                var terms = getPolinomTerms(info);
                var classification = GetClassification(info, terms);

                html += "<h4>Принадлежность функции к классам Поста:</h4><div class='scroll-block'> " + classification.classification + "</div>";

                solve += "<hr><h4>Определение принадлежности функции к классам Поста:</h4>";
                solve += classification.solve;

                var t1 = performance.now();
                console.log("Classification: " + (t1 - t0) + " ms");
            }

            if ($("#karno").is(":checked")) {
                var t0 = performance.now();

                options += "karno ";

                var karno = GetKarnoMap(info, 0);

                html += "<h4>Карта Карно:</h4><div class='scroll-block'>" + karno.html + "</div>";

                if (info.n > 9) {
                    html += "<i>Минимизация КНФ, ДНФ функции невозможна. Максимум 9 переменных!</i>";
                } else {
                    html += "<h4>Минимизированная ДНФ: </h4>";
                    solve += "<hr><h4>Минимизация ДНФ</h4>";

                    if (info.is_constant) {
                        if (info.constant == 0) {
                            html += "не существует"
                            solve += "Функция является константой 0, поэтому минимизированная ДНФ не существует.";
                        } else {
                            html += "1";
                            solve += "Функция является константой 1, поэтому минимизированная ДНФ равна тождественной единице.";
                        }
                    } else {
                        var karno2 = GetKarnoMap(info, 1);
                        var minDNF = MinimifyFunction2(1, info, karno2.table, karnos);

                        html += "<div class='scrokl-block'>" + minDNF.html + "</div>";
                        solve += "<div class='scroll-block'>" + karno2.html + "</div>";
                        solve += "<p>Выделим на карте Карно прямоугольные области из единиц наибольшей площади, являющиеся степенями двойки и выпишем соответствующие им конъюнкции:<br>";
                        solve += minDNF.solve + "<br>";
                        solve += "Объединим их с помощью операции ИЛИ и получим минимизированную ДНФ: <div class='scroll-block'>" + minDNF.html + "</div></p>";
                    }

                    html += "<h4>Минимизированная КНФ: </h4>";
                    solve += "<hr><h4>Минимизация КНФ</h4>";

                    if (info.is_constant) {
                        if (info.constant == 1) {
                            html += "не существует";
                            solve += "Функция является константой 1, поэтому минимизированная КНФ не существует.";
                        } else {
                            html += "0";
                            solve += "Функция является константой 0, поэтому минимизированная КНФ равна тождественному нулю.";
                        }
                    } else {
                        var minKNF = MinimifyFunction2(0, info, karno.table, karnos);

                        html += "<div class='scroll-block'>" + minKNF.html + "</div>";
                        solve += "<div class='scroll-block'>" + karno.html + "</div>";
                        solve += "<p>Выделим на карте Карно прямоугольные области из нулей наибольшей площади, являющиеся степенями двойки и выпишем соответствующие им дизъюнкции:<br>";
                        solve += minKNF.solve + "<br>";
                        solve += "Объединим их с помощью операции И и получим минимизированную КНФ: <div class='scroll-block'>" + minKNF.html + "</div></p>";
                    }
                }

                var t1 = performance.now();
                console.log("Karno card: " + (t1 - t0) + " ms");
            }

            if ($("#fictives").is(":checked")) {
                options += "fictive_vars ";

                var fictives = FindFictives(info);

                html += "<h4>Фиктивные переменные:</h4>";
                html += fictives.html;

                solve += "<hr><h4>Поиск фиктивных переменных</h4>";
                solve += fictives.solve;
            }

            if ($("#hide-and").is(":checked")) {
                options += "WITHOUT_AND ";
                html = html.replace(new RegExp(AND,'g'), "");
            }

            if (needSolve) {
                options += "with solve"
                html += "<hr><h3>Решение</h3>" + solve;
            }

            $(".calc-solve").html(html);

        } catch (error) {
            $(".calc-solve").html("<hr><span class=error-text>Ошибка: " + error + "</span>");

        }

        $(".calc-result").show();
        $(".calc-solve").show();
        $(".loader").hide();

        scrollTo(".calc-solve");

    });
});