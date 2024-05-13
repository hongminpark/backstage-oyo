export const WORKFLOW_REMBG = {
    "1": {
        inputs: {},
        class_type: "BRIA_RMBG_ModelLoader_Zho",
        _meta: {
            title: "🧹BRIA_RMBG Model Loader",
        },
    },
    "2": {
        inputs: {
            rmbgmodel: ["1", 0],
            image: ["9", 0],
        },
        class_type: "BRIA_RMBG_Zho",
        _meta: {
            title: "🧹BRIA RMBG",
        },
    },
    "8": {
        inputs: {
            filename_prefix: "backstage_bgremoved_",
            images: ["2", 0],
        },
        class_type: "SaveImage",
        _meta: {
            title: "Save Image",
        },
    },
    "9": {
        inputs: {
            image: "",
        },
        class_type: "ETN_LoadImageBase64",
        _meta: {
            title: "Load Image (Base64)",
        },
    },
};
