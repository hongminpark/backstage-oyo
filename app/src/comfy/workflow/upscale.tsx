export const WORKFLOW_UPSCALE = {
    "75": {
        inputs: {
            upscale_by: ["90", 0],
            seed: 155200535426821,
            steps: 8,
            cfg: 1,
            sampler_name: "euler_ancestral",
            scheduler: "karras",
            denoise: 0.25,
            mode_type: "Linear",
            tile_width: 1024,
            tile_height: 1024,
            mask_blur: 8,
            tile_padding: 32,
            seam_fix_mode: "None",
            seam_fix_denoise: 1,
            seam_fix_width: 64,
            seam_fix_mask_blur: 8,
            seam_fix_padding: 16,
            force_uniform_tiles: "enable",
            tiled_decode: false,
            image: ["241", 0],
            model: ["76", 0],
            positive: ["214", 0],
            negative: ["214", 1],
            vae: ["76", 2],
            upscale_model: ["78", 0],
        },
        class_type: "UltimateSDUpscale",
        _meta: {
            title: "Ultimate SD Upscale",
        },
    },
    "76": {
        inputs: {
            ckpt_name: "leosamsHelloworldXL_helloworldXL50GPT4V.safetensors",
        },
        class_type: "CheckpointLoaderSimple",
        _meta: {
            title: "Load Checkpoint",
        },
    },
    "78": {
        inputs: {
            model_name: "4x_NMKD-Superscale-SP_178000_G.pth",
        },
        class_type: "UpscaleModelLoader",
        _meta: {
            title: "Load Upscale Model",
        },
    },
    "80": {
        inputs: {
            control_net_name: "ttplanetSDXLControlnet_v20Fp16.safetensors",
        },
        class_type: "ControlNetLoader",
        _meta: {
            title: "Load ControlNet Model",
        },
    },
    "86": {
        inputs: {
            text: "high quality, detailed, masterpiece, 4k, high resolution",
            clip: ["76", 1],
        },
        class_type: "CLIPTextEncode",
        _meta: {
            title: "CLIP Text Encode (Prompt)",
        },
    },
    "90": {
        inputs: {
            Value: 2,
        },
        class_type: "Float",
        _meta: {
            title: "Tile",
        },
    },
    "116": {
        inputs: {
            text: "embedding:bad_prompt_version2-neg, embedding:easynegative, embedding:ng_deepnegative_v1_75t, nsfw, nude, nipple, hand, arm",
            clip: ["76", 1],
        },
        class_type: "CLIPTextEncode",
        _meta: {
            title: "CLIP Text Encode (Prompt)",
        },
    },
    "117": {
        inputs: {
            filename_prefix: "backstage_upscale_",
            images: ["75", 0],
        },
        class_type: "SaveImage",
        _meta: {
            title: "Save Image",
        },
    },
    "214": {
        inputs: {
            strength: 0.95,
            start_percent: 0,
            end_percent: 0.95,
            positive: ["86", 0],
            negative: ["116", 0],
            control_net: ["80", 0],
            image: ["241", 0],
        },
        class_type: "ControlNetApplyAdvanced",
        _meta: {
            title: "Apply ControlNet (Advanced)",
        },
    },
    "241": {
        inputs: {
            image: "",
        },
        class_type: "ETN_LoadImageBase64",
        _meta: {
            title: "Load Image (Base64)",
        },
    },
};
