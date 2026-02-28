"use client"
import getChannels from '@/data/getChannels';
import UploadForm from '@/components/videoUpload/upload';
import { useAuth } from '@/context/AuthProvider';
import React, { useEffect, useState } from 'react';

interface Channel {
  name: string;
}
type ChannelsOrError = Channel[] | { error: string };

export default function Page() {
  const user = useAuth()
  const [channels, setChannels] = useState<ChannelsOrError>([]);
  useEffect(() => {
    if (!user) return;
    const fetchChannels = async () => {
      const channels = await getChannels();
      setChannels(channels);
    };
    fetchChannels();
  }, [user]);
  return <UploadForm channels={channels} />;
}