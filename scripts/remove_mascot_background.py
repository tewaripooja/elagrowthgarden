#!/usr/bin/env python3
"""Remove outer background via edge flood-fill (keeps interior whites enclosed by the sprite)."""
from __future__ import annotations

import sys
from collections import deque

from PIL import Image


def is_background(r: int, g: int, b: int) -> bool:
    """Near-white card + faint lavender surround; stops at saturated robot blues."""
    if r >= 247 and g >= 247 and b >= 247:
        return True
    lo, _, hi = sorted((r, g, b))
    if hi - lo <= 22 and hi >= 218:
        return True
    return False


def remove_background_edge_flood(path: str, out_path: str) -> None:
    img = Image.open(path).convert("RGBA")
    w, h = img.size
    pix = img.load()

    q: deque[tuple[int, int]] = deque()
    seen: set[tuple[int, int]] = set()
    kill = [[False] * w for _ in range(h)]

    for x in range(w):
        for y in (0, h - 1):
            q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            q.append((x, y))

    while q:
        x, y = q.popleft()
        if x < 0 or x >= w or y < 0 or y >= h or (x, y) in seen:
            continue
        seen.add((x, y))
        r, g, b, a = pix[x, y]
        if a < 10:
            continue
        if not is_background(r, g, b):
            continue
        kill[y][x] = True
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            q.append((x + dx, y + dy))

    for y in range(h):
        for x in range(w):
            if kill[y][x]:
                pix[x, y] = (0, 0, 0, 0)

    img.save(out_path, optimize=True)
    print(f"Wrote {out_path} ({w}x{h})")


if __name__ == "__main__":
    remove_background_edge_flood(sys.argv[1], sys.argv[2])
