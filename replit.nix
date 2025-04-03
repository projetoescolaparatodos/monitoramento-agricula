
{ pkgs }: {
  deps = [
    pkgs.python311
    pkgs.nodejs-20_x
    pkgs.freetype
    pkgs.pkg-config
    pkgs.fontconfig
    pkgs.libpng
    pkgs.zlib
  ];
}
