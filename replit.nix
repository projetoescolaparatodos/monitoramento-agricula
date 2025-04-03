
{ pkgs }: {
  deps = [
    pkgs.python311Full
    pkgs.python311Packages.pip
    pkgs.freetype
    pkgs.pkg-config
    pkgs.fontconfig
    pkgs.libpng
    pkgs.zlib
    pkgs.python311Packages.matplotlib
  ];
}
