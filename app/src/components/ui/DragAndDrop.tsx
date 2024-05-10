import { useDropzone } from "react-dropzone";

const DragAndDrop = ({
    addBaseImage: addBaseImage,
    message = "Upload your own image",
}: {
    addBaseImage: Function;
    message: string;
}) => {
    const onDrop = (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file.size > 3 * 1024 * 1024) {
            alert("Please upload file under 3MB!");
            return;
        }
        addBaseImage(URL.createObjectURL(file));
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
            className={`w-min-20 w-full border-dashed border focus:outline-none focus:ring-0 hover:cursor-pointer ${
                isDragActive ? "border-black" : `border-black border-opacity-30`
            }`}
        >
            <input {...getInputProps()} />
            <p className="p-2 text-2xs text-center font-normal">
                {`${message} (Max: 3MB)`}
            </p>
        </div>
    );
};
export default DragAndDrop;
