import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";

export default function Chat() {
    const [socket, setSocket] = useState(null);
    const [text, setText] = useState([{owner:"",text:""}]);
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [text]);

    useEffect(() => {
        const newSocket = io("http://localhost:8001/chat");
        setSocket(newSocket);
        return () => newSocket?.disconnect();
    }, []);

    useEffect(() => {
        if (!socket) return;
        const handleResponse = (botResponse) => {
            setText(prev => [...prev, {owner: "bot", text: botResponse.message}]);
            setIsLoading(false);
        };
        socket.on("response", handleResponse);
        return () => socket.off("response", handleResponse);
    }, [socket]);

    useEffect(() => {
        if(text[text.length - 1].owner === "user") {
            setIsLoading(true);
            socket?.emit("chat", text[text.length-1]);
        }
    }, [text]);

    const handleSend = () => {
        if (!message.trim()) return;
        setText(prev => [...prev, { owner: "user", text: message }]);
        setMessage("");
    };

    return (
        <div className="flex flex-col h-[800px] w-[500px] mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Chat</h1>
            <div className="flex-1 overflow-y-auto mb-4 bg-gray-50 rounded-lg p-4 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-200">
                <div className="space-y-4">
                    {text.map((message, index) => (
                        <div key={index} 
                             className={`flex ${message.owner === "user" ? "justify-end" : "justify-start"}`}> 
                            <div className={`max-w-[70%] rounded-lg p-3 ${
                                message.owner === "user" 
                                    ? "bg-blue-500 text-white" 
                                    : "bg-gray-200 text-gray-800"
                            }`}>
                                <div className="text-sm opacity-75 mb-1">{message.owner}</div>
                                <div className="break-words">{message.text}</div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="max-w-[70%] rounded-lg p-3 bg-gray-200 text-gray-800">
                                <div className="text-sm opacity-75 mb-1">bot</div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            <div className="flex gap-2">
                <Input 
                    value={message} 
                    onChange={e => setMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="Send a message" 
                    className="flex-1"
                />
                <Button onClick={handleSend} className="bg-blue-500 hover:bg-blue-600">
                    Send
                </Button>
            </div>
        </div>
    );
}
