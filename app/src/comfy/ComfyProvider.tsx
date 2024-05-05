import axios from "axios";
import React, { createContext, ReactNode, useContext, useEffect } from "react";
import {
    DashboardGenParams,
    GetWebSocket,
    Root,
    WORKFLOW,
    WORKFLOW_2,
} from "./api";
export const COMFYUI_HOST = "121.67.246.191";
export const COMFYUI_PORT = "8890";

interface DataContextProps {
    fetchCheckpoints: () => Promise<string[][]>;
    queuePrompt: (params: DashboardGenParams) => Promise<any>;
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

interface DataProviderProps {
    children: ReactNode;
}
const baseURL =
    process.env.NODE_ENV === "development"
        ? `http://${COMFYUI_HOST}:${COMFYUI_PORT}`
        : ``;
const fetchCheckpoints = async () => {
    // Implement your API fetching logic here
    return axios
        .get<Root>(`${baseURL}/object_info/CheckpointLoaderSimple`, {
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then((res) => {
            return res.data.CheckpointLoaderSimple.input.required.ckpt_name;
        });
};

export const ComfyProvider: React.FC<DataProviderProps> = ({ children }) => {
    useEffect(() => {
        GetWebSocket();
    }, []);
    const queuePrompt = async (params: DashboardGenParams) => {
        console.log(params);
        WORKFLOW["3"].inputs.seed = params.seed;
        WORKFLOW["3"].inputs.cfg = params.cfg;
        WORKFLOW["3"].inputs.steps = params.steps;
        WORKFLOW["4"].inputs.ckpt_name = params.checkpoint;
        WORKFLOW["5"].inputs.height = params.height;
        WORKFLOW["5"].inputs.width = params.width;
        WORKFLOW["6"].inputs.text = params.positivePrompt;
        WORKFLOW["7"].inputs.text = params.negativePrompt;
        const data = { prompt: WORKFLOW_2, client_id: "1122" };

        const response = await fetch(`${baseURL}/prompt`, {
            method: "POST",
            mode: "no-cors",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        return response.json();
    };

    return (
        <DataContext.Provider value={{ fetchCheckpoints, queuePrompt }}>
            {children}
        </DataContext.Provider>
    );
};

export const useComfy = (): DataContextProps => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error("useData must be used within a DataProvider");
    }
    return context;
};
