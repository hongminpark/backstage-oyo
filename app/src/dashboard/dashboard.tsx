import { Progress, Textarea, useToast } from "@chakra-ui/react";
import { ImgComparisonSlider } from "@img-comparison-slider/react";
import { useEffect, useState } from "react";
import {
    Subscribe,
    UnSubscribe,
    WS_MESSAGE_TYPE_EXECUTED,
    WS_MESSAGE_TYPE_PROGRESS,
} from "../comfy/api";
import { useComfy } from "../comfy/ComfyProvider";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "../components/ui/accordion";
import { Dialog, DialogContent, DialogTrigger } from "../components/ui/dialog";
import DragAndDrop from "../components/ui/DragAndDrop";
import Layout from "../components/ui/Layout";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "../components/ui/resizable";

export const COMFYUI_HOST = "121.67.246.191";
export const COMFYUI_PORT = "8890";

const Dashboard = () => {
    const toast = useToast();
    const baseURL =
        process.env.NODE_ENV === "development"
            ? `http://${COMFYUI_HOST}:${COMFYUI_PORT}`
            : ``;
    const [baseImages, setBaseImages] = useState([
        {
            src: `${process.env.PUBLIC_URL}/demo/base01.jpeg`,
            desc: "celine fashion model, female, portrait, short straight blonde hair, grey eyes, wearing white satin top, studio lighting, white background",
        },
        {
            src: `${process.env.PUBLIC_URL}/demo/base02.jpeg`,
            desc: "prada fashion model, korean female, portrait, long black hair, wearing black satin tank top, studio lighting, white color background",
        },
    ]);

    const [faceImages, setFaceImages] = useState([
        {
            src: `${process.env.PUBLIC_URL}/demo/face/01.png`,
            desc: "East Asian descent, straight black hair, subtle makeup, neutral expression, sharp eyebrows, smooth skin",
        },
        {
            src: `${process.env.PUBLIC_URL}/demo/face/02.png`,
            desc: "East Asian descent, straight black hair, subtle makeup, neutral expression, sharp eyebrows, smooth skin",
        },
        {
            src: `${process.env.PUBLIC_URL}/demo/face/03.png`,
            desc: "East Asian descent, straight black hair, subtle makeup, neutral expression, sharp eyebrows, smooth skin",
        },
        {
            src: `${process.env.PUBLIC_URL}/demo/face/04.png`,
            desc: "East Asian descent, straight black hair, subtle makeup, neutral expression, sharp eyebrows, smooth skin",
        },
        {
            src: `${process.env.PUBLIC_URL}/demo/face/05.png`,
            desc: "East Asian descent, straight black hair, subtle makeup, neutral expression, sharp eyebrows, smooth skin",
        },
        {
            src: `${process.env.PUBLIC_URL}/demo/face/06.png`,
            desc: "East Asian descent, straight black hair, subtle makeup, neutral expression, sharp eyebrows, smooth skin",
        },
        {
            src: `${process.env.PUBLIC_URL}/demo/face/07.png`,
            desc: "East Asian descent, straight black hair, subtle makeup, neutral expression, sharp eyebrows, smooth skin",
        },
        {
            src: `${process.env.PUBLIC_URL}/demo/face/08.png`,
            desc: "East Asian descent, straight black hair, subtle makeup, neutral expression, sharp eyebrows, smooth skin",
        },
        {
            src: `${process.env.PUBLIC_URL}/demo/face/09.png`,
            desc: "East Asian descent, straight black hair, subtle makeup, neutral expression, sharp eyebrows, smooth skin",
        },
    ]);
    const {
        queuePrompt,
        fetchCheckpoints,
        queuePrompt_rembg,
        queuePrompt_upscale,
    } = useComfy();
    const [rand, setRand] = useState<number>(Math.random);
    const [seed, setSeed] = useState(
        Math.round(Math.random() * Number.MAX_SAFE_INTEGER)
    );

    const [images, setImages] = useState<string[] | null>([
        `${process.env.PUBLIC_URL}/demo/sample/01.jpeg`,
        `${process.env.PUBLIC_URL}/demo/sample/02.jpeg`,
    ]);
    const [inProgress, setInProgress] = useState(false);
    const [progress, setProgress] = useState(0);
    const [prompt, setPrompt] = useState("Imagine your photo");
    const [detailPromptId, setDetailPromptId] = useState(null);

    const [selectedBaseImage, setSelectedBaseImage] = useState();
    const [selectedFaceImage, setSelectedFaceImage] = useState();
    const [beforeImage, setBeforeImage] = useState<string | null>();
    const [afterImage, setAfterImage] = useState<string | null>();

    const toggleBaseImageSelection = (img) => {
        if (selectedBaseImage === img) {
            setSelectedBaseImage(null);
            setPrompt(null);
        } else {
            setSelectedBaseImage(img);
            setPrompt(img.desc);
        }
    };

    const toggleFaceImageSelection = (src) => {
        if (selectedFaceImage === src) {
            setSelectedFaceImage(null);
        } else {
            setSelectedFaceImage(src);
        }
    };

    useEffect(() => {
        updateCheckpoint();
        Subscribe("dashboard", (event) => {
            // SAMPLE
            // {"type":"executed","data":{"node":"8","output":{"images":[{"filename":"ComfyUI_01158_.png","subfolder":"","type":"output"}]},"prompt_id":"8fd14544-0beb-4b75-96ca-099b2a9ba22e"}}
            const message = JSON.parse(event.data);
            if (message.type === "crystools.monitor") return;
            if (message.type === WS_MESSAGE_TYPE_EXECUTED) {
                setRand((prev) => Math.random());
                setImages((prevImages) => [
                    ...message.data.output.images
                        .slice(0, 4)
                        .map(
                            (img) =>
                                `${baseURL}/view?filename=${img.filename}&type=output&rand=${rand}`
                        ),
                    ...prevImages,
                ]);
                if (detailPromptId === message.data.prompt_id) {
                    setAfterImage(
                        `${baseURL}/view?filename=${message.data.output.images[0].filename}&type=output&rand=${rand}`
                    );
                    setDetailPromptId(null);
                }
                setInProgress((prev) => false);
                setProgress((prev) => 0);
            } else if (message.type === WS_MESSAGE_TYPE_PROGRESS) {
                setProgress(
                    Math.floor((message.data.value / message.data.max) * 100)
                );
            }
        });
        return () => {
            UnSubscribe("dashboard");
        };
    }, [detailPromptId]);

    function updateCheckpoint() {
        fetchCheckpoints().then((checkpoints) => {
            console.log("Fetch server status success.", checkpoints);
        });
    }

    const convertUrlToBase64 = async (imageUrl) => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();

            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64String =
                        //@ts-ignore
                        reader.result.split(",")[1] || reader.result;
                    resolve(base64String);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error("Error converting URL to base64:", error);
        }
    };

    const generate = async () => {
        if (!selectedBaseImage) {
            toast({
                title: "Prompt Submission Error",
                description: "Please select a base image.",
                status: "error",
                duration: 2000,
                isClosable: true,
            });
            return;
        }

        const encodedBaseImage = await convertUrlToBase64(
            //@ts-ignore
            selectedBaseImage.src
        );
        const encodedFaceImage = selectedFaceImage
            ? //@ts-ignore
              await convertUrlToBase64(selectedFaceImage.src)
            : null;
        queuePrompt({
            seed,
            baseImage: encodedBaseImage,
            faceImage: encodedFaceImage,
            faceTotalWeight: selectedFaceImage ? 0.4 : 0,
            face1Weight: selectedFaceImage ? 0.7 : 0,
            positivePrompt: prompt,
        }).then((res) => {
            setInProgress(true);
        });

        setSeed((prev) => Math.round(Math.random() * Number.MAX_SAFE_INTEGER));
    };

    const removeBackground = async () => {
        if (!beforeImage) {
            toast({
                title: "Remove Background error",
                description: "Please select a base image.",
                status: "error",
                duration: 2000,
                isClosable: true,
            });
            return;
        }

        const encodedImage = await convertUrlToBase64(beforeImage);
        queuePrompt_rembg({
            image: encodedImage,
        }).then((res) => {
            setDetailPromptId(res.prompt_id);
            setInProgress(true);
        });
    };

    const upscale = async () => {
        if (!beforeImage) {
            toast({
                title: "Upscale error",
                description: "Please select a base image.",
                status: "error",
                duration: 2000,
                isClosable: true,
            });
            return;
        }

        const encodedImage = await convertUrlToBase64(beforeImage);
        queuePrompt_upscale({
            image: encodedImage,
        }).then((res) => {
            setDetailPromptId(res.prompt_id);
            setInProgress(true);
        });
    };

    const download = () => {
        if (!beforeImage) {
            toast({
                title: "Download Error",
                description: "No image selected to download.",
                status: "error",
                duration: 2000,
                isClosable: true,
            });
            return;
        }

        const link = document.createElement("a");
        link.href = afterImage;
        link.download = afterImage;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Layout>
            <Dialog>
                <DialogContent>
                    <div className="flex w-full h-full justify-center items-center">
                        <div className="flex flex-col gap-4 w-full justify-center items-center">
                            {/* Add Image Comparar */}
                            {afterImage ? (
                                <ImgComparisonSlider>
                                    <img slot="first" src={beforeImage} />
                                    <img slot="second" src={afterImage} />
                                </ImgComparisonSlider>
                            ) : (
                                <img
                                    src={beforeImage}
                                    className="w-full object-cover"
                                />
                            )}
                            <div className="flex flex-col gap-1">
                                <div
                                    className="py-1 px-4 border bg-white text-black text-center hover:bg-black hover:text-white border-black hover:cursor-pointer"
                                    onClick={upscale}
                                >
                                    Upscale
                                </div>
                                <div
                                    className="py-1 px-4 border bg-white text-black text-center hover:bg-black hover:text-white border-black hover:cursor-pointer"
                                    onClick={removeBackground}
                                >
                                    Remove Background
                                </div>
                                <div
                                    className="py-1 px-4 border bg-white text-black text-center hover:bg-black hover:text-white border-black hover:cursor-pointer"
                                    onClick={download}
                                >
                                    Download
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
                <div className="w-screen h-screen flex overflow-hidden">
                    <ResizablePanelGroup direction="horizontal">
                        <ResizablePanel>
                            <div className="overflow-y-auto flex-nowrap h-full ">
                                {inProgress && (
                                    <div className="p-4 w-full aspect-[1/1] flex flex-col justify-center">
                                        <Progress
                                            colorScheme="black"
                                            isAnimated
                                            height="1px"
                                            value={progress}
                                        />
                                    </div>
                                )}
                                <div className="p-4 flex flex-col gap-4 items-center h-full">
                                    {images?.length > 0 &&
                                        images.map((image, index) => (
                                            <DialogTrigger>
                                                <div className="border border-transparent hover:border hover:border-black ">
                                                    <img
                                                        key={index}
                                                        src={image}
                                                        className="w-full object-cover aspect-1 hover:cursor-pointer"
                                                        onClick={() => {
                                                            setBeforeImage(
                                                                image
                                                            );
                                                            setAfterImage(null);
                                                        }}
                                                    />
                                                </div>
                                            </DialogTrigger>
                                        ))}
                                </div>
                            </div>
                        </ResizablePanel>
                        <ResizableHandle className="bg-black" />
                        <ResizablePanel>
                            <ResizablePanelGroup direction="vertical">
                                <div className="flex flex-col h-full overflow-y-auto">
                                    <Accordion
                                        type="multiple"
                                        // collapsible
                                        className="w-full"
                                        defaultValue={["item-1", "item-3"]}
                                    >
                                        <AccordionItem value="item-1">
                                            <AccordionTrigger className="text-lg px-4 py-2">
                                                <div>1. POSE*</div>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="flex flex-col px-4 gap-2 h-full">
                                                    <DragAndDrop
                                                        addBaseImage={(img) => {
                                                            setBaseImages([
                                                                Object.assign({
                                                                    src: img,
                                                                }),
                                                                ...baseImages,
                                                            ]);
                                                        }}
                                                        message={
                                                            "Upload your own image."
                                                        }
                                                    />
                                                    <div className="flex flex-row gap-1 overflow-x-auto">
                                                        {baseImages.map(
                                                            (image, index) => (
                                                                <div
                                                                    key={index}
                                                                    className={`flex-none h-[172px] aspect-[1/1] relative hover:border hover:border-black hover:cursor-pointer overflow-hidden ${
                                                                        selectedBaseImage ===
                                                                        image
                                                                            ? "border border-black"
                                                                            : "border border-transparent"
                                                                    }`}
                                                                    onClick={() =>
                                                                        toggleBaseImageSelection(
                                                                            image
                                                                        )
                                                                    }
                                                                >
                                                                    <img
                                                                        src={
                                                                            image.src
                                                                        }
                                                                        alt={`Main Model ${
                                                                            index +
                                                                            1
                                                                        }`}
                                                                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300 ease-in-out"
                                                                    />
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem value="item-2">
                                            <AccordionTrigger className="text-lg px-4 py-2">
                                                2. FACE
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="flex flex-col px-4 gap-2 h-full">
                                                    <DragAndDrop
                                                        addBaseImage={(img) => {
                                                            setFaceImages([
                                                                Object.assign({
                                                                    src: img,
                                                                }),
                                                                ...faceImages,
                                                            ]);
                                                        }}
                                                        message={
                                                            "Upload your own image."
                                                        }
                                                    />
                                                    <div className="flex flex-row gap-1 overflow-x-auto">
                                                        {faceImages.map(
                                                            (image, index) => (
                                                                <div
                                                                    key={index}
                                                                    className={`flex-none w-[128px] aspect-[1/1] relative hover:cursor-pointer overflow-hidden ${
                                                                        selectedFaceImage ===
                                                                        image
                                                                            ? "border border-black"
                                                                            : "border border-transparent"
                                                                    }`}
                                                                    onClick={() =>
                                                                        toggleFaceImageSelection(
                                                                            image
                                                                        )
                                                                    }
                                                                >
                                                                    <img
                                                                        src={
                                                                            image.src
                                                                        }
                                                                        alt={`Face Model ${
                                                                            index +
                                                                            1
                                                                        }`}
                                                                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300 ease-in-out"
                                                                    />
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem value="item-3">
                                            <AccordionTrigger className="text-lg px-4 py-2">
                                                3. DESCRIPTION
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="h-full px-4">
                                                    {/* gender, clothes, ethnicity, hairstyle,  */}
                                                    <Textarea
                                                        value={prompt}
                                                        onChange={(e) =>
                                                            setPrompt(
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Type prompt"
                                                        size="xs"
                                                        resize="none"
                                                        width="full"
                                                        borderColor="black"
                                                        focusBorderColor="black"
                                                        fontSize="xs"
                                                        borderRadius={0}
                                                    />
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                    <div className="flex flex-col h-full p-4 gap-2">
                                        <button
                                            className={`relative border border-black p-2 w-full hover:cursor-pointer ${
                                                inProgress
                                                    ? "bg-black text-white"
                                                    : "bg-white text-black hover:bg-black hover:text-white"
                                            } text-2xs flex items-center justify-center`}
                                            onClick={generate}
                                            disabled={inProgress}
                                        >
                                            GENERATE
                                        </button>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex flex-row gap-1 text-2xs">
                                                {selectedBaseImage && (
                                                    <div className="flex-none w-[96px]">
                                                        <div className="font-medium">
                                                            Base
                                                        </div>
                                                        <img
                                                            src={
                                                                //@ts-ignore
                                                                selectedBaseImage.src
                                                            }
                                                            className="w-full aspect-[1/1] object-cover"
                                                        />
                                                    </div>
                                                )}
                                                {selectedFaceImage && (
                                                    <div className="flex-none w-[96px]">
                                                        <div className="font-medium">
                                                            Face
                                                        </div>
                                                        <img
                                                            src={
                                                                //@ts-ignore
                                                                selectedFaceImage.src
                                                            }
                                                            className="w-full aspect-[1/1] object-cover"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ResizablePanelGroup>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </div>
            </Dialog>
        </Layout>
    );
};

export default Dashboard;
