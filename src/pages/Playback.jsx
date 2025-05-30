import Header from "../components/Header";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { getVibeById } from "../utils/indexedDB";
import { deleteVibe } from "../utils/indexedDB";
import { exportVibe } from "../utils/indexedDB";
import { MdDeleteOutline } from "react-icons/md";
import { BsFiletypeHtml } from "react-icons/bs";
import DeleteConfirmationModal from "../modal/DeleteConfirmationModal";
import { CiExport } from "react-icons/ci";
import { IoReturnDownBackSharp } from "react-icons/io5";
import vidBg from "../assets/black.jpg";
import Footer from "../components/Footer";
import { exportMiniSite } from "../utils/miniSite";

const Playback = () => {
  const [vibe, setVibe] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentMediaUrl, setCurrentMediaUrl] = useState("");
  const audioRef = useRef(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const colors = [
    "text-primary",
    "text-red-500",
    "text-green-500",
    "text-orange-500",
  ];

  useEffect(() => {
    const getVibe = async () => {
      const vibe = await getVibeById(id);
      setVibe(vibe);
      console.log(vibe);
    };
    getVibe();
  }, [id]);

  useEffect(() => {
    const currentMedia = vibe?.media?.[currentIndex];
    if (!currentMedia) return;

    if (audioRef.current) {
      audioRef.current.volume = currentMedia.type.startsWith("video/")
        ? 0.1
        : 1;
    }

    if (currentMedia.type.startsWith("image/")) {
      const timer = setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % vibe.media.length);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [vibe, currentIndex]);

  useEffect(() => {
    let objectUrl;

    if (vibe?.media?.[currentIndex]?.file instanceof Blob) {
      objectUrl = URL.createObjectURL(vibe.media[currentIndex].file);
      setCurrentMediaUrl(objectUrl);
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [vibe, currentIndex]);

  const handleDelete = () => {
    deleteVibe(id);
    setIsModalOpen(false);
    navigate("/");
  };

  const exportCapsule = async () => {
    const jsonStr = await exportVibe(vibe);

    const blob = new Blob([jsonStr], { type: "application/json" });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = vibe?.title;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center h-full w-full gap-5 py-10 mt-[120px]">
        <div className="flex flex-row gap-5 items-center justify-between pl-5 border-l-8 h-[40px] w-[90%] border-primary">
          <div
            className="flex flex-row gap-1 items-center hover:text-primary cursor-pointer"
            onClick={() => navigate("/")}
          >
            <IoReturnDownBackSharp className="text-xl hover:text-primary cursor-pointer" />
            <p className="hidden sm:block">Back</p>
          </div>
          <div className="flex flex-row items-center gap-5">
            <div
              className="flex flex-row gap-1 items-center hover:text-primary cursor-pointer"
              onClick={() => setIsModalOpen(true)}
            >
              <MdDeleteOutline />
              <p className="hidden sm:block">Delete Weave</p>
            </div>
            <div
              className="flex flex-row gap-1 items-center hover:text-primary cursor-pointer"
              onClick={() => exportCapsule()}
            >
              <CiExport />
              <p className="hidden sm:block">Export Weave</p>
            </div>
            <div
              className="flex flex-row gap-1 items-center hover:text-primary cursor-pointer"
              onClick={() => exportMiniSite(vibe)}
            >
              <BsFiletypeHtml />
              <p className="hidden sm:block">Export as Mini-Site</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-6 w-[95%] gap-5 sm:gap-0">
          <div className="w-full flex flex-col items-center gap-3 sm:gap-10 col-span-1 sm:col-span-4 sm:border-r-1 border-gray-300">
            {/* playback */}
            <div className="border-1 rounded-xl border-gray-300 h-[300px] sm:h-[500px] w-[95%] sm:w-[90%] p-8 relative overflow-hidden">
              {/* Blurred Background */}
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-md brightness-75 scale-110 z-1 transition-all duration-500"
                style={{
                  backgroundImage: vibe?.media?.[
                    currentIndex
                  ]?.type?.startsWith("video/")
                    ? `url(${vidBg})`
                    : currentMediaUrl
                    ? `url(${currentMediaUrl})`
                    : "none",
                }}
              />

              {/* Foreground Media */}
              <div className="relative z-10 h-full w-full flex items-center justify-center">
                {vibe?.media?.[currentIndex]?.file instanceof Blob ? (
                  vibe.media[currentIndex].type.startsWith("image/") ? (
                    <img
                      src={currentMediaUrl}
                      alt=""
                      className="max-h-full max-w-full object-contain transition-all duration-500 rounded-xl shadow-md"
                    />
                  ) : (
                    <video
                      src={currentMediaUrl}
                      autoPlay
                      controls
                      onEnded={() =>
                        setCurrentIndex(
                          (prevIndex) => (prevIndex + 1) % vibe.media.length
                        )
                      }
                      className="max-h-full max-w-full object-contain rounded-xl shadow-md"
                    />
                  )
                ) : null}
              </div>
            </div>

            {/* playback end */}

            {/* thumb nail */}
            <div className="flex flex-row items-center justify-center sm:w-[80%] gap-3 flex-wrap px-3 sm:px-0">
              {vibe?.media.map((item, index) => (
                <div
                  key={item.id}
                  className={`h-[30px] w-[30px] sm:h-[50px] sm:w-[50px] hover:translate-y-[-5px] hover:transition-transform hover:duration-500 border-2 border-gray-300 rounded overflow-hidden ${
                    currentIndex === index
                      ? "translate-y-[-3px] sm:translate-y-[-5px] transition-transform duration-500"
                      : ""
                  }`}
                  onClick={() => setCurrentIndex(index)}
                >
                  {item.file instanceof Blob &&
                  item.type.startsWith("image/") ? (
                    <img
                      src={URL.createObjectURL(item.file)}
                      onLoad={(e) => URL.revokeObjectURL(e.target.src)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : item.file instanceof Blob &&
                    item.type.startsWith("video/") ? (
                    <video
                      autoPlay
                      muted
                      loop
                      src={URL.createObjectURL(item.file)}
                      onLoad={(e) => URL.revokeObjectURL(e.target.src)}
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                </div>
              ))}
            </div>
            {/* thumbnail end */}
          </div>

          {/* journal  */}
          <div className="col-span-1 sm:col-span-2 flex justify-center h-fit px-4">
            {vibe && (
              <div className="sm:w-[95%] sm:px-6 sm:py-4 sm:border-1 border-gray-300 rounded-lg space-y-2">
                <h2 className="text-xl font-bold text-text">
                  {vibe.title}
                  <span className="block text-sm font-semibold text-gray-500">
                    · {vibe.date} · {vibe.location}
                  </span>
                </h2>

                {vibe.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {vibe.tags.map((t, index) => (
                      <span
                        key={t}
                        className={`px-2 py-[2px] text-xs ${
                          colors[index % colors.length]
                        } rounded-full border border-gray-300`}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {vibe.journal && (
                  <p className="text-sm leading-relaxed text-text whitespace-pre-wrap max-h-[200px] sm:max-h-fit sm:h-fit overflow-y-auto">
                    {vibe.journal}
                  </p>
                )}
              </div>
            )}
            {/* journal end */}
          </div>
        </div>

        <DeleteConfirmationModal
          onClose={() => setIsModalOpen(false)}
          isOpen={isModalOpen}
          onDelete={handleDelete}
        />
      </div>
      <audio
        ref={audioRef}
        src={vibe?.ambientSound}
        autoPlay
        loop
        className="hidden"
      ></audio>
      <Footer />
    </>
  );
};

export default Playback;
