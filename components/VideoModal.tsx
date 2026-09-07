"use client";
import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import Modal from "@/components/ui/Modal";
import { VIDEO_OPEN, useWindowEvent, type VideoOpenPayload } from "@/lib/events";
import styles from "./VideoModal.module.css";

export default function VideoModal() {
  const t = useTranslations("modal.video");
  const [video, setVideo] = useState<VideoOpenPayload | null>(null);
  const [failed, setFailed] = useState(false);

  useWindowEvent<VideoOpenPayload>(VIDEO_OPEN, useCallback((d) => { setFailed(false); setVideo(d); }, []));
  const close = useCallback(() => setVideo(null), []);

  const portrait = video?.orientation === "portrait";
  const maxWidth = portrait ? "min(92vw, calc((100vh - 32px) * 9 / 16))" : "min(92vw, calc((100vh - 32px) * 16 / 9))";

  return (
    <Modal open={!!video} onClose={close} labelledBy="video-title" tone="dark" maxWidth={maxWidth} closeLabel={t("close")}>
      {video && (
        <div className={styles.frame}>
          <h2 id="video-title" className="u-visually-hidden">{video.title}</h2>
          {failed ? (
            <p className={styles.fallback}>
              {t("unavailable")} <a href={video.src} target="_blank" rel="noopener noreferrer">{t("openDirect")}</a>
            </p>
          ) : (
            <video
              className={styles.video}
              src={video.src}
              poster={video.poster}
              controls
              autoPlay
              playsInline
              onError={() => setFailed(true)}
            />
          )}
        </div>
      )}
    </Modal>
  );
}
