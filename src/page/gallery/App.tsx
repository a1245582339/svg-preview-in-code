import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

type SVGDataItem = {
    path: string
    matches: {
        index: number
        base64: string
        originalSize: number
    }[]

}

const vscode = acquireVsCodeApi();

const SVGGroup = styled.div`
    margin-bottom: 10px;
`

const FilePath = styled.div`
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 10px;
`

const SVGList = styled.div`
    display: grid;
    grid-gap: 10px;
    grid-template-columns: repeat(auto-fill, 50px);
    grid-auto-rows: 50px;
`

const SVGItem = styled.div`
    height: 50px;
    width: 50px;
    box-sizing: border-box;
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    overflow: hidden;
    position: relative;
    &::after {
        content: 'OPEN';
        display: none;
        position: absolute;
        top: 50%;
        left: 50%;
        text-align: center;
        transform: translate(-50%, -50%);
        background-color: #1890ff;
        border-radius: 4px;
        color: #fff;
        font-size: 10px;
        width: 30px;
        height: 14px;
    }
    &::before {
        background-color: rgba(0, 0, 0, 0.5);
        content: '';
        display: none;
        position: absolute;
        top: 0;
        left: 0;
        height: 50px;
        width: 50px;
    }
    &:hover::after {
        display: block;
    }
    &:hover::before {
        display: block;
    }
`

const App: React.FC = () => {
    const [svgData, setSvgData] = useState<SVGDataItem[]>([])
    useEffect(() => {
        vscode.postMessage({
            command: "request_data",
        })
        window.onmessage = ({ data }) => {
            switch (data.command) {
                case 'svg_data':
                    setSvgData(data.data)
                    return;
            }
        }
    }, [])
    const onItemClick = (path: string, index: number) => {
        vscode.postMessage({
            command: "open_file",
            data: {
                path, index
            }
        })
    }
    return <div>
        {svgData.map((item, index) =>
            <SVGGroup key={index}>
                <FilePath>
                    {item.path}
                </FilePath>
                <SVGList>
                    {item.matches.map((svg, index) => <SVGItem key={index} onClick={() => { onItemClick(item.path, svg.index) }}><img src={svg.base64} alt="" /></SVGItem>)}
                </SVGList>
            </SVGGroup>
        )}
    </div>
}

export default App