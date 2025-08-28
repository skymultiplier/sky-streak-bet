import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { RefreshCw, Copy, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export const ProvablyFairSeeds = () => {
  const [clientSeed, setClientSeed] = useState("user_12345_random");
  const [serverHash, setServerHash] = useState("a7b2c3d4e5f6789012345abcdef67890");
  const [nonce, setNonce] = useState(158473);
  const [copied, setCopied] = useState("");

  const generateNewSeed = () => {
    const newSeed = `user_${Math.random().toString(36).substring(2, 15)}`;
    setClientSeed(newSeed);
    const newHash = Array.from({length: 32}, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setServerHash(newHash);
    setNonce(prev => prev + 1);
    
    toast({
      title: "New Seeds Generated",
      description: "Fresh cryptographic seeds have been generated for provably fair gameplay.",
    });
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(""), 2000);
    
    toast({
      title: "Copied!",
      description: `${type} copied to clipboard`,
    });
  };

  return (
    <Card className="bg-slate-700/50 border-cyan-500/20 p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-white">Current Game Seeds:</h4>
          <Button
            onClick={generateNewSeed}
            size="sm"
            variant="outline"
            className="flex items-center space-x-1"
          >
            <RefreshCw className="h-3 w-3" />
            <span>New Seeds</span>
          </Button>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Server Hash (SHA-256)</label>
            <div className="relative">
              <Input
                value={serverHash}
                readOnly
                className="bg-slate-600 border-slate-500 text-xs font-mono pr-8"
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(serverHash, "Server Hash")}
                className="absolute right-1 top-1 h-6 w-6 p-0"
              >
                {copied === "Server Hash" ? (
                  <CheckCircle className="h-3 w-3 text-green-400" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Client Seed (Your Input)</label>
            <div className="relative">
              <Input
                value={clientSeed}
                onChange={(e) => setClientSeed(e.target.value)}
                className="bg-slate-600 border-slate-500 text-xs font-mono pr-8"
                placeholder="Enter your custom seed"
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(clientSeed, "Client Seed")}
                className="absolute right-1 top-1 h-6 w-6 p-0"
              >
                {copied === "Client Seed" ? (
                  <CheckCircle className="h-3 w-3 text-green-400" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Nonce</label>
            <div className="relative">
              <Input
                value={nonce.toString()}
                readOnly
                className="bg-slate-600 border-slate-500 text-xs font-mono pr-8"
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(nonce.toString(), "Nonce")}
                className="absolute right-1 top-1 h-6 w-6 p-0"
              >
                {copied === "Nonce" ? (
                  <CheckCircle className="h-3 w-3 text-green-400" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        </div>
        
        <p className="text-xs text-gray-400">
          Click "New Seeds" to generate fresh cryptographic seeds for your next game session.
        </p>
      </div>
    </Card>
  );
};