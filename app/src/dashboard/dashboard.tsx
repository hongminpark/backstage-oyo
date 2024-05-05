import {
    AspectRatio,
    Box,
    Button,
    Checkbox,
    Image,
    NumberInput,
    NumberInputField,
    Progress,
    Select,
    Slider,
    SliderFilledTrack,
    SliderThumb,
    SliderTrack,
    Stack,
    Text,
    Textarea,
    useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
    Subscribe,
    UnSubscribe,
    WS_MESSAGE_TYPE_EXECUTED,
    WS_MESSAGE_TYPE_PROGRESS,
} from "../comfy/api";
import { useComfy } from "../comfy/ComfyProvider";
import { base } from "./image";

export const COMFYUI_HOST = "121.67.246.191";
export const COMFYUI_PORT = "8890";

const Dashboard = () => {
    const toast = useToast();
    const IMAGE_SIZE = 1024;
    const baseURL =
        process.env.NODE_ENV === "development"
            ? `http://${COMFYUI_HOST}:${COMFYUI_PORT}`
            : ``;

    const { queuePrompt, fetchCheckpoints } = useComfy();
    const [rand, setRand] = useState<number>(Math.random);
    const [image, setImage] = useState<string | null>(null);

    const [checkpoints, setCheckpoints] = useState<string[][]>([]);
    const [selectedCheckpoint, setSelectedCheckpoint] = useState<string>("");

    const [cfg, setCfg] = useState(5);
    const [steps, setSteps] = useState(25);
    const [seed, setSeed] = useState(
        Math.round(Math.random() * Number.MAX_SAFE_INTEGER)
    );
    const [randomSeed, setRandomSeed] = useState(true);

    const [height, setHeight] = useState(IMAGE_SIZE);
    const [width, setWidth] = useState(IMAGE_SIZE);
    const [positivePrompt, setPositivePrompt] = useState("");
    const [negetivePrompt, setNegetivePrompt] = useState("");

    const [inProgress, setInProgress] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        updateCheckpoint();
        Subscribe("dashboard", (event) => {
            const message = JSON.parse(event.data);
            // console.log(message);
            if (message.type === WS_MESSAGE_TYPE_EXECUTED) {
                setRand((prev) => Math.random());
                // TODO: set multiple images
                setImage((prev) => message.data.output.images[0].filename);
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

    const handleCFGChange = (value: number) => {
        setCfg((prev) => value); // Update the state with the new slider value
    };

    const handleStepsChange = (value: number) => {
        setSteps((prev) => value); // Update the state with the new slider value
    };

    const handleSelectChange = (event: any) => {
        setSelectedCheckpoint(event.target.value);
    };

    const handleRandomSeedChange = (event: any) => {
        setRandomSeed(event.target.checked);
    };

    const handleHeightChange = (sValue: string, value: number) => {
        setHeight(value);
    };

    const handleWidthChange = (sValue: string, value: number) => {
        setWidth(value);
    };

    const handlePositivePromptChange = (event: any) => {
        setPositivePrompt(event.target.value);
    };
    const handleNegetivePromptChange = (event: any) => {
        setNegetivePrompt(event.target.value);
    };

    return (
        <div className="text-xs text-black">
            <Stack direction="row" spacing={2} style={{ width: "100%" }}>
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
                    <AspectRatio
                        minWidth="80%"
                        maxW="80%"
                        ratio={1}
                        border="2px solid black"
                        p="4"
                        borderRadius="md"
                    >
                        <>
                            {/* TODO - edit url */}
                            {image && (
                                <Image
                                    // src={`/view?filename=${image}&type=output&rand=${rand}`}
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
                            {!image && <img src={base} alt="Red dot" />}
                        </>
                    </AspectRatio>
                </Box>
                <Box flex="1">
                    {/*<Spinner*/}
                    {/*    thickness='4px'*/}
                    {/*    speed='0.65s'*/}
                    {/*    emptyColor='gray.200'*/}
                    {/*    color='blue.500'*/}
                    {/*    size='xl'*/}
                    {/*/>*/}
                </Box>
            </Stack>
        </div>
    );
};

export default Dashboard;
