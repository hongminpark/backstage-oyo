export const WS_MESSAGE_TYPE_EXECUTING = "executing";
export const WS_MESSAGE_TYPE_EXECUTED = "executed";
export const WS_MESSAGE_TYPE_STATUS = "status";
export const WS_MESSAGE_TYPE_PROGRESS = "progress";
export const WS_MESSAGE_TYPE_EXECUTION_START = "execution_start";
export const WS_MESSAGE_TYPE_EXECUTION_CACHED = "execution_cached";
export const COMFYUI_HOST = "121.67.246.191";
export const COMFYUI_PORT = "8890";

interface Callbacks {
    [key: string]: (message: any) => void;
}
const subscribers: Callbacks = {};

let webseocket: WebSocket;

export function Subscribe(key: string, callback: (message: any) => void) {
    subscribers[key] = callback;
}

export function UnSubscribe(key: string) {
    delete subscribers[key];
}
export function GetWebSocket() {
    if (webseocket) {
        return webseocket;
    }
    let { hostname, port } = window.location;

    if (process.env.NODE_ENV === "development") {
        // temp fix until more normal way to proxy web socket.
        hostname = COMFYUI_HOST;
        port = COMFYUI_PORT;
    }

    webseocket = new WebSocket(
        "ws://" + hostname + ":" + port + "/ws?clientId=1122"
    );
    // Define event handlers for the WebSocket connection
    webseocket.onopen = () => {
        console.log("WebSocket connected");
    };

    webseocket.onmessage = (event) => {
        Object.entries(subscribers).forEach(([key, callback]) => {
            callback(event); // Call the function
        });
    };

    webseocket.onclose = () => {
        console.log("WebSocket disconnected");
    };
    return webseocket;
}

export interface Root {
    CheckpointLoaderSimple: CheckpointLoaderSimple;
}

export interface Input {
    required: Required;
}

export interface Required {
    ckpt_name: string[][];
}

export interface CheckpointLoaderSimple {
    input: Input;
    output: string[];
    output_is_list: boolean[];
    output_name: string[];
    name: string;
    display_name: string;
    description: string;
    category: string;
    output_node: boolean;
}
