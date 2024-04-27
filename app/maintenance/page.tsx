"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import api from "@/lib/api/config";
import { UpdateIcon } from "@radix-ui/react-icons";

import { AnimatePresence, motion, delay } from "framer-motion";
import { cx } from "class-variance-authority";

export default function MaintenancePage() {
  const router = useRouter();
  const [status, setStatus] = useState<
    "online" | "maintenance" | "offline" | "loading"
  >("loading");

  const availableEmojis = useMemo(
    () => ["😵‍💫", "💀", "🛠", "🤕", "🧰", "🚧", "💔", "😭"],
    []
  );

  const [emojis, setEmojis] = useState<Array<(typeof availableEmojis)[number]>>(
    []
  );

  const generateEmojis = useCallback(() => {
    const randomEmoji =
      availableEmojis[Math.floor(Math.random() * availableEmojis.length)];

    setEmojis((prevEmojis) => [...prevEmojis, randomEmoji]);

    const timeout = setTimeout(() => {
      setEmojis((prevEmojis) => prevEmojis.slice(0, -1));
    }, 1000);

    return () => clearTimeout(timeout);
  }, [availableEmojis]);

  const checkMaintenance = useCallback(async () => {
    setStatus("loading");

    try {
      await api.get("/status");

      setStatus("online");
      router.replace("/");
    } catch (e: any) {
      console.log(e?.request?.status);

      if (e?.request?.status === 503) {
        generateEmojis();
        return setStatus("maintenance");
      }

      setStatus("offline");
    }
  }, [router, generateEmojis]);

  return (
    <div className="flex-1 flex justify-center items-center">
      <div className="flex flex-col items-center gap-9">
        <div className="flex flex-col items-center gap-3">
          <h1 className="font-medium text-2xl">{"We're under maintenace."}</h1>
          <div className="text-muted-foreground text-sm text-center">
            <p>GPT-4 Max is currently under maintenance.</p>
            <p className="text-balance">We are working hard to bring GPT-4 Max back online.</p>
          </div>
        </div>

        <div className="relative">
          <Button onClick={checkMaintenance} className="relative z-10 gap-0.5">
            <motion.span>
              <UpdateIcon width={20} />
            </motion.span>
            Refresh
          </Button>
          <div className="flex justify-center w-full">
            <AnimatePresence>
              {emojis.map((emoji, index) => (
                <motion.span
                  key={index}
                  initial={{ scale: 0.8, y: 0 }}
                  animate={{ scale: 1.4, y: -28 }}
                  exit={{ scale: 0.8, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cx`absolute top-0 text-lg`}
                >
                  {emoji}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}