import { useDropzone } from "react-dropzone";

const DragAndDrop = ({
    setImage: setImage,
    message = "Upload your own image",
}: {
    setImage: Function;
    message: string;
}) => {
    const keyColor = "#AAAAAA";
    const onDrop = (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file.size > 3 * 1024 * 1024) {
            alert("Please upload file under 3MB!");
            return;
        }
        setImage(URL.createObjectURL(file));
    };
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
        accept: {
            "image/jpeg": [],
            "image/png": [],
        },
    });

    return (
        <div
            {...getRootProps()}
            className={`w-min-20 w-full border-dashed border text-[${keyColor}] ${
                isDragActive ? "border-black" : `border-[${keyColor}]`
            } focus:outline-none focus:ring-0 hover:cursor-pointer`}
        >
            <input {...getInputProps()} />
            <p className="p-4 text-2xs text-center font-normal">
                {message}
                <br />
                (Under 3MB)
            </p>
        </div>
    );
};
export default DragAndDrop;
