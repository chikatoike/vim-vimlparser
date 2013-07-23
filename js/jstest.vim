cd <sfile>:h:h

runtime js/jscompiler.vim
call extend(s:, JsCompilerImport())

function! s:build(pyfile)
  let outfile = 'js/jscompiler.js'
  let head = [
        \ ]
  let exports = [
        \ 'exports.StringReader = StringReader;',
        \ 'exports.VimLParser = VimLParser;',
        \ 'exports.Compiler = Compiler;',
        \ 'exports.RegexpParser = RegexpParser;',
        \ 'exports.JavascriptCompiler = JavascriptCompiler;',
        \ ]
  call writefile(
        \ head
        \ + readfile("js/vimlparser.js")
        \ + readfile("js/vimlfunc.js")
        \ + readfile(a:pyfile)
        \ + exports, outfile)
endfunction

function! s:test()
  if 0
    " let vimfile = 'js/jstest.vim'
    let vimfile = 'js/test_ftsyntax.vim'
    let pyfile = 'js/out-jstest.js'
  elseif 1
    let vimfile = 'js/jscompiler.vim'
    let pyfile = 'js/out-jscompiler.js'
    let compile = 0
  else
    let vimfile = 'autoload/vimlparser.vim'
    let pyfile = 'js/vimlparser.js'
    let vimlfunc = 'js/vimlfunc.js'
    let head = readfile(vimlfunc)
  endif
  if !exists('compile') || compile
    try
      let r = s:StringReader.new(readfile(vimfile))
      let p = s:VimLParser.new()
      let c = s:JavascriptCompiler.new()
      let lines = c.compile(p.parse(r))
      if exists("head")
        unlet lines[0 : index(lines, 'var NIL = [];') - 1]
        call writefile(head + lines + ['', 'main()'], pyfile)
      endif
      call writefile(lines, pyfile)
      echo join(readfile(pyfile), "\n")
    catch
      echoerr substitute(v:throwpoint, '\.\.\zs\d\+', '\=s:numtoname(submatch(0))', 'g') . "\n" . v:exception
    endtry
  endif
  if exists('compile')
    call s:build(pyfile)
  endif
endfunction

function! s:numtoname(num)
  let sig = printf("function('%s')", a:num)
  for k in keys(s:)
    if type(s:[k]) == type({})
      for name in keys(s:[k])
        if type(s:[k][name]) == type(function('tr')) && string(s:[k][name]) == sig
          return printf('%s.%s', k, name)
        endif
      endfor
    endif
  endfor
  return a:num
endfunction

let start = reltime()
call s:test()
echomsg reltimestr(reltime(start))

" 78sec on Core i7
