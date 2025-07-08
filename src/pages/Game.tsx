
import { Navigation } from "@/components/Navigation";
import { GameInterface } from "@/components/GameInterface";
import { Footer } from "@/components/Footer";

const Game = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <GameInterface />
      <Footer />
    </div>
  );
};

export default Game;
