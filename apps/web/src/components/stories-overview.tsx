"use client";

import { useEffect, useMemo, useState } from "react";

import { useDemoSession } from "@/components/providers/demo-session";
import { Avatar, Panel, Pill, SectionTitle } from "@/components/ui/primitives";

const STORIES_STORAGE_KEY = "aura-demo-stories";

interface StoryPost {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  text: string;
  imageDataUrl?: string;
  createdAt: number;
}

const initialStories: StoryPost[] = [
  {
    id: "story_seed_1",
    authorId: "maya",
    authorName: "Maya Chen",
    authorRole: "Product lead",
    text: "Shipping the AI reply composer today with trust badges enabled.",
    createdAt: Date.now() - 1000 * 60 * 42
  },
  {
    id: "story_seed_2",
    authorId: "jordan",
    authorName: "Jordan Lee",
    authorRole: "Growth lead",
    text: "Launch prep is on track. Final QA starts at 3 PM and Arabic CTA review is still open.",
    createdAt: Date.now() - 1000 * 60 * 16
  }
];

function formatTime(createdAt: number) {
  const minutes = Math.max(1, Math.floor((Date.now() - createdAt) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
}

export function StoriesOverview() {
  const { user } = useDemoSession();
  const [stories, setStories] = useState<StoryPost[]>(initialStories);
  const [text, setText] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORIES_STORAGE_KEY);
    if (!stored) {
      window.localStorage.setItem(STORIES_STORAGE_KEY, JSON.stringify(initialStories));
      return;
    }

    try {
      setStories(JSON.parse(stored) as StoryPost[]);
    } catch {
      window.localStorage.setItem(STORIES_STORAGE_KEY, JSON.stringify(initialStories));
      setStories(initialStories);
    }
  }, []);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORIES_STORAGE_KEY || !event.newValue) return;
      try {
        setStories(JSON.parse(event.newValue) as StoryPost[]);
      } catch {
        // Ignore malformed demo storage values.
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const orderedStories = useMemo(
    () => [...stories].sort((a, b) => b.createdAt - a.createdAt),
    [stories]
  );

  const activeAuthors = useMemo(() => {
    const byAuthor = new Map<string, StoryPost>();
    orderedStories.forEach((story) => {
      if (!byAuthor.has(story.authorId)) {
        byAuthor.set(story.authorId, story);
      }
    });
    return Array.from(byAuthor.values());
  }, [orderedStories]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    setImageDataUrl(dataUrl);
  };

  const publishStory = () => {
    if (!text.trim() && !imageDataUrl) return;

    setIsPosting(true);
    const nextStory: StoryPost = {
      id: `story_${Date.now()}`,
      authorId: user.id,
      authorName: user.name,
      authorRole: user.role,
      text: text.trim(),
      imageDataUrl: imageDataUrl ?? undefined,
      createdAt: Date.now()
    };

    setStories((current) => {
      const nextStories = [nextStory, ...current];
      window.localStorage.setItem(STORIES_STORAGE_KEY, JSON.stringify(nextStories));
      return nextStories;
    });

    setText("");
    setImageDataUrl(null);
    setIsPosting(false);
  };

  return (
    <div className="space-y-4">
      <Panel className="p-6">
        <SectionTitle
          title="Stories and timeline"
          subtitle="Post quick text or photo stories and let the other demo user see them instantly, like a lightweight social wall."
          action={<Pill active>Shared demo feed</Pill>}
        />

        <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-white/50 bg-white/80 p-5 shadow-soft dark:border-white/10 dark:bg-slate-900/80">
            <div className="flex items-center gap-3">
              <Avatar name={user.name} />
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{user.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{user.role}</p>
              </div>
            </div>

            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={5}
              placeholder="Share an update, launch note, or quick photo story..."
              className="mt-5 w-full resize-none rounded-[1.5rem] border border-slate-200 bg-white px-4 py-4 text-sm text-slate-950 caret-aura-500 outline-none transition placeholder:text-slate-400 focus:border-aura-400 focus:bg-white dark:border-slate-700 dark:bg-white dark:text-slate-950 dark:placeholder:text-slate-500"
              style={{ color: "#020617", backgroundColor: "#ffffff" }}
            />

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                Upload photo
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
              <button
                type="button"
                onClick={publishStory}
                disabled={isPosting || (!text.trim() && !imageDataUrl)}
                className="rounded-2xl bg-aura-500 px-5 py-3 text-sm font-semibold text-white shadow-soft disabled:cursor-not-allowed disabled:bg-slate-400 dark:disabled:bg-slate-700"
              >
                Post story
              </button>
            </div>

            {imageDataUrl ? (
              <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-white/50 bg-slate-950/80">
                <img src={imageDataUrl} alt="Story upload preview" className="h-56 w-full object-cover" />
              </div>
            ) : null}
          </div>

          <div className="rounded-[2rem] border border-white/50 bg-white/80 p-5 shadow-soft dark:border-white/10 dark:bg-slate-900/80">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Active story ring</p>
            <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
              {activeAuthors.map((story) => (
                <div key={story.authorId} className="min-w-[84px] text-center">
                  <div className="mx-auto w-fit rounded-full bg-gradient-to-br from-aura-400 to-cyan-400 p-[2px]">
                    <div className="rounded-full bg-white p-1 dark:bg-slate-950">
                      <Avatar name={story.authorName} />
                    </div>
                  </div>
                  <p className="mt-2 text-xs font-medium text-slate-600 dark:text-slate-300">{story.authorName}</p>
                  <p className="text-[11px] text-slate-400">{formatTime(story.createdAt)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Panel>

      <Panel className="p-6">
        <SectionTitle
          title="Story wall"
          subtitle="Both demo users share the same timeline. Post in one tab and it appears for the other user too."
        />
        <div className="mt-6 space-y-4">
          {orderedStories.map((story) => (
            <article
              key={story.id}
              className="overflow-hidden rounded-[2rem] border border-white/50 bg-white/80 shadow-soft dark:border-white/10 dark:bg-slate-900/80"
            >
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="flex items-center gap-3">
                  <Avatar name={story.authorName} />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{story.authorName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {story.authorRole} • {formatTime(story.createdAt)}
                    </p>
                  </div>
                </div>
                <Pill active={story.authorId === user.id}>Story</Pill>
              </div>

              {story.imageDataUrl ? (
                <img src={story.imageDataUrl} alt={`${story.authorName} story`} className="h-[320px] w-full object-cover" />
              ) : null}

              {story.text ? (
                <div className="px-5 py-5">
                  <p className="text-sm leading-7 text-slate-700 dark:text-slate-200">{story.text}</p>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </Panel>
    </div>
  );
}
