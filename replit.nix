
{ pkgs }: {
  deps = [
    pkgs.python311Full
    pkgs.python311Packages.pip
    pkgs.nodejs-20_x
    pkgs.freetype
    pkgs.pkg-config
    pkgs.fontconfig
    pkgs.libpng
    pkgs.zlib
    pkgs.python311Packages.matplotlib
  ];
}
