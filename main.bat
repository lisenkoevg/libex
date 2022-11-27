@echo off
chcp 65001

set usr=%1
set from=1
if not "%2"=="" set from=%2
set to=1000
if not "%3"=="" set to=%3
set count=100
set agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36"
set referer=http://libex.ru
mkdir data 2> nul

wget -q -O %usr%.html -U %agent% --referer=%referer% http://www.libex.ru/ppl/%usr%/
node decode.js %usr%.html
for /f "delims=<>[] tokens=2" %%i in ('grep -P "\<title\>.*\<\/title\>" %usr%.html') do (
  set usr_name=%%i
)
if "%usr_name%"=="" (
  echo Name for %usr% not found 
  goto :eof
) else (
  del %usr%.html
)

set dirname=data\%usr%_%usr_name%
mkdir %dirname% 2> nul
for /l %%i in (%from%,1,%to%) do (
  title %dirname% %%i
  wget -U %agent% --referer=%referer% -O %dirname%/%%i.html "http://www.libex.ru/ppl/%usr%/?cat_sort=2&cat_sortd=0&cat_ipp=%count%&cat_tablefmt=0&pg=%%i"
  
  grep -cP "\<h1 class=.gray.\>.....\<\/h1\>" %dirname%/%%i.html > nul && (
    echo Found "pusto" on page %%i, exiting...
    REM del %dirname%\%%i.html
    goto :end
  )
  
  ping -n 2 127.0.0.1 > nul
)

:end
echo node parse.js %usr%_%usr_name%
node parse.js %usr%_%usr_name%