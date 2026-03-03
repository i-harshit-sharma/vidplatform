"use client";

import { useChannels } from '@/context/ChannelContext';
import Link from 'next/link';
import React, { useState, useRef, useActionState, useEffect } from 'react';
import updateChannel from '@/actions/updateChannel';
import getUploadURL from '@/actions/getUploadURL';

interface FieldProps {
  id: string;
  name: string;
  label: string;
  placeholder?: string;
  defaultValue?: string;
  hint?: string;
  isTextArea?: boolean;
}

const Field = ({ id, name, label, placeholder, defaultValue, hint, isTextArea }: FieldProps) => {
  const InputElement = isTextArea ? 'textarea' : 'input';

  return (
    <div className="group">
      <label
        htmlFor={id}
        className="block text-xs font-semibold uppercase tracking-widest text-stone-400 mb-1.5 group-focus-within:text-orange-500 transition-colors"
      >
        {label}
      </label>
      <InputElement
        id={id}
        name={name}
        type={!isTextArea ? "text" : undefined}
        rows={isTextArea ? 3 : undefined}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-stone-800 placeholder-stone-300 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all shadow-sm resize-none"
      />
      {hint && <p className="mt-1.5 text-xs text-stone-400">{hint}</p>}
    </div>
  );
};

interface ImageUploaderProps {
  id: string;
  name: string;
  label?: string;
  hint?: string;
  shape?: 'square' | 'circle';
  existingUrl?: string;
}

const ImageUploader = ({ id, name, label, hint, shape = 'square', existingUrl }: ImageUploaderProps) => {
  const [preview, setPreview] = useState(existingUrl || null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync preview if existingUrl changes remotely
  useEffect(() => {
    if (existingUrl) setPreview(existingUrl);
  }, [existingUrl]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      // Manually assign file to input to ensure it gets sent with FormData
      if (inputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        inputRef.current.files = dataTransfer.files;
      }
    }
  };

  const isCircle = shape === 'circle';

  return (
    <div className="group">
      <label className="block text-xs font-semibold uppercase tracking-widest text-stone-400 mb-1.5 group-focus-within:text-orange-500 transition-colors">
        {label}
      </label>

      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        tabIndex={0}
        role="button"
        aria-label={`Upload ${label}`}
        className={`
          relative cursor-pointer border-2 border-dashed border-stone-200 hover:border-orange-300 focus:border-orange-400 focus:outline-none
          bg-stone-50 hover:bg-orange-50/40 transition-all overflow-hidden
          flex items-center justify-center
          ${isCircle ? 'w-24 h-24 rounded-full' : 'w-full h-36 rounded-xl'}
        `}
      >
        {preview ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={preview}
            alt={`${label || 'Image'} Preview`}
            className={`w-full h-full object-cover ${isCircle ? 'rounded-full' : ''}`}
          />
        ) : (
          <div className="flex flex-col items-center gap-1.5 p-4 text-center">
            <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
            </div>
            {!isCircle && <p className="text-xs text-stone-400 leading-tight">Drop image or <span className="text-orange-500 font-medium">browse</span></p>}
          </div>
        )}

        {preview && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setPreview(null);
              if (inputRef.current) inputRef.current.value = '';
            }}
            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors focus:ring-2 focus:ring-orange-400"
            aria-label="Remove image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Added 'name' so this field is captured by the form action */}
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept="image/*"
        onChange={handleFile}
        className="hidden"
        id={id}
      />
      {hint && <p className="mt-1.5 text-xs text-stone-400">{hint}</p>}
    </div>
  );
};

const AutoGeneratedChannel = () => {
  const { channels, selectedChannel, setChannels } = useChannels();
  const currentChannel = selectedChannel !== null ? channels?.find(c => c._id === selectedChannel) : null;
  const [state, formAction, pending] = useActionState(updateChannel, { success: false, data: null });
  const [isUploading, setIsUploading] = useState(false);


  useEffect(() => {
    if ('success' in state && state.success && state.data) {
      setChannels(((prev: any) => {
        if (!prev) return [state.data];
        return prev.map((ch: any) => ch?._id === state.data._id ? state.data : ch);
      }) as any);
    }
  }, [state]);

  const actionWrapper = async (formData: FormData) => {
    setIsUploading(true);

    try {
      // 1. Handle Profile Picture Upload
      const profilePic = formData.get('profilePic') as File | null;
      if (profilePic && profilePic.size > 0) {
        const ext = profilePic.name.split('.').pop() || 'jpeg';
        // Get the presigned URL
        console.log("Requesting upload URL for profile picture:", profilePic.type);
        const uploadUrlResponse = await getUploadURL(profilePic.name, ext, profilePic.type);

        if ('error' in uploadUrlResponse) {
          throw new Error(uploadUrlResponse.error);
        }

        const { signedUrl, uploadFileName } = uploadUrlResponse;

        // Upload directly to R2
        const publicProfilePicURL = await fetch(signedUrl, {
          method: 'PUT',
          body: profilePic,
          headers: { 'Content-Type': profilePic.type },
        });


        // Replace the File object with the public URL string in the form data
        formData.set('profilePicUrl', uploadFileName);
      }
      formData.delete('profilePic'); // Prevent sending the heavy file object to the Next.js server

      // 2. Handle Banner Upload
      const banner = formData.get('bannerPic') as File | null;
      if (banner && banner.size > 0) {
        const ext = banner.name.split('.').pop() || 'jpeg';
        const uploadUrlResponse = await getUploadURL(banner.name, ext, banner.type);

        if ('error' in uploadUrlResponse) {
          throw new Error(uploadUrlResponse.error);
        }

        const { signedUrl, uploadFileName } = uploadUrlResponse;

        const publicBannerURL = await fetch(signedUrl, {
          method: 'PUT',
          body: banner,
          headers: { 'Content-Type': banner.type },
        });

        formData.set('bannerUrl', uploadFileName);
      }
      formData.delete('bannerPic');

      // 3. Dispatch the final FormData to your server action
      // React 19's startTransition isn't strictly necessary here if we call formAction directly,
      // but it ensures the `pending` state of useActionState triggers correctly.
      React.startTransition(() => {
        formAction(formData);
      });

    } catch (error) {
      console.error("Failed to upload assets:", error);
      // You might want to set an error state here to show a toast to the user
    } finally {
      setIsUploading(false);
    }
  };

  const isBusy = isUploading || pending;

  return (
    <div className="min-h-screen bg-stone-50 flex items-start justify-center py-16 px-4"
      style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #d6d3d1 1px, transparent 0)', backgroundSize: '24px 24px' }}
    >
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-semibold text-amber-600 tracking-wide">Auto-generated channel</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-800 leading-snug">
            Complete your channel setup
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            This channel was created automatically. Fill in the details below — you can always update them later.
          </p>
        </div>

        {/* Form Card */}
        <form action={actionWrapper}>
          <input type="hidden" name="channelId" value={currentChannel?._id || ''} />
          <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-8 pb-8 pt-4 space-y-5">

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Field
                    id="channelName"
                    name="channelName"
                    label="Channel Name"
                    placeholder="My Awesome Channel"
                    defaultValue={currentChannel?.name}
                  />
                </div>
                <div className="col-span-2">
                  <Field
                    id="channelAbout"
                    name="channelAbout"
                    label="About"
                    isTextArea
                    placeholder="What's this channel about?"
                    defaultValue={currentChannel?.about}
                  />
                </div>
                <div className="col-span-2">
                  <Field
                    id="channelSlug"
                    name="channelSlug"
                    label="Slug"
                    placeholder="my-awesome-channel"
                    defaultValue={currentChannel?.slug}
                    hint="Used in your channel URL. Lowercase, numbers, and hyphens only."
                  />
                </div>
              </div>

              {/* Media uploads */}
              <div className="border-t border-stone-100 pt-5 space-y-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 -mb-1">Media uploads</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <ImageUploader
                      id="profilePic"
                      name="profilePic"
                      label="Profile Picture"
                      shape="circle"
                      existingUrl={currentChannel?.profile_picture_url}
                    />
                  </div>
                  <div>
                    <ImageUploader
                      id="banner"
                      name="bannerPic"
                      label="Banner Image"
                      shape="square"
                      existingUrl={currentChannel?.banner_url}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isBusy}
                  className="flex-1 flex justify-center bg-orange-500 hover:bg-orange-400 active:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed text-white font-semibold text-sm py-3 px-6 rounded-xl transition-colors shadow-sm shadow-orange-200"
                >
                  {isBusy ?
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {isUploading ? "Uploading assets..." : "Saving..."}
                    </span>
                    : "Save changes"}
                </button>
                <Link
                  href="/"
                  className="flex-1 text-center bg-stone-100 hover:bg-stone-200 text-stone-600 font-semibold text-sm py-3 px-6 rounded-xl transition-colors"
                >
                  Cancel
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AutoGeneratedChannel;