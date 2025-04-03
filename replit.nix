
{ pkgs }: {
  deps = [
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
