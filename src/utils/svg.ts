import { XMLParser, XMLBuilder } from "fast-xml-parser";
const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
});
const builder = new XMLBuilder(
    {
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
    }
);
export const SVGReg = /<svg .*?>[\s\S]*?<\/svg>/ig;

export const svg2Base64 = (code: string, size?: {height: number, width: number}) => {
    let svg = code
    const svgObj = parser.parse(code);
    const originalSize = { height: svgObj.svg['@_height'], width: svgObj.svg['@_width'] }
    if (size) {
        svgObj.svg['@_width'] = size.width
        svgObj.svg['@_height'] = size.height
        svg = builder.build(svgObj)
    }
    const base64 = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
    return {
        base64,
        originalSize
    }
}