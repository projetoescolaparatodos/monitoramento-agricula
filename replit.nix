
{ pkgs }: {
  deps = [
    pkgs.tk
    pkgs.tcl
    pkgs.qhull
    pkgs.gtk3
    pkgs.gobject-introspection
    pkgs.ghostscript
    pkgs.ffmpeg-full
    pkgs.arrow-cpp
    pkgs.python311Full
    pkgs.python311Packages.pip
    pkgs.python311Packages.matplotlib
    pkgs.freetype
    pkgs.pkg-config
    pkgs.fontconfig
    pkgs.cairo
    pkgs.pango
    pkgs.libpng
    pkgs.zlib
    pkgs.python311Packages.matplotlib
  ];
}
