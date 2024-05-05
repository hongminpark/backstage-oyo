import "./App.css";
import { ComfyProvider } from "./comfy/ComfyProvider";
import Dashboard from "./dashboard/dashboard";

function App() {
    return (
        <ComfyProvider>
            <Dashboard />
        </ComfyProvider>
    );
}

export default App;
