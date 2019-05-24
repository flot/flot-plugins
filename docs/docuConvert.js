var docs = [
    $.plot.JUMExample.docu.video
];

function indent (result) {
    var i;
    for (i = 0; i < result.indent; i++) {
        result.outStr += '\t';
    }

    return result;
}

function  changeBrs(result, str) {
    var repl = /<br><br>/g;
    var indentStr = indent({outStr: '', indent: result.indent});
    return str.replace(repl, '\n' + indentStr.outStr + ' - ');
}

function convert(doc, result) {
    for (var prop in doc) {
        if (prop === 'docu') {
            if (doc[prop] === 'Documentation') {
                continue;
            }
            result.outStr += changeBrs(result, doc[prop]);
            result.outStr += '\n';
        } else if (prop === 'defVal') {
            result = indent(result);
            result.outStr += 'Default: ' + doc[prop] + '\n';
        } else {
            result = indent(result);
            var docProp = doc[prop];
            if (typeof docProp === 'string') {
                result.outStr += doc[prop] + '\n';
            } else {
                result.outStr += '* <strong>' +  prop + '</strong>: ';
                result.indent++;
                result = convert(doc[prop], result);
                result.indent--;
            }
        }
    }

    return result;
};

var i;
var result = {indent: 0, outStr: ''};
for (i = 0; i < docs.length; i++) {
    result = convert(docs[i], result);
}

console.log(result.outStr);
