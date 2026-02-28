"use client"
import { createContext, useContext, useState } from "react"
import { channelType } from "@/types/channel";
interface ChannelContextType {
    channels: channelType[] | undefined;
    setChannels: (channels: channelType[] | undefined)=>void;
    selectedChannel: channelType | null;
    setSelectedChannel: (channel: channelType | null) => void;
}
const ChannelContext = createContext<ChannelContextType | undefined>(undefined);

const ChannelContextProvider = ({children, initialValue}:{children: React.ReactNode, initialValue: channelType[] | undefined})=>{
    const [channels, setChannels] = useState<channelType[] | undefined>(initialValue);
    const [selectedChannel, setSelectedChannel] = useState<channelType | null>(channels?.[0] || null);
  return (
    <ChannelContext.Provider value={{ channels, setChannels, selectedChannel, setSelectedChannel }}>
      {children}
    </ChannelContext.Provider>
  )
}


function useChannels(){
    const context = useContext(ChannelContext);
    if(context == undefined){
        throw new Error("Use Channels must be used inside the Channel Provider");
    }
    return context;
}

export {ChannelContextProvider, useChannels}