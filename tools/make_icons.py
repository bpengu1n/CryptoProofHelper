#!/usr/bin/env python3
"""Generate the app icons with no image-library dependency.

Mark: three proof lines of decreasing length, closed by a QED tombstone.

The PNG writer (no zlib/struct-only dependency) lives in
vendor/puzzlepieces/python/png-writer — change that there, not here. This
file only owns the icon's drawing (the mark itself).
"""
import os, sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'vendor',
                                 'puzzlepieces', 'python', 'png-writer'))
from png_writer import new_canvas, fill_rounded_rect, write_png

BG   = (0x13, 0x19, 0x23)
BAR  = (0x7a, 0xa2, 0xf7)
QED  = (0x9d, 0x7c, 0xd8)

def draw(size, inset):
    """inset: fraction of the canvas kept clear around the mark (maskable safe zone)."""
    px = new_canvas(size, BG)
    c0, cs = size * inset, size * (1 - 2 * inset)     # content box
    bar_h = cs * 0.115
    gap   = cs * 0.155
    widths = (1.00, 0.78, 0.50)
    top = c0 + (cs - (3 * bar_h + 2 * (gap - bar_h))) / 2
    for i, w in enumerate(widths):
        y = top + i * gap
        fill_rounded_rect(px, c0, y, cs * w, bar_h, BAR, bar_h / 2)
    # QED tombstone, trailing the short last line
    s = bar_h * 1.28
    fill_rounded_rect(px, c0 + cs * widths[2] + cs * 0.10, top + 2 * gap + (bar_h - s) / 2,
                       s, s, QED, s * 0.18)
    return px

if __name__ == '__main__':
    out = os.path.join(os.path.dirname(__file__), '..', 'icons')
    os.makedirs(out, exist_ok=True)
    for name, size, inset in [('icon-192.png', 192, 0.20),
                              ('icon-512.png', 512, 0.20),
                              ('icon-180.png', 180, 0.20),
                              ('icon-maskable-512.png', 512, 0.28)]:
        write_png(os.path.join(out, name), draw(size, inset))
        print('wrote', name, size)
