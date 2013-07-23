var fs = require('fs');
var util = require('util');

var jscompiler = require("./jscompiler");

function viml_readfile(path) {
    // FIXME: newline?
    return fs.readFileSync(path, 'utf-8').split(/\r\n|\r|\n/);
}

function test() {
    var vimfile = "test_ftsyntax.vim";
    var r = new jscompiler.StringReader(viml_readfile(vimfile));
    var p = new jscompiler.VimLParser();
    // var c = new jscompiler.Compiler();
    var c = new jscompiler.JavascriptCompiler();
    var lines = c.compile(p.parse(r));
    console.log("[source]");
    console.log(lines.join("\n"));
    // console.log("[regex]");
    // console.log(jscompiler.vimlregex_debug());
    // console.log("\n[execute]");
    // new Function(lines.join())();
}

var pat_vim2js = {
  "[0-9a-zA-Z]" : "[0-9a-zA-Z]",
  "[@*!=><&~#]" : "[@*!=><&~#]",
  "\\<ARGOPT\\>" : "\\bARGOPT\\b",
  "\\<BANG\\>" : "\\bBANG\\b",
  "\\<EDITCMD\\>" : "\\bEDITCMD\\b",
  "\\<NOTRLCOM\\>" : "\\bNOTRLCOM\\b",
  "\\<TRLBAR\\>" : "\\bTRLBAR\\b",
  "\\<USECTRLV\\>" : "\\bUSECTRLV\\b",
  "\\<\\(XFILE\\|FILES\\|FILE1\\)\\>" : "\\b(XFILE|FILES|FILE1)\\b",
  "\\S" : "\\S",
  "\\a" : "[A-Za-z]",
  "\\d" : "\\d",
  "\\h" : "[A-Za-z_]",
  "\\s" : "\\s",
  "\\v^d%[elete][lp]$" : "^d(elete|elet|ele|el|e)[lp]$",
  "\\v^s%(c[^sr][^i][^p]|g|i[^mlg]|I|r[^e])" : "^s(c[^sr][^i][^p]|g|i[^mlg]|I|r[^e])",
  "\\w" : "[0-9A-Za-z_]",
  "\\w\\|[:#]" : "[0-9A-Za-z_]|[:#]",
  "\\x" : "[0-9A-Fa-f]",
  "^++" : "^\\+\\+",
  "^++bad=\\(keep\\|drop\\|.\\)\\>" : "^\\+\\+bad=(keep|drop|.)\\b",
  "^++bad=drop" : "^\\+\\+bad=drop",
  "^++bad=keep" : "^\\+\\+bad=keep",
  "^++bin\\>" : "^\\+\\+bin\\b",
  "^++edit\\>" : "^\\+\\+edit\\b",
  "^++enc=\\S" : "^\\+\\+enc=\\S",
  "^++encoding=\\S" : "^\\+\\+encoding=\\S",
  "^++ff=\\(dos\\|unix\\|mac\\)\\>" : "^\\+\\+ff=(dos|unix|mac)\\b",
  "^++fileformat=\\(dos\\|unix\\|mac\\)\\>" : "^\\+\\+fileformat=(dos|unix|mac)\\b",
  "^++nobin\\>" : "^\\+\\+nobin\\b",
  "^[A-Z]" : "^[A-Z]",
  // "^\\$\\w\\+" : "^\\$[0-9A-Za-z_]+", // TODO
  "^\\(!\\|global\\|vglobal\\)$" : "^(!|global|vglobal)$",
  "^\\(WHILE\\|FOR\\)$" : "^(WHILE|FOR)$",
  "^\\(vimgrep\\|vimgrepadd\\|lvimgrep\\|lvimgrepadd\\)$" : "^(vimgrep|vimgrepadd|lvimgrep|lvimgrepadd)$",
  "^\\d" : "^\\d",
  "^\\h" : "^[A-Za-z_]",
  "^\\s" : "^\\s",
  "^\\s*\\\\" : "^\\s*\\\\",
  "^[ \\t]$" : "^[ \\t]$",
  "^[A-Za-z]$" : "^[A-Za-z]$",
  "^[0-9A-Za-z]$" : "^[0-9A-Za-z]$",
  "^[0-9]$" : "^[0-9]$",
  "^[0-9A-Fa-f]$" : "^[0-9A-Fa-f]$",
  "^[0-9A-Za-z_]$" : "^[0-9A-Za-z_]$",
  "^[A-Za-z_]$" : "^[A-Za-z_]$",
  "^[0-9A-Za-z_:#]$" : "^[0-9A-Za-z_:#]$",
  "^[A-Za-z_][0-9A-Za-z_]*$" : "^[A-Za-z_][0-9A-Za-z_]*$",
  "^[A-Z]$" : "^[A-Z]$",
  "^[a-z]$" : "^[a-z]$",
  "^[vgslabwt]:$\\|^\\([vgslabwt]:\\)\\?[A-Za-z_][0-9A-Za-z_#]*$" : "^[vgslabwt]:$|^([vgslabwt]:)?[A-Za-z_][0-9A-Za-z_#]*$",

  "^)\\+$": "",

  // "a*": "a\\*",
  "a\\+": "a+",
  "a\\=": "a?",
  "a\\?": "a?",
  // "a\\{1,2}": "a{1,2}", // TODO get_token_brace
  "a\\{1}": "a{1}",
  // "a\\{1,}": "a{1,}",
  // "a\\{,2}": "a{,2}",
  "a\\{}": "a*",
  // "a\\{-1,2}": "a{1,2}",  // TODO
  // "a\\{-1}": "a{1}",  // TODO
  // "a\\{-1,}": "a{1,}",  // TODO
  // "a\\{-,2}": "a{,2}",  // TODO
  "a\\{-}": "a*?",
  // "": "",
  // "": "",
  // "": "",
  // "": "",

  "^[0-7]$" : "^[0-7]$"
};

// var vm = require('vm');
// function include(path) {
//     var code = fs.readFileSync(path, 'utf-8');
//     vm.runInThisContext(code, path);
// }
function include(file_) {
    with (global) {
        eval(fs.readFileSync(file_) + '');
    }
}

if (1) {
    var _vimlregex_to_jsregex = jscompiler._vimlregex_to_jsregex;
} else {
    include('vimlfunc.js');
}

function test2() {
    if (0) {
        var reader = new jscompiler.StringReader("^++bad=\\(keep\\|drop\\|.\\)\\>");
        var reg = new jscompiler.RegexpParser(reader);
        var res = reg.parse_regexp();
        console.log(res);
    }
    else {
        for (var i in pat_vim2js) {
            var result = _vimlregex_to_jsregex(i);
            if (result != pat_vim2js[i]) {
                console.log(pat_vim2js[i], i);
                console.log(result);
                console.log();
            }
        } 
    }
}

test();
// test2();
