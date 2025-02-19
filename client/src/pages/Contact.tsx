import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, MapPin, Phone } from "lucide-react";
import { Helmet } from "react-helmet";

export default function Contact() {
  return (
    <>
      <Helmet>
        <title>Contact - Prof. Olawanle Patrick Layeni</title>
        <meta name="description" content="Contact information and office details for Professor Layeni." />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-6">Contact</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <Button variant="link" className="p-0 h-auto" asChild>
                    <a href="mailto:layeni@university.edu">layeni@university.edu</a>
                  </Button>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <span className="text-muted-foreground">+1 (234) 567-8900</span>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div className="text-muted-foreground">
                    <p>Department of Mathematics</p>
                    <p>University Name</p>
                    <p>City, State ZIP</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-4">Office Hours</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>Monday: 2:00 PM - 4:00 PM</p>
                <p>Wednesday: 10:00 AM - 12:00 PM</p>
                <p>Or by appointment</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
