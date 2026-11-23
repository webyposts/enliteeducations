import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Smartphone } from "lucide-react";
import { PLAY_STORE_URL } from "@/lib/playStore";

const qrSrc = `${import.meta.env.BASE_URL}playstore-qr.png`;

const DownloadApp = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="py-20 bg-gradient-to-br from-primary-light via-background to-accent-light">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Download the app</h1>
              <p className="text-lg text-muted-foreground">
                Scan the QR code with your phone, or open the Play Store listing directly.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-10 items-center">
              <div className="rounded-2xl border-2 border-border bg-card p-6 shadow-md text-center">
                <img
                  src={qrSrc}
                  alt="QR code to download the Enlite app on Google Play"
                  className="w-64 h-64 mx-auto"
                  width={512}
                  height={512}
                />
                <p className="mt-4 text-sm text-muted-foreground">
                  Point your camera at this code to open Google Play.
                </p>
              </div>

              <div className="space-y-5">
                <div className="inline-flex p-3 bg-primary/10 rounded-full">
                  <Smartphone className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Get it on Google Play</h2>
                <p className="text-muted-foreground">
                  The Enlite app is published on the Play Store. Use the button below on a phone or
                  computer — it opens the same listing as the QR code.
                </p>
                <Button asChild size="lg">
                  <a href={PLAY_STORE_URL} target="_blank" rel="noreferrer">
                    Open Play Store
                  </a>
                </Button>
                <p className="text-xs text-muted-foreground break-all">{PLAY_STORE_URL}</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default DownloadApp;
