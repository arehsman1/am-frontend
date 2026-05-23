import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Phone, ShieldAlert, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

type Step = "method" | "code";
type Method = "email" | "phone";

export const DeleteAccountDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) => {
  const [step, setStep] = useState<Step>("method");
  const [method, setMethod] = useState<Method>("email");
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  const reset = () => {
    setStep("method");
    setMethod("email");
    setCode("");
  };

  const handleOpenChange = (o: boolean) => {
    if (!o) reset();
    onOpenChange(o);
  };

  const pickMethod = (m: Method) => {
    setMethod(m);
    setStep("code");
    // {API_SEND_VERIFICATION_CODE}
    toast.success(`Verification code sent to your ${m}`);
  };

  const confirmDelete = () => {
    if (code.trim().length < 4) {
      toast.error("Enter the verification code");
      return;
    }
    // {API_VERIFY_CODE}
    // {API_DELETE_ACCOUNT}
    toast.success("Account deleted");
    handleOpenChange(false);
    navigate("/");
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center font-display">Confirm Account Deletion</DialogTitle>
          <DialogDescription className="text-center">
            To continue, verify your identity using your email or phone number.
          </DialogDescription>
        </DialogHeader>

        {step === "method" ? (
          <div className="grid gap-3 py-2 animate-fade-in">
            <button
              onClick={() => pickMethod("email")}
              className="flex items-center gap-3 rounded-lg border border-border p-4 text-left transition-smooth hover:border-primary hover:bg-secondary/60"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                <Mail className="h-5 w-5 text-primary" />
              </span>
              <span>
                <p className="font-medium">Verify via Email</p>
                <p className="text-xs text-muted-foreground">We'll send a code to your email address.</p>
              </span>
            </button>
            <button
              onClick={() => pickMethod("phone")}
              className="flex items-center gap-3 rounded-lg border border-border p-4 text-left transition-smooth hover:border-primary hover:bg-secondary/60"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                <Phone className="h-5 w-5 text-primary" />
              </span>
              <span>
                <p className="font-medium">Verify via Phone</p>
                <p className="text-xs text-muted-foreground">We'll text a code to your phone number.</p>
              </span>
            </button>
          </div>
        ) : (
          <div className="space-y-3 py-2 animate-fade-in">
            <Label htmlFor="vcode">
              {method === "email"
                ? "Enter verification code sent to your email."
                : "Enter verification code sent to your phone."}
            </Label>
            <Input
              id="vcode"
              inputMode="numeric"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              autoFocus
            />
            <button
              onClick={() => setStep("method")}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-smooth"
            >
              <ArrowLeft className="h-3 w-3" /> Use a different method
            </button>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
          {step === "code" && (
            <Button variant="destructive" onClick={confirmDelete}>Confirm Deletion</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
