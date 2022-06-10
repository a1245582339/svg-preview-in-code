# Svg Preview In Code

SPIC is a plugin that can preview svg code in your file, such as jsx/tsx, html, and svg. There is a thumbnail before your svg tag to preview the svg, and you can hover on your svg code to view the svg in popover.

## Preview inline

![s1](https://cdn.jsdelivr.net/gh/a1245582339/image-hosting@master/s1.3xt6eo1800k0.gif)

By default, this plugin will watch your all files change when your file actived in editor, so, to ensure good performance, you can add path config so that specify files to be watch by the plugin. 

|  Key   | Type  |  Example   | Default  
|  ----  | ----  | ----  | ----  
| "spic.include"  | `null` \| `string[]` | `["src/**/icon.tsx"]` | `null`
| "spic.exclude"  | `null` \| `string[]` | `["src/**/icon.tsx"]` | `null`

## SVG Gallery

**You must add `spic.include` or `spic.exclude` to assign which files you want to show in gallery. And I also highly recommend you assign these two config to ensure performance.**


![s2](https://cdn.jsdelivr.net/gh/a1245582339/image-hosting@master/s2.22wcrjjhoctc.gif)

You can also run command `svg.gallery` to show all svgs in your include files. And you can click the svg item which you want to check in the code, extention will open the file in editor and navigate to the svg code.

_If you mannage your svg code as separate `.svg` file and you want to check your all svg files in a gallery, SPIC is not your best chose. I would recommend you to use [SVG Gallery](https://marketplace.visualstudio.com/items?itemName=developer2006.svg-gallery)_