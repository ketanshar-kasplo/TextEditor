import {
    ReactFlow,
    Background,
    Controls,
    BackgroundVariant,
    MiniMap,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import { useRef } from "react";


const NodeEditor = () => {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);

    const nodes: any = [];
    const edges: any = [];

    return (
        <div style={{ height: "100vh", width: "100%" }} ref={reactFlowWrapper}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                panOnScroll
            >
                <Background variant={BackgroundVariant.Lines} gap={12} size={1} />
                <Controls style={{ bottom: "0", right: "20px" }} position="bottom-right" />
                {/* <MiniMap nodeStrokeWidth={3} /> */}
            </ReactFlow>
        </div>
    )
}

export default NodeEditor
