
interface FullPageErrorProps {
    message: string;
}

const FullPageError: React.FC<FullPageErrorProps> = ({ message }) => {
    return (
        <div className="w-full h-screen flex items-center justify-center bg-red-50">
            <div className="bg-red-100 border border-red-300 text-red-700 px-8 py-6 rounded-lg text-center shadow-lg max-w-xl">
                <p className="text-lg font-semibold">{message}</p>
            </div>
        </div>
    );
};

export default FullPageError;