import { useToast } from "@chakra-ui/react";
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
        src: "/demo/base01.jpeg",
        desc: "Female, portrait, short straight blonde hair, grey eyes, wearing white satin top, studio lighting, white background",
    },
    {
        src: "/demo/base02.jpeg",
        desc: "Female, portrait, long straight blonde hair, blue eyes, wearing black tank top, studio lighting, white background",
    },
];

const faceImages = [
    {
        src: "/demo/face_main01.png",
        desc: "East Asian descent, straight black hair, subtle makeup, neutral expression, sharp eyebrows, smooth skin",
    },
    {
        src: "/demo/face_main02.png",
        desc: "straight black hair, minimalist makeup, serene expression, soft features, even skin tone",
    },
    {
        src: "/demo/face_main03.png",
        desc: "Caucasian, blonde straight hair, light makeup, calm expression, clear skin, subtle lips",
    },
    {
        src: "/demo/face_main04.png",
        desc: "Caucasian, blonde short hair, minimal makeup, neutral expression, clear skin, defined cheekbones",
    },
];

const Dashboard = () => {
    const toast = useToast();
    const IMAGE_SIZE = 1024;
    const baseURL =
        process.env.NODE_ENV === "development"
            ? `http://${COMFYUI_HOST}:${COMFYUI_PORT}`
            : ``;

    const { queuePrompt, fetchCheckpoints } = useComfy();
    const [rand, setRand] = useState<number>(Math.random);
    const [images, setImages] = useState<string[] | null>(null);
    const [tempImages, setTempImages] = useState<string[] | null>([
        `${process.env.PUBLIC_URL}/demo/face_main01.png`,
        `${process.env.PUBLIC_URL}/demo/face_main02.png`,
        `${process.env.PUBLIC_URL}/demo/face_main03.png`,
        `${process.env.PUBLIC_URL}/demo/face_main04.png`,
    ]);
    const [checkpoints, setCheckpoints] = useState<string[][]>([]);
    const [selectedCheckpoint, setSelectedCheckpoint] = useState<string>("");

    const [cfg, setCfg] = useState(5);
    const [steps, setSteps] = useState(25);
    const [seed, setSeed] = useState(
        Math.round(Math.random() * Number.MAX_SAFE_INTEGER)
    );
    const [randomSeed, setRandomSeed] = useState(true);
    const [positivePrompt, setPositivePrompt] = useState("");
    const [negetivePrompt, setNegetivePrompt] = useState("");

    const [inProgress, setInProgress] = useState(false);
    const [progress, setProgress] = useState(0);

    const [selectedBaseImage, setSelectedBaseImage] = useState();
    const [selectedFaceImage, setSelectedFaceImage] = useState();
    const [prompt, setPrompt] = useState("Initial Text");

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
            if (message.type === WS_MESSAGE_TYPE_EXECUTED) {
                setRand((prev) => Math.random());
                setImages(
                    message.data.output.images
                        .slice(0, 4)
                        .map((img) => img.filename)
                );
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
            setCheckpoints((prev) => checkpoints);
        });
    }

    function generate() {
        // if (selectedCheckpoint === "") {
        //     toast({
        //         title: "Prompt Submitted",
        //         description: "No Checkpoint is selected",
        //         status: "error",
        //         duration: 2000,
        //         isClosable: true,
        //     });
        // }
        queuePrompt({
            cfg: cfg,
            steps: steps,
            seed: seed,
            checkpoint: selectedCheckpoint,
            height: IMAGE_SIZE,
            width: IMAGE_SIZE,
            positivePrompt: positivePrompt,
            negativePrompt: negetivePrompt,
        }).then((res) => {
            console.log(res);
            if (res.prompt_id) {
                // const examplePromise = new Promise((resolve, reject) => {
                //     setTimeout(() => resolve(200), 5000)
                // })
                // toast.promise(examplePromise, {
                //     success: { title: 'Complete', description: 'Looks great' },
                //     error: { title: 'Error', description: 'Something wrong' },
                //     loading: { title: 'Generating pending', description: 'Please wait' },
                // })
                toast({
                    title: "Prompt Submitted",
                    description: res.prompt_id,
                    status: "success",
                    duration: 2000,
                    isClosable: true,
                });
                setInProgress(true);
            }
        });
        if (randomSeed) {
            setSeed((prev) =>
                Math.round(Math.random() * Number.MAX_SAFE_INTEGER)
            );
        }
    }

    return (
        <div className="w-screen h-screen flex overflow-hidden font-sans">
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel>
                    <div className="flex flex-col overflow-y-auto flex-nowrap p-6 items-center h-full">
                        {images?.length > 0 &&
                            images.map((image, index) => (
                                <img
                                    key={index}
                                    src={`${baseURL}/view?filename=${image}&type=output&rand=${rand}`}
                                    // src={image}
                                    className="w-full object-cover aspect-1"
                                />
                            ))}
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
                                    defaultValue={[
                                        "item-1",
                                        "item-2",
                                        "item-3",
                                    ]}
                                >
                                    <AccordionItem value="item-1">
                                        <AccordionTrigger className="text-2xs px-4 py-2">
                                            <div>1. Base Style</div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="h-full px-4">
                                                <div className="text-2xs">
                                                    Select base image for
                                                    overall shape of pose,
                                                    style.
                                                </div>
                                                <div className="flex flex-row gap-1 overflow-x-auto scrollbar-hide">
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
                                                                    src={`${process.env.PUBLIC_URL}${image.src}`}
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
                                                                    src={`${process.env.PUBLIC_URL}${image.src}`}
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
                                                    Enter keyword for image.
                                                </div>
                                                <input
                                                    type="text"
                                                    value={prompt}
                                                    onChange={(e) =>
                                                        setPrompt(
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full px-2 py-1 border border-black border-opacity-25 focus:outline-none focus:border-black text-2xs"
                                                    placeholder="Type prompt"
                                                />
                                                <div className="text-2xs">
                                                    Recommended keyword : white
                                                    background, film grain,
                                                    studio lighting
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
                                    className="relative border border-black px-2 py-1 w-max hover:bg-white hover:text-black bg-black text-white text-2xs flex items-center justify-center"
                                    onClick={generate}
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
                                                    //@ts-ignore
                                                    src={`${process.env.PUBLIC_URL}${selectedBaseImage.src}`}
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
                                                    //@ts-ignore
                                                    src={`${process.env.PUBLIC_URL}${selectedFaceImage.src}`}
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
                                            {selectedBaseImage && prompt}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </ResizablePanel>
            </ResizablePanelGroup>
            {/* <Stack direction="row" spacing={2} style={{ width: "100%" }}>
                <Box
                    flex="1"
                    style={{ paddingLeft: "20px", paddingRight: "20px" }}
                >
                    <Stack
                        direction={"column"}
                        spacing={6}
                        style={{ marginTop: "5vh" }}
                    >
                        <Select
                            placeholder="Select Checkpoint"
                            value={selectedCheckpoint}
                            onChange={handleSelectChange}
                        >
                            {checkpoints?.length > 0 &&
                                checkpoints[0].map((option, index) => (
                                    <option key={index} value={option}>
                                        {option}
                                    </option>
                                ))}
                        </Select>
                        <Text>CFG ({cfg})</Text>
                        <Slider
                            aria-label="slider-ex-1"
                            defaultValue={cfg}
                            min={1}
                            max={10}
                            step={0.5}
                            onChange={handleCFGChange}
                        >
                            <SliderTrack>
                                <SliderFilledTrack />
                            </SliderTrack>
                            <SliderThumb />
                        </Slider>
                        <Text>Steps ({steps})</Text>
                        <Slider
                            aria-label="slider-ex-1"
                            defaultValue={steps}
                            min={1}
                            max={100}
                            step={1}
                            onChange={handleStepsChange}
                        >
                            <SliderTrack>
                                <SliderFilledTrack />
                            </SliderTrack>
                            <SliderThumb />
                        </Slider>
                        <Stack direction="row" spacing={5}>
                            <NumberInput
                                value={seed}
                                min={1}
                                max={Number.MAX_SAFE_INTEGER}
                                step={1}
                            >
                                <NumberInputField />
                            </NumberInput>
                            <Checkbox
                                isChecked={randomSeed}
                                onChange={handleRandomSeedChange}
                            >
                                Random Seed
                            </Checkbox>
                        </Stack>
                        <Textarea
                            placeholder="Positive Prompt"
                            onChange={handlePositivePromptChange}
                        />
                        <Textarea
                            placeholder="Negative Prompt"
                            onChange={handleNegetivePromptChange}
                        />
                        <Button colorScheme="blue" onClick={generate}>
                            Generate
                        </Button>
                        {inProgress && <Progress hasStripe value={progress} />}
                    </Stack>
                </Box>
                <Box
                    flex="2"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    h="100vh"
                >
                    {images?.length > 0 &&
                        images.map((image, index) => (
                            <AspectRatio
                                key={index}
                                minWidth="80%"
                                maxW="80%"
                                ratio={1}
                                border="1px solid black"
                                p="4"
                            >
                                <>
                                    {image && (
                                        <Image
                                            src={`${baseURL}/view?filename=${image}&type=output&rand=${rand}`}
                                            alt=""
                                            objectFit="cover"
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "contain",
                                            }}
                                        />
                                    )}
                                </>
                            </AspectRatio>
                        ))}
                </Box>
            </Stack> */}
        </div>
    );
};

export default Dashboard;
