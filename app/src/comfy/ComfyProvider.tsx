import axios from "axios";
import React, { createContext, ReactNode, useContext, useEffect } from "react";
import { GetWebSocket, Root } from "./api";
import { BASE_WORKFLOW } from "./workflow";
export const COMFYUI_HOST = "121.67.246.191";
export const COMFYUI_PORT = "8890";

interface DataContextProps {
    fetchCheckpoints: () => Promise<string[][]>;
    queuePrompt: (params) => Promise<any>;
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
    const queuePrompt = async (params) => {
        BASE_WORKFLOW["3"].inputs.seed = params.seed;
        BASE_WORKFLOW["169"].inputs.image = params.baseImage;
        BASE_WORKFLOW["6"].inputs.text = params.positivePrompt;
        const data = { prompt: BASE_WORKFLOW, client_id: "1122" };

        const response = await fetch(`${baseURL}/prompt`, {
            method: "POST",
            mode: "no-cors",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
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
