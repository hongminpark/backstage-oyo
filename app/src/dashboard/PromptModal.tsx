import { useState } from "react";
// import EditableSpan from "./EditableSpan";

const PromptModal = ({ addImage, isGenerating, setIsGenerating }) => {
    // Positive prompts
    const [gender, setGender] = useState("");
    const [ethnicity, setEthnicity] = useState("");
    const [skin, setSkin] = useState("");
    const [eyes, setEyes] = useState("");
    const [hair, setHair] = useState("");
    const [expression, setExpression] = useState("");
    const [additionalTags, setAdditionalTags] = useState([]);
    const [hiddenTags, setHiddenTags] = useState([
        "face portrait",
        "grey color background",
        "topless",
        "eyes detail",
        "Best quality",
        "Film Grain",
        "Outfocusing",
        "photorealistic",
    ]);
    const [isHiddenTagVisible, setIsHiddenTagVisible] = useState(false);

    const [poseImage, setPoseImage] = useState();
    const [keepFace, setKeepFace] = useState(false);
    const [seed, setSeed] = useState(Math.floor(Math.random() * 4294967296));
    const prompt_neg =
        "embedding:easynegative, embedding:bad_prompt_version2-neg, embedding:ng_deepnegative_v1_75t, Earrings, Necklaces, Monochrome, nsfw, underwear, teeth, breast, nipples";

    const createPrompt = () => {
        let parts = [
            gender,
            ethnicity,
            skin,
            hair,
            eyes,
            expression,
            ...hiddenTags,
            ...additionalTags,
        ];

        return parts.filter(Boolean).join(", ");
    };

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    return (
        <div className="flex flex-col gap-6 w-full">
            <div className="flex flex-col gap-2">
                <div className="font-bold text-sm">Prompt</div>
                <div className="w-full flex flex-row flex-wrap gap-2 justify-start items-center">
                    <DescriptionTag
                        tagName="Gender"
                        options={["woman", "man"]}
                        value={gender}
                        setValue={setGender}
                    />
                    <DescriptionTag
                        tagName="Ethnicity"
                        options={[
                            "Caucasian",
                            "African",
                            "Asian",
                            "Hispanic",
                            "Middle Eastern",
                        ]}
                        value={ethnicity}
                        setValue={setEthnicity}
                    />
                    <DescriptionTag
                        tagName="Skin"
                        options={[
                            "Fair skin",
                            "Olive kin",
                            "Tanned",
                            "Brown skin",
                            "Dark skin",
                            "freckles",
                        ]}
                        value={skin}
                        setValue={setSkin}
                    />
                    <DescriptionTag
                        tagName="Eyes"
                        options={[
                            "Blue eyes",
                            "Brown eyes",
                            "Green eyes",
                            "Black eyes",
                            "Grey eyes",
                        ]}
                        value={eyes}
                        setValue={setEyes}
                    />
                    <DescriptionTag
                        tagName="Hair"
                        options={[
                            "Short hair",
                            "Buzz",
                            "Curly hair",
                            "Long Straight hair",
                            "Bald",
                            "Wavy hair",
                        ]}
                        value={hair}
                        setValue={setHair}
                    />
                    <DescriptionTag
                        tagName="Expression"
                        options={[
                            "Neutral",
                            "Smiling",
                            "Serious",
                            "Surprised",
                            "Sad",
                        ]}
                        value={expression}
                        setValue={setExpression}
                    />
                    {additionalTags.map((tag, index) => (
                        <EmptyTag
                            key={index}
                            value={tag}
                            setValue={(newValue) => {
                                const newTags = [...additionalTags];
                                newTags[index] = newValue;
                                setAdditionalTags(newTags);
                            }}
                        />
                    ))}
                    <button
                        className="w-min-20 w-max py-1 px-2 border box-border border-gray-400 bg-white hover:border-black hover:text-black font-normal text-2xs text-gray-400 flex justify-between items-center"
                        onClick={() =>
                            setAdditionalTags([
                                ...additionalTags,
                                "Type additional prompt",
                            ])
                        }
                    >
                        <span>{"+"}</span>
                    </button>
                    <div className="flex-grow"></div>
                    <span
                        className={`hover:cursor-pointer transition-transform duration-300 ${
                            isHiddenTagVisible ? "transform rotate-180" : ""
                        }`}
                        onClick={() =>
                            setIsHiddenTagVisible(!isHiddenTagVisible)
                        }
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 16 16"
                            fill="currentColor"
                            className="w-4 h-4"
                        >
                            <path
                                fillRule="evenodd"
                                d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </span>
                </div>

                {isHiddenTagVisible && (
                    <div className="w-full flex flex-row gap-2 flex-wrap">
                        {hiddenTags.map((tag, index) => (
                            <EmptyTag
                                key={index}
                                value={tag}
                                setValue={(newValue) => {
                                    const newTags = [...hiddenTags];
                                    newTags[index] = newValue;
                                    setHiddenTags(newTags);
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="flex flex-row gap-2 justify-start items-center">
                <div className="font-bold text-sm w-max">Keep face</div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={keepFace}
                        onChange={() => setKeepFace(!keepFace)}
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all  peer-checked:bg-black" />
                </label>
            </div>
            <div className="flex flex-col gap-2 justify-start text-gray-400">
                <div className="font-bold text-sm w-max">Reference Image</div>
                <div className="font-bold text-sm w-max">Upscale</div>
                <div className="font-bold text-sm w-max">Outpaint</div>
            </div>
            <div className="flex flex-col gap-2">
                <button
                    className="relative border border-black px-2 py-1 w-max hover:bg-black hover:text-white bg-white font-normal text-sm flex items-center justify-center"
                    // onClick={callNextjsAPI}
                >
                    Generate
                    {isGenerating && (
                        <span className="absolute flex h-3 w-3 right-0 top-0 transform translate-x-1/2 -translate-y-1/2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-black"></span>
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
};
const DescriptionTag = ({ tagName, value, setValue, options }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    return isEditing || value ? (
        <></>
    ) : (
        // <Dropdown
        //     label={tagName}
        //     items={options}
        //     selectedItem={value}
        //     setSelectedItem={setValue}
        //     isEditing={isEditing}
        //     setIsEditing={setIsEditing}
        // />
        <button
            className="w-min-20 w-max py-1 px-2 border box-border border-gray-400 bg-white hover:border-black hover:text-black font-normal text-2xs text-gray-400 flex justify-between items-center"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => {
                setValue(options[0]);
            }}
        >
            <span>{tagName}</span>
            <span className={`${isHovered ? "opacity-100" : "opacity-0"} ml-1`}>
                {"+"}
            </span>
        </button>
    );
};

const EmptyTag = ({ value, setValue }) => {
    const [isEditing, setIsEditing] = useState(false);

    return (
        <button
            className={`w-min-20 w-max py-1 px-2 border box-border bg-white hover:border-black hover:text-black font-normal text-2xs flex justify-between items-center ${
                value || isEditing
                    ? "border-black text-black"
                    : "border-gray-400 text-gray-400 "
            }`}
        >
            {/* <EditableSpan
                label={"label"}
                value={value}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                onChange={(newValue) => setValue(newValue)}
            /> */}
        </button>
    );
};

export default PromptModal;
