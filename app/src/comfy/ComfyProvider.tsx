import axios from "axios";
import React, { createContext, ReactNode, useContext, useEffect } from "react";
import { CLIENT_ID, GetWebSocket, Root } from "./api";
import { WORKFLOW_BASE_FACE } from "./workflow/base_face";
import { WORKFLOW_REMBG } from "./workflow/rembg";
import { WORKFLOW_UPSCALE } from "./workflow/upscale";
import { WORKFLOW_UPSCALE_V2 } from "./workflow/upscale_v2";

export const COMFYUI_HOST = "121.67.246.191";
export const COMFYUI_PORT = "8890";

interface DataContextProps {
    fetchCheckpoints: () => Promise<string[][]>;
    queuePrompt: (params) => Promise<any>;
    queuePrompt_rembg: (params) => Promise<any>;
    queuePrompt_upscale: (params) => Promise<any>;
    queuePrompt_upscale_v2: (params) => Promise<any>;
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
        const {
            seed,
            baseImage,
            faceImage,
            faceTotalWeight,
            face1Weight,
            positivePrompt,
        } = params;
        WORKFLOW_BASE_FACE["3"].inputs.seed = seed;
        WORKFLOW_BASE_FACE["169"].inputs.image = baseImage;
        WORKFLOW_BASE_FACE["192"].inputs.image = faceImage
            ? faceImage
            : baseImage; // FIXME: set empty base64 string
        WORKFLOW_BASE_FACE["176"].inputs.weight = face1Weight;
        WORKFLOW_BASE_FACE["180"].inputs.weight = faceTotalWeight;
        WORKFLOW_BASE_FACE["6"].inputs.text = positivePrompt;

        const data = { prompt: WORKFLOW_BASE_FACE, client_id: CLIENT_ID };
        const response = await fetch(`${baseURL}/prompt`, {
            method: "POST",
            // mode: "no-cors",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        return response.json();
    };

    const queuePrompt_rembg = async (params) => {
        WORKFLOW_REMBG["9"].inputs.image = params.image;
        const data = { prompt: WORKFLOW_REMBG, client_id: CLIENT_ID };

        const response = await fetch(`${baseURL}/prompt`, {
            method: "POST",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        return response.json();
    };

    const queuePrompt_upscale = async (params) => {
        WORKFLOW_UPSCALE["241"].inputs.image = params.image;
        const data = { prompt: WORKFLOW_UPSCALE, client_id: CLIENT_ID };

        const response = await fetch(`${baseURL}/prompt`, {
            method: "POST",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        return response.json();
    };

    const queuePrompt_upscale_v2 = async (params) => {
        WORKFLOW_UPSCALE_V2["192"].inputs.image = params.image;
        const data = { prompt: WORKFLOW_UPSCALE_V2, client_id: CLIENT_ID };

        const response = await fetch(`${baseURL}/prompt`, {
            method: "POST",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        return response.json();
    };

    return (
        <DataContext.Provider
            value={{
                fetchCheckpoints,
                queuePrompt,
                queuePrompt_rembg,
                queuePrompt_upscale,
                queuePrompt_upscale_v2,
            }}
        >
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
