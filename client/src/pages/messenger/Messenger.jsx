import TopBar from "../../components/topbar/TopBar";
import "./messenger.css";
import React, { useContext, useEffect, useRef, useState } from 'react';
import Conversation from "../../components/conversations/Conversation";
import Message from "../../components/message/Message";
import ChatOnline from "../../components/chatOnline/ChatOnline";
import { AuthContext } from "../../context/AuthContext";
import {axiosInstance} from "../../utils/axiosInstance";
import {io} from "socket.io-client"

export default function Messenger() {
    const [conversations , setConversations] = useState([]);
    const [currentChat , setCurrentChat] = useState(null);
    const [messages , setMessages] = useState([]);
    const [newMessage , setNewMessage] = useState("");
    const [arrivalMessage , setArrivalMessage] = useState(null);
    const [onlineUsers , setOnlineUsers] = useState([]);
    const [chatPartnerName, setChatPartnerName] = useState("");
    const socket = useRef()
    const {user} = useContext(AuthContext);
    const scrollRef = useRef();

    useEffect(()=>{
        socket.current = io("ws://localhost:8900");
        socket.current.on("getMessage", (data) =>{
            setArrivalMessage({
                sender : data.senderId,
                text : data.text,
                createdAt : Date.now(),
            })
        })
    },[])

    useEffect(() =>{
        arrivalMessage && currentChat?.members.includes(arrivalMessage.sender) && setMessages((prev) => [...prev, arrivalMessage])
    },[arrivalMessage, currentChat]);

    useEffect(()=>{
        socket.current.emit("addUser", user._id);
        socket.current.on("getUsers", (users) =>{
            setOnlineUsers(user.followings.filter((f) => users.some((u) => u.userId === f)))
        })
    },[user])

    const getConversation = async () =>{
        try {
            const res = await axiosInstance.get("/conversations/" + user._id);
            setConversations(res.data);
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(()=>{
       if(user){
        getConversation();
       }
    },[user])
    
    
    useEffect(()=>{
        const getMessages = async () =>{

            try {
                const res = await axiosInstance.get("/messages/"+ currentChat?._id);
                setMessages(res.data);
                
            } catch (error) {
                console.log(error)
            }
        };
        getMessages();
    },[currentChat]);


    useEffect(()=>{
        scrollRef.current?.scrollIntoView({behavior : "smooth"})
    }, [messages]);

    useEffect(() => {
        const getChatPartnerName = async () => {
            if (currentChat) {
                const chatPartnerId = currentChat.members.find((m) => m !== user._id);
                try {
                    const res = await axiosInstance.get(`/users?userId=${chatPartnerId}`);
                    setChatPartnerName(res.data.username);
                } catch (error) {
                    console.log(error);
                }
            }
        };
        getChatPartnerName();
    }, [currentChat, user._id]);
 
    const handleSubmit = async (e) =>{
        e.preventDefault();
        const message = {
            sender : user._id,
            text : newMessage,
            conversationId : currentChat._id,
        };
        const receiverId = currentChat.members.find((member) => member !== user._id)

        socket.current.emit("sendMessage", {
            senderId : user._id,
            receiverId ,
            text : newMessage
        })
        try {
            const res = await axiosInstance.post("/messages",message);
            setMessages([...messages,res.data]);
            setNewMessage("");
        } catch (error) {
            console.log(error)
        }

    }


   console.log(currentChat)
  return (
  <>
   <TopBar/>
    <div className="messenger">
        <div className="chatMenu">
            <div className="chatMenuWrapper">
               <input type="text" placeholder="Search for friends" className="chatMenuInput"/>
              {conversations.map((c) =>(
                <div onClick={() => setCurrentChat(c)} key={c._id}>
                  <Conversation conversation = {c} currentUser = {user} />
                </div>
              ))}
             
            </div>
        </div>
        <div className="chatBox">
            <div className="chatBoxWrapper">
                {currentChat ? 
                <>   
                      {currentChat && chatPartnerName && (
                        <div className="chatBoxHeader">
                            <h3>{chatPartnerName}</h3>
                        </div>
                    )}
                     <div className="chatBoxTop">
                        {messages.map((m) =>(
                            <div ref={scrollRef}  key={m._id}>
                                <Message message = {m} own ={m.sender === user._id}/>
                            </div>
                        ))}
                    
                     </div>
                     <div className="chatBoxBottom">
                    <textarea placeholder="write something..."  className="chatMessageInput" onChange={(e) => setNewMessage(e.target.value)} value={newMessage}>

                    </textarea>
                    <button className="chatSubmitBtn" onClick={handleSubmit}>Send</button>
                    </div>
                </>
               : <span className="noConversationText">Open a conversation to start a chat.</span>}
            </div>
        </div>
        <div className="chatOnline">
            <div className="chatOnlineWrapper">
                <ChatOnline onlineUsers ={onlineUsers} currentId ={user._id} setCurrentChat={setCurrentChat} refreshConversations={getConversation} />
            </div>
        </div>
    </div>
  </>
  )
}
