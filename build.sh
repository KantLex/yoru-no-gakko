#!/bin/sh
# Builds the playable game into a single index.html (served as-is by GitHub Pages).
set -e
cd "$(dirname "$0")"
site="https://kantlex.github.io/yoru-no-gakko/"
desc="A retro fixed-camera survival-horror game set in a Japanese high school at 2 a.m. Seven mysteries, one forgotten name. Free and open source, plays in the browser."
{
  echo '<!doctype html>'
  echo '<html lang="en">'
  echo '<head>'
  echo '<meta charset="utf-8">'
  echo '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
  echo "<meta name=\"description\" content=\"$desc\">"
  echo '<meta name="theme-color" content="#07080c">'
  echo '<meta property="og:type" content="website">'
  echo '<meta property="og:title" content="夜の学校 · Yoru no Gakkō">'
  echo "<meta property=\"og:description\" content=\"$desc\">"
  echo "<meta property=\"og:url\" content=\"$site\">"
  echo "<meta property=\"og:image\" content=\"${site}docs/images/og.jpg\">"
  echo '<meta name="twitter:card" content="summary_large_image">'
  echo '<meta name="twitter:creator" content="@aisongman">'
  echo "<link rel=\"icon\" href=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E%F0%9F%8F%AE%3C/text%3E%3C/svg%3E\">"
  echo '</head>'
  echo '<body>'
  cat src/00-head.html
  echo '<script type="module">'
  cat src/*.js
  echo '</script>'
  echo '</body>'
  echo '</html>'
} > index.html
echo "built index.html $(wc -c < index.html) bytes"
