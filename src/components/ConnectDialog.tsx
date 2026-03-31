import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight } from "lucide-react";

const MSG_MAX = 200;

const ICEBREAKERS = [
  "I'd love to collaborate on a project together.",
  "Your skills complement mine perfectly.",
  "I think we could build something great.",
  "Would love to grab a coffee at The Hub.",
];

interface ConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetName: string;
  onSend: (message: string) => void;
  loading?: boolean;
}

const ConnectDialog = ({ open, onOpenChange, targetName, onSend, loading }: ConnectDialogProps) => {
  const [message, setMessage] = useState("");
  const firstName = targetName.split(" ")[0];

  const handleSend = () => {
    onSend(message);
    setMessage("");
  };

  const applyIcebreaker = (prompt: string) => {
    const prefix = `Hey ${firstName}, `;
    setMessage(prefix + prompt);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-2 border-foreground shadow-brutal-lg bg-background p-0 gap-0 max-w-md">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="font-heading text-xl uppercase">Connect with {targetName}</DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-4 space-y-4">
          {/* Icebreaker chips */}
          <div>
            <p className="font-mono text-xs text-muted-foreground mb-2 uppercase tracking-wider">Quick starters</p>
            <div className="flex flex-wrap gap-2">
              {ICEBREAKERS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => applyIcebreaker(prompt)}
                  className="font-mono text-xs border-2 border-foreground px-2.5 py-1.5 bg-background hover:bg-accent hover:shadow-brutal-sm transition-all text-left leading-tight"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Message textarea */}
          <div>
            <p className="font-mono text-xs text-muted-foreground mb-2">
              Or write your own note <span className="text-muted-foreground/60">(optional)</span>
            </p>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, MSG_MAX))}
              placeholder={`Hey ${firstName}, I'd love to connect because...`}
              maxLength={MSG_MAX}
              className="border-2 border-foreground bg-background font-mono text-sm min-h-[90px] resize-none"
            />
            <p className={`font-mono text-xs text-right mt-1 ${message.length >= MSG_MAX - 20 ? "text-destructive font-bold" : "text-muted-foreground"}`}>
              {message.length}/{MSG_MAX}
            </p>
          </div>
        </div>

        <DialogFooter className="p-6 pt-2 gap-2">
          <Button variant="ghost" onClick={() => { onOpenChange(false); setMessage(""); }} className="font-mono text-xs uppercase">
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={loading}
            className="border-2 border-foreground shadow-brutal-sm font-mono text-xs uppercase tracking-wider gap-1"
          >
            {loading ? "Sending..." : <>Send Request <ArrowRight className="h-3.5 w-3.5" /></>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectDialog;
