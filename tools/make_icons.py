#!/usr/bin/env python3
"""Generate the app icons with no image-library dependency (zlib + struct only).

Mark: three proof lines of decreasing length, closed by a QED tombstone.
"""
import struct, zlib, os

BG   = (0x13, 0x19, 0x23)
BAR  = (0x7a, 0xa2, 0xf7)
QED  = (0x9d, 0x7c, 0xd8)

def blank(size, color):
    return [[color] * size for _ in range(size)]

def rrect(px, x, y, w, h, color, radius=None):
    """Filled rounded rectangle, coordinates in pixels."""
    size = len(px)
    if radius is None:
        radius = min(w, h) / 2.0
    radius = min(radius, w / 2.0, h / 2.0)
    for yy in range(max(0, int(y)), min(size, int(y + h) + 1)):
        for xx in range(max(0, int(x)), min(size, int(x + w) + 1)):
            cx = min(max(xx + 0.5, x + radius), x + w - radius)
            cy = min(max(yy + 0.5, y + radius), y + h - radius)
            dx, dy = xx + 0.5 - cx, yy + 0.5 - cy
            if dx * dx + dy * dy <= radius * radius + 1e-9:
                px[yy][xx] = color

def draw(size, inset):
    """inset: fraction of the canvas kept clear around the mark (maskable safe zone)."""
    px = blank(size, BG)
    c0, cs = size * inset, size * (1 - 2 * inset)     # content box
    bar_h = cs * 0.115
    gap   = cs * 0.155
    widths = (1.00, 0.78, 0.50)
    top = c0 + (cs - (3 * bar_h + 2 * (gap - bar_h))) / 2
    for i, w in enumerate(widths):
        y = top + i * gap
        rrect(px, c0, y, cs * w, bar_h, BAR, bar_h / 2)
    # QED tombstone, trailing the short last line
    s = bar_h * 1.28
    rrect(px, c0 + cs * widths[2] + cs * 0.10, top + 2 * gap + (bar_h - s) / 2,
          s, s, QED, s * 0.18)
    return px

def write_png(path, px):
    size = len(px)
    raw = b''.join(b'\x00' + bytes(v for p in row for v in p) for row in px)
    def chunk(tag, data):
        c = tag + data
        return struct.pack('>I', len(data)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)
    png = (b'\x89PNG\r\n\x1a\n'
           + chunk(b'IHDR', struct.pack('>IIBBBBB', size, size, 8, 2, 0, 0, 0))
           + chunk(b'IDAT', zlib.compress(raw, 9))
           + chunk(b'IEND', b''))
    with open(path, 'wb') as f:
        f.write(png)

if __name__ == '__main__':
    out = os.path.join(os.path.dirname(__file__), '..', 'icons')
    os.makedirs(out, exist_ok=True)
    for name, size, inset in [('icon-192.png', 192, 0.20),
                              ('icon-512.png', 512, 0.20),
                              ('icon-180.png', 180, 0.20),
                              ('icon-maskable-512.png', 512, 0.28)]:
        write_png(os.path.join(out, name), draw(size, inset))
        print('wrote', name, size)
