import { Progress, Textarea, useToast } from "@chakra-ui/react";
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
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "../components/ui/resizable";

export const COMFYUI_HOST = "121.67.246.191";
export const COMFYUI_PORT = "8890";

const baseImages = [
    {
        src: `${process.env.PUBLIC_URL}/demo/base01.jpeg`,
        desc: "celine fashion model, female, portrait, short straight blonde hair, grey eyes, wearing white satin top, studio lighting, white background",
    },
    {
        src: `${process.env.PUBLIC_URL}/demo/base02.jpeg`,
        desc: "prada fashion model, korean female, portrait, long black hair, wearing black satin tank top, studio lighting, white color background",
    },
];

const faceImages = [
    {
        src: `${process.env.PUBLIC_URL}/demo/face_main01.png`,
        desc: "East Asian descent, straight black hair, subtle makeup, neutral expression, sharp eyebrows, smooth skin",
    },
    {
        src: `${process.env.PUBLIC_URL}/demo/face_main02.png`,
        desc: "straight black hair, minimalist makeup, serene expression, soft features, even skin tone",
    },
    {
        src: `${process.env.PUBLIC_URL}/demo/face_main03.png`,
        desc: "Caucasian, blonde straight hair, light makeup, calm expression, clear skin, subtle lips",
    },
    {
        src: `${process.env.PUBLIC_URL}/demo/face_main04.png`,
        desc: "Caucasian, blonde short hair, minimal makeup, neutral expression, clear skin, defined cheekbones",
    },
];

const Dashboard = () => {
    const toast = useToast();
    const baseURL =
        process.env.NODE_ENV === "development"
            ? `http://${COMFYUI_HOST}:${COMFYUI_PORT}`
            : ``;

    const { queuePrompt, fetchCheckpoints, queuePrompt_rembg } = useComfy();
    const [rand, setRand] = useState<number>(Math.random);
    const [seed, setSeed] = useState(
        Math.round(Math.random() * Number.MAX_SAFE_INTEGER)
    );

    const [images, setImages] = useState<string[] | null>([]);
    const [tempImages, setTempImages] = useState<string[] | null>([
        "http://121.67.246.191:8890/view?filename=detailed__00144_.png&type=output&rand=0.9932219956795625",
        "http://121.67.246.191:8890/view?filename=detailed__00145_.png&type=output&rand=0.9932219956795625",
        "http://121.67.246.191:8890/view?filename=detailed__00146_.png&type=output&rand=0.9932219956795625",
        "http://121.67.246.191:8890/view?filename=detailed__00147_.png&type=output&rand=0.9932219956795625",
    ]);
    const [inProgress, setInProgress] = useState(false);
    const [progress, setProgress] = useState(0);
    const [prompt, setPrompt] = useState("Imagine your photo");

    // FIXME: image variable format 통일
    const [selectedBaseImage, setSelectedBaseImage] = useState();
    const [selectedFaceImage, setSelectedFaceImage] = useState();
    const [selectedImage, setSelectedImage] = useState(
        "http://121.67.246.191:8890/view?filename=detailed__00144_.png&type=output&rand=0.9932219956795625"
    );

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
            const message = JSON.parse(event.data);
            // TODO - workflow 구분 필요
            if (message.type === "crystools.monitor") return;
            if (message.type === WS_MESSAGE_TYPE_EXECUTED) {
                setRand((prev) => Math.random());
                setImages((prevImages) => [
                    ...message.data.output.images
                        .slice(0, 4)
                        .map((img) => img.filename),
                    ...prevImages,
                ]);
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
    }, []);

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

        //@ts-ignore
        const encodedImage = await convertUrlToBase64(selectedBaseImage.src);
        queuePrompt({
            seed,
            baseImage: encodedImage,
            positivePrompt: prompt,
        }).then((res) => {
            setInProgress(true);
        });

        setSeed((prev) => Math.round(Math.random() * Number.MAX_SAFE_INTEGER));
    };

    const removeBackground = async () => {
        if (!selectedImage) {
            toast({
                title: "Remove Background error",
                description: "Please select a base image.",
                status: "error",
                duration: 2000,
                isClosable: true,
            });
            return;
        }

        //@ts-ignore
        const encodedImage = await convertUrlToBase64(selectedImage);
        queuePrompt_rembg({
            image: encodedImage,
        }).then((res) => {
            setInProgress(true);
        });
    };

    return (
        <div className="w-screen h-screen flex overflow-hidden">
            <ResizablePanelGroup direction="vertical">
                {selectedImage && (
                    <ResizablePanel defaultSize={85}>
                        <div className="flex w-full h-full justify-center items-center">
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="absolute top-2 left-3 z-10 text-black items-center text-3xs"
                            >
                                <span className="hover:underline">CLOSE</span>
                            </button>
                            <div className="flex flex-col gap-4 w-full justify-center items-center">
                                <img
                                    src={selectedImage}
                                    className="min-w-[512px] max-w-[1024px] w-1/2 object-cover aspect-1"
                                />
                                <div
                                    className="py-1 px-4 border bg-white text-black hover:bg-black hover:text-white border-black hover:cursor-pointer"
                                    onClick={removeBackground}
                                >
                                    Remove Background
                                </div>
                            </div>
                        </div>
                    </ResizablePanel>
                )}
                <ResizableHandle />
                <ResizablePanel defaultSize={selectedImage ? 15 : 100}>
                    <ResizablePanelGroup direction="horizontal">
                        <ResizablePanel>
                            <div className="overflow-y-auto flex-nowrap h-full">
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
                                            <div className="hover:border hover:border-black ">
                                                <img
                                                    key={index}
                                                    src={`${baseURL}/view?filename=${image}&type=output&rand=${rand}`}
                                                    className="w-full object-cover aspect-1 hover:cursor-pointer"
                                                    onClick={() =>
                                                        setSelectedImage(
                                                            `${baseURL}/view?filename=${image}&type=output&rand=${rand}`
                                                        )
                                                    }
                                                />
                                            </div>
                                        ))}
                                    {tempImages?.length > 0 &&
                                        tempImages.map((image, index) => (
                                            <div className="hover:border hover:border-black ">
                                                <img
                                                    src={image}
                                                    className="w-full aspect-[1/1] object-cover hover:cursor-pointer"
                                                    onClick={() =>
                                                        setSelectedImage(image)
                                                    }
                                                />
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </ResizablePanel>
                        <ResizableHandle />
                        <ResizablePanel>
                            <ResizablePanelGroup direction="vertical">
                                <ResizablePanel defaultSize={70}>
                                    <div className="flex h-full pt-16 overflow-y-auto">
                                        <Accordion
                                            type="multiple"
                                            // collapsible
                                            className="w-full"
                                            defaultValue={["item-1", "item-3"]}
                                        >
                                            <AccordionItem value="item-1">
                                                <AccordionTrigger className="text-2xs px-4 py-2">
                                                    <div>1. Base Style</div>
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    <div className="h-full px-4">
                                                        <div className="text-2xs">
                                                            Select base image
                                                            for overall shape of
                                                            pose, style.
                                                        </div>
                                                        <div className="flex flex-row gap-1 overflow-x-auto scrollbar-hide">
                                                            {baseImages.map(
                                                                (
                                                                    image,
                                                                    index
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            index
                                                                        }
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
                                                <AccordionTrigger className="text-2xs px-4 py-2">
                                                    2. Select Face (optional)
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    <div className="h-full px-4">
                                                        <div className="flex flex-row gap-1 overflow-x-auto scrollbar-hide">
                                                            {faceImages.map(
                                                                (
                                                                    image,
                                                                    index
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            index
                                                                        }
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
                                                <AccordionTrigger className="text-2xs px-4 py-2">
                                                    3. Describe
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    <div className="h-full px-4">
                                                        <div className="text-2xs">
                                                            Enter keyword for
                                                            image.
                                                        </div>
                                                        <Textarea
                                                            value={prompt}
                                                            onChange={(e) =>
                                                                setPrompt(
                                                                    e.target
                                                                        .value
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
                                                        <div className="text-2xs">
                                                            Recommended keyword
                                                            : white background,
                                                            film grain, studio
                                                            lighting
                                                        </div>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    </div>
                                </ResizablePanel>
                                <ResizableHandle />
                                <ResizablePanel defaultSize={30}>
                                    <div className="flex flex-col h-full p-4 gap-2">
                                        <button
                                            className={`relative border border-black px-2 py-1 w-max hover:cursor-pointer ${
                                                inProgress
                                                    ? "bg-black text-white"
                                                    : "bg-white text-black hover:bg-black hover:text-white"
                                            } text-2xs flex items-center justify-center`}
                                            onClick={generate}
                                            disabled={inProgress}
                                        >
                                            Generate
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
                                            <div>
                                                <div className="font-medium text-2xs">
                                                    Prompt
                                                </div>
                                                <div className="text-2xs leading-tight">
                                                    {selectedBaseImage &&
                                                        prompt}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </ResizablePanel>
                            </ResizablePanelGroup>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
};

export default Dashboard;
