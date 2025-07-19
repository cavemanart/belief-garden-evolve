import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CreateContentModal from "./CreateContentModal";

interface FloatingCreateButtonProps {
  onContentCreated?: () => void;
}

const FloatingCreateButton = ({ onContentCreated }: FloatingCreateButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-accent hover:bg-accent/90 text-accent-foreground z-50 transition-all duration-200 hover:scale-110"
        size="icon"
      >
        <Plus className="w-6 h-6" />
      </Button>
      
      <CreateContentModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onContentCreated={onContentCreated}
      />
    </>
  );
};

export default FloatingCreateButton;