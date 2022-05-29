# Svg Preview In Code

SPIC is a plugin that can preview svg code in any type file, such as jsx/tsx, html, and svg. There is a thumbnail before your svg tag to preview the svg, and you can hover on your svg code to view the svg in popover.

![](https://i.postimg.cc/7Y55XYg1/preview.gif)

By default, this plugin will watch your all files change when your file actived in editor, so, to ensure good performance, you can add path config so that specify files to be watch by the plugin. 

|  Key   | Type  |  Example   | Default  
|  ----  | ----  | ----  | ----  
| "spic.paths"  | `null` \| `string[]` | `["src/**/icon.tsx"]` | `null`