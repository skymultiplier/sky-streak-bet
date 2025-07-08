
import { Navigation } from "@/components/Navigation";
import { Leaderboard } from "@/components/Leaderboard";
import { Footer } from "@/components/Footer";

const LeaderboardPage = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Leaderboard />
      <Footer />
    </div>
  );
};

export default LeaderboardPage;
