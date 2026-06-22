import { useTranslation } from "react-i18next";
import { useRouter } from "@/router/router";
import ProfileCard from "@/components/reactbits/ProfileCard";
import myPhoto from "@/assets/ivan.png";

/**
 * "Read CV" entry point — a 3D tilt ProfileCard (React Bits). Its contact
 * button opens the full CV at /about/cv.
 *
 * TODO(next iteration): on click, scale this card up seamlessly INTO the full
 * CV page (igloo.inc-style zoom) instead of the instant overlay.
 */
export function DownloadButton() {
  const { t } = useTranslation();
  const { navigate } = useRouter();

  return (
    <div className="mt-12 flex justify-center">
      <ProfileCard
        avatarUrl={myPhoto}
        name="Ivan Holovko"
        title={t("cv.role")}
        handle="ivan-holovko"
        status="Available"
        contactText={t("about.readCv")}
        showUserInfo
        enableTilt
        enableMobileTilt
        onContactClick={() => navigate("/about/cv")}
      />
    </div>
  );
}
