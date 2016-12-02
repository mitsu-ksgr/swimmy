#!/bin/bash
set -eu

icon_path=./swimmy.png

# for OS X
osx_iconset_dir=swimmy.iconset
mkdir -p $osx_iconset_dir
convert -geometry   16x16   $icon_path $osx_iconset_dir/icon_16x16.png
convert -geometry   32x32   $icon_path $osx_iconset_dir/icon_16x16@2x.png
convert -geometry   32x32   $icon_path $osx_iconset_dir/icon_32x32.png
convert -geometry   64x64   $icon_path $osx_iconset_dir/icon_32x32@2x.png
convert -geometry  128x128  $icon_path $osx_iconset_dir/icon_128x128.png
convert -geometry  256x256  $icon_path $osx_iconset_dir/icon_128x128@2x.png
convert -geometry  256x256  $icon_path $osx_iconset_dir/icon_256x256.png
convert -geometry  512x512  $icon_path $osx_iconset_dir/icon_256x256@2x.png
convert -geometry  512x512  $icon_path $osx_iconset_dir/icon_512x512.png
convert -geometry 1024x1024 $icon_path $osx_iconset_dir/icon_512x512@2x.png
iconutil -c icns $osx_iconset_dir
rm -rf $osx_iconset_dir

# for Windows
convert $icon_path -define icon:auto-resize swimmy.ico
