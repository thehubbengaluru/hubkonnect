import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight } from "lucide-react";

interface ConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetName: string;
  onSend: (message: string) => void;
  loading?: boolean;
}

const ConnectDialog = ({ open, onOpenChange, targetName, onSend, loading }: ConnectDialogProps) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    onSend(message);
    setMessage("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-2 border-foreground shadow-brutal-lg bg-background p-0 gap-0 max-w-md">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="font-heading text-xl uppercase">Connect with {targetName}</DialogTitle>
        </DialogHeader>
        <div className="px-6 pb-4 space-y-3">
          <p className="font-mono text-xs text-muted-foreground">
            Add a personal note to stand out (optional)
          </p>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Hey ${targetName.split(" ")[0]}, I'd love to connect because...`}
            maxLength={200}
            className="border-2 border-foreground bg-background font-mono text-sm min-h-[100px] resize-none"
          />
          <p className="font-mono text-[10px] text-muted-foreground text-right">{message.length}/200</p>
        </div>
        <DialogFooter className="p-6 pt-2 gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="font-mono text-xs uppercase">
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={loading}
            className="border-2 border-foreground shadow-brutal-sm font-mono text-xs uppercase tracking-wider gap-1">
            {loading ? "Sending..." : <>Send Request <ArrowRight className="h-3.5 w-3.5" /></>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectDialog;
