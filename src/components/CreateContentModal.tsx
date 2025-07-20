import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PenTool, Zap, Video, Mic, Image as ImageIcon, FileText } from "lucide-react";
import CreateSparkModal from "./CreateSparkModal";
import CreateHotTakeModal from "./CreateHotTakeModal";

interface CreateContentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContentCreated?: () => void;
}

type SparkSubtype = "text" | "thread" | "audio" | "video" | "image" | "notes";
type HotTakeSubtype = "text" | "short_video" | "image";

const CreateContentModal = ({ open, onOpenChange, onContentCreated }: CreateContentModalProps) => {
  const [selectedType, setSelectedType] = useState<"spark" | "hot_take" | null>(null);
  const [selectedSubtype, setSelectedSubtype] = useState<SparkSubtype | HotTakeSubtype | null>(null);
  const [showSparkModal, setShowSparkModal] = useState(false);
  const [showHotTakeModal, setShowHotTakeModal] = useState(false);

  const handleClose = () => {
    setSelectedType(null);
    setSelectedSubtype(null);
    onOpenChange(false);
  };

  const handleTypeSelect = (type: "spark" | "hot_take", subtype: SparkSubtype | HotTakeSubtype) => {
    setSelectedType(type);
    setSelectedSubtype(subtype);
    onOpenChange(false);
    
    if (type === "spark") {
      setShowSparkModal(true);
    } else {
      setShowHotTakeModal(true);
    }
  };

  const handleModalClose = (type: "spark" | "hot_take") => {
    if (type === "spark") {
      setShowSparkModal(false);
    } else {
      setShowHotTakeModal(false);
    }
    setSelectedType(null);
    setSelectedSubtype(null);
  };

  const sparkOptions = [
    { type: "text" as SparkSubtype, icon: PenTool, label: "Text Post", desc: "Longform, layered ideas" },
    { type: "thread" as SparkSubtype, icon: FileText, label: "Thread", desc: "Expand across multiple points" },
    { type: "audio" as SparkSubtype, icon: Mic, label: "Audio/Podcast", desc: "Voice-led content" },
    { type: "video" as SparkSubtype, icon: Video, label: "Video (Long)", desc: "Visual storytelling, deep dives" },
    { type: "image" as SparkSubtype, icon: ImageIcon, label: "Image + Caption", desc: "Stories with photos" },
    { type: "notes" as SparkSubtype, icon: FileText, label: "Notes/Resources", desc: "Lists, summaries, references" },
  ];

  const hotTakeOptions = [
    { type: "text" as HotTakeSubtype, icon: Zap, label: "Text Post", desc: "Short, punchy, bold opinions" },
    { type: "short_video" as HotTakeSubtype, icon: Video, label: "Short Video", desc: "High-energy, fast reactions" },
    { type: "image" as HotTakeSubtype, icon: ImageIcon, label: "Image + Caption", desc: "Memes, screenshots, viral content" },
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>What would you like to create?</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Spark Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <PenTool className="w-5 h-5 text-accent" />
                <h3 className="text-lg font-semibold">✨ Spark</h3>
                <span className="text-sm text-muted-foreground">Thoughtful, layered content</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sparkOptions.map((option) => (
                  <Card
                    key={option.type}
                    className="cursor-pointer hover:bg-accent/5 hover:border-accent/30 transition-colors"
                    onClick={() => handleTypeSelect("spark", option.type)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <option.icon className="w-5 h-5 text-accent mt-1" />
                        <div>
                          <p className="font-medium">{option.label}</p>
                          <p className="text-sm text-muted-foreground">{option.desc}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Hot Take Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-accent" />
                <h3 className="text-lg font-semibold">🔥 Hot Take</h3>
                <span className="text-sm text-muted-foreground">Short, bold, provocative</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {hotTakeOptions.map((option) => (
                  <Card
                    key={option.type}
                    className="cursor-pointer hover:bg-accent/5 hover:border-accent/30 transition-colors"
                    onClick={() => handleTypeSelect("hot_take", option.type)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <option.icon className="w-5 h-5 text-accent mt-1" />
                        <div>
                          <p className="font-medium">{option.label}</p>
                          <p className="text-sm text-muted-foreground">{option.desc}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Separate modals for each content type */}
      <CreateSparkModal
        open={showSparkModal}
        onOpenChange={() => handleModalClose("spark")}
        onContentCreated={onContentCreated}
        subtype={selectedSubtype as string || "text"}
      />

      <CreateHotTakeModal
        open={showHotTakeModal}
        onOpenChange={() => handleModalClose("hot_take")}
        onContentCreated={onContentCreated}
        subtype={selectedSubtype as string || "text"}
      />
    </>
  );
};

export default CreateContentModal;