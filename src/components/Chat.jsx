import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";

export default function Chat() {
    const [socket, setSocket] = useState(null);
    const [userId, setUserId] = useState(null);
    const [text, setText] = useState([{owner:"",text:""}]);
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [text]);

    useEffect(() => {
        // Initialize userId from sessionStorage
        let storedUserId = sessionStorage.getItem('userId');
        if (!storedUserId) {
            storedUserId = Math.floor(Math.random() * 1000000).toString();
            sessionStorage.setItem('userId', storedUserId);
        }
        setUserId(storedUserId);

        // Initialize socket with userId
        const newSocket = io("wss://diwash.ddns.net/chat",{
            path: "/socket.io",
            cors: {
                origin: "*",
            },
            query: { user_id: storedUserId },
            transports:["websocket"],
            reconnectionAttempts: Infinity
        }).off("/chat");
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
        if (!socket) return;
        if(text[text.length - 1].owner !== "user") return;
        setIsLoading(true);
        socket.emit("chat", text[text.length - 1]);
    }, [text]);
    const handleSend = () => {
        if (!message.trim()) return;
        setText(prev => [...prev, { owner: "user", text: message }]);
        setMessage("");
    };

    return (
        <div className="flex flex-col h-[calc(100vh-2rem)] w-[95%] sm:w-[500px] mx-auto p-2 sm:p-4">
            <h1 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4">Chat</h1>
            <div className="flex-1 overflow-y-auto mb-2 sm:mb-4 bg-gray-50 rounded-lg p-2 sm:p-4 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-200">
                <div className="space-y-2 sm:space-y-4">
                    {text.map((message, index) => (
                        <div key={index} 
                             className={`flex ${message.owner === "user" ? "justify-end" : "justify-start"}`}> 
                            <div className={`max-w-[85%] sm:max-w-[70%] rounded-lg p-2 sm:p-3 ${
                                message.owner === "user"
                                    ? "bg-blue-500 text-white" 
                                    : "bg-gray-200 text-gray-800"
                            }`}>
                                <div className="text-xs sm:text-sm opacity-75 mb-1">
                                    {message.owner === "user"? 'You' : 'Bot'}
                                </div>
                                <div className="break-words text-sm sm:text-base">{message.text}</div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="max-w-[85%] sm:max-w-[70%] rounded-lg p-2 sm:p-3 bg-gray-200 text-gray-800">
                                <div className="text-xs sm:text-sm opacity-75 mb-1">bot</div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
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
                    className="flex-1 text-sm sm:text-base"
                />
                <Button onClick={handleSend} className="bg-blue-500 hover:bg-blue-600 px-3 sm:px-4">
                    Send
                </Button>
            </div>
        </div>
    );
}
