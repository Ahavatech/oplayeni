import { Card, CardContent } from "@/components/ui/card";
import { Helmet } from "react-helmet";

export default function Research() {
  return (
    <>
      <Helmet>
        <title>Research - Prof. Olawanle Patrick Layeni</title>
        <meta name="description" content="Research areas and projects in solid mechanics and continuum mechanics by Professor Layeni." />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-6">Research</h2>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-4">Current Research Areas</h3>
              <div className="space-y-4 text-muted-foreground">
                <section>
                  <h4 className="font-medium mb-2">Solid Mechanics</h4>
                  <p>
                    Investigation of material behavior under various loading conditions,
                    focusing on deformation mechanics and stress analysis.
                  </p>
                </section>

                <section>
                  <h4 className="font-medium mb-2">Continuum Mechanics</h4>
                  <p>
                    Development of mathematical models for continuous media, including
                    both solid and fluid mechanics applications.
                  </p>
                </section>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-4">Research Projects</h3>
              <div className="space-y-4 text-muted-foreground">
                <section>
                  <h4 className="font-medium mb-2">Mathematical Modeling of Material Behavior</h4>
                  <p>
                    Creating advanced mathematical models to predict and analyze the
                    behavior of materials under various conditions.
                  </p>
                </section>

                <section>
                  <h4 className="font-medium mb-2">Structural Analysis Methods</h4>
                  <p>
                    Developing new methodologies for analyzing complex structural
                    systems using advanced mathematical techniques.
                  </p>
                </section>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
