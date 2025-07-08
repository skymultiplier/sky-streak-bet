
import { Navigation } from "@/components/Navigation";
import { MyAccount } from "@/components/MyAccount";
import { Footer } from "@/components/Footer";

const MyAccountPage = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <MyAccount />
      <Footer />
    </div>
  );
};

export default MyAccountPage;
