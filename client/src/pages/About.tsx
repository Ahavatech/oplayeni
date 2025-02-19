import { Card, CardContent } from "@/components/ui/card";
import { Helmet } from "react-helmet";

export default function About() {
  return (
    <>
      <Helmet>
        <title>About - Prof. Olawanle Patrick Layeni</title>
        <meta name="description" content="Learn about Professor Layeni's academic background, research interests, and professional experience." />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="prose prose-slate max-w-none">
          <h2 className="text-3xl font-bold mb-6">About Me</h2>
          
          <Card className="mb-8">
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-4">Academic Background</h3>
              <p className="text-muted-foreground">
                With over two decades of experience in mathematical research and teaching,
                I specialize in solid mechanics and continuum mechanics. My work focuses on
                developing mathematical models to understand material behavior and structural
                mechanics.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-4">Research Interests</h3>
              <ul className="list-disc pl-6 text-muted-foreground">
                <li>Solid Mechanics</li>
                <li>Continuum Mechanics</li>
                <li>Mathematical Modeling</li>
                <li>Structural Analysis</li>
                <li>Material Science</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-4">Professional Experience</h3>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Currently serving as a Professor of Mathematics, focusing on advanced
                  research in solid mechanics and teaching graduate-level courses.
                </p>
                <p>
                  Active member of several mathematical societies and regular contributor
                  to peer-reviewed journals in the field of mechanics and mathematics.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
