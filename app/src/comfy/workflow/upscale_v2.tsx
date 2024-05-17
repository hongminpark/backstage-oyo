export const WORKFLOW_UPSCALE_V2 = {
    "4": {
        inputs: {
            ckpt_name: "epicrealism_naturalSinRC1VAE.safetensors",
        },
        class_type: "CheckpointLoaderSimple",
        _meta: {
            title: "Load Checkpoint",
        },
    },
    "13": {
        inputs: {
            stop_at_clip_layer: -1,
            clip: ["4", 1],
        },
        class_type: "CLIPSetLastLayer",
        _meta: {
            title: "CLIP Set Last Layer",
        },
    },
    "15": {
        inputs: {
            seed: 678423708574409,
            steps: 8,
            cfg: 1,
            sampler_name: "euler",
            scheduler: "sgm_uniform",
            denoise: 0.1,
            model: ["191", 0],
            positive: ["72", 0],
            negative: ["72", 1],
            latent_image: ["137", 0],
        },
        class_type: "KSampler",
        _meta: {
            title: "KSampler",
        },
    },
    "17": {
        inputs: {
            vae_name: "vae-ft-mse-840000-ema-pruned.safetensors",
        },
        class_type: "VAELoader",
        _meta: {
            title: "Load VAE",
        },
    },
    "36": {
        inputs: {
            model_name: "4x_NMKD-Superscale-SP_178000_G.pth",
        },
        class_type: "UpscaleModelLoader",
        _meta: {
            title: "Load Upscale Model",
        },
    },
    "37": {
        inputs: {
            upscale_model: ["36", 0],
            image: ["194", 0],
        },
        class_type: "ImageUpscaleWithModel",
        _meta: {
            title: "Upscale Image (using Model)",
        },
    },
    "38": {
        inputs: {
            upscale_method: "lanczos",
            scale_by: 0.5,
            image: ["37", 0],
        },
        class_type: "ImageScaleBy",
        _meta: {
            title: "Upscale Image By",
        },
    },
    "64": {
        inputs: {
            text: "(worst quality, low quality, normal quality:2), embedding:CyberRealistic_Negative-neg, ",
            clip: ["13", 0],
        },
        class_type: "CLIPTextEncode",
        _meta: {
            title: "CLIP Text Encode (Prompt)",
        },
    },
    "70": {
        inputs: {
            tile_size: 1024,
            fast: true,
            samples: ["15", 0],
            vae: ["17", 0],
        },
        class_type: "VAEDecodeTiled_TiledDiffusion",
        _meta: {
            title: "Tiled VAE Decode",
        },
    },
    "72": {
        inputs: {
            strength: 1,
            start_percent: 0,
            end_percent: 1,
            positive: ["120", 0],
            negative: ["64", 0],
            control_net: ["73", 0],
            image: ["38", 0],
        },
        class_type: "ControlNetApplyAdvanced",
        _meta: {
            title: "Apply ControlNet (Advanced)",
        },
    },
    "73": {
        inputs: {
            control_net_name: "control_v11u_sd15_tile_fp16.safetensors",
        },
        class_type: "ControlNetLoader",
        _meta: {
            title: "Load ControlNet Model",
        },
    },
    "91": {
        inputs: {
            filename_prefix: "backstage_upscaled_",
            images: ["70", 0],
        },
        class_type: "SaveImage",
        _meta: {
            title: "Save Image",
        },
    },
    "116": {
        inputs: {
            lora_name: "SDXLrender_v2.0.safetensors",
            strength_model: 0.9,
            strength_clip: 1,
            model: ["138", 0],
            clip: ["138", 1],
        },
        class_type: "LoraLoader",
        _meta: {
            title: "Load LoRA",
        },
    },
    "120": {
        inputs: {
            text: "masterpiece, best quality, highres,",
            clip: ["191", 1],
        },
        class_type: "CLIPTextEncode",
        _meta: {
            title: "CLIP Text Encode (Prompt)",
        },
    },
    "137": {
        inputs: {
            tile_size: 2048,
            fast: true,
            color_fix: true,
            pixels: ["38", 0],
            vae: ["17", 0],
        },
        class_type: "VAEEncodeTiled_TiledDiffusion",
        _meta: {
            title: "Tiled VAE Encode",
        },
    },
    "138": {
        inputs: {
            lora_name: "more_details.safetensors",
            strength_model: 0.9,
            strength_clip: 1,
            model: ["143", 0],
            clip: ["13", 0],
        },
        class_type: "LoraLoader",
        _meta: {
            title: "Load LoRA",
        },
    },
    "143": {
        inputs: {
            scale: 0.5,
            blur_sigma: 1,
            model: ["4", 0],
        },
        class_type: "SelfAttentionGuidance",
        _meta: {
            title: "Self-Attention Guidance",
        },
    },
    "190": {
        inputs: {
            switch_1: "On",
            lora_name_1: "more_details.safetensors",
            model_weight_1: 0.5,
            clip_weight_1: 1,
            switch_2: "Off",
            lora_name_2: "SDXLrender_v2.0.safetensors",
            model_weight_2: 0.9,
            clip_weight_2: 1,
            switch_3: "On",
            lora_name_3: "polyhdron_all_in_one_eyes_hands_skin_fin.safetensors",
            model_weight_3: 1,
            clip_weight_3: 1,
        },
        class_type: "CR LoRA Stack",
        _meta: {
            title: "💊 CR LoRA Stack",
        },
    },
    "191": {
        inputs: {
            model: ["143", 0],
            clip: ["4", 1],
            lora_stack: ["190", 0],
        },
        class_type: "CR Apply LoRA Stack",
        _meta: {
            title: "💊 CR Apply LoRA Stack",
        },
    },
    "192": {
        inputs: {
            image: "",
        },
        class_type: "ETN_LoadImageBase64",
        _meta: {
            title: "Load Image (Base64)",
        },
    },
    "194": {
        inputs: {
            sharpen_radius: 1,
            sigma: 0.25,
            alpha: 0.25,
            image: ["192", 0],
        },
        class_type: "ImageSharpen",
        _meta: {
            title: "ImageSharpen",
        },
    },
};
