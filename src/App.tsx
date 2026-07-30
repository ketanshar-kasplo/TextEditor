import "./App.css";

import { ReactFlowProvider } from "@xyflow/react";
import NodeEditor from "./components/NodeEditor";

// import TextEditor from "./components/TextEditor";

export default function App() {
  return (
    // <TextEditor />
    <ReactFlowProvider>
      <NodeEditor />
    </ReactFlowProvider>
  );
}